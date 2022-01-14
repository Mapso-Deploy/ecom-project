import React, { useState, useEffect } from 'react'
import '@google/model-viewer';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./components/NavbarComp.js";
import Model from "./components/Model1.js";
import ModelsMapped from "./components/ModelsMapped.js";
import MediaQuery from 'react-responsive'
import { Link } from "react-router-dom"
import { productData } from "./data/productData.js";


export default function Products() {
const showCount = 2

const [startIndex, setStartIndex] = useState(0);
const [disablePrev, setDisablePrev] = useState(true);
const [disableNext, setDisableNext] = useState(false);

useEffect(() => {
    console.log("useEffect", productData.length, startIndex, productData.length < startIndex + showCount);
    if(productData.length < startIndex + showCount) {
        setDisableNext(true); 
    } else {
        setDisableNext(false); 
    }
    if (startIndex <= 0) {
        setStartIndex(0);
        setDisablePrev(true);
    } else {
        setDisablePrev(false);
    }
}, [startIndex]);  

function handleNext() {
    setStartIndex(startIndex + showCount);
}
function handlePrevious() {
    setStartIndex(startIndex - showCount);
}

    return (
        <>
        <NavbarComp/>
        <MediaQuery minWidth={768}>
        <ModelsMapped products={productData.slice(startIndex, startIndex + showCount)}/>
        <div className="row">
            <div className="col-md-12 text-center p-4">
        <button className="btn" disabled={disablePrev} onClick={() => handlePrevious()}>Previous</button>
        <button className="btn" disabled={disableNext} onClick={() => handleNext()}>Next</button>
        </div>
        </div>
        {/* <div>
            <div>
            <ModelsMapped item={productData}/> */}
            {/* <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            <Model item={productData[0]}/> */}
            {/* </div>
            <div className="model-container2"> */}
            {/* <ModelsMapped item={productData}/> */}
            {/* <Model item={productData[0]}/>
            <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            <Model item={productData[0]}/> */}
            {/* </div>
        </div> */}
        </MediaQuery>
        <MediaQuery maxWidth={768}>
        <div className="models">
            <div className="model-container1">
            <Model item={productData[0]}/>
            <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            </div>
            <div className="model-container2">
            <Model item={productData[0]}/>
            <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            </div>
        </div>
        <Link to="/more-products">More</Link>
        </MediaQuery>
        </>
    )
}
