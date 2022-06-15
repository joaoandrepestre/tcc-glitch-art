import React, { Component } from 'react';
import './App.css';
import Core from 'alpro-core';
import MenuBar from './components/menu-bar/menu-bar';
import EffectEditorZone from './components/effect-editors/effect-editor-zone';
import { Grid } from '@mui/material';
import SourcesZone from './components/sources-zone/sources-zone';
import { getCookie, setCookie } from './utils/cookie-utils';
import Display from './components/display';
import ProjectState from './models/project-state';
import NewProjectModal from './components/modals/new-project-modal';
import InitModal from './components/modals/init-modal';
import './utils/object-utils'; // define Object.id function
import { getSessionStorageValue } from './utils/storage-utils';


const COOKIE_KEY_ACCESS = 'accessed';
const COOKIE_EXPIRATION_ACCESS = 100;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      textureWidth: 512,
      textureHeight: 512,
      windowWidth: null,
      windowHeight: null,

      inputStream: null,
      registeredEffects: [],
      effectMetadatas: [],
      inputDevices: [],

      projectState: new ProjectState(),

      showNewProjectModal: false,
      showInitModal: false,

      isReorderingEffects: false,
      isSourceLoaded: false,
    };
  }

  isSourceLoaded = () => {
    if (!this.core) return false;

    return this.core.sourceLoaded();
  }

  defineInputDevices = () => {
    if (!navigator.mediaDevices.enumerateDevices) return;

    return navigator.mediaDevices.enumerateDevices()
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
        windowHeight: window.innerHeight - 61,
      });
    };

    this.setState({
      registeredEffects: this.core.getRegisteredEffects(),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight - 61,
    })
    this.defineInputDevices()
      .then(this.checkCookies);
    this.core.update([0, 0, 0, 0.8]);
  }

  loadFromStorage = () => {
    const project = getSessionStorageValue(ProjectState.STORAGE_KEY_PROJECT)
    if (project !== null) {
      this.updateProjectJSON(project);
    } else {
      this.setState({
        showInitModal: true,
      });
    }
  };

  checkCookies = () => {
    this.loadFromStorage();
    const accessed = getCookie(COOKIE_KEY_ACCESS);

    if (accessed === "" || accessed !== 'true') {
      // show tutorial
      setCookie(COOKIE_KEY_ACCESS, true, COOKIE_EXPIRATION_ACCESS);
    }
  }

  getInputStream(deviceId) {
    const { projectState } = this.state;
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
          projectState.setDeviceId(deviceId);
          this.setState({
            inputStream: stream,
            projectState
          });
          return stream;
        })
        .catch(err => console.log(err));
    }
  }

  stopInputStream() {
    if (this.state.inputStream == null) return;

    const { projectState } = this.state;

    this.state.inputStream.getTracks()[0].stop();
    projectState.setDeviceId(null);
    this.setState({
      inputStream: null,
      projectState,
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
      showNewProjectModal: true,
    });
  }

  newProject = (name) => {
    this.core.resetState();
    this.stopInputStream();
    this.setState({
      width: 512,
      height: 512,
      effectMetadatas: [],

      projectState: ProjectState.newProject(name),

      showNewProjectModal: false,
      showInitModal: false,

      isReorderingEffects: false,
      isSourceLoaded: false,
    });
  }

  updateProjectJSON = (json) => {
    const proj = ProjectState.loadProject(json);

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
      .then(dim => {
        this.resize(dim);
        let { projectState } = this.state;
        projectState.updateCoreSource(this.core.getExportedSource());
        this.setState({
          projectState,
          isSourceLoaded: this.isSourceLoaded(),
        });
      });

    this.setState({
      projectState: proj,
      effectMetadatas: res.effects_metadatas,
      isReorderingEffects: false,
      showInitModal: false,
    });
  }

  saveProject() {
    if (!this.core.sourceLoaded() || !this.core.modified()) return;

    const { projectState } = this.state;

    const projectName = projectState.name;
    let name = projectName ? projectName : 'project';

    let link = document.createElement('a');
    link.download = name + '.alpro';
    link.href = `data:text/json;charset=utf-8,${encodeURI(JSON.stringify(projectState))}`;
    link.click();
  }

  changeProjectName = (projectName) => {
    const { projectState } = this.state;
    projectState.updateName(projectName);
    this.setState({
      projectState,
    });
  }

  addSource = (source) => {
    const { projectState } = this.state;
    projectState.addSource(source);
    this.setState({
      projectState,
    });

    if (!this.core.sourceLoaded()) this.setSource(source);
  }

  setSource = (source) => {
    if (source.type === 'img') this.updateImgURL(source.data);
    if (source.type === 'video') this.updateVidURL(source.data);
  }

  updateImgURL(dataURL) {
    const { projectState } = this.state;
    this.core.defineImageSource(dataURL)
      .then(dim => {
        this.resize(dim);
        projectState.updateCoreSource(this.core.getExportedSource());
        this.setState({
          projectState,
          isSourceLoaded: this.isSourceLoaded(),
        });
      });
    this.stopInputStream();
  }

  updateVidURL(dataURL) {
    const { projectState } = this.state;

    this.core.defineVideoSource(dataURL)
      .then(dim => {
        this.resize(dim);
        projectState.updateCoreSource(this.core.getExportedSource());
        this.setState({
          projectState,
          isSourceLoaded: this.isSourceLoaded(),
        });
      });
    this.stopInputStream();
  }

  requestInputStream(deviceId, flipX = true) {
    const { projectState } = this.state;

    this.getInputStream(deviceId)
      .then(stream => this.core.defineInputStreamSource(stream, flipX))
      .then(dim => {
        this.resize(dim);
        projectState.updateCoreSource(this.core.getExportedSource());
        this.setState({
          projectState,
          isSourceLoaded: this.isSourceLoaded(),
        });
      })
      .catch(err => alert(err));
  }

  exportPNG() {
    if (!this.core.sourceLoaded()) return;

    const { projectState } = this.state;
    let name = projectState.name ? projectState.name : 'output_image';

    let link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  addEffect = (effectType) => {
    const { effectMetadatas, projectState } = this.state;

    let metadata = this.core.addEffect(effectType);
    effectMetadatas.push(metadata);
    projectState.updateCoreEffects(this.core.getExportedEffects());

    this.setState({
      effectMetadatas: effectMetadatas,
      projectState,
    });

    this.changeActiveEffect(metadata.id);
  }

  editEffect = (id) => (params) => {
    const { projectState } = this.state;

    this.core.editEffect(id, params);
    projectState.updateCoreEffects(this.core.getExportedEffects());
    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
      projectState,
    });
  }

  removeEffect = (id) => () => {
    const { projectState } = this.state;

    this.core.removeEffect(id);
    projectState.updateCoreEffects(this.core.getExportedEffects());

    projectState.removeActiveEffect(id);

    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
      projectState,
    });
  }

  startReordering = () => {
    const { isReorderingEffects } = this.state;
    this.setState({
      isReorderingEffects: !isReorderingEffects,
    });
  }

  reorderEffects = (idx1, idx2) => {
    const { projectState } = this.state;

    const metadatas = this.core.reorderEffects(idx1, idx2);

    projectState.updateCoreEffects(this.core.getExportedEffects());

    this.setState({
      effectMetadatas: metadatas,
      projectState,
    });
  }

  changeActiveEffect = (effectKey) => {
    const { projectState } = this.state;

    projectState.toggleActiveEffect(effectKey);

    this.setState({
      projectState,
    });
  }

  render() {
    const { projectState } = this.state;

    return (
      <div className="App">
        <MenuBar
          // ProjectName
          projectName={projectState.name}
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
          effectsDisabled={this.state.isReorderingEffects || !this.state.isSourceLoaded}
        />
        <Grid container spacing={2} style={{ marginTop: 10 }}>
          <Grid item>
            <SourcesZone

              width={this.state.windowWidth * 0.20 - 5}
              height={this.state.windowHeight * 0.80}

              sources={projectState.sources}
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
              width={this.state.windowWidth * 0.20 - 5}
              height={this.state.windowHeight * 0.8}

              metadatas={this.state.effectMetadatas}
              editEffect={this.editEffect.bind(this)}
              removeEffect={this.removeEffect.bind(this)}
              activeEffects={projectState.activeEffects}
              changeActiveEffect={this.changeActiveEffect.bind(this)}
              reorderEffects={this.reorderEffects.bind(this)}
              isDragging={this.state.isReorderingEffects}
              startReordering={this.startReordering.bind(this)}
            />
          </Grid>
        </Grid>

        {/*Modals*/}
        <NewProjectModal
          show={this.state.showNewProjectModal}
          newProject={this.newProject}
        />

        <InitModal
          show={this.state.showInitModal}
          newProject={this.newProject}
          updateProjectJSON={this.updateProjectJSON}
        />
      </div>
    );
  }
}
export default App;