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

  _viself(th, st) {
    if (!th.oin.vid_self) return;
    if (!th.oin.vw_self) return;

    if (st) {
      th.oin.vid_self.srcObject = st;
      document.body.classList.add(th.oin.scr_on);
      th.oin.vw_self.classList.add(th.oin.scr_on);
      th.oin.res.resize();
      return;
    }

    th.oin.vid_self.srcObject = th.localStream;
    document.body.classList.remove(th.oin.scr_on);
    th.oin.vw_self.classList.remove(th.oin.scr_on);
    th.oin.res.resize();
  }

  videoBack(th) {
    this.sharedStream.getTracks().forEach(tra => tra.stop());
    this.sharedStream = null;

    this.deaButton();

    this._sendWs();

    this._viself(th, null);

    th.localStream.getTracks().forEach(tr => {
      if (tr.kind != 'video') return;

      th.pc.getSenders().forEach((sender) => {
        if (!sender) return;
        if (!sender.track) return;
        if (sender.track.kind != 'video') return;

        sender.replaceTrack(tr);
      });
    });
  }

  shareScreen(th) {
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

        this._viself(th, st);

        this.sharedStream = st;
        let vtr = this.sharedStream.getVideoTracks()[0];

        vtr.onended = () => {
          this.videoBack(th);
        };

        th.pc.getSenders().forEach((sender) => {
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

  toggleShare(th) {
    if (this.sharedStream) {
      this.videoBack(th);
      return;
    }

    this.shareScreen(th);
  }

  endSessionShare() {
    if (this.sharedStream) {
      this.sharedStream.getTracks().forEach(tra => tra.stop());
    }
    this.sharedStream = null;
  }
}
