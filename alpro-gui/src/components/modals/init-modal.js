import { Divider, Link, TextField } from "@mui/material";
import { Component } from "react";
import { Button, ListGroup, Modal, Tab, Tabs } from "react-bootstrap";
import ProjectState from "../../models/project-state";
import { loadProject } from "../../utils/file-utils";

class InitModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'load',
      name: "",
    };
  }

  loadProject = (proj) => () => {
    this.props.updateProjectJSON(proj);
  }

  changeName = (name) => {
    this.setState({
      name,
    });
  }

  render() {
    let textWidth = this.state.name.length * 8.5;
    textWidth = textWidth > 100 ? textWidth : 100;
    const recent = ProjectState.getRecentProjects();

    return (
      <Modal
        show={this.props.show}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Alimento Processado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={this.state.activeKey}
            onSelect={(k) => this.setState({ activeKey: k })}
            className="mb-3"
          >
            <Tab eventKey="load" title="Load Project">
              Recent projects
              <ListGroup variant="flush">
                {recent.map(({ timestamp, project }, idx) => (
                  <ListGroup.Item key={idx} onClick={this.loadProject(project)}>
                    <Link style={{ cursor: 'pointer' }}>
                      <span style={{ float: 'left', textDecoration: 'inherit' }}>
                        {project.name}
                      </span>
                      <span style={{ float: 'right', textDecoration: 'inherit' }}>
                        {timestamp.toUTCString()}
                      </span>
                    </Link>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item onClick={loadProject(this.props.updateProjectJSON)}>
                  <Link style={{ cursor: 'pointer' }}>Upload Project...</Link>
                </ListGroup.Item>
              </ListGroup>
            </Tab>
            <Tab eventKey="new" title="New Project">
              <TextField
                label="Project Name"
                size='small'
                style={{ width: textWidth, maxWidth: 200 }}
                variant='standard'
                value={this.state.name}
                onChange={(e) => this.changeName(e.target.value)}
                onKeyUp={(e) => { if (e.key === 'Enter') this.props.newProject(this.state.name) }}
              /> {this.props.projectName ? '.alpro' : ' '}
            </Tab>
          </Tabs>
          <br />
          <Divider />
          <span>AlPro doesn't work well on mobile yet.</span><br />
          <span>It would be best to proceed on a computer enviroment.</span>
        </Modal.Body>
        <Modal.Footer>
          {this.state.activeKey === 'new' &&
            <Button variant='primary' onClick={() => this.props.newProject(this.state.name)}>Ok</Button>
          }
        </Modal.Footer>

      </Modal>
    );
  }
}

export default InitModal;