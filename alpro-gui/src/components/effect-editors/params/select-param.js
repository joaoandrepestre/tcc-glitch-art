import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Component } from "react";
import { formatLabel } from "../../../utils/string-utils";

class SelectParam extends Component {

  setValue = (e) => {
    this.props.setParam(this.props.name, e.target.value);
  }

  render() {
    return (
      <FormControl fullWidth>
        <InputLabel>{formatLabel(this.props.name)}</InputLabel>
        <Select
          value={this.props.value}
          label={formatLabel(this.props.name)}
          onChange={this.setValue}
          size='small'
          style={{ float: 'left' }}
          disabled={this.props.disabled}
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