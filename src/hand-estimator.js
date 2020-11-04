import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

export class HandEstimator {
  constructor(videoId) {
    this.video = document.getElementById(videoId);
  }

  async load() {
    return handpose.load()
      .then(model => {
        this.model = model;
        return model;
      });
  }

  async estimate() {
    return this.model.estimateHands(this.video)
  }
}
