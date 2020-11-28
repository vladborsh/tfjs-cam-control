export class WebCam {
  constructor(videoId) {
    this.video = document.getElementById(videoId);
  }

  init() {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia(
        { video: true },
        (stream) => {
          this.video.srcObject = stream;
          this.video.addEventListener('loadeddata', () => {
            resolve();
          })
        },
        (error) => {
          console.error(error),
          reject(error);
        }
      );
    })
  }
}
