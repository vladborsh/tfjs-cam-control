const SERIES_LENGTH = 20;

export class DataAccumulationController {
  constructor(dataAccumulator, detectionRunner) {
    this.dataAccumulator = dataAccumulator;
    this.detectionRunner = detectionRunner;
  }

  init() {
    console.log('DataAccumulationController init...');

    const cb = (estimation) => {
      if (estimation && this.accumulationCallback) {
        this.accumulationCallback(estimation.landmarks);
      }
    }

    this.detectionRunner.addListener(cb);
  }

  accumulate(label, onFinishCallback) {
    let iteration = 0;
    let landmarksSeries = [];

    const accumulationCallback = (landmarks) => {
      if (iteration++ < SERIES_LENGTH) {
        landmarksSeries.push(landmarks);
      } else {
        this.dataAccumulator.addData(label, landmarksSeries);
        this.accumulationCallback = null;
        if (onFinishCallback) {
          onFinishCallback();
        }
      }
    }

    this.accumulationCallback = accumulationCallback;
  }
}
