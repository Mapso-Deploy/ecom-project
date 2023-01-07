import React from 'react'
import MapsoEnergy3 from "./MapsoEnergy3.gif"
import { Link } from "react-router-dom"
import './styles.css';
import ReactFreezeframe from "react-freezeframe";


export default function landing() {
    return (
        <div className="Logo" style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
        {/* <a href="/home"> <img src={logo} style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh', onLoad: 'fadeIn'}} /> </a> */}
            <Link to="/Products">
                <ReactFreezeframe src={MapsoEnergy3} className="animated-gif"/>
            </Link>
        </div> 
    )
}

