import * as tf from '@tensorflow/tfjs';

function randomNumber(max = 1, min = 0) {
  if (min >= max) { return max; }
  return Math.floor(Math.random() * (max - min) + min);
}

class WebCam {
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
  constructor(modelLoader) {
    this.modelLoader = modelLoader;
    this.numClasses = 3;
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
  constructor(webCam, trainingSampleCapturer, realModelTrainer, predictor, gameController) {
    this.webCam = webCam;
    this.trainingSampleCapturer = trainingSampleCapturer;
    this.realModelTrainer = realModelTrainer;
    this.predictor = predictor;
    this.gameController = gameController;
    this.dataSeriesLength = 100;
  }

  init() {
    [
      'capture-1',
      'capture-2',
      'capture-3',
    ].forEach((label, index) => {
      document.getElementById(label).addEventListener('click', () => {
        new Timer(
          () => this.trainingSampleCapturer.addExample(index, this.webCam.capture()),
          () => console.log(this.trainingSampleCapturer.savedX, this.trainingSampleCapturer.savedY),
          this.dataSeriesLength,
          10
        );
      });
    })

    document.getElementById('train').addEventListener('click', () => {
      const onBatchEnd = (logs) => {
        const lossValue = document.getElementById('loss-value');
        lossValue.innerText = logs.loss;
      }
      this.realModelTrainer.init();
      this.realModelTrainer.train(onBatchEnd);
    });

    document.getElementById('to-play-stage').addEventListener('click', () => {
      const trainStage = document.getElementById('train-stage');
      const playStage = document.getElementById('play-stage');

      trainStage.style.display = 'none';
      playStage.style.display = 'flex';
      this.gameController.init();
    });
  }
}

class GameController {
  constructor(predictor) {
    this.turnTime = 3;
    this.timer = document.getElementById('timer');
    this.predictor = predictor;
    this.turnMap = [
      'rock',
      'scissors',
      'paper',
    ];
    this.score = {
      player: 0,
      computer: 0,
    }
  }

  init() {
    const runTimer = () => {
      new Timer(
        (iteration) => {
          this.timer.innerText = this.turnTime - iteration;
        },
        () => {
          const computerTurn = this.turnMap[randomNumber(3, 0)];

          this.predictor.predict()
            .then(index => {
              const playerTurn = this.turnMap[index];
              const result = this.compare(computerTurn, playerTurn);

              this.drawResults(result, computerTurn, playerTurn);
              runTimer();
            });
        },
        this.turnTime,
      )
    }
    runTimer();
  }

  // 1 - computer win
  // 0 - player win
  compare(computerTurn, playerTurn) {
    if (computerTurn === 'rock' && playerTurn === 'scissors'
      || computerTurn === 'scissors' && playerTurn === 'paper'
      || computerTurn === 'paper' && playerTurn === 'rock'
    ) {
      return 1;
    }
    if (playerTurn === 'rock' && computerTurn === 'scissors'
      || playerTurn === 'scissors' && computerTurn === 'paper'
      || playerTurn === 'paper' && computerTurn === 'rock'
    ) {
      return 0;
    }
  }

  drawResults(result, computerTurn, playerTurn) {
    if (result === 0) {
      this.score.player++;
    }
    if (result === 1) {
      this.score.computer++;
    }

    [
      ...document.getElementById('human-turn').querySelectorAll('.turn-img'),
      ...document.getElementById('computer-turn').querySelectorAll('.turn-img'),
    ]
    .forEach(img => img.display = 'none');

    const playerTurnImg = document
      .querySelector('#human-turn')
      .querySelector(`#${playerTurn}`);

    playerTurnImg.display = 'block';

    const computerTurnImg = document
      .querySelector('#computer-turn')
      .querySelector(`#${computerTurn}`);

    computerTurnImg.display = 'block';
  }
}

class Timer {
  constructor(onTick, onEnd, duration = 1, tickTime = 1000) {
    let iteration = 0;
    const interval = setInterval(() => {
      onTick(iteration);

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
    this.numHiddenLayers = 30;
    this.numClasses = 3;
    this.numEpochs = 500;
    this.learningRate = 0.001;
  }

  init() {
    this.model = tf.sequential({
      layers: [
        // shape.slice(1) потому что первое значение в shape - null
        tf.layers.flatten({ inputShape: this.modelLoader.truncatedModel.outputs[0].shape.slice(1)}),
        tf.layers.dense({ units: this.numHiddenLayers, kernelInitializer: 'varianceScaling', useBias: true, activation: 'relu'}),
        tf.layers.dense({ units: this.numClasses, kernelInitializer: 'varianceScaling', useBias: false, activation: 'softmax'})
      ]
    });
    this.model.compile({optimizer: tf.train.adam(this.learningRate), loss: 'categoricalCrossentropy'});
  }

  train(onBatchEnd) {
    const batchSize = Math.floor(this.trainingSampleCapturer.savedX.shape[0]);

    return this.model.fit(
      this.trainingSampleCapturer.savedX,
      this.trainingSampleCapturer.savedY,
      {
        batchSize,
        epochs: this.numEpochs,
        callbacks: {
          onBatchEnd: async (batch, logs) => onBatchEnd(logs),
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

  async predict() {
    const prediction = tf.tidy(() => {
      const img = this.webCam.capture();
      const innerPrediction = this.modelLoader.truncatedModel.predict(img);
      const finalPrediction = this.realModelTrainer.model.predict(innerPrediction);

      return finalPrediction.as1D().argMax();
    })

    return prediction.data()
      .then(data => {
        prediction.dispose();

        return data[0];
      })
  }
}

function main() {
  const webCam = new WebCam('video');
  const modelLoader = new ModelLoader();
  const trainingSampleCapturer = new TrainingSampleCapturer(modelLoader);
  const realModelTrainer = new RealModelTrainer(modelLoader, trainingSampleCapturer);
  const predictor = new Predictor(webCam, modelLoader, realModelTrainer);
  const gameController = new GameController(predictor);
  const uiController = new UIController(webCam, trainingSampleCapturer, realModelTrainer, predictor, gameController);

  webCam.init()
    .then(() => uiController.init());

  modelLoader.init();
}

main();
