import React, { Component } from 'react';
import './App.css';
import Core from 'alpro-core';
import MenuBar from './components/menu-bar/menu-bar';
import EffectEditorZone from './components/effect-editors/effect-editor-zone';
import { Button, Modal } from 'react-bootstrap';
import { Grid, TextField } from '@mui/material';
import SourcesZone from './components/sources-zone/sources-zone';
import { waitForCondition } from './utils';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: 512,
      height: 512,
      webcamStream: null,
      registeredEffects: [],
      effectMetadatas: [],
      activeEffects: [],
      projectName: '',
      sources: [],

      showNewProjectModal: false,
    };
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.core = new Core(this.canvas);
    this.setState({
      registeredEffects: this.core.getRegisteredEffects(),
    })
    this.core.update([0, 0, 0, 0.8]);
  }

  getWebcamStream() {
    if (this.state.webcamStream != null) return Promise.resolve(this.webcamStream);

    if (navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.setState({
            webcamStream: stream
          });
          return stream;
        })
        .catch(err => console.log(err));
    }
  }

  stopWebcam() {
    if (this.state.webcamStream == null) return;

    this.state.webcamStream.getTracks()[0].stop();
    this.setState({
      webcamStream: null,
    });
  }

  resize(dimensions) {
    let w = dimensions.width;
    let h = dimensions.height;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;

    if (w > h) {
      if (w > maxW) {
        h = h * (maxW / w);
        w = maxW;
      }
    } else {
      if (h > maxH) {
        w = w * (maxH / h);
        h = maxH;
      }
    }

    this.setState({
      width: w,
      height: h,
    });
  }

  showNewProjectModal = () => {
    this.setState({
      projectName: '',
      showNewProjectModal: true,
    });
  }

  newProject = () => {
    this.core.resetState();
    this.stopWebcam();
    this.setState({
      width: 512,
      height: 512,
      effectMetadatas: [],
      activeEffects: [],
      sources: [],
      showNewProjectModal: false,
    });
  }

  updateProjectJSON(json) {
    this.setState({
      projectName: json.projectName,
      activeEffects: json.activeEffects,
      sources: json.sources,
    });

    let res = this.core.import(json.coreState);

    res.source_result
      .then(res => {
        if (res === 'webcam-request') {
          return this.getWebcamStream()
            .then(stream => this.core.defineWebcamSource(stream));
        }
        this.stopWebcam();
        return res;
      })
      .then(dim => this.resize(dim));

    this.setState({
      effectMetadatas: res.effects_metadatas,
    });
  }

  saveProject() {
    if (!this.core.sourceLoaded() || !this.core.modified()) return;

    const { projectName } = this.state;
    let name = projectName ? projectName : 'project';

    let coreState = this.core.export();
    let fullState = {
      projectName: name,
      activeEffects: this.state.activeEffects,
      sources: this.state.sources,
      coreState,
    };
    let content = JSON.stringify(fullState);

    let link = document.createElement('a');
    link.download = name + '.alpro';
    link.href = `data:text/json;charset=utf-8,${encodeURI(content)}`;
    link.click();
  }

  changeProjectName = (projectName) => {
    this.setState({
      projectName,
    });
  }

  addSource = (source) => {
    const { sources } = this.state;
    sources.push(source);
    this.setState({
      sources,
    });

    if (!this.core.sourceLoaded()) this.setSource(source);
  }

  setSource = (source) => {
    if (source.type === 'img') this.updateImgURL(source.data);
    if (source.type === 'video') this.updateVidURL(source.data);
  }

  updateImgURL(dataURL) {
    this.core.defineImageSource(dataURL)
      .then(dim => this.resize(dim));
    this.stopWebcam();
  }

  updateVidURL(dataURL) {
    this.core.defineVideoSource(dataURL)
      .then(dim => this.resize(dim));
    this.stopWebcam();
  }

  requestWebcam() {
    this.getWebcamStream()
      .then(stream => this.core.defineWebcamSource(stream))
      .then(dim => this.resize(dim));
  }

  exportPNG() {
    if (!this.core.sourceLoaded() || !this.core.modified()) return;

    let link = document.createElement('a');
    link.download = 'output_image.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  addEffect = (effectType) => {
    const { effectMetadatas } = this.state;

    let metadata = this.core.addEffect(effectType);
    effectMetadatas.push(metadata);

    this.setState({
      effectMetadatas: effectMetadatas,
    });

    this.changeActiveEffect(metadata.id);
  }

  editEffect = (id) => (params) => {
    this.core.editEffect(id, params);
    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
    });
  }

  removeEffect = (id) => () => {
    const { activeEffects } = this.state;

    this.core.removeEffect(id);

    let key = id.toString();
    let idx = activeEffects.findIndex(e => e === key);
    if (idx !== -1) activeEffects.splice(idx, 1);

    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
      activeEffects: activeEffects,
    });
  }

  changeActiveEffect = (effectKey) => {
    const { activeEffects } = this.state;

    let key = effectKey.toString();
    let idx = activeEffects.findIndex(e => e === key);
    if (idx === -1) activeEffects.push(key);
    else activeEffects.splice(idx, 1);

    this.setState({
      activeEffects: activeEffects,
    });
  }

  streamCanvas = () => {
    const { width, height } = this.state;
    const stream = this.canvas.captureStream();

    const newWindow = window.open("", "_blank", `innerWidth=${width},innerHeight=${height},resizable=yes`);
    waitForCondition(() => newWindow !== null, () => newWindow)
      .then(w => {
        w.document.body.style.backgroundColor = "black";
        let vid = w.document.createElement('video');
        vid.width = width;
        vid.height = height;
        vid.srcObject = stream;
        vid.muted = true;
        vid.onloadedmetadata = () => {
          w.document.body.appendChild(vid);
          vid.play();
        };
        vid.load();
        w.onresize = e => {
          vid.width = e.target.innerWidth;
          vid.height = e.target.innerHeight;
        };
      });

  }

  render() {
    let textWidth = this.state.projectName.length * 8.5;
    textWidth = textWidth > 100 ? textWidth : 100;

    return (
      <div className="App">
        <MenuBar
          // ProjectName
          projectName={this.state.projectName}
          changeProjectName={this.changeProjectName.bind(this)}

          // File
          newProject={this.showNewProjectModal.bind(this)}
          updateProjectJSON={this.updateProjectJSON.bind(this)}
          saveProject={this.saveProject.bind(this)}

          addSource={this.addSource.bind(this)}
          requestWebcam={this.requestWebcam.bind(this)}

          exportPNG={this.exportPNG.bind(this)}

          // Effect
          registeredEffects={this.state.registeredEffects}
          addEffect={this.addEffect.bind(this)}

          // Stream
          streamCanvas={this.streamCanvas.bind(this)}
        />
        <Grid container spacing={2} style={{ marginLeft: 10, marginTop: 10 }}>
          <Grid item>
            <SourcesZone
              sources={this.state.sources}
              setSource={this.setSource.bind(this)}
            />
          </Grid>
          <Grid item>
            <canvas
              id="canvas"
              width={this.state.width}
              height={this.state.height}
              style={{ float: 'left', marginLeft: 50, marginTop: 10 }}
            />
          </Grid>
          <Grid item>
            <EffectEditorZone
              metadatas={this.state.effectMetadatas}
              editEffect={this.editEffect.bind(this)}
              removeEffect={this.removeEffect.bind(this)}
              activeEffects={this.state.activeEffects}
              changeActiveEffect={this.changeActiveEffect.bind(this)}
            />
          </Grid>
        </Grid>



        {/*New Project Modal*/}
        <Modal
          show={this.state.showNewProjectModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>New Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TextField
              label="Project Name"
              size='small'
              style={{ width: textWidth, maxWidth: 200 }}
              variant='standard'
              value={this.state.projectName}
              onChange={(e) => this.changeProjectName(e.target.value)}
              onKeyUp={(e) => { if (e.key === 'Enter') this.newProject() }}
            /> {this.state.projectName ? '.alpro' : ' '}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={this.newProject}>Ok</Button>
          </Modal.Footer>

        </Modal>
      </div>
    );
  }
}
export default App;