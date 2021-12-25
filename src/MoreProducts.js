import React from 'react'
import '@google/model-viewer';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from "./components/NavbarComp.js";
import Model1 from "./components/Model1.js";
import MediaQuery from 'react-responsive'
import { Link } from "react-router-dom"


export default function Products() {
    return (
        <>
        <NavbarComp/>
        <MediaQuery minWidth={768}>
        <div className="models">
            <div className="model-container1">
            <Model1/>
            <Model1/>
            <Model1/>
            <Model1/>
            </div>
            <div className="model-container2">
            <Model1/>
            <Model1/>
            <Model1/>
            <Model1/>
            </div>
        </div>
        </MediaQuery>
        <MediaQuery maxWidth={768}>
        <div className="models">
            <div className="model-container1">
            <Model1/>
            <Model1/>
            <Model1/>
            </div>
            <div className="model-container2">
            <Model1/>
            <Model1/>
            <Model1/>
            </div>
        </div>
<Link to="/products">Back</Link>
        </MediaQuery>
        </>
    )
}
