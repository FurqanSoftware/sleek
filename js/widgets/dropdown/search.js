// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// HTTP search integration.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.el, this.settings, this.searchEl,
//   this.searchXhr, this.searchedOnceOnOpen,
//   this.makeItem(), this.makeHint(), this.renderToggle(),
//   this.renderActiveItems(), this.close(), this.reposition(),
//   this.dispatchSelectChangeEvent()

import dom from "@toph/kernel.js/dom";
import fn from "@toph/kernel.js/fn";
import http from "@toph/kernel.js/http";

export default {
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
    dom.on(input, "keyup", () => applySearch(input.value));
    dom.on(input, "paste", () => fn.defer(() => applySearch(input.value)));

    if (this.settings.emptyQueryHint) {
      const menu = dom.$(".dropdown__menu", this.el);
      menu.appendChild(this.makeHint(this.settings.emptyQueryHint));
    }
  },

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
        for (const el of dom.$$(".dropdown__hint", menu)) dom.detach(el);
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

              if (!select.multiple && !this.settings.allowEmpty) {
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
              option.selected = true;
              dom.setText(option, label);
              select.appendChild(option);

              this.renderToggle();
              this.renderActiveItems();
              this.dispatchSelectChangeEvent();

              if (!select.multiple) this.close();
              else dom.$(".dropdown__search input", this.el).focus();
            });
          }
        };

        if (items.length === 0 && this.settings.zeroResultsHint) {
          menu.appendChild(this.makeHint(this.settings.zeroResultsHint));
        } else {
          if (
            select &&
            (select.multiple || dom.$("option[data-empty]", select))
          )
            addItem({ label: "None", value: "", empty: true });

          for (const item of items)
            addItem({ ...item, label: item.text, value: item.id });
        }

        this.reposition();
        this.renderActiveItems();
      },
    );
  },
};
