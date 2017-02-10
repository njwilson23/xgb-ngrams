
import React from 'react';
import ReactDOM from 'react-dom';
import {featureGain} from './interactions.js';

function Button(props) {
  return (
      <button onClick={() => { console.log("here"); }}>Scan tree</button>
  );
}


class Output extends React.Component {
  constructor() {
    super();
    this.state = {
      items: [{
        features: "Nothing",
        value: 0.0
      }]
    }
  }
  handleClick() {
    console.log("click registered")
    let inputArea = document.getElementById("input");
    let trees = JSON.parse(inputArea.value);
    // Search for interactions
    let imp = featureGain(trees, degree);
    this.state.items = [];
    for (let i = 0; i != imp.length; i++) {
      this.state.items.push({
        features: imp[i].name,
        value: imp[i].sum
      });
    }
  }
  render() {
    const items = this.state.items;
    const listItems = items.map((item, i) => {
      return <li key={i}>{item.features} <strong>{item.value}</strong></li>;
    })
    return (
        <div className="output">
          <Button
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

document.getElementById("scanButton").addEventListener("click", function(event) {
    const outputArea = document.getElementById("result");
    const inputArea = document.getElementById("input");
    const degree = Number(document.getElementById("degControl").value);

    // Get text area content
    const trees = JSON.parse(inputArea.value);
    // Search for interactions
    const imp = featureGain(trees, degree);
    // Update result content
    let s = "";
    for (let i = 0; i != imp.length; i++) {
        s = s + "<p>" + imp[i].name + "\t" + imp[i].sum + "</p>"
    }
    outputArea.innerHTML = s;
})
