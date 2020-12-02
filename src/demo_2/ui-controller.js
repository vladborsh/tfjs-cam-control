export class UIController {
  constructor(dataAccumulationController, dataAccumulator, modelTrainer, predictor) {
    this.dataAccumulationController = dataAccumulationController;
    this.dataAccumulator = dataAccumulator;
    this.modelTrainer = modelTrainer;
    this.predictor = predictor;
    this.collected = {};
    this.trackerLabels = [
      'idle',
      'hand-left-slide',
      'hand-right-slide',
      'hand-top-slide',
      'hand-bottom-slide',
      'rotate-clockwise',
      'rotate-counter-clockwise',
    ];
  }

  init() {
    this.trackerLabels.forEach(label => {
      this.collected = {
        ...this.collected,
        [label]: {
          container: document.getElementById(`number-of-collected-${label}`),
          value: 0,
        }
      }

      const button = document.getElementById(`track-${label}`);

      if (!button) return;

      button.addEventListener('click', () => {
        this.dataAccumulationController.accumulate([label], () => {
          if (this.collected[label].container) {
            this.collected[label].container.innerText = ++this.collected[label].value;
          }
        });
      })
    })

    this.initSaveTrainDataset();
    this.initLoadTrainDataset();
    this.initTrainModelHandler();
    this.initPredictHandler();
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
        const labels = Object.keys(data);
        labels.forEach(label => {
          this.collected[label].value = data[label].length;
          this.collected[label].container.innerText = data[label].length;
        });
      });
    })
  }

  initTrainModelHandler() {
    const button = document.getElementById('train-model');

    if (!button) return;

    const onBatchEnd = (logs) => {
      const lossValue = document.getElementById('loss-value');
      lossValue.innerText = logs.loss;
    }

    button.addEventListener('click', () => {
      this.modelTrainer.train(
        this.dataAccumulator.datasetMap,
        (epoch, log) => onBatchEnd(log)
      );
    })
  }

  initPredictHandler() {
    const button = document.getElementById('predict');

    if (!button) return;

    button.addEventListener('click', () => {
      const player = document.querySelector('#player');
      const trainController = document.querySelector('#train-controller')

      player.style.display = 'block';
      trainController.style.display = 'none';

      this.predictor.initPrediction();
    })
  }
}
