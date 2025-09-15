// ==UserScript==
// @name         Windows
// @namespace    http://tampermonkey.net/
// @version      2025-05-18
// @description  try to take over the world!
// @author       You
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // if (!navigator.userAgent.includes('Windows')) return;

  const style = document.createElement("style");
  style.className = "self-tampermonkey";

  style.textContent = `
    * {
      -webkit-font-smoothing: antialiased;
      text-shadow: transparent 0px 0px 0px, rgba(0, 0, 0, 0.2) 0px 0px 0px !important;
    }
    html, body {
      font-family: unset;
    }
    @font-face {
      font-family: "Segoe UI";
      src: local("BIZ UDPGothic");
    }
    @font-face {
      font-family: "Arial";
      src: local("BIZ UDPGothic");
    }
    @font-face {
      font-family: "YakuHanJPs";
      src: local("BIZ UDPGothic");
    }
    @font-face {
      font-family: "Meiryo";
      src: local("BIZ UDPGothic");
    }
    @font-face {
      font-family: "ＭＳ Ｐゴシック";
      src: local("BIZ UDPGothic");
    }
    @font-face {
      font-family: "Consolas";
      src: local("Cascadia Mono");
    }
  `;

  // body がまだ無い場合に備えて
  function insertStyleWhenReady() {
    if (document.body) {
      document.body.insertAdjacentElement("afterend", style);
    } else {
      new MutationObserver((mutations, observer) => {
        if (document.body) {
          document.body.insertAdjacentElement("afterend", style);
          observer.disconnect();
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  insertStyleWhenReady();
})();
