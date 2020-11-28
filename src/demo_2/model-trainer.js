import * as tf from '@tensorflow/tfjs';

export class ModelTrainer {
  constructor() {
    this.epochs = 100;
    this.learningRate = 0.01;
    this.rnnOutputNeurons = 20;
  }

  async train(data, onEpochEnd) {
    const { inputs, outputs, numOfClasses, inputShape } = this.processData(data);
    this.inputShape = inputShape;

    return this.trainModel(
      inputs,
      outputs,
      numOfClasses,
      this.inputShape,
      this.rnnOutputNeurons,
      this.epochs,
      this.learningRate,
      onEpochEnd,
    );
  }

  processData(data) {
    const gestures = Object.keys(data);
    const oneHot = (keyIndex) => Array.from({length: gestures.length}, (_, i) => i === keyIndex ? 1 : 0);

    const processedSeries = gestures
      .map((key, keyIndex) => data[key]
        .map(coordinatesSeries => [
          oneHot(keyIndex),
          coordinatesSeries
            .map(data => data
              .map(coordinates => [coordinates[0], coordinates[1]])
              .reduce((acc, curr) => [...acc, ...curr], [])
            )
        ]),
      )
      .reduce((acc, curr) => [...acc, ...curr], []);

    const inputs = processedSeries.map(data => data[1])
    const outputs = processedSeries.map(data => data[0])
    const numOfClasses = outputs[0].length;
    const inputShape = [inputs[0].length, inputs[0][0].length];

    return { inputs, outputs, numOfClasses, inputShape };
  }

  async trainModel(
    inputs,
    outputs,
    numOfClasses,
    inputLayerShape,
    rnnOutputNeurons,
    epochs,
    learningRate,
    onEpochEnd
  ) {
    const model = tf.sequential();

    model.add(tf.layers.lstm({units: rnnOutputNeurons, inputShape: inputLayerShape}));
    model.add(tf.layers.dense({units: numOfClasses, kernelInitializer: 'varianceScaling', useBias: false, activation: 'softmax'}));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy'
    });

    const { dataSeries, labelSeries } = this.prepareLabeledData(inputs, outputs, inputLayerShape);
    const batchSize = Math.floor(dataSeries.shape[0]);

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

    this.model = model;

    return { model, history };
  }

  prepareLabeledData(inputs, outputs, inputLayerShape) {
    console.log([inputs.length, ...inputLayerShape])
    console.log([outputs.length, outputs[0].length])
    const dataSeries = tf.tensor3d(inputs, [inputs.length, ...inputLayerShape]).div(640);
    const labelSeries = tf.tensor2d(outputs, [outputs.length, outputs[0].length]);

    return { dataSeries, labelSeries };
  }

  async predict(input) {
    const result = model.predict(tf.tensor3d([input], [1, ...this.inputShape]).div(640));
    const predictedClass = result.as1D().argMax();
    const data = await predictedClass.data();

    result.print();
    result.as1D().print();
    result.as1D().argMax().print();
  }
}
