class Resie {
  _margin = 10;
  _ratio = this.ratio()

  constructor(dish_in) {
    this._dish = dish_in;
  }

  ratio() {
    return 3 / 4;
  }

  dimensions() {
    this._width = this._dish.offsetWidth - (this._margin * 2);
    this._height = this._dish.offsetHeight - (this._margin * 2);
  }

  get_max_child() {
    let imax = this._dish.children.length;
    let ret = 0;
    for (var s = 0; s < imax; s++) {
      let el = this._dish.children[s];

      if (window.getComputedStyle(el).display === 'none') continue;

      ret++;
    }
    return ret;
  }

  area(increment) {
    let i = 0;
    let w = 0;

    let h_ste = increment * this._ratio + (this._margin * 2);
    let w_ste = increment + (this._margin * 2);
    let h = h_ste;
    let imax = this.get_max_child();

    while (i < imax) {
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

  resizer(width) {
    let imax = this._dish.children.length;
    for (var s = 0; s < imax; s++) {
      let el = this._dish.children[s];

      if (window.getComputedStyle(el).display === 'none') continue;

      el.style.margin = this._margin + "px"
      el.style.width = width + "px"
      el.style.height = (width * this._ratio) + "px"
    }
  }

  resize() {
    this.dimensions()

    let max = 0
    let i = 1
    while (i < 5000) {
      let area = this.area(i);
      if (area === false) {
        max = i - 1;
        break;
      }
      i++;
    }

    max = max - (this._margin * 2);

    this.resizer(max);
  }
}
