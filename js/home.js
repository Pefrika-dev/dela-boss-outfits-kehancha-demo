/* Home page — render the curated edit from shared data. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('featuredProducts');
    if (!container || !window.DelaBoss) return;
    const products = window.DelaBoss.getProducts();
    const featured = products.filter(function (product) { return product.featured; });
    const remaining = products
      .filter(function (product) { return !product.featured; })
      .sort(function (a, b) { return new Date(b.dateAdded) - new Date(a.dateAdded); });
    const edit = featured.concat(remaining).slice(0, 8);

    if (!edit.length) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">' +
        window.DelaBoss.icon('shirt') + '</div><h3>No products yet</h3><p>The catalogue is empty. Add products from the store dashboard or reset the preview data.</p><a class="btn" href="admin.html#products">Open store dashboard</a></div>';
      return;
    }

    container.innerHTML = edit.map(function (product, index) {
      return window.DelaBoss.productCardHtml(product, { eager: index < 4 });
    }).join('');
  });
})();
