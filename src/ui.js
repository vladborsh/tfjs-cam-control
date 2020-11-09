export class UI {
  constructor(dataAccumulationController, dataAccumulator) {
    this.dataAccumulationController = dataAccumulationController;
    this.dataAccumulator = dataAccumulator;
    this.numberOfCollectedEl = document.getElementById('number-of-collected');
    this.numberOfCollected = 0;
  }

  init() {
    console.log('LandmarkRenderer init...');

    this.initTrackingHandSlide();
    this.initSaveTrainDataset();
  }

  initTrackingHandSlide() {
    const button = document.getElementById('track-hand-slide');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulationController.accumulate('handSlide', this.updateNumberOfCollectedUI.bind(this));
    })
  }

  initSaveTrainDataset() {
    const button = document.getElementById('save-data-set');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulator.exportJson();
    })
  }

  updateNumberOfCollectedUI() {
    if (this.numberOfCollectedEl) {
      this.numberOfCollectedEl.innerText = ++this.numberOfCollected;
    }
  }
}
