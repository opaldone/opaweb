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
        RREC: "remrec",
        CHAT: "chat"
      }
    };

    this.doc = $(document);
    this.bd = $('body');

    this.vid_self = $('#vid-self').eq(0);

    this.th = null;

    this.id_talkers = 'talkers'
    this.talkers_cont = document.getElementById(this.id_talkers);
    this.res = new Resie(this.talkers_cont);

    $(window).on( "resize", this.docResize.bind(this));

    this.ch_sound = $('#cb-mic').eq(0);
    this.ch_sound.change(this.avChange.bind(this));
    this.ch_video = $('#cb-cam').eq(0);
    this.ch_video.change(this.avChange.bind(this));

    this.share_screen = $('#share-screen').eq(0);
    this.share_screen.click(this.toggleShareScreen.bind(this));

    this.saver_client = new SaverClient();
    this.tg_rec = $('#tg-rec').eq(0);
    this.tg_rec.click(this.toggleRecordClent.bind(this));

    this.tg_rec_serv = $('#tg-rec-serv').eq(0);
    this.tg_rec_serv.click(this.toggleRecordServ.bind(this));

    this.KEYS = new Set();
    this.doc.bind('keydown', this.dockd.bind(this));
    this.doc.bind('keyup', this.docku.bind(this));
  }

  dockd(e) {
    if (!this.th) return;

    this.KEYS.add(e.which);

    // Alt+Shift+Ctr+i
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

  docResize() {
    this.res.resize();
  }

  vidSelfChange(cam) {
    if (!this.vid_self[0]) return;

    if (cam) {
      this.vid_self.css({'opacity': 1});
      return;
    }

    this.vid_self.css({'opacity': 0});
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
    let ob = {
      'ws': this.ws,
      'bd': this.bd,
      'id_talkers': this.id_talkers,
      'talkers_cont': this.talkers_cont,
      'res': this.res,
      'callError': this.onError,
      'vid_self': null,
      'doc': this.doc
    };

    if (this.vid_self[0] != undefined) {
      ob.vid_self = this.vid_self[0];
    }

    this.th = new TalkerHandler(ob);
    this.th.startShow()

    this.vidSelfChange(this.ws.cam);
  }

  wsClose() {
    this.wsClear()
  }

  getAvSet() {
    let se = {
      'sound': this.ch_sound.prop('checked'),
      'video': this.ch_video.prop('checked'),
      'screen_on': this.share_screen.is('.on')
    };

    this.vidSelfChange(se.video);

    return se;
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

  toggleShareScreen(ev) {
    if (!this.th) return;

    let btn = $(ev.currentTarget);

    this.th.toggleScreen(btn, this.getAvSet.bind(this));
  }

  toggleRecordServ(ev) {
    if (!this.th) return;

    let btn = $(ev.currentTarget);

    this.th.toggleRecordServ(btn);
  }

  toggleRecordClent(ev) {
    if (!this.th) return;

    let some_button = $(ev.currentTarget);

    this.th.toggleRecordClent(this.saver_client, some_button);
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
          this.th.startedRecordServ(msg.content);
          break;
        case this.ws.TPS.AREC:
          this.th.anotherRecordServ(this.tg_rec_serv, msg.content);
          break;
        case this.ws.TPS.EREC:
          this.th.stoppedRecordServ(this.tg_rec_serv, msg.content);
          break;
        case this.ws.TPS.CHAT:
          this.th.procChatMessage(msg.content);
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
