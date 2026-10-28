class PicVid {
  constructor(oin_in) {
    if (!document.pictureInPictureEnabled) {
      console.log('Picture-in-Picture is not supported in this browser.');
      return;
    }

    this.oin = oin_in;
    this.hidden = false;
    this.pica = null;

    document.addEventListener('visibilitychange', this.docvis.bind(this));
  }

  _setPica() {
    if (this.pica) return;
    if (!this.oin.talker.talkers) return;

    for (let tk in this.oin.talker.talkers) {
      const oc = this.oin.talker.talkers[tk];
      if (!oc) continue;
      if (!oc.cam && !oc.screen_on) continue;
      if (!oc.el_video) continue;

      this.pica = oc;
      return;
    }
  }

  _ePica() {
    this._setPica();
    return (this.pica != null && this.pica != undefined);
  }

  _req() {
    if (!this.pica) return;

    this.pica.el_video.requestPictureInPicture()
      .catch(e => {
        console.log('request pic_in_pic error:', e.message);
      });
  }

  showpic() {
    if (!this._ePica()) return;

    if (this.pica.el_video.readyState >= 1) {
      this._req();
      return;
    }

    this.pica.el_video.addEventListener('loadedmetadata', () => {
      this._req();
    }, {once: true});
  }

  hidepic() {
    this.pica = null;
    if (!document.pictureInPictureElement) return;

    document.exitPictureInPicture()
      .catch(e => {
        console.log('hidepic error', e.message);
      });
  }

  changePica() {
    if (!this.hidden) return;
    if (!this._ePica()) return;

    if (this.pica.cam || this.pica.screen_on) {
      this.showpic();
      return;
    }

    this.hidepic();
  }

  docvis() {
    if (document.hidden) {
      this.hidden = true;
      this.showpic();
      return;
    }

    this.hidden = false;
    this.hidepic();
  }
}
