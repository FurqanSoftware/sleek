---
title: Modal
type: docs
weight: 5
---

<button class="btn -blue" id="openModalBtn">Open Modal</button>

<div class="modal" id="containerModal">
  <div class="modal__dialog -md">
    <div class="modal__head">
      Modal Title
      <button class="modal__cross" id="closeModalBtn">&times</button>
    </div>
    <div class="modal__body">
      <p>Modal Content</p>
    </div>
    <div class="modal__foot -shade">
      <button class="btn -blue" id="closeModalBtn2">Close</button>
    </div>
  </div>
</div>

``` html
<button class="btn -blue" id="openModalBtn">Open Modal</button>

<div class="modal" id="containerModal">
  <div class="modal__dialog -md">
    <div class="modal__head">
      Modal Title
      <button class="modal__cross" id="closeModalBtn">&times</button>
    </div>
    <div class="modal__body">
      <p>Modal Content</p>
    </div>
    <div class="modal__foot -shade">
      <button class="btn -blue" id="closeModalBtn2">Close</button>
    </div>
  </div>
</div>
```

<script>
  document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("containerModal");
    const openBtn = document.getElementById("openModalBtn");
    const closeBtns = [document.getElementById("closeModalBtn"), document.getElementById("closeModalBtn2")];

    openBtn.addEventListener("click", function() {
      modal.classList.add("-opening");
      setTimeout(() => modal.classList.add("-open"), 10);
    });

    closeBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        modal.classList.add("-closing");
        modal.classList.remove("-open");
        setTimeout(() => {
          modal.classList.remove("-opening", "-closing");
        }, 200);
      });
    });

    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        modal.classList.add("-closing");
        modal.classList.remove("-open");
        setTimeout(() => {
          modal.classList.remove("-opening", "-closing");
        }, 200);
      }
    });
  });
</script>
