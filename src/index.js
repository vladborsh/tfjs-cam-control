import { DataAccumulationController } from "./data-accumulation-controller";
import { DataAccumulator } from "./data-accumulator";
import { DetectionRunner } from "./detection-runner";
import { HandEstimator } from "./hand-estimator";
import { LandmarkRenderer } from "./landmark-renderer";
import { UI } from "./ui";
import { WebCam } from "./web-cam";

const webCam = new WebCam('video');
const handEstimator = new HandEstimator('video');
const detectionRunner = new DetectionRunner(handEstimator);
const landmarkRenderer = new LandmarkRenderer('video', 'canvas', detectionRunner);
const dataAccumulator = new DataAccumulator();
const dataAccumulationController = new DataAccumulationController(dataAccumulator, detectionRunner);
const ui = new UI(dataAccumulationController, dataAccumulator);

webCam.init()
  .then(() => handEstimator.load())
  .then(() => {
    detectionRunner.init()
    landmarkRenderer.init();
    dataAccumulationController.init();
    ui.init();
  });
