import React, { Component } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import logo from "../mapso.gif"
import "../styles.css"

export default class NavbarComp extends Component {
    render() {
        return (
            <div>
                <Navbar expand="lg" className="Top-Nav">
  <Container>
    <Navbar.Brand href="#home"><NavLink to="/Products" activeStyle={{color: "lime"}}><a href="www.mapso.co/products" className="Logo"><img src={logo} alt="logo" style={{display: 'flex', alignItems:'left', height: '10vh', onLoad: 'fadeIn'}} /></a></NavLink></Navbar.Brand>
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
        <Nav.Link className="Nav px-5" href="#Products"><NavLink to="/products" className="Nav-Link" activeStyle={{color: "lime"}}>Products</NavLink></Nav.Link>
        {/* <Nav.Link className="Nav px-5" href="#Explore"><NavLink to="/explore" className="Nav-Link" activeStyle={{color: "lime"}}>Explore</NavLink></Nav.Link> */}
        <Nav.Link className="Nav px-5" href="#Blog"><NavLink to="/blog" className="Nav-Link" activeStyle={{color: "lime"}}>Blog</NavLink></Nav.Link>
        <Nav.Link className="Nav px-5" href="#Contact"><NavLink to="/contact" className="Nav-Link" activeStyle={{color: "lime"}}>Contact</NavLink></Nav.Link>
        {/* <button class="my-account px-5 snipcart-customer-signin">Account</button> */}
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
