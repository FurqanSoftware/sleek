// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// Select element integration.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.el, this.settings, this.canSourceSelect(),
//   this.close(), this.makeItem(), this.makeHead(), this.makeHeadOptgroup(),
//   this.makeToolText(), this.makeToolItem(), this.makeHint(),
//   this.extractOptionData(), this.renderToggle(), this.executeTemplate()

import dom from "@toph/kernel.js/dom";

export default {
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
  },

  selectAll() {
    for (const option of dom.$$("select option", this.el))
      option.selected = true;
    this.renderToggle();
    this.renderActiveItems();
    this.dispatchSelectChangeEvent();
  },

  selectNone() {
    for (const option of dom.$$("select option", this.el))
      option.selected = false;
    this.renderToggle();
    this.renderActiveItems();
    this.dispatchSelectChangeEvent();
  },

  selectClear() {
    const select = dom.$("select", this.el);
    select.innerHTML = "";
    this.renderToggle();
    this.renderActiveItems();
    this.dispatchSelectChangeEvent();
  },

  dispatchSelectChangeEvent() {
    const select = dom.$("select", this.el);
    select.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  },

  renderItemsSelect() {
    const menu = dom.$(".dropdown__menu", this.el);
    menu.innerHTML = "";

    const select = dom.$("select", this.el);

    for (const child of select.childNodes) {
      switch (child.tagName) {
        case "OPTGROUP": {
          menu.appendChild(this.makeHeadOptgroup(child));

          for (const option of dom.$$("option", child))
            menu.appendChild(this.makeItemOption(option, select));

          const divider = document.createElement("div");
          dom.addClass(divider, "dropdown__divider");
          menu.appendChild(divider);
          break;
        }

        case "OPTION":
          menu.appendChild(this.makeItemOption(child, select));
          break;
      }
    }
  },

  renderActiveItems() {
    if (this.canSourceSelect()) this.renderActiveItemsSelect();
  },

  renderActiveItemsSelect() {
    const select = dom.$("select", this.el);

    const selected = {};
    for (const option of select.selectedOptions) selected[option.value] = true;

    const menu = dom.$(".dropdown__menu", this.el);
    for (const item of dom.$$('[role="option"]', menu)) {
      if (selected[item.dataset.value]) {
        dom.addClass(item, "-active");
        item.setAttribute("aria-selected", "true");
      } else {
        dom.removeClass(item, "-active");
        item.setAttribute("aria-selected", "false");
      }
    }
  },

  renderToolSelect() {
    const tool = dom.$(".dropdown__tool", this.el);
    if (!tool) return;
    tool.innerHTML = "";

    const select = dom.$("select", this.el);

    if (select.multiple) {
      tool.appendChild(this.makeToolText("Select: "));
      tool.appendChild(this.makeToolItem("All", () => this.selectAll()));
      tool.appendChild(this.makeToolText(", "));
      tool.appendChild(this.makeToolItem("None", () => this.selectNone()));
    }

    if (
      (this.settings.search || this.settings.dynamic) &&
      this.settings.allowEmpty
    ) {
      tool.appendChild(this.makeToolItem("Clear", () => this.selectClear()));
    }
  },

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
        if (!select.multiple) {
          if (
            option.selected &&
            (this.settings.search || this.settings.dynamic) &&
            this.settings.allowEmpty
          ) {
            dom.detach(option);
            option.selected = false;
          } else {
            if (!option.parentNode) select.appendChild(option);
            option.selected = true;
          }
        } else {
          option.selected = !option.selected;
        }
      }

      this.renderToggle();
      this.renderActiveItems();
      this.dispatchSelectChangeEvent();

      if (!select.multiple) this.close();
    });

    return item;
  },
};
