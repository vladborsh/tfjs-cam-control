import * as tf from '@tensorflow/tfjs';

export class ModelLoader {
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
