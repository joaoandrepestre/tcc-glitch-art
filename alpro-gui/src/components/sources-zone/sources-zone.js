import { Card, CardContent, CardMedia } from "@mui/material";
import { Component } from "react";
import { getFilesFromIndex } from "../../utils/file-utils";

class SourcesZone extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
    };
  }

  setSource = (source) => () => {
    this.props.setSource(source);
  }

  getFiles = () => {
    const srcs = Object.values(this.props.sources);
    const hashes = srcs.map(src => src.hash);
    if (hashes.length === 0) return;
    getFilesFromIndex(hashes)
      .then(values => {
        const sources = [];
        values.forEach((value, i) => {
          sources.push({
            ...srcs[i],
            data: value,
          });
        });
        this.setState({
          sources,
        });
      });
  }

  render() {
    this.getFiles();
    const sources = Object.values(this.props.sources);
    return (
      <div style={{ marginLeft: 10 }}>
        <strong className="me-auto" style={{ float: "left" }}>Files</strong><br />
        <br />
        <Card variant='outlined' style={{ float: 'left', width: this.props.width, height: this.props.height, overflowY: "scroll" }}>
          {
            sources.map((source, idx) =>
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