const KEY_POINT_RADIUS = 3

export class LandmarkRenderer {
  constructor(videoId, canvasId, detectionRunner) {
    const canvas = document.getElementById(canvasId);
    this.context = canvas.getContext('2d');
    this.video = document.getElementById(videoId);
    this.detectionRunner = detectionRunner;
  }

  init() {
    const render = (estimation) => {
      if (estimation && estimation.handInViewConfidence > 0.9) {
        this.context.clearRect(0, 0, this.video.width, this.video.height);
        this.context.strokeStyle = 'red';
        this.context.fillStyle = 'red';

        this.renderKeyPoints(estimation.landmarks);
        this.renderFingers(estimation.annotations);
      }
    }

    this.detectionRunner.addListener(render);
  }

  renderKeyPoints(points) {
    for (let i = 0; i < points.length; i++) {
      const y = points[i][0];
      const x = points[i][1];
      this.context.beginPath();
      this.context.arc(x, y, KEY_POINT_RADIUS, 0, 2 * Math.PI);
      this.context.fill();
    }
  }

  renderFingers(annotations) {
    for (const finger in annotations) {
      const points = annotations[finger];
      this.context.beginPath()
      this.context.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        this.context.lineTo(points[i][0], points[i][1]);
      }
      this.context.stroke();
    }
  }
}
