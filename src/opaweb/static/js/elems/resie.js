class Resie {
  _margin = 3;
  _ratio = this.ratio();
  _posi_cnt = 4;

  constructor(fun_in, dish_in, scr_on_in) {
    this.fun = fun_in;
    this._dish = dish_in;
    this.scr_on = scr_on_in;
    this._one = null;
    this.show_one = true;

    this.tg_tiles = document.getElementById('tg-tiles');
    if (this.tg_tiles) {
      this.tg_tiles.addEventListener('click', this.toggleTilesLayout.bind(this));
    }
  }

  ratio() {
    return 3 / 4;
  }

  dimensions() {
    this._width = this._dish.offsetWidth - (this._margin * 2);
    this._height = this._dish.offsetHeight - (this._margin * 2);
  }

  get_max_child(chi) {
    let imax = chi.length;

    let ret = 0;
    for (let s = 0; s < imax; s++) {
      let el = chi[s];

      if (window.getComputedStyle(el).display === 'none') continue;
      if (el.classList.contains(this.scr_on)) continue;

      ret++;
    }

    return ret;
  }

  area(increment, m_chi) {
    let i = 0;
    let w = 0;

    let h_ste = increment * this._ratio + (this._margin * 2);
    let w_ste = increment + (this._margin * 2);
    let h = h_ste;

    while (i < m_chi) {
      if ((w + increment) > this._width) {
        w = 0;
        h = h + h_ste;
      }
      w = w + w_ste;
      i++;
    }

    if (h > this._height || increment > this._width) return false;

    return increment;
  }

  resizer(width, chi) {
    let imax = chi.length;
    for (let s = 0; s < imax; s++) {
      let el = chi[s];

      if (window.getComputedStyle(el).display === 'none') continue;

      if (el.classList.contains(this.scr_on)) {
        if (el.style.width != '100%') {
          el.style.width = '100%';
        }
      } else {
        el.style.width = width + "px"
      }

      el.style.margin = this._margin + "px"
      el.style.height = (width * this._ratio) + "px"
    }
  }

  clear_styles(chi) {
    const imax = chi.length;
    for (let s = 0; s < imax; s++) {
      let el = chi[s];
      el.style.cssText = '';
    }
  }

  clear_one_el(el) {
    if (this._one != el) return;

    this._one = null;
  }

  change_one(el) {
    if (this._one == el) return;

    if (this._one) {
      this._one.classList.remove('one');
    }

    el.classList.add('one');
    this._one = el;
    this.resize()
  }

  set_one(chi, m_chi) {
    if (this._one) return;

    let one = this._dish.querySelector('.one');

    if (one) {
      this._one = one;
      return;
    }

    for (let s = 0; s < m_chi; s++) {
      let el = chi[s];
      if (el.id == 'vw-self') continue;
      el.classList.add('one');
      this._one = el;
      break;
    }
  }

  posi(chi, m_chi) {
    this.clear_styles(chi);

    this.set_one(chi, m_chi);

    this._dish.classList.remove('fle');
    this._dish.classList.add('gr');

    let one_wi = this._one.getBoundingClientRect().width;
    let ano_wi = one_wi / 3;

    this._one.style.height = (one_wi * this._ratio) + 'px';
    this._dish.style.width = (one_wi + ano_wi) + 'px';
  }

  hid_show_tg_tiles(m_chi) {
    if (!this.tg_tiles) return;

    let lbl = this.fun.parent(this.tg_tiles, '.lbl-tha');

    if (m_chi > this._posi_cnt) {
      lbl.classList.add('hid');
      return;
    }

    lbl.classList.remove('hid');
  }

  resize() {
    this._dish.style.cssText = '';
    const chi = this._dish.children;
    const m_chi = this.get_max_child(chi);

    this.hid_show_tg_tiles(m_chi);

    if (m_chi > 1 && m_chi <= this._posi_cnt && this.show_one) {
      this.posi(chi, m_chi);
      return;
    }

    this._dish.classList.remove('gr');
    this._dish.classList.add('fle');

    this.dimensions();

    let max = 0
    let i = 1
    while (i < 5000) {
      let ar = this.area(i, m_chi);
      if (ar === false) {
        max = i - 1;
        break;
      }
      i++;
    }

    max = max - (this._margin * 2);

    this.resizer(max, chi);
  }

  toggleTilesLayout(ev) {
    let btn = ev.currentTarget;
    const is_on = btn.classList.contains('on');

    if (is_on) {
      btn.classList.remove('on');
      this.show_one = false;
    } else {
      btn.classList.add('on');
      this.show_one = true;
    }

    this.resize();
  }
}
