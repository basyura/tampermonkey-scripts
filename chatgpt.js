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
    s: (e) => changeToInsertMode(e),
    "ctrl+d": (e) => scroll(e, 500),
    "ctrl+u": (e) => scroll(e, -500),
    "ctrl+w": () => {}, // 画面を閉じないため
    "ctrl+r": () => location.reload(),
    F12: "passthrough", // DevTools を開くため,
  };

  const attachEvent = (e) => {
    const placeholder = e.srcElement.placeholder;
    if (placeholder != null && placeholder.indexOf("検索") > 0) {
      return;
    }

    console.log(e.target);

    if (e.target.getAttribute("aria-label") == "ChatGPT に聞く") {
      editAction(e);
    } else {
      normalAction(e);
    }
  };

  const editAction = (e) => {
    if (e.isComposing) {
      return;
    }

    if (e.key == "Escape") {
      e.target.blur();
      return;
    }

    if (e.ctrlKey && e.key == "m") {
      console.log("M Enter");
      dispatchEvent(e, "Enter");
      return;
    }

    if (e.key != "Enter" && e.key != "]") {
      return;
    }

    if (e.shiftKey) {
      return;
    }

    if (!e.ctrlKey) {
      dispatchEvent(e, "Enter");
      return;
    }

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

  function getSafeQuerySelector(el) {
    if (el.id) {
      return `#${CSS.escape(el.id)}`;
    }

    const parts = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      const parent = el.parentElement;
      if (!parent) break;

      const index = Array.from(parent.children).indexOf(el) + 1;
      parts.unshift(`${el.tagName.toLowerCase()}:nth-child(${index})`);
      el = parent;
    }

    return parts.join(" > ");
  }

  //let query = 'body:nth-child(2) > div:nth-child(6) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)';
  let query = null;
  const getScrollContainer = () => {
    let ele = null;
    if (query != null) {
      ele = document.querySelector(query);
    }
    if (ele == null) {
      const first = Array.from(document.querySelectorAll("*")).find(
        (e) => e.scrollTop !== 0
      );
      if (first) {
        query = getSafeQuerySelector(first);
      }
      ele = document.querySelector(query);
    }

    if (ele != null) {
      return ele;
    }

    console.log("container not found: " + query);
    //alert("no-container");

    return null;
  };

  document.body.addEventListener("keydown", attachEvent, { capture: true });
  setTimeout(() => {
    document.body.removeEventListener("keydown", attachEvent, {
      capture: true,
    });
    document.body.addEventListener("keydown", attachEvent, { capture: true });
  }, 3000);

  let initialized = false;

  let iniFunc = () => {
    if (initialized) {
      return;
    }

    let textEle = document.querySelector("#prompt-textarea");
    if (textEle == null) {
      setTimeout(() => iniFunc(), 500);
      return;
    }

    if (location.href.includes("prompt=") || location.href.includes("q=")) {
      if (textEle.innerText == "") {
        setTimeout(() => iniFunc(), 500);
        return;
      }
      document.querySelector("#composer-submit-button").click();
    }

    document.activeElement.blur();
    initialized = true;
  };

  setTimeout(() => iniFunc(), 500);
})();
