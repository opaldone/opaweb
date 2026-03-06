;"use strict";
class Starter {
  constructor() {
    this.fun = new Funcs();
    this.fun.ready(this.handler.bind(this));

    this.nik_name = null;
    this.start_ws = null;
    this.ws_main = null;

    this.is_mobile = false;
  }

  nik_name_keyup(ev) {
    ev.stopPropagation();

    if (ev.key !== "Enter") return;

    this.fun.trigger(this.start_ws, 'click');

    ev.preventDefault();
  }

  multi_check(pa, ch, rot) {
    const is_rot = pa.classList.contains(rot);

    if (ch.checked && !is_rot) {
      pa.classList.add(rot);
      return;
    }

    pa.classList.remove(rot);

    if (ch.checked) {
      pa.classList.remove('checked');
      ch.checked = false;
      return;
    }

    pa.classList.add('checked');
    ch.checked = true;
  }

  btn_rb_click(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    let th = ev.currentTarget;
    let pa = this.fun.parent(th, '.lbl-tha');
    let ch = pa.querySelector('.tp-tha-rb');
    let rot = th.getAttribute('data-rot');

    if (rot && this.is_mobile) {
      this.multi_check(pa, ch, rot);
      this.fun.trigger(ch, 'change');
      return false;
    }

    if (ch.checked) {
      pa.classList.remove('checked');
      ch.checked = false;
    } else {
      pa.classList.add('checked');
      ch.checked = true;
    }

    this.fun.trigger(ch, 'change');

    return false;
  }

  cp_link_click(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    let btn = ev.currentTarget;
    const hre = window.location.href;
    const ar = hre.split('?');
    const buf = ar[0];

    navigator.clipboard.writeText(buf).then(() => {
      btn.setAttribute('data-hint', window.lang.re('The link has been copied'));
      setTimeout(() => {
        btn.setAttribute('data-hint', window.lang.re('Copy link'));
      }, 1000);
    });

    return false;
  }

  makeid(len) {
    var ret = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var cl = chars.length;
    for ( var i = 0; i < len; i++ ) {
      ret += chars.charAt(Math.floor(Math.random() * cl));
    }
    return ret;
  }

  remove_desk_elements() {
    document.querySelectorAll('.on-desk').forEach(el => {
      el.remove();
    });
  }

  del_vid_click(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    let self = this;

    let del_btn = ev.currentTarget;
    let uqroom = del_btn.getAttribute('data-roo');
    let filename = del_btn.getAttribute('data-fn');
    let url = del_btn.getAttribute('data-hre');

    if (!uqroom) return false;
    if (!filename) return false;
    if (!url) return false;

    if (!confirm('Do You really want to delete the video?')) {
      return false;
    }

    let cs = document.getElementsByName("gorilla.csrf.Token")[0].value;

    let obj = {
      'uqroom': uqroom,
      'fi': filename
    };

    axios.post(url, obj, {
      headers: { "X-CSRF-Token": cs }
    })
      .then((re) => {
        if (!re.data.res) return false;
        let parli = self.fun.parent(del_btn, '.list-vid-li');
        if (!parli) return false;
        let contul = self.fun.parent(parli, '#list-vid');
        if (!contul) return false;
        let cont = self.fun.parent(contul, '.ws-st-cone');
        if (!cont) return false;
        parli.remove();
        if (contul.children.length == 0) {
          cont.remove();
        }
      })
      .catch(err => {
        console.log(err);
      });

    return false;
  }

  docon() {
    document.querySelectorAll('.camic-button').forEach(btn_rb => {
      if (this.fun.once(btn_rb, 'btn_rb_click')) return;
      btn_rb.addEventListener('click', this.btn_rb_click.bind(this));
    });

    let cp_link = document.getElementById('cp-link');
    if (!this.fun.once(cp_link, 'cp_link_click')) {
      cp_link.addEventListener('click', this.cp_link_click.bind(this));
    }

    document.querySelectorAll('.delvid').forEach(del_btn => {
      if (this.fun.once(del_btn, 'del_btn_click')) return;
      del_btn.addEventListener('click', this.del_vid_click.bind(this));
    });

    if (this.is_mobile) {
      this.remove_desk_elements();
    }
  }

  start_ws_handler() {
    if (!this.start_ws) return;

    let mic_inp = document.getElementById('cb-mic');
    let cam_inp = document.getElementById('cb-cam');
    let uqr_inp = document.getElementById('uqroom');

    if (this.nik_name.value.length == 0) {
      this.nik_name.value = 'user_' + this.makeid(5);
    }

    let obj = {
      'uqroom': uqr_inp.value,
      'nik': this.nik_name.value,
      'mic': mic_inp.checked,
      'cam': cam_inp.checked
    };

    let cs = document.getElementsByName("gorilla.csrf.Token")[0].value;
    let url = this.start_ws.getAttribute('href');

    axios.post(url, obj, {
      headers: { "X-CSRF-Token": cs }
    })
      .then((re) => {
        this.ws_main.innerHTML = re.data.cont;

        this.docon();
        document.title = re.data.sets.nik;

        let ws = new WSchat(this.fun, false);
        ws.connectWs(re.data.sets);
      })
      .catch(err => {
        console.log(err);
      });
  }

  start_ws_click(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    this.start_ws_handler();

    return false;
  }

  handler() {
    this.is_mobile = window.is_mobile();

    this.nik_name = document.getElementById('nik-name');
    this.start_ws = document.getElementById('start-ws');
    this.ws_main = document.getElementById ('ws-main');

    let st = document.getElementById('start-now');

    if (st) {
      this.start_ws_handler();
      return
    }

    this.ws_main.classList.add('done');
    this.nik_name.addEventListener('keyup', this.nik_name_keyup.bind(this));
    this.start_ws.addEventListener('click', this.start_ws_click.bind(this));

    this.docon();
    this.nik_name.focus();
    new IxLister();
  }
}

new Starter();
