import { Component } from "react";
import { NavDropdown } from "react-bootstrap";

class InputStreamDropdown extends Component {

  requestStream = (deviceId, flipX) => () => {
    this.props.requestStream(deviceId, flipX);
  }

  render() {
    return (
      <NavDropdown title="Input Stream" id="basic-nav-dropdown">
        {this.props.inputDevices.map((device, idx) => {
          const flipX = device.label.toLowerCase().includes('webcam')
            || device.label.toLowerCase().includes('front');
          return <NavDropdown.Item
            key={idx}
            onClick={this.requestStream(device.deviceId, flipX)}
          >
            {`Open ${device.label}...`}
          </NavDropdown.Item>
        })}
      </NavDropdown>
    );
  }
}

export default InputStreamDropdown;