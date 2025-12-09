// Copyright 2024 Furqan Software Ltd. All Rights Reserved.

import dom from "@toph/kernel.js/dom";
import fn from "@toph/kernel.js/fn";
import http from "@toph/kernel.js/http";

class Dropdown {
  constructor(el, settings = {}) {
    this.el = el;
    this.settings = settings;
    this._onWindowResize = this._onWindowResize.bind(this);
    this.init();
  }

  init() {
    if (dom.hasClass(this.el, "-select")) this.initSelect();
    if (this.settings.search) this.initSearch();
    if (this.settings.dynamic) this.initDynamic();

    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.setAttribute("tabindex", "0");

    dom.on(this.el, "keyup", (event) => {
      if (event.key === "Escape" && dom.hasClass(this.el, "-open")) {
        this.close();
        event.stopPropagation();
      }
    });
  }

  initSelect() {
    const select = dom.$("select", this.el);

    this.renderItemsSelect();

    dom.on(select, "change", () => {
      this.renderToggle();
      this.renderActiveItems();
    });

    this.renderToggle();
    this.renderActiveItems();

    this.renderToolSelect();
  }

  initSearch() {
    const search = document.createElement("div");
    dom.addClass(search, "dropdown__search");
    search.innerHTML = '<input class="form__field" placeholder="Search">';
    this.searchEl = search;

    this.searchedOnceOnOpen = false;

    const applySearch = fn.throttle(
      (...args) => this.applySearch(...args),
      375,
    );

    const input = dom.$("input", search);
    dom.on(input, "keydown", (event) => {
      if (event.keyCode !== 13) return;
      event.preventDefault();
    });
    dom.on(input, "keyup", (event) => applySearch(input.value));
    dom.on(input, "paste", (event) => fn.defer(() => applySearch(input.value)));
  }

