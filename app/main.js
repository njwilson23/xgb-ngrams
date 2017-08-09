
import React from 'react';
import ReactDOM from 'react-dom';
import {featureGain, splitString} from './interactions.js';

function Button(props) {
  return (
      <div style={props.style}
        className={"button " + props.className}
        id={props.id}
        onClick={props.onClick}>{props.value}</div>
  );
}

function DegreeForm(props) {
  return (
      <div style={{width: "100%", clear: "both"}}>
        <div className="button" style={{width: "40%", float: "left", borderTopLeftRadius: "5px"}}>
          {props.value}
        </div>
        <Button
          style={{width: "30%", float: "left"}}
          className="clickable"
          onClick={props.incDown}
          value="&#x25BC;"
        />
        <Button
          style={{width: "30%", float: "left"}}
          className="clickable"
          onClick={props.incUp}
          value="&#x25B2;"
        />
      </div>
  );
}

function InputForm(props) {
  return (
      <textarea autoComplete="off"
        id="input"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onChange={props.onChange}
        onKeyUp={props.onKeyUp}
        value={props.value}
        cols="80" />
  );
}

function UploadForm(props) {
  return (
    <div>
      <input type="file"
        id="fileUploader"
        onChange={props.onChange}
      />
      <Button
        className="clickable"
        style={{borderTopLeftRadius: "5px", borderTopRightRadius: "5px"}}
        onClick={props.onClick}
        value="Upload saved trees (JSON)"
      />
    </div>
  );
}

function ResultRow(props) {
  const features = splitString(props.features, "×")
    .map((s, i) => { return <p key={i}>{s}</p> });
  const colorMixin = (props.even === true) ? "evenColor" : "oddColor";
  return (
      <div className={"resultItem " + colorMixin}>
        <div className="resultFeatures">{features}</div>
        <div className="resultValue">{Math.round(props.value*10000)/10000}</div>
        <div className="clear"></div>
      </div>
  );
}

function HelpBlurb(props) {
  return(
      <div className={props.className}>
        <p>The 'importance' of a predictor in a decision tree can be approximated by the mean relative gain attained whenever that predictor is used to split a node. One might generalize this to sequences of features on order to better understand a dataset and infer interactions between predictors.</p>
        <ol>
          <li>Enter a JSON array of decision trees or upload a file</li>
          <li>Set the degree of the feature interactions (0 is equivalent to no interactions)</li>
          <li>Click <em>"Scan tree"</em> to see the computed feature imporatnces</li>
        </ol>
      </div>
  );
}

class Application extends React.Component {
  constructor() {
    super();
    this.state = {
      inputFile: "",
      inputText: DEFAULT_TREE,
      degree: 1,
      items: [{
        features: "Nothing",
        value: 0.0
      }],
      helpLabel: "Explanation \u25BC",
      helpClass: "helpInactive"
    }
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleDegreeChange = this.handleDegreeChange.bind(this);
    this.handleScanClick = this.handleScanClick.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
  }

