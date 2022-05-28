import { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import { firstLetterUpperCase } from "../../utils";

class EffectDropdown extends Component {

  constructor(props) {
    super(props);
  }

  addEffect = (effect) => () => {
    this.props.addEffect(effect);
  }

  render() {
    return (
      <NavDropdown title="Effect" id="basic-nav-dropdown">
        {this.props.registeredEffects.map(effect => {
          return (
            <NavDropdown.Item key={effect} onClick={this.addEffect(effect)}>
              {firstLetterUpperCase(effect)}
            </NavDropdown.Item>
          );
        })}
      </NavDropdown>
    );
  }

}

export default EffectDropdown;