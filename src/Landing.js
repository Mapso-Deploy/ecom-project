import React from 'react'
import Mapso from "./MapsoEnergy4.gif"
import logo from "./mapso.gif"
import { Link } from "react-router-dom"
import './styles.css';
import ReactFreezeframe from "react-freezeframe";


export default function landing() {
    return (
        <div className="Logo" style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
        {/* <a href="/home"> <img src={logo} style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh', onLoad: 'fadeIn'}} /> </a> */}
            <div className="animated-gif-box"> 
            <Link to="/Products">
                <ReactFreezeframe src={Mapso} className="animated-gif"/>
            </Link>
            </div>
            <div className="mobile-logo-box">
            <a href="/Products"> <img src={logo} alt="mobile logo" /> </a>
            </div>
        </div> 
    )
}

