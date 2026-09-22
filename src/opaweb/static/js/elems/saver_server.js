class SaverServer {
  constructor(fun_in, oin_in) {
    this.fun = fun_in;
    this.oin = oin_in;
    this.tmrec = null;
    this.secs = 0;
    this.TIMER_SEC = 3;
    this.retm = document.getElementById('rec-serv-timer');
  }

  getLbl() {
    return this.fun.parent(this.oin.button, '.lbl-tha');
  }

  toggleHint() {
    const thint = this.oin.button.getAttribute('data-thint');
    const hint = this.oin.button.getAttribute('data-hint');
    this.oin.button.setAttribute('data-hint', thint);
    this.oin.button.setAttribute('data-thint', hint);
  }

  clear_timer_rec() {
    clearTimeout(this.tmrec);
    this.tmrec = null;
  }

  updateSecs() {
    const dt = new Date(this.secs * 1000);
    const va = dt.toISOString().substring(11, 19);
    this.retm.textContent = va;
    this.secs += this.TIMER_SEC;
  }

  updateRecTimer(url, cs, obj) {
    self = this;

    self.tmrec = setTimeout(() => {
      axios.post(url, obj, {
        headers: { 'X-CSRF-Token': cs }
      })
      .then(() => {
        self.updateSecs()
        self.updateRecTimer(url, cs, obj);
      })
      .catch(err => {
        self.oin.showLog('updateRecTimer: ' + err.message, true);
      })
    }, (self.TIMER_SEC * 1000));
  }

  actButton() {
    if (!this.oin.button) return;

    this.secs = 0;
    this.updateSecs();

    const lbl = this.getLbl();
    lbl.classList.add('tm');

    this.oin.button.classList.add('on');
  }

  deaButton() {
    if (!this.oin.button) return;

    this.clear_timer_rec();

    const lbl = this.getLbl();
    lbl.classList.remove('tm');

    this.oin.button.classList.remove('on');
  }

  startRec() {
    let self = this;
    self.toggleHint();

    let obj = {
      'uqroom': self.oin.ws.uqroom
    };
    let cs = document.getElementsByName('gorilla.csrf.Token')[0].value;
    let url = self.oin.button.getAttribute('data-recstart');

    axios.post(url, obj, {
      headers: { 'X-CSRF-Token': cs }
    })
      .then(() => {
        let jo = {
          'tp': self.oin.ws.TPS.BREC
        };

        self.oin.ws.handler.send(JSON.stringify(jo));

        self.actButton()

        let url_up = self.oin.button.getAttribute('data-recupt');
        self.updateRecTimer(url_up, cs, obj);
      })
      .catch(err => {
        self.oin.showLog('startRec: ' + err.message, true);
      });
  }

  stopRec() {
    let self = this;
    self.toggleHint();

    let obj = {
      'uqroom': self.oin.ws.uqroom
    };
    let cs = document.getElementsByName('gorilla.csrf.Token')[0].value;
    let url = self.oin.button.getAttribute('data-recstop');

    axios.post(url, obj, {
      headers: { 'X-CSRF-Token': cs }
    })
      .then(() => {
        self.deaButton();
      })
      .catch(err => {
        self.oin.showLog('stopRec: ' + err.message, true);
      });
  }

  toggleRecord() {
    if (this.oin.button.classList.contains('on')) {
      this.stopRec();
      return;
    }

    if (document.querySelector('.talker-uset.rec')) return;

    if (!confirm('Do You really want to start server recording?')) {
      return;
    }

    this.startRec();
  }
}
