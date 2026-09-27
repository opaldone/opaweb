class Taber {
  constructor(fun_in, oin) {
    this.fun = fun_in;
    this.oin = oin;

    this.tab_chat = new TabChat(this.fun, this.oin);
    this.tab_users = new TabUsers();

    this.tb = document.getElementById('v-tabs');
    this.tb_btn_chat = document.getElementById('tab-tb-chat');
    this.tb_chat = document.getElementById('tb-chat');

    this.ul_set_sound = document.getElementById('set-list-au');
    this.ul_set_video = document.getElementById('set-list-vi');

    this.taids = [];
    document.querySelectorAll('.tab-btn').forEach(el => {
      let elid = el.getAttribute('id');
      if (!this.taids.includes(elid)) {
        this.taids.push(elid);
      }
      if (!this.fun.once(el, 'tb_click')) {
        el.addEventListener('click', this.tb_click.bind(this));
      }
    });

    if (!this.fun.once(this.tb_btn_chat, 'tb_btn_chat_click')) {
      this.tb_btn_chat.addEventListener('click', this.tb_btn_chat_click.bind(this))
    }
  }

  _rem_cls(tid) {
    this.tb.classList.remove(tid);
    document.getElementById(tid).classList.remove('act');
  }

  _add_cls(tid) {
    this.tb.classList.add(tid);
    document.getElementById(tid).classList.add('act');
  }

  _clear_cls(tid) {
    this.taids.forEach((sid) => {
      if (sid == tid) return;
      this._rem_cls(sid);
    });
  }

  _click_tid(tid) {
    if (this.tb.classList.contains(tid)) {
      return;
    }

    this._add_cls(tid);
    this._clear_cls(tid);
  }

  tb_btn_chat_click(e) {
    let btn = e.currentTarget;
    let isa = btn.classList.contains('act');

    if (isa) {
      this.tb.classList.remove('sh');
      btn.classList.remove('act');
      return;
    }

    if (this.tb.classList.length == 0) {
      let tid = btn.getAttribute('data-tid');
      this._click_tid(tid);
    }

    this.tab_chat._clear_notif(this.tb, this.tb_btn_chat, this.tb_chat);
    this.tb.classList.add('sh');
    btn.classList.add('act');
  }

  tb_click(e) {
    let btn = e.currentTarget;
    let tid = btn.getAttribute('id');
    this._click_tid(tid);
    this.tab_chat._clear_notif(this.tb, this.tb_btn_chat, this.tb_chat);
  }

  set_count_users() {
    let len = this.ul_users.children.length;
    this.tb_us_cnt.textContent = len;
  }

  create_el_user(elid, oc) {
    let cls = 'talker-uset';

    if (oc.recording) {
      cls = cls + ' ' + 'rec';
    }

    if (oc.crecording) {
      cls = cls + ' ' + 'crec';
    }

    let lis = `
        <li id="#LID#" class="${cls}">
          <div class="talker-uset-nik">#NIK#</div>
          <div class="talker-user-icos">
          ${window.icos()}
          </div>
        </li>`;

    let litID = elid + '-lit';

    lis = lis
      .replace(/#LID#/, litID)
      .replace(/#NIK#/, oc.nik);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    let li_set = tem.content.querySelector('li');
    this.ul_users.prepend(li_set);

    this.set_count_users();

    return li_set;
  }

  remove_el_user(elid) {
    let litID = elid + '-lit';

    let li = document.getElementById(litID);

    if (!li) return;

    li.remove();

    this.set_count_users();
  }

  list_settings(str) {
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

        this.oin.talker.addClickSettings();
      });
  }

  create_el_chat(nik_in, msg_in) {
    this.tab_chat.create_el_chat(nik_in, msg_in, this.tb, this.tb_btn_chat, this.tb_chat);
  }
}
