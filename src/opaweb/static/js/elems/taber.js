class Taber {
  constructor (oin) {
    this.oin = oin;

    this.tb = $('#v-tabs').eq(0);
    this.ctrls = $('#tabs-control').eq(0);
    this.inp_chat = $('#ta-chat-inp').eq(0);
    this.btn_chat = $('#ta-chat-send').eq(0);
    this.tb_btn_chat = $('#tb-chat').eq(0);
    this.tb_us_cnt = $('#tb-us-cnt').eq(0);

    this.ul_chat = $('#ta-ul-chat').eq(0);
    this.ul_users = $('#ta-ul-users').eq(0);

    this.oin.doc.on('click', '.tab-btn', this.tb_click.bind(this));
    this.inp_chat.on('keypress', this.inp_chat_press.bind(this));
    this.btn_chat.on('click', this.btn_chat_click.bind(this));

    this.taids = [];
    $('.tab-btn').each((_, el) => {
      let elid = $(el).attr('id');
      this.taids.push(elid);
    });
  }

  _rem_cls(cls) {
    this.tb.removeClass(cls);
    this.ctrls.removeClass(cls);
  }

  _add_cls(cls) {
    this.tb.addClass(cls);
    this.ctrls.addClass(cls);
  }

  _clear_cls(tid) {
    this.taids.forEach((sid) => {
      if (sid == tid) return;
      this._rem_cls(sid);
    });
  }

  tb_click(e) {
    let btn = $(e.currentTarget);
    let tid = btn.attr('id');
    let cl_tid = '.' + tid;

    if (this.tb.is(cl_tid)) {
      this._rem_cls(tid);
      return;
    }

    this._add_cls(tid);
    this._clear_cls(tid);

    if (tid == 'tb-chat') {
      setTimeout(() => {
        this.inp_chat.focus();
        this.tb_btn_chat.removeClass('notif');
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
    let msg = this.inp_chat.val();

    this.send_message(msg);

    this.inp_chat.val('');
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
      this.btn_chat.trigger('click');
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

    let li = $(lis);

    this.ul_chat.append(li);
    this.ul_chat.scrollTop(this.ul_chat[0].scrollHeight);

    if (!this.tb.is('.tb-chat')) {
      this.tb_btn_chat.addClass('notif');
    }
  }

  set_count_users() {
    let len = this.ul_users.children().length;
    this.tb_us_cnt.text(len + 1);
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

    let li = $(lis);
    this.ul_users.append(li);

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
