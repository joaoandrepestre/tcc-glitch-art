import { Card, CardContent, CardMedia } from "@mui/material";
import { Component } from "react";

class PresetCard extends Component {
  render() {
    const { preset } = this.props;
    return (
      <Card sx={{ minWidth: 100, height: 150, margin: 1, float: "left", cursor: "pointer" }} onClick={this.props.loadPreset}>
        <CardMedia
          width="100"
          height="100"
          component="img"
          src={preset.preview}
        />
        <CardContent>
          <small>{preset.name}</small>
        </CardContent>
      </Card>
    );
  }
}

export default PresetCard;