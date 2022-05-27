import { Component } from "react";
import { NavDropdown } from "react-bootstrap";

class FileDropdown extends Component {

  constructor(props) {
    super(props);
  }

  newProject = () => {
    this.props.newProject();
  }

  loadProject = () => {
    let project_input = document.createElement('input');
    project_input.type = 'file';
    project_input.accept = 'text/json';
    project_input.hidden = true;
    project_input.onchange = this.processProjectFile;
    project_input.click();
  }

  saveProject = () => {
    this.props.saveProject();
  }

  openImage = () => {
    let image_input = document.createElement('input');
    image_input.type = 'file';
    image_input.accept = 'image/png, image/jpg';
    image_input.hidden = true;
    image_input.onchange = this.processFile;
    image_input.click();
  }

  openVideo = () => {
    let video_input = document.createElement('input');
    video_input.type = 'file';
    video_input.accept = 'video/*';
    video_input.hidden = true;
    video_input.onchange = this.processFile;
    video_input.click();
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
        this.props.updateVidURL(dataURL);
      }
      else {
        this.props.updateImgURL(dataURL);
      }

      file_input.value = null;
    };
    reader.readAsDataURL(file);
  }

  processProjectFile = (e) => {
    let reader = new FileReader();

    let file_input = e.nativeEvent.target;
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
        <NavDropdown.Item onClick={this.loadProject}>Load Project...</NavDropdown.Item>
        <NavDropdown.Item onClick={this.saveProject}>Save Project</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={this.openImage}>Open Image...</NavDropdown.Item>
        <NavDropdown.Item onClick={this.openVideo}>Open Video...</NavDropdown.Item>
        <NavDropdown.Item onClick={this.openWebcam}>Open Webcam...</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={this.exportPNG}>Export as PNG</NavDropdown.Item>
      </NavDropdown>
    );
  }
}

export default FileDropdown;