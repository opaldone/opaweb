class IxVids {
  constructor(fun_in) {
    this.fun = fun_in;
  }

  get_dur(sec) {
    const ho = Math.round(Math.floor(sec / 3600));
    const mi = Math.round(Math.floor((sec % 3600) / 60));
    const se = Math.round(sec % 60);

    const fho = String(ho).padStart(2, '0');
    const fmi = String(mi).padStart(2, '0');
    const fse = String(se).padStart(2, '0');

    return `${fho}:${fmi}:${fse}`;
  }

  _dur(vid, liel) {
    let dur = liel.querySelector('.li-st-dur');
    const dstr = this.get_dur(vid.duration);
    dur.innerHTML = dstr;
  }

  set_dur() {
    let self = this;
    document.querySelectorAll('.list-vid-li').forEach((liel) => {
      let vid = liel.querySelector('.vid-dur');

      if (vid.readyState >= 1) {
        self._dur(vid, liel);
        return;
      }

      vid.addEventListener('loadedmetadata', (e) => {
        let vith = e.currentTarget;
        self._dur(vith, liel);
      });

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

    let cs = document.getElementsByName('gorilla.csrf.Token')[0].value;

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
        let lidt = parli.getAttribute('data-lidt');
        let contul = self.fun.parent(parli, '#list-vid');
        if (!contul) return false;
        let cont = self.fun.parent(contul, '.ws-st-cone');
        if (!cont) return false;

        parli.remove();

        let colis = contul.querySelectorAll('[data-lidt="' + lidt + '"]').length;
        if (colis == 0) {
          let li_lidt = document.getElementById('lidtvi-' + lidt);
          if (li_lidt) li_lidt.remove();
        }

        if (contul.children.length == 0) {
          cont.remove();
        }
      })
      .catch(err => {
        console.log(err);
      });

    return false;
  }

  set_del_vid_click() {
    document.querySelectorAll('.delvid').forEach(del_btn => {
      if (this.fun.once(del_btn, 'del_vid_click')) return;
      del_btn.addEventListener('click', this.del_vid_click.bind(this));
    });
  }
}
