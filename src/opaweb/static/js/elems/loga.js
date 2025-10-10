class Loga {
  constructor (fun_in) {
    this.fun = fun_in;

    this.loga_cont = document.getElementById('loga-cont');
    this.loga_show = document.getElementById('self-vicont');
    this.ul_loga = document.getElementById('loga-list');

    if (!this.fun.once(this.loga_show, 'loga_show_click')) {
      this.loga_show.addEventListener('click', this.loga_show_click.bind(this));
    }
  }

  loga_show_click(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.loga_cont.classList.contains('show')) {
      this.loga_cont.classList.remove('show');

      return false;
    }

    this.loga_cont.classList.add('show');

    return false;
  }

  add_log(msg, err) {
    let lis = '<li';
    if (err) {
      lis += ' class="err"';
    }
    lis += '>' + msg + '</li>';

    let tem = document.createElement('template');
    tem.innerHTML = lis;

    tem.content.querySelectorAll('li').forEach(li => {
      this.ul_loga.prepend(li);
    });
  }
}
