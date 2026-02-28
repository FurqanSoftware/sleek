---
title: Pagination
type: docs
weight: 5
---

<div class="pagination mt-1" id="pagination">
  <a href="#" class="pagination__item" data-action="prev">«</a>
  <a href="#" class="pagination__item -active">1</a>
  <a href="#" class="pagination__item">2</a>
  <a href="#" class="pagination__item">3</a>
  <a href="#" class="pagination__item -extra">4</a>
  <a href="#" class="pagination__item -extra">5</a>
  <a href="#" class="pagination__item" data-action="next">»</a>
</div>

``` html
<div class="pagination mt-1" id="pagination">
  <a href="#" class="pagination__item" data-action="prev">«</a>
  <a href="#" class="pagination__item -active">1</a>
  <a href="#" class="pagination__item">2</a>
  <a href="#" class="pagination__item">3</a>
  <a href="#" class="pagination__item -extra">4</a>
  <a href="#" class="pagination__item -extra">5</a>
  <a href="#" class="pagination__item" data-action="next">»</a>
</div>
```

<script>
  const pagination = document.getElementById('pagination');

  pagination.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target;

    if (!target.classList.contains('pagination__item') || target.classList.contains('-active')) return;

    const items = Array.from(pagination.querySelectorAll('.pagination__item'))
      .filter(item => !item.dataset.action); 

    let currentIndex = items.findIndex(item => item.classList.contains('-active'));

    if (target.dataset.action === 'prev') {
      if (currentIndex > 0) {
        items[currentIndex].classList.remove('-active');
        items[currentIndex - 1].classList.add('-active');
      }
    } else if (target.dataset.action === 'next') {
      if (currentIndex < items.length - 1) {
        items[currentIndex].classList.remove('-active');
        items[currentIndex + 1].classList.add('-active');
      }
    } else {
      items[currentIndex].classList.remove('-active');
      target.classList.add('-active');
    }
  });
</script>