  applySearch(query) {
    if (this.searchXhr) {
      this.searchXhr.abort();
      delete this.searchXhr;
    }
    const searchOptions = {};
    if (this.settings.search.httpHeaders)
      searchOptions.headers = this.settings.search.httpHeaders;
    this.searchXhr = http.get(
      `${this.settings.search.url}${this.settings.search.url.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`,
      searchOptions,
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        const items = JSON.parse(data);

        const menu = dom.$(".dropdown__menu", this.el);
        for (const el of dom.$$(".dropdown__item", menu)) dom.detach(el);

        const select = dom.$("select", this.el);

        const addItem = (data) => {
          const { label, value, empty, ...rest } = data;

          const item = this.makeItem(data);
          menu.appendChild(item);

          if (select) {
            dom.on(item, "click", () => {
              if (empty) {
                select.innerHTML = "";
                this.renderToggle();
                this.renderActiveItems();
                this.close();
                return;
              }

              if (!select.multiple) {
                select.innerHTML = "";
              } else {
                for (const option of select.selectedOptions) {
                  if (option.value === value) {
                    dom.detach(option);
                    this.renderToggle();
                    this.renderActiveItems();
                    return;
                  }
                }
              }

              const option = document.createElement("option");
              option.setAttribute(`data-extra`, JSON.stringify(rest));
              option.setAttribute("value", value);
              option.setAttribute("selected", true);
              dom.setText(option, label);
              select.appendChild(option);

              this.renderToggle();
              this.renderActiveItems();

              if (!select.multiple) this.close();
              else dom.$(".dropdown__search input", this.el).focus();
            });
          }
        };

        if (select && (select.multiple || dom.$("option[data-empty]", select)))
          addItem({ label: "None", value: "", empty: true });

        for (const item of items)
          addItem({ ...item, label: item.text, value: item.id });

        this.reposition();
        this.renderActiveItems();
      },
    );
  }

  initDynamic() {
    const dynamic = document.createElement("div");
    dom.addClass(dynamic, "dropdown__dynamic");
    dynamic.innerHTML = '<input class="form__field">';
    this.dynamicEl = dynamic;

    const input = dom.$("input", dynamic);
    dom.on(input, "keydown", (event) => {
      if (event.keyCode !== 13 && event.key !== ",") return;
      event.preventDefault();
    });
    dom.on(input, "keyup", (event) => {
      if (event.keyCode !== 13 && event.key !== ",") return;
      const value = input.value.trim();
      if (!value) return;
      input.value = "";
      const select = dom.$("select", this.el);
      const option = document.createElement("option");
      option.setAttribute("value", value);
      option.setAttribute("selected", true);
      dom.setText(option, value);
      select.appendChild(option);
      this.renderToggle();
      this.renderItemsSelect();
      this.renderActiveItems();
    });
    dom.on(input, "paste", (event) =>
      fn.defer(() => applyDynamic(input.value)),
    );
  }

  selectAll() {
    for (const option of dom.$$("select option", this.el))
      option.selected = true;
    this.renderToggle();
    this.renderActiveItems();
  }

  selectNone() {
    for (const option of dom.$$("select option", this.el))
      option.selected = false;
    this.renderToggle();
    this.renderActiveItems();
  }

  renderToggle() {
    if (dom.hasClass(this.el, "-select")) this.renderToggleSelect();
  }

  renderToggleSelect() {
    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.innerHTML = "";

    if (dom.hasClass(toggle, "form__field")) {
      if (dom.hasClass(this.el, "-readonly"))
        toggle.setAttribute("readonly", true);
      else toggle.removeAttribute("readonly");
    }

    const select = dom.$("select", this.el);
    if (
      select.selectedOptions.length == 0 ||
      (select.selectedOptions.length == 1 &&
        select.selectedOptions[0].dataset.empty)
    ) {
      this.renderTogglePlaceholder();
      return;
    }

    const tpl = this.settings.selectedTemplate || "%{label}";
    let first = true;
    for (const option of select.selectedOptions) {
      const data = this.extractOptionData(option);
      const span = document.createElement("span");
      span.innerHTML = this.executeTemplate(tpl, data);
      if (!first) toggle.appendChild(document.createTextNode(", "));
      toggle.appendChild(span);
      first = false;
    }
  }

  renderTogglePlaceholder() {
    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.innerHTML = "";
    const span = document.createElement("span");
    dom.addClass(span, "font-muted");
    span.innerHTML = this.settings.placeholder || "&nbsp;";
    toggle.appendChild(span);
  }

  renderItemsSelect() {
    const menu = dom.$(".dropdown__menu", this.el);
    menu.innerHTML = "";

    const select = dom.$("select", this.el);

    for (const child of select.childNodes) {
      switch (child.tagName) {
        case "OPTGROUP":
          const head = document.createElement("div");
          dom.addClass(head, "dropdown__head");
          dom.setText(head, child.getAttribute("label"));
          menu.appendChild(head);

          for (const option of dom.$$("option", child))
            menu.appendChild(this.makeItemOption(option, select));

          const divider = document.createElement("div");
          dom.addClass(divider, "dropdown__divider");
          menu.appendChild(divider);
          break;

        case "OPTION":
          menu.appendChild(this.makeItemOption(child, select));
          break;
      }
    }
  }

  renderActiveItems() {
    if (dom.hasClass(this.el, "-select")) this.renderActiveItemsSelect();
  }

  renderActiveItemsSelect() {
    const select = dom.$("select", this.el);

    const selected = {};
    for (const option of select.selectedOptions) selected[option.value] = true;

    const menu = dom.$(".dropdown__menu", this.el);
    for (const item of dom.$$(".dropdown__item", menu)) {
      if (selected[item.dataset.value]) dom.addClass(item, "-active");
      else dom.removeClass(item, "-active");
    }
  }

  renderToolSelect() {
    const tool = dom.$(".dropdown__tool", this.el);
    if (!tool) return;
    tool.innerHTML = "";

    tool.appendChild(this.makeToolText("Select: "));
    tool.appendChild(this.makeToolItem("All", () => this.selectAll()));
    tool.appendChild(this.makeToolText(", "));
    tool.appendChild(this.makeToolItem("None", () => this.selectNone()));
  }

  makeItem(data) {
    const item = document.createElement("a");
    dom.addClass(item, "dropdown__item", "-link");
    item.setAttribute("href", "javascript:;");
    item.setAttribute("tabindex", "0");
    item.setAttribute("data-value", data.value);

    const tpl =
      (!data.empty
        ? this.settings.itemTemplate
        : this.settings.emptyItemTemplate) || "%{label}";
    item.innerHTML = this.executeTemplate(tpl, data);

    if (this.settings.navigate)
      item.setAttribute(
        "href",
        this.executeTemplate(this.settings.navigate.urlTemplate, data),
      );

    return item;
  }

  makeItemOption(option, select) {
    const data = this.extractOptionData(option);
    const item = this.makeItem(data);

    dom.on(item, "click", () => {
      if (dom.hasClass(this.el, "-readonly")) return;

      if (option.dataset.empty) {
        const currentSelected = [...select.selectedOptions];
        option.selected = true;
        for (const option of currentSelected) option.selected = false;
      } else {
        if (!select.multiple) option.selected = true;
        else option.selected = !option.selected;
      }

      select.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      if (!select.multiple) this.close();
    });

    return item;
  }

  makeToolText(label) {
    const item = document.createElement("span");
    dom.setText(item, label);
    return item;
  }

  makeToolItem(label, action) {
    const item = document.createElement("a");
    item.setAttribute("href", "javascript:;");
    item.setAttribute("tabindex", "0");
    dom.setText(item, label);
    dom.on(item, "click", (event) => {
      event.preventDefault();
      action();
    });
    return item;
  }

  extractOptionData(option) {
    let data = {};
    const { extra, empty } = option.dataset;
    if (extra) data = { ...data, ...JSON.parse(extra) };
    if (empty) data = { ...data, empty };
    data = {
      ...data,
      label: dom.getText(option),
      value: option.getAttribute("value"),
    };
    return data;
  }

  executeTemplate(tpl, data) {
    if (typeof tpl === "function") return tpl(data);
    if (tpl.match(/^\*[a-zA-Z]+$/))
      return this.executeTemplate(this.settings.templates[tpl.substr(1)], data);
    return tpl.replace(/%\{([a-z]+)\}/g, (match, key) => data[key]);
  }

  open() {
    if (dom.hasClass(this.el, "-open")) return;

    dom.addClass(this.el, "-open");

    const menu = dom.$(".dropdown__menu", this.el);
    if (menu) {
      dom.addClass(menu, "animated", "fadeInUpSmallest", "fastest");
      dom.once(menu, "animationend", () => {
        dom.removeClass(menu, "animated", "fadeInUpSmallest", "fastest");
      });
      const active = dom.$(".dropdown__item.-active", menu);
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
      if (dom.hasClass(this.el, "-select")) {
        const toggle = dom.$(".dropdown__toggle", this.el);
        dom.addClass(toggle, "hidden");
        toggle.insertAdjacentElement("afterend", search);
      } else {
        const menu = dom.$(".dropdown__menu", this.el);
        menu.insertBefore(search, menu.firstChild);
      }
      const input = dom.$("input", search);
      input.focus();
      if (this.settings.search.onceOnOpen && !this.searchedOnceOnOpen) {
        this.applySearch(input.value);
        this.searchedOnceOnOpen = true;
      }
    }

    if (this.settings.dynamic) {
      const dynamic = this.dynamicEl;
      if (dom.hasClass(this.el, "-select")) {
        const toggle = dom.$(".dropdown__toggle", this.el);
        dom.addClass(toggle, "hidden");
        toggle.insertAdjacentElement("afterend", dynamic);
      } else {
        const menu = dom.$(".dropdown__menu", this.el);
        menu.insertBefore(dynamic, menu.firstChild);
      }
      const input = dom.$("input", dynamic);
      input.focus();
    }

    this.reposition();
    dom.on(window, "resize", this._onWindowResize);
  }

  close() {
    if (!dom.hasClass(this.el, "-open")) return;
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
    if (dom.hasClass(this.el, "-select")) this.initSelect();
  }

  reposition() {
    const menu = dom.$(".dropdown__menu", this.el);
    if (!menu) return;
    if (dom.hasClass(menu, "-left") || dom.hasClass(menu, "-right")) return;
    if (
      dom.hasClass(this.el, "-select") ||
      !dom.closest(menu.parentNode, ".dropdown__menu")
    )
      this.repositionY();
    if (dom.closest(menu.parentNode, ".dropdown__menu")) this.repositionXY();

    const tool = dom.$(".dropdown__tool", this.el);
    if (tool) {
      if (menu.style.top === "100%") {
        dom.setStyles(tool, {
          top: "auto",
          bottom: "100%",
        });
      } else {
        dom.setStyles(tool, {
          top: "100%",
          bottom: "auto",
        });
      }
    }
  }

  repositionY() {
    const menu = dom.$(".dropdown__menu", this.el);
    dom.setStyles(menu, {
      height: "auto",
    });
    const pos = this.el.getBoundingClientRect();
    if (pos.bottom + dom.getHeight(menu) < window.innerHeight) {
      // Fits below
      dom.setStyles(menu, {
        top: "100%",
        bottom: "auto",
      });
    } else if (dom.getHeight(menu) < pos.top) {
      // Fits above
      dom.setStyles(menu, {
        top: "auto",
        bottom: "100%",
      });
    } else if (window.innerHeight - pos.bottom > pos.top) {
      // More space below
      dom.setStyles(menu, {
        top: "100%",
        bottom: "auto",
        height:
          Math.floor(
            ((window.innerHeight - pos.bottom) / window.innerHeight) * 100,
          ) + "vh",
      });
    } else {
      // Assume more space above
      dom.setStyles(menu, {
        top: "auto",
        bottom: "100%",
        height: Math.floor((pos.top / window.innerHeight) * 100) + "vh",
      });
    }
  }

  repositionXY() {
    const menu = dom.$(".dropdown__menu", this.el);
    const pos = this.el.getBoundingClientRect();
    const elWidth = dom.getWidth(this.el);
    const elHeight = dom.getHeight(this.el);
    const menuWidth = dom.getWidth(menu);
    const menuHeight = dom.getHeight(menu);
    let top = "0px";
    let bottom = "auto";
    let right = "auto";
    let left = "100%";
    if (pos.left + elWidth + menuWidth > document.documentElement.clientWidth) {
      if (pos.left > menuWidth) {
        [left, right] = [right, left];
      } else if (pos.left + menuWidth < document.documentElement.clientWidth) {
        top = `${elHeight}px`;
        right = "auto";
        left = "1rem";
      } else {
        left = `-${pos.left}px`;
        right = "auto";
      }
    }
    if (pos.top + menuHeight > document.documentElement.clientHeight) {
      [top, bottom] = [bottom, top];
    }

    dom.setStyles(menu, {
      top,
      right,
      bottom,
      left,
    });
  }

  isChildOf(other) {
    let target = this.el;
    while (target && target.parentNode) {
      if (target.parentNode == other.el) return true;
      target = target.parentNode;
    }
    return false;
  }

  _onWindowResize(event) {
    this.reposition();
  }
}

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
    for (const dropdownEl of dom.$$(".dropdown.-select", this.el))
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
