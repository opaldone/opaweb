class Saver {
  constructor(ws_in, li_in, ke_in, re_in) {
    this.ws = ws_in;
    this.li = li_in;
    this.ke = ke_in;
    this.re = re_in;
  }

  download(file, callback) {
    let req = new XMLHttpRequest();
    req.responseType = 'blob';
    req.open('GET', file);

    req.addEventListener('error', () => {console.error("download error");});
    req.addEventListener('load', () => {
      callback(req.response);
    });

    req.send();
  }

  save(object) {
    let fi = 'vi_' + this.ws.uqroom + '_' + this.ke + '.webm';
    let url = URL.createObjectURL(object);

    this.li.href = url;
    this.li.download = fi;
    this.li.click();

    this.rem_file(fi);
  }

  rem_file(fi_in) {
    let self = this;

    let obj = {
      'uqroom': this.ws.uqroom,
      'ke': this.ke,
      'fi': fi_in
    };

    let cs = document.getElementsByName("gorilla.csrf.Token")[0].value;
    let url = this.re;

    axios.post(url, obj, {
      headers: { "X-CSRF-Token": cs }
    })
      .then(re => {
        if (re.data.res) {
          self.calling_rrec();
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  calling_rrec() {
    let jo = {
      'tp': this.ws.TPS.RREC
    };

    this.ws.handler.send(JSON.stringify(jo));
  }
}
