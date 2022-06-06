import { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import { loadProject, openImage, openVideo } from "../../utils/file-utils";

class FileDropdown extends Component {

  newProject = () => {
    this.props.newProject();
  }

  saveProject = () => {
    this.props.saveProject();
  }

  openWebcam = () => {
    this.props.requestWebcam();
  }

  exportPNG = () => {
    this.props.exportPNG();
  }

  processFile = (e) => {
    let reader = new FileReader();

    let file_input = e.target;
    let file = file_input.files[0];
    reader.onload = (e) => {
      let dataURL = e.target.result;

      if (file.type.startsWith('video')) {
        this.props.addSource({ type: 'video', data: dataURL, name: file.name });
      }
      else {
        this.props.addSource({ type: 'img', data: dataURL, name: file.name });
      }

      file_input.value = null;
    };
    reader.readAsDataURL(file);
  }

  processProjectFile = (e) => {
    let reader = new FileReader();

    let file_input = e.target;
    let file = file_input.files[0];
    reader.onload = (e) => {
      let str = e.target.result;
      let json = JSON.parse(str);
      this.props.updateProjectJSON(json);
      file_input.value = null;
    };
    reader.readAsText(file);
  }

  render() {
    return (
      <NavDropdown title="File" id="basic-nav-dropdown">
        <NavDropdown.Item onClick={this.newProject}>New Project</NavDropdown.Item>
        <NavDropdown.Item onClick={loadProject(this.props.updateProjectJSON)}>Load Project...</NavDropdown.Item>
        <NavDropdown.Item onClick={this.saveProject}>Save Project</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={openImage(this.props.addSource)}>Open Image...</NavDropdown.Item>
        <NavDropdown.Item onClick={openVideo(this.props.addSource)}>Open Video...</NavDropdown.Item>
        <NavDropdown.Item onClick={this.openWebcam}>Open Webcam...</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={this.exportPNG}>Export as PNG</NavDropdown.Item>
      </NavDropdown>
    );
  }
}

export default FileDropdown;