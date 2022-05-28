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
    this.setState({
      param: e.target.checked ? -1 : 1,
    });
    this.props.setParam(this.props.name, this.state.param);
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
        />
        <label>{this.props.rightLabel}</label>
      </div>
    );
  }
}

export default NumberParam;