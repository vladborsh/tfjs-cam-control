const KEY_POINT_RADIUS = 5;
const KEY_POINT_COLOR = 'white';

export class LandmarkRenderer {
  constructor(videoId, canvasId, detectionRunner) {
    const canvas = document.getElementById(canvasId);
    this.context = canvas.getContext('2d');
    this.video = document.getElementById(videoId);
    this.detectionRunner = detectionRunner;
  }

  init() {
    const render = (estimation) => {
      this.context.clearRect(0, 0, this.video.width, this.video.height);

      if (estimation && estimation.handInViewConfidence > 0.9) {
        console.log(estimation)
        this.context.strokeStyle = KEY_POINT_COLOR;
        this.context.fillStyle = KEY_POINT_COLOR;

        this.renderKeyPoints(estimation.landmarks);
        this.renderFingers(estimation.annotations, estimation.landmarks[0]);
      }
    }

    this.detectionRunner.addListener(render);
  }

  renderKeyPoints(landmarks) {
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i][0];
      const y = landmarks[i][1];
      this.context.beginPath();
      this.context.arc(x, y, KEY_POINT_RADIUS, 0, 2 * Math.PI);
      this.context.fill();
    }
  }

  renderFingers(annotations, palmBase) {
    for (const finger in annotations) {
      const points = [ palmBase, ...annotations[finger]];
      this.context.beginPath()
      this.context.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        this.context.lineTo(points[i][0], points[i][1]);
      }
      this.context.stroke();
    }
  }
}
