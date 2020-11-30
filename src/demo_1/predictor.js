import * as tf from '@tensorflow/tfjs';

export class Predictor {
  constructor(webCam, modelLoader, realModelTrainer) {
    this.webCam = webCam;
    this.modelLoader = modelLoader;
    this.realModelTrainer = realModelTrainer;
  }

  async predict() {
    const prediction = tf.tidy(() => {
      const img = this.webCam.capture();
      const innerPrediction = this.modelLoader.truncatedModel.predict(img);
      const finalPrediction = this.realModelTrainer.model.predict(innerPrediction);

      return finalPrediction.as1D().argMax();
    })

    return prediction.data()
      .then(data => {
        prediction.dispose();

        return data[0];
      })
  }
}
