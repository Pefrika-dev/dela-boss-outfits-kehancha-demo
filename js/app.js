/*
 * DE LA BOSS OUTFITS — shared storefront and demonstration data layer
 * Vanilla JavaScript, LocalStorage, no backend.
 */
(function () {
  'use strict';

  const STORAGE_PREFIX = 'delaboss.demo.v1.';
  const KEYS = {
    products: STORAGE_PREFIX + 'products',
    settings: STORAGE_PREFIX + 'settings',
    orders: STORAGE_PREFIX + 'orders',
    cart: STORAGE_PREFIX + 'cart',
    activity: STORAGE_PREFIX + 'activity',
    subscribers: STORAGE_PREFIX + 'subscribers',
    enquiries: STORAGE_PREFIX + 'enquiries'
  };

  const DEFAULT_SETTINGS = {
    storeName: 'DE LA BOSS OUTFITS',
    location: 'Kehancha, Migori County, Kenya',
    phonePrimary: '+254 758 102 552',
    phoneSecondary: '+254 707 421 337',
    whatsapp: '+254758102552',
    currency: 'KES',
    lowStockThreshold: 3,
    deliveryFee: 0,
    announcement: 'YOUR STYLE. YOUR STATEMENT.',
    showAnnouncement: true
  };

  const ORDER_STATUSES = [
    'Pending',
    'Confirmed',
    'Processing',
    'Ready for Collection',
    'Completed',
    'Cancelled'
  ];

  const STOCK_HOLDING_STATUSES = ['Confirmed', 'Processing', 'Ready for Collection', 'Completed'];

  const PALETTE = {
    black: '#161616',
    ivory: '#EEE7DB',
    white: '#F1EEE7',
    bone: '#E0D7C8',
    oyster: '#D7CEC1',
    tan: '#B77A49',
    cognac: '#8C5434',
    brown: '#6C452C',
    indigo: '#31465D',
    'ocean blue': '#34596B',
    'mid blue': '#4C6B8A',
    'earth print': '#8B6345',
    brick: '#A84432',
    rose: '#C47A83',
    plum: '#6B4B5A',
    rust: '#A5573B',
    green: '#24523A',
    'white / blue': '#DCE4ED',
    'green / black': '#24523A',
    'black / gold': '#9C7B45',
    natural: '#C9B28D',
    grey: '#8D8A84',
    charcoal: '#2B2B2B'
  };

  const memoryStore = {};

  function rawGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
    }
  }

  function rawSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      memoryStore[key] = value;
      console.warn('LocalStorage could not persist data. Using in-memory fallback for this page.', error);
      return false;
    }
  }

  function rawRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* Ignore storage access errors. */
    }
    delete memoryStore[key];
  }

  function read(key, fallback) {
    const raw = rawGet(key);
    if (raw === null) return clone(fallback);
    try {
      return JSON.parse(raw);
    } catch (error) {
      return clone(fallback);
    }
  }

  function write(key, value) {
    return rawSet(key, JSON.stringify(value));
  }

  function keyExists(key) {
    return rawGet(key) !== null;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function safeImageUrl(url) {
    const value = String(url || '').trim();
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value)) return value;
    if (/^assets\/[a-z0-9/_\-.]+$/i.test(value)) return value;
    if (/^https?:\/\/[^\s"'<>]+$/i.test(value)) return value;
    return 'assets/images/placeholder.svg';
  }

  function formatKsh(amount) {
    const numeric = Number(amount);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    return 'KSh ' + new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0
    }).format(Math.round(safe));
  }

  function formatNumber(value) {
    const numeric = Number(value);
    return new Intl.NumberFormat('en-KE').format(Number.isFinite(numeric) ? numeric : 0);
  }

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function formatDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function relativeTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const abs = Math.abs(diffSeconds);
    if (abs < 45) return 'Just now';
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (abs < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute');
    if (abs < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour');
    if (abs < 604800) return formatter.format(Math.round(diffSeconds / 86400), 'day');
    return formatDate(value);
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function colorHex(name) {
    const key = String(name || '').trim().toLowerCase();
    if (PALETTE[key]) return PALETTE[key];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return 'hsl(' + hue + ' 22% 45%)';
  }

  function normalizeWhatsAppNumber(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '254' + digits.slice(1);
    if (!digits.startsWith('254') && digits.length === 9) digits = '254' + digits;
    return digits;
  }

  function whatsappUrl(message, phone) {
    const number = normalizeWhatsAppNumber(phone || getSettings().whatsapp);
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message || '');
  }

  function validateKenyanPhone(value) {
    const cleaned = String(value || '').replace(/[\s().-]/g, '');
    return /^(?:\+?254|0)?[17]\d{8}$/.test(cleaned);
  }

  function validateEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  function getSettings() {
    const stored = read(KEYS.settings, {});
    return Object.assign({}, DEFAULT_SETTINGS, stored && typeof stored === 'object' ? stored : {});
  }

  function saveSettings(settings) {
    const merged = Object.assign({}, DEFAULT_SETTINGS, getSettings(), settings || {});
    const saved = write(KEYS.settings, merged);
    document.dispatchEvent(new CustomEvent('dlb:settings-changed', { detail: merged }));
    return saved;
  }

  function getProducts() {
    const products = read(KEYS.products, []);
    return Array.isArray(products) ? products : [];
  }

  function saveProducts(products) {
    const saved = write(KEYS.products, products);
    document.dispatchEvent(new CustomEvent('dlb:products-changed'));
    return saved;
  }

  function getProduct(id) {
    return getProducts().find(function (product) {
      return product.id === id;
    }) || null;
  }

  function getCategories() {
    if (Array.isArray(window.DELA_CATEGORIES) && window.DELA_CATEGORIES.length) {
      return window.DELA_CATEGORIES;
    }
    return ['Men', 'Women', 'Shoes', 'Accessories', 'Essentials'].map(function (name) {
      return { id: slugify(name), name: name, title: name, description: '', image: 'assets/images/placeholder.svg', alt: name };
    });
  }

  function stockState(product) {
    const settings = getSettings();
    const threshold = Math.max(0, Number(settings.lowStockThreshold) || 0);
    const stock = Math.max(0, Number(product && product.stock) || 0);
    if (stock <= 0) return { key: 'out', label: 'Out of stock', detail: 'This sample piece is currently out of stock.' };
    if (stock <= threshold) return { key: 'low', label: 'Low stock', detail: stock + ' sample unit' + (stock === 1 ? '' : 's') + ' available.' };
    return { key: 'in', label: 'In stock', detail: stock + ' sample units available.' };
  }

  function badgeHtml(product) {
    let html = '';
    if (product.newArrival) html += '<span class="badge badge--new">New</span>';
    if (Number(product.compareAt) > Number(product.price)) html += '<span class="badge badge--sale">Sale</span>';
    if (Number(product.stock) <= 0) html += '<span class="badge badge--out">Sold out</span>';
    return html ? '<div class="product-card__badges">' + html + '</div>' : '';
  }

  function priceHtml(product, large) {
    const price = formatKsh(product.price);
    if (Number(product.compareAt) > Number(product.price)) {
      return '<span class="price' + (large ? ' price--large' : '') + '">' + price + '</span>' +
        '<span class="price-old">' + formatKsh(product.compareAt) + '</span>';
    }
    return '<span class="price' + (large ? ' price--large' : '') + '">' + price + '</span>';
  }

  function sizesSummary(product) {
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    if (!sizes.length) return 'One size';
    if (sizes.length <= 6) return sizes.join(' · ');
    return sizes.slice(0, 5).join(' · ') + ' +' + (sizes.length - 5);
  }

  function colorsSummary(product) {
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (!colors.length) return '';
    return '<div class="product-card__colors" role="group" aria-label="' + escapeAttr(colors.length + ' colour option' + (colors.length === 1 ? '' : 's')) + '">' +
      '<span class="swatch-row">' + colors.slice(0, 3).map(function (color) {
        return '<span class="swatch swatch--small" style="--swatch:' + escapeAttr(colorHex(color.name)) + '"></span>';
      }).join('') + '</span>' +
      '<span class="product-card__colour-label">' + colors.length + ' colour' + (colors.length === 1 ? '' : 's') + '</span></div>';
  }

  function productCardHtml(product, options) {
    const opts = options || {};
    const image = safeImageUrl((product.images && product.images[0]) || '');
    const soldOut = Number(product.stock) <= 0;
    return '<article class="product-card' + (soldOut ? ' is-sold-out' : '') + '" data-product-id="' + escapeAttr(product.id) + '">' +
      '<div class="product-card__media">' +
        '<a href="product.html?id=' + encodeURIComponent(product.id) + '" class="product-card__image-link" aria-label="View ' + escapeAttr(product.name) + '">' +
          '<img src="' + escapeAttr(image) + '" alt="' + escapeAttr(product.name + ' — sample product photograph') + '" width="900" height="1125" loading="' + (opts.eager ? 'eager' : 'lazy') + '">' +
        '</a>' +
        badgeHtml(product) +
        '<div class="product-card__actions">' +
          '<button class="product-card__action" type="button" data-quick-view="' + escapeAttr(product.id) + '"' + (soldOut ? ' disabled' : '') + '>Quick add</button>' +
          '<a class="product-card__icon-action" href="product.html?id=' + encodeURIComponent(product.id) + '" aria-label="View details for ' + escapeAttr(product.name) + '">' +
            icon('arrow-up-right') +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="product-card__info">' +
        '<div class="product-card__meta"><span>' + escapeHtml(product.category || 'Collection') + '</span><span>' + escapeHtml(product.subcategory || '') + '</span></div>' +
        '<h3 class="product-card__title"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' + escapeHtml(product.name) + '</a></h3>' +
        '<div class="product-card__price">' + priceHtml(product) + '</div>' +
        '<div class="product-card__details"><span class="product-card__sizes">Sizes: ' + escapeHtml(sizesSummary(product)) + '</span>' + colorsSummary(product) + '</div>' +
      '</div>' +
    '</article>';
  }

  function icon(name, className) {
    const icons = {
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path>',
      bag: '<path d="M6 8h12l1 12H5L6 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
      close: '<path d="m6 6 12 12M18 6 6 18"></path>',
      'arrow-right': '<path d="M4 12h15"></path><path d="m13 6 6 6-6 6"></path>',
      'arrow-up-right': '<path d="M7 17 17 7"></path><path d="M8 7h9v9"></path>',
      'chevron-down': '<path d="m5 9 7 7 7-7"></path>',
      minus: '<path d="M5 12h14"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>',
      whatsapp: '<path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z"></path><path d="M8.6 8.2c.2-.4.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.3 0 .6.5.8 1.3 1.6 2.2 2.1.3.2.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.8c.2.1.4.3.4.5 0 .5-.2 1.4-.7 1.8-.5.4-1.2.7-1.9.6-1.2-.1-2.9-.8-4.2-2.1-1.2-1.2-1.9-2.8-2.1-4-.1-.9.1-1.5.5-1.9Z"></path>',
      check: '<path d="m5 12 4.5 4.5L19 7"></path>',
      edit: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"></path>',
      trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path>',
      eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle>',
      refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"></path><path d="M20 4v6h-6"></path>',
      download: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M4 20h16"></path>',
      users: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path>',
      grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>',
      shirt: '<path d="m8 3 4 3 4-3 4 3-2 4-2-1v11H8V9l-2 1-2-4 4-3Z"></path>',
      box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"></path><path d="M4 7v10l8 4 8-4V7"></path><path d="M12 11v10"></path>',
      receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z"></path><path d="M9 8h6M9 12h6M9 16h3"></path>',
      settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"></path>',
      sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path>',
      truck: '<path d="M3 6h11v10H3z"></path><path d="M14 10h4l3 3v3h-7z"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle>',
      shield: '<path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-3Z"></path><path d="m9 12 2 2 4-4"></path>',
      pin: '<path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
      phone: '<path d="M6.6 3h3l1.5 5-2 1.5a14 14 0 0 0 5.4 5.4l1.5-2 5 1.5v3a2 2 0 0 1-2.2 2A18 18 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"></path>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="1"></rect><path d="m3 7 9 6 9-6"></path>',
      info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 8h.01"></path>'
    };
    const body = icons[name] || icons.info;
    return '<svg class="icon ' + escapeAttr(className || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function getCart() {
    const cart = read(KEYS.cart, []);
    return Array.isArray(cart) ? cart : [];
  }

  function saveCart(cart) {
    write(KEYS.cart, cart);
    document.dispatchEvent(new CustomEvent('dlb:cart-changed'));
    updateCartBadge();
  }

  function cartLineKey(productId, size, color) {
    return [productId || '', size || '', color || ''].join('|');
  }

  function cartQty() {
    return getCart().reduce(function (total, line) {
      return total + Math.max(0, Number(line.qty) || 0);
    }, 0);
  }

  function cartDetails() {
    return getCart().map(function (line) {
      const product = getProduct(line.productId);
      const qty = Math.max(1, Number(line.qty) || 1);
      if (!product) {
        return Object.assign({}, line, {
          product: null,
          qty: qty,
          lineTotal: 0,
          maxStock: 0,
          unavailable: true
        });
      }
      return Object.assign({}, line, {
        product: product,
        qty: qty,
        lineTotal: (Number(product.price) || 0) * qty,
        maxStock: Math.max(0, Number(product.stock) || 0),
        unavailable: Number(product.stock) <= 0
      });
    });
  }

  function cartSubtotal() {
    return cartDetails().reduce(function (total, line) {
      return total + (line.unavailable ? 0 : line.lineTotal);
    }, 0);
  }

  function cartStockForProduct(productId) {
    return getCart().reduce(function (total, line) {
      return line.productId === productId ? total + (Number(line.qty) || 0) : total;
    }, 0);
  }

  function addToCart(productId, options) {
    const product = getProduct(productId);
    if (!product) throw new Error('This sample product is no longer available.');
    const opts = options || {};
    const size = String(opts.size || '').trim();
    const color = String(opts.color || '').trim();
    let qty = Math.max(1, parseInt(opts.qty, 10) || 1);
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (sizes.length && !size) throw new Error('Please select a size before adding this piece to your bag.');
    if (colors.length && !color) throw new Error('Please select a colour before adding this piece to your bag.');
    if (Number(product.stock) <= 0) throw new Error('This sample piece is currently out of stock.');
    const alreadyInCart = cartStockForProduct(productId);
    const available = Math.max(0, Number(product.stock) - alreadyInCart);
    if (available <= 0) throw new Error('Your bag already contains the available sample stock for this piece.');
    const limited = qty > available;
    if (limited) qty = available;
    const cart = getCart();
    const key = cartLineKey(productId, size, color);
    const existing = cart.find(function (line) { return line.key === key; });
    if (existing) {
      existing.qty = Math.max(1, Number(existing.qty) || 1) + qty;
    } else {
      cart.push({ key: key, productId: productId, size: size, color: color, qty: qty });
    }
    saveCart(cart);
    return { limited: limited, qty: qty, addedToExisting: Boolean(existing), product: product };
  }

  function updateCartQty(key, qty) {
    const cart = getCart();
    const line = cart.find(function (item) { return item.key === key; });
    if (!line) return null;
    const product = getProduct(line.productId);
    if (!product) throw new Error('This sample product is no longer available.');
    const next = Math.max(1, parseInt(qty, 10) || 1);
    const otherQty = cart.reduce(function (total, other) {
      return other.key !== key && other.productId === line.productId ? total + (Number(other.qty) || 0) : total;
    }, 0);
    const max = Math.max(0, (Number(product.stock) || 0) - otherQty);
    if (next > max) throw new Error('Only ' + max + ' sample unit' + (max === 1 ? '' : 's') + ' can be added for this piece.');
    line.qty = next;
    saveCart(cart);
    return line;
  }

  function removeCartItem(key) {
    const next = getCart().filter(function (line) { return line.key !== key; });
    saveCart(next);
  }

  function clearCart() {
    saveCart([]);
  }

  function getOrders() {
    const orders = read(KEYS.orders, []);
    return Array.isArray(orders) ? orders : [];
  }

  function saveOrders(orders) {
    const saved = write(KEYS.orders, orders);
    document.dispatchEvent(new CustomEvent('dlb:orders-changed'));
    return saved;
  }

  function findOrder(reference) {
    return getOrders().find(function (order) {
      return order.reference === reference;
    }) || null;
  }

  function generateOrderReference() {
    const date = new Date();
    const stamp = String(date.getFullYear()).slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    let reference;
    do {
      reference = 'DB-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    } while (findOrder(reference));
    return reference;
  }

  function generateProductId() {
    const products = getProducts();
    let id;
    do {
      id = 'db-' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 4);
    } while (products.some(function (product) { return product.id === id; }));
    return id;
  }

  function createOrder(payload) {
    const data = payload || {};
    const details = cartDetails();
    if (!details.length) throw new Error('Your bag is empty. Add a sample piece before checking out.');
    const invalid = details.find(function (line) {
      return !line.product || line.unavailable || line.qty > line.maxStock;
    });
    if (invalid) throw new Error('One or more pieces in your bag are no longer available in the requested quantity. Please review your bag.');
    const totalsByProduct = details.reduce(function (map, line) {
      map[line.product.id] = (map[line.product.id] || 0) + line.qty;
      return map;
    }, {});
    const overstocked = details.find(function (line) {
      return totalsByProduct[line.product.id] > line.maxStock;
    });
    if (overstocked) throw new Error('The requested quantity for ' + overstocked.product.name + ' exceeds the available sample stock. Please review your bag.');
    const subtotal = details.reduce(function (total, line) { return total + line.lineTotal; }, 0);
    const settings = getSettings();
    const deliveryFee = data.fulfilment === 'delivery' ? Math.max(0, Number(settings.deliveryFee) || 0) : 0;
    const reference = generateOrderReference();
    const now = new Date().toISOString();
    const order = {
      reference: reference,
      status: 'Pending',
      customer: {
        name: String(data.name || '').trim(),
        phone: String(data.phone || '').trim(),
        email: String(data.email || '').trim()
      },
      fulfilment: data.fulfilment === 'delivery' ? 'delivery' : 'collection',
      county: String(data.county || '').trim(),
      town: String(data.town || '').trim(),
      address: String(data.address || '').trim(),
      notes: String(data.notes || '').trim(),
      items: details.map(function (line) {
        return {
          productId: line.product.id,
          name: line.product.name,
          image: (line.product.images && line.product.images[0]) || '',
          size: line.size,
          color: line.color,
          qty: line.qty,
          unitPrice: Number(line.product.price) || 0,
          lineTotal: line.lineTotal
        };
      }),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee,
      createdAt: now,
      updatedAt: now,
      inventoryDeducted: false,
      sample: false,
      source: 'demo-checkout',
      statusHistory: [
        { status: 'Pending', at: now, actor: 'Website demonstration', note: 'Demonstration order saved locally. No message sent to the store.' }
      ]
    };
    const orders = getOrders();
    orders.unshift(order);
    if (!saveOrders(orders)) throw new Error('The demonstration order could not be saved in this browser.');
    addActivity('order', 'Demo order ' + reference + ' was created for ' + order.customer.name + '.');
    clearCart();
    return order;
  }

  function restockItems(items) {
    const products = getProducts();
    items.forEach(function (item) {
      const product = products.find(function (candidate) { return candidate.id === item.productId; });
      if (!product) return;
      product.stock = Math.max(0, Number(product.stock) || 0) + (Number(item.qty) || 0);
    });
    saveProducts(products);
  }

  function deductItems(items) {
    const products = getProducts();
    const shortages = [];
    items.forEach(function (item) {
      const product = products.find(function (candidate) { return candidate.id === item.productId; });
      if (!product) {
        shortages.push(item.name + ' is no longer in the catalogue.');
        return;
      }
      if ((Number(product.stock) || 0) < (Number(item.qty) || 0)) {
        shortages.push(product.name + ' has only ' + (Number(product.stock) || 0) + ' sample unit(s) available.');
      }
    });
    if (shortages.length) {
      return { ok: false, message: 'Inventory could not be updated. ' + shortages.join(' ') };
    }
    items.forEach(function (item) {
      const product = products.find(function (candidate) { return candidate.id === item.productId; });
      product.stock = Math.max(0, (Number(product.stock) || 0) - (Number(item.qty) || 0));
    });
    saveProducts(products);
    return { ok: true, message: '' };
  }

  function updateOrderStatus(reference, nextStatus, note) {
    if (!ORDER_STATUSES.includes(nextStatus)) {
      return { ok: false, message: 'Unknown demonstration order status.' };
    }
    const orders = getOrders();
    const order = orders.find(function (candidate) { return candidate.reference === reference; });
    if (!order) return { ok: false, message: 'Order not found.' };
    if (order.status === nextStatus) return { ok: true, message: 'Status unchanged.' };
    const shouldHold = STOCK_HOLDING_STATUSES.includes(nextStatus);
    let inventoryMessage = '';
    if (shouldHold && !order.inventoryDeducted) {
      const deduction = deductItems(order.items);
      if (!deduction.ok) return deduction;
      order.inventoryDeducted = true;
      inventoryMessage = ' Sample inventory was deducted on confirmation.';
    } else if (!shouldHold && order.inventoryDeducted) {
      restockItems(order.items);
      order.inventoryDeducted = false;
      inventoryMessage = ' Sample inventory was returned to stock.';
    }
    const previous = order.status;
    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({
      status: nextStatus,
      at: order.updatedAt,
      actor: 'Demo admin',
      note: String(note || 'Status changed from ' + previous + ' to ' + nextStatus + ' in the demonstration admin.')
    });
    saveOrders(orders);
    addActivity('status', 'Order ' + reference + ' moved from ' + previous + ' to ' + nextStatus + '.');
    return { ok: true, message: 'Order status updated.' + inventoryMessage };
  }

  function deleteOrder(reference) {
    const orders = getOrders();
    const order = orders.find(function (candidate) { return candidate.reference === reference; });
    if (!order) return { ok: false, message: 'Order not found.' };
    if (order.inventoryDeducted) restockItems(order.items);
    saveOrders(orders.filter(function (candidate) { return candidate.reference !== reference; }));
    addActivity('order', 'Demo order ' + reference + ' was deleted' + (order.inventoryDeducted ? ' and its sample inventory was restored.' : '.'));
    return { ok: true, message: 'Demo order deleted.' + (order.inventoryDeducted ? ' Sample inventory was restored.' : '') };
  }

  function orderMetrics() {
    const orders = getOrders();
    const products = getProducts();
    const settings = getSettings();
    const threshold = Math.max(0, Number(settings.lowStockThreshold) || 0);
    const nonCancelled = orders.filter(function (order) { return order.status !== 'Cancelled'; });
    return {
      totalOrders: orders.length,
      pending: orders.filter(function (order) { return order.status === 'Pending'; }).length,
      confirmed: orders.filter(function (order) { return order.status === 'Confirmed'; }).length,
      processing: orders.filter(function (order) { return order.status === 'Processing'; }).length,
      ready: orders.filter(function (order) { return order.status === 'Ready for Collection'; }).length,
      completed: orders.filter(function (order) { return order.status === 'Completed'; }).length,
      cancelled: orders.filter(function (order) { return order.status === 'Cancelled'; }).length,
      totalValue: nonCancelled.reduce(function (total, order) { return total + (Number(order.total) || 0); }, 0),
      products: products.length,
      lowStock: products.filter(function (product) { return (Number(product.stock) || 0) <= threshold; }).length,
      outOfStock: products.filter(function (product) { return (Number(product.stock) || 0) <= 0; }).length
    };
  }

  function customersFromOrders() {
    const map = new Map();
    getOrders().forEach(function (order) {
      const phoneKey = String(order.customer && order.customer.phone || '').replace(/\D/g, '') || order.reference;
      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          name: order.customer && order.customer.name || 'Unknown customer',
          phone: order.customer && order.customer.phone || '—',
          email: order.customer && order.customer.email || '',
          orderCount: 0,
          totalSpend: 0,
          lastOrder: order.createdAt,
          sample: Boolean(order.sample)
        });
      }
      const customer = map.get(phoneKey);
      customer.orderCount += 1;
      if (order.status !== 'Cancelled') customer.totalSpend += Number(order.total) || 0;
      if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
        customer.lastOrder = order.createdAt;
        customer.name = order.customer && order.customer.name || customer.name;
        customer.email = order.customer && order.customer.email || customer.email;
      }
      customer.sample = customer.sample && Boolean(order.sample);
    });
    return Array.from(map.values()).sort(function (a, b) {
      return new Date(b.lastOrder) - new Date(a.lastOrder);
    });
  }

  function getActivity() {
    const activity = read(KEYS.activity, []);
    return Array.isArray(activity) ? activity : [];
  }

  function addActivity(type, message) {
    const activity = getActivity();
    activity.unshift({
      id: 'act-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      type: type || 'general',
      message: String(message || ''),
      at: new Date().toISOString()
    });
    write(KEYS.activity, activity.slice(0, 60));
    document.dispatchEvent(new CustomEvent('dlb:activity-changed'));
  }

  function getSubscribers() {
    const subscribers = read(KEYS.subscribers, []);
    return Array.isArray(subscribers) ? subscribers : [];
  }

  function subscribe(email) {
    const value = String(email || '').trim().toLowerCase();
    if (!validateEmail(value)) return { ok: false, message: 'Enter a valid email address to join the demo list.' };
    const subscribers = getSubscribers();
    if (subscribers.some(function (entry) { return entry.email === value; })) {
      return { ok: false, message: 'This email is already on the demonstration list.' };
    }
    subscribers.push({ email: value, createdAt: new Date().toISOString() });
    write(KEYS.subscribers, subscribers);
    return { ok: true, message: 'You are on the demonstration list. No real emails will be sent.' };
  }

  function saveEnquiry(enquiry) {
    const enquiries = read(KEYS.enquiries, []);
    const list = Array.isArray(enquiries) ? enquiries : [];
    list.unshift(Object.assign({
      id: 'enq-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    }, enquiry || {}));
    write(KEYS.enquiries, list.slice(0, 40));
  }

  function sampleDate(daysAgo, time) {
    const date = new Date();
    date.setDate(date.getDate() - (Number(daysAgo) || 0));
    const parts = String(time || '10:00').split(':');
    date.setHours(Number(parts[0]) || 10, Number(parts[1]) || 0, 0, 0);
    return date.toISOString();
  }

  function buildSampleOrders() {
    if (!Array.isArray(window.DELA_SAMPLE_ORDERS)) return;
    const products = getProducts();
    const orders = [];
    window.DELA_SAMPLE_ORDERS.forEach(function (definition) {
      const createdAt = sampleDate(definition.createdDaysAgo, definition.createdTime);
      const items = definition.items.map(function (item) {
        const product = products.find(function (candidate) { return candidate.id === item.productId; });
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          image: (product.images && product.images[0]) || '',
          size: item.size,
          color: item.color,
          qty: item.qty,
          unitPrice: Number(product.price) || 0,
          lineTotal: (Number(product.price) || 0) * (Number(item.qty) || 0)
        };
      }).filter(Boolean);
      if (!items.length) return;
      const subtotal = items.reduce(function (total, item) { return total + item.lineTotal; }, 0);
      const history = [{
        status: 'Pending',
        at: createdAt,
        actor: 'Demo data',
        note: 'Preloaded demonstration order. No real customer or transaction is represented.'
      }];
      if (definition.status !== 'Pending') {
        const confirmedAt = new Date(new Date(createdAt).getTime() + 45 * 60 * 1000).toISOString();
        history.push({
          status: definition.status === 'Cancelled' ? 'Cancelled' : 'Confirmed',
          at: confirmedAt,
          actor: 'Demo data',
          note: 'Sample workflow state for dashboard demonstration.'
        });
        if (definition.status === 'Completed') {
          history.push({
            status: 'Processing',
            at: new Date(new Date(createdAt).getTime() + 3 * 60 * 60 * 1000).toISOString(),
            actor: 'Demo data',
            note: 'Sample workflow state for dashboard demonstration.'
          });
          history.push({
            status: 'Completed',
            at: new Date(new Date(createdAt).getTime() + 26 * 60 * 60 * 1000).toISOString(),
            actor: 'Demo data',
            note: 'Sample workflow state for dashboard demonstration.'
          });
        }
      }
      if (definition.inventoryDeducted) {
        items.forEach(function (item) {
          const product = products.find(function (candidate) { return candidate.id === item.productId; });
          if (product) product.stock = Math.max(0, (Number(product.stock) || 0) - (Number(item.qty) || 0));
        });
      }
      orders.push({
        reference: definition.reference,
        status: definition.status,
        customer: definition.customer,
        fulfilment: definition.fulfilment,
        county: definition.county,
        town: definition.town,
        address: definition.address,
        notes: definition.notes,
        items: items,
        subtotal: subtotal,
        deliveryFee: 0,
        total: subtotal,
        createdAt: createdAt,
        updatedAt: history[history.length - 1].at,
        inventoryDeducted: Boolean(definition.inventoryDeducted),
        sample: true,
        source: 'preloaded-demo',
        statusHistory: history
      });
    });
    saveProducts(products);
    saveOrders(orders);
  }

  function ensureSeedData() {
    if (!keyExists(KEYS.settings)) {
      write(KEYS.settings, DEFAULT_SETTINGS);
    }
    if (!keyExists(KEYS.products)) {
      write(KEYS.products, window.DELA_DEFAULT_PRODUCTS || []);
    }
    if (!keyExists(KEYS.cart)) write(KEYS.cart, []);
    if (!keyExists(KEYS.subscribers)) write(KEYS.subscribers, []);
    if (!keyExists(KEYS.enquiries)) write(KEYS.enquiries, []);
    if (!keyExists(KEYS.orders)) {
      buildSampleOrders();
    }
    if (!keyExists(KEYS.activity)) {
      write(KEYS.activity, [
        {
          id: 'act-seed-2',
          type: 'catalogue',
          message: 'Sample catalogue loaded with ' + getProducts().length + ' demonstration products.',
          at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: 'act-seed-1',
          type: 'order',
          message: 'Three sample orders were preloaded to demonstrate the admin workflow.',
          at: new Date(Date.now() - 9 * 60 * 1000).toISOString()
        }
      ]);
    }
  }

  function resetDemoData() {
    Object.keys(KEYS).forEach(function (key) {
      rawRemove(KEYS[key]);
    });
    ensureSeedData();
    document.dispatchEvent(new CustomEvent('dlb:demo-reset'));
    document.dispatchEvent(new CustomEvent('dlb:cart-changed'));
    document.dispatchEvent(new CustomEvent('dlb:products-changed'));
    document.dispatchEvent(new CustomEvent('dlb:orders-changed'));
    document.dispatchEvent(new CustomEvent('dlb:activity-changed'));
  }

  function updateCartBadge() {
    const count = cartQty();
    document.querySelectorAll('[data-cart-count]').forEach(function (node) {
      node.textContent = String(count);
      node.classList.toggle('is-empty', count === 0);
    });
    document.querySelectorAll('[data-cart-label]').forEach(function (node) {
      node.setAttribute('aria-label', 'Shopping bag, ' + count + ' item' + (count === 1 ? '' : 's'));
    });
  }

  function toast(message, options) {
    const opts = options || {};
    let container = document.querySelector('.toast-region');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-region';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
    }
    const node = document.createElement('div');
    node.className = 'toast toast--' + (opts.type || 'info');
    node.setAttribute('role', 'status');
    const iconName = opts.type === 'success' ? 'check' : opts.type === 'error' ? 'info' : 'info';
    node.innerHTML = '<span class="toast__icon">' + icon(iconName) + '</span><span class="toast__text">' + escapeHtml(message) + '</span>' +
      '<button class="toast__close" type="button" aria-label="Dismiss notification">' + icon('close') + '</button>';
    container.appendChild(node);
    const remove = function () {
      node.classList.add('is-leaving');
      window.setTimeout(function () { node.remove(); }, 220);
    };
    node.querySelector('.toast__close').addEventListener('click', remove);
    window.setTimeout(remove, opts.duration || 4600);
    return node;
  }

  function getCartWhatsAppMessage(options) {
    const settings = getSettings();
    const opts = options || {};
    const details = opts.items || cartDetails().map(function (line) {
      return {
        name: line.product ? line.product.name : 'Unavailable sample product',
        size: line.size,
        color: line.color,
        qty: line.qty,
        lineTotal: line.lineTotal
      };
    });
    const lines = [
      'Hello ' + settings.storeName + ',',
      '',
      'I would like to enquire about the following sample order:',
      ''
    ];
    if (opts.reference) lines.push('Order reference: ' + opts.reference);
    details.forEach(function (item, index) {
      lines.push((index + 1) + '. ' + item.name);
      lines.push('   Size: ' + (item.size || '—') + ' | Colour: ' + (item.color || '—') + ' | Quantity: ' + item.qty);
      lines.push('   ' + formatKsh(item.lineTotal));
    });
    const subtotal = opts.subtotal != null ? opts.subtotal : details.reduce(function (total, item) {
      return total + (Number(item.lineTotal) || 0);
    }, 0);
    lines.push('');
    lines.push('Subtotal: ' + formatKsh(subtotal));
    if (opts.total != null && opts.total !== subtotal) lines.push('Estimated total: ' + formatKsh(opts.total));
    if (opts.customerName) lines.push('Name: ' + opts.customerName);
    lines.push('');
    lines.push('This message was prepared by the DE LA BOSS OUTFITS website concept demonstration. I understand that I need to review and send it myself.');
    return lines.join('\n');
  }

  function openWhatsApp(message, phone) {
    const number = normalizeWhatsAppNumber(phone || getSettings().whatsapp);
    if (!number || number.length < 10) {
      toast('The WhatsApp contact number is not configured correctly in Settings.', { type: 'error' });
      return false;
    }
    const url = whatsappUrl(message, number);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      toast('Your browser blocked the WhatsApp window. Allow pop-ups and try again.', { type: 'error' });
      return false;
    }
    toast('WhatsApp opened in a new tab. Review and send the prepared message yourself.', { type: 'info', duration: 5200 });
    return true;
  }

  function initGlobalUI() {
    const settings = getSettings();
    const announcement = document.querySelector('[data-announcement-bar]');
    if (announcement) {
      const text = document.querySelector('[data-announcement-text]');
      if (text) text.textContent = settings.announcement || DEFAULT_SETTINGS.announcement;
      announcement.hidden = settings.showAnnouncement === false;
    }
    document.querySelectorAll('[data-store-name]').forEach(function (node) {
      node.textContent = settings.storeName;
    });
    document.querySelectorAll('[data-location]').forEach(function (node) {
      node.textContent = settings.location;
    });
    document.querySelectorAll('[data-phone-primary]').forEach(function (node) {
      const clean = String(settings.phonePrimary || '').replace(/[^\d+]/g, '');
      node.setAttribute('href', 'tel:' + clean);
      if (node.hasAttribute('data-phone-label')) node.textContent = settings.phonePrimary;
    });
    document.querySelectorAll('[data-phone-secondary]').forEach(function (node) {
      const clean = String(settings.phoneSecondary || '').replace(/[^\d+]/g, '');
      node.setAttribute('href', 'tel:' + clean);
      if (node.hasAttribute('data-phone-label')) node.textContent = settings.phoneSecondary;
    });
    document.querySelectorAll('[data-whatsapp-link]').forEach(function (node) {
      node.setAttribute('href', whatsappUrl('Hello ' + settings.storeName + ', I would like to make an enquiry from the website concept demonstration.'));
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    });
    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
    document.querySelectorAll('[data-low-stock-threshold]').forEach(function (node) {
      node.textContent = String(settings.lowStockThreshold);
    });
    updateCartBadge();
    initMobileDrawer();
    initSearchDialog();

    document.addEventListener('click', function (event) {
      const trigger = event.target.closest('[data-quick-view]');
      if (trigger) {
        event.preventDefault();
        openQuickView(trigger.getAttribute('data-quick-view'));
      }
    });

    document.addEventListener('error', function (event) {
      const target = event.target;
      if (target && target.tagName === 'IMG' && !target.dataset.fallbackApplied) {
        target.dataset.fallbackApplied = 'true';
        target.src = 'assets/images/placeholder.svg';
      }
    }, true);

    document.addEventListener('dlb:cart-changed', updateCartBadge);
    window.addEventListener('storage', function (event) {
      if (event.key && event.key.indexOf(STORAGE_PREFIX) === 0) updateCartBadge();
    });
  }

  function initSearchDialog() {
    if (document.getElementById('siteSearchDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'siteSearchDialog';
    dialog.className = 'dialog search-dialog';
    dialog.setAttribute('aria-labelledby', 'siteSearchTitle');
    dialog.innerHTML =
      '<button class="dialog__close" type="button" data-close-dialog aria-label="Close search">' + icon('close') + '</button>' +
      '<p class="eyebrow">Search the sample collection</p>' +
      '<h2 id="siteSearchTitle" class="dialog__title">What are you looking for?</h2>' +
      '<form class="search-dialog__form" action="shop.html" method="get" role="search">' +
        '<label class="visually-hidden" for="globalSearchInput">Search products</label>' +
        '<div class="search-dialog__field">' +
          icon('search') +
          '<input id="globalSearchInput" name="q" type="search" placeholder="Try “dress”, “sneakers” or “bag”" autocomplete="off" required>' +
          '<button class="btn btn--dark" type="submit">Search</button>' +
        '</div>' +
      '</form>' +
      '<div class="search-dialog__links">' +
        '<span>Explore</span>' +
        '<a href="shop.html?filter=new">New arrivals</a>' +
        '<a href="shop.html?category=Women">Women</a>' +
        '<a href="shop.html?category=Men">Men</a>' +
        '<a href="shop.html?category=Shoes">Shoes</a>' +
        '<a href="shop.html?category=Accessories">Accessories</a>' +
      '</div>' +
      '<p class="dialog__note">Product names, prices and stock are sample demonstration data.</p>';
    document.body.appendChild(dialog);
    const open = function () {
      const drawer = document.getElementById('mobileNavDialog');
      if (drawer && drawer.open) drawer.close();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      const input = dialog.querySelector('input[type="search"]');
      window.setTimeout(function () { if (input) input.focus(); }, 30);
    };
    document.querySelectorAll('[data-open-search]').forEach(function (button) {
      button.addEventListener('click', open);
    });
    dialog.querySelector('[data-close-dialog]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  function initMobileDrawer() {
    if (document.getElementById('mobileNavDialog')) return;
    const page = document.body.getAttribute('data-page') || '';
    const links = [
      { href: 'index.html', label: 'Home', page: 'home' },
      { href: 'shop.html', label: 'Shop', page: 'shop' },
      { href: 'shop.html?filter=new', label: 'New Arrivals' },
      { href: 'shop.html?group=clothing', label: 'Clothing' },
      { href: 'shop.html?category=Shoes', label: 'Shoes' },
      { href: 'shop.html?category=Accessories', label: 'Accessories' },
      { href: 'about.html', label: 'About' },
      { href: 'contact.html', label: 'Contact' }
    ];
    const drawer = document.createElement('dialog');
    drawer.id = 'mobileNavDialog';
    drawer.className = 'dialog nav-drawer';
    drawer.setAttribute('aria-labelledby', 'mobileNavTitle');
    drawer.innerHTML =
      '<div class="nav-drawer__top">' +
        '<span class="wordmark wordmark--small" id="mobileNavTitle"><span class="wordmark__main">DE LA BOSS</span><span class="wordmark__sub">OUTFITS</span></span>' +
        '<button class="icon-btn" type="button" data-close-dialog aria-label="Close navigation">' + icon('close') + '</button>' +
      '</div>' +
      '<nav class="nav-drawer__nav" aria-label="Mobile navigation">' +
        links.map(function (link) {
          const current = link.page && link.page === page ? ' aria-current="page"' : '';
          return '<a href="' + link.href + '"' + current + '>' + escapeHtml(link.label) + '<span aria-hidden="true">' + icon('arrow-up-right') + '</span></a>';
        }).join('') +
      '</nav>' +
      '<div class="nav-drawer__secondary">' +
        '<button type="button" class="text-link" data-open-search>' + icon('search') + ' Search the collection</button>' +
        '<a class="text-link" href="cart.html">' + icon('bag') + ' Shopping bag <span data-cart-count>0</span></a>' +
        '<a class="text-link" href="admin.html">' + icon('grid') + ' Admin demo</a>' +
      '</div>' +
      '<div class="nav-drawer__footer">' +
        '<p>Kehancha · Migori County</p>' +
        '<p class="small-note">Independent website concept. Sample product data.</p>' +
      '</div>';
    document.body.appendChild(drawer);
    const open = function () {
      if (typeof drawer.showModal === 'function') drawer.showModal();
      else drawer.setAttribute('open', '');
      document.body.classList.add('nav-open');
      window.setTimeout(function () {
        const firstLink = drawer.querySelector('.nav-drawer__nav a');
        if (firstLink) firstLink.focus();
      }, 30);
    };
    document.querySelectorAll('[data-open-menu]').forEach(function (button) {
      button.addEventListener('click', open);
    });
    drawer.querySelector('[data-close-dialog]').addEventListener('click', function () { drawer.close(); });
    drawer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        drawer.close();
      }
    });
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { drawer.close(); });
    });
    drawer.addEventListener('click', function (event) {
      if (event.target === drawer) drawer.close();
    });
    drawer.addEventListener('close', function () {
      document.body.classList.remove('nav-open');
      const menuButton = document.querySelector('[data-open-menu]');
      if (menuButton) menuButton.focus();
    });
    drawer.querySelectorAll('[data-open-search]').forEach(function (button) {
      button.addEventListener('click', function () {
        drawer.close();
        window.setTimeout(function () {
          const searchButton = document.querySelector('[data-open-search]:not(.text-link)');
          if (searchButton) searchButton.click();
        }, 80);
      });
    });
    updateCartBadge();
  }

  function openQuickView(productId) {
    const product = getProduct(productId);
    if (!product) {
      toast('This sample product could not be found.', { type: 'error' });
      return;
    }
    const existing = document.getElementById('quickViewDialog');
    if (existing) existing.remove();
    const dialog = document.createElement('dialog');
    dialog.id = 'quickViewDialog';
    dialog.className = 'dialog quickview';
    dialog.setAttribute('aria-labelledby', 'quickViewTitle');
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const soldOut = Number(product.stock) <= 0;
    let sizeHtml = '';
    if (sizes.length) {
      sizeHtml = '<fieldset class="option-group"><legend class="option-label">Size <span>Required</span></legend><div class="choice-grid">' +
        sizes.map(function (size, index) {
          return '<label class="choice-pill"><input type="radio" name="quickSize" value="' + escapeAttr(size) + '"' + (soldOut || (sizes.length === 1) ? (sizes.length === 1 && !soldOut ? ' checked' : ' disabled') : '') + '><span>' + escapeHtml(size) + '</span></label>';
        }).join('') + '</div></fieldset>';
    }
    let colorHtml = '';
    if (colors.length) {
      colorHtml = '<fieldset class="option-group"><legend class="option-label">Colour <span>Required</span></legend><div class="choice-colors">' +
        colors.map(function (color, index) {
          return '<label class="choice-colour"><input type="radio" name="quickColor" value="' + escapeAttr(color.name) + '"' + (soldOut || (colors.length === 1) ? (colors.length === 1 && !soldOut ? ' checked' : ' disabled') : '') + '><span class="choice-colour__inner"><span class="swatch" style="--swatch:' + escapeAttr(colorHex(color.name)) + '"></span><span>' + escapeHtml(color.name) + '</span></span></label>';
        }).join('') + '</div></fieldset>';
    }
    dialog.innerHTML =
      '<button class="dialog__close" type="button" data-close-dialog aria-label="Close quick view">' + icon('close') + '</button>' +
      '<div class="quickview__grid">' +
        '<div class="quickview__media"><img src="' + escapeAttr(safeImageUrl((product.images && product.images[0]) || '')) + '" alt="' + escapeAttr(product.name + ' — sample product photograph') + '" width="900" height="1125"></div>' +
        '<div class="quickview__content">' +
          '<p class="eyebrow">' + escapeHtml(product.category) + ' · ' + escapeHtml(product.subcategory || 'Sample') + '</p>' +
          '<h2 id="quickViewTitle" class="quickview__title">' + escapeHtml(product.name) + '</h2>' +
          '<div class="quickview__price">' + priceHtml(product, true) + '</div>' +
          '<p class="quickview__desc">' + escapeHtml(product.description) + '</p>' +
          '<p class="stock-note stock-note--' + stockState(product).key + '">' + escapeHtml(stockState(product).detail) + '</p>' +
          '<form class="quickview__form" novalidate>' +
            colorHtml + sizeHtml +
            '<div class="option-group"><label class="option-label" for="quickQty">Quantity</label><div class="qty-stepper"><button type="button" data-qty-minus aria-label="Decrease quantity">' + icon('minus') + '</button><input id="quickQty" name="qty" type="number" min="1" max="' + Math.max(1, Number(product.stock) || 1) + '" value="1" inputmode="numeric"><button type="button" data-qty-plus aria-label="Increase quantity">' + icon('plus') + '</button></div></div>' +
            '<p class="form-error" data-quick-error role="alert" hidden></p>' +
            '<button class="btn btn--dark btn--full" type="submit"' + (soldOut ? ' disabled' : '') + '>' + (soldOut ? 'Sold out' : 'Add to bag') + '</button>' +
            '<a class="btn btn--ghost btn--full" href="product.html?id=' + encodeURIComponent(product.id) + '">View full details</a>' +
          '</form>' +
          '<p class="dialog__note">Sample product · Price and availability are for demonstration only.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dialog);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    const form = dialog.querySelector('form');
    const errorBox = dialog.querySelector('[data-quick-error]');
    const qtyInput = dialog.querySelector('#quickQty');
    dialog.querySelector('[data-close-dialog]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('[data-qty-minus]').forEach(function (button) {
      button.addEventListener('click', function () {
        qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1));
      });
    });
    dialog.querySelectorAll('[data-qty-plus]').forEach(function (button) {
      button.addEventListener('click', function () {
        const max = Math.max(1, Number(product.stock) || 1);
        qtyInput.value = String(Math.min(max, (parseInt(qtyInput.value, 10) || 1) + 1));
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      errorBox.hidden = true;
      const selectedSize = form.querySelector('input[name="quickSize"]:checked');
      const selectedColor = form.querySelector('input[name="quickColor"]:checked');
      if (sizes.length && !selectedSize) {
        errorBox.textContent = 'Please select a size.';
        errorBox.hidden = false;
        return;
      }
      if (colors.length && !selectedColor) {
        errorBox.textContent = 'Please select a colour.';
        errorBox.hidden = false;
        return;
      }
      try {
        const result = addToCart(product.id, {
          size: selectedSize ? selectedSize.value : (sizes[0] || 'One Size'),
          color: selectedColor ? selectedColor.value : (colors[0] ? colors[0].name : ''),
          qty: parseInt(qtyInput.value, 10) || 1
        });
        dialog.close();
        toast('Added ' + result.qty + ' × ' + product.name + ' to your bag.', { type: 'success' });
        if (result.limited) {
          toast('Only ' + result.qty + ' sample unit(s) could be added based on the demonstration stock.', { type: 'info' });
        }
      } catch (error) {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
      }
    });
  }

  function setupNewsletter() {
    document.querySelectorAll('[data-newsletter-form]').forEach(function (form) {
      if (form.dataset.bound) return;
      form.dataset.bound = 'true';
      const feedback = form.querySelector('[data-newsletter-feedback]') ||
        (form.parentElement && form.parentElement.querySelector('[data-newsletter-feedback]'));
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const result = subscribe(input ? input.value : '');
        if (feedback) {
          feedback.textContent = result.message;
          feedback.hidden = false;
          feedback.className = 'form-feedback ' + (result.ok ? 'form-feedback--success' : 'form-feedback--error');
        }
        toast(result.message, { type: result.ok ? 'success' : 'error' });
        if (result.ok) form.reset();
      });
    });
  }

  // Boot shared data and interface.
  document.addEventListener('DOMContentLoaded', function () {
    ensureSeedData();
    initGlobalUI();
    setupNewsletter();
  });

  window.DelaBoss = {
    KEYS: KEYS,
    ORDER_STATUSES: ORDER_STATUSES,
    STOCK_HOLDING_STATUSES: STOCK_HOLDING_STATUSES,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getProducts: getProducts,
    saveProducts: saveProducts,
    getProduct: getProduct,
    getCategories: getCategories,
    generateProductId: generateProductId,
    stockState: stockState,
    productCardHtml: productCardHtml,
    priceHtml: priceHtml,
    safeImageUrl: safeImageUrl,
    colorHex: colorHex,
    formatKsh: formatKsh,
    formatNumber: formatNumber,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    relativeTime: relativeTime,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    slugify: slugify,
    icon: icon,
    getCart: getCart,
    cartDetails: cartDetails,
    cartSubtotal: cartSubtotal,
    cartQty: cartQty,
    cartLineKey: cartLineKey,
    addToCart: addToCart,
    updateCartQty: updateCartQty,
    removeCartItem: removeCartItem,
    clearCart: clearCart,
    saveCart: saveCart,
    updateCartBadge: updateCartBadge,
    getOrders: getOrders,
    saveOrders: saveOrders,
    findOrder: findOrder,
    createOrder: createOrder,
    updateOrderStatus: updateOrderStatus,
    deleteOrder: deleteOrder,
    orderMetrics: orderMetrics,
    customersFromOrders: customersFromOrders,
    getActivity: getActivity,
    addActivity: addActivity,
    getSubscribers: getSubscribers,
    subscribe: subscribe,
    saveEnquiry: saveEnquiry,
    normalizeWhatsAppNumber: normalizeWhatsAppNumber,
    whatsappUrl: whatsappUrl,
    validateKenyanPhone: validateKenyanPhone,
    validateEmail: validateEmail,
    getCartWhatsAppMessage: getCartWhatsAppMessage,
    openWhatsApp: openWhatsApp,
    updateCartBadge: updateCartBadge,
    toast: toast,
    openQuickView: openQuickView,
    setupNewsletter: setupNewsletter,
    resetDemoData: resetDemoData
  };
})();
