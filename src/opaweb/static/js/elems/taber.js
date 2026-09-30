class Taber {
  constructor(fun_in, oin) {
    this.fun = fun_in;
    this.oin = oin;

    this.tab_chat = new TabChat(this.fun, this.oin);
    this.tab_users = new TabUsers();
    this.tab_set = new TabSet(this.fun, this.oin);

    this.tb = document.getElementById('v-tabs');
    this.tb_btn_toggle = document.getElementById('tab-tb-toggle');

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

    if (!this.fun.once(this.tb_btn_toggle, 'tb_btn_toggle_click')) {
      this.tb_btn_toggle.addEventListener('click', this.tb_btn_toggle_click.bind(this))
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

  tb_btn_toggle_click(e) {
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

    this.tab_chat._clear_notif(this.tb, this.tb_btn_toggle);
    this.tb.classList.add('sh');
    btn.classList.add('act');
  }

  tb_click(e) {
    let btn = e.currentTarget;
    let tid = btn.getAttribute('id');
    this._click_tid(tid);
    this.tab_chat._clear_notif(this.tb, this.tb_btn_toggle);
  }

  create_el_user(elid, oc) {
    return this.tab_users.create_el_user(elid, oc);
  }

  remove_el_user(elid) {
    this.tab_users.remove_el_user(elid);
  }

  create_el_chat(nik_in, msg_in) {
    this.tab_chat.create_el_chat(nik_in, msg_in, this.tb, this.tb_btn_toggle);
  }

  list_settings() {
    this.tab_set.list_settings();
  }
}
