// ==UserScript==
// @name         ChatGPT
// @namespace    http://basyura.org
// @version      0.1
// @description  vim like in chatgpt
// @author       basyura
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let gCount = 0;
  let keyDownTimer = null;

  const keyActions = {
    j: (e) => scroll(e, 100),
    k: (e) => scroll(e, -100),
    g: (e) => scrollToTop(e),
    "shift+g": (e) => scrollToBottom(e),
    i: (e) => changeToInsertMode(e),
    "ctrl+d": (e) => scroll(e, 500),
    "ctrl+u": (e) => scroll(e, -500),
    "ctrl+w": () => {}, // 画面を閉じないため
    "ctrl+r": () => location.reload(),
    F12: "passthrough", // DevTools を開くため,
  };

  const attachEvent = (e) => {
    if (e.target.id == "prompt-textarea") {
      editAction(e);
    } else {
      normalAction(e);
    }
  };

  const editAction = (e) => {
    //console.log("editAction start", e)
    if (e.isComposing) {
      //console.log("coposing");
      return;
    }

    if (e.key == "Escape") {
      //console.log("escape");
      e.target.blur();
      return;
    }

    if (e.key != "Enter" && e.key != "]") {
      //console.log("not enter");
      return;
    }

    if (e.shiftKey) {
      //console.log("shift");
      return;
    }

    if (!e.ctrlKey) {
      //console.log("dispatch enter");
      dispatchEvent(e, "Enter");
      return;
    }

    //console.log("submit start");
    let ele = document.querySelector("#composer-submit-button");
    if (ele != null) {
      ele.click();
    }

    setTimeout(() => e.target.blur(), 200);
  };

  const normalAction = (e) => {
    const id = getKeyId(e);
    const action = keyActions[id];

    if (!action) {
      return;
    }

    if (action === "passthrough") {
      return;
    }

    e.preventDefault();
    action(e);
  };

  const scroll = (e, value) => {
    getScrollContainer().scrollTop += value;
  };

  const scrollToTop = (e) => {
    // Vim-like: "gg" to go to top
    gCount += 1;

    if (gCount === 2) {
      gCount = 0;
      clearTimeout(keyDownTimer);
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = 0;
      } else if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      return;
    }

    clearTimeout(keyDownTimer);
    // 許容時間をやや長めにして実運用で反応しやすくする
    keyDownTimer = setTimeout(() => {
      gCount = 0;
    }, 800);
  };

  const getKeyId = (e) => {
    const isChar = typeof e.key === "string" && e.key.length === 1;
    const base = isChar ? e.key.toLowerCase() : e.key;

    const mods = [];
    if (e.ctrlKey) mods.push("ctrl");
    if (e.altKey) mods.push("alt");
    if (e.shiftKey) mods.push("shift");
    if (e.metaKey) mods.push("meta");

    return mods.length ? `${mods.join("+")}+${base}` : base;
  };

  const scrollToBottom = (e) => {
    const container = getScrollContainer();
    container.scrollTop = container.scrollHeight;
  };

  const changeToInsertMode = (e) => {
    const txt = document.querySelector("#prompt-textarea");
    txt.focus();
  };

  const dispatchEvent = (e, key) => {
    e.preventDefault();

    let newEvent = new KeyboardEvent("keydown", {
      key: key,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    e.target.dispatchEvent(newEvent);
  };

  const getScrollContainer = () => {
    // 既定のスクロールコンテナ（UI変更に弱いため順にフォールバック）
    const selector = "main > div > div > div > div > div";
    let el = document.querySelector(selector);
    if (el) return el;

    // より汎用的に、main配下でスクロール可能な要素を探索
    const main = document.querySelector("main") || document.body;
    if (!main) return null;
    const candidates = main.querySelectorAll("div, section, main");
    for (const c of candidates) {
      const style = getComputedStyle(c);
      const overflowY = style.overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && c.scrollHeight > c.clientHeight + 8) {
        return c;
      }
    }
    return document.scrollingElement || document.documentElement || null;
  };

  document.body.addEventListener("keydown", attachEvent, { capture: true });
  setTimeout(() => {
    document.body.removeEventListener("keydown", attachEvent, {
      capture: true,
    });
    document.body.addEventListener("keydown", attachEvent, { capture: true });
  }, 3000);

  setTimeout(() => document.activeElement.blur(), 100);
})();
