export class AudioController {
  constructor() {}

  init() {
    console.log('AudioController init...'),
    this.audio = document.getElementById('audio');

    document.addEventListener('hand-left-slide', () => {
      console.log('hand-left-slide')
      this.backwardTime();
    })
    document.addEventListener('hand-right-slide', () => {
      console.log('hand-right-slide')
      this.forwardTime();
    })
    document.addEventListener('hand-top-slide', () => {
      console.log('hand-top-slide')
      this.playAudio();
    })
    document.addEventListener('hand-bottom-slide', () => {
      console.log('hand-bottom-slide')
      this.pauseAudio()
    })
    document.addEventListener('rotate-clockwise', () => {
      console.log('rotate-clockwise')
      this.upVolume();
    })
    document.addEventListener('rotate-counter-clockwise', () => {
      console.log('rotate-counter-clockwise')
      this.downVolume();
    })
  }

  playAudio() {
    this.audio.play();
  }

  pauseAudio() {
    this.audio.pause();
  }

  forwardTime() {
    this.audio.currentTime++;
  }

  backwardTime() {
    if (this.audio.currentTime > 0) {
      this.audio.currentTime--;
    }
  }

  upVolume() {
    if (this.audio.volume < 1) {
      this.audio.volume += 0.1;
    }
  }

  downVolume() {
    if (this.audio.volume > 0) {
      this.audio.volume -= 0.1;
    }
  }
}
