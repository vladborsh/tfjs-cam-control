import { Timer } from './timer';

export class UIController {
  constructor(webCam, trainingSampleCapturer, realModelTrainer, predictor, gameController) {
    this.webCam = webCam;
    this.trainingSampleCapturer = trainingSampleCapturer;
    this.realModelTrainer = realModelTrainer;
    this.predictor = predictor;
    this.gameController = gameController;
    this.dataSeriesLength = 100;
  }

  init() {
    [
      'capture-rock',
      'capture-scissors',
      'capture-paper',
    ].forEach((label, index) => {
      document.getElementById(label).addEventListener('click', () => {
        new Timer(
          () => this.trainingSampleCapturer.addExample(index, this.webCam.capture()),
          () => {
            document.getElementById('log-value').innerText = `${label} done!`
          },
          this.dataSeriesLength,
          10
        );
      });
    })

    document.getElementById('train').addEventListener('click', () => {
      const onBatchEnd = (logs) => {
        const lossValue = document.getElementById('loss-value');
        lossValue.innerText = logs.loss;
      }
      this.realModelTrainer.init();
      this.realModelTrainer.train(onBatchEnd);
    });

    document.getElementById('to-play-stage').addEventListener('click', () => {
      const trainStage = document.getElementById('train-stage');
      const playStage = document.getElementById('play-stage');

      trainStage.style.display = 'none';
      playStage.style.display = 'flex';
      this.gameController.init();
    });
  }
}