  handleFileUpload(event) {
    const uploader = event.target;
    const objectURL = window.URL.createObjectURL(uploader.files[0]);
    const that = this;

    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          that.setState({inputText: request.responseText});
        } else {
          console.log("error: request status:", request.status);
        }
      }
    }
    request.open("GET", objectURL);
    request.send();
  }

  handleDegreeChange(increase) {
    const originalDegree = this.state.degree;
    if (increase == true) {
      this.setState({degree: Math.min(4, originalDegree + 1)});
    } else if (increase == false) {
      this.setState({degree: Math.max(0, originalDegree - 1)});
    }
  }

  handleScanClick() {
    let trees = null;
    let ngrams = [];
    this.setState({items: ngrams})

    // Retrieve trees as JSON
    try {
      trees = JSON.parse(this.state.inputText);
    } catch (e) {
      ngrams.push({features: "parse error", value: -1.0});
    } finally {
      this.setState(ngrams);
    }

    // Search for interactions
    if (trees != null) {
      const imp = featureGain(trees, this.state.degree);
      const total = imp
        .map((a) => { return a.sum; })
        .reduce((a, b) => { return a+b; });
      let ngrams = [];
      for (let i = 0; i != imp.length; i++) {
        ngrams.push({ features: imp[i].name, value: imp[i].sum/total });
      }
      this.setState({items: ngrams});
    }
  }

  toggleHelp() {
    if (this.state.helpClass == "helpInactive") {
      this.setState({helpClass: "helpActive"});
      this.setState({helpLabel: "Explanation \u25B2"});
    } else {
      this.setState({helpClass: "helpInactive"});
      this.setState({helpLabel: "Explanation \u25BC"});
    }
  }

  render() {
    const resultRows = this.state.items.map((item, i) => {
      return <ResultRow key={i} even={(i%2)!=0} features={item.features} value={item.value} />;
    })
    return (
        <div id="appContainer">
          <Button className="clickable" id="helpButton" value={this.state.helpLabel} onClick={this.toggleHelp} />
          <HelpBlurb className={this.state.helpClass} />
          <div className="clear"/>

          <div className="inputGroup">
            <UploadForm
              onChange={(files) => this.handleFileUpload(files)}
              onClick={() => { document.getElementById("fileUploader").click(); }}
            />

            <InputForm
              value={this.state.inputText}
              onChange={(event) => { this.setState({inputText: event.target.value}); }}
            />
          </div>

          <div className="outputGroup">
            <div style={{width: "30%", float: "left"}}>
              <DegreeForm
                value={this.state.degree}
                incUp={() => this.handleDegreeChange(true)}
                incDown={() => this.handleDegreeChange(false)}
              />
            </div>

            <div style={{width: "70%", float: "right"}}>
              <Button
                style={{borderTopRightRadius: "5px"}}
                value="Scan tree"
                id="scanButton"
                className="clickable"
                onClick={this.handleScanClick}
              />
            </div>

            <div className="clear">
              {resultRows}
            </div>
          </div>
        </div>
    );
  }
}


