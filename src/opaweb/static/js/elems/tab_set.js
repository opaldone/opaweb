class TabSet {
  constructor(fun_in, oin_in) {
    this.fun = fun_in;
    this.oin = oin_in;

    this.ul_set_sound = document.getElementById('set-list-au');
    this.ul_set_video = document.getElementById('set-list-vi');
    this.ta_settings = document.getElementById('ta-settings');

    this.tm_au = null;
  }

  _show_settings() {
    let len_au = parseInt(this.ul_set_sound.children.length);
    let len_vi = parseInt(this.ul_set_video.children.length);

    if (len_au > 0) this.ta_settings.classList.add('is-au');
    if (len_vi > 0) this.ta_settings.classList.add('is-vi');
  }

  _clear_tm_au() {
    if (!this.tm_au) return;
    clearTimeout(this.tm_au);
    this.tm_au = null;
  }

  _au_get_bool(val) {
    const el = document.getElementById(val);
    if (!el) return false;
    if (el.classList.contains('sel')) return true;
    return false;
  }

  _media(vid, did) {
    if (vid) {
      return {
        video: {
          deviceId: {
            exact: did
          }
        }
      };
    }

    return {
      audio: {
        deviceId: {
          exact: did
        },
        echoCancellation: this._au_get_bool('echoCancellation'),
        noiseSuppression: this._au_get_bool('noiseSuppression'),
        autoGainControl: this._au_get_bool('autoGainControl')
      }
    };
  }

  setting_change(did, tp) {
    const vid = tp === 'videoinput';
    const new_media = this._media(vid, did);

    let old_tr = null;
    if (vid) {
      old_tr = this.oin.talker.localStream.getVideoTracks()[0];
    } else {
      old_tr = this.oin.talker.localStream.getAudioTracks()[0];
    }

    if (!old_tr) return;

    old_tr.stop();

    window.navigator.mediaDevices.getUserMedia(new_media)
      .then(st => {
        let new_tr = null;
        if (vid) {
          new_tr = st.getVideoTracks()[0];
        } else {
          new_tr = st.getAudioTracks()[0];
        }

        this.oin.talker.localStream.removeTrack(old_tr);
        this.oin.talker.localStream.addTrack(new_tr);

        this.oin.talker.pc.getSenders().forEach((sender) => {
          if (!sender) return;
          if (!sender.track) return;
          if (vid && sender.track.kind != 'video') return;
          if (!vid && sender.track.kind != 'audio') return;

          sender.replaceTrack(new_tr);
        });
      })
      .catch(e => {
        console.log(e);
        this.oin.talker.oin.showLog('setting_change: ' + e.message, true);
      });
  }

  device_click(e) {
    if (!this.oin.talker.pc) return;
    if (!this.oin.talker.localStream) return;

    const el = e.currentTarget;
    const did = el.getAttribute('id');
    const tp = el.getAttribute('data-tp');
    const sel = document.querySelector('.item-set.sel[data-tp="' + tp + '"]');

    if (sel.getAttribute('id') == did) return;

    if (sel) {
      sel.classList.remove('sel');
    }
    el.classList.add('sel');

    this.setting_change(did, tp);
  }

  set_au_click(e) {
    this._clear_tm_au();

    if (!this.oin.talker.pc) return;
    if (!this.oin.talker.localStream) return;

    const el = e.currentTarget;
    const tp = 'audioinput';

    const sel_au = document.querySelector('.item-set.sel[data-tp="' + tp + '"]');
    if (!sel_au) return;
    const did = sel_au.getAttribute('id');
    if (!did) return;

    if (el.classList.contains('sel')) {
      el.classList.remove('sel');
    } else {
      el.classList.add('sel');
    }

    this.tm_au = setTimeout(() => {
      this.setting_change(did, tp);
    }, 1000);
  }

  addClickSettings() {
    document.querySelectorAll('.item-set').forEach(el => {
      if (this.fun.once(el, 'device_click')) return;
      el.addEventListener('click', this.device_click.bind(this));
    });

    document.querySelectorAll('.item-set-au').forEach(el => {
      if (this.fun.once(el, 'set_au_click')) return;
      el.addEventListener('click', this.set_au_click.bind(this));
    });

    this._show_settings();
  }

  list_settings() {
    const str = this.oin.talker.localStream;

    const tra = str.getAudioTracks()[0];
    let did_au = '';
    let did_vi = '';
    if (tra) {
      did_au = tra.getSettings().deviceId;
    }
    const trv = str.getVideoTracks()[0];
    if (trv) {
      did_vi = trv.getSettings().deviceId;
    }

    let lis = `
        <li id="#LID#" class="item-set#CLS#" data-tp="#TP#">
          <div class="set-circ"></div>
          <div class="set-label">#LBL#</div>
        </li>`;

    window.navigator.mediaDevices.enumerateDevices()
      .then(list => {
        list.forEach(de => {
          let cls = '';
          let tag = lis;
          if (de.deviceId == did_au || de.deviceId == did_vi) {
            cls = ' sel';
          }

          tag = tag
            .replace(/#LID#/, de.deviceId)
            .replace(/#CLS#/, cls)
            .replace(/#TP#/, de.kind)
            .replace(/#LBL#/, de.label);

          let tem = document.createElement('template');
          tem.innerHTML = tag;
          let li_set = tem.content.querySelector('li');

          if (de.kind === 'audioinput') {
            this.ul_set_sound.append(li_set);
          }
          if (de.kind === 'videoinput') {
            this.ul_set_video.append(li_set);
          }
        });

        this.addClickSettings();
      });
  }
}
