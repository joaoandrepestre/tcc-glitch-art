import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import EffectEditor from './effect-editor';

class EffectEditorZone extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <strong className="me-auto" style={{ float: "left" }}>Effects</strong><br />
        <div style={{ float: "left", width: window.innerWidth / 5, marginTop: 15 }}>
          <Accordion activeKey={this.props.activeEffects} alwaysOpen>
            {this.props.metadatas.map(metadata =>
              <EffectEditor
                key={metadata.id}
                type={metadata.type}
                metadata={metadata}
                editEffect={this.props.editEffect(metadata.id)}
                removeEffect={this.props.removeEffect(metadata.id)}
                changeActiveEffect={this.props.changeActiveEffect}
              />
            )}

          </Accordion>
        </div>
      </div>
    );
  }
}

export default EffectEditorZone;