class SaverClient {
  constructor(oin_in) {
    this.oin = oin_in;

    this.recorder = null;
    this.recordingData = [];
  }

  actButton() {
    if (!this.oin.button) return;
    this.oin.button.classList.add('on');
  }

  deaButton() {
    if (!this.oin.button) return;
    this.oin.button.classList.remove('on');
  }

  checkCodecsSupported() {
    let options = {"mimeType": 'video/webm;codecs=vp8,opus'};
    if (MediaRecorder.isTypeSupported(options.mimeType)) return options;
    console.error(`${options.mimeType} is not supported`);
    return {mimeType: ''};
  }

  mixAu(msList, localS) {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    msList.forEach(ms => {
      if(ms.getAudioTracks().length == 0) return;
      ctx.createMediaStreamSource(ms).connect(dest);
    });

    if (localS.getAudioTracks().length > 0) {
      ctx.createMediaStreamSource(localS).connect(dest);
    }

    return dest.stream.getAudioTracks();
  }

  notifStarted() {
    let jo = {
      'tp': this.oin.ws.TPS.CLBREC,
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  notifEnded() {
    let jo = {
      'tp': this.oin.ws.TPS.CLEREC,
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  startCapture(talkers_in, localS) {
    this.actButton();

    let auList = [];
    this.recordingData = [];

    window.navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
      preferCurrentTab: true,
      monitorTypeSurfaces: 'exclude'
    })
      .then(ds => {
        for (let tk in talkers_in) {
          let oc = talkers_in[tk];
          auList.push(oc.audio);
        }

        let tracks = [];

        this.mixAu(auList, localS).forEach(atr => tracks.push(atr));
        ds.getVideoTracks().forEach((vtr) => {
          // when clicked on "Stop sharing"
          vtr.onended = () => {
            this.stopCapture();
          };

          tracks.push(vtr)
        });

        const codec = this.checkCodecsSupported();

        let recStream = new MediaStream(tracks);

        this.recorder = new MediaRecorder(recStream, codec);

        this.recorder.ondataavailable = (e) => {
          if (!e.data) return;
          if (e.data.size == 0) return;
          this.recordingData.push(e.data);
        };

        this.recorder.onstop = () => {
          ds.getTracks().forEach(tr => tr.stop());
          this.notifEnded()
          this.deaButton();
          this.saveFile();
        };

        this.recorder.start();
        this.notifStarted();
      })
      .catch(e => {
        console.error(e);
        this.deaButton();
        return;
      });
  }

  stopCapture() {
    this.recorder.stop();
  }

  saveFile() {
    const blob = new Blob(this.recordingData, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'chat_' + this.oin.ws.uqroom + '.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  toggleRecord(talkers_in, localS) {
    if (this.oin.button.classList.contains('on')) {
      this.stopCapture();
      return;
    }

    this.startCapture(talkers_in, localS);
  }
}
