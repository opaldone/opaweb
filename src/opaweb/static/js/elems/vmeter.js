const SMOOTHING_FACTOR = 0.8;
const FRAME_PER_SECOND = 60;
const FRAME_INTERVAL = 1 / FRAME_PER_SECOND;

class VolumeMeter extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastUpdate = currentTime;
    this._volume = 0;
  }

  calculateRMS(chan_in) {
    if (!chan_in) return;

    let sum = 0;
    for (let i = 0; i < chan_in.length; i++) {
      sum += chan_in[i] * chan_in[i];
    }

    let rms = Math.sqrt(sum / chan_in.length);
    this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);
  }

  process(inputs, _) {
    const chan = inputs[0] && inputs[0][0];

    if (!chan || chan.length === 0) {
      return true;
    }

    if (currentTime - this._lastUpdate > FRAME_INTERVAL) {
      this.calculateRMS(chan);
      this.port.postMessage(this._volume);
      this._lastUpdate = currentTime;
    }

    return true;
  }
}

registerProcessor("volume-meter", VolumeMeter);
