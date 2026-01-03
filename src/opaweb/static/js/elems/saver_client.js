class SaverClient {
  constructor() {
    this.uqFileName = '';
    this.someButton = null;
    this.recorder = null;
    this.recordingData = [];
  }

  actButton() {
    if (!this.someButton) return;
    this.someButton.classList.add('on');
  }

  deaButton() {
    if (!this.someButton) return;
    this.someButton.classList.remove('on');
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

  startCapture(uq, some_button_in, talkers_in, localS) {
    this.uqFileName = uq;
    this.someButton = some_button_in;
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
          // somebody clicked on "Stop sharing"
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
          this.deaButton();
          this.saveFile();
        };

        this.recorder.start();
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
    a.download = 'chat_' + this.uqFileName + '.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
