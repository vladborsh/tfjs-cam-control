export class DetectionRunner {
  constructor(handEstimator) {
    this.listeners = [];
    this.handEstimator = handEstimator;
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  run() {
    const runnableCb = () => {
      this.handEstimator.estimate()
        .then((estimation) => {
          const targetEstimation = estimation[0];
          this.listeners.forEach(listener => listener(targetEstimation));
          requestAnimationFrame(runnableCb);
        })
    }

    runnableCb();
  }
}
