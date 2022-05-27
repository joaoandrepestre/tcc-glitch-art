import { Component } from "react";
import { NavDropdown } from "react-bootstrap";

class EffectDropdown extends Component {

  constructor(props) {
    super(props);
  }

  addEffect = (effect) => () => {
    this.props.addEffect(effect);
  }

  getEffectName(effect) {
    return effect.charAt(0).toUpperCase() + effect.slice(1);
  }

  render() {
    return (
      <NavDropdown title="Effect" id="basic-nav-dropdown">
        {this.props.registeredEffects.map(effect => {
          return (
            <NavDropdown.Item key={effect} onClick={this.addEffect(effect)}>
              {this.getEffectName(effect)}
            </NavDropdown.Item>
          );
        })}
      </NavDropdown>
    );
  }

}

export default EffectDropdown;