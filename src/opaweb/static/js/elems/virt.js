;"use strict";
class VirtStarter {
  constructor() {
    window.fun.ready(this.handler.bind(this));
  }

  handler() {
    let ws = new WSchat(true);
    ws.connectWs(window.VIRT_OB);
  }
}

new VirtStarter();
