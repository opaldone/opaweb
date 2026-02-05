class TalkerHandler {
  constructor(fun_in, oin_in, is_virt_in) {
    this.fun = fun_in;
    this.oin = oin_in;
    this.is_virt = is_virt_in;

    this.CC = {
      'video': '-vid',
      'audio': '-au',
      'nik': '-nik',
      'uset': '-uset'
    };

    this.talkers = {};
    this.pc = null;
    this.localStream = null;
    this.sharedStream = null;
    this.media = {
      audio: false,
      video: false
    };
    this.servers = {
      iceServers: this.oin.ws.iceList
    };

    if (!this.is_virt) {
      this.taber = new Taber(this.fun, {
        'ws': this.oin.ws
      });
    }
  }

  initTalker(elid) {
    if (this.talkers[elid] == undefined) this.talkers[elid] = {};
  }

  setMicCam(oc) {
    let elc = oc['el_container'];
    let el = oc['el_uset'];

    el.classList.remove('mic');
    el.classList.remove('cam');
    elc.classList.remove('cam');

    if (oc.mic) el.classList.add('mic');

    if (oc.cam) {
      elc.classList.add('cam');
      el.classList.add('cam');
    }
  }

  shareScreen(some_button, fnSe) {
    window.navigator.mediaDevices.getDisplayMedia({'audio': false, 'video': true})
      .then(st => {
        some_button.classList.add('on');

        let se = fnSe();

        let jo = {
          'tp': this.oin.ws.TPS.SCRE,
          'content': JSON.stringify(se)
        };
        this.oin.ws.handler.send(JSON.stringify(jo));

        this.sharedStream = st;
        let vtr = this.sharedStream.getVideoTracks()[0];

        vtr.onended = () => {
          this.videoBack(some_button, fnSe);
        };

        this.pc.getSenders().forEach((sender) => {
          if (!sender) return;
          if (!sender.track) return;

          if (sender.track.kind == 'video') {
            sender.replaceTrack(vtr);
          }
        });
      })
      .catch(e => {
        this.oin.showLog(e, true)
      });
  }

  videoBack(some_button, fnSe) {
    this.sharedStream.getTracks().forEach(tra => tra.stop());
    this.sharedStream = null;
    some_button.classList.remove('on');

    let se = fnSe();

    let jo = {
      'tp': this.oin.ws.TPS.SCRE,
      'content': JSON.stringify(se)
    };
    this.oin.ws.handler.send(JSON.stringify(jo));

    this.localStream.getTracks().forEach(tr => {
      if (tr.kind == 'video') {
        this.pc.getSenders().forEach((sender) => {
          if (!sender) return;
          if (!sender.track) return;

          if (sender.track.kind == 'video') {
            sender.replaceTrack(tr);
          }
        });
      }
    });
  }

  avcChanged(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse avcChanged", true)
    }

    let oc = this.talkers[js.strid];
    if (!oc) return;

    oc.mic = js.mic;
    oc.cam = js.cam;

    this.setMicCam(oc);
  }

  screeChanged(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse screeChanged", true)
    }

    let oc = this.talkers[js.strid];
    if (!oc) return;

    let cont_vw = document.getElementById(js.strid);

    if (js.screen_on) {
      cont_vw.classList.add(this.oin.scr_on);
      document.body.classList.add(this.oin.scr_on);
      if (!oc.screen_on) oc.screen_on = true;
      this.oin.res.resize();

      return;
    }

    cont_vw.classList.remove(this.oin.scr_on);

    if (oc.screen_on) oc.screen_on = false;

    oc.mic = js.mic;
    oc.cam = js.cam;

    this.setMicCam(oc);

    document.body.classList.remove(this.oin.scr_on);
    this.oin.res.resize();
  }

  toggleScreen(some_button, fnSe) {
    if (!this.pc) return;

    if (this.sharedStream) {
      this.videoBack(some_button, fnSe)
      return;
    }

    this.shareScreen(some_button, fnSe)
  }

  beginRecServ(some_button) {
    let jo = {
      'tp': this.oin.ws.TPS.BREC,
    };

    this.oin.ws.handler.send(JSON.stringify(jo));

    some_button.classList.add('on');
  }

  stopRecServ() {
    let jo = {
      'tp': this.oin.ws.TPS.EREC,
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  startedRecordServ(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      this.oin.showLog("Failed to parse startedRecordServ", true);
      return;
    }

    let oc = this.talkers[js.strid];
    if (!oc) return;

    let el = oc['el_uset'];
    el.classList.add('rec');
  }

  stoppedRecordServ(some_button, cont) {
    if (!some_button) return;

    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse stoppedRecordServ", true);
    }

    this.setDownloadLinkServ(some_button, js);

    let oc = this.talkers[js.strid];

    if (!oc) {
      return;
    }

    let el = oc['el_uset'];
    el.classList.remove('rec');

    if (oc.recording) oc.recording = false;
  }

  procChatMessage(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse procChatMessage", true);
    }

    if (js.uquser == this.oin.ws.uquser) {
      this.taber.create_el_chat('', js.chat_message);
      return;
    }

    let oc = this.talkers[js.strid];
    if (!oc) return;

    this.taber.create_el_chat(oc.nik, js.chat_message);
  }

  setDownloadLinkServ(some_button, js) {
    if (!js.uquser) return;

    if (js.uquser != this.oin.ws.uquser) return;

    if (!js.vili) return;

    if (some_button.classList.contains('on')) {
      some_button.classList.remove('on');
    }

    let lire = document.getElementById('li-re');

    if (!lire) return ;

    let he = lire.getAttribute('data-he');
    let re = lire.getAttribute('data-re');
    he = he.replace('xxx', this.oin.ws.uqroom).replace('yyy', js.vili);

    let sv = new Saver(this.oin.ws, lire, js.vili, re);
    sv.download(he, (file) => {
      sv.save(file);
    });
  }

  toggleRecordServ(some_button) {
    if (!this.pc) return;

    if (some_button.classList.contains('on')) {
      this.stopRecServ();
      return;
    }

    const some_rec = document.querySelector('.talker-uset.rec');

    if (some_rec) return;

    this.beginRecServ(some_button);
  }

  toggleRecordClent(sv, some_button_in) {
    if (some_button_in.classList.contains('on')) {
      sv.stopCapture();
      return;
    }

    sv.startCapture(this.oin.ws.uqroom, some_button_in, this.talkers, this.localStream);
    return;
  }

  setMediaSettings(ds) {
    let imax = ds.length
    for (let i = 0; i < imax; i++) {
      if (~ds[i].kind.indexOf('audio') && !this.media.audio) {
        this.media.audio = true
        continue
      }
      if (~ds[i].kind.indexOf('video') && !this.media.video) {
        this.media.video = true
        continue
      }
      if (this.media.video && this.media.audio) break
    }
  }

  onIceCandidate(e) {
    if (!e.candidate) return

    if (!this.oin.ws.handler) return

    let jo = {
      'tp': this.oin.ws.TPS.CANDIDATE,
      'content': JSON.stringify(e.candidate)
    }

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  removeMediaTag(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse removeMediaTag", true);
    }

    let elid = js.strid;

    if (!elid) return;

    let oc = this.talkers[elid];

    if (!oc) return;

    this.oin.res.clear_one_el(oc['el_container']);

    oc['el_container'].remove();
    delete this.talkers[elid];

    this.taber.remove_el_user(elid);

    this.oin.res.resize()
  }

  clientOnTrack(e) {
    let str = e.streams[0]
    let elid = str.id

    this.initTalker(elid);

    this.talkers[elid][e.track.kind] = str;

    this.oin.who_con();
  }

  call(invis) {
    this.pc = new RTCPeerConnection(this.servers)

    this.pc.onicecandidate = e => this.onIceCandidate(e);
    this.pc.ontrack = this.clientOnTrack.bind(this);

    if (this.localStream != null) {
      this.localStream.getTracks().forEach(track => {
        this.pc.addTrack(track, this.localStream)
      });
    }

    this.oin.ws.invis = invis;

    let jo = {
      'tp': this.oin.ws.TPS.JOINROOM,
      'content': JSON.stringify({
        'sound': this.oin.ws.mic,
        'video': this.oin.ws.cam,
        'invis': this.oin.ws.invis,
      })
    }

    this.oin.ws.handler.send(JSON.stringify(jo));

    if (this.oin.vid_self) {
      this.oin.vid_self.srcObject = this.localStream;
    }
  }

  startShow(self_mic) {
    if (this.oin.ws.virt) {
      this.call(true);
      return;
    }

    window.navigator.mediaDevices.enumerateDevices()
      .then(ds => {
        this.setMediaSettings(ds)
        return window.navigator.mediaDevices.getUserMedia(this.media)
      })
      .then(stream => {
        this.localStream = stream;

        if (this.oin.vw_self) {
          this.doMeter(this.localStream, this.oin.vw_self);
          this.changeLocalStream(self_mic);
        }

        this.call(false);
      })
      .catch(e => {
        this.oin.showLog('startShow: ' + e.message, true);
        this.oin.clear_if_block();
        this.call(true);
      });
  }

  setCandidate(content) {
    let cand = JSON.parse(content)

    if (!cand) {
      return this.oin.showLog("failed to parse candidate", true);
    }

    this.pc.addIceCandidate(cand)
  }

  setOffer(content) {
    let offer = JSON.parse(content);

    if (!offer) {
      return this.oin.showLog("failed to parse offer", true);
    }

    this.pc.setRemoteDescription(offer);
    this.pc.createAnswer().then(answer => {
      this.pc.setLocalDescription(answer);

      let jo = {
        'tp': this.oin.ws.TPS.ANSWER,
        'content': JSON.stringify(answer)
      }

      this.oin.ws.handler.send(JSON.stringify(jo));
    });
  }

  firstletters(sent) {
    const words = sent.split(' ');

    const letters = words.map(wo => {
      if (wo.length == 0) return '';
      return wo[0];
    });

    return letters.join('');
  }

  createTalker(elid, oc) {
    let videoID = elid + this.CC.video;
    let audioID = elid + this.CC.audio;
    let nikID = elid + this.CC.nik;

    let nik_el = document.createElement('div');
    nik_el.id = nikID;
    nik_el.classList.add('talker-nik');
    let nik_text_f = document.createTextNode(oc.nik);
    let nik_text_s = document.createTextNode(this.firstletters(oc.nik));
    let sp_nik_f = document.createElement('span');
    let sp_nik_s = document.createElement('span');
    sp_nik_f.classList.add('talker-nik-f');
    sp_nik_s.classList.add('talker-nik-s');
    sp_nik_f.appendChild(nik_text_f);
    sp_nik_s.appendChild(nik_text_s);
    nik_el.appendChild(sp_nik_f);
    nik_el.appendChild(sp_nik_s);

    let vid = document.createElement('video');
    vid.id = videoID;
    vid.muted = true;
    vid.autoplay = true;
    vid.controls = false;
    if (oc['video']) {
      vid.srcObject = oc['video'];
    }

    // We create audio cause user didn't click the video checkbox before start chatting,
    // we'll receive only audio stream
    let au = document.createElement('audio');
    au.id = audioID;
    au.autoplay = true;
    au.muted = false;
    au.controls = false;
    if (oc['audio']) {
      au.srcObject = oc['audio'];
    }

    let ta_co = document.createElement('div');
    ta_co.classList.add('vw');
    ta_co.id = elid;
    if (oc.screen_on) {
      ta_co.classList.add(this.oin.scr_on);
      document.body.classList.add(this.oin.scr_on);
    }

    ta_co.appendChild(vid);
    ta_co.appendChild(au);
    ta_co.appendChild(nik_el);

    this.oin.talkers_cont.appendChild(ta_co);

    let uset_el = null;
    if (this.taber) {
      uset_el = this.taber.create_el_user(elid, oc);
    }

    oc['el_video'] = vid;
    oc['el_audio'] = au;
    oc['el_container'] = ta_co;
    oc['el_nik'] = nik_el;
    oc['el_uset'] = uset_el;

    this.setMicCam(oc);
    this.doMeter(oc['audio'], ta_co);
    this.oin.res.resize();
  }

  checkTalkers() {
    for (let tk in this.talkers) {
      let oc = this.talkers[tk];
      if (oc == undefined) continue;

      let vid = oc['el_video'];
      let au = oc['el_audio']
      let mkv = oc['video'];
      let mka = oc['audio'];

      if (vid == undefined) continue;
      if (au == undefined) continue;
      if (mkv == undefined) continue;
      if (mka == undefined) continue;

      vid.srcObject = mkv;
      au.srcObject = mka;
    }
  }

  pushTalkers(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse pushTalkers", true);
    }

    if (!js.list) {
      return this.oin.showLog("No list pushTalkers", true);
    }

    let list = js.list;

    for (let elid in list) {
      this.initTalker(elid);
      let oc = this.talkers[elid];
      let lio = list[elid];
      oc.uquser = lio.uquser;
      oc.nik = lio.nik;
      oc.mic = lio.mic;
      oc.cam = lio.cam;
      oc.recording = lio.recording;
      oc.screen_on = lio.screen_on;

      if (oc['el_container']) {
        continue;
      }

      this.createTalker(elid, oc);
    }

    this.checkTalkers();
  }

  doMeter(str, vcont) {
    if (str == undefined) return;

    if (!vcont.data) {
      vcont.data = {
        'stop_speak_tm': null,
        'set_one_tm': null
      };
    }

    const ctx = new AudioContext();

    ctx.audioWorklet.addModule('/static/js/elems/vmeter.js')
      .then(() => {
        const mic = ctx.createMediaStreamSource(str);
        const meter = new AudioWorkletNode(ctx, 'volume-meter');

        meter.port.onmessage = ({data}) => {
          let eda = data * 1000;
          if (eda < 30) return;


          if (vcont.data.stop_speak_tm) {
            clearTimeout(vcont.data.stop_speak_tm);
            vcont.data.stop_speak_tm = null;
          }

          vcont.classList.add('speak');

          vcont.data.stop_speak_tm = setTimeout(() => {
            vcont.classList.remove('speak');
            if (vcont.data.set_one_tm) {
              clearTimeout(vcont.data.set_one_tm);
              vcont.data.set_one_tm = null;
            }
          }, 1000);

          if (!vcont.data.set_one_tm) {
            vcont.data.set_one_tm = setTimeout(() => {
              this.oin.res.change_one(vcont)
            }, 5000);
          }
        };

        mic.connect(meter).connect(ctx.destination);
      })
      .catch(e => {
        this.oin.showLog(e, true);
      });
  }

  changeLocalStream(mic) {
    if (!this.localStream) return;

    const autr = this.localStream.getAudioTracks();

    autr.forEach(tr => {
      if (mic) {
        tr.enabled = true;
        return;
      }

      tr.enabled = false;
    });
  }

  endSession() {
    if (!this.pc) return;

    this.pc.close()
    this.pc = null
  }

  console_something() {
    console.log(this.talkers);
  }
}
