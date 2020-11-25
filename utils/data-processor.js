const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const argsList = process.argv.slice(2);
const relativePath = path.join(__dirname, '..', argsList[0]);
const fileContent = fs.readFileSync(relativePath, 'utf8');

const data = JSON.parse(fileContent);
const gestures = Object.keys(data);
const getLabel = (keyIndex) => Array.from({length: gestures.length}, (_, i) => i === keyIndex ? 1 : 0);

const processedSeries = gestures
  .map((key, keyIndex) => data[key]
    .map(coordinatesSeries => [
      getLabel(keyIndex),
      coordinatesSeries
        .map(data => data
          .map(coordinates => [coordinates[0], coordinates[1]])
          .reduce((acc, curr) => [...acc, ...curr], [])
        )
    ]),
  )
  .reduce((acc, curr) => [...acc, ...curr], [])

const inputs = processedSeries.map(data => data[1])
const outputs = processedSeries.map(data => data[0])
const numOfClasses = outputs[0].length;
const inputShape = [inputs[0].length, inputs[0][0].length];

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
    const rnnOutputNeurons = 20;

    const model = tf.sequential();

    model.add(tf.layers.lstm({units: rnnOutputNeurons, inputShape: inputLayerShape}));
    model.add(tf.layers.dense({units: numOfClasses, kernelInitializer: 'varianceScaling', useBias: false, activation: 'softmax'}));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy'
    });

    model.summary();

    const { dataSeries, labelSeries } = this.prepareLabeledData(inputs, outputs, inputLayerShape);

    const history = await model.fit(
      dataSeries,
      labelSeries,
      {
        batchSize,
        epochs,
        callbacks: {
          onEpochEnd: async (epoch, log) => onEpochEnd(epoch, log),
        }
      }
    );

    const result = model.predict(tf.tensor3d([inputs[0]], [1, ...inputLayerShape]).div(640));
    const predictedClass = result.as1D().argMax();
    const data = await predictedClass.data();

    result.print();
    result.as1D().print();
    result.as1D().argMax().print();

    return { model, history };
  }

  prepareLabeledData(inputs, outputs, inputLayerShape) {
    console.log([inputs.length, ...inputLayerShape])
    console.log([outputs.length, outputs[0].length])
    const dataSeries = tf.tensor3d(inputs, [inputs.length, ...inputLayerShape]).div(640);
    const labelSeries = tf.tensor2d(outputs, [outputs.length, outputs[0].length]);

    return { dataSeries, labelSeries };
  }
}

async function trainAndExport() {
  const trainer = new GestureTrainer();
  const { model } = await trainer.trainModel(inputs, outputs, numOfClasses, inputShape, 20, 100, 100, 0.1, (epoch, log) => console.log(epoch, log));
  // const modelJson = model.toJSON();
  const relativeModelPath = path.join(__dirname, '..', 'trained-model.json');
  // fs.writeFileSync(relativeModelPath, JSON.stringify(modelJson));
  await model.save(`file://${relativeModelPath}`);
  // await model.save(`file://./model-1a`);
}

trainAndExport();
