import { Slider } from "@mui/material";
import { Component } from "react";
import { ListGroup } from "react-bootstrap";
import { formatLabel } from "../../../utils";

class MultiParam extends Component {

  constructor(props) {
    super(props);
    let param = {};
    this.props.value.forEach((v, i) => {
      let label = this.props.labels[i];
      param[`${label}`] = v;
    });
    this.state = {
      param: param
    };
  }

  setValue = (e) => {
    const p = this.state.param;
    p[`${e.target.name}`] = e.target.value / 100;
    this.setState({
      param: p,
    });
    this.props.setParam(this.props.name, p);
  }

  render() {
    const p = Object.entries(this.state.param);
    return (
      <div>
        <label style={{ float: "left" }}>{formatLabel(this.props.name)}</label><br />
        {
          p.map(([key, v], idx) =>
            <div key={key}>
              <label style={{ float: "left" }}>{formatLabel(this.props.labels[idx])}</label>
              <Slider
                size="small"
                aria-label="small"
                name={key}
                value={v * 100}
                valueLabelDisplay="auto"
                onChange={this.setValue}
              />
            </div>
          )
        }
      </div>
    );
  }
}

export default MultiParam;