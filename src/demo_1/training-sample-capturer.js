import * as tf from '@tensorflow/tfjs';

export class TrainingSampleCapturer {
  constructor(modelLoader) {
    this.modelLoader = modelLoader;
    this.numClasses = 3;
  }

  addExample(label, imgData) {
    const x = this.modelLoader.truncatedModel.predict(imgData)
    const y = tf.tidy(() =>
      tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses)
    );

    if (this.savedX == null) {
      this.savedX = tf.keep(x);
      this.savedY = tf.keep(y);
    } else {
      this.savedX = tf.keep(this.savedX.concat(x, 0));
      this.savedY = tf.keep(this.savedY.concat(y, 0));

      y.dispose();
    }
  }
}
