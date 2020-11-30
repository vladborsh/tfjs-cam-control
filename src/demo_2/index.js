import { DataAccumulationController } from "./data-accumulation-controller";
import { DataAccumulator } from "./data-accumulator";
import { DetectionRunner } from "./detection-runner";
import { HandEstimator } from "./hand-estimator";
import { LandmarkRenderer } from "./landmark-renderer";
import { ModelTrainer } from "./model-trainer";
import { Predictor } from "./predictor";
import { UIController } from "./ui-controller";
import { WebCam } from "./web-cam";
import { AudioController } from "./audio-controller";

const webCam = new WebCam('video');
const handEstimator = new HandEstimator('video');
const detectionRunner = new DetectionRunner(handEstimator);
const landmarkRenderer = new LandmarkRenderer('video', 'canvas', detectionRunner);
const dataAccumulator = new DataAccumulator();
const dataAccumulationController = new DataAccumulationController(dataAccumulator, detectionRunner);
const modelTrainer = new ModelTrainer();
const predictor = new Predictor(detectionRunner, modelTrainer);
const audioController = new AudioController();
const uiController = new UIController(dataAccumulationController, dataAccumulator, modelTrainer, predictor);

webCam.init()
  .then(() => handEstimator.load())
  .then(() => {
    detectionRunner.init()
    landmarkRenderer.init();
    dataAccumulationController.init();
    predictor.initTracking();
    audioController.init();
    uiController.init();
  });
