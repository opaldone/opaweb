class WSchat {
  constructor() {
    this.ws = {
      uqroom: null,
      uquser: null,
      nik: null,
      wsurl: '',
      perroom: 0,
      handler: null,
      mic: false,
      cam: false,
      virt: false,
      iceList: null,
      TPS: {
        JOINROOM: "joinroom",
        CANDIDATE: "candidate",
        OFFER: "offer",
        ANSWER: "answer",
        WHOCO: "whoco",
        ROOMCON: "roomcon",
        TCON: "tcon",
        AVC: "avc",
        AVCD: "avcd",
        SCRE: "screen",
        SCRECD: "screencd",
        BREC: "beginrecord",
        EREC: "endrecord",
        AREC: "anotherrecord",
        RREC: "remrec"
      }
    };

    this.doc = $(document);
    this.bd = $('body');

    this.th = null;

    this.id_talkers = 'talkers'
    this.talkers_cont = document.getElementById(this.id_talkers);
    this.res = new Resie(this.talkers_cont);

    $(window).on( "resize", this.doc_resize.bind(this));

    this.ch_sound = $('#cb-mic').eq(0);
    this.ch_sound.change(this.avChange.bind(this));
    this.ch_video = $('#cb-cam').eq(0);
    this.ch_video.change(this.avChange.bind(this));

    this.share_screen = $('#share-screen').eq(0);
    this.share_screen.click(this.shareScreenChange.bind(this));

    this.tg_rec = $('#tg-rec').eq(0);
    this.tg_rec.click(this.toggleRecord.bind(this));

    this.KEYS = new Set();
    this.doc.bind('keydown', this.dockd.bind(this));
    this.doc.bind('keyup', this.docku.bind(this));
  }

  dockd(e) {
    if (!this.th) return;

    this.KEYS.add(e.which);

    if (
      this.KEYS.has(17) &&
      this.KEYS.has(16) &&
      this.KEYS.has(18) &&
      this.KEYS.has(73)
    ) {
      this.th.console_something();
    }
  }

  docku(e) {
    if (!this.th) return;

    this.KEYS.delete(e.which);
  }

  onError(err) {
    console.log(err);
  }

  doc_resize() {
    this.res.resize();
  }

  wsClear() {
    this.ws.handler = null;
  }

  connectWs(re) {
    this.wsClear();

    this.ws.uqroom = re.uqroom;
    this.ws.uquser = re.uquser;
    this.ws.nik = re.nik;
    this.ws.wsurl = re.wsurl;
    this.ws.perroom = re.perroom;
    this.ws.cam = re.cam;
    this.ws.mic = re.mic;
    this.ws.virt = re.virt;
    this.ws.iceList = re.iceList;

    this.startWs()
  }

  startWs() {
    this.ws.handler = new WebSocket(this.ws.wsurl);
    this.ws.handler.onopen = this.wsOpen.bind(this);
    this.ws.handler.onclose = this.wsClose.bind(this);
    this.ws.handler.onmessage = this.wsMessage.bind(this);
  }

  wsOpen() {
    this.talk()
  }

  talk() {
    this.th = new TalkerHandler({
      'ws': this.ws,
      'bd': this.bd,
      'id_talkers': this.id_talkers,
      'talkers_cont': this.talkers_cont,
      'res': this.res,
      'callError': this.onError,
    })

    this.th.startShow()
  }

  wsClose(e) {
    console.log('https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent')
    console.log(e)
    this.wsClear()
  }

  getAvSet() {
    return {
      'sound': this.ch_sound.prop('checked'),
      'video': this.ch_video.prop('checked'),
      'screen_on': this.share_screen.is('.on')
    };
  }

  avChange(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    if (!this.ws.handler) return false;

    let se = this.getAvSet();

    if (se.screen_on && !se.video) {
      se.video = true;
    }

    let jo = {
      'tp': this.ws.TPS.AVC,
      'content': JSON.stringify(se)
    };

    this.ws.handler.send(JSON.stringify(jo));

    return false;
  }

  shareScreenChange(ev) {
    if (!this.th) return;
    let btn = $(ev.currentTarget);
    let se = this.getAvSet();

    this.th.toggleScreen(btn, se);
  }

  toggleRecord(ev) {
    if (!this.th) return;

    let btn = $(ev.currentTarget);
    this.th.toggleRecord(btn);
  }

  wsMessage(e) {
    if (this.th == null) return;

    let jsi = e.data.split("\n");

    for (let i in jsi) {
      let msg = JSON.parse(jsi[i]);

      switch (msg.tp) {
        case this.ws.TPS.OFFER:
          this.th.setOffer(msg.content);
          break;
        case this.ws.TPS.CANDIDATE:
          this.th.setCandidate(msg.content);
          break;
        case this.ws.TPS.TCON:
          this.th.pushTalkers(msg.content);
          break;
        case this.ws.TPS.AVCD:
          this.th.avcChanged(msg.content);
          break
        case this.ws.TPS.SCRECD:
          this.th.screeChanged(msg.content);
          break;
        case this.ws.TPS.BREC:
          this.th.startedRecord(msg.content);
          break;
        case this.ws.TPS.AREC:
          this.th.anotherRecord(this.tg_rec, msg.content);
          break;
        case this.ws.TPS.EREC:
          this.th.stoppedRecord(msg.content);
          break;
      }
    }
  }

  closeWs() {
    if (!this.th) return;

    this.th.endSession();
    window.location.reload();
  }
}
