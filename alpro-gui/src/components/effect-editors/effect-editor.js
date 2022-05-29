import { Component } from "react";
import { ListGroup, Toast } from "react-bootstrap";
import { firstLetterUpperCase } from "../../utils";
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
    console.log(props);
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

  close = () => {
    this.setState({ show: false });
    this.props.removeEffect();
  }

  setDisabled = (e) => {
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

  render() {
    return (
      <div style={{ marginBottom: 5 }}>
        <Toast show={this.state.show} onClose={this.close}>
          <Toast.Header>
            <strong className="me-auto">{firstLetterUpperCase(this.props.type)}</strong>
            <Switch
              checked={!this.state.params['disabled']}
              onChange={this.setDisabled}
              size="small"
            />
          </Toast.Header>
          <Toast.Body>
            <ListGroup>
              {this.props.metadata.params.map((param, idx) => {
                if (param.name === 'disabled') return <div></div>;

                let paramEditor = <div></div>;
                if (param.type === 'multi') {
                  paramEditor = (
                    <MultiParam
                      name={param.name}
                      value={param.value}
                      labels={param.labels}
                      setParam={this.setParam.bind(this)}
                    />
                  );
                }
                if (param.type === 'number') {
                  paramEditor = (
                    <NumberParam
                      name={param.name}
                      value={param.value}
                      leftLabel='High Pass'
                      rightLabel='Low Pass'
                      setParam={this.setParam.bind(this)}
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
                    />
                  );
                }
                return <ListGroup.Item key={param.name}>{paramEditor}</ListGroup.Item>
              })}
            </ListGroup>
          </Toast.Body>
        </Toast >
      </div>
    );
  }

}

export default EffectEditor;