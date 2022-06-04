import { Component } from "react";

class Display extends Component {

  constructor(props) {
    super(props);
    this.state = {
      outputStream: null,
    };
  }

  componentDidMount() {
    const stream = document.getElementById('canvas').captureStream();
    const display = document.getElementById('display');
    display.srcObject = stream;
    display.load();
    this.setState({
      outputStream: stream,
    });
  }

  computeDisplayDimensions = () => {
    const ar = 16 / 9;
    const w = this.props.displayWidth;
    const h = w / ar;

    return { w, h };
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
        <div style={{ background: 'black' }}>
          <video width={display.w} height={display.h} autoPlay muted id="display" />
        </div>
      </div>
    );
  }
}

export default Display;