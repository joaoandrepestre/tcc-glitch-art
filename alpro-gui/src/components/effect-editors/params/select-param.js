import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Component } from "react";
import { formatLabel } from "../../../utils";

class SelectParam extends Component {

  constructor(props) {
    super(props);
    this.state = {
      param: this.props.value,
    };
  }

  setValue = (e) => {
    this.setState({
      param: e.target.value,
    });
    this.props.setParam(this.props.name, this.state.param);
  }

  render() {
    return (
      <FormControl fullWidth>
        <InputLabel>{formatLabel(this.props.name)}</InputLabel>
        <Select
          value={this.state.param}
          label={formatLabel(this.props.name)}
          onChange={this.setValue}
          size='small'
          style={{ float: 'left' }}
        >
          {this.props.options.map((option, idx) => (
            <MenuItem key={idx} value={idx}>{option.toUpperCase()}</MenuItem>

          ))}
        </Select>
      </FormControl>
    );
  }
}

export default SelectParam;