// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// DOM element factories, data extraction, and toggle rendering.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.canSourceSelect(), this.el, this.settings

import dom from "@toph/kernel.js/dom";

export default {
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
  },

  makeHead(data) {
    const head = document.createElement("div");
    dom.addClass(head, "dropdown__head");

    const tpl = this.settings.headTemplate || "%{label}";
    head.innerHTML = this.executeTemplate(tpl, data);

    return head;
  },

  makeHeadOptgroup(optgroup) {
    const data = this.extractOptgroupData(optgroup);
    return this.makeHead(data);
  },

  makeToolText(label) {
    const item = document.createElement("span");
    dom.setText(item, label);
    return item;
  },

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
  },

  makeHint(text) {
    const hint = document.createElement("div");
    dom.addClass(hint, "dropdown__hint");
    dom.setText(hint, text);
    return hint;
  },

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
  },

  extractOptgroupData(optgroup) {
    let data = {};
    const { extra, empty } = optgroup.dataset;
    if (extra) data = { ...data, ...JSON.parse(extra) };
    if (empty) data = { ...data, empty };
    data = {
      ...data,
      label: optgroup.getAttribute("label"),
    };
    return data;
  },

  executeTemplate(tpl, data) {
    if (typeof tpl === "function") return tpl(data);
    if (tpl.match(/^\*[a-zA-Z]+$/))
      return this.executeTemplate(this.settings.templates[tpl.slice(1)], data);
    return tpl.replace(/%\{([a-z]+)\}/g, (_match, key) => data[key]);
  },

  renderToggle() {
    if (this.canSourceSelect()) this.renderToggleSelect();
  },

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
  },

  renderTogglePlaceholder() {
    const toggle = dom.$(".dropdown__toggle", this.el);
    toggle.innerHTML = "";
    const span = document.createElement("span");
    dom.addClass(span, "font-muted");
    span.innerHTML = this.settings.placeholder || "&nbsp;";
    toggle.appendChild(span);
  },
};