const DEFAULT_TREE = `[  { "nodeid": 0, "depth": 0, "split": "odor=pungent", "yes": 2, "no": 1, "gain": 4000.53, "cover": 1628.25, "children": [
    { "nodeid": 1, "depth": 1, "split": "stalk-root=cup", "yes": 4, "no": 3, "gain": 1158.21, "cover": 924.5, "children": [
      { "nodeid": 3, "depth": 2, "split": "stalk-root=missing", "yes": 8, "no": 7, "gain": 568.216, "cover": 812, "children": [
        { "nodeid": 7, "depth": 3, "split": "odor=anise", "yes": 14, "no": 13, "gain": 142.804, "cover": 772.5, "children": [
          { "nodeid": 13, "leaf": 0.390052, "cover": 763 },
          { "nodeid": 14, "leaf": -0.361905, "cover": 9.5 }
        ]},
        { "nodeid": 8, "leaf": -0.390123, "cover": 39.5 }
      ]},
      { "nodeid": 4, "depth": 2, "split": "bruises?=no", "yes": 10, "no": 9, "gain": 114.297, "cover": 112.5, "children": [
        { "nodeid": 9, "leaf": 0.355556, "cover": 8 },
        { "nodeid": 10, "leaf": -0.396209, "cover": 104.5 }
      ]}
    ]},
    { "nodeid": 2, "depth": 1, "split": "spore-print-color=orange", "yes": 6, "no": 5, "gain": 198.174, "cover": 703.75, "children": [
      { "nodeid": 5, "depth": 2, "split": "stalk-surface-below-ring=silky", "yes": 12, "no": 11, "gain": 86.3968, "cover": 690.5, "children": [
        { "nodeid": 11, "depth": 3, "split": "cap-surface=scaly", "yes": 16, "no": 15, "gain": 13.906, "cover": 679.75, "children": [
          { "nodeid": 15, "leaf": -0.398235, "cover": 678.75 },
          { "nodeid": 16, "leaf": 0.2, "cover": 1 }
        ]},
        { "nodeid": 12, "depth": 3, "split": "gill-size=narrow", "yes": 18, "no": 17, "gain": 28.7763, "cover": 10.75, "children": [
          { "nodeid": 17, "leaf": 0.354286, "cover": 7.75 },
          { "nodeid": 18, "leaf": -0.3, "cover": 3 }
        ]}
      ]},
      { "nodeid": 6, "leaf": 0.37193, "cover": 13.25 }
    ]}
  ]},
  { "nodeid": 0, "depth": 0, "split": "odor=pungent", "yes": 2, "no": 1, "gain": 2676.43, "cover": 1566.96, "children": [
    { "nodeid": 1, "depth": 1, "split": "stalk-root=cup", "yes": 4, "no": 3, "gain": 774.602, "cover": 890.186, "children": [
      { "nodeid": 3, "depth": 2, "split": "stalk-root=missing", "yes": 8, "no": 7, "gain": 382.255, "cover": 781.929, "children": [
        { "nodeid": 7, "depth": 3, "split": "odor=creosote", "yes": 14, "no": 13, "gain": 139.162, "cover": 743.895, "children": [
          { "nodeid": 13, "leaf": 0.326522, "cover": 735.229 },
          { "nodeid": 14, "leaf": -0.44416, "cover": 8.66618 }
        ]},
        { "nodeid": 8, "leaf": -0.326802, "cover": 38.0344 }
      ]},
      { "nodeid": 4, "depth": 2, "split": "bruises?=no", "yes": 10, "no": 9, "gain": 78.6121, "cover": 108.256, "children": [
        { "nodeid": 9, "leaf": 0.301292, "cover": 7.75239 },
        { "nodeid": 10, "leaf": -0.331277, "cover": 100.504 }
      ]}
    ]},
    { "nodeid": 2, "depth": 1, "split": "spore-print-color=orange", "yes": 6, "no": 5, "gain": 134.913, "cover": 676.772, "children": [
      { "nodeid": 5, "depth": 2, "split": "stalk-surface-below-ring=silky", "yes": 12, "no": 11, "gain": 58.3541, "cover": 663.97, "children": [
        { "nodeid": 11, "leaf": -0.331512, "cover": 653.525 },
        { "nodeid": 12, "depth": 3, "split": "gill-size=narrow", "yes": 16, "no": 15, "gain": 20.6782, "cover": 10.4453, "children": [
          { "nodeid": 15, "leaf": 0.300351, "cover": 7.51181 },
          { "nodeid": 16, "leaf": -0.259651, "cover": 2.9335 }
        ]}
      ]},
      { "nodeid": 6, "leaf": 0.3134, "cover": 12.8021 }
    ]}
  ]},
  { "nodeid": 0, "depth": 0, "split": "odor=pungent", "yes": 2, "no": 1, "gain": 1907.21, "cover": 1435.65, "children": [
    { "nodeid": 1, "depth": 1, "split": "bruises?=no", "yes": 4, "no": 3, "gain": 567.82, "cover": 817.251, "children": [
      { "nodeid": 3, "leaf": 0.297244, "cover": 576.882 },
      { "nodeid": 4, "depth": 2, "split": "odor=musty", "yes": 8, "no": 7, "gain": 216.334, "cover": 240.369, "children": [
        { "nodeid": 7, "depth": 3, "split": "odor=spicy", "yes": 12, "no": 11, "gain": 306.091, "cover": 189.001, "children": [
          { "nodeid": 11, "leaf": -0.30682, "cover": 145.128 },
          { "nodeid": 12, "leaf": 0.291051, "cover": 43.8729 }
        ]},
        { "nodeid": 8, "leaf": 0.292, "cover": 51.3688 }
      ]}
    ]},
    { "nodeid": 2, "depth": 1, "split": "spore-print-color=orange", "yes": 6, "no": 5, "gain": 97.8275, "cover": 618.397, "children": [
      { "nodeid": 5, "depth": 2, "split": "stalk-surface-below-ring=silky", "yes": 10, "no": 9, "gain": 42.2027, "cover": 606.589, "children": [
        { "nodeid": 9, "depth": 3, "split": "gill-size=narrow", "yes": 14, "no": 13, "gain": 0.0502269, "cover": 596.837, "children": [
          { "nodeid": 13, "leaf": -0.244013, "cover": 33.6956 },
          { "nodeid": 14, "leaf": -0.295881, "cover": 563.141 }
        ]},
        { "nodeid": 10, "depth": 3, "split": "gill-size=narrow", "yes": 16, "no": 15, "gain": 15.5127, "cover": 9.75241, "children": [
          { "nodeid": 15, "leaf": 0.265819, "cover": 6.97558 },
          { "nodeid": 16, "leaf": -0.231069, "cover": 2.77683 }
        ]}
      ]},
      { "nodeid": 6, "leaf": 0.277301, "cover": 11.8083 }
    ]}
  ]}]`;

ReactDOM.render(
  <Application />,
  document.getElementById("app")
)

