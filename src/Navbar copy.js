import React, { Component } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'

export default class Navbar extends Component {
    render() {
        return (
            <>
    <Navbar bg="light" variant="light">
    <Container>
    <Navbar.Brand href="#home">Navbar</Navbar.Brand>
    <Nav className="me-auto">
      <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#features">Features</Nav.Link>
      <Nav.Link href="#pricing">Pricing</Nav.Link>
    </Nav>
    </Container>
  </Navbar>   
            </>
        )
    }
}





