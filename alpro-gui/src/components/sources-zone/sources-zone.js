import { Card, CardContent, CardMedia } from "@mui/material";
import { Component } from "react";

class SourcesZone extends Component {

  setSource = (source) => () => {
    this.props.setSource(source);
  }

  render() {
    return (
      <div style={{ marginLeft: 10 }}>
        <strong className="me-auto" style={{ float: "left" }}>Files</strong><br />
        <br />
        <Card variant='outlined' style={{ float: 'left', width: this.props.width, height: this.props.height, overflowY: "scroll" }}>
          {
            this.props.sources.map((source, idx) =>
              <Card key={idx} sx={{ maxWidth: 100, maxHeight: 150, margin: 1, float: 'left', cursor: "pointer" }} onClick={this.setSource(source)}>
                <CardMedia
                  width="100"
                  height="100"
                  component={source.type}
                  src={source.data}
                />
                <CardContent>
                  <small>{source.name}</small>
                </CardContent>
              </ Card>
            )
          }
        </Card >
      </div>
    );
  }
}

export default SourcesZone;