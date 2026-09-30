class TabChat {
  constructor(fun_in, oin_in) {
    this.fun = fun_in;
    this.oin = oin_in;

    this.tb_chat = document.getElementById('tb-chat');
    this.inp_chat = document.getElementById('ta-chat-inp');
    this.btn_chat = document.getElementById('ta-chat-send');
    this.ul_chat = document.getElementById('ta-ul-chat');

    if (!this.fun.once(this.inp_chat, 'inp_chat_press')) {
      this.inp_chat.addEventListener('keypress', this.inp_chat_press.bind(this));
    }

    if (!this.fun.once(this.btn_chat, 'btn_chat_click')) {
      this.btn_chat.addEventListener('click', this.btn_chat_click.bind(this));
    }
  }

  _clear_notif(tb_in, tb_btn_toggle_in) {
    if (!tb_in.classList.contains('tb-chat')) return;

    setTimeout(() => {
      tb_btn_toggle_in.classList.remove('notif');
      this.tb_chat.classList.remove('notif');
      this.inp_chat.focus();
    }, 300);
  }

  _add_notif(tb_in, tb_btn_toggle_in) {
    if (
      !tb_in.classList.contains('tb-chat') ||
      (tb_in.classList.contains('tb-chat') && !tb_in.classList.contains('sh'))
    ) {
      tb_btn_toggle_in.classList.add('notif');
      this.tb_chat.classList.add('notif');
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

  create_el_chat(nik_in, msg_in, tb_in, tb_btn_toggle_in) {
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

    this._add_notif(tb_in, tb_btn_toggle_in);
  }
}
