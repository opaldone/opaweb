;"use strict";
$(function() {
  let doc = $(document);
  let start_ws = '#start-ws';
  let back = '#ws-back';
  let nik_name = $('#nik-name').eq(0);
  let ws_main = $('#ws-main').eq(0);
  let btn_rb = '.camic-button';
  let cp_link = '#cp-link';

  nik_name.val("Talker_" + Math.floor(Math.random() * 100));

  nik_name.on('keyup', ev => {
    ev.stopPropagation();

    if (ev.key !== "Enter") return;

    doc[0].querySelector(start_ws).click()

    ev.preventDefault();
  });

  doc.on('click', btn_rb, (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    let th = $(ev.currentTarget);
    let pa = th.parents('.lbl-tha').eq(0);
    ch = pa.find('.tp-tha-rb').eq(0);

    if (ch.prop('checked')) {
      pa.removeClass('checked');
      ch.prop('checked', false);
      ch.trigger('change');
      return false;
    }

    pa.addClass('checked');
    ch.prop('checked', true);
    ch.trigger('change');

    return false;
  });

  doc.on('click', back, (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    let th = $(ev.currentTarget);
    let hr = th.attr('href');
    window.location.href = hr;

    return false;
  });

  doc.on('click', start_ws, (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    let th = $(ev.currentTarget);
    let mic_inp = $('#cb-mic').eq(0);
    let cam_inp = $('#cb-cam').eq(0);
    let uqr_inp = $('#uqroom').eq(0);

    if (!nik_name[0].reportValidity()) return;

    let obj = {
      'uqroom': uqr_inp.val(),
      'nik': nik_name.val(),
      'mic': mic_inp.prop('checked') ? true : false,
      'cam': cam_inp.prop('checked') ? true : false
    };

    let url = th.attr('href');
    axios.post(url, obj)
      .then(re => {
        ws_main.html(re.data.cont);

        let ws = new WSchat();
        ws.connectWs(re.data.sets);
      })
      .catch(err => {
        console.log(err);
      });

    return false;
  });

  doc.on('click', cp_link, (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    let btn = $(ev.currentTarget);
    navigator.clipboard.writeText(window.location.href).then(() => {
      btn.attr({'data-hint': 'The link has been copied'});
      setTimeout(() => {
        btn.attr({'data-hint': 'Copy link'});
      }, 1000);
    });

    return false;
  });

  nik_name.focus();
});
