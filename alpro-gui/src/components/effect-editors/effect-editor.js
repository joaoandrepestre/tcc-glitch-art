import { Component } from "react";
import { Accordion, ListGroup, Toast } from "react-bootstrap";
import { firstLetterUpperCase } from "../../utils/string-utils";
import { Switch } from '@mui/material';
import MultiParam from "./params/multi-param";
import NumberParam from "./params/number-param";
import SelectParam from "./params/select-param";

class EffectEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      params: this.buildParamsObject()
    };
  }

  buildParamsObject = () => {
    let params = {};
    this.props.metadata.params.forEach(p => {
      if (p.type === 'boolean' || p.type === 'number')
        params[`${p.name}`] = p.value;
      if (p.type === 'multi') {
        params[`${p.name}`] = {};
        p.value.forEach((v, i) => {
          params[`${p.name}`][`${p.labels[i]}`] = v;
        });
      }
      if (p.type === 'select')
        params[`${p.name}`] = { selected: p.value };
    });
    return params;
  }

  close = (e) => {
    e.stopPropagation();
    this.setState({ show: false });
    this.props.removeEffect();
  }

  setDisabled = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    const p = this.state.params;
    p.disabled = !e.target.checked;
    this.setState({
      params: p,
    });
    this.props.editEffect(this.state.params);
  }

  setParam(name, param) {
    const p = this.state.params;
    p[`${name}`] = param;
    this.setState({
      params: p
    });
    this.props.editEffect(this.state.params);
  }

  toggleEffectEditor = (e) => {
    if (this.props.isDragging) return;
    this.props.changeActiveEffect(this.props.metadata.id);
  }

  render() {
    return (
      <div style={{ margin: 5 }}>
        <Toast show={this.state.show} onClose={this.close}>
          <Toast.Header
            style={{ cursor: "pointer" }}
            onClick={this.toggleEffectEditor}
            closeButton={!this.props.isDragging}
          >
            <strong className="me-auto">{firstLetterUpperCase(this.props.type)}
            </strong>
            <Switch
              checked={!this.state.params['disabled']}
              onClickCapture={this.setDisabled}
              size="small"
              disabled={this.props.isDragging}
            />
          </Toast.Header>
          <Accordion.Collapse eventKey={this.props.metadata.id.toString()}>
            <Toast.Body>
              <ListGroup>
                {this.props.metadata.params
                  .filter(p => p.name !== 'disabled')
                  .sort((a, b) => {
                    if (a.type === 'number') return -1;
                    if (b.type === 'number') return 1;
                    if (a.type === 'select') return -1;
                    if (b.type === 'select') return 1;
                    return 0;
                  })
                  .map((param, idx) => {
                    let paramEditor = <div>{param.name}</div>;
                    if (param.type === 'multi') {
                      paramEditor = (
                        <MultiParam
                          name={param.name}
                          value={param.value}
                          labels={param.labels}
                          setParam={this.setParam.bind(this)}
                          disabled={this.props.isDragging}
                        />
                      );
                    }
                    if (param.type === 'number') {
                      paramEditor = (
                        <NumberParam
                          name={param.name}
                          value={param.value}
                          leftLabel={param.name === 'high_low' ? 'High Pass' : 'Horizontal'}
                          rightLabel={param.name === 'high_low' ? 'Low Pass' : 'Vertical'}
                          setParam={this.setParam.bind(this)}
                          disabled={this.props.isDragging}
                        />
                      );
                    }
                    if (param.type === 'select') {
                      paramEditor = (
                        <SelectParam
                          name={param.name}
                          value={param.value}
                          options={param.options}
                          setParam={this.setParam.bind(this)}
                          disabled={this.props.isDragging}
                        />
                      );
                    }
                    return <ListGroup.Item key={param.name}>{paramEditor}</ListGroup.Item>
                  })}
              </ListGroup>
            </Toast.Body>
          </Accordion.Collapse>
        </Toast >
      </div>
    );
  }

}

export default EffectEditor;