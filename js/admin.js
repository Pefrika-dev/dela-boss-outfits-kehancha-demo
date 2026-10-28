/*
 * DE LA BOSS OUTFITS - preview store dashboard
 * Hash-routed, LocalStorage-backed management of preview products,
 * inventory, orders, customers and store settings. Not production-secure.
 */
(function () {
  'use strict';

  const SECTIONS = {
    overview: 'Overview',
    products: 'Products',
    inventory: 'Inventory',
    orders: 'Orders',
    customers: 'Customers',
    settings: 'Settings'
  };

  const state = {
    productSearch: '',
    productCategory: 'all',
    productStock: 'all',
    inventoryFilter: 'all',
    orderSearch: '',
    orderStatus: 'all',
    customerSearch: '',
    pendingImage: null,
    imageCleared: false
  };

  let dialog = null;
  let productSearchTimer = null;
  let orderSearchTimer = null;
  let customerSearchTimer = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escape(value) {
    return window.DelaBoss.escapeHtml(value);
  }

  function attr(value) {
    return window.DelaBoss.escapeAttr(value);
  }

  function statusClass(status) {
    return 'status-' + String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function statusBadge(status) {
    return '<span class="status-badge ' + statusClass(status) + '">' + escape(status) + '</span>';
  }

  function stockPill(product) {
    const stock = window.DelaBoss.stockState(product);
    return '<span class="stock-pill stock-' + stock.key + '">' + escape(stock.label) + '</span>';
  }

  function metricCard(label, value, note, iconName) {
    return '<article class="metric-card">' +
      '<span class="metric-card__icon" aria-hidden="true">' + window.DelaBoss.icon(iconName) + '</span>' +
      '<p class="metric-card__label">' + escape(label) + '</p>' +
      '<p class="metric-card__value">' + escape(value) + '</p>' +
      '<p class="metric-card__note">' + escape(note) + '</p>' +
    '</article>';
  }

  function iconButton(action, id, label, iconName, extraClass) {
    return '<button class="admin-icon-btn' + (extraClass ? ' ' + extraClass : '') + '" type="button" data-' + action + '="' + attr(id) + '" aria-label="' + attr(label) + '" title="' + attr(label) + '">' +
      window.DelaBoss.icon(iconName) +
    '</button>';
  }

  function emptyBlock(title, copy) {
    return '<div class="admin-empty"><strong>' + escape(title) + '</strong>' + escape(copy) + '</div>';
  }

  function optionsHtml(values, selected, allLabel, allValue) {
    let html = allLabel != null ? '<option value="' + attr(allValue || '') + '">' + escape(allLabel) + '</option>' : '';
    values.forEach(function (value) {
      html += '<option value="' + attr(value) + '"' + (value === selected ? ' selected' : '') + '>' + escape(value) + '</option>';
    });
    return html;
  }

  function section(name) {
    return document.querySelector('[data-admin-section="' + name + '"]');
  }

  function setTitle(name) {
    const title = byId('adminPageTitle');
    if (title) title.textContent = SECTIONS[name] || 'Overview';
  }

  function updateNavBadges() {
    const DB = window.DelaBoss;
    const metrics = DB.orderMetrics();
    const values = {
      products: metrics.products,
      inventory: metrics.lowStock,
      orders: metrics.pending
    };
    qsa('[data-nav-badge]').forEach(function (badge) {
      const key = badge.getAttribute('data-nav-badge');
      const count = values[key] || 0;
      badge.textContent = String(count);
      badge.hidden = count <= 0;
    });
  }

  function closeSidebar() {
    const shell = byId('adminShell');
    const button = document.querySelector('[data-admin-menu]');
    if (shell) shell.classList.remove('is-sidebar-open');
    document.body.classList.remove('is-nav-open');
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function openSidebar() {
    const shell = byId('adminShell');
    const button = document.querySelector('[data-admin-menu]');
    if (shell) shell.classList.add('is-sidebar-open');
    document.body.classList.add('is-nav-open');
    if (button) button.setAttribute('aria-expanded', 'true');
  }

  /* -----------------------------------------------------------------------
   * Overview
   * -------------------------------------------------------------------- */

  function renderOverview() {
    const DB = window.DelaBoss;
    const target = section('overview');
    if (!target) return;
    const metrics = DB.orderMetrics();
    const orders = DB.getOrders().slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const customers = DB.customersFromOrders();
    const threshold = Math.max(0, Number(DB.getSettings().lowStockThreshold) || 0);
    const alerts = DB.getProducts()
      .filter(function (product) { return (Number(product.stock) || 0) <= threshold; })
      .sort(function (a, b) { return (Number(a.stock) || 0) - (Number(b.stock) || 0); })
      .slice(0, 5);
    const activity = DB.getActivity().slice(0, 7);

    const metricsHtml = '<div class="metric-grid">' +
      metricCard('Total orders', DB.formatNumber(metrics.totalOrders), metrics.pending + ' pending review', 'receipt') +
      metricCard('Pending', DB.formatNumber(metrics.pending), 'Needs a status decision', 'info') +
      metricCard('Catalogue', DB.formatNumber(metrics.products), 'Products saved', 'shirt') +
      metricCard('Low stock', DB.formatNumber(metrics.lowStock), metrics.outOfStock + ' sold out', 'box') +
      metricCard('Order value', DB.formatKsh(metrics.totalValue), 'Non-cancelled order requests', 'sparkle') +
      metricCard('Customers', DB.formatNumber(customers.length), 'Derived from order requests', 'users') +
    '</div>';

    const recentOrders = orders.slice(0, 5).map(function (order) {
      return '<div class="alert-row">' +
        '<div class="alert-row__info"><strong>' + escape(order.reference) + ' · ' + escape(order.customer.name) + '</strong>' +
        '<small>' + DB.formatDate(order.createdAt) + ' · ' + DB.formatKsh(order.total) + ' · ' + escape(order.items.length) + ' line' + (order.items.length === 1 ? '' : 's') + '</small></div>' +
        statusBadge(order.status) +
        iconButton('view-order', order.reference, 'View order ' + order.reference, 'eye') +
      '</div>';
    }).join('');

    const alertRows = alerts.map(function (product) {
      return '<div class="alert-row">' +
        '<div class="alert-row__info"><strong>' + escape(product.name) + '</strong><small>' + escape(product.category) + ' · Ref ' + escape(product.id) + '</small></div>' +
        '<span class="alert-row__count">' + (Number(product.stock) || 0) + ' left</span>' +
        stockPill(product) +
      '</div>';
    }).join('');

    const activityRows = activity.map(function (item) {
      return '<div class="activity-item" data-type="' + attr(item.type) + '">' +
        '<span class="activity-dot" aria-hidden="true"></span>' +
        '<span class="activity-item__text">' + escape(item.message) + '</span>' +
        '<span class="activity-item__time">' + DB.relativeTime(item.at) + '</span>' +
      '</div>';
    }).join('');

    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>THE WORKSPACE, AT A GLANCE.</h2><p>Order requests, catalogue health and recent activity. All figures are computed from LocalStorage data in this browser.</p></div>' +
        '<div class="admin-page-head__actions">' +
          '<a class="btn btn--dark" href="#orders">Review orders</a>' +
          '<button class="btn btn--ghost" type="button" data-export-orders>Export orders CSV</button>' +
        '</div>' +
      '</div>' +
      metricsHtml +
      '<div class="admin-grid-2">' +
        '<div class="admin-panel"><div class="admin-panel__head"><h3>Recent order requests</h3><a href="#orders">All orders</a></div><div class="admin-panel__body admin-panel__body--flush">' +
          (recentOrders || emptyBlock('No orders yet', 'Order requests will appear here after checkout.')) +
        '</div></div>' +
        '<div class="admin-panel"><div class="admin-panel__head"><h3>Inventory alerts</h3><a href="#inventory">Manage stock</a></div><div class="admin-panel__body admin-panel__body--flush">' +
          (alertRows || emptyBlock('Stock looks healthy', 'No products are at or below the low-stock threshold.')) +
        '</div></div>' +
      '</div>' +
      '<div class="admin-panel"><div class="admin-panel__head"><h3>Recent activity</h3><button type="button" data-export-activity>Export log</button></div><div class="admin-panel__body admin-panel__body--flush">' +
        (activityRows || emptyBlock('No activity yet', 'Admin actions and order requests will be recorded here.')) +
      '</div></div>' +
      '<p class="admin-note"><strong>Inventory policy:</strong> stock is deducted when an order moves to Confirmed, Processing, Ready for Collection or Completed. It is returned if the order moves back to Pending or Cancelled, or is deleted. Status changes are blocked if stock is insufficient.</p>';
  }

  /* -----------------------------------------------------------------------
   * Products
   * -------------------------------------------------------------------- */

  function filteredProducts() {
    const DB = window.DelaBoss;
    const threshold = Math.max(0, Number(DB.getSettings().lowStockThreshold) || 0);
    const query = state.productSearch.trim().toLowerCase();
    return DB.getProducts().filter(function (product) {
      if (query) {
        const haystack = [product.id, product.name, product.category, product.subcategory, product.description].join(' ').toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      if (state.productCategory !== 'all' && product.category !== state.productCategory) return false;
      const stock = Number(product.stock) || 0;
      if (state.productStock === 'in' && stock <= threshold) return false;
      if (state.productStock === 'low' && !(stock > 0 && stock <= threshold)) return false;
      if (state.productStock === 'out' && stock > 0) return false;
      return true;
    });
  }

  function renderProducts() {
    const DB = window.DelaBoss;
    const target = section('products');
    if (!target) return;
    const products = filteredProducts();
    const total = DB.getProducts().length;
    const categories = DB.getCategories().filter(function (category) { return category.name !== 'New'; }).map(function (category) { return category.name; });

    const rows = products.map(function (product) {
      const stock = Number(product.stock) || 0;
      const image = (product.images && product.images[0]) || 'assets/images/placeholder.svg';
      return '<tr>' +
        '<td><div class="admin-product-cell">' +
          '<img class="admin-thumb" src="' + attr(DB.safeImageUrl(image)) + '" alt="' + attr(product.name + ' product image') + '" width="72" height="90" loading="lazy">' +
          '<div><strong><a href="product.html?id=' + encodeURIComponent(product.id) + '" target="_blank" rel="noopener">' + escape(product.name) + '</a></strong>' +
          '<small>' + escape(product.id) + ' · ' + escape(product.subcategory || 'Uncategorised') + '</small></div>' +
        '</div></td>' +
        '<td>' + escape(product.category) + '</td>' +
        '<td class="is-nowrap">' + DB.formatKsh(product.price) +
          (Number(product.compareAt) > Number(product.price) ? '<br><span class="admin-muted">' + DB.formatKsh(product.compareAt) + '</span>' : '') +
        '</td>' +
        '<td><strong>' + stock + '</strong> <span class="admin-muted">unit' + (stock === 1 ? '' : 's') + '</span></td>' +
        '<td>' + stockPill(product) + '</td>' +
        '<td><div class="admin-actions">' +
          '<a class="admin-icon-btn" href="product.html?id=' + encodeURIComponent(product.id) + '" target="_blank" rel="noopener" aria-label="View ' + attr(product.name) + ' on the storefront" title="View product">' + DB.icon('eye') + '</a>' +
          iconButton('edit-product', product.id, 'Edit ' + product.name, 'edit') +
          iconButton('delete-product', product.id, 'Delete ' + product.name, 'trash', 'admin-icon-btn--danger') +
        '</div></td>' +
      '</tr>';
    }).join('');

    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>THE CATALOGUE.</h2><p>' + total + ' products. Add, edit or remove pieces. Changes are saved in this browser and appear on the storefront immediately.</p></div>' +
        '<div class="admin-page-head__actions">' +
          '<button class="btn btn--dark" type="button" data-add-product>Add product</button>' +
          '<button class="btn btn--ghost" type="button" data-export-products>Export CSV</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-toolbar">' +
        '<div class="admin-search">' + DB.icon('search') +
          '<label class="visually-hidden" for="adminProductSearch">Search products</label>' +
          '<input id="adminProductSearch" type="search" placeholder="Search products, refs or categories" value="' + attr(state.productSearch) + '" autocomplete="off">' +
        '</div>' +
        '<label class="visually-hidden" for="adminProductCategory">Filter by category</label>' +
        '<select class="admin-select" id="adminProductCategory">' + optionsHtml(categories, state.productCategory, 'All categories', 'all') + '</select>' +
        '<label class="visually-hidden" for="adminProductStock">Filter by stock state</label>' +
        '<select class="admin-select" id="adminProductStock">' +
          '<option value="all"' + (state.productStock === 'all' ? ' selected' : '') + '>All stock states</option>' +
          '<option value="in"' + (state.productStock === 'in' ? ' selected' : '') + '>Healthy stock</option>' +
          '<option value="low"' + (state.productStock === 'low' ? ' selected' : '') + '>Low stock</option>' +
          '<option value="out"' + (state.productStock === 'out' ? ' selected' : '') + '>Sold out</option>' +
        '</select>' +
        '<span class="admin-toolbar__count">' + products.length + ' of ' + total + ' products</span>' +
      '</div>' +
      (products.length
        ? '<div class="admin-table-wrap"><table class="admin-table"><caption>Products</caption><thead><tr>' +
            '<th scope="col">Product</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Stock</th><th scope="col">State</th><th scope="col" class="is-right">Actions</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="admin-table-wrap">' + emptyBlock('No products match', 'Try a different search, category or stock filter.') + '</div>') +
      '<p class="admin-note">Product prices and images are preview content. Uploaded images are resized and saved as LocalStorage data URLs; large libraries can exhaust browser storage.</p>';
  }

  function parseColorLines(value) {
    const DB = window.DelaBoss;
    return String(value || '').split('\n').map(function (line) {
      return line.trim();
    }).filter(Boolean).slice(0, 12).map(function (line) {
      const parts = line.split('|');
      const name = (parts[0] || '').trim();
      let hex = (parts[1] || '').trim();
      if (hex && hex.charAt(0) !== '#') hex = '#' + hex;
      if (!/^#[0-9a-f]{3,8}$/i.test(hex)) hex = DB.colorHex(name);
      return { name: name, hex: hex };
    }).filter(function (color) { return Boolean(color.name); });
  }

  function isSafeImageValue(value) {
    const v = String(value || '').trim();
    return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v) ||
      /^assets\/[a-z0-9/_\-.]+$/i.test(v) ||
      /^https?:\/\/[^\s"'<>]+$/i.test(v);
  }

  function setImagePreview(value) {
    const image = byId('productImagePreviewImage');
    if (!image) return;
    image.src = value ? window.DelaBoss.safeImageUrl(value) : 'assets/images/placeholder.svg';
  }

  function processImageFile(file) {
    const DB = window.DelaBoss;
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      DB.toast('Choose an image file such as JPG, PNG or WebP.', { type: 'error' });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      DB.toast('That image is larger than 4 MB. Choose a smaller file.', { type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const image = new Image();
      image.onload = function () {
        try {
          const maxWidth = 900;
          const maxHeight = 1125;
          const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          context.fillStyle = '#f6f1e9';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const data = canvas.toDataURL('image/jpeg', 0.8);
          state.pendingImage = data;
          state.imageCleared = false;
          const urlInput = byId('productImageUrl');
          if (urlInput) urlInput.value = '';
          setImagePreview(data);
          DB.toast('Image prepared locally (' + canvas.width + ' × ' + canvas.height + ').', { type: 'success' });
        } catch (error) {
          console.error(error);
          DB.toast('That image could not be processed. Try a different file.', { type: 'error' });
        }
      };
      image.onerror = function () {
        DB.toast('That image could not be read. Try a different file.', { type: 'error' });
      };
      image.src = reader.result;
    };
    reader.onerror = function () {
      DB.toast('The selected file could not be read.', { type: 'error' });
    };
    reader.readAsDataURL(file);
  }

  function openProductDialog(id) {
    const DB = window.DelaBoss;
    const product = id ? DB.getProduct(id) : null;
    if (id && !product) {
      DB.toast('That product could not be found.', { type: 'error' });
      return;
    }
    state.pendingImage = null;
    state.imageCleared = false;
    const categories = DB.getCategories().filter(function (category) { return category.name !== 'New'; }).map(function (category) { return category.name; });
    const firstImage = product && product.images && product.images[0] ? product.images[0] : '';
    const isDataImage = /^data:image\//i.test(firstImage);
    const preview = firstImage || 'assets/images/placeholder.svg';
    const urlValue = firstImage && !isDataImage ? firstImage : '';
    const colorLines = product ? (product.colors || []).map(function (color) { return color.name + ' | ' + (color.hex || DB.colorHex(color.name)); }).join('\n') : '';
    const detailLines = product ? (product.details || []).join('\n') : '';

    const dialogHtml =
      '<div class="admin-dialog__head">' +
        '<div><h2 id="adminDialogTitle">' + (product ? 'Edit product' : 'Add product') + '</h2><p>Preview catalogue entry · Stored in this browser only.</p></div>' +
        '<button class="admin-dialog__close" type="button" data-dialog-close aria-label="Close dialog">' + DB.icon('close') + '</button>' +
      '</div>' +
      '<form class="admin-form" id="productForm" novalidate>' +
        '<div class="admin-dialog__body">' +
          '<div class="field"><label for="productName">Product name <span class="optional">required</span></label><input id="productName" type="text" value="' + attr(product ? product.name : '') + '" required></div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="productCategory">Category</label><select id="productCategory">' + optionsHtml(categories, product ? product.category : categories[0], null, '') + '</select></div>' +
            '<div class="field"><label for="productSubcategory">Subcategory</label><input id="productSubcategory" type="text" value="' + attr(product ? product.subcategory || '' : '') + '" placeholder="e.g. Dresses"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="productPrice">Price (KSh) <span class="optional">required</span></label><input id="productPrice" type="number" min="1" step="50" value="' + attr(product ? product.price : '') + '" required></div>' +
            '<div class="field"><label for="productCompareAt">Compare-at price (KSh) <span class="optional">optional</span></label><input id="productCompareAt" type="number" min="0" step="50" value="' + attr(product && product.compareAt ? product.compareAt : '') + '" placeholder="Leave empty unless on offer"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="productStock">Stock units</label><input id="productStock" type="number" min="0" step="1" value="' + attr(product ? product.stock : 5) + '"></div>' +
            '<div class="field"><label for="productSizes">Sizes <span class="optional">comma separated</span></label><input id="productSizes" type="text" value="' + attr(product ? (product.sizes || []).join(', ') : 'S, M, L, XL') + '" placeholder="S, M, L, XL"></div>' +
          '</div>' +
          '<div class="field"><label for="productColors">Colours <span class="optional">one per line: Name | #hex</span></label><textarea id="productColors" rows="3" placeholder="Black | #171717&#10;Bone | #D8CEBD">' + escape(colorLines) + '</textarea></div>' +
          '<div class="field"><label for="productDescription">Description</label><textarea id="productDescription" rows="3" required>' + escape(product ? product.description : '') + '</textarea></div>' +
          '<div class="field"><label for="productDetails">Product detail bullets <span class="optional">one per line</span></label><textarea id="productDetails" rows="3">' + escape(detailLines) + '</textarea></div>' +
          '<div class="admin-form__section">' +
            '<p class="admin-form__section-title">Product photography</p>' +
            '<div class="admin-image-editor">' +
              '<div class="admin-image-preview"><img id="productImagePreviewImage" src="' + attr(DB.safeImageUrl(preview)) + '" alt="Product image preview" width="192" height="240"></div>' +
              '<div class="admin-image-controls">' +
                '<label class="admin-upload">Upload image<input id="productImageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>' +
                '<label class="visually-hidden" for="productImageUrl">Or enter an image path or URL</label>' +
                '<input class="admin-input" id="productImageUrl" type="text" value="' + attr(urlValue) + '" placeholder="or paste assets/... or https://...">' +
                '<button class="admin-image-remove" type="button" id="productImageRemove">Remove image</button>' +
                '<small>Uploads are resized to fit 900 × 1125 px and saved as a JPEG data URL in LocalStorage. Max file size 4 MB.' + (isDataImage ? ' Current image is a local upload.' : '') + '</small>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="admin-form__section">' +
            '<p class="admin-form__section-title">Merchandising</p>' +
            '<div class="field-row">' +
              '<label class="admin-check"><input id="productFeatured" type="checkbox"' + (product && product.featured ? ' checked' : '') + '> Show in the featured edit on the home page</label>' +
              '<label class="admin-check"><input id="productNew" type="checkbox"' + (product && product.newArrival ? ' checked' : '') + '> Mark as a new arrival</label>' +
            '</div>' +
          '</div>' +
          '<p class="form-error" id="productFormError" role="alert" hidden></p>' +
        '</div>' +
        '<div class="admin-dialog__actions">' +
          '<button class="btn btn--ghost" type="button" data-dialog-close>Cancel</button>' +
          '<button class="btn btn--dark" type="submit">' + (product ? 'Save changes' : 'Add product') + '</button>' +
        '</div>' +
      '</form>';

    showDialog(dialogHtml);
    const fileInput = byId('productImageFile');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        processImageFile(fileInput.files && fileInput.files[0]);
      });
    }
    const urlInput = byId('productImageUrl');
    if (urlInput) {
      urlInput.addEventListener('input', function () {
        if (state.pendingImage && !urlInput.value.trim()) {
          setImagePreview(state.pendingImage);
        } else {
          setImagePreview(urlInput.value.trim());
        }
      });
    }
    const removeButton = byId('productImageRemove');
    if (removeButton) {
      removeButton.addEventListener('click', function () {
        state.pendingImage = null;
        state.imageCleared = true;
        if (urlInput) urlInput.value = '';
        setImagePreview('');
        DB.toast('Image removed. The placeholder will be used if you save.', { type: 'info' });
      });
    }
    const form = byId('productForm');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        saveProductFromForm(product);
      });
    }
  }

  function saveProductFromForm(existing) {
    const DB = window.DelaBoss;
    const errorBox = byId('productFormError');
    const showError = function (message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
    };
    if (errorBox) errorBox.hidden = true;

    const name = byId('productName').value.trim();
    const category = byId('productCategory').value;
    const subcategory = byId('productSubcategory').value.trim();
    const price = Math.round(Number(byId('productPrice').value));
    const compareAtRaw = byId('productCompareAt').value.trim();
    const compareAt = compareAtRaw ? Math.round(Number(compareAtRaw)) : null;
    const stock = Math.floor(Number(byId('productStock').value));
    const sizesRaw = byId('productSizes').value;
    const colorsRaw = byId('productColors').value;
    const description = byId('productDescription').value.trim();
    const details = byId('productDetails').value.split('\n').map(function (line) { return line.trim(); }).filter(Boolean).slice(0, 12);
    const urlInput = byId('productImageUrl');
    const imageUrl = urlInput ? urlInput.value.trim() : '';

    if (!name || name.length < 2) return showError('Enter a product name with at least two characters.');
    if (!category) return showError('Choose a category.');
    if (!Number.isFinite(price) || price <= 0) return showError('Enter a price greater than zero.');
    if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < 0)) return showError('Compare-at price must be zero or a positive number.');
    if (compareAt !== null && compareAt > 0 && compareAt <= price) return showError('Compare-at price must be higher than the price.');
    if (!Number.isFinite(stock) || stock < 0 || stock > 9999) return showError('Stock must be a whole number between 0 and 9,999.');
    if (!description || description.length < 10) return showError('Add a description of at least 10 characters.');

    let image = '';
    if (imageUrl) {
      if (!isSafeImageValue(imageUrl)) return showError('Image path must start with assets/ or https://, or be an uploaded image.');
      image = imageUrl;
    } else if (state.pendingImage) {
      image = state.pendingImage;
    } else if (existing && existing.images && existing.images[0] && !state.imageCleared) {
      image = existing.images[0];
    } else {
      image = 'assets/images/placeholder.svg';
    }

    let images;
    if (existing && existing.images && existing.images[0] === image) {
      images = existing.images.slice();
    } else {
      images = [image];
    }

    const sizes = sizesRaw.split(',').map(function (size) { return size.trim(); }).filter(Boolean).slice(0, 20);
    const colors = parseColorLines(colorsRaw);
    const today = new Date().toISOString().slice(0, 10);

    const data = {
      name: name,
      category: category,
      subcategory: subcategory || 'Piece',
      price: price,
      compareAt: compareAt && compareAt > 0 ? compareAt : null,
      stock: stock,
      sizes: sizes.length ? sizes : ['One Size'],
      colors: colors,
      images: images,
      description: description,
      details: details.length ? details : ['Details to be confirmed with the store'],
      featured: byId('productFeatured').checked,
      newArrival: byId('productNew').checked,
      dateAdded: existing && existing.dateAdded ? existing.dateAdded : today
    };

    const products = DB.getProducts();
    if (existing) {
      const index = products.findIndex(function (product) { return product.id === existing.id; });
      if (index === -1) return showError('This product no longer exists in the catalogue.');
      products[index] = Object.assign({}, products[index], data);
    } else {
      products.unshift(Object.assign({
        id: DB.generateProductId()
      }, data));
    }

    if (!DB.saveProducts(products)) {
      return showError('The catalogue could not be saved. Browser storage may be full — try a smaller image or reset the preview.');
    }
    DB.addActivity('catalogue', 'Product “' + name + '” was ' + (existing ? 'updated' : 'added') + ' in the catalogue.');
    if (dialog) dialog.close();
    renderProducts();
    updateNavBadges();
    DB.toast(existing ? 'Product updated.' : 'Product added to the catalogue.', { type: 'success' });
  }

  function deleteProduct(id) {
    const DB = window.DelaBoss;
    const product = DB.getProduct(id);
    if (!product) {
      DB.toast('That product could not be found.', { type: 'error' });
      return;
    }
    const message = 'Delete “' + product.name + '” from the catalogue?\n\nExisting order requests keep their item snapshots. Any matching lines in the current shopping bag will also be removed.';
    if (!window.confirm(message)) return;
    const products = DB.getProducts().filter(function (candidate) { return candidate.id !== id; });
    if (!DB.saveProducts(products)) {
      DB.toast('The product could not be deleted because browser storage could not be updated.', { type: 'error' });
      return;
    }
    const cart = DB.getCart();
    const nextCart = cart.filter(function (line) { return line.productId !== id; });
    if (nextCart.length !== cart.length) DB.saveCart(nextCart);
    DB.addActivity('catalogue', 'Product “' + product.name + '” was deleted from the catalogue.');
    renderProducts();
    updateNavBadges();
    DB.toast('Product deleted. Order snapshots were preserved.', { type: 'success' });
  }

  /* -----------------------------------------------------------------------
   * Inventory
   * -------------------------------------------------------------------- */

  function filteredInventory() {
    const DB = window.DelaBoss;
    const threshold = Math.max(0, Number(DB.getSettings().lowStockThreshold) || 0);
    return DB.getProducts().filter(function (product) {
      const stock = Number(product.stock) || 0;
      if (state.inventoryFilter === 'low') return stock > 0 && stock <= threshold;
      if (state.inventoryFilter === 'out') return stock <= 0;
      if (state.inventoryFilter === 'in') return stock > threshold;
      return true;
    }).sort(function (a, b) {
      return (Number(a.stock) || 0) - (Number(b.stock) || 0);
    });
  }

  function renderInventory(focus) {
    const DB = window.DelaBoss;
    const target = section('inventory');
    if (!target) return;
    const products = filteredInventory();
    const all = DB.getProducts();
    const threshold = Math.max(0, Number(DB.getSettings().lowStockThreshold) || 0);
    const totalUnits = all.reduce(function (total, product) { return total + Math.max(0, Number(product.stock) || 0); }, 0);
    const low = all.filter(function (product) { const stock = Number(product.stock) || 0; return stock > 0 && stock <= threshold; }).length;
    const out = all.filter(function (product) { return (Number(product.stock) || 0) <= 0; }).length;

    const rows = products.map(function (product) {
      const stock = Math.max(0, Number(product.stock) || 0);
      return '<tr>' +
        '<td><div class="admin-product-cell">' +
          '<img class="admin-thumb" src="' + attr(DB.safeImageUrl((product.images && product.images[0]) || '')) + '" alt="" width="72" height="90" loading="lazy">' +
          '<div><strong>' + escape(product.name) + '</strong><small>' + escape(product.id) + ' · ' + escape(product.category) + '</small></div>' +
        '</div></td>' +
        '<td>' + stockPill(product) + '</td>' +
        '<td><span class="stock-stepper">' +
          '<button type="button" data-stock-minus="' + attr(product.id) + '" aria-label="Decrease stock for ' + attr(product.name) + '"' + (stock <= 0 ? ' disabled' : '') + '>' + DB.icon('minus') + '</button>' +
          '<input type="number" min="0" max="9999" step="1" value="' + stock + '" data-stock-input="' + attr(product.id) + '" aria-label="Stock units for ' + attr(product.name) + '">' +
          '<button type="button" data-stock-plus="' + attr(product.id) + '" aria-label="Increase stock for ' + attr(product.name) + '">' + DB.icon('plus') + '</button>' +
        '</span></td>' +
        '<td>' + (stock <= threshold ? '<span class="admin-muted">At or below low-stock threshold (' + threshold + ')</span>' : '<span class="admin-muted">Above low-stock threshold (' + threshold + ')</span>') + '</td>' +
        '<td><div class="admin-actions">' +
          iconButton('edit-product', product.id, 'Edit ' + product.name, 'edit') +
        '</div></td>' +
      '</tr>';
    }).join('');

    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>INVENTORY.</h2><p>Adjust stock one unit at a time or type an exact figure. The low-stock threshold is currently <strong>' + threshold + '</strong> and can be changed in Settings.</p></div>' +
        '<div class="admin-page-head__actions">' +
          '<button class="btn btn--ghost" type="button" data-export-inventory>Export inventory CSV</button>' +
          '<a class="btn btn--ghost" href="#settings">Stock settings</a>' +
        '</div>' +
      '</div>' +
      '<div class="metric-grid">' +
        metricCard('Units on hand', DB.formatNumber(totalUnits), 'All products combined', 'box') +
        metricCard('Low stock', DB.formatNumber(low), 'Above zero, at or below threshold', 'info') +
        metricCard('Sold out', DB.formatNumber(out), 'Zero units in preview', 'trash') +
        metricCard('Products', DB.formatNumber(all.length), 'Total catalogue entries', 'shirt') +
      '</div>' +
      '<div class="admin-toolbar" style="margin-top:14px">' +
        '<label class="visually-hidden" for="adminInventoryFilter">Filter inventory</label>' +
        '<select class="admin-select" id="adminInventoryFilter">' +
          '<option value="all"' + (state.inventoryFilter === 'all' ? ' selected' : '') + '>All products</option>' +
          '<option value="in"' + (state.inventoryFilter === 'in' ? ' selected' : '') + '>Healthy stock</option>' +
          '<option value="low"' + (state.inventoryFilter === 'low' ? ' selected' : '') + '>Low stock</option>' +
          '<option value="out"' + (state.inventoryFilter === 'out' ? ' selected' : '') + '>Sold out</option>' +
        '</select>' +
        '<span class="admin-toolbar__count">' + products.length + ' of ' + all.length + ' products</span>' +
      '</div>' +
      (products.length
        ? '<div class="admin-table-wrap"><table class="admin-table"><caption>Inventory</caption><thead><tr>' +
            '<th scope="col">Product</th><th scope="col">State</th><th scope="col">Stock units</th><th scope="col">Threshold</th><th scope="col" class="is-right">Actions</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="admin-table-wrap">' + emptyBlock('Nothing in this filter', 'Choose another stock filter to see inventory.') + '</div>') +
      '<p class="admin-note"><strong>Inventory rule:</strong> stock edits are independent of existing orders. Changing a status on the Orders page may deduct or return stock — always review the order workflow before editing inventory.</p>';

    if (focus) {
      let node = null;
      if (focus.action === 'input') {
        node = document.querySelector('[data-stock-input="' + focus.id + '"]');
      } else {
        node = document.querySelector('[data-stock-' + focus.action + '="' + focus.id + '"]');
        if (!node || node.disabled) node = document.querySelector('[data-stock-plus="' + focus.id + '"]');
      }
      if (node) node.focus();
    }
  }

  function setStock(id, value, focus) {
    const DB = window.DelaBoss;
    const products = DB.getProducts();
    const product = products.find(function (candidate) { return candidate.id === id; });
    if (!product) return;
    const next = Math.max(0, Math.min(9999, Math.floor(Number(value))));
    if (!Number.isFinite(next)) return;
    product.stock = next;
    if (!DB.saveProducts(products)) {
      DB.toast('Stock could not be saved because browser storage could not be updated.', { type: 'error' });
      return;
    }
    renderInventory(focus);
    updateNavBadges();
  }

  /* -----------------------------------------------------------------------
   * Orders
   * -------------------------------------------------------------------- */

  function filteredOrders() {
    const DB = window.DelaBoss;
    const query = state.orderSearch.trim().toLowerCase();
    return DB.getOrders().filter(function (order) {
      if (state.orderStatus !== 'all' && order.status !== state.orderStatus) return false;
      if (!query) return true;
      const haystack = [
        order.reference,
        order.customer && order.customer.name,
        order.customer && order.customer.phone,
        order.customer && order.customer.email,
        order.county,
        order.town,
        (order.items || []).map(function (item) { return item.name; }).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) !== -1;
    }).sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  function renderOrders() {
    const DB = window.DelaBoss;
    const target = section('orders');
    if (!target) return;
    const orders = filteredOrders();
    const all = DB.getOrders();
    const metrics = DB.orderMetrics();

    const rows = orders.map(function (order) {
      const itemCount = (order.items || []).reduce(function (total, item) { return total + (Number(item.qty) || 0); }, 0);
      return '<tr>' +
        '<td class="is-nowrap"><strong>' + escape(order.reference) + '</strong>' + (order.sample ? '<br><span class="admin-muted">Preloaded preview</span>' : '') + '</td>' +
        '<td><div class="admin-product-cell" style="min-width:140px"><div><strong>' + escape(order.customer.name) + '</strong><small>' + escape(order.customer.phone || 'No phone') + '</small></div></div></td>' +
        '<td class="is-nowrap">' + DB.formatDate(order.createdAt) + '</td>' +
        '<td>' + itemCount + '</td>' +
        '<td class="is-nowrap">' + DB.formatKsh(order.total) + '</td>' +
        '<td>' + statusBadge(order.status) + '</td>' +
        '<td><div class="admin-actions">' + iconButton('view-order', order.reference, 'View order ' + order.reference, 'eye') + '</div></td>' +
      '</tr>';
    }).join('');

    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>ORDER REQUESTS.</h2><p>Three preloaded order requests plus any requests placed through the preview checkout. Status changes follow the inventory policy and are recorded in each order timeline.</p></div>' +
        '<div class="admin-page-head__actions">' +
          '<button class="btn btn--ghost" type="button" data-export-orders>Export orders CSV</button>' +
          '<a class="btn btn--ghost" href="checkout.html">Try checkout</a>' +
        '</div>' +
      '</div>' +
      '<div class="metric-grid">' +
        metricCard('All orders', DB.formatNumber(metrics.totalOrders), metrics.cancelled + ' cancelled', 'receipt') +
        metricCard('Pending', DB.formatNumber(metrics.pending), 'Not yet confirmed', 'info') +
        metricCard('In progress', DB.formatNumber(metrics.confirmed + metrics.processing + metrics.ready), 'Confirmed to ready', 'box') +
        metricCard('Completed', DB.formatNumber(metrics.completed), 'Workflow complete', 'check') +
      '</div>' +
      '<div class="admin-toolbar" style="margin-top:14px">' +
        '<div class="admin-search">' + DB.icon('search') +
          '<label class="visually-hidden" for="adminOrderSearch">Search orders</label>' +
          '<input id="adminOrderSearch" type="search" placeholder="Search reference, customer, phone or town" value="' + attr(state.orderSearch) + '" autocomplete="off">' +
        '</div>' +
        '<label class="visually-hidden" for="adminOrderStatus">Filter by status</label>' +
        '<select class="admin-select" id="adminOrderStatus">' + optionsHtml(DB.ORDER_STATUSES, state.orderStatus, 'All statuses', 'all') + '</select>' +
        '<span class="admin-toolbar__count">' + orders.length + ' of ' + all.length + ' orders</span>' +
      '</div>' +
      (orders.length
        ? '<div class="admin-table-wrap"><table class="admin-table"><caption>Order requests</caption><thead><tr>' +
            '<th scope="col">Reference</th><th scope="col">Customer</th><th scope="col">Date</th><th scope="col">Qty</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col" class="is-right">Actions</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="admin-table-wrap">' + emptyBlock('No orders match', 'Try another search or status filter.') + '</div>') +
      '<p class="admin-note"><strong>Preview data:</strong> preloaded order requests use fictional customers. Preview checkout requests are created only in this browser. Nothing here is a real transaction, sale or fulfilment record.</p>';
  }

  function openOrderDialog(reference) {
    const DB = window.DelaBoss;
    const order = DB.findOrder(reference);
    if (!order) {
      DB.toast('That order request could not be found.', { type: 'error' });
      return;
    }
    const delivery = order.fulfilment === 'delivery';
    const destination = delivery
      ? [order.town, order.county].filter(Boolean).join(', ') || '—'
      : 'Collection from Kehancha (arrangements to be confirmed)';
    const items = (order.items || []).map(function (item) {
      return '<div class="order-item">' +
        '<img src="' + attr(DB.safeImageUrl(item.image || '')) + '" alt="" width="68" height="86" loading="lazy">' +
        '<div class="order-item__info"><strong>' + escape(item.name) + '</strong><small>' + escape(item.size || 'One Size') + ' · ' + escape(item.color || '—') + ' · Qty ' + (Number(item.qty) || 0) + '</small></div>' +
        '<span class="order-item__price">' + DB.formatKsh(item.lineTotal) + '</span>' +
      '</div>';
    }).join('');
    const history = (order.statusHistory || []).slice().reverse().map(function (entry) {
      return '<div class="admin-history__item">' +
        '<strong>' + escape(entry.status) + '</strong>' +
        '<span>' + escape(entry.note || entry.actor || '') + '</span>' +
        '<time datetime="' + attr(entry.at) + '">' + DB.formatDateTime(entry.at) + '</time>' +
      '</div>';
    }).join('');

    const html =
      '<div class="admin-dialog__head">' +
        '<div><h2 id="adminDialogTitle">' + escape(order.reference) + '</h2><p>' + DB.formatDateTime(order.createdAt) + ' · ' + (order.sample ? 'Preloaded preview order' : 'Created by preview checkout') + '</p></div>' +
        '<button class="admin-dialog__close" type="button" data-dialog-close aria-label="Close order details">' + DB.icon('close') + '</button>' +
      '</div>' +
      '<div class="admin-dialog__body">' +
        '<div class="admin-detail-grid">' +
          '<div class="admin-detail-block"><h3>Customer</h3><div class="admin-detail-list">' +
            '<div><span>Name</span><span>' + escape(order.customer.name) + '</span></div>' +
            '<div><span>Phone</span><span>' + escape(order.customer.phone || '—') + '</span></div>' +
            '<div><span>Email</span><span>' + escape(order.customer.email || '—') + '</span></div>' +
          '</div></div>' +
          '<div class="admin-detail-block"><h3>Fulfilment</h3><div class="admin-detail-list">' +
            '<div><span>Preference</span><span>' + (delivery ? 'Delivery' : 'Collection') + '</span></div>' +
            '<div><span>Destination</span><span>' + escape(destination) + '</span></div>' +
            (order.address ? '<div><span>Address note</span><span>' + escape(order.address) + '</span></div>' : '') +
            '<div><span>Status</span><span>' + statusBadge(order.status) + '</span></div>' +
            '<div><span>Inventory</span><span>' + (order.inventoryDeducted ? 'Deducted' : 'Not deducted') + '</span></div>' +
          '</div></div>' +
        '</div>' +
        (order.notes ? '<div class="admin-detail-block" style="margin-top:12px"><h3>Customer note</h3><p class="admin-dialog-note" style="margin-top:0">' + escape(order.notes) + '</p></div>' : '') +
        '<div class="order-items">' + items + '</div>' +
        '<div class="order-totals">' +
          '<div><span>Subtotal</span><strong>' + DB.formatKsh(order.subtotal) + '</strong></div>' +
          '<div><span>Delivery</span><strong>' + (Number(order.deliveryFee) > 0 ? DB.formatKsh(order.deliveryFee) : '—') + '</strong></div>' +
          '<div><span>Estimated total</span><strong>' + DB.formatKsh(order.total) + '</strong></div>' +
        '</div>' +
        '<form class="admin-status-form" id="orderStatusForm" novalidate>' +
          '<div class="field"><label for="orderStatusSelect">Move to status</label><select id="orderStatusSelect">' + optionsHtml(DB.ORDER_STATUSES, order.status, null, '') + '</select></div>' +
          '<div class="field"><label for="orderStatusNote">Timeline note <span class="optional">optional</span></label><input id="orderStatusNote" type="text" placeholder="Reason or note for the change"></div>' +
          '<button class="btn btn--dark" type="submit">Update status</button>' +
          '<p class="form-error" id="orderStatusError" role="alert" hidden></p>' +
        '</form>' +
        '<div class="admin-history">' + history + '</div>' +
        '<p class="admin-dialog-note">Moving to Confirmed, Processing, Ready for Collection or Completed deducts stock once. Moving back to Pending or Cancelled returns it. A shortage blocks the change.</p>' +
      '</div>' +
      '<div class="admin-dialog__actions">' +
        '<button class="btn btn--ghost btn--danger" type="button" id="deleteOrderButton">Delete order request</button>' +
        '<button class="btn btn--ghost" type="button" data-dialog-close>Close</button>' +
      '</div>';

    showDialog(html);
    const form = byId('orderStatusForm');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const status = byId('orderStatusSelect').value;
        const note = byId('orderStatusNote').value.trim();
        const errorBox = byId('orderStatusError');
        const result = DB.updateOrderStatus(order.reference, status, note);
        if (!result.ok) {
          if (errorBox) {
            errorBox.textContent = result.message;
            errorBox.hidden = false;
          }
          DB.toast(result.message, { type: 'error', duration: 6000 });
          return;
        }
        dialog.close();
        renderOrders();
        updateNavBadges();
        DB.toast(result.message, { type: 'success', duration: 5000 });
      });
    }
    const deleteButton = byId('deleteOrderButton');
    if (deleteButton) {
      deleteButton.addEventListener('click', function () {
        const extra = order.inventoryDeducted ? '\n\nPreview inventory for this order will be returned to stock.' : '';
        if (!window.confirm('Delete order request ' + order.reference + '? This cannot be undone.' + extra)) return;
        const result = DB.deleteOrder(order.reference);
        if (!result.ok) {
          DB.toast(result.message, { type: 'error' });
          return;
        }
        dialog.close();
        renderOrders();
        updateNavBadges();
        DB.toast(result.message, { type: 'success' });
      });
    }
  }

  /* -----------------------------------------------------------------------
   * Customers
   * -------------------------------------------------------------------- */

  function filteredCustomers() {
    const DB = window.DelaBoss;
    const query = state.customerSearch.trim().toLowerCase();
    return DB.customersFromOrders().filter(function (customer) {
      if (!query) return true;
      return [customer.name, customer.phone, customer.email].join(' ').toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderCustomers() {
    const DB = window.DelaBoss;
    const target = section('customers');
    if (!target) return;
    const customers = filteredCustomers();
    const all = DB.customersFromOrders();
    const rows = customers.map(function (customer) {
      return '<tr>' +
        '<td><strong>' + escape(customer.name) + '</strong>' + (customer.sample ? '<br><span class="admin-muted">Preloaded preview customer</span>' : '') + '</td>' +
        '<td class="is-nowrap">' + escape(customer.phone || '—') + '</td>' +
        '<td>' + escape(customer.email || '—') + '</td>' +
        '<td>' + customer.orderCount + '</td>' +
        '<td class="is-nowrap">' + DB.formatKsh(customer.totalSpend) + '</td>' +
        '<td class="is-nowrap">' + DB.formatDate(customer.lastOrder) + '</td>' +
        '<td><div class="admin-actions">' +
          '<button class="admin-icon-btn" type="button" data-customer-orders="' + attr(customer.phone) + '" aria-label="View orders for ' + attr(customer.name) + '" title="View orders">' + DB.icon('receipt') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>CUSTOMERS.</h2><p>Customers are derived from order requests rather than stored as a separate customer database. Spending excludes cancelled requests and is preview data only.</p></div>' +
        '<div class="admin-page-head__actions">' +
          '<button class="btn btn--ghost" type="button" data-export-customers>Export customers CSV</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-toolbar">' +
        '<div class="admin-search">' + DB.icon('search') +
          '<label class="visually-hidden" for="adminCustomerSearch">Search customers</label>' +
          '<input id="adminCustomerSearch" type="search" placeholder="Search customers by name, phone or email" value="' + attr(state.customerSearch) + '" autocomplete="off">' +
        '</div>' +
        '<span class="admin-toolbar__count">' + customers.length + ' of ' + all.length + ' customers</span>' +
      '</div>' +
      (customers.length
        ? '<div class="admin-table-wrap"><table class="admin-table"><caption>Customers</caption><thead><tr>' +
            '<th scope="col">Customer</th><th scope="col">Phone</th><th scope="col">Email</th><th scope="col">Orders</th><th scope="col">Spend</th><th scope="col">Last order</th><th scope="col" class="is-right">Actions</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="admin-table-wrap">' + emptyBlock('No customers match', 'Try a different name, phone number or email address.') + '</div>') +
      '<p class="admin-note"><strong>Privacy note:</strong> all customer records here are either preloaded fictional examples or details entered locally during the preview. They are not sent to the business and are removed when preview data is reset or site storage is cleared.</p>';
  }

  /* -----------------------------------------------------------------------
   * Settings
   * -------------------------------------------------------------------- */

  function renderSettings() {
    const DB = window.DelaBoss;
    const target = section('settings');
    if (!target) return;
    const s = DB.getSettings();
    target.innerHTML =
      '<div class="admin-page-head">' +
        '<div><h2>SETTINGS.</h2><p>These values feed the storefront announcement bar, contact links, WhatsApp configuration, low-stock threshold and preview delivery fee. Changes are stored in this browser.</p></div>' +
      '</div>' +
      '<form id="settingsForm" novalidate>' +
        '<div class="admin-settings-grid">' +
          '<section class="admin-form-card"><h3>Storefront identity</h3>' +
            '<div class="field"><label for="settingsStoreName">Store name</label><input id="settingsStoreName" type="text" value="' + attr(s.storeName) + '"></div>' +
            '<div class="field"><label for="settingsLocation">Location line</label><input id="settingsLocation" type="text" value="' + attr(s.location) + '"></div>' +
            '<div class="field"><label for="settingsAnnouncement">Announcement message</label><input id="settingsAnnouncement" type="text" value="' + attr(s.announcement) + '"></div>' +
            '<label class="admin-check" style="margin-top:12px"><input id="settingsShowAnnouncement" type="checkbox"' + (s.showAnnouncement !== false ? ' checked' : '') + '> Show the announcement bar on storefront pages</label>' +
          '</section>' +
          '<section class="admin-form-card"><h3>Contact &amp; WhatsApp</h3>' +
            '<div class="field"><label for="settingsPhonePrimary">Primary phone</label><input id="settingsPhonePrimary" type="tel" value="' + attr(s.phonePrimary) + '"></div>' +
            '<div class="field"><label for="settingsPhoneSecondary">Secondary phone</label><input id="settingsPhoneSecondary" type="tel" value="' + attr(s.phoneSecondary) + '"></div>' +
            '<div class="field"><label for="settingsWhatsapp">WhatsApp number</label><input id="settingsWhatsapp" type="tel" value="' + attr(s.whatsapp) + '"><p class="field__help">Used by every WhatsApp button. Kenyan numbers are normalised to 2547XXXXXXXX or 2541XXXXXXXX.</p></div>' +
            '<p class="field__help" style="margin-top:10px">These are supplied business numbers in this preview. Confirm them with the owner before any production launch.</p>' +
          '</section>' +
          '<section class="admin-form-card"><h3>Inventory &amp; delivery</h3>' +
            '<div class="field"><label for="settingsLowStock">Low-stock threshold</label><input id="settingsLowStock" type="number" min="0" max="100" step="1" value="' + attr(s.lowStockThreshold) + '"><p class="field__help">Products at or below this figure are flagged in the storefront and dashboard.</p></div>' +
            '<div class="field"><label for="settingsDeliveryFee">Preview delivery fee (KSh)</label><input id="settingsDeliveryFee" type="number" min="0" max="100000" step="50" value="' + attr(s.deliveryFee) + '"><p class="field__help">Set to 0 to show “to be agreed” in the checkout. This is not a real quote.</p></div>' +
            '<div class="field"><label for="settingsCurrency">Currency</label><input id="settingsCurrency" type="text" value="' + attr(s.currency || 'KES') + '" disabled><p class="field__help">KSh formatting is fixed in this preview.</p></div>' +
          '</section>' +
          '<section class="admin-form-card"><h3>Configuration notes</h3>' +
            '<p class="field__help">Store name, location, phone numbers, low-stock threshold and delivery fee are centralised here. Product and order data live separately under the same LocalStorage namespace.</p>' +
            '<p class="field__help" style="margin-top:10px">The WhatsApp number is normalised when links are generated. If the number is blank or malformed, WhatsApp actions show an error instead of opening a broken link.</p>' +
            '<p class="field__help" style="margin-top:10px">The admin is intentionally unauthenticated. Do not enter real customer data, secrets or personal information.</p>' +
          '</section>' +
        '</div>' +
        '<p class="form-error" id="settingsError" role="alert" hidden></p>' +
        '<div class="admin-settings-actions">' +
          '<button class="btn btn--dark" type="submit">Save settings</button>' +
          '<p>Settings save locally. Storefront pages refresh their contact details when reloaded.</p>' +
        '</div>' +
      '</form>' +
      '<div class="admin-danger">' +
        '<h3>Reset all preview data</h3>' +
        '<p>Restore the original 25 products, three preloaded order requests, default settings and a clean bag. This deletes any products, images, orders, enquiries or settings changes saved in this browser. It cannot be undone.</p>' +
        '<button class="btn btn--ghost" type="button" data-reset-demo>Reset preview data</button>' +
      '</div>' +
      '<p class="admin-note"><strong>Production warning:</strong> this dashboard has no authentication, server validation, audit trail or role permissions. A live store would need a secure backend, real inventory integration, payment handling, privacy controls and a tested order-notification workflow.</p>';
  }

  function saveSettingsFromForm() {
    const DB = window.DelaBoss;
    const errorBox = byId('settingsError');
    const fields = [
      byId('settingsStoreName'),
      byId('settingsLocation'),
      byId('settingsPhonePrimary'),
      byId('settingsPhoneSecondary'),
      byId('settingsWhatsapp'),
      byId('settingsLowStock'),
      byId('settingsDeliveryFee')
    ];
    fields.forEach(function (field) { if (field) field.removeAttribute('aria-invalid'); });
    const fail = function (message, field) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
      DB.toast(message, { type: 'error' });
    };

    const storeName = byId('settingsStoreName').value.trim();
    const location = byId('settingsLocation').value.trim();
    const phonePrimary = byId('settingsPhonePrimary').value.trim();
    const phoneSecondary = byId('settingsPhoneSecondary').value.trim();
    const whatsapp = DB.normalizeWhatsAppNumber(byId('settingsWhatsapp').value);
    const lowStockThreshold = Math.floor(Number(byId('settingsLowStock').value));
    const deliveryFee = Math.round(Number(byId('settingsDeliveryFee').value));

    if (!storeName) return fail('Enter a store name.', byId('settingsStoreName'));
    if (!location) return fail('Enter a location line for the footer and announcement area.', byId('settingsLocation'));
    if (!DB.validateKenyanPhone(phonePrimary)) return fail('Enter a valid Kenyan primary phone number.', byId('settingsPhonePrimary'));
    if (!DB.validateKenyanPhone(phoneSecondary)) return fail('Enter a valid Kenyan secondary phone number.', byId('settingsPhoneSecondary'));
    if (!/^254\d{9}$/.test(whatsapp)) return fail('Enter a valid Kenyan WhatsApp number, for example 0758 102 552.', byId('settingsWhatsapp'));
    if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 100) return fail('Low-stock threshold must be between 0 and 100.', byId('settingsLowStock'));
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) return fail('Delivery fee must be zero or a positive number.', byId('settingsDeliveryFee'));

    const saved = DB.saveSettings({
      storeName: storeName,
      location: location,
      phonePrimary: phonePrimary,
      phoneSecondary: phoneSecondary,
      whatsapp: whatsapp,
      lowStockThreshold: lowStockThreshold,
      deliveryFee: deliveryFee,
      announcement: byId('settingsAnnouncement').value.trim() || DB.DEFAULT_SETTINGS.announcement,
      showAnnouncement: byId('settingsShowAnnouncement').checked
    });
    if (!saved) {
      if (errorBox) {
        errorBox.textContent = 'Settings could not be saved because browser storage rejected the write.';
        errorBox.hidden = false;
      }
      return;
    }
    DB.addActivity('settings', 'Store settings were updated.');
    renderSettings();
    updateNavBadges();
    DB.toast('Settings saved in this browser.', { type: 'success' });
  }

  function resetDemo() {
    const DB = window.DelaBoss;
    if (!window.confirm('Reset all preview data?\n\nThis restores the original catalogue, preloaded order requests and default settings. Products, uploaded images, orders, cart lines and settings changes saved in this browser will be deleted.')) return;
    if (!window.confirm('Final confirmation: this cannot be undone. Reset the preview now?')) return;
    DB.resetDemoData();
    state.productSearch = '';
    state.productCategory = 'all';
    state.productStock = 'all';
    state.inventoryFilter = 'all';
    state.orderSearch = '';
    state.orderStatus = 'all';
    state.customerSearch = '';
    state.pendingImage = null;
    state.imageCleared = false;
    route();
    DB.toast('All preview data has been reset to its original state.', { type: 'success', duration: 6000 });
  }

  /* -----------------------------------------------------------------------
   * CSV exports
   * -------------------------------------------------------------------- */

  function csvCell(value) {
    let text = value == null ? '' : String(value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    if (/[",\r\n]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    window.DelaBoss.toast('CSV export prepared for download.', { type: 'success' });
  }

  function todayStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function exportProducts() {
    const products = window.DelaBoss.getProducts();
    const rows = [['ID', 'Name', 'Category', 'Subcategory', 'Price KES', 'Compare at KES', 'Stock', 'Sizes', 'Colours', 'New arrival', 'Featured', 'Date added']];
    products.forEach(function (product) {
      rows.push([
        product.id,
        product.name,
        product.category,
        product.subcategory,
        product.price,
        product.compareAt || '',
        product.stock,
        (product.sizes || []).join(' / '),
        (product.colors || []).map(function (color) { return color.name; }).join(' / '),
        product.newArrival ? 'Yes' : 'No',
        product.featured ? 'Yes' : 'No',
        product.dateAdded
      ]);
    });
    downloadCsv('delaboss-preview-products-' + todayStamp() + '.csv', rows);
  }

  function exportInventory() {
    const DB = window.DelaBoss;
    const threshold = Number(DB.getSettings().lowStockThreshold) || 0;
    const products = DB.getProducts();
    const rows = [['ID', 'Name', 'Category', 'Stock units', 'State', 'Low-stock threshold', 'Price KES']];
    products.forEach(function (product) {
      rows.push([
        product.id,
        product.name,
        product.category,
        product.stock,
        DB.stockState(product).label,
        threshold,
        product.price
      ]);
    });
    downloadCsv('delaboss-preview-inventory-' + todayStamp() + '.csv', rows);
  }

  function exportOrders() {
    const orders = window.DelaBoss.getOrders();
    const rows = [['Reference', 'Status', 'Customer', 'Phone', 'Email', 'Fulfilment', 'County', 'Town', 'Items', 'Subtotal KES', 'Delivery fee KES', 'Total KES', 'Created', 'Inventory deducted', 'Source']];
    orders.forEach(function (order) {
      rows.push([
        order.reference,
        order.status,
        order.customer.name,
        order.customer.phone,
        order.customer.email,
        order.fulfilment,
        order.county,
        order.town,
        (order.items || []).map(function (item) { return item.name + ' (' + (item.size || 'One Size') + ', ' + (item.color || '—') + ') × ' + item.qty; }).join('; '),
        order.subtotal,
        order.deliveryFee,
        order.total,
        order.createdAt,
        order.inventoryDeducted ? 'Yes' : 'No',
        order.source
      ]);
    });
    downloadCsv('delaboss-preview-orders-' + todayStamp() + '.csv', rows);
  }

  function exportCustomers() {
    const customers = window.DelaBoss.customersFromOrders();
    const rows = [['Name', 'Phone', 'Email', 'Orders', 'Spend KES', 'Last order', 'Preloaded customer']];
    customers.forEach(function (customer) {
      rows.push([
        customer.name,
        customer.phone,
        customer.email,
        customer.orderCount,
        customer.totalSpend,
        customer.lastOrder,
        customer.sample ? 'Yes' : 'No'
      ]);
    });
    downloadCsv('delaboss-preview-customers-' + todayStamp() + '.csv', rows);
  }

  function exportActivity() {
    const activity = window.DelaBoss.getActivity();
    const rows = [['Timestamp', 'Type', 'Message']];
    activity.forEach(function (item) {
      rows.push([item.at, item.type, item.message]);
    });
    downloadCsv('delaboss-preview-activity-' + todayStamp() + '.csv', rows);
  }

  /* -----------------------------------------------------------------------
   * Dialog and routing
   * -------------------------------------------------------------------- */

  function showDialog(html) {
    if (!dialog) dialog = byId('adminDialog');
    if (!dialog) return;
    dialog.innerHTML = html;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    dialog.scrollTop = 0;
  }

  function renderers() {
    return {
      overview: renderOverview,
      products: renderProducts,
      inventory: renderInventory,
      orders: renderOrders,
      customers: renderCustomers,
      settings: renderSettings
    };
  }

  function route() {
    const name = (window.location.hash || '#overview').replace('#', '').split('?')[0];
    const active = Object.prototype.hasOwnProperty.call(SECTIONS, name) ? name : 'overview';
    qsa('[data-admin-section]').forEach(function (target) {
      target.hidden = target.getAttribute('data-admin-section') !== active;
    });
    qsa('[data-admin-nav]').forEach(function (link) {
      if (link.getAttribute('data-admin-nav') === active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    setTitle(active);
    const render = renderers()[active];
    if (render) render();
    updateNavBadges();
    closeSidebar();
  }

  function rerenderWithFocus(render, id) {
    const active = document.activeElement;
    const selectionStart = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
    render();
    if (!id) return;
    const next = byId(id);
    if (!next) return;
    next.focus();
    if (selectionStart !== null && typeof next.setSelectionRange === 'function') {
      const length = next.value.length;
      next.setSelectionRange(Math.min(selectionStart, length), Math.min(selectionStart, length));
    }
  }

  function handleClick(event) {
    const addProduct = event.target.closest('[data-add-product]');
    if (addProduct) {
      openProductDialog(null);
      return;
    }
    const edit = event.target.closest('[data-edit-product]');
    if (edit) {
      openProductDialog(edit.getAttribute('data-edit-product'));
      return;
    }
    const remove = event.target.closest('[data-delete-product]');
    if (remove) {
      deleteProduct(remove.getAttribute('data-delete-product'));
      return;
    }
    const viewOrder = event.target.closest('[data-view-order]');
    if (viewOrder) {
      openOrderDialog(viewOrder.getAttribute('data-view-order'));
      return;
    }
    const stockPlus = event.target.closest('[data-stock-plus]');
    if (stockPlus) {
      const id = stockPlus.getAttribute('data-stock-plus');
      const product = window.DelaBoss.getProduct(id);
      if (product) setStock(id, (Number(product.stock) || 0) + 1, { action: 'plus', id: id });
      return;
    }
    const stockMinus = event.target.closest('[data-stock-minus]');
    if (stockMinus) {
      const id = stockMinus.getAttribute('data-stock-minus');
      const product = window.DelaBoss.getProduct(id);
      if (product) setStock(id, Math.max(0, (Number(product.stock) || 0) - 1), { action: 'minus', id: id });
      return;
    }
    const customerOrders = event.target.closest('[data-customer-orders]');
    if (customerOrders) {
      state.orderSearch = customerOrders.getAttribute('data-customer-orders') || '';
      state.orderStatus = 'all';
      window.location.hash = '#orders';
      if ((window.location.hash || '').replace('#', '') === 'orders') route();
      return;
    }
    if (event.target.closest('[data-export-products]')) {
      exportProducts();
      return;
    }
    if (event.target.closest('[data-export-inventory]')) {
      exportInventory();
      return;
    }
    if (event.target.closest('[data-export-orders]')) {
      exportOrders();
      return;
    }
    if (event.target.closest('[data-export-customers]')) {
      exportCustomers();
      return;
    }
    if (event.target.closest('[data-export-activity]')) {
      exportActivity();
      return;
    }
    if (event.target.closest('[data-reset-demo]')) {
      resetDemo();
    }
  }

  function handleChange(event) {
    const target = event.target;
    if (target.id === 'adminProductCategory') {
      state.productCategory = target.value;
      renderProducts();
      return;
    }
    if (target.id === 'adminProductStock') {
      state.productStock = target.value;
      renderProducts();
      return;
    }
    if (target.id === 'adminInventoryFilter') {
      state.inventoryFilter = target.value;
      renderInventory();
      return;
    }
    if (target.id === 'adminOrderStatus') {
      state.orderStatus = target.value;
      renderOrders();
      return;
    }
    if (target.hasAttribute && target.hasAttribute('data-stock-input')) {
      const id = target.getAttribute('data-stock-input');
      const value = target.value;
      setStock(id, value, { action: 'input', id: id });
    }
  }

  function handleInput(event) {
    const target = event.target;
    if (target.id === 'adminProductSearch') {
      state.productSearch = target.value;
      window.clearTimeout(productSearchTimer);
      productSearchTimer = window.setTimeout(function () {
        rerenderWithFocus(renderProducts, 'adminProductSearch');
      }, 170);
      return;
    }
    if (target.id === 'adminOrderSearch') {
      state.orderSearch = target.value;
      window.clearTimeout(orderSearchTimer);
      orderSearchTimer = window.setTimeout(function () {
        rerenderWithFocus(renderOrders, 'adminOrderSearch');
      }, 170);
      return;
    }
    if (target.id === 'adminCustomerSearch') {
      state.customerSearch = target.value;
      window.clearTimeout(customerSearchTimer);
      customerSearchTimer = window.setTimeout(function () {
        rerenderWithFocus(renderCustomers, 'adminCustomerSearch');
      }, 170);
    }
  }

  function handleSubmit(event) {
    if (event.target.id === 'settingsForm') {
      event.preventDefault();
      saveSettingsFromForm();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const DB = window.DelaBoss;
    if (!DB) return;
    dialog = byId('adminDialog');
    if (dialog) {
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog || event.target.closest('[data-dialog-close]')) {
          dialog.close();
        }
      });
    }

    const main = byId('adminMain');
    if (main) {
      main.addEventListener('click', handleClick);
      main.addEventListener('change', handleChange);
      main.addEventListener('input', handleInput);
      main.addEventListener('submit', handleSubmit);
    }

    const menu = document.querySelector('[data-admin-menu]');
    if (menu) {
      menu.addEventListener('click', function () {
        const shell = byId('adminShell');
        if (shell && shell.classList.contains('is-sidebar-open')) closeSidebar();
        else openSidebar();
      });
    }
    qsa('[data-admin-menu-close]').forEach(function (button) {
      button.addEventListener('click', closeSidebar);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSidebar();
    });
    qsa('[data-admin-nav]').forEach(function (link) {
      link.addEventListener('click', function () {
        closeSidebar();
        const target = (link.getAttribute('href') || '').replace('#', '');
        if ((window.location.hash || '#overview').replace('#', '') === target) route();
      });
    });

    window.addEventListener('hashchange', route);
    window.addEventListener('storage', function (event) {
      if (!event.key || event.key.indexOf('delaboss.demo.v1.') !== 0) return;
      updateNavBadges();
      if (dialog && dialog.open) return;
      const name = (window.location.hash || '#overview').replace('#', '').split('?')[0];
      const render = renderers()[name];
      if (render) render();
    });

    if (!window.location.hash) {
      window.history.replaceState({}, '', '#overview');
    }
    route();
  });
})();
