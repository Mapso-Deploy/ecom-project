import React from 'react'
import NavbarCompLight from "./components/NavBarCompLight.js";
import Iframe from "./components/Iframe.js";

export default function Blog() {
    return (
        <div>
            <NavbarCompLight/>
            <div className='blog'>
            <Iframe />
            </div>
        </div>
    )
}