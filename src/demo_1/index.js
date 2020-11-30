import { WebCam } from './web-cam';
import { ModelLoader } from './model-loader';
import { TrainingSampleCapturer } from './training-sample-capturer';
import { RealModelTrainer } from './real-model-trainer';
import { Predictor } from './predictor';
import { GameController } from './game-controller';
import { UIController } from './ui-controller';

function main() {
  const webCam = new WebCam('video');
  const modelLoader = new ModelLoader();
  const trainingSampleCapturer = new TrainingSampleCapturer(modelLoader);
  const realModelTrainer = new RealModelTrainer(modelLoader, trainingSampleCapturer);
  const predictor = new Predictor(webCam, modelLoader, realModelTrainer);
  const gameController = new GameController(predictor);
  const uiController = new UIController(webCam, trainingSampleCapturer, realModelTrainer, predictor, gameController);

  webCam.init()
    .then(() => {
      uiController.init()
    });

  modelLoader.init();
}

main();
