/*
 * DE LA BOSS OUTFITS — shopping bag
 * Renders LocalStorage cart lines, variant details, quantity limits,
 * removal, totals, WhatsApp enquiry and recommended pieces.
 */
(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function otherQty(cart, line) {
    return cart.reduce(function (total, candidate) {
      return candidate.key !== line.key && candidate.productId === line.productId
        ? total + (Number(candidate.qty) || 0)
        : total;
    }, 0);
  }

  function lineHtml(line, index, cart) {
    const DB = window.DelaBoss;
    if (!line.product) {
      return '<article class="cart-row" data-cart-line="' + DB.escapeAttr(line.key) + '">' +
        '<div class="cart-row__media"><img src="assets/images/placeholder.svg" alt="Unavailable sample product placeholder" width="232" height="290"></div>' +
        '<div class="cart-row__body">' +
          '<div class="cart-row__top">' +
            '<div>' +
              '<p class="cart-row__category">Unavailable</p>' +
              '<h3 class="cart-row__title">This sample piece is no longer in the catalogue</h3>' +
              '<div class="cart-row__options"><span>Size <strong>' + DB.escapeHtml(line.size || '—') + '</strong></span><span>Colour <strong>' + DB.escapeHtml(line.color || '—') + '</strong></span></div>' +
            '</div>' +
            '<div class="cart-row__price"><span class="cart-row__price-sub">Remove to continue</span></div>' +
          '</div>' +
          '<div class="cart-row__bottom">' +
            '<button class="cart-row__remove" type="button" data-cart-action="remove" data-key="' + DB.escapeAttr(line.key) + '">' + DB.icon('trash') + 'Remove</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }

    const product = line.product;
    const maxForLine = Math.max(0, (Number(product.stock) || 0) - otherQty(cart, line));
    const image = (product.images && product.images[0]) || 'assets/images/placeholder.svg';
    const soldOut = line.unavailable;
    const maxReached = !soldOut && line.qty >= maxForLine;
    const threshold = Math.max(0, Number(DB.getSettings().lowStockThreshold) || 0);
    const low = !soldOut && (maxForLine <= threshold);
    let stockMessage = '';
    if (soldOut) {
      stockMessage = '<p class="cart-row__stock cart-row__stock--out">Out of stock in this demonstration. Remove this line to continue.</p>';
    } else if (maxReached) {
      stockMessage = '<p class="cart-row__stock">Maximum available sample quantity reached.</p>';
    } else if (low) {
      stockMessage = '<p class="cart-row__stock">Low sample stock · ' + maxForLine + ' unit' + (maxForLine === 1 ? '' : 's') + ' available for this piece.</p>';
    }

    return '<article class="cart-row' + (soldOut ? ' is-unavailable' : '') + '" data-cart-line="' + DB.escapeAttr(line.key) + '">' +
      '<div class="cart-row__media">' +
        '<a href="product.html?id=' + encodeURIComponent(product.id) + '" aria-label="View ' + DB.escapeAttr(product.name) + '">' +
          '<img src="' + DB.escapeAttr(DB.safeImageUrl(image)) + '" alt="' + DB.escapeAttr(product.name + ' — sample product photograph') + '" width="232" height="290" loading="lazy">' +
        '</a>' +
      '</div>' +
      '<div class="cart-row__body">' +
        '<div class="cart-row__top">' +
          '<div>' +
            '<p class="cart-row__category">' + DB.escapeHtml(product.category || 'Sample') + ' · ' + DB.escapeHtml(product.subcategory || 'Piece') + '</p>' +
            '<h3 class="cart-row__title"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' + DB.escapeHtml(product.name) + '</a></h3>' +
            '<div class="cart-row__options">' +
              '<span>Size <strong>' + DB.escapeHtml(line.size || 'One Size') + '</strong></span>' +
              '<span>Colour <strong>' + DB.escapeHtml(line.color || '—') + '</strong></span>' +
              '<span>Ref <strong>' + DB.escapeHtml(product.id) + '</strong></span>' +
            '</div>' +
            stockMessage +
          '</div>' +
          '<div class="cart-row__price">' +
            '<span class="price">' + DB.formatKsh(line.lineTotal) + '</span>' +
            (line.qty > 1 ? '<p class="cart-row__price-sub">' + DB.formatKsh(product.price) + ' each</p>' : '') +
          '</div>' +
        '</div>' +
        '<div class="cart-row__bottom">' +
          '<div class="cart-row__qty">' +
            '<span class="qty-label" id="qtyLabel' + index + '">Qty</span>' +
            '<div class="qty-stepper" role="group" aria-labelledby="qtyLabel' + index + '">' +
              '<button type="button" data-cart-action="decrease" data-key="' + DB.escapeAttr(line.key) + '" aria-label="Decrease quantity of ' + DB.escapeAttr(product.name) + '"' + (line.qty <= 1 || soldOut ? ' disabled' : '') + '>' + DB.icon('minus') + '</button>' +
              '<input type="number" min="1" max="' + Math.max(1, maxForLine) + '" value="' + line.qty + '" inputmode="numeric" data-cart-qty data-key="' + DB.escapeAttr(line.key) + '" aria-label="Quantity of ' + DB.escapeAttr(product.name) + '"' + (soldOut ? ' disabled' : '') + '>' +
              '<button type="button" data-cart-action="increase" data-key="' + DB.escapeAttr(line.key) + '" aria-label="Increase quantity of ' + DB.escapeAttr(product.name) + '"' + (maxReached || soldOut ? ' disabled' : '') + '>' + DB.icon('plus') + '</button>' +
            '</div>' +
          '</div>' +
          '<button class="cart-row__remove" type="button" data-cart-action="remove" data-key="' + DB.escapeAttr(line.key) + '">' + DB.icon('trash') + 'Remove</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderRecommended(lines) {
    const DB = window.DelaBoss;
    const section = byId('cartRecommended');
    const grid = byId('cartRecommendedGrid');
    if (!section || !grid) return;
    const inBag = lines.map(function (line) { return line.productId; });
    const products = DB.getProducts().filter(function (product) {
      return inBag.indexOf(product.id) === -1 && Number(product.stock) > 0;
    }).sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }).slice(0, 4);
    if (!products.length) {
      section.hidden = true;
      return;
    }
    grid.innerHTML = products.map(function (product) {
      return DB.productCardHtml(product);
    }).join('');
    section.hidden = false;
  }

  function render(options) {
    const DB = window.DelaBoss;
    const opts = options || {};
    const cart = DB.getCart();
    const lines = DB.cartDetails();
    const hasItems = lines.length > 0;
    const layout = byId('cartLayout');
    const empty = byId('cartEmpty');
    const list = byId('cartList');
    const count = byId('cartItemCount');
    const clear = document.querySelector('[data-clear-cart]');
    const checkout = byId('checkoutLink');
    const notice = byId('cartStockNotice');
    const subtotal = DB.cartSubtotal();
    const qty = DB.cartQty();
    const invalid = lines.some(function (line) { return line.unavailable || !line.product; });

    if (layout) layout.hidden = !hasItems;
    if (empty) empty.hidden = hasItems;
    if (clear) clear.hidden = !hasItems;
    if (count) count.textContent = qty + ' item' + (qty === 1 ? '' : 's');
    if (list) list.innerHTML = lines.map(function (line, index, all) { return lineHtml(line, index, cart); }).join('');

    const subtotalNode = byId('cartSubtotal');
    const deliveryNode = byId('cartDelivery');
    const totalNode = byId('cartTotal');
    if (subtotalNode) subtotalNode.textContent = DB.formatKsh(subtotal);
    if (deliveryNode) deliveryNode.textContent = 'Set at checkout';
    if (totalNode) totalNode.textContent = DB.formatKsh(subtotal);

    if (notice) {
      notice.hidden = !invalid;
      notice.textContent = invalid
        ? 'Some pieces in your bag are no longer available in the requested quantity. Remove or adjust those lines before continuing.'
        : '';
    }
    if (checkout) {
      if (invalid) {
        checkout.setAttribute('aria-disabled', 'true');
        checkout.setAttribute('tabindex', '-1');
        checkout.href = '#';
      } else {
        checkout.removeAttribute('aria-disabled');
        checkout.removeAttribute('tabindex');
        checkout.href = 'checkout.html';
      }
    }

    renderRecommended(lines);

    if (opts.focusKey) {
      const input = Array.prototype.slice.call(document.querySelectorAll('[data-cart-qty]')).find(function (node) {
        return node.getAttribute('data-key') === opts.focusKey;
      });
      if (input) input.focus();
    }
  }

  function changeQty(key, delta) {
    const DB = window.DelaBoss;
    const line = DB.getCart().find(function (item) { return item.key === key; });
    if (!line) return;
    const next = (Number(line.qty) || 1) + delta;
    if (next < 1) return;
    try {
      DB.updateCartQty(key, next);
      render({ focusKey: key });
    } catch (error) {
      DB.toast(error.message, { type: 'error' });
      render();
    }
  }

  function setQty(key, value) {
    const DB = window.DelaBoss;
    const line = DB.getCart().find(function (item) { return item.key === key; });
    if (!line) return;
    const next = parseInt(value, 10);
    if (!Number.isFinite(next) || next < 1) {
      render();
      return;
    }
    try {
      DB.updateCartQty(key, next);
      render({ focusKey: key });
    } catch (error) {
      DB.toast(error.message, { type: 'error' });
      render({ focusKey: key });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const DB = window.DelaBoss;
    if (!DB) return;
    render();

    const list = byId('cartList');
    if (list) {
      list.addEventListener('click', function (event) {
        const button = event.target.closest('[data-cart-action]');
        if (!button) return;
        const key = button.getAttribute('data-key');
        const action = button.getAttribute('data-cart-action');
        if (action === 'decrease') {
          changeQty(key, -1);
        } else if (action === 'increase') {
          changeQty(key, 1);
        } else if (action === 'remove') {
          DB.removeCartItem(key);
          DB.toast('Sample piece removed from your bag.', { type: 'info' });
          render();
        }
      });

      list.addEventListener('change', function (event) {
        const input = event.target.closest('[data-cart-qty]');
        if (!input) return;
        setQty(input.getAttribute('data-key'), input.value);
      });
    }

    const clear = document.querySelector('[data-clear-cart]');
    if (clear) {
      clear.addEventListener('click', function () {
        if (!DB.getCart().length) return;
        if (window.confirm('Clear every sample piece from your bag? This only affects this browser.')) {
          DB.clearCart();
          DB.toast('Your demonstration bag has been cleared.', { type: 'info' });
          render();
        }
      });
    }

    const checkout = byId('checkoutLink');
    if (checkout) {
      checkout.addEventListener('click', function (event) {
        if (checkout.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          DB.toast('Please remove or adjust the unavailable pieces before continuing.', { type: 'error' });
        }
      });
    }

    const whatsapp = byId('cartWhatsApp');
    if (whatsapp) {
      whatsapp.addEventListener('click', function () {
        if (!DB.getCart().length) {
          DB.toast('Add a sample piece before preparing a WhatsApp enquiry.', { type: 'error' });
          return;
        }
        DB.openWhatsApp(DB.getCartWhatsAppMessage());
      });
    }

    document.addEventListener('dlb:cart-changed', function () {
      render();
    });

    document.addEventListener('dlb:products-changed', function () {
      render();
    });
  });
})();
