class Resie {
  _margin = 3;
  _ratio = this.ratio();
  _posi_cnt = 4;

  constructor(fun_in, dish_in, scr_on_in, is_virt_in) {
    this.fun = fun_in;
    this._dish = dish_in;
    this.scr_on = scr_on_in;
    this.show_one = true;
    this.is_virt = is_virt_in;

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

  change_one(el) {
    if (el.id == 'vw-self') return;

    const one = this.get_one();

    if (one == el) return;

    if (one) {
      one.classList.remove('one');
    }
    el.classList.add('one');

    this.resize()
  }

  get_one(chi, m_chi) {
    let one = this._dish.querySelector('.one');

    if (one) return one;

    for (let s = 0; s < m_chi; s++) {
      let el = chi[s];
      if (el.id == 'vw-self') continue;
      el.classList.add('one');
      one = el;
      break;
    }

    return one;
  }

  posi(chi, m_chi) {
    this.clear_styles(chi);

    this._dish.classList.remove('fle');
    this._dish.classList.add('gr');

    const one = this.get_one(chi, m_chi);

    let one_wi = one.getBoundingClientRect().width;
    let ano_wi = one_wi / 3;

    one.style.height = (one_wi * this._ratio) + 'px';
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

    if (
      // !this.is_virt &&
      this.show_one &&
      m_chi > 1 &&
      m_chi <= this._posi_cnt
    ) {
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
