import React from 'react'
import '@google/model-viewer';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./components/NavbarComp.js";
import Model from "./components/Model1.js";
import MediaQuery from 'react-responsive'
import { Link } from "react-router-dom"
import { productData } from "./data/productData.js";


export default function Products() {
    return (
        <>
        <NavbarComp/>
        <MediaQuery minWidth={768}>
        <div className="models">
            <div className="model-container1">
            <Model item={productData[0]}/>
            <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            <Model item={productData[0]}/>
            </div>
            <div className="model-container2">
            <Model item={productData[0]}/>
            <Model item={productData[1]}/>
            <Model item={productData[0]}/>
            <Model item={productData[0]}/>
            </div>
        </div>
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
