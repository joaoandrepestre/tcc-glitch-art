import React, { Component } from 'react';
import './App.css';
import Core from 'alpro-core';
import MenuBar from './components/menu-bar/menu-bar';
import EffectEditorZone from './components/effect-editors/effect-editor-zone';
import { Button, Modal } from 'react-bootstrap';
import { Grid, TextField } from '@mui/material';
import SourcesZone from './components/sources-zone/sources-zone';
import { waitForCondition } from './utils';
import Display from './components/display';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      textureWidth: 512,
      textureHeight: 512,
      windowWidth: null,
      inputStream: null,
      registeredEffects: [],
      effectMetadatas: [],
      activeEffects: [],
      projectName: '',
      sources: [],
      inputDevices: [],
      selectedDeviceId: null,
      showNewProjectModal: false,

      isReorderingEffects: false,
    };
  }

  isSourceLoaded = () => {
    if (!this.core) return false;

    return this.core.sourceLoaded();
  }

  defineInputDevices = () => {
    if (!navigator.mediaDevices.enumerateDevices) return;

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.setState({
          inputDevices: devices.filter(d => d.kind === 'videoinput'),
        })
      });
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.core = new Core(this.canvas);
    window.onresize = e => {
      this.setState({
        windowWidth: e.target.innerWidth,
      });
    };
    this.setState({
      registeredEffects: this.core.getRegisteredEffects(),
      windowWidth: window.innerWidth,
    })
    this.defineInputDevices();
    this.core.update([0, 0, 0, 0.8]);
  }

  getInputStream(deviceId) {
    this.stopInputStream();

    const validIds = this.state.inputDevices.map(d => d.deviceId);
    if (deviceId !== undefined && !validIds.includes(deviceId)) {
      return Promise.reject("The selectd device does not exist or has changed its id.");
    }

    if (navigator.mediaDevices.getUserMedia) {
      const constraint = {
        video: deviceId === undefined ? true : { deviceId }
      };
      return navigator.mediaDevices.getUserMedia(constraint)
        .then(stream => {
          this.setState({
            inputStream: stream,
            selectedDeviceId: deviceId,
          });
          return stream;
        })
        .catch(err => console.log(err));
    }
  }

  stopInputStream() {
    if (this.state.inputStream == null) return;

    this.state.inputStream.getTracks()[0].stop();
    this.setState({
      inputStream: null,
    });
  }

  resize(dimensions) {
    this.setState({
      textureWidth: dimensions.width,
      textureHeight: dimensions.height,
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
    this.stopInputStream();
    this.setState({
      width: 512,
      height: 512,
      effectMetadatas: [],
      activeEffects: [],
      sources: [],
      showNewProjectModal: false,
      isReorderingEffects: false,
    });
  }

  updateProjectJSON(json) {
    this.setState({
      projectName: json.projectName,
      activeEffects: json.activeEffects,
      sources: json.sources,
      selectedDeviceId: json.deviceId,
    });

    let res = this.core.import(json.coreState);

    res.source_result
      .then(res => {
        if (res === 'webcam-request' || res === 'input-stream-request') {
          const isWebcam = res === 'webcam-request';
          return this.requestInputStream(json.deviceId, isWebcam);
        }
        this.stopInputStream();
        return res;
      })
      .then(dim => this.resize(dim));

    this.setState({
      effectMetadatas: res.effects_metadatas,
      isReorderingEffects: false,
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
      deviceId: this.state.selectedDeviceId,
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
    this.stopInputStream();
  }

  updateVidURL(dataURL) {
    this.core.defineVideoSource(dataURL)
      .then(dim => this.resize(dim));
    this.stopInputStream();
  }

  requestInputStream(deviceId, flipX = true) {
    this.getInputStream(deviceId)
      .then(stream => this.core.defineInputStreamSource(stream, flipX))
      .then(dim => this.resize(dim))
      .catch(err => alert(err));
  }

  exportPNG() {
    if (!this.core.sourceLoaded()) return;

    const { projectName } = this.state;
    let name = projectName ? projectName : 'output_image';

    let link = document.createElement('a');
    link.download = `${name}.png`;
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

  startReordering = () => {
    const { isReorderingEffects } = this.state;
    this.setState({
      isReorderingEffects: !isReorderingEffects,
    });
  }

  reorderEffects = (idx1, idx2) => {
    const metadatas = this.core.reorderEffects(idx1, idx2);

    this.setState({
      effectMetadatas: metadatas,
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

    const dxy = 5;
    const newWindow = window.open("", "_blank",
      `innerWidth=${width + dxy},innerHeight=${height + dxy},
    resizable=yes,scrollbars=no,location=no,toolbar=no,popup=yes`);
    waitForCondition(() => newWindow !== null, () => newWindow)
      .then(w => {
        w.document.body.style.backgroundColor = "black";
        let vid = w.document.createElement('video');
        vid.style.position = 'absolute';
        vid.style.marginTop = `-${dxy}px`;
        vid.style.marginLeft = `-${dxy}px`;
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
          vid.width = e.target.innerWidth - dxy;
          vid.height = e.target.innerHeight - dxy;
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
          requestWebcam={this.requestInputStream.bind(this)}

          exportPNG={this.exportPNG.bind(this)}

          // Input Stream
          inputDevices={this.state.inputDevices}
          requestStream={this.requestInputStream.bind(this)}

          // Effect
          registeredEffects={this.state.registeredEffects}
          addEffect={this.addEffect.bind(this)}
          effectsDisabled={this.state.isReorderingEffects || !this.isSourceLoaded()}
        />
        <Grid container spacing={2} style={{ marginLeft: 10, marginTop: 10 }}>
          <Grid item>
            <SourcesZone
              sources={this.state.sources}
              setSource={this.setSource.bind(this)}
            />
          </Grid>
          <Grid item>
            <Display
              textureWidth={this.state.textureWidth}
              textureHeight={this.state.textureHeight}

              displayWidth={this.state.windowWidth * 0.55}

              enableButtons={this.isSourceLoaded()}
              saveImage={this.exportPNG.bind(this)}
            />
          </Grid>
          <Grid item>
            <EffectEditorZone
              metadatas={this.state.effectMetadatas}
              editEffect={this.editEffect.bind(this)}
              removeEffect={this.removeEffect.bind(this)}
              activeEffects={this.state.activeEffects}
              changeActiveEffect={this.changeActiveEffect.bind(this)}
              reorderEffects={this.reorderEffects.bind(this)}
              isDragging={this.state.isReorderingEffects}
              startReordering={this.startReordering.bind(this)}
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