;"use strict";
class VirtStarter {
  constructor() {
    this.fun = new Funcs();
    this.fun.ready(this.handler.bind(this));
  }

  handler() {
    let ws = new WSchat(this.fun, true);
    ws.connectWs(window.VIRT_OB);
  }
}

new VirtStarter();
