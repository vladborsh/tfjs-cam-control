import * as tf from '@tensorflow/tfjs';

export class RealModelTrainer {
  constructor(modelLoader, trainingSampleCapturer) {
    this.modelLoader = modelLoader;
    this.trainingSampleCapturer = trainingSampleCapturer;
    this.numHiddenLayers = 30;
    this.numClasses = 3;
    this.numEpochs = 500;
    this.learningRate = 0.001;
  }

  init() {
    this.model = tf.sequential({
      layers: [
        // shape.slice(1) потому что первое значение в shape - null
        tf.layers.flatten({ inputShape: this.modelLoader.truncatedModel.outputs[0].shape.slice(1)}),
        tf.layers.dense({ units: this.numHiddenLayers, kernelInitializer: 'varianceScaling', useBias: true, activation: 'relu'}),
        tf.layers.dense({ units: this.numClasses, kernelInitializer: 'varianceScaling', useBias: false, activation: 'softmax'})
      ]
    });
    this.model.compile({optimizer: tf.train.adam(this.learningRate), loss: 'categoricalCrossentropy'});
  }

  train(onBatchEnd) {
    const batchSize = Math.floor(this.trainingSampleCapturer.savedX.shape[0]);

    return this.model.fit(
      this.trainingSampleCapturer.savedX,
      this.trainingSampleCapturer.savedY,
      {
        batchSize,
        epochs: this.numEpochs,
        callbacks: {
          onBatchEnd: async (batch, logs) => onBatchEnd(logs),
        }
      },
    );
  }
}
