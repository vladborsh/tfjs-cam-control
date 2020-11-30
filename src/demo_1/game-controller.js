import { Timer } from './timer';

export class GameController {
  constructor(predictor) {
    this.turnTime = 3;
    this.timer = document.getElementById('timer-label');
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
    this.humanTurnEl = document.querySelector('#human-turn')
    this.computerTurnEl = document.querySelector('#human-turn')
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
    if (playerTurn === computerTurn) {
      return 2
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
      ...this.humanTurnEl.querySelectorAll('.turn-img'),
      ...document.querySelector('#computer-turn').querySelectorAll('.turn-img'),
    ]
    .forEach(img => img.style.display = 'none');

    this.humanTurnEl.querySelector(`#${playerTurn}`).style.display = 'block';
    this.humanTurnEl.querySelector(`#score`).innerText = this.score.player;

    this.computerTurnEl.querySelector(`#${computerTurn}`).style.display = 'block';
    this.computerTurnEl.querySelector(`#score`).innerText = this.score.computer;
  }
}


function randomNumber(max = 1, min = 0) {
  if (min >= max) { return max; }
  return Math.floor(Math.random() * (max - min) + min);
}
