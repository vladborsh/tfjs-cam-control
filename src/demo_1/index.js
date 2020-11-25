import * as tf from '@tensorflow/tfjs';

class WebCam {
  constructor(videoId) {
    this.video = document.getElementById(videoId);
    this.WIDTH = 224;
    this.HEIGHT = 224;
  }

  init() {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia(
        {
          video: {
            height: this.HEIGHT,
            width: this.WIDTH,
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

      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
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

class ModelLoader {
  init() {
    return tf.loadLayersModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
    ).then(
      mobilenet => {
        const layer = mobilenet.getLayer('conv_pw_13_relu');
        this.truncatedModel = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });

        return this.truncatedModel;
      }
    );
  }
}

class TrainingSampleCapturer {
  constructor(modelLoader, numClasses) {
    this.modelLoader = modelLoader;
    this.numClasses = numClasses;
  }

  addExample(label, imgData) {
    const x = this.modelLoader.truncatedModel.predict(imgData)
    const y = tf.tidy(() =>
      tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses)
    );

    if (this.savedX == null) {
      this.savedX = tf.keep(x);
      this.savedY = tf.keep(y);
    } else {
      this.savedX = tf.keep(this.savedX.concat(x, 0));
      this.savedY = tf.keep(this.savedY.concat(y, 0));

      y.dispose();
    }
  }
}

class UIController {
  constructor(webCam, trainingSampleCapturer, realModelTrainer, predictor) {
    this.webCam = webCam;
    this.trainingSampleCapturer = trainingSampleCapturer;
    this.realModelTrainer = realModelTrainer;
    this.predictor = predictor;
  }

  init() {
    document.getElementById('capture-1').addEventListener('click', () => {
      new Timer(
        () => this.trainingSampleCapturer.addExample(1, this.webCam.capture()),
        () => console.log(this.trainingSampleCapturer.savedX, this.trainingSampleCapturer.savedY),
        10,
        300
      );
    })

    document.getElementById('capture-2').addEventListener('click', () => {
      new Timer(
        () => this.trainingSampleCapturer.addExample(2, this.webCam.capture()),
        () => console.log(this.trainingSampleCapturer.savedX, this.trainingSampleCapturer.savedY),
        10,
        300
      );
    })

    document.getElementById('train').addEventListener('click', () => {
      this.realModelTrainer.train();
    });

    document.getElementById('predict').addEventListener('click', () => {
      console.log(this.predictor.predict());
    });
  }
}

class Timer {
  constructor(onTick, onEnd, duration, tickTime = 1000) {
    let iteration = 0;
    const interval = setInterval(() => {
      onTick();

      if (iteration < duration) {
        iteration++;
      } else {
        onEnd();
        clearInterval(interval);
      }
    }, tickTime);
  }
}

class RealModelTrainer {
  constructor(modelLoader, trainingSampleCapturer) {
    this.modelLoader = modelLoader;
    this.trainingSampleCapturer = trainingSampleCapturer;
    this.NUM_HIDDEN_NEURONS = 10;
    this.NUM_CLASSES = 2;
    this.NUM_EPOCHS = 100;
    this.LEARNING_RATE = 0.1;
  }

  init() {
    this.model = tf.sequential({
      layers: [
        // shape.slice(1) потому что первое значение в shape - null
        tf.layers.flatten({ inputShape: this.modelLoader.truncatedModel.outputs[0].shape.slice(1)}),
        tf.layers.dense({ units: this.NUM_HIDDEN_NEURONS, activation: 'relu', useBias: true}),
        tf.layers.dense({ units: this.NUM_CLASSES, useBias: false, activation: 'softmax'})
      ]
    });
    this.model.compile({optimizer: tf.train.adam(this.LEARNING_RATE), loss: 'categoricalCrossentropy'});
  }

  train() {
    const batchSize = Math.floor(this.trainingSampleCapturer.savedX.shape[0]);

    return this.model.fit(
      this.trainingSampleCapturer.savedX,
      this.trainingSampleCapturer.savedY,
      {
        batchSize,
        epochs: this.NUM_EPOCHS,
        callbacks: {
          onBatchEnd: async (batch, logs) => console.log(logs),
        }
      },
    );
  }
}

class Predictor {
  constructor(webCam, modelLoader, realModelTrainer) {
    this.webCam = webCam;
    this.modelLoader = modelLoader;
    this.realModelTrainer = realModelTrainer;
  }

  predict() {
    return tf.tidy(() => {
      const img = this.webCam.capture();
      const innerPrediction = this.modelLoader.truncatedModel.predict(img);
      const finalPrediction = this.realModelTrainer.model.predict(innerPrediction);

      return finalPrediction.as1D().argMax();
    })
  }
}

function main() {
  const webCam = new WebCam('video');
  const modelLoader = new ModelLoader();
  const trainingSampleCapturer = new TrainingSampleCapturer(modelLoader, 2);
  const realModelTrainer = new RealModelTrainer(modelLoader, trainingSampleCapturer);
  const predictor = new Predictor(webCam, modelLoader, realModelTrainer);
  const uiController = new UIController(webCam, trainingSampleCapturer, realModelTrainer, predictor);

  webCam.init()
    .then(() => uiController.init());

  modelLoader.init()
    .then(() => realModelTrainer.init());
}

main();
