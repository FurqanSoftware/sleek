// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

import dom from "@toph/kernel.js/dom";
import fn from "@toph/kernel.js/fn";

import elementMethods from "./elements.js";
import selectMethods from "./select.js";
import searchMethods from "./search.js";
import keyboardMethods from "./keyboard.js";
import dynamicMethods from "./dynamic.js";
import positionMethods from "./position.js";

class Dropdown {
  constructor(el, settings = {}) {
    this.el = el;
    this.settings = settings;
    this._onWindowResize = () => this.reposition();
    this.init();
  }

  canSourceSelect() {
    return dom.hasClass(this.el, "-select") && !!dom.$("select", this.el);
  }

  init() {
    if (this.canSourceSelect()) this.initSelect();
    if (this.settings.search) this.initSearch();
    if (this.settings.dynamic) this.initDynamic();

    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-expanded", "false");

    const menu = dom.$(".dropdown__menu", this.el);
    if (menu) menu.setAttribute("role", "listbox");

    dom.on(this.el, "keyup", (event) => {
      if (event.key === "Escape" && dom.hasClass(this.el, "-open")) {
        this.close();
        toggle.focus();
        event.stopPropagation();
      }
    });

    dom.on(this.el, "keydown", (event) => {
      const isOpen = dom.hasClass(this.el, "-open");

      if (!isOpen) {
        if (
          event.target === toggle &&
          (event.key === "Enter" ||
            event.key === " " ||
            event.key === "ArrowDown")
        ) {
          event.preventDefault();
          this.open();
        }
        return;
      }

      const items = this.getNavigableItems();
      if (!items.length) return;

      switch (event.key) {
        case "ArrowRight":
          if (!this.settings.horizontalArrows) break;
        case "ArrowDown": {
          event.preventDefault();
          this.focusNextItem();
          break;
        }
        case "ArrowLeft":
          if (!this.settings.horizontalArrows) break;
        case "ArrowUp": {
          event.preventDefault();
          this.focusPreviousItem();
          break;
        }
        case "Home": {
          event.preventDefault();
          this.focusItemByIndex(0);
          break;
        }
        case "End": {
          event.preventDefault();
          this.focusItemByIndex(items.length - 1);
          break;
        }
        case "Enter":
        case " ": {
          if (items.includes(document.activeElement)) {
            event.preventDefault();
            document.activeElement.click();
          }
          break;
        }
        default: {
          if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !this.isInputFocused()
          ) {
            this.focusItemByChar(event.key, items);
          }
          break;
        }
      }
    });
  }

  open() {
    if (dom.hasClass(this.el, "-open")) return;

    dom.addClass(this.el, "-open");
    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.setAttribute("aria-expanded", "true");

    const menu = dom.$(".dropdown__menu", this.el);
    if (menu) {
      dom.addClass(menu, "animated", "fadeInUpSmallest", "fastest");
      dom.once(menu, "animationend", () => {
        dom.removeClass(menu, "animated", "fadeInUpSmallest", "fastest");
      });
      const active = dom.$('[role="option"][aria-selected="true"]', menu);
      if (active) {
        fn.defer(() => {
          const top = Math.max(
            0,
            Math.floor(active.offsetTop - dom.getHeight(menu) / 3),
          );
          menu.scrollTo({
            top,
            behavior: "instant",
          });
        });
      }
    }

    const tool = dom.$(".dropdown__tool", this.el);
    if (tool) {
      dom.addClass(tool, "animated", "fadeIn", "fastest");
      dom.once(tool, "animationend", () => {
        dom.removeClass(tool, "animated", "fadeIn", "fastest");
      });
    }

    if (this.settings.search) {
      const search = this.searchEl;
      if (this.canSourceSelect()) {
        const toggle = dom.$(".dropdown__toggle", this.el);
        dom.addClass(toggle, "hidden");
        toggle.insertAdjacentElement("afterend", search);
      } else {
        const menu = dom.$(".dropdown__menu", this.el);
        menu.insertBefore(search, menu.firstChild);
      }
      const input = dom.$("input", search);
      input.focus();
      input.select();
      if (this.settings.search.onceOnOpen && !this.searchedOnceOnOpen) {
        this.applySearch(input.value);
        this.searchedOnceOnOpen = true;
      }
    }

    if (this.settings.dynamic) {
      const dynamic = this.dynamicEl;
      if (this.canSourceSelect()) {
        const toggle = dom.$(".dropdown__toggle", this.el);
        dom.addClass(toggle, "hidden");
        toggle.insertAdjacentElement("afterend", dynamic);
      } else {
        const menu = dom.$(".dropdown__menu", this.el);
        menu.insertBefore(dynamic, menu.firstChild);
      }
      const input = dom.$("input", dynamic);
      input.focus();
      input.select();
    }

    if (!this.settings.search && !this.settings.dynamic) {
      fn.defer(() => this.focusFirstItem());
    }

    this.reposition();
    dom.on(window, "resize", this._onWindowResize);
  }

  close() {
    if (!dom.hasClass(this.el, "-open")) return;

    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.setAttribute("aria-expanded", "false");

    const menu = dom.$(".dropdown__menu", this.el);
    if (!menu) {
      dom.removeClass(this.el, "-open");
      return;
    }

    if (this.settings.search) {
      const search = dom.$(".dropdown__search", this.el);
      if (search) dom.detach(search);
      const toggle = dom.$(".dropdown__toggle", this.el);
      dom.removeClass(toggle, "hidden");
    }

    if (this.settings.dynamic) {
      const dynamic = dom.$(".dropdown__dynamic", this.el);
      if (dynamic) dom.detach(dynamic);
      const toggle = dom.$(".dropdown__toggle", this.el);
      dom.removeClass(toggle, "hidden");
    }

    dom.addClass(menu, "animated", "fadeOutUpSmall", "fastest");
    dom.once(menu, "animationend", () => {
      dom.removeClass(this.el, "-open");
      dom.removeClass(menu, "animated", "fadeOutUpSmall", "fastest");
    });

    const tool = dom.$(".dropdown__tool", this.el);
    if (tool) {
      dom.addClass(tool, "animated", "fadeOut", "fastest");
      dom.once(tool, "animationend", () => {
        dom.removeClass(tool, "animated", "fadeOut", "fastest");
      });
    }

    dom.off(window, "resize", this._onWindowResize);
  }

  refresh() {
    if (this.canSourceSelect()) this.initSelect();
  }

  isChildOf(other) {
    let target = this.el;
    while (target && target.parentNode) {
      if (target.parentNode === other.el) return true;
      target = target.parentNode;
    }
    return false;
  }
}

