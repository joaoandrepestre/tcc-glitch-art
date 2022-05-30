import { TextField } from '@mui/material';
import React, { Component } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import EffectDropdown from './effect-dropdown';
import FileDropdown from './file-dropdown';

class MenuBar extends Component {

  constructor(props) {
    super(props);
  }

  changeProjectName = (e) => {
    this.props.changeProjectName(e.target.value);
  }

  render() {
    let textWidth = this.props.projectName.length * 8.5;
    textWidth = textWidth > 100 ? textWidth : 100;
    return (
      < Navbar bg="light" expand="lg" >
        <Container>
          <Navbar.Brand>
            <img
              src={require("./trakinas_glitch.png")}
              width='30'
              height='30'
              className='d-inline-block align-top'
              alt=''
            />{' '}
            {this.props.projectName ? 'AlPro' : 'Alimento Processado'}
          </Navbar.Brand>
          <TextField
            label="Project Name"
            size='small'
            style={{ width: textWidth, maxWidth: 200 }}
            variant='standard'
            value={this.props.projectName}
            onChange={this.changeProjectName}
            onKeyUp={(e) => { if (e.key === 'Enter') e.target.blur() }}
          /> {this.props.projectName ? '.alpro' : ' '}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <FileDropdown
                newProject={this.props.newProject}
                updateProjectJSON={this.props.updateProjectJSON}
                saveProject={this.props.saveProject}

                addSource={this.props.addSource}
                requestWebcam={this.props.requestWebcam}

                exportPNG={this.props.exportPNG}
              />
              <EffectDropdown
                registeredEffects={this.props.registeredEffects}
                addEffect={this.props.addEffect}
              />
              <Nav.Link onClick={this.props.streamCanvas}>Stream</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar >
    );
  }
}

export default MenuBar;