/* Shop — search, filters, sorting, active filters and load more. */
(function () {
  'use strict';

  const PAGE_SIZE = 12;
  const PRICE_LABELS = {
    '0-2500': 'Under KSh 2,500',
    '2500-4500': 'KSh 2,500 – 4,500',
    '4500-6500': 'KSh 4,500 – 6,500',
    '6500-999999': 'KSh 6,500 and above'
  };

  let state = {
    q: '',
    categories: new Set(),
    sizes: new Set(),
    colors: new Set(),
    price: '',
    edits: new Set(),
    sort: 'featured',
    visible: PAGE_SIZE
  };

  let searchTimer = null;
  let lastFocused = null;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function findCategoryName(value) {
    if (!value) return null;
    const match = window.DelaBoss.getCategories().find(function (category) {
      return category.name.toLowerCase() === String(value).toLowerCase() || category.id.toLowerCase() === String(value).toLowerCase();
    });
    return match ? match.name : null;
  }

  function readURLState() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.price = PRICE_LABELS[params.get('price')] ? params.get('price') : '';
    state.sort = ['featured', 'newest', 'price-asc', 'price-desc', 'name-asc'].includes(params.get('sort')) ? params.get('sort') : 'featured';
    state.categories = new Set();
    state.sizes = new Set();
    state.colors = new Set();
    state.edits = new Set();

    const group = params.get('group');
    if (group === 'clothing') {
      state.categories.add('Men');
      state.categories.add('Women');
    } else {
      (params.get('category') || '').split(',').forEach(function (value) {
        const name = findCategoryName(decodeURIComponent(value.trim()));
        if (name) state.categories.add(name);
      });
    }
    (params.get('size') || '').split(',').forEach(function (value) {
      if (value.trim()) state.sizes.add(decodeURIComponent(value.trim()));
    });
    (params.get('color') || '').split(',').forEach(function (value) {
      if (value.trim()) state.colors.add(decodeURIComponent(value.trim()));
    });
    (params.get('edit') || '').split(',').forEach(function (value) {
      if (value === 'new' || value === 'sale') state.edits.add(value);
    });
    if (params.get('filter') === 'new') state.edits.add('new');
    if (params.get('filter') === 'sale') state.edits.add('sale');
    state.visible = PAGE_SIZE;
  }

  function syncURL() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.categories.size) params.set('category', Array.from(state.categories).join(','));
    if (state.sizes.size) params.set('size', Array.from(state.sizes).join(','));
    if (state.colors.size) params.set('color', Array.from(state.colors).join(','));
    if (state.price) params.set('price', state.price);
    if (state.edits.size) params.set('edit', Array.from(state.edits).join(','));
    if (state.sort !== 'featured') params.set('sort', state.sort);
    const next = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', next);
  }

  function categoryCount(name) {
    return window.DelaBoss.getProducts().filter(function (product) {
      return product.category === name;
    }).length;
  }

  function renderFilterOptions() {
    const categories = window.DelaBoss.getCategories().filter(function (category) {
      return category.name !== 'New';
    });
    qs('#categoryFilters').innerHTML = categories.map(function (category) {
      return '<label class="filter-check"><input type="checkbox" name="category" value="' + window.DelaBoss.escapeAttr(category.name) + '"><span>' +
        window.DelaBoss.escapeHtml(category.title.replace("'s Fashion", '') || category.name) +
        '<span class="filter-check__count">' + categoryCount(category.name) + '</span></span></label>';
    }).join('');

    const sizes = new Set();
    const colors = new Map();
    window.DelaBoss.getProducts().forEach(function (product) {
      (product.sizes || []).forEach(function (size) { sizes.add(size); });
      (product.colors || []).forEach(function (color) { colors.set(color.name, color); });
    });
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sortedSizes = Array.from(sizes).sort(function (a, b) {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return String(a).localeCompare(String(b), undefined, { numeric: true });
    });
    qs('#sizeFilters').innerHTML = sortedSizes.map(function (size) {
      return '<label class="filter-check"><input type="checkbox" name="size" value="' + window.DelaBoss.escapeAttr(size) + '"><span>' +
        window.DelaBoss.escapeHtml(size) + '</span></label>';
    }).join('');

    qs('#colourFilters').innerHTML = Array.from(colors.values())
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .map(function (color) {
        return '<label class="filter-check"><input type="checkbox" name="color" value="' + window.DelaBoss.escapeAttr(color.name) + '"><span><span class="swatch" style="--swatch:' + window.DelaBoss.escapeAttr(window.DelaBoss.colorHex(color.name)) + '"></span>' +
          window.DelaBoss.escapeHtml(color.name) + '</span></label>';
      }).join('');
  }

  function syncForm() {
    const form = qs('#filterForm');
    if (!form) return;
    qsa('input[name="category"]', form).forEach(function (input) {
      input.checked = state.categories.has(input.value);
    });
    qsa('input[name="size"]', form).forEach(function (input) {
      input.checked = state.sizes.has(input.value);
    });
    qsa('input[name="color"]', form).forEach(function (input) {
      input.checked = state.colors.has(input.value);
    });
    qsa('input[name="edit"]', form).forEach(function (input) {
      input.checked = state.edits.has(input.value);
    });
    qsa('input[name="priceRange"]', form).forEach(function (input) {
      input.checked = (input.value || '') === (state.price || '');
    });
    const searchInput = qs('#shopSearch');
    if (searchInput) searchInput.value = state.q;
    qs('[data-shop-search]').classList.toggle('has-value', Boolean(state.q));
    const sortSelect = qs('#sortSelect');
    if (sortSelect) sortSelect.value = state.sort;
  }

  function matchesPrice(product) {
    if (!state.price) return true;
    const parts = state.price.split('-');
    const min = Number(parts[0]) || 0;
    const max = Number(parts[1]) || Number.MAX_SAFE_INTEGER;
    return Number(product.price) >= min && Number(product.price) <= max;
  }

  function filteredProducts() {
    const query = state.q.trim().toLowerCase();
    let products = window.DelaBoss.getProducts().filter(function (product) {
      if (query) {
        const haystack = [product.name, product.category, product.subcategory, product.description].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (state.categories.size && !state.categories.has(product.category)) return false;
      if (state.sizes.size) {
        const sizes = product.sizes || [];
        if (!Array.from(state.sizes).some(function (size) { return sizes.includes(size); })) return false;
      }
      if (state.colors.size) {
        const colors = (product.colors || []).map(function (color) { return color.name; });
        if (!Array.from(state.colors).some(function (color) { return colors.includes(color); })) return false;
      }
      if (!matchesPrice(product)) return false;
      if (state.edits.has('new') && !product.newArrival) return false;
      if (state.edits.has('sale') && !(Number(product.compareAt) > Number(product.price))) return false;
      return true;
    });

    if (state.sort === 'newest') {
      products.sort(function (a, b) { return new Date(b.dateAdded) - new Date(a.dateAdded); });
    } else if (state.sort === 'price-asc') {
      products.sort(function (a, b) { return Number(a.price) - Number(b.price); });
    } else if (state.sort === 'price-desc') {
      products.sort(function (a, b) { return Number(b.price) - Number(a.price); });
    } else if (state.sort === 'name-asc') {
      products.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else {
      products.sort(function (a, b) {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      });
    }
    return products;
  }

  function filtersAreActive() {
    return Boolean(state.q || state.categories.size || state.sizes.size || state.colors.size || state.price || state.edits.size);
  }

  function filterCount() {
    return state.categories.size + state.sizes.size + state.colors.size + (state.price ? 1 : 0) + state.edits.size;
  }

  function updateFilterBadge() {
    const badge = qs('[data-filter-count]');
    const count = filterCount();
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }
    const applyCount = qs('[data-filter-result-count]');
    if (applyCount) applyCount.textContent = '(' + filteredProducts().length + ')';
  }

  function renderActiveFilters() {
    const container = qs('#activeFilters');
    if (!container) return;
    const pills = [];
    if (state.q) pills.push({ type: 'q', value: '', label: 'Search: “' + state.q + '”' });
    Array.from(state.categories).sort().forEach(function (category) {
      pills.push({ type: 'category', value: category, label: category });
    });
    Array.from(state.sizes).forEach(function (size) {
      pills.push({ type: 'size', value: size, label: 'Size ' + size });
    });
    Array.from(state.colors).forEach(function (color) {
      pills.push({ type: 'color', value: color, label: color });
    });
    if (state.price) pills.push({ type: 'price', value: state.price, label: PRICE_LABELS[state.price] });
    if (state.edits.has('new')) pills.push({ type: 'edit', value: 'new', label: 'New arrivals' });
    if (state.edits.has('sale')) pills.push({ type: 'edit', value: 'sale', label: 'Sample sale' });
    if (!pills.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = '<span class="active-filters__label">Active</span>' + pills.map(function (pill) {
      return '<button class="filter-pill" type="button" data-remove-type="' + pill.type + '" data-remove-value="' + window.DelaBoss.escapeAttr(pill.value) + '" aria-label="Remove filter ' + window.DelaBoss.escapeAttr(pill.label) + '">' +
        window.DelaBoss.escapeHtml(pill.label) + window.DelaBoss.icon('close') + '</button>';
    }).join('') + '<button class="filters__clear" type="button" data-clear-all>Clear all</button>';
  }

  function render(options) {
    const opts = options || {};
    const products = filteredProducts();
    const grid = qs('#productResults');
    const empty = qs('#shopEmpty');
    const count = qs('#resultCount');
    const loadNote = qs('#loadNote');
    const loadBtn = qs('#loadMoreBtn');
    if (!grid) return;
    if (opts.resetVisible) state.visible = PAGE_SIZE;
    const shown = products.slice(0, state.visible);
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = shown.map(function (product) {
      return window.DelaBoss.productCardHtml(product);
    }).join('');
    if (empty) empty.hidden = products.length !== 0;
    if (count) count.textContent = products.length + (products.length === 1 ? ' piece' : ' pieces');
    if (loadNote) {
      loadNote.textContent = products.length
        ? 'Showing ' + shown.length + ' of ' + products.length + ' sample ' + (products.length === 1 ? 'piece' : 'pieces')
        : '';
    }
    if (loadBtn) loadBtn.hidden = shown.length >= products.length;
    renderActiveFilters();
    updateFilterBadge();
    if (opts.sync) syncURL();
  }

  function resetAll() {
    state.q = '';
    state.categories.clear();
    state.sizes.clear();
    state.colors.clear();
    state.edits.clear();
    state.price = '';
    state.sort = 'featured';
    state.visible = PAGE_SIZE;
    syncForm();
    render({ resetVisible: true, sync: true });
  }

  function removeFilter(type, value) {
    if (type === 'q') {
      state.q = '';
    } else if (type === 'category') {
      state.categories.delete(value);
    } else if (type === 'size') {
      state.sizes.delete(value);
    } else if (type === 'color') {
      state.colors.delete(value);
    } else if (type === 'price') {
      state.price = '';
    } else if (type === 'edit') {
      state.edits.delete(value);
    }
    syncForm();
    render({ resetVisible: true, sync: true });
  }

  function openFilters() {
    const panel = qs('#filtersPanel');
    const button = qs('[data-open-filters]');
    if (!panel) return;
    lastFocused = document.activeElement;
    document.body.classList.add('filters-open');
    if (button) button.setAttribute('aria-expanded', 'true');
    const closeButton = qs('[data-close-filters]', panel);
    window.setTimeout(function () {
      if (closeButton) closeButton.focus();
    }, 40);
    document.addEventListener('keydown', onFilterKeydown);
  }

  function closeFilters(restoreFocus) {
    document.body.classList.remove('filters-open');
    const button = qs('[data-open-filters]');
    if (button) button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onFilterKeydown);
    if (restoreFocus !== false && lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function onFilterKeydown(event) {
    if (event.key === 'Escape') {
      closeFilters();
      return;
    }
    if (event.key !== 'Tab') return;
    const panel = qs('#filtersPanel');
    if (!panel) return;
    const focusable = qsa('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', panel)
      .filter(function (node) { return node.offsetParent !== null; });
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.DelaBoss) return;
    readURLState();
    renderFilterOptions();
    syncForm();
    render({ resetVisible: true });

    const form = qs('#filterForm');
    if (form) {
      form.addEventListener('change', function () {
        state.categories = new Set(qsa('input[name="category"]:checked', form).map(function (input) { return input.value; }));
        state.sizes = new Set(qsa('input[name="size"]:checked', form).map(function (input) { return input.value; }));
        state.colors = new Set(qsa('input[name="color"]:checked', form).map(function (input) { return input.value; }));
        state.edits = new Set(qsa('input[name="edit"]:checked', form).map(function (input) { return input.value; }));
        const price = qs('input[name="priceRange"]:checked', form);
        state.price = price ? price.value : '';
        state.visible = PAGE_SIZE;
        render({ resetVisible: true, sync: true });
      });
    }

    const search = qs('#shopSearch');
    if (search) {
      search.addEventListener('input', function () {
        window.clearTimeout(searchTimer);
        qs('[data-shop-search]').classList.toggle('has-value', Boolean(search.value));
        searchTimer = window.setTimeout(function () {
          state.q = search.value.trim();
          render({ resetVisible: true, sync: true });
        }, 160);
      });
      search.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && search.value) {
          search.value = '';
          state.q = '';
          qs('[data-shop-search]').classList.remove('has-value');
          render({ resetVisible: true, sync: true });
        }
      });
    }

    const clearSearch = qs('[data-clear-search]');
    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        if (search) search.value = '';
        state.q = '';
        qs('[data-shop-search]').classList.remove('has-value');
        render({ resetVisible: true, sync: true });
        if (search) search.focus();
      });
    }

    const sort = qs('#sortSelect');
    if (sort) {
      sort.addEventListener('change', function () {
        state.sort = sort.value;
        state.visible = PAGE_SIZE;
        render({ resetVisible: true, sync: true });
      });
    }

    qsa('[data-clear-all]').forEach(function (button) {
      button.addEventListener('click', resetAll);
    });

    qsa('[data-open-filters]').forEach(function (button) {
      button.addEventListener('click', openFilters);
    });

    qsa('[data-close-filters]').forEach(function (button) {
      button.addEventListener('click', function () { closeFilters(); });
    });

    qsa('[data-apply-filters]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 1020px)').matches) closeFilters();
      });
    });

    const active = qs('#activeFilters');
    if (active) {
      active.addEventListener('click', function (event) {
        if (event.target.closest('[data-clear-all]')) {
          resetAll();
          return;
        }
        const remove = event.target.closest('[data-remove-type]');
        if (remove) {
          removeFilter(remove.getAttribute('data-remove-type'), remove.getAttribute('data-remove-value'));
        }
      });
    }

    const loadMore = qs('#loadMoreBtn');
    if (loadMore) {
      loadMore.addEventListener('click', function () {
        state.visible += PAGE_SIZE;
        render();
      });
    }

    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 1020px)').matches && document.body.classList.contains('filters-open')) {
        closeFilters(false);
      }
    });

    document.addEventListener('dlb:products-changed', function () {
      render();
    });
  });
})();
