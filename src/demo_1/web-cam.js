import * as tf from '@tensorflow/tfjs';

export class WebCam {
  constructor(videoId) {
    this.video = document.getElementById(videoId);
    this.width = 224;
    this.height = 224;
  }

  init() {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia(
        {
          video: {
            height: this.height,
            width: this.width,
            facingMode: 'user',
          }
        },
        (stream) => {
          this.video.srcObject = stream;
          this.video.addEventListener('loadeddata', () => resolve());
        },
        (error) => {
          console.error(error),
          reject(error);
        }
      );
    })
  }

  capture() {
    return tf.tidy(() => {
      const croppedImage = this.cropImage(tf.browser.fromPixels(this.video));
      const batchedImage = croppedImage.expandDims(0);

      return batchedImage.toFloat().div(tf.scalar(127));
    });
  }

  cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - size / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - size / 2;
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }
}
