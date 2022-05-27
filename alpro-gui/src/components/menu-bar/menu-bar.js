import React, { Component } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import EffectDropdown from './effect-dropdown';
import FileDropdown from './file-dropdown';

class MenuBar extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      < Navbar bg="light" expand="lg" >
        <Container>
          <Navbar.Brand href="#home">Alimento Processado</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <FileDropdown
                newProject={this.props.newProject}
                updateProjectJSON={this.props.updateProjectJSON}
                saveProject={this.props.saveProject}

                updateImgURL={this.props.updateImgURL}
                updateVidURL={this.props.updateVidURL}
                requestWebcam={this.props.requestWebcam}

                exportPNG={this.props.exportPNG}
              />
              <EffectDropdown
                registeredEffects={this.props.registeredEffects}
                addEffect={this.props.addEffect}
              />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar >
    );
  }
}

export default MenuBar;