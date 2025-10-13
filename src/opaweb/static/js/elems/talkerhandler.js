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

  anotherRecordServ(some_button, cont) {
    if (!some_button) return;

    if (some_button.classList.contains('on')) {
      some_button.classList.remove('on');
    }

    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse anotherRecordServ", true);
    }

    let oc = this.talkers[js.strid];
    if (!oc) return;

    let el = oc['el_container'];
    el.classList.add('allert-rec');

    setTimeout(() => {
      el.classList.remove('allert-rec');
    }, 3000);
  }

  startedRecordServ(cont) {
    let js = JSON.parse(cont);

    if (!js) {
      return this.oin.showLog("Failed to parse startedRecordServ", true);
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

    this.beginRecServ(some_button);
    return;
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

  startShow() {
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

  getUsetEl(id_in, oc) {
    let mc_h = ' \
      <span class="ico-h ra-ico mic"> \
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> \
          <path d="M7.88932 1.48242C7.4473 1.48242 7.02337 1.66972 6.71081 2.00312C6.39825 2.33652 6.22266 2.7887 6.22266 3.2602V8.00094C6.22266 8.47244 6.39825 8.92462 6.71081 9.25802C7.02337 9.59142 7.4473 9.77872 7.88932 9.77872C8.33135 9.77872 8.75527 9.59142 9.06783 9.25802C9.3804 8.92462 9.55599 8.47244 9.55599 8.00094V3.2602C9.55599 2.7887 9.3804 2.33652 9.06783 2.00312C8.75527 1.66972 8.33135 1.48242 7.88932 1.48242Z" stroke="#A9A9B1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          <path d="M11.7778 6.81445V7.99964C11.7778 9.0998 11.3681 10.1549 10.6387 10.9328C9.90944 11.7108 8.92029 12.1478 7.88889 12.1478C6.85749 12.1478 5.86834 11.7108 5.13903 10.9328C4.40972 10.1549 4 9.0998 4 7.99964V6.81445" stroke="#A9A9B1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          <path d="M7.89062 12.1484V14.5188" stroke="#A9A9B1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          <path d="M5.66797 14.5176H10.1124" stroke="#A9A9B1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
        </svg> \
      </span> \
      <span class="ico-c ra-ico mic"> \
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> \
          <path d="M7.89062 12.1484V14.5188" stroke="#979797" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          <path d="M5.66797 14.5176H10.1124" stroke="#979797" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0278 7.97516V7.99964C11.0278 8.53533 10.911 9.05513 10.6952 9.52124L11.803 10.6291C12.0502 10.2188 12.2374 9.77301 12.3596 9.30695L11.0278 7.97516ZM12.5278 7.35384V6.81445C12.5278 6.40024 12.192 6.06445 11.7778 6.06445C11.6245 6.06445 11.482 6.11042 11.3633 6.18932L12.5278 7.35384ZM7.88889 11.3978C8.56577 11.3978 9.22696 11.1603 9.77113 10.7185L10.8356 11.783C10.0136 12.4967 8.97465 12.8978 7.88889 12.8978C6.64239 12.8978 5.45755 12.3692 4.59188 11.4458C3.72774 10.524 3.25 9.28365 3.25 7.99964V6.81445C3.25 6.40024 3.58579 6.06445 4 6.06445C4.41421 6.06445 4.75 6.40024 4.75 6.81445V7.99964C4.75 8.91594 5.0917 9.78575 5.68618 10.4199C6.27913 11.0523 7.0726 11.3978 7.88889 11.3978Z" fill="#979797"/> \
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.47266 3.2602C5.47266 3.00973 5.50824 2.76187 5.57719 2.52457L6.97266 3.92004V5.79871L5.47266 4.29871V3.2602ZM5.47266 6.42004V8.00094C5.47266 8.65629 5.71627 9.29376 6.16366 9.77098C6.61258 10.2498 7.23219 10.5287 7.88932 10.5287C8.35667 10.5287 8.80505 10.3877 9.18654 10.1339L8.06265 9.01003C8.00538 9.02247 7.94731 9.02872 7.88932 9.02872C7.6624 9.02872 7.43416 8.93301 7.25796 8.74506C7.08023 8.55548 6.97266 8.28858 6.97266 8.00094V7.92004L5.47266 6.42004ZM8.80599 7.63205L10.1278 8.95388C10.2449 8.65262 10.306 8.32902 10.306 8.00094V7.25337L8.80599 5.75337V7.63205ZM8.80599 3.2602V3.63205L10.306 5.13205V3.2602C10.306 2.60485 10.0624 1.96738 9.61499 1.49017C9.16606 1.01131 8.54645 0.732422 7.88932 0.732422C7.35133 0.732422 6.83848 0.919357 6.42386 1.24991L7.50272 2.32878C7.62504 2.26477 7.7574 2.23242 7.88932 2.23242C8.11625 2.23242 8.34448 2.32813 8.52068 2.51608C8.69842 2.70566 8.80599 2.97256 8.80599 3.2602Z" fill="#979797"/> \
          <path d="M3 1L15 13" stroke="#979797" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
        </svg> \
      </span> \
      <span class="ico-h ra-ico cam"> \
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> \
          <path d="M10.2863 7.05143V10.8571C10.2863 11.1602 10.1659 11.4509 9.95154 11.6653C9.73721 11.8796 9.44652 12 9.14341 12H2.8577C2.5546 12 2.26391 11.8796 2.04958 11.6653C1.83525 11.4509 1.71484 11.1602 1.71484 10.8571V5.14286C1.71484 4.83975 1.83525 4.54906 2.04958 4.33474C2.26391 4.12041 2.5546 4 2.8577 4H4.00056M10.2863 7.05143V5.14286C10.2863 4.83975 10.1659 4.54906 9.95154 4.33474C9.73721 4.12041 9.44652 4 9.14341 4H4.5M10.2863 7.05143L10.8577 7.62286L14.2863 5.14286V11L10.8577 8.23669" stroke="#A9A9B1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
        </svg> \
      </span> \
      <span class="ico-c ra-ico cam"> \
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> \
          <g clip-path="url(#clip0_418_29)"> \
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.22282 3.28348C4.15259 3.26172 4.07794 3.25 4.00056 3.25H2.8577C2.69287 3.25 2.53025 3.2715 2.37361 3.31295L3.81066 4.75H4.00056C4.08811 4.75 4.17216 4.735 4.25028 4.70742C4.32839 4.735 4.41245 4.75 4.5 4.75H5.68934L4.22282 3.28348ZM9.53627 6.47561V5.14286C9.53627 5.03867 9.49488 4.93874 9.42121 4.86507C9.34753 4.79139 9.24761 4.75 9.14341 4.75H7.81066L6.31066 3.25H9.14341C9.64543 3.25 10.1269 3.44943 10.4819 3.8044C10.8368 4.15938 11.0363 4.64084 11.0363 5.14286V6.56805L13.8467 4.53517C14.075 4.37004 14.3766 4.34679 14.6275 4.47496C14.8784 4.60313 15.0363 4.86111 15.0363 5.14286V11.6653C15.0363 11.7578 15.0195 11.8464 14.9889 11.9282L13.5363 10.4756V6.611L11.2973 8.23055C11.2961 8.23139 11.2949 8.23224 11.2937 8.23308L9.53627 6.47561ZM10.5085 9.5692L11.0028 10.0635C11.0246 10.1337 11.0363 10.2083 11.0363 10.2857V10.8571C11.0363 11.1719 10.9579 11.4787 10.8118 11.7512L9.53627 10.4756V10.2857C9.53627 9.8715 9.87206 9.53571 10.2863 9.53571C10.3637 9.53571 10.4383 9.54743 10.5085 9.5692ZM0.964844 5.14286C0.964844 4.82834 1.04312 4.52188 1.18889 4.24955L2.46484 5.5255V10.8571C2.46484 10.9613 2.50623 11.0613 2.57991 11.1349C2.65358 11.2086 2.75351 11.25 2.8577 11.25H8.18934L9.62663 12.6873C9.47025 12.7286 9.30794 12.75 9.14341 12.75H2.8577C2.35568 12.75 1.87423 12.5506 1.51925 12.1956C1.16427 11.8406 0.964844 11.3592 0.964844 10.8571V5.14286Z" fill="#979797"/> \
          <path d="M1.71484 1.71484L14.2863 14.2863" stroke="#979797" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> \
          </g> \
          <defs> \
          <clipPath id="clip0_418_29"> \
          <rect width="16" height="16" fill="white"/> \
          </clipPath> \
          </defs> \
        </svg> \
      </span> \
      <span class="ico-h ra-ico rec" title="Records the conversation"> \
        <svg width="20" height="20" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"> \
          <path class="pa-st" d="M30.0833 33.25H7.91667C7.07681 33.25 6.27136 32.9164 5.6775 32.3225C5.08363 31.7286 4.75 30.9232 4.75 30.0833V7.91667C4.75 7.07681 5.08363 6.27136 5.6775 5.6775C6.27136 5.08363 7.07681 4.75 7.91667 4.75H25.3333L33.25 12.6667V30.0833C33.25 30.9232 32.9164 31.7286 32.3225 32.3225C31.7286 32.9164 30.9232 33.25 30.0833 33.25Z" stroke="#ff5511" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> \
          <path class="pa-fi" fill-rule="evenodd" clip-rule="evenodd" d="M10 12V4.75H7.91667C7.07681 4.75 6.27136 5.08363 5.6775 5.6775C5.08363 6.27136 4.75 7.07681 4.75 7.91667V30.0833C4.75 30.9232 5.08363 31.7286 5.6775 32.3225C6.27136 32.9164 7.07681 33.25 7.91667 33.25H10V23C10 21.8954 10.8954 21 12 21H26C27.1046 21 28 21.8954 28 23V33.25H30.0833C30.9232 33.25 31.7286 32.9164 32.3225 32.3225C32.9164 31.7286 33.25 30.9232 33.25 30.0833V12.6667L25.3333 4.75H24V12C24 13.1046 23.1046 14 22 14H12C10.8954 14 10 13.1046 10 12Z" fill="#ff5511"/> \
          <path class="pa-fi" d="M10 4.75H11C11 4.19772 10.5523 3.75 10 3.75V4.75ZM5.6775 5.6775L4.97039 4.97039L4.97039 4.97039L5.6775 5.6775ZM5.6775 32.3225L6.3846 31.6154L6.3846 31.6154L5.6775 32.3225ZM10 33.25V34.25C10.5523 34.25 11 33.8023 11 33.25H10ZM28 33.25H27C27 33.8023 27.4477 34.25 28 34.25V33.25ZM32.3225 32.3225L31.6154 31.6154L31.6154 31.6154L32.3225 32.3225ZM33.25 12.6667H34.25C34.25 12.4015 34.1446 12.1471 33.9571 11.9596L33.25 12.6667ZM25.3333 4.75L26.0404 4.04289C25.8529 3.85536 25.5986 3.75 25.3333 3.75V4.75ZM24 4.75V3.75C23.4477 3.75 23 4.19772 23 4.75H24ZM9 4.75V12H11V4.75H9ZM7.91667 5.75H10V3.75H7.91667V5.75ZM6.3846 6.3846C6.79093 5.97827 7.34203 5.75 7.91667 5.75V3.75C6.8116 3.75 5.75179 4.18899 4.97039 4.97039L6.3846 6.3846ZM5.75 7.91667C5.75 7.34203 5.97827 6.79093 6.3846 6.3846L4.97039 4.97039C4.18899 5.75179 3.75 6.8116 3.75 7.91667H5.75ZM5.75 30.0833V7.91667H3.75V30.0833H5.75ZM6.3846 31.6154C5.97827 31.2091 5.75 30.658 5.75 30.0833H3.75C3.75 31.1884 4.18899 32.2482 4.97039 33.0296L6.3846 31.6154ZM7.91667 32.25C7.34203 32.25 6.79093 32.0217 6.3846 31.6154L4.97039 33.0296C5.75179 33.811 6.8116 34.25 7.91667 34.25V32.25ZM10 32.25H7.91667V34.25H10V32.25ZM9 23V33.25H11V23H9ZM12 20C10.3431 20 9 21.3431 9 23H11C11 22.4477 11.4477 22 12 22V20ZM26 20H12V22H26V20ZM29 23C29 21.3431 27.6569 20 26 20V22C26.5523 22 27 22.4477 27 23H29ZM29 33.25V23H27V33.25H29ZM30.0833 32.25H28V34.25H30.0833V32.25ZM31.6154 31.6154C31.2091 32.0217 30.658 32.25 30.0833 32.25V34.25C31.1884 34.25 32.2482 33.811 33.0296 33.0296L31.6154 31.6154ZM32.25 30.0833C32.25 30.658 32.0217 31.2091 31.6154 31.6154L33.0296 33.0296C33.811 32.2482 34.25 31.1884 34.25 30.0833H32.25ZM32.25 12.6667V30.0833H34.25V12.6667H32.25ZM24.6262 5.45711L32.5429 13.3738L33.9571 11.9596L26.0404 4.04289L24.6262 5.45711ZM24 5.75H25.3333V3.75H24V5.75ZM25 12V4.75H23V12H25ZM22 15C23.6569 15 25 13.6569 25 12H23C23 12.5523 22.5523 13 22 13V15ZM12 15H22V13H12V15ZM9 12C9 13.6569 10.3431 15 12 15V13C11.4477 13 11 12.5523 11 12H9Z" fill="#ff5511"/> \
        </svg> \
      </span> \
    ';

    let el = document.createElement('div');
    el.id = id_in;

    el.classList.add('talker-uset');

    if (oc.recording) el.classList.add('rec');

    el.innerHTML = mc_h;

    return el;
  }

  createTalker(elid, oc) {
    let videoID = elid + this.CC.video;
    let audioID = elid + this.CC.audio;
    let nikID = elid + this.CC.nik;
    let usetID = elid + this.CC.uset;

    let nik_el = document.createElement('span');
    nik_el.id = nikID;
    nik_el.classList.add('talker-nik');
    let nik_text = document.createTextNode(oc.nik);
    nik_el.appendChild(nik_text);

    let uset_el = this.getUsetEl(usetID, oc);

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
    ta_co.appendChild(uset_el);

    this.oin.talkers_cont.appendChild(ta_co);

    if (this.taber) {
      this.taber.create_el_user(elid, oc);
    }

    oc['el_video'] = vid;
    oc['el_audio'] = au;
    oc['el_container'] = ta_co;
    oc['el_nik'] = nik_el;
    oc['el_uset'] = uset_el;

    this.setMicCam(oc);
    this.doMeter(oc['audio'], ta_co);
    this.oin.res.resize()
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

    const ctx = new AudioContext();
    ctx.audioWorklet.addModule('/static/js/elems/vmeter.js')
      .then(() => {
        const micNode = ctx.createMediaStreamSource(str);
        const volumeMeterNode = new AudioWorkletNode(ctx, 'volume-meter');

        volumeMeterNode.port.onmessage = ({data}) => {
          let eda = data * 1000;
          if (eda < 50) return;

          if (vcont.hide_timer) {
            clearTimeout(vcont.hide_timer);
            vcont.hide_timer = 0;
          }

          vcont.style.outline = "3px solid #579957";

          vcont.hide_timer = setTimeout(() => {
            vcont.style.outline = "none";
          }, 500);
        };
        micNode.connect(volumeMeterNode).connect(ctx.destination);
      })
      .catch(e => {
        this.oin.showLog(e, true);
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
