import { TextField } from "@mui/material";
import { Component } from "react";
import { Button, Modal } from "react-bootstrap";

class NamingModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }

  changeName = (name) => {
    this.setState({
      name,
    });
  }

  render() {
    let textWidth = this.state.name.length * 8.5;
    textWidth = textWidth > 100 ? textWidth : 100;

    return (
      <Modal
        show={this.props.show}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            label={this.props.placeholder}
            size='small'
            style={{ width: textWidth, maxWidth: 200 }}
            variant='standard'
            value={this.state.name}
            onChange={(e) => this.changeName(e.target.value)}
            onKeyUp={(e) => { if (e.key === 'Enter') this.props.saveName(this.state.name) }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={() => this.props.saveName(this.state.name)}>Ok</Button>
        </Modal.Footer>

      </Modal>
    );
  }
}

export default NamingModal;