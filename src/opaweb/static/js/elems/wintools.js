window.icos = () => {
  let mc_h = `
      <span class="ico-h ra-ico mic" title="Mic is on">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path stroke="#979797" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 10.5A5.5 5.5 0 0 1 12 16m0 0a5.5 5.5 0 0 1-5.5-5.5M12 16v4m-4 0h4m0 0h4m-4-7a2.5 2.5 0 0 1-2.5-2.5v-4a2.5 2.5 0 0 1 5 0v4A2.5 2.5 0 0 1 12 13Z"/>
        </svg>
      </span>
      <span class="ico-c ra-ico mic" title="Mic is off">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke="#575757" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 4 16 16M6.5 10.5A5.5 5.5 0 0 0 12 16v4m-4 0h4m0 0h4M9.5 9V6.5a2.5 2.5 0 0 1 5 0v4a2.5 2.5 0 0 1-1.5 2.292m4.5-2.292c0 1.93-.803 3.523-2.309 4.504"/>
        </svg>
      </span>
      <span class="ico-h ra-ico cam" title="Camera is on">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><g stroke="#979797" stroke-width="2"><path d="M20 17V8a1 1 0 0 0-1-1h-2.382a1 1 0 0 1-.894-.553l-.448-.894A1 1 0 0 0 14.382 5H9.618a1 1 0 0 0-.894.553l-.448.894A1 1 0 0 1 7.382 7H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></g></svg>
      </span>
      <span class="ico-c ra-ico cam" title="Camera is off">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><g stroke="#575757" stroke-linecap="round" stroke-width="2"><path d="m3 5 16 16M20 18V8a1 1 0 0 0-1-1h-2.382a1 1 0 0 1-.894-.553l-.448-.894A1 1 0 0 0 14.382 5H9.721a1 1 0 0 0-.949.684L8.5 6.5M16 18H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1v0"/><path d="M11 9.17A3 3 0 0 1 14.83 13"/></g></svg>
      </span>
      <span class="ico-h ra-ico rec" title="Recording on the server">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#ff5511" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.5V12l3.5 2m5.5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
      </span>
      <span class="ico-h ra-ico crec" title="Recording on the client">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#ff5511" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-1.828-1.828A2 2 0 0 0 16.172 4H15M8 4v4a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4M8 4h7M7 17v-3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/></svg>
      </span>
    `;

  return mc_h;
}

window.is_mobile = () => {
  return true;

  const userAg = navigator.userAgent || window.opera;
  const mobileReg = /android|iphone|kindle|ipad|mobi|series([46])0|symbian|treo|windows ce|xda|xiino/i;
  return mobileReg.test(userAg);
}
