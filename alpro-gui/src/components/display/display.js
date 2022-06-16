import { Fab } from "@mui/material";
import { Component } from "react";
import { CameraAlt, OpenInNew } from '@mui/icons-material'
import { round2Decimals } from "../../utils/number-utils";
import { waitForCondition } from '../../utils/time-utils';

class Display extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canvasStream: null,
    };
  }

  componentDidMount() {
    const stream = document.getElementById('canvas').captureStream();
    const display = document.getElementById('display');
    display.srcObject = stream;
    display.load();
    this.setState({
      canvasStream: stream,
    });
  }

  computeDisplayDimensions = () => {
    const ar = 16 / 9;
    const w = round2Decimals(this.props.displayWidth);
    const h = round2Decimals(w / ar);

    return { w, h };
  }

  saveImage = () => {
    this.props.saveImage();
  }

  streamCanvas = () => {
    const { canvasStream } = this.state;
    const { w, h } = this.computeDisplayDimensions();

    const dxy = 5;
    const newWindow = window.open("", "_blank",
      `innerWidth=${w + dxy},innerHeight=${h + dxy},
    resizable=yes,scrollbars=no,location=no,toolbar=no,popup=yes`);
    waitForCondition(() => newWindow !== null, () => newWindow)
      .then(w => {
        w.document.body.style.background = 'black';
        w.document.body.style.overflow = 'hidden';

        // vid
        let vid = w.document.createElement('video');
        vid.style.width = '100%';
        vid.style.height = '100%';
        vid.style.position = 'absolute';
        vid.style.marginTop = `-${2 * dxy}px`;
        vid.style.marginLeft = `-${dxy}px`;
        vid.srcObject = canvasStream;
        vid.muted = true;
        vid.onloadedmetadata = () => {
          w.document.body.appendChild(vid);
          vid.play();
        };
        vid.load();
      });

  }

  render() {
    const display = this.computeDisplayDimensions();
    return (
      <div>
        <canvas
          id="canvas"
          width={this.props.textureWidth}
          height={this.props.textureHeight}
          style={{ float: 'left', marginLeft: 50, marginTop: 10 }}
          hidden
        />
        <div style={{ background: 'black', width: display.w, height: display.h, overflow: "hidden" }}>
          <video autoPlay muted id="display" style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ marginTop: 5 }}>
          <Fab color='info' onClick={this.saveImage} style={{ marginRight: 5 }} disabled={!this.props.enableButtons}>
            <CameraAlt />
          </Fab>
          <Fab color='info' onClick={this.streamCanvas} disabled={!this.props.enableButtons}>
            <OpenInNew />
          </Fab>
        </div>
      </div>
    );
  }
}

export default Display;