import * as tf from '@tensorflow/tfjs';

const SERIES_SIZE = 20;

export class Predictor {
  constructor(detectionRunner, modelTrainer) {
    this.detectionRunner = detectionRunner;
    this.modelTrainer = modelTrainer;
    this.latestData = [];
    this.interval = 500;
    this.lastTimestamp;
  }

  initTracking() {
    this.detectionRunner.addListener((estimation) => {
      if (estimation) {
        this.latestData.push(
          estimation
            .landmarks
            .map(coordinates => [coordinates[0], coordinates[1]])
            .reduce((acc, curr) => [...acc, ...curr], [])
        );

        this.lastTimestamp = Date.now();

        if (this.latestData.length > SERIES_SIZE) {
          this.latestData.shift();
        }
      }
    });
  }

  initPrediction() {
    setInterval(() => {
      if (Date.now() - this.lastTimestamp <= this.interval) {
        this.predict(this.latestData)
          .then(dataIndex => {
            document.dispatchEvent(new CustomEvent(this.modelTrainer.gestures[dataIndex], {detail: {}}));
            const log = document.querySelector('#predictor-command');
            log.innerText = this.modelTrainer.gestures[dataIndex];
          });
      }
    }, this.interval);
  }

  predict(data) {
    const inputShape = [data.length, data[0].length]

    const prediction = tf.tidy(() => {
      const prediction = this.modelTrainer.model.predict(
        tf.tensor3d([data], [1, ...inputShape]).div(640)
      );

      return prediction.as1D().argMax();
    })

    return prediction.data()
      .then(data => {
        prediction.dispose();

        return data[0];
      })
  }
}
