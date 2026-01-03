class WSchat {
  constructor(fun_in, is_virt_in) {
    this.is_virt = is_virt_in;
    this.fun = fun_in;

    this.ws = {
      uqroom: null,
      uquser: null,
      nik: null,
      wsurl: '',
      perroom: 0,
      handler: null,
      mic: false,
      cam: false,
      invis: false,
      virt: false,
      iceList: null,
      TPS: {
        JOINROOM: "joinroom",
        CANDIDATE: "candidate",
        OFFER: "offer",
        ANSWER: "answer",
        WHOCO: "whoco",
        WHOCOINV: "whocoinv",
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
        CHAT: "chat",
        TALKERST: "talkerstopped"
      }
    };

    this.scr_on = 'screen-on';

    this.v_list_hint = document.getElementById('v-list-hint');
    this.vid_self = document.getElementById('vid-self');

    this.th = null;

    this.id_talkers = 'talkers'
    this.talkers_cont = document.getElementById(this.id_talkers);
    this.res = new Resie(this.talkers_cont, this.scr_on);

    window.addEventListener('resize', this.docResize.bind(this));

    this.loga = null;

    if (!this.is_virt) {
      this.ch_sound = document.getElementById('cb-mic');
      this.ch_sound.addEventListener('change', this.avChange.bind(this));
      this.ch_video = document.getElementById('cb-cam');
      this.ch_video.addEventListener('change', this.avChange.bind(this));

      this.share_screen = document.getElementById('share-screen');
      this.share_screen.addEventListener('click', this.toggleShareScreen.bind(this));

      this.saver_client = new SaverClient();
      this.tg_rec = document.getElementById('tg-rec');
      this.tg_rec.addEventListener('click', this.toggleRecordClent.bind(this));

      this.tg_rec_serv = document.getElementById('tg-rec-serv');
      if (this.tg_rec_serv) {
        this.tg_rec_serv.addEventListener('click', this.toggleRecordServ.bind(this));
      }

      this.KEYS = new Set();
      document.addEventListener('keydown', this.dockd.bind(this));
      document.addEventListener('keyup', this.docku.bind(this));

      this.loga = new Loga(this.fun);
    }
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

  showLog(msg, err) {
    if (!this.loga) return;

    this.loga.add_log(msg, err);
  }

  docResize() {
    this.res.resize();
  }

  vidSelfChange(cam) {
    if (!this.vid_self) return;

    if (cam) {
      this.v_list_hint.classList.remove('hide');
      return;
    }

    this.v_list_hint.classList.add('hide');
  }

  getAvSet() {
    let se = {
      'sound': this.ch_sound.checked,
      'video': this.ch_video.checked,
      'screen_on': this.share_screen.classList.contains('on')
    };

    this.vidSelfChange(se.video);

    return se;
  }

  rem_button(el, ch) {
    let par = this.fun.parent(el, '.lbl-tha');

    if (ch) {
      par.classList.remove('checked');
    }

    par.remove();
  }

  clear_if_block() {
    this.ws.cam = false;
    this.ws.mic = false;

    this.ch_sound.checked = false;
    this.rem_button(this.ch_sound, true);

    this.ch_video.checked = false;
    this.rem_button(this.ch_video, true);

    this.rem_button(this.share_screen, false);
    this.rem_button(this.tg_rec_serv, false);
    this.rem_button(this.tg_rec, false);

    this.vidSelfChange(false);
  }

  who_con() {
    let jo = {
      'tp': this.ws.TPS.WHOCO,
      'content': ''
    }

    this.ws.handler.send(JSON.stringify(jo));
  }

  who_con_invis() {
    let jo = {
      'tp': this.ws.TPS.WHOCOINV,
      'content': ''
    }

    this.ws.handler.send(JSON.stringify(jo));
  }

  talk() {
    let ob = {
      'ws': this.ws,
      'id_talkers': this.id_talkers,
      'talkers_cont': this.talkers_cont,
      'res': this.res,
      'showLog': this.showLog.bind(this),
      'clear_if_block': this.clear_if_block.bind(this),
      'who_con': this.who_con.bind(this),
      'vid_self': null,
      'scr_on': this.scr_on
    };

    if (this.vid_self) {
      ob.vid_self = this.vid_self;
    }

    this.th = new TalkerHandler(this.fun, ob, this.is_virt);
    this.th.startShow()

    this.vidSelfChange(this.ws.cam);
  }


  wsClear() {
    this.ws.handler = null;
    if (!this.th) return;
    this.th.endSession();
  }

  wsError(ev) {
    this.showLog("WebSocket error: " + ev.target.url, true);
  }

  wsOpen() {
    this.talk()
    this.who_con_invis();
  }

  wsClose() {
    this.wsClear();
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
        case this.ws.TPS.TALKERST:
          this.th.removeMediaTag(msg.content);
          break;
      }
    }
  }

  startWs() {
    this.ws.handler = new WebSocket(this.ws.wsurl);
    this.ws.handler.onerror = this.wsError.bind(this);
    this.ws.handler.onopen = this.wsOpen.bind(this);
    this.ws.handler.onclose = this.wsClose.bind(this);
    this.ws.handler.onmessage = this.wsMessage.bind(this);
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

    let btn = ev.currentTarget;

    this.th.toggleScreen(btn, this.getAvSet.bind(this));
  }

  toggleRecordServ(ev) {
    if (!this.th) return;

    let btn = ev.currentTarget;

    this.th.toggleRecordServ(btn);
  }

  toggleRecordClent(ev) {
    if (!this.th) return;

    let some_button = ev.currentTarget;

    this.th.toggleRecordClent(this.saver_client, some_button);
  }
}
