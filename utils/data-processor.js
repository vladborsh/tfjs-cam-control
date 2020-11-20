const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');


const argsList = process.argv.slice(2);
const relativePath = path.join(__dirname, '..', argsList[0]);
const fileContent = fs.readFileSync(relativePath, 'utf8');

const data = JSON.parse(fileContent);
const gestures = Object.keys(data);
const getLabel = (keyIndex) => Array.from({length: gestures.length}, (_, i) => i === keyIndex ? 1 : 0);

const processed = gestures
  .map((key, keyIndex) => data[key]
    .map(coordinatesSeries => [
      getLabel(keyIndex),
      coordinatesSeries
        .reduce((acc, curr) => [...acc, ...curr], [])
        .map(coordinates => [coordinates[0], coordinates[1]])
        .reduce((acc, curr) => [...acc, ...curr], [])
    ]),
  )
  .reduce((acc, curr) => [...acc, ...curr], []);

const inputs = processed.map(data => data[1])
const outputs = processed.map(data => data[0])
const numOfClasses = outputs[0].length;
const inputShape = inputs[0].length;

console.log(processed[0]);

console.log(data['idle'][0]);

// console.log(inputs[0]);
// console.log(outputs[0]);
console.log(inputs.length);
console.log(outputs.length);
console.log(inputs[0].length);
console.log(outputs[0].length);


class GestureTrainer {
  async trainModel(
    inputs,
    outputs,
    numOfClasses,
    inputLayerShape,
    layersNumber,
    epochs,
    batchSize,
    learningRate,
    onEpochEnd
  ) {
    const inputLayerNeurons = 100;
    const rnnInputShape  = [10, inputLayerNeurons / 10];
    const rnnOutputNeurons = 20;

    const model = tf.sequential();

    model.add(tf.layers.dense({units: inputLayerNeurons, inputShape: [inputLayerShape]}));
    model.add(tf.layers.reshape({targetShape: rnnInputShape}));
    model.add(tf.layers.rnn({
      cell: Array.from({length: layersNumber}, () => tf.layers.lstmCell({units: rnnOutputNeurons})),
      inputShape: rnnInputShape,
      returnSequences: false
    }));
    model.add(tf.layers.dense({units: numOfClasses, kernelInitializer: 'varianceScaling', useBias: false, activation: 'softmax'}));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError'
    });

    const { dataSeries, labelSeries } = this.prepareLabeledData(inputs, outputs);

    const history = await model.fit(
      dataSeries,
      labelSeries,
      { batchSize, epochs, callbacks: {
        onEpochEnd: async (epoch, log) => onEpochEnd(epoch, log),
      }
    });

    return { model, history };
  }

  prepareLabeledData(inputs, outputs) {
    const dataSeries = tf.tensor2d(inputs, [inputs.length, inputs[0].length]).div(tf.scalar(10));
    const labelSeries = tf.tensor2d(outputs, [outputs.length, outputs[0].length]).div(tf.scalar(10));

    return { dataSeries, labelSeries };
  }
}

const trainer = new GestureTrainer();

// trainer.trainModel(inputs, outputs, numOfClasses, inputShape, 20, 100, 100, 0.1, (epoch, log) => console.log(epoch, log));


/**

now:

y: [ [0,1], [0,1] ... [1, 0], [1, 0] ]
x: [ [..840..], [..840..], [..840..], [..840..] ]



after:

y: [ [0,1], [0,1], [0,1], ]
x: [ [..42..], [..42..], [..42..], ]

 */
