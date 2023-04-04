import { FileContext } from './FileContext';
import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChangeColor from './ChangeColor';
import Main from './Main';
import React from 'react';
import Flip from './Flip';
import Play, {loader as gameLoader } from './Play';

function App() {
  const [imgSrc, setImgSrc] = useState('')
  const [cropImgSrc, setCropImgSrc] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "/change-color",
      element: <ChangeColor />,
    },
    {
      path: "/flip",
      element: <Flip />,
    },
    {
      path: "/play/:id",
      element: <Play />,
      loader: gameLoader,
    }
  ]);

  return (
    <div>
      <FileContext.Provider value={{
        imgSrc, setImgSrc, cropImgSrc,
        setCropImgSrc, x, setX, y, setY, height, setHeight, width, setWidth
      }}>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </FileContext.Provider>
    </div>
  );
}

export default App;