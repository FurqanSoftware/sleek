// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// Keyboard navigation helpers.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.el

import dom from "@toph/kernel.js/dom";

export default {
  getNavigableItems() {
    const menu = dom.$(".dropdown__menu", this.el);
    if (!menu) return [];
    return [
      ...dom.$$('[role="option"]:not([aria-disabled="true"]), [role="menuitem"]:not([aria-disabled="true"])', menu),
    ].filter((item) => item.offsetParent !== null);
  },

  focusFirstItem() {
    const items = this.getNavigableItems();
    if (!items.length) return;
    const active = items.find((item) => dom.hasClass(item, "-active"));
    (active || items[0]).focus();
  },

  focusNextItem() {
    const items = this.getNavigableItems();
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    const next = index < items.length - 1 ? index + 1 : 0;
    items[next].focus();
  },

  focusPreviousItem() {
    const items = this.getNavigableItems();
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    const prev = index > 0 ? index - 1 : items.length - 1;
    items[prev].focus();
  },

  focusItemByIndex(index) {
    const items = this.getNavigableItems();
    if (index >= 0 && index < items.length) items[index].focus();
  },

  focusItemByChar(char, items) {
    if (!items) items = this.getNavigableItems();
    if (!items.length) return;

    const now = Date.now();
    if (this._charSearchTimeout) clearTimeout(this._charSearchTimeout);
    if (now - (this._charSearchTime || 0) < 500) {
      this._charSearchBuf += char.toLowerCase();
    } else {
      this._charSearchBuf = char.toLowerCase();
    }
    this._charSearchTime = now;
    this._charSearchTimeout = setTimeout(() => {
      this._charSearchBuf = "";
    }, 500);

    const query = this._charSearchBuf;
    const current = items.indexOf(document.activeElement);
    const start = query.length === 1 ? (current >= 0 ? current + 1 : 0) : 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[(start + i) % items.length];
      const text = (dom.getText(item) || "").trimStart();
      if (text.toLowerCase().startsWith(query)) {
        item.focus();
        return;
      }
    }
  },

  isInputFocused() {
    const tag = document.activeElement && document.activeElement.tagName;
    return tag === "INPUT" || tag === "TEXTAREA";
  },
};