Object.assign(Dropdown.prototype, elementMethods);
Object.assign(Dropdown.prototype, selectMethods);
Object.assign(Dropdown.prototype, searchMethods);
Object.assign(Dropdown.prototype, dynamicMethods);
Object.assign(Dropdown.prototype, keyboardMethods);
Object.assign(Dropdown.prototype, positionMethods);

class Root {
  constructor(el = document.body, settings = {}) {
    this.el = el;
    this.dropdowns = new Map();
    this.settings = settings;

    dom.on(this.el, "click", (event) => {
      const dropdownEl = dom.between(event.target, this.el, ".dropdown");
      if (!dropdownEl) {
        this.closeAll();
        return;
      }

      this.make(dropdownEl);

      const dropdown = this.dropdowns.get(dropdownEl);

      if (
        dom.between(
          event.target,
          dropdownEl,
          ".dropdown__search, .dropdown__dynamic, .dropdown__menu, .dropdown__tool",
        )
      )
        return;

      const toggle = dom.between(event.target, dropdownEl, ".dropdown__toggle");
      if (!toggle) {
        this.closeAll();
        return;
      }

      this.closeOthers(dropdown);

      if (!dom.hasClass(dropdown.el, "-open")) dropdown.open();
      else dropdown.close();
    });
  }

  makeUnder() {
    for (const dropdownEl of dom.$$(".dropdown", this.el))
      this.make(dropdownEl);
  }

  make(dropdownEl) {
    if (this.dropdowns.has(dropdownEl)) return;
    let settings = {};
    if (dropdownEl.dataset.dropdown)
      settings = JSON.parse(dropdownEl.dataset.dropdown);
    if (!settings.templates) settings.templates = this.settings.templates;
    if (settings.search && !settings.search.httpHeaders)
      settings.search.httpHeaders = this.settings.searchHTTPHeaders;
    const dropdown = new Dropdown(dropdownEl, settings);
    this.dropdowns.set(dropdownEl, dropdown);
  }

  getOrMake(dropdownEl) {
    if (!this.dropdowns.has(dropdownEl)) this.make(dropdownEl);
    return this.dropdowns.get(dropdownEl);
  }

  closeOthers(dropdown) {
    this.dropdowns.forEach((other) => {
      if (
        dom.hasClass(other.el, "-open") &&
        dropdown != other &&
        !dropdown.isChildOf(other)
      )
        other.close();
    });
  }

  closeAll() {
    this.dropdowns.forEach((dropdown) => dropdown.close());
  }
}

Dropdown.Root = Root;

export default Dropdown;
