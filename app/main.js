
import React from 'react';
import ReactDOM from 'react-dom';
import {featureGain} from './interactions.js';

function Button(props) {
  return (
      <button onClick={() => props.onClick()}>{props.value}</button>
  );
}

function DegreeForm(props) {
  return (
        <input type="number"
          value={props.value}
          min="0"
          max="4"
          onChange={props.handleChange}
        />
  );
}

class Output extends React.Component {
  constructor() {
    super();
    this.state = {
      degree: 0,
      items: [{
        features: "Nothing",
        value: 0.0
      }]
    }
  }

  handleDegreeChange(ev) {
    this.setState({degree: Number(ev.target.value)});
  }

  handleClick() {
    const inputArea = document.getElementById("input");
    let trees = null;
    let ngrams = [];
    this.setState({items: ngrams})

    // Retrieve trees as JSON
    try {
      trees = JSON.parse(inputArea.value);
    } catch (e) {
      ngrams.push({features: "parse error", value: -1.0});
    } finally {
      this.setState(ngrams);
    }

    // Search for interactions
    if (trees != null) {
      let imp = featureGain(trees, this.state.degree);
      let ngrams = [];
      for (let i = 0; i != imp.length; i++) {
        ngrams.push({ features: imp[i].name, value: imp[i].sum });
      }
      this.setState({items: ngrams});
    }
  }

  render() {
    const items = this.state.items;
    const listItems = items.map((item, i) => {
      return <li key={i}>{item.features} <strong>{item.value}</strong></li>;
    })
    return (
        <div className="output">
          <DegreeForm
            value={this.state.degree}
            handleChange={(i) => this.handleDegreeChange(i)}
          />

          <Button
            value="Scan tree"
            id="scanButton"
            onClick={(i) => this.handleClick(i)}
          />

          <ol>
            {listItems}
          </ol>
        </div>
    );
  }
}

ReactDOM.render(
  <Output />,
  document.getElementById("result")
)

