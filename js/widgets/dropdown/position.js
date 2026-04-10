// Copyright 2026 Furqan Software Ltd. All Rights Reserved.

// Menu positioning logic.
// Mixed into Dropdown.prototype by index.js.
// Calls from other mixins: this.el, this.canSourceSelect()

import dom from "@toph/kernel.js/dom";

export default {
  reposition() {
    const menu = dom.$(".dropdown__menu", this.el);
    if (!menu) return;
    if (dom.hasClass(menu, "-left") || dom.hasClass(menu, "-right")) return;
    if (
      this.canSourceSelect() ||
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
  },

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
  },

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
  },
};
