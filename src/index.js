import { DataAccumulationController } from "./data-accumulation-controller";
import { DataAccumulator } from "./data-accumulator";
import { DetectionRunner } from "./detection-runner";
import { HandEstimator } from "./hand-estimator";
import { LandmarkRenderer } from "./landmark-renderer";
import { WebCam } from "./web-cam";

const webCam = new WebCam('video');
const handEstimator = new HandEstimator('video');
const detectionRunner = new DetectionRunner(handEstimator);
const landmarkRenderer = new LandmarkRenderer('video', 'canvas', detectionRunner);
const dataAccumulator = new DataAccumulator();
const dataAccumulationController = new DataAccumulationController(dataAccumulator, detectionRunner);

webCam.init()
  .then(() => handEstimator.load())
  .then(() => {
    detectionRunner.init()
    landmarkRenderer.init();
    dataAccumulationController.init();
    initTrackingHandSlide(dataAccumulationController);
  });

function initTrackingHandSlide(dataAccumulationController) {
  const button = document.getElementById('track-hand-slide');
  button.addEventListener('click', () => {
    dataAccumulationController.accumulate('handSlide', () => {});
  })
}
