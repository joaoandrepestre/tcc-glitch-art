import { Box, Button, Card, Divider } from "@mui/material";
import { Component } from "react";
import Preset from "../../models/preset";
import PresetCard from "./preset-card";

class PresetsZone extends Component {

  loadPreset = (preset) => () => {
    this.props.loadPreset(preset);
  }

  loadRandomPreset = () => {
    let preset = this.props.createRandomPreset();
    this.props.loadPreset(preset);
  }

  render() {
    return (
      <div>
        <strong className="me-auto" style={{ float: "left" }}>Presets</strong><br />
        <Button
          className='me-auto'
          style={{ float: "left" }}
          variant='text'
          size='small'
          onClick={this.props.savePreset}
        >
          Save preset
        </Button><br />
        <Card
          variant='outlined'
          style={{ float: "left", width: this.props.width, height: this.props.height, overflowX: "scroll" }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: 'background.paper',
              color: 'text.secondary',
              '& svg': {
                m: 1.5,
              },
              '& hr': {
                mx: 0.5,
              },
            }}
          >
            <PresetCard
              preset={new Preset('Random', [], require('../../static/presets/random.png'))}
              loadPreset={this.loadRandomPreset}
            />
            {this.props.userPresets.length > 0 &&
              <Divider orientation="vertical" flexItem />
            }
            {
              this.props.userPresets.map((preset, idx) =>
                <PresetCard
                  key={idx}
                  preset={preset}
                  loadPreset={this.loadPreset(preset)}
                />
              )
            }
            <Divider orientation="vertical" flexItem />
            {
              this.props.presets.map((preset, idx) =>
                <PresetCard
                  key={idx}
                  preset={preset}
                  loadPreset={this.loadPreset(preset)}
                />
              )
            }
          </Box>
        </Card>
      </div>
    );
  }
}

export default PresetsZone;