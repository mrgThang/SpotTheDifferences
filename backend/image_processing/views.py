from django.shortcuts import render
from django.http import HttpResponse, FileResponse
from rest_framework.decorators import api_view
import cv2
import numpy as np
from PIL import Image
import base64
import torch
import io

@api_view(['POST'])
def change_colors(request):
    try:
        format, image_type_b64 = request.data['file'].split(';base64,')
        x = request.data['x']
        y = request.data['y']
        width = request.data['width']
        height = request.data['height']
        substractHsv = [int(i) for i in request.data['substractHsv']]
        lowerHsv = [int(i) for i in request.data['lowerHsv']]
        higherHsv = [int(i) for i in request.data['higherHsv']]
        lowerToHsv = [int(i) for i in request.data['lowerToHsv']]
        higherToHsv = [int(i) for i in request.data['higherToHsv']]
    except KeyError:
        raise ParseError('Request params invalid')
    
    try:
        base64_decoded = base64.b64decode(image_type_b64)
        file_image = Image.open(io.BytesIO(base64_decoded))
        image_type_np_array = np.array(file_image)
        img = image_type_np_array.astype(np.uint8)
        if len(img.shape) > 2 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        else:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        crop_img = img[y:y+height, x:x+width]
        print(crop_img.shape)
        print(img.shape)
    except KeyError:
        raise ParseError('Can not convert image data to work with cv2')

    crop_img = change_colors_of_crop_img(crop_img, substractHsv, lowerHsv, higherHsv, lowerToHsv, higherToHsv)
    img[y:y+height, x:x+width] = crop_img

    cv2.imwrite('image_processing/images/modified_image.jpg', img)
    response = FileResponse(open('image_processing/images/modified_image.jpg', 'rb'))

    return response

def change_colors_of_crop_img(crop_img, substractHsv, lowerHsv, higherHsv, lowerToHsv, higherToHsv):
    # Convert the image to the HSV color space
    hsv = cv2.cvtColor(crop_img, cv2.COLOR_BGR2HSV)

    # Define the lower and upper bounds of the color range you want to select
    lower = np.array(lowerHsv)
    upper = np.array(higherHsv)

    mask = cv2.inRange(hsv, lower, upper)
    inv_mask = cv2.bitwise_not(mask)

    h, s, v = cv2.split(hsv)
    h = np.clip(h + substractHsv[0], lowerToHsv[0], higherToHsv[0]).astype(s.dtype)
    s = np.clip(s + substractHsv[1], lowerToHsv[1], higherToHsv[1]).astype(v.dtype)
    v = np.clip(v + substractHsv[2], lowerToHsv[2], higherToHsv[2]).astype(h.dtype)
    hsv = cv2.merge([h, s, v])

    # Convert hsv to bgr
    bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    result = cv2.bitwise_or(cv2.bitwise_and(crop_img, crop_img, mask=inv_mask), cv2.bitwise_and(bgr, bgr, mask=mask))
    return result    

@api_view(['POST'])
def flip(request):
    try:
        format, image_type_b64 = request.data['file'].split(';base64,')
        x = request.data['x']
        y = request.data['y']
        width = request.data['width']
        height = request.data['height']
        isVertical = request.data['isVertical']
    except KeyError:
        raise ParseError('Request params invalid')
    
    try:
        base64_decoded = base64.b64decode(image_type_b64)
        file_image = Image.open(io.BytesIO(base64_decoded))
        image_type_np_array = np.array(file_image)
        img = image_type_np_array.astype(np.uint8)
        if len(img.shape) > 2 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        else:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        crop_img = img[y:y+height, x:x+width]
        print(crop_img.shape)
        print(img.shape)
    except KeyError:
        raise ParseError('Can not convert image data to work with cv2')

    if isVertical == 1:
        crop_img = cv2.flip(crop_img, 1)
    else:
        crop_img = cv2.flip(crop_img, 0)
    img[y:y+height, x:x+width] = crop_img

    cv2.imwrite('image_processing/images/modified_image.jpg', img)
    response = FileResponse(open('image_processing/images/modified_image.jpg', 'rb'))

    return response

def get_image_suitable_with_cv2(image_type_b64):
    base64_decoded = base64.b64decode(image_type_b64)
    file_image = Image.open(io.BytesIO(base64_decoded))
    image_type_np_array = np.array(file_image)
    img = image_type_np_array.astype(np.uint8)
    if len(img.shape) > 2 and img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    else:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    return img

@api_view(['POST'])
def find_differences(request):
    try:
        format, image_type_b64_1 = request.data['file1'].split(';base64,')
        format, image_type_b64_2 = request.data['file2'].split(';base64,')
        format, image_type_b64_display_1 = request.data['displayFile1'].split(';base64,')
        x = request.data['x']
        y = request.data['y']
    except KeyError:
        raise ParseError('Request params invalid')
    
    try:
        img1 = get_image_suitable_with_cv2(image_type_b64_1)
        img2 = get_image_suitable_with_cv2(image_type_b64_2)
        img_display1 = get_image_suitable_with_cv2(image_type_b64_display_1)
    except KeyError:
        raise ParseError('Can not convert image data to work with cv2')

    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    diff = cv2.absdiff(gray1, gray2)

    threshold = 8
    __, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (50,50))

    fill_gap = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    contours, __ = cv2.findContours(fill_gap, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_L1)

    for contour in contours:
        x_contour, y_contour, w_contour, h_contour = cv2.boundingRect(contour)
        if x_contour <= x and x <= x_contour + w_contour and y_contour <= y and y <= y_contour + h_contour:
            cv2.rectangle(img_display1, (x_contour, y_contour), (x_contour + w_contour, y_contour + h_contour), (0, 0, 255), 2)

    cv2.imwrite('image_processing/images/modified_image.jpg', img_display1)
    response = FileResponse(open('image_processing/images/modified_image.jpg', 'rb'))

    return response
