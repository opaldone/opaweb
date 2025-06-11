class Taber {
  constructor (fun_in, oin) {
    this.fun = fun_in;
    this.oin = oin;

    this.tb = document.getElementById('v-tabs');
    this.tb_btn_chat = document.getElementById('tb-chat');
    this.tb_us_cnt = document.getElementById('tb-us-cnt');

    this.inp_chat = document.getElementById('ta-chat-inp');
    this.btn_chat = document.getElementById('ta-chat-send');

    this.ul_chat = document.getElementById('ta-ul-chat');
    this.ul_users = document.getElementById('ta-ul-users');

    this.inp_chat.addEventListener('keypress', this.inp_chat_press.bind(this));
    this.btn_chat.addEventListener('click', this.btn_chat_click.bind(this));

    this.taids = [];
    document.querySelectorAll('.tab-btn').forEach(el => {
      let elid = el.getAttribute('id');
      this.taids.push(elid);
      el.addEventListener('click', this.tb_click.bind(this));
    });
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

  tb_click(e) {
    let btn = e.currentTarget;

    let tid = btn.getAttribute('id');

    if (this.tb.classList.contains(tid)) {
      this._rem_cls(tid);
      return;
    }

    this._add_cls(tid);
    this._clear_cls(tid);

    if (tid == 'tb-chat') {
      setTimeout(() => {
        this.inp_chat.focus();
        this.tb_btn_chat.classList.remove('notif');
      }, 300);
    }
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

    if (!this.tb.classList.contains('tb-chat')) {
      this.tb_btn_chat.classList.add('notif');
    }
  }

  set_count_users() {
    let len = this.ul_users.children.length;
    this.tb_us_cnt.textContent = len + 1;
  }

  create_el_user(elid, oc) {
    let lis = ' \
        <li id="#LID#"> \
            #NIK# \
        </li>';

    let litID = elid + '-lit';

    lis = lis
      .replace(/#LID#/, litID)
      .replace(/#NIK#/, oc.nik);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    tem.content.querySelectorAll('li').forEach(li => {
      this.ul_users.append(li);
    });

    this.set_count_users();
  }

  remove_el_user(elid) {
    let litID = elid + '-lit';

    let li = document.getElementById(litID);

    if (!li) return;

    li.remove();

    this.set_count_users();
  }
}
