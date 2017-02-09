/* Walk through a tree in a depth-first fashion, applying a callback functin
   at every non-leaf node */
function scanTree(ns, cb, maxDepth) {
    if (typeof(maxDepth) === 'undefined') {
        maxDepth = -1;
    }
    for (var i = 0; i != ns.length && i != maxDepth; i++) {
        var n = ns[i];
        if (n.children) {
            cb(n);
            scanTree(n.children, cb, maxDepth - 1);
        }
    }
}

function splitString(s, by) {
  if (typeof(by) === 'undefined') {
    by = ' ';
  }
  var out = new Array();
  var i = s.indexOf(by);
  if (i == -1) {
    out.push(s);
  } else {
    out.push(s.slice(0, i));
    out.push.apply(out, splitString(s.slice(i + 1, s.length), by));
  }
  return out;
}

/* Search down *maxDepth* deep fragments of the tree from the current node, and
   return a list of objects '{features: <list>, count: <number>, gain: <number>}'
   representing all feature combinations. */
function accumulateSplits(n, maxDepth) {
    if (typeof(maxDepth) === 'undefined') { maxDepth = 0; } 
    if (typeof(n.split) === 'undefined') {
        return [{features: "", count: 0, gain: 0.0}];
    }
    if (maxDepth === 0) {
        return [{features: n.split, count: 1, gain: n.gain}];
    }

    var results = new Array();
    var subResults, feats;
    var currentFeatures = new Array();

    for (var i = 0; i != n.children.length; i++) {
        subResults = accumulateSplits(n.children[i], maxDepth - 1)
        for (var j = 0; j != subResults.length; j++) {
            feats = splitString(subResults[j].features)
              .filter(function(a) { return a !== "" });
            feats.push(n.split);
            feats.sort();
            results.push( {features: feats.reduce(function(a, b) { return a + "×" + b; }),
                           count: 1 + subResults[j].count,
                           gain: n.gain + subResults[j].gain} );
        }
    }
    return results;
}

/* Compute the arithmetic mean of an array */
function mean(a) {
    return(a.reduce(function(u, v) { return u+v }) / a.length);
}

/* Computes the mean gain associated with splitting on each feature
   and returns an array of {FEATURENAME: GAIN} objects */
function featureGain(trees, degree) {
    var features = new Map();
    scanTree(trees, function(n) {

        /* creates a list of objects with a 'features' member (array
           of length degree) and a 'gain' member (number) */
        var featSets = accumulateSplits(n, degree);
        console.log(featSets);
        var fs;
        for (var i = 0; i != featSets.length; i++) {
            fs = featSets[i];
            if (fs.count == degree + 1) {
                if (features.has(fs.features)) {
                    features.get(fs.features).push(fs.gain);
                } else {
                    features.set(fs.features, [fs.gain]);
                }
            }
        }
    });

    var featureList = new Array();
    features.forEach(function(v, k, m) {
        featureList.push({name: k,
                          mean: mean(v),
                          sum: v.reduce(function(a, b) { return a+b; })});
    });

    featureList.sort(function(a, b) {
        return b.sum - a.sum;
    })
    return featureList;
}

// tests
if (true) {

  // splitString
  console.log(splitString("split|some|joined|words", "|"));


  var jsonStrings = ['{"nodeid":0,"depth":0,"split":"odor=pungent","yes":2,"no":1,"gain":4000.53,"cover":1628.25,"children":[\n{"nodeid":1,"depth":1,"split":"stalk-root=cup","yes":4,"no":3,"gain":1158.21,"cover":924.5,"children":[\n{"nodeid":3,"depth":2,"split":"stalk-root=missing","yes":8,"no":7,"gain":568.216,"cover":812,"children":[\n{"nodeid":7,"depth":3,"split":"odor=anise","yes":14,"no":13,"gain":142.804,"cover":772.5,"children":[\n{"nodeid":13,"leaf":0.390052,"cover":763},\n{"nodeid":14,"leaf":-0.361905,"cover":9.5}\n]},\n{"nodeid":8,"leaf":-0.390123,"cover":39.5}\n]},\n{"nodeid":4,"depth":2,"split":"bruises?=no","yes":10,"no":9,"gain":114.297,"cover":112.5,"children":[\n{"nodeid":9,"leaf":0.355556,"cover":8},\n{"nodeid":10,"leaf":-0.396209,"cover":104.5}\n]}\n]},\n{"nodeid":2,"depth":1,"split":"spore-print-color=orange","yes":6,"no":5,"gain":198.174,"cover":703.75,"children":[\n{"nodeid":5,"depth":2,"split":"stalk-surface-below-ring=silky","yes":12,"no":11,"gain":86.3968,"cover":690.5,"children":[\n{"nodeid":11,"depth":3,"split":"cap-surface=scaly","yes":16,"no":15,"gain":13.906,"cover":679.75,"children":[\n{"nodeid":15,"leaf":-0.398235,"cover":678.75},\n{"nodeid":16,"leaf":0.2,"cover":1}\n]},\n{"nodeid":12,"depth":3,"split":"gill-size=narrow","yes":18,"no":17,"gain":28.7763,"cover":10.75,"children":[\n{"nodeid":17,"leaf":0.354286,"cover":7.75},\n{"nodeid":18,"leaf":-0.3,"cover":3}\n]}\n]},\n{"nodeid":6,"leaf":0.37193,"cover":13.25}\n]}\n]}',
'{"nodeid":0,"depth":0,"split":"odor=pungent","yes":2,"no":1,"gain":2676.43,"cover":1566.96,"children":[\n{"nodeid":1,"depth":1,"split":"stalk-root=cup","yes":4,"no":3,"gain":774.602,"cover":890.186,"children":[\n{"nodeid":3,"depth":2,"split":"stalk-root=missing","yes":8,"no":7,"gain":382.255,"cover":781.929,"children":[\n{"nodeid":7,"depth":3,"split":"odor=creosote","yes":14,"no":13,"gain":139.162,"cover":743.895,"children":[\n{"nodeid":13,"leaf":0.326522,"cover":735.229},\n{"nodeid":14,"leaf":-0.44416,"cover":8.66618}\n]},\n{"nodeid":8,"leaf":-0.326802,"cover":38.0344}\n]},\n{"nodeid":4,"depth":2,"split":"bruises?=no","yes":10,"no":9,"gain":78.6121,"cover":108.256,"children":[\n{"nodeid":9,"leaf":0.301292,"cover":7.75239},\n{"nodeid":10,"leaf":-0.331277,"cover":100.504}\n]}\n]},\n{"nodeid":2,"depth":1,"split":"spore-print-color=orange","yes":6,"no":5,"gain":134.913,"cover":676.772,"children":[\n{"nodeid":5,"depth":2,"split":"stalk-surface-below-ring=silky","yes":12,"no":11,"gain":58.3541,"cover":663.97,"children":[\n{"nodeid":11,"leaf":-0.331512,"cover":653.525},\n{"nodeid":12,"depth":3,"split":"gill-size=narrow","yes":16,"no":15,"gain":20.6782,"cover":10.4453,"children":[\n{"nodeid":15,"leaf":0.300351,"cover":7.51181},\n{"nodeid":16,"leaf":-0.259651,"cover":2.9335}\n]}\n]},\n{"nodeid":6,"leaf":0.3134,"cover":12.8021}\n]}\n]}'];

  var trees = jsonStrings.map(JSON.parse);
  console.log(trees);

  var imp = featureGain(trees, 1)
  console.log(imp);
}
