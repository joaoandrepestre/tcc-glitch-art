import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Core from 'alpro-core';
import MenuBar from './components/menu-bar/menu-bar';
import EffectEditor from './components/effect-editors/effect-editor';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: 512,
      height: 512,
      webcamStream: null,
      registeredEffects: [],
      effectMetadatas: [],
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

  newProject() {
    this.core.resetState();
    this.stopWebcam();
    this.setState({
      width: 512,
      height: 512,
      effectMetadatas: [],
    });
  }

  updateProjectJSON(json) {
    let res = this.core.import(json);

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

    let json = JSON.stringify(this.core.export());
    let link = document.createElement('a');
    link.download = 'project.json';
    link.href = `data:text/json;charset=utf-8,${encodeURI(json)}`;
    link.click();
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
    const metadatas = this.state.effectMetadatas;
    let metadata = this.core.addEffect(effectType)
    metadatas.push(metadata);
    this.setState({
      effectMetadatas: metadatas,
    });
  }

  editEffect = (id) => (params) => {
    this.core.editEffect(id, params);
    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
    });
  }

  removeEffect = (id) => () => {
    this.core.removeEffect(id);
    this.setState({
      effectMetadatas: this.core.getEffectMetadatas(),
    });
  }

  render() {
    return (
      <div className="App">
        <MenuBar
          // File
          newProject={this.newProject.bind(this)}
          updateProjectJSON={this.updateProjectJSON.bind(this)}
          saveProject={this.saveProject.bind(this)}

          updateImgURL={this.updateImgURL.bind(this)}
          updateVidURL={this.updateVidURL.bind(this)}
          requestWebcam={this.requestWebcam.bind(this)}

          exportPNG={this.exportPNG.bind(this)}

          // Effect
          registeredEffects={this.state.registeredEffects}
          addEffect={this.addEffect.bind(this)}
        />
        <canvas
          id="canvas"
          width={this.state.width}
          height={this.state.height}
          style={{ float: 'left', marginLeft: 50 }}
        />
        <div id='effects' style={{ float: 'left', marginLeft: 25 }}>
          {this.state.effectMetadatas.map(metadata =>
            <EffectEditor
              key={metadata.id}
              metadata={metadata}
              editEffect={this.editEffect(metadata.id).bind(this)}
              removeEffect={this.removeEffect(metadata.id).bind(this)} />
          )}
        </div>
      </div>
    );
  }
}
export default App;