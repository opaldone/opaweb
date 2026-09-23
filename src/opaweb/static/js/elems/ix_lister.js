class IxLister {
  constructor() {
    this.list = null;
    this.tm_ix = null;
    this.users = {};

    this.show_list();
  }

  cl_tm() {
    clearTimeout(this.tm_ix);
    this.tm_ix = null;
  }

  new_el(litID, va) {
    let lis = `<li id="#LID#" class="ws-st-li">
          <div class="talker-uset-nik">#NIK#</div>
        </li>`;

    lis = lis
      .replace(/#LID#/, litID)
      .replace(/#NIK#/, va.nik);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    let li_set = tem.content.querySelector('li');

    return li_set;
  }

  make_el(litID, va) {
    const el = document.getElementById(litID);
    if (el) return null;
    return this.new_el(litID, va);
  }

  sync_cnt() {
    const cnt = this.list.children.length;

    if (cnt > 0) {
      this.list.classList.add('sh');
      return;
    }

    this.list.classList.remove('sh');
  }

  del_items() {
    this.list.querySelectorAll('.ws-st-li').forEach(el => {
      const lid = el.id;

      if (this.users[lid]) return;

      el.remove();
    });

    this.sync_cnt();
  }

  sync_list() {
    this.del_items();

    Object.keys(this.users).forEach(k => {
      const va = this.users[k];
      const el = this.make_el(k, va);

      if (!el) return;

      this.list.append(el);
    });

    this.sync_cnt();
  }

  axi() {
    this.list = document.getElementById('ws-st-list');

    if (!this.list) {
      this.cl_tm();
      return false;
    }

    const hre = this.list.getAttribute('data-hre');

    axios.post(hre)
      .then((re) => {
        this.users = {};

        if (re.data.res.length == 0) {
          this.sync_list();
          return true;
        }

        const js = JSON.parse(re.data.res);

        if (!js) {
          this.sync_list();
          return true;
        }

        Object.keys(js.list).forEach(k => {
          const litID = k + '-wsix';
          const va = js.list[k];

          this.users[litID] = {
            'nik': va.nik
          };
        });

        this.sync_list();
      })
      .catch(err => {
        console.log(err);
      });

    return true;
  }

  show_list() {
    let is_list = this.axi();

    if (!is_list) return;

    this.tm_ix = setTimeout(() => {
      this.show_list();
    }, 3000);
  }
}
