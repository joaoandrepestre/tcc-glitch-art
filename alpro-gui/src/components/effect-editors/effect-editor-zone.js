import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EffectEditor from './effect-editor';
import { Button, Card, Switch } from '@mui/material';

class EffectEditorZone extends Component {

  onDragEnd = (result) => {
    if (!result.destination) return;

    this.props.reorderEffects(result.source.index, result.destination.index);
  }

  setShouldChunk = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    this.props.setShouldChunk(e.target.checked);
  }

  render() {
    return (
      <div>
        <strong className="me-auto" style={{ float: "left" }}>Effects</strong>
        <Switch
          checked={this.props.shouldChunk}
          onClickCapture={this.setShouldChunk}
          size="small"
        />
        <br />
        <Button
          className='me-auto'
          style={{ float: "left" }}
          variant='text'
          size='small'
          onClick={this.props.startReordering}
        >
          {this.props.isDragging ? 'Done' : 'Reorder'}
        </Button>
        <br />
        <Card variant='outlined' style={{ float: "right", width: this.props.width, height: this.props.height, overflowY: 'scroll' }}>
          <DragDropContext onDragEnd={this.onDragEnd} direction='vertical'>
            <Droppable droppableId='effects-zone'>
              {(provided, snapshot) => (
                <Accordion
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  activeKey={this.props.isDragging ? [] : this.props.activeEffects}
                  alwaysOpen
                >
                  {this.props.metadatas.map((metadata, idx) =>
                    <Draggable
                      key={metadata.id}
                      draggableId={metadata.id.toString()}
                      index={idx}
                      isDragDisabled={!this.props.isDragging}
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
                            isDragging={this.props.isDragging}
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
        </Card>
      </div>
    );
  }
}

export default EffectEditorZone;