import { Switch } from "@mui/material";
import { Component } from "react";

class NumberParam extends Component {

  constructor(props) {
    super(props);
    this.state = {
      param: props.value,
    };
  }

  setValue = (e) => {
    const p = e.target.checked ? -1 : 1;
    this.setState({
      param: p,
    });
    this.props.setParam(this.props.name, p);
  }

  render() {
    return (
      <div>
        <label>{this.props.leftLabel}</label>
        <Switch
          checked={this.state.param === 1 ? false : true}
          onChange={this.setValue}
          color="default"
          label={['high', 'low']}
          size='small'
          disabled={this.props.disabled}
        />
        <label>{this.props.rightLabel}</label>
      </div>
    );
  }
}

export default NumberParam;