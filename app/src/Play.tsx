import axios from 'axios';
import { useState } from 'react';
import 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData } from 'react-router-dom'
import { Buffer } from "buffer";


const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

export async function loader({ params }) {
    var id = params.id
    return { id };
}

export default function Play() {
    const { id } = useLoaderData()
    const [imgSrc1, setImgSrc1] = useState('')
    const [imgSrc2, setImgSrc2] = useState('')
    const [displayImg1, setDisplayImg1] = useState('')
    const [displayImg2, setDisplayImg2] = useState('')

    async function handleImg1Load(e: React.SyntheticEvent<HTMLImageElement>) {
        var link = document.getElementById("Image1")?.src
        await toDataURL(link)
            .then(dataUrl => {
                setImgSrc1(dataUrl)
                setDisplayImg1(dataUrl)
            })
    }

    async function handleImg2Load(e: React.SyntheticEvent<HTMLImageElement>) {
        var link1 = document.getElementById("Image2")?.src
        await toDataURL(link1)
            .then(dataUrl => {
                setImgSrc2(dataUrl)
                setDisplayImg2(dataUrl)
            })
    }

    async function handleClick(e: any) {
        // var imgSrc1
        // var imgSrc2
        // var link1 = document.getElementById("Image1")?.src
        // await toDataURL(link1)
        //     .then(dataUrl => {
        //         imgSrc1 = dataUrl
        //     })

        // var link2 = document.getElementById("Image2")?.src
        // await toDataURL(link2)
        //     .then(dataUrl => {
        //         imgSrc2 = dataUrl
        //     })

        // e = Mouse click event.
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        x = Math.round(x)
        y = Math.round(y)

        console.log("x? : " + x + " ; y? : " + y + ".");
        await axios.post(
            'http://127.0.0.1:8000/find-differences',
            {
                "file1": imgSrc1,
                "file2": imgSrc2,
                "displayFile1": displayImg1,
                "x": x,
                "y": y,
            },
            {
                responseType: "arraybuffer"
            }
        )
            .then(function (response) {
                const base64 = 'data:image/jpeg;base64,' + Buffer.from(response.data, 'binary').toString('base64')
                setDisplayImg1(base64)
            })
            .catch(function (error) {
                console.log(error);
            });

        await axios.post(
            'http://127.0.0.1:8000/find-differences',
            {
                "file1": imgSrc1,
                "file2": imgSrc2,
                "displayFile1": displayImg2,
                "x": x,
                "y": y,
            },
            {
                responseType: "arraybuffer"
            }
        )
            .then(function (response) {
                const base64 = 'data:image/jpeg;base64,' + Buffer.from(response.data, 'binary').toString('base64')
                setDisplayImg2(base64)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return (
        <div className="App">
            <img
                alt="Image1"
                id="Image1"
                src={require(`./data/${id}/1.jpg`)}
                onLoad={handleImg1Load}
                style={{display:"none"}}
            />
            <img
                alt="Image2"
                id="Image2"
                src={require(`./data/${id}/2.jpg`)}
                onLoad={handleImg2Load}
                style={{display:"none"}}
            />
            <br />
            <img
                alt="DisplayImage1"
                onClick={handleClick}
                src={displayImg1}
            />
            {'space'}
            <img
                alt="DisplayImage2"
                onClick={handleClick}
                src={displayImg2}
            />
        </div>
    )
}
