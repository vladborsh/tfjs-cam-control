import { DetectionRunner } from "./detection-runner";
import { HandEstimator } from "./hand-estimator";
import { LandmarkRenderer } from "./landmark-renderer";
import { WebCam } from "./web-cam";

const webCam = new WebCam('video');
const handEstimator = new HandEstimator('video');
const detectionRunner = new DetectionRunner(handEstimator);
const landmarkRenderer = new LandmarkRenderer('video', 'canvas', detectionRunner);

webCam.init()
  .then(() => handEstimator.load())
  .then(() => {
    detectionRunner.run()
    landmarkRenderer.init();
  });
