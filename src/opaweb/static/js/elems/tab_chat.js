class TabChat {
  constructor(oin_in) {
    this.oin = oin_in;

    this.tb_chat = document.getElementById('tb-chat');
    this.inp_chat = document.getElementById('ta-chat-inp');
    this.ul_chat = document.getElementById('ta-ul-chat');
    this.inp_file = document.getElementById('chat-image-file');
    this.btn_file = document.getElementById('chat-image-button');

    if (!window.fun.once(this.inp_chat, 'inp_chat_press')) {
      this.inp_chat.addEventListener('keypress', this.inp_chat_press.bind(this));
    }

    if (!window.fun.once(this.btn_file, 'btn_file_click')) {
      this.btn_file.addEventListener('click', this.btn_file_click.bind(this));
    }

    if (!window.fun.once(this.inp_file, 'inp_file_click')) {
      this.inp_file.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (!window.fun.once(this.inp_file, 'inp_file_change')) {
      this.inp_file.addEventListener('change', this.inp_file_change.bind(this));
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
    if (!this.oin.ws.handler) return;
    if (msg.length == 0) return;

    let jo = {
      'tp': this.oin.ws.TPS.CHAT,
      'content': msg
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  send_file(se) {
    if (!this.oin.ws.handler) return;

    let jo = {
      'tp': this.oin.ws.TPS.CHATFILE,
      'content': JSON.stringify(se)
    };

    this.oin.ws.handler.send(JSON.stringify(jo));
  }

  inp_chat_send() {
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
      this.inp_chat_send();
      e.preventDefault();
      return false;
    }

    return true;
  }

  btn_file_click(e) {
    e.stopPropagation();
    e.preventDefault();

    this.inp_file.click();

    return false;
  }

  inp_file_change(e) {
    let fl = e.target.files[0];

    if (!fl) return;

    const reader = new FileReader();

    reader.onload = (et) => {
      this.send_file({
        "file_name": fl.name,
        "content": et.target.result
      });
    }

    reader.readAsDataURL(fl);
  }

  img_click(e) {
    const img = e.currentTarget;

    const dlg = new Dlg();
    dlg.show({
      'screen_class': 'big',
      'img_src': img.src
    });
  }

  set_image_click() {
    this.ul_chat.querySelectorAll('.chat-img-item').forEach(el => {
      if (window.fun.once(el, 'img_click')) return;
      el.addEventListener('click', this.img_click.bind(this));
    });
  }

  _get_msg_p(msg_in) {
    return msg_in.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  _get_msg_file(msg_in) {
    let js = JSON.parse(msg_in);
    let img = '<div class="ch-img-cont"><img src="' + js.content + '" class="chat-img-item" alt="' +  js.file_name + '" /></div>';
    return img;
  }

  create_el_chat(nik_in, msg_in, tb_in, tb_btn_toggle_in, msgcon) {
    const is_file = (msgcon == this.oin.ws.TPS.CHATFILE);

    let isme = nik_in.length == 0;

    let lis = '<li#CLS#> \
      <div class="chat-item-cont">';

    if (!isme) {
      lis += '<div class="cha-nik">#NIK#</div>';
    }

    let msg_class = 'cha-msg';
    if (is_file) {
      msg_class = 'cha-msg-file';
    }

    lis += '<div class="' + msg_class + '">#MSG#</div> \
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

    let msg_p = '';
    if (is_file) {
      msg_p = this._get_msg_file(msg_in);
    } else {
      msg_p = this._get_msg_p(msg_in);
    }

    lis = lis
      .replace(/#NIK#/, nik_in)
      .replace(/#TM#/, tms)
      .replace(/#MSG#/, msg_p);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    tem.content.querySelectorAll('li').forEach(li => {
      this.ul_chat.append(li);
    });

    this.set_image_click();
    this.ul_chat.scrollTop = this.ul_chat.scrollHeight;
    this._add_notif(tb_in, tb_btn_toggle_in);
  }
}
