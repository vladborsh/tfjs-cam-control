import * as tf from '@tensorflow/tfjs';

export class GestureTrainer {
  async trainModel(
    inputs,
    outputs,
    trainingSize,
    batchSize,
    epochs,
    learningRate,
    layersNumber,
    onEpochEnd
  ) {
    const inputLayerShape = batchSize;
    const inputLayerNeurons = 100;
    const rnnInputShape  = [10, inputLayerNeurons / 10];
    const rnnOutputNeurons = 20;
    const outputLayerNeurons = 1;

    const model = tf.sequential();

    model.add(tf.layers.dense({units: inputLayerNeurons, inputShape: [inputLayerShape]}));
    model.add(tf.layers.reshape({targetShape: rnnInputShape}));
    model.add(tf.layers.rnn({
      cell: Array.from({length: layersNumber}, () => tf.layers.lstmCell({units: rnnOutputNeurons})),
      inputShape: rnnInputShape,
      returnSequences: false
    }));
    model.add(tf.layers.dense({units: outputLayerNeurons, inputShape: [rnnOutputNeurons]}));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError'
    });

    const { dataSeries, labelSeries } = this.prepareLabeledData(inputs, outputs, trainingSize);

    const history = await model.fit(
      dataSeries,
      labelSeries,
      { batchSize, epochs, callbacks: {
        onEpochEnd: async (epoch, log) => onEpochEnd(epoch, log),
      }
    });

    return { model, history };
  }

  prepareLabeledData(inputs, outputs, trainingSize) {
    let data = inputs.slice(0, Math.floor(trainingSize / 100 * inputs.length));
    let labels = outputs.slice(0, Math.floor(trainingSize / 100 * outputs.length));

    const dataSeries = tf.tensor2d(data, [data.length, data[0].length]).div(tf.scalar(10));
    const labelSeries = tf.tensor2d(labels, [labels.length, 1]).reshape([Y.length, 1]).div(tf.scalar(10));

    return { dataSeries, labelSeries };
  }
}
