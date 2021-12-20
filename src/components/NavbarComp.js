import React, { Component } from 'react'
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import logo from "/Users/cozykev/Desktop/NucampFolder/Portfolio/React/Ecommerce Project/ecom-project/src/logo.png"
import "../styles.css"

export default class NavbarComp extends Component {
    render() {
        return (
            <div>
                <Navbar expand="lg" className="Top-Nav">
  <Container>
    <Navbar.Brand href="#home"><Link to="/Products"><a href="" className="Logo"><img src={logo} style={{display: 'flex', alignItems:'left', height: '6vh', onLoad: 'fadeIn'}} /></a></Link></Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto px-5">
      {/* <NavDropdown title="Products" id="basic-nav-dropdown" className="Nav px-4">
          <NavDropdown.Item href="#action/3.1">All</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.2">Tops</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.3">Outterwear</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action/3.4">Archive</NavDropdown.Item>
        </NavDropdown> */}
        <Nav.Link className="Nav px-5" href="#Explore"><Link to="/products" className="Nav-Link">Products</Link></Nav.Link>
        <Nav.Link className="Nav px-5" href="#Explore"><Link to="/explore" className="Nav-Link">Explore</Link></Nav.Link>
        <Nav.Link className="Nav px-5" href="#Contact"><Link to="/contact" className="Nav-Link">Contact</Link></Nav.Link>
      </Nav>
      <div class="cart-button">
        <button class="snipcart-checkout"> Cart <span class="snipcart-items-count"></span></button>
        </div>
    </Navbar.Collapse>
  </Container>
</Navbar>
            </div>
        )
    }
}
