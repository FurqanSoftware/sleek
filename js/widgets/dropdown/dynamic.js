// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// Dynamic value input integration.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.el, this.settings, this.dynamicEl,
//   this.renderToggle(), this.renderItemsSelect(), this.renderActiveItems(),
//   this.makeHint()

import dom from "@toph/kernel.js/dom";

export default {
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
      option.selected = true;
      dom.setText(option, value);
      select.appendChild(option);
      this.renderToggle();
      this.renderItemsSelect();
      this.renderActiveItems();
    });

    if (this.settings.emptyValueHint) {
      const menu = dom.$(".dropdown__menu", this.el);
      menu.appendChild(this.makeHint(this.settings.emptyValueHint));
    }
  },
};
