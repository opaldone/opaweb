;"use strict";
class Starter {
  constructor() {
    this.fun = new Funcs();
    this.fun.ready(this.handler.bind(this));

    this.nik_name = null;
    this.start_ws = null;
    this.ws_main = null;

    this.is_mobile = false;
    this.ix_vids = null;
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

  docon() {
    this.ix_vids.set_del_vid_click();
    this.ix_vids.set_dur();

    document.querySelectorAll('.camic-button').forEach(btn_rb => {
      if (this.fun.once(btn_rb, 'btn_rb_click')) return;
      btn_rb.addEventListener('click', this.btn_rb_click.bind(this));
    });

    let cp_link = document.getElementById('cp-link');
    if (!this.fun.once(cp_link, 'cp_link_click')) {
      cp_link.addEventListener('click', this.cp_link_click.bind(this));
    }

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
    this.ix_vids = new IxVids(this.fun);

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
