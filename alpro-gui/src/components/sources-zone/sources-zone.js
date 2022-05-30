import { Card, CardContent, CardMedia, ImageList, ImageListItem, List, Typography } from "@mui/material";
import { Component } from "react";

class SourcesZone extends Component {

  constructor(props) {
    super(props);
  }

  setSource = (source) => () => {
    this.props.setSource(source);
  }

  render() {
    return (
      <div>
        <strong className="me-auto" style={{ float: "left" }}>Files</strong><br />
        <Card variant='outlined' style={{ width: window.innerWidth / 5, height: 512, overflowY: "scroll" }}>
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