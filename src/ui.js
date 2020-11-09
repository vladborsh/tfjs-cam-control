export class UI {
  constructor(dataAccumulationController, dataAccumulator) {
    this.dataAccumulationController = dataAccumulationController;
    this.dataAccumulator = dataAccumulator;
    this.collected = {
      idle: {
        container: document.getElementById('number-of-collected-idle'),
        value: 0,
      },
      handSlide: {
        container: document.getElementById('number-of-collected-hand-slide'),
        value: 0,
      }
    }
  }

  init() {
    console.log('LandmarkRenderer init...');

    this.initTrackingHandSlide();
    this.initTrackingHandIdle();
    this.initSaveTrainDataset();
    this.initLoadTrainDataset()
  }

  initTrackingHandSlide() {
    const button = document.getElementById('track-hand-slide');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulationController.accumulate('handSlide', () => {
        if (this.collected.handSlide.container) {
          this.collected.handSlide.container.innerText = ++this.collected.handSlide.value;
        }
      });
    })
  }

  initTrackingHandIdle() {
    const button = document.getElementById('track-idle');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulationController.accumulate('idle', () => {
        if (this.collected.idle.container) {
          this.collected.idle.container.innerText = ++this.collected.idle.value;
        }
      });
    })
  }

  initSaveTrainDataset() {
    const button = document.getElementById('save-data-set');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulator.exportJson();
    })
  }

  initLoadTrainDataset() {
    const button = document.getElementById('load-data-set');

    if (!button) return;

    button.addEventListener('click', () => {
      this.dataAccumulator.importJson('data-set-input', (data) => {
        this.collected.handSlide.value = data.handSlide.length;
        this.collected.idle.value = data.idle.length;
        this.collected.handSlide.container.innerText = data.handSlide.length;
        this.collected.idle.container.innerText = data.idle.length;
      });
    })
  }
}
