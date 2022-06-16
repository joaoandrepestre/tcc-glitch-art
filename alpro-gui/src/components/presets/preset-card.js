import { AutoFixHigh, Queue } from "@mui/icons-material";
import { Button, ButtonGroup, Card, CardContent, CardMedia } from "@mui/material";
import { Component } from "react";

class PresetCard extends Component {
  render() {
    const { preset } = this.props;
    return (
      <Card
        sx={{
          minWidth: 100,
          height: 175,
          margin: 1,
          float: "left",
          cursor: this.props.disabled ? "not-allowed" : "pointer"
        }}
        onClick={this.props.loadPreset}
      >
        <CardMedia
          width="100"
          height="100"
          component="img"
          src={preset.preview}
        />
        <CardContent>
          <div style={{ display: 'flex', alignContent: 'center', flexDirection: 'column' }}>
            <small>{preset.name}</small>
            <ButtonGroup
              color='info'
              variant="contained"
              size='small'
              disableElevation
              disabled={this.props.disabled}
              sx={{ maxWidth: 50, maxHeight: 25, marginBottom: 1, marginLeft: -0.5 }}
            >
              <Button>
                <AutoFixHigh onClickCapture={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  this.props.loadPreset();
                }} />
              </Button>
              <Button>
                <Queue onClickCapture={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  this.props.appendPreset();
                }} />
              </Button>
            </ButtonGroup>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default PresetCard;