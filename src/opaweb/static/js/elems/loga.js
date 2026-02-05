class Loga {
  constructor () {
    this.lg = document.getElementById('ta-ul-logs');
    this.lg_errors = document.getElementById('tb-err-cnt');
  }

  ref_log_cnt() {
    this.lg_errors.innerHTML = '';
    this.lg_errors.classList.remove('sh')

    let errs = this.lg.querySelectorAll('.err');
    let cc = errs.length;

    if (cc == 0) return;

    this.lg_errors.textContent = cc;
    this.lg_errors.classList.add('sh');
  }

  fm_tm(co) {
    return co < 10 ? '0' + co : co;
  }

  get_tm() {
    let nw = new Date();
    let ho = nw.getHours();
    let mi = nw.getMinutes();
    let se = nw.getSeconds();

    return this.fm_tm(ho) + ':' + this.fm_tm(mi) + ':' + this.fm_tm(se);
  }

  add_log(msg, err) {
    let si = '<li class="clearfix';
    if (err) {
      si += ' err';
    }
    si += '"><span class="lg-msg">' + msg + '</span>' +
      '<span class="lg-tm">' + this.get_tm() + '</span></li>';

    let tem = document.createElement('template');
    tem.innerHTML = si;

    this.lg.prepend(tem.content);

    setTimeout(() => {
      this.ref_log_cnt();
    }, 100);

    return false;
  }

}
