class Taber {
  constructor (fun_in, oin) {
    this.fun = fun_in;
    this.oin = oin;

    this.tb = document.getElementById('v-tabs');
    this.tb_btn_chat = document.getElementById('tab-tb-chat');
    this.tb_us_cnt = document.getElementById('tb-us-cnt');
    this.tb_chat = document.getElementById('tb-chat');

    this.inp_chat = document.getElementById('ta-chat-inp');
    this.btn_chat = document.getElementById('ta-chat-send');

    this.ul_chat = document.getElementById('ta-ul-chat');
    this.ul_users = document.getElementById('ta-ul-users');

    this.inp_chat.addEventListener('keypress', this.inp_chat_press.bind(this));
    this.btn_chat.addEventListener('click', this.btn_chat_click.bind(this));

    this.taids = [];
    document.querySelectorAll('.tab-btn').forEach(el => {
      let elid = el.getAttribute('id');
      if (!this.taids.includes(elid)) {
        this.taids.push(elid);
      }
      el.addEventListener('click', this.tb_click.bind(this));
    });

    this.tb_btn_chat.addEventListener('click', this.tb_btn_chat_click.bind(this))
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

  _clear_notif() {
    if (!this.tb.classList.contains('tb-chat')) return;

    setTimeout(() => {
      this.tb_btn_chat.classList.remove('notif');
      this.tb_chat.classList.remove('notif');
      this.inp_chat.focus();
    }, 300);
  }

  _add_notif() {
    if (
      !this.tb.classList.contains('tb-chat') ||
      (this.tb.classList.contains('tb-chat') && !this.tb.classList.contains('sh'))
    ) {
      this.tb_btn_chat.classList.add('notif');
      this.tb_chat.classList.add('notif');
    }
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

    this._clear_notif();
    this.tb.classList.add('sh');
    btn.classList.add('act');
  }

  tb_click(e) {
    let btn = e.currentTarget;
    let tid = btn.getAttribute('id');
    this._click_tid(tid);
    this._clear_notif();
  }

  send_message(msg) {
    if (msg.length == 0) return;

    let jo = {
      'tp': this.oin.ws.TPS.CHAT,
      'content': msg
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  btn_chat_click() {
    let msg = this.inp_chat.value;

    this.send_message(msg);

    this.inp_chat.value = '';
    this.inp_chat.focus();
  }

  inp_chat_press(e) {
    e.stopPropagation();

    if (
      e.ctrlKey ||
      e.shiftKey
    ) {
      return true;
    }

    if (e.keyCode == 13) {
      this.fun.trigger(this.btn_chat, 'click');
      e.preventDefault();
      return false;
    }

    return true;
  }

  create_el_chat(nik_in, msg_in) {
    let isme = nik_in.length == 0;

    let lis = '<li#CLS#> \
      <div class="chat-item-cont">';

    if (!isme) {
      lis += '<div class="cha-nik">#NIK#</div>';
    }

    lis += '<div class="cha-msg">#MSG#</div> \
      <div class="ch-tm">#TM#</div> \
      </div> \
      </li>';

    if (isme) {
      lis = lis.replace(/#CLS#/g, ' class="me"');
    } else {
      lis = lis.replace(/#CLS#/g, '');
    }

    let d = new Date();
    let tms = ('0' + d.getHours().toString()).slice(-2) + ':' +
      ('0' + d.getMinutes().toString()).slice(-2);

    let msg_p = msg_in.replace(/(?:\r\n|\r|\n)/g, '<br>');

    lis = lis
      .replace(/#NIK#/, nik_in)
      .replace(/#TM#/, tms)
      .replace(/#MSG#/, msg_p);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    tem.content.querySelectorAll('li').forEach(li => {
      this.ul_chat.append(li);
    });

    this.ul_chat.scrollTop = this.ul_chat.scrollHeight;

    this._add_notif();
  }

  set_count_users() {
    let len = this.ul_users.children.length;
    this.tb_us_cnt.textContent = len;
  }

  icos() {
    let mc_h = `
      <span class="ico-h ra-ico mic" title="Mic is on">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path stroke="#979797" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 10.5A5.5 5.5 0 0 1 12 16m0 0a5.5 5.5 0 0 1-5.5-5.5M12 16v4m-4 0h4m0 0h4m-4-7a2.5 2.5 0 0 1-2.5-2.5v-4a2.5 2.5 0 0 1 5 0v4A2.5 2.5 0 0 1 12 13Z"/>
        </svg>
      </span>
      <span class="ico-c ra-ico mic" title="Mic is off">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke="#575757" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 4 16 16M6.5 10.5A5.5 5.5 0 0 0 12 16v4m-4 0h4m0 0h4M9.5 9V6.5a2.5 2.5 0 0 1 5 0v4a2.5 2.5 0 0 1-1.5 2.292m4.5-2.292c0 1.93-.803 3.523-2.309 4.504"/>
        </svg>
      </span>
      <span class="ico-h ra-ico cam" title="Camera is on">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><g stroke="#979797" stroke-width="2"><path d="M20 17V8a1 1 0 0 0-1-1h-2.382a1 1 0 0 1-.894-.553l-.448-.894A1 1 0 0 0 14.382 5H9.618a1 1 0 0 0-.894.553l-.448.894A1 1 0 0 1 7.382 7H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></g></svg>
      </span>
      <span class="ico-c ra-ico cam" title="Camera is off">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><g stroke="#575757" stroke-linecap="round" stroke-width="2"><path d="m3 5 16 16M20 18V8a1 1 0 0 0-1-1h-2.382a1 1 0 0 1-.894-.553l-.448-.894A1 1 0 0 0 14.382 5H9.721a1 1 0 0 0-.949.684L8.5 6.5M16 18H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1v0"/><path d="M11 9.17A3 3 0 0 1 14.83 13"/></g></svg>
      </span>
      <span class="ico-h ra-ico rec" title="Recording on the server">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#979797" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9.036a3.485 3.485 0 0 1 1.975.99M4 12.5A3.5 3.5 0 0 0 7.5 16h9.75a2.75 2.75 0 0 0 .734-5.4A5 5 0 0 0 8.37 9.108 3.5 3.5 0 0 0 4 12.5z"/></svg>
      </span>
    `;

    return mc_h;
  }

  create_el_user(elid, oc) {
    let cls = 'talker-uset';

    if (oc.recording) {
      cls = cls + ' ' + 'rec';
    }

    let lis = `
        <li id="#LID#" class="${cls}">
          <div class="talker-uset-nik">#NIK#</div>
          <div class="talker-user-icos">
          ${this.icos()}
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
}
