class TabUsers {
  constructor() {
    this.tb_us_cnt = document.getElementById('tb-us-cnt');
    this.ul_users = document.getElementById('ta-ul-users');
  }

  set_count_users() {
    let len = this.ul_users.children.length;
    this.tb_us_cnt.textContent = len;
  }

  create_el_user(elid, oc) {
    let cls = 'talker-uset';

    if (oc.recording) {
      cls = cls + ' ' + 'rec';
    }

    if (oc.crecording) {
      cls = cls + ' ' + 'crec';
    }

    let lis = `
        <li id="#LID#" class="${cls}">
          <div class="talker-uset-nik">#NIK#</div>
          <div class="talker-user-icos">
          ${window.icos()}
          </div>
        </li>`;

    let litID = elid + '-lit';

    lis = lis
      .replace(/#LID#/, litID)
      .replace(/#NIK#/, oc.nik);

    let tem = document.createElement('template');
    tem.innerHTML = lis;
    let li_set = tem.content.querySelector('li');
    this.ul_users.prepend(li_set);

    this.set_count_users();

    return li_set;
  }

  remove_el_user(elid) {
    let litID = elid + '-lit';

    let li = document.getElementById(litID);

    if (!li) return;

    li.remove();

    this.set_count_users();
  }
}
