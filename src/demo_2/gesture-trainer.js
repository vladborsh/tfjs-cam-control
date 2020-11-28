import * as tf from '@tensorflow/tfjs';

export class GestureTrainer {
  async trainModel(
    inputs,
    outputs,
    numOfClasses,
    inputLayerShape,
    epochs,
    learningRate,
    layersNumber,
    onEpochEnd
  ) {
    const inputLayerNeurons = 100;
    const rnnInputShape  = [10, inputLayerNeurons / 10];
    const rnnOutputNeurons = 20;
    // const outputLayerNeurons = 1;

    const model = tf.sequential();

    model.add(tf.layers.dense({units: inputLayerNeurons, inputShape: [inputLayerShape]}));
    model.add(tf.layers.reshape({targetShape: rnnInputShape}));
    model.add(tf.layers.rnn({
      cell: Array.from({length: layersNumber}, () => tf.layers.lstmCell({units: rnnOutputNeurons})),
      inputShape: rnnInputShape,
      returnSequences: false
    }));
    // model.add(tf.layers.dense({units: outputLayerNeurons, inputShape: [rnnOutputNeurons]}));

    model.add(tf.layers.dense({
      units: numOfClasses,
      inputShape: [rnnOutputNeurons],
      kernelInitializer: 'varianceScaling',
      useBias: false,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError'
    });

    const { dataSeries, labelSeries } = this.prepareLabeledData(inputs, outputs);

    const history = await model.fit(
      dataSeries,
      labelSeries,
      { batchSize: windowSize, epochs, callbacks: {
        onEpochEnd: async (epoch, log) => onEpochEnd(epoch, log),
      }
    });

    return { model, history };
  }

  prepareLabeledData(inputs, outputs) {
    const dataSeries = tf.tensor2d(inputs, [inputs.length, inputs[0].length]).div(tf.scalar(10));
    const labelSeries = tf.tensor2d(outputs, [outputs.length, 1]).reshape([Y.length, 1]).div(tf.scalar(10));

    return { dataSeries, labelSeries };
  }
}
