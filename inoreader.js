// ==UserScript==
// @name         inoreader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.inoreader.com/*
// @match        https://jp.inoreader.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=inoreader.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  document.body.addEventListener(
    "keydown",
    (e) => {
      console.log(e);
      if (e.code == "Space") {
        /*
            let value = 100;
            if (e.shiftKey) {
                value = -1 * value;
            }
            const ele = document.getElementById("reader_pane");
            ele.scrollTop += value;

            console.log("keydown")
            e.stopPropagation();
            e.preventDefault();
            */
        return;
      }

      if (e.code == "KeyB") {
        let current = document.querySelector(".article_current");
        let links = current.getElementsByTagName("a");
        let hateb = Array.from(links).find((v) =>
          v.href.startsWith("https://b.hatena.ne.jp/")
        );
        if (hateb != null) {
          open(hateb.href);
        }
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    },
    { capture: true }
  );
})();
