import { Add, Upload } from "@mui/icons-material";
import { Button, ButtonGroup, Card, CardContent, CardMedia } from "@mui/material";
import { Component } from "react";

class PresetCard extends Component {
  render() {
    const { preset } = this.props;
    return (
      <Card sx={{ minWidth: 100, height: 175, margin: 1, float: "left", cursor: "pointer" }} onClick={this.props.loadPreset}>
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
              sx={{ maxWidth: 50, maxHeight: 25, marginBottom: 1, marginLeft: -0.5 }}
            >
              <Button>
                <Upload onClickCapture={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  this.props.loadPreset();
                }} />
              </Button>
              <Button>
                <Add onClickCapture={(e) => {
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