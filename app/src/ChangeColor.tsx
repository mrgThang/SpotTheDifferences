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
  const { imgSrc, cropImgSrc, x, y, width, height, setX, setY, setWidth, setHeight } = useContext(FileContext)
  const [newImgSrc, setNewImgSrc] = useState('')
  const [lowerHsv, setLowerHsv] = useState(['0', '50', '70'])
  const [higherHsv, setHigherHsv] = useState(['100', '255', '255'])
  const [substractHsv, setSubstractHsv] = useState(['0', '0', '0'])
  const [lowerToHsv, setLowerToHsv] = useState(['0', '50', '70'])
  const [higherToHsv, setHigherToHsv] = useState(['100', '255', '255'])

  function handleImageClick() {
    axios.post('http://127.0.0.1:8000/change-colors',
      {
        "file": imgSrc,
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "substractHsv": substractHsv,
        "lowerHsv": lowerHsv,
        "higherHsv": higherHsv,
        "lowerToHsv": lowerToHsv,
        "higherToHsv": higherToHsv
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
      <div className="Crop-Controls" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 20 }}>
        <div className='Column1'>
          <h3>Choosing Point</h3>
          <div className='Down-Space'>
            <label htmlFor="x-input">X: </label>
            <input
              id="x-input"
              type="number"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="y-input">Y: </label>
            <input
              id="y-input"
              type="number"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="width-input">Width: </label>
            <input
              id="width-input"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="height-input">Height: </label>
            <input
              id="height-input"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
        </div>
        <div className='Column2'>
          <h3>HSV</h3>
          <div className='Down-Space'>
            <label htmlFor="lower-hsv">Lower HSV: </label>
            <input
              id="lower-hsv"
              type="string"
              value={lowerHsv}
              onChange={(e) => setLowerHsv(e.target.value.split(','))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="higher-hsv">Higher HSV: </label>
            <input
              id="higher-hsv"
              type="string"
              value={higherHsv}
              onChange={(e) => setHigherHsv(e.target.value.split(','))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="substract-hsv">Substract HSV: </label>
            <input
              id="substract-hsv"
              type="string"
              value={substractHsv.toString()}
              onChange={(e) => setSubstractHsv(e.target.value.split(','))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="lower-to-hsv">Lower To HSV: </label>
            <input
              id="lower-to-hsv"
              type="string"
              value={lowerToHsv}
              onChange={(e) => setLowerToHsv(e.target.value.split(','))}
            />
          </div>
          <div className='Down-Space'>
            <label htmlFor="higher-to-hsv">Higher To HSV: </label>
            <input
              id="higher-to-hsv"
              type="string"
              value={higherToHsv}
              onChange={(e) => setHigherToHsv(e.target.value.split(','))}
            />
          </div>
        </div>
        <div className='Column3'>
          <h3>HSV Example</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 0.24fr)", gridGap: 5 }}>
            <div>
              <h4>Color</h4>
              black<br />
              white<br />
              red1<br />
              red2<br />
              green<br />
              blue<br />
              yellow<br />
              purple<br />
              orange<br />
              gray<br />
            </div>
            <div>
              <h4>Min</h4>
              [0, 0, 0]<br />
              [0, 0, 231]<br />
              [159, 50, 70]<br />
              [0, 50, 70]<br />
              [36, 50, 70]<br />
              [90, 50, 70]<br />
              [25, 50, 70]<br />
              [129, 50, 70]<br />
              [10, 50, 70]<br />
              [0, 0, 40]<br />
            </div>
            <div>
              <h4>Max</h4>
              [180, 255, 30]<br />
              [180, 18, 255]<br />
              [180, 255, 255]<br />
              [9, 255, 255]<br />
              [89, 255, 255]<br />
              [128, 255, 255]<br />
              [35, 255, 255]<br />
              [158, 255, 255]<br />
              [24, 255, 255]<br />
              [180, 18, 230]<br />
            </div>
          </div>
        </div>
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
