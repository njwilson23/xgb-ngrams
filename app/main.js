
import {featureGain} from './interactions.js';

document.getElementById("scanButton").addEventListener("click", function(event) {
    var outputArea = document.getElementById("result");
    var inputArea = document.getElementById("input");
    var degree = Number(document.getElementById("degControl").value);

    // Get text area content
    var trees = JSON.parse(inputArea.value);
    // Search for interactions
    var imp = featureGain(trees, degree);
    // Update result content
    var s = "";
    for (var i = 0; i != imp.length; i++) {
        s = s + "<p>" + imp[i].name + "\t" + imp[i].sum + "</p>"
    }
    outputArea.innerHTML = s;

})
