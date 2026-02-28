---
title: Dropdown
type: docs
weight: 4
---

<div class="dropdown mt-1">
  <div class="btn -default dropdown__toggle">
    Select option
  </div>
  <div class="dropdown__menu">
    <div class="dropdown__item">Option 1</div>
    <div class="dropdown__item">Option 2</div>
    <div class="dropdown__item">Option 3</div>
  </div>
</div>

``` html
<div class="dropdown">
  <div class="btn -default dropdown__toggle">
    Select option
  </div>
  <div class="dropdown__menu">
    <div class="dropdown__item">Option 1</div>
    <div class="dropdown__item">Option 2</div>
    <div class="dropdown__item">Option 3</div>
  </div>
</div>
```

<script type="text/javascript">
  (function() {
    var root = new Sleek.Dropdown.Root()
    root.makeUnder()
  })()
</script>
