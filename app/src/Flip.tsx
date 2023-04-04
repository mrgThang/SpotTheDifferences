import React, { useState, useRef, useContext } from 'react'

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'
import axios from 'axios';
import { Buffer } from "buffer";
import { FileContext } from './FileContext'


export default function ChangeColor() {
    const { imgSrc, cropImgSrc, x, y, width, height } = useContext(FileContext)
    const [newImgSrc, setNewImgSrc] = useState('')
    const [isVertical, setIsVertial] = useState(0)

    function handleImageClick() {
        axios.post('http://127.0.0.1:8000/flip',
            {
                "file": imgSrc,
                "x": x,
                "y": y,
                "width": width,
                "height": height,
                "isVertical": isVertical
            },
            {
                responseType: "arraybuffer"
            })
            .then(function (response) {
                const base64 = Buffer.from(response.data, 'binary').toString('base64')
                setNewImgSrc(base64)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return (
        <div className="App">
            <div className='Down-Space'>
                <label htmlFor="isVertical-input">IsVertical: </label>
                <input
                    id="isVertical-input"
                    type="number"
                    value={isVertical}
                    onChange={(e) => setIsVertial(Number(e.target.value))}
                />
            </div>
            <img
                alt="Crop Img"
                src={cropImgSrc}
                style={{
                    width: width,
                    height: height
                }}
            />
            <br />
            <img
                alt="Input Img"
                src={imgSrc}
                onClick={handleImageClick}
            />
            {'space'}
            <img
                alt="New Img"
                src={`data:;base64,${newImgSrc}`}
            />
        </div>
    )
}
