export class Timer {
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
