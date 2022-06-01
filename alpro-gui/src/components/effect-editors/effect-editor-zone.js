import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EffectEditor from './effect-editor';

class EffectEditorZone extends Component {

  constructor(props) {
    super(props);
  }

  onDragEnd = (result) => {
    if (!result.destination) return;

    this.props.reorderEffects(result.source.index, result.destination.index);
  }

  render() {
    return (
      <div>
        <strong className="me-auto" style={{ float: "left" }}>Effects</strong><br />
        <div style={{ float: "left", width: window.innerWidth / 5, marginTop: 15 }}>
          <DragDropContext onDragEnd={this.onDragEnd} direction='vertical'>
            <Droppable droppableId='effects-zone'>
              {(provided, snapshot) => (
                <Accordion
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  activeKey={this.props.activeEffects}
                  alwaysOpen
                >
                  {this.props.metadatas.map((metadata, idx) =>
                    <Draggable
                      key={metadata.id}
                      draggableId={metadata.id.toString()}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <EffectEditor
                            key={metadata.id}
                            type={metadata.type}
                            metadata={metadata}
                            editEffect={this.props.editEffect(metadata.id)}
                            removeEffect={this.props.removeEffect(metadata.id)}
                            changeActiveEffect={this.props.changeActiveEffect}
                          />
                        </div>
                      )}
                    </Draggable>
                  )}
                  {provided.placeholder}
                </Accordion>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    );
  }
}

export default EffectEditorZone;