class Sharer {
  constructor(oin_in) {
    this.oin = oin_in;
    this.sharedStream = null;
  }

  toggleHint() {
    const thint = this.oin.button.getAttribute('data-thint');
    const hint = this.oin.button.getAttribute('data-hint');
    this.oin.button.setAttribute('data-hint', thint);
    this.oin.button.setAttribute('data-thint', hint);
  }

  actButton() {
    if (!this.oin.button) return;
    this.toggleHint();
    this.oin.button.classList.add('on');
  }

  deaButton() {
    if (!this.oin.button) return;
    this.toggleHint();
    this.oin.button.classList.remove('on');
  }

  videoBack() {
    this.sharedStream.getTracks().forEach(tra => tra.stop());
    this.sharedStream = null;

    this.deaButton();

    let se = this.oin.fnSe();
    let jo = {
      'tp': this.oin.ws.TPS.SCRE,
      'content': JSON.stringify(se)
    };
    this.oin.ws.handler.send(JSON.stringify(jo));

    // this.localStream.getTracks().forEach(tr => {
      // if (tr.kind != 'video') return;
      // this.pc.getSenders().forEach((sender) => {
        // if (!sender) return;
        // if (!sender.track) return;
        // if (sender.track.kind != 'video') return;

        // sender.replaceTrack(tr);
      // });
    // });
  }

  shareScreen(pcin) {
    window.navigator.mediaDevices.getDisplayMedia({
      'video': true,
      'audio': {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      preferCurrentTab: false,
      selfBrowserSurface: "exclude",
      monitorTypeSurfaces: "include"
    })
      .then(st => {
        this.actButton();

        let se = this.oin.fnSe();

        let jo = {
          'tp': this.oin.ws.TPS.SCRE,
          'content': JSON.stringify(se)
        };
        this.oin.ws.handler.send(JSON.stringify(jo));

        this.sharedStream = st;
        let vtr = this.sharedStream.getVideoTracks()[0];

        vtr.onended = () => {
          this.videoBack();
        };

        pcin.getSenders().forEach((sender) => {
          if (!sender) return;
          if (!sender.track) return;

          if (sender.track.kind == 'video') {
            sender.replaceTrack(vtr);
          }
        });
      })
      .catch(e => {
        console.log('----------- error -------------');
        console.error(e);
      });
  }

  toggleShare(pcin) {
    if (this.sharedStream) {
      this.videoBack();
      return;
    }

    this.shareScreen(pcin);
  }

  endSessionShare() {
    if (this.sharedStream) {
      this.sharedStream.getTracks().forEach(tra => tra.stop());
    }
    this.sharedStream = null;
  }
}
