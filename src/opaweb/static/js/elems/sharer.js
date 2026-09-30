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

  _sendWs() {
    let se = this.oin.fnSe();

    let jo = {
      'tp': this.oin.ws.TPS.SCRE,
      'content': JSON.stringify(se)
    };
    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  videoBack(pcin, lsin) {
    this.sharedStream.getTracks().forEach(tra => tra.stop());
    this.sharedStream = null;

    this.deaButton();

    this._sendWs();

    lsin.getTracks().forEach(tr => {
      if (tr.kind != 'video') return;
      pcin.getSenders().forEach((sender) => {
        if (!sender) return;
        if (!sender.track) return;
        if (sender.track.kind != 'video') return;

        sender.replaceTrack(tr);
      });
    });
  }

  shareScreen(pcin, lsin) {
    const nm_vi = {
      video: true,
      audio: false,
      preferCurrentTab: false,
      selfBrowserSurface: "exclude",
      monitorTypeSurfaces: "include"
    }

    window.navigator.mediaDevices.getDisplayMedia(nm_vi)
      .then(st => {
        this.actButton();

        this._sendWs();

        this.sharedStream = st;
        let vtr = this.sharedStream.getVideoTracks()[0];

        vtr.onended = () => {
          this.videoBack(pcin, lsin);
        };

        pcin.getSenders().forEach((sender) => {
          if (!sender) return;
          if (!sender.track) return;
          if (sender.track.kind != 'video') return;

          sender.replaceTrack(vtr);
        });
      })
      .catch(e => {
        console.log('----------- error -------------');
        console.error(e);
      });
  }

  toggleShare(pcin, lsin) {
    if (this.sharedStream) {
      this.videoBack(pcin, lsin);
      return;
    }

    this.shareScreen(pcin, lsin);
  }

  endSessionShare() {
    if (this.sharedStream) {
      this.sharedStream.getTracks().forEach(tra => tra.stop());
    }
    this.sharedStream = null;
  }
}
