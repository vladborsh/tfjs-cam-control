export class UIController {
  constructor(dataAccumulationController, dataAccumulator, modelTrainer, predictor) {
    this.dataAccumulationController = dataAccumulationController;
    this.dataAccumulator = dataAccumulator;
    this.modelTrainer = modelTrainer;
    this.predictor = predictor;
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
    this.initLoadTrainDataset();
    this.initTrainModelHandler();
    this.initPredictHandler();
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

  initTrainModelHandler() {
    const button = document.getElementById('train-model');

    if (!button) return;

    button.addEventListener('click', () => {
      this.modelTrainer.train(
        this.dataAccumulator.datasetMap,
        (epoch, log) => console.log(epoch, log)
      );
    })
  }

  initPredictHandler() {
    const button = document.getElementById('predict');

    if (!button) return;

    button.addEventListener('click', () => {
      this.predictor.initPrediction();
    })
  }
}
