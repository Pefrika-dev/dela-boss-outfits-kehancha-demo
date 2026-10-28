/*
 * DE LA BOSS OUTFITS — preview checkout
 * Kenyan phone validation, fulfilment choice, local order creation,
 * confirmation screen and WhatsApp handoff. No payment, no backend.
 */
(function () {
  'use strict';

  const COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a",
    'Nairobi City', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
    'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function selectedFulfilment() {
    const checked = document.querySelector('input[name="fulfilment"]:checked');
    return checked ? checked.value : 'collection';
  }

  function orderTotals() {
    const DB = window.DelaBoss;
    const subtotal = DB.cartSubtotal();
    const fee = selectedFulfilment() === 'delivery'
      ? Math.max(0, Number(DB.getSettings().deliveryFee) || 0)
      : 0;
    return { subtotal: subtotal, fee: fee, total: subtotal + fee };
  }

  function cartIsValid() {
    const DB = window.DelaBoss;
    const lines = DB.cartDetails();
    if (!lines.length) return false;
    if (lines.some(function (line) { return !line.product || line.unavailable || line.qty > line.maxStock; })) return false;
    const totals = {};
    lines.forEach(function (line) {
      totals[line.product.id] = (totals[line.product.id] || 0) + line.qty;
    });
    return lines.every(function (line) {
      return totals[line.product.id] <= line.maxStock;
    });
  }

  function renderSummary() {
    const DB = window.DelaBoss;
    const lines = DB.cartDetails();
    const items = byId('checkoutSummaryItems');
    const totals = orderTotals();
    const fee = totals.fee;
    const delivery = selectedFulfilment();
    const invalid = !cartIsValid();

    if (items) {
      items.innerHTML = lines.map(function (line) {
        if (!line.product) {
          return '<div class="checkout-mini-item"><div class="checkout-mini-item__media"><img src="assets/images/placeholder.svg" alt="Unavailable product placeholder" width="96" height="120"></div><div><p class="checkout-mini-item__name">Unavailable piece</p><p class="checkout-mini-item__options">Remove in your bag</p></div><span class="checkout-mini-item__price">—</span></div>';
        }
        return '<div class="checkout-mini-item">' +
          '<div class="checkout-mini-item__media">' +
            '<img src="' + DB.escapeAttr(DB.safeImageUrl((line.product.images && line.product.images[0]) || '')) + '" alt="' + DB.escapeAttr(line.product.name + ' — product photograph') + '" width="96" height="120" loading="lazy">' +
            '<span class="checkout-mini-item__qty" aria-label="Quantity ' + line.qty + '">' + line.qty + '</span>' +
          '</div>' +
          '<div>' +
            '<p class="checkout-mini-item__name">' + DB.escapeHtml(line.product.name) + '</p>' +
            '<p class="checkout-mini-item__options">' + DB.escapeHtml(line.size || 'One Size') + ' · ' + DB.escapeHtml(line.color || '—') + '</p>' +
          '</div>' +
          '<span class="checkout-mini-item__price">' + DB.formatKsh(line.lineTotal) + '</span>' +
        '</div>';
      }).join('');
    }

    const subtotalNode = byId('checkoutSubtotal');
    const deliveryNode = byId('checkoutDelivery');
    const totalNode = byId('checkoutTotal');
    const qtyNode = byId('summaryQty');
    if (subtotalNode) subtotalNode.textContent = DB.formatKsh(totals.subtotal);
    if (deliveryNode) {
      if (delivery === 'collection') {
        deliveryNode.textContent = 'Collection · no fee';
      } else if (fee > 0) {
        deliveryNode.textContent = DB.formatKsh(fee) + ' · delivery fee';
      } else {
        deliveryNode.textContent = 'To be agreed';
      }
    }
    if (totalNode) totalNode.textContent = DB.formatKsh(totals.total);
    if (qtyNode) qtyNode.textContent = '(' + DB.cartQty() + ')';

    const blocked = byId('checkoutBlocked');
    const submit = byId('checkoutSubmit');
    if (blocked) blocked.hidden = !invalid;
    if (submit) submit.disabled = invalid;
  }

  function fieldError(inputId, errorId, message) {
    const input = byId(inputId);
    const error = byId(errorId);
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
    return message ? input : null;
  }

  function clearErrors() {
    [
      ['checkoutName', 'nameError'],
      ['checkoutPhone', 'phoneError'],
      ['checkoutEmail', 'emailError'],
      ['checkoutCounty', 'countyError'],
      ['checkoutTown', 'townError'],
      ['checkoutConfirm', 'confirmError']
    ].forEach(function (pair) {
      fieldError(pair[0], pair[1], '');
    });
    const formError = byId('checkoutFormError');
    if (formError) formError.hidden = true;
  }

  function validate() {
    const DB = window.DelaBoss;
    clearErrors();
    const name = byId('checkoutName');
    const phone = byId('checkoutPhone');
    const email = byId('checkoutEmail');
    const county = byId('checkoutCounty');
    const town = byId('checkoutTown');
    const confirm = byId('checkoutConfirm');
    const delivery = selectedFulfilment() === 'delivery';
    let firstInvalid = null;

    function mark(node) {
      if (node && !firstInvalid) firstInvalid = node;
    }

    if (!name.value.trim() || name.value.trim().length < 2) {
      mark(fieldError('checkoutName', 'nameError', 'Enter the name for this order request.'));
    }
    if (!DB.validateKenyanPhone(phone.value)) {
      mark(fieldError('checkoutPhone', 'phoneError', 'Enter a valid Kenyan mobile number, for example 0712 345 678 or +254 712 345 678.'));
    }
    if (email.value.trim() && !DB.validateEmail(email.value)) {
      mark(fieldError('checkoutEmail', 'emailError', 'Enter a valid email address or leave this field empty.'));
    }
    if (delivery && !county.value) {
      mark(fieldError('checkoutCounty', 'countyError', 'Select a county for delivery.'));
    }
    if (delivery && !town.value.trim()) {
      mark(fieldError('checkoutTown', 'townError', 'Enter a town or area for delivery.'));
    }
    if (!confirm.checked) {
      mark(fieldError('checkoutConfirm', 'confirmError', 'Please confirm that you understand this is a preview order.'));
    }
    if (firstInvalid) {
      firstInvalid.focus();
      if (typeof firstInvalid.scrollIntoView === 'function') {
        firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return false;
    }
    return true;
  }

  function confirmationHtml(order) {
    const DB = window.DelaBoss;
    const delivery = order.fulfilment === 'delivery';
    const destination = delivery
      ? [order.town, order.county].filter(Boolean).join(', ') || 'Delivery details supplied'
      : 'Collection · Kehancha (arrangements to be confirmed)';
    return '<div class="confirmation-card">' +
      '<div class="confirmation-card__main">' +
        '<span class="confirmation-mark">' + DB.icon('check') + '</span>' +
        '<p class="eyebrow">Saved locally</p>' +
        '<h1 id="confirmTitle">YOUR ORDER REQUEST IS SAVED.</h1>' +
        '<p class="confirmation-lead">Thank you, ' + DB.escapeHtml(order.customer.name) + '. Your order request has been saved in this browser with a reference. No payment was taken and no request was sent to DE LA BOSS OUTFITS. Continue on WhatsApp to send it.</p>' +
        '<div class="confirmation-reference"><span>Order request reference</span><strong>' + DB.escapeHtml(order.reference) + '</strong></div>' +
        '<div class="confirmation-details">' +
          '<div class="confirmation-detail"><span>Phone</span><strong>' + DB.escapeHtml(order.customer.phone) + '</strong></div>' +
          (order.customer.email ? '<div class="confirmation-detail"><span>Email</span><strong>' + DB.escapeHtml(order.customer.email) + '</strong></div>' : '') +
          '<div class="confirmation-detail"><span>Fulfilment</span><strong>' + (delivery ? 'Delivery preference' : 'Collection preference') + '</strong></div>' +
          '<div class="confirmation-detail"><span>Destination</span><strong>' + DB.escapeHtml(destination) + '</strong></div>' +
          (order.notes ? '<div class="confirmation-detail"><span>Note</span><strong>' + DB.escapeHtml(order.notes) + '</strong></div>' : '') +
          '<div class="confirmation-detail"><span>Status</span><strong>' + DB.escapeHtml(order.status) + ' · preview</strong></div>' +
          '<div class="confirmation-detail"><span>Created</span><strong>' + DB.formatDateTime(order.createdAt) + '</strong></div>' +
          '<div class="confirmation-detail"><span>Estimated total</span><strong>' + DB.formatKsh(order.total) + '</strong></div>' +
        '</div>' +
        '<div class="confirmation-actions">' +
          '<button class="btn btn--whatsapp" type="button" id="confirmWhatsApp">' + DB.icon('whatsapp') + 'Send order enquiry on WhatsApp</button>' +
          '<a class="btn btn--ghost" href="shop.html">Continue shopping</a>' +
          '<a class="btn btn--ghost" href="admin.html">View store dashboard</a>' +
        '</div>' +
        '<p class="confirmation-demo-note">The WhatsApp button prepares a message for you to review and send yourself. It does not place an order. Your bag has been cleared because this order request is now saved locally.</p>' +
      '</div>' +
      '<div class="confirmation-card__aside">' +
        '<div>' +
          '<h2>Order items</h2>' +
          '<div class="confirmation-items">' +
            order.items.map(function (item) {
              return '<div class="confirmation-item">' +
                '<div><p class="confirmation-item__name">' + DB.escapeHtml(item.name) + '</p>' +
                '<p class="confirmation-item__meta">' + DB.escapeHtml(item.size || 'One Size') + ' · ' + DB.escapeHtml(item.color || '—') + ' · Qty ' + item.qty + '</p></div>' +
                '<span class="confirmation-item__price">' + DB.formatKsh(item.lineTotal) + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="confirmation-total"><span>Estimated total</span><strong>' + DB.formatKsh(order.total) + '</strong></div>' +
        '</div>' +
        '<p class="confirmation-aside-note">Prices and stock are preview data. Delivery and collection are not arranged by this preview. The store would confirm every detail directly.</p>' +
      '</div>' +
    '</div>';
  }

  function showConfirmation(order) {
    const DB = window.DelaBoss;
    const header = byId('checkoutHeader');
    const layout = byId('checkoutLayout');
    const empty = byId('checkoutEmpty');
    const confirmation = byId('orderConfirmation');
    const breadcrumb = byId('checkoutBreadcrumb');
    if (header) header.hidden = true;
    if (layout) layout.hidden = true;
    if (empty) empty.hidden = true;
    if (breadcrumb) {
      breadcrumb.innerHTML = '<li><a href="index.html">Home</a></li>' +
        '<li><a href="shop.html">Shop</a></li>' +
        '<li aria-current="page">Order saved</li>';
    }
    if (!confirmation) return;
    confirmation.innerHTML = confirmationHtml(order);
    confirmation.hidden = false;
    document.title = 'Order Request ' + order.reference + ' | DE LA BOSS OUTFITS';
    const button = byId('confirmWhatsApp');
    if (button) {
      button.addEventListener('click', function () {
        DB.openWhatsApp(DB.getCartWhatsAppMessage({
          items: order.items,
          subtotal: order.subtotal,
          total: order.total,
          reference: order.reference,
          customerName: order.customer.name
        }));
      });
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const DB = window.DelaBoss;
    if (!DB) return;

    const countySelect = byId('checkoutCounty');
    if (countySelect) {
      countySelect.insertAdjacentHTML('beforeend', COUNTIES.map(function (county) {
        return '<option value="' + DB.escapeAttr(county) + '">' + DB.escapeHtml(county) + '</option>';
      }).join(''));
    }

    const params = new URLSearchParams(window.location.search);
    const reference = (params.get('order') || '').trim();
    if (reference) {
      const savedOrder = DB.findOrder(reference);
      if (savedOrder) {
        showConfirmation(savedOrder);
        return;
      }
      DB.toast('That order request could not be found in this browser.', { type: 'error' });
    }

    const layout = byId('checkoutLayout');
    const empty = byId('checkoutEmpty');
    const hasCart = DB.cartDetails().length > 0;
    if (layout) layout.hidden = !hasCart;
    if (empty) empty.hidden = hasCart;
    if (!hasCart) return;

    renderSummary();

    document.querySelectorAll('input[name="fulfilment"]').forEach(function (input) {
      input.addEventListener('change', function () {
        const deliveryFields = byId('deliveryFields');
        const delivery = selectedFulfilment() === 'delivery';
        if (deliveryFields) deliveryFields.hidden = !delivery;
        renderSummary();
      });
    });

    const form = byId('checkoutForm');
    if (!form) return;

    const errorMap = {
      checkoutName: ['checkoutName', 'nameError'],
      checkoutPhone: ['checkoutPhone', 'phoneError'],
      checkoutEmail: ['checkoutEmail', 'emailError'],
      checkoutCounty: ['checkoutCounty', 'countyError'],
      checkoutTown: ['checkoutTown', 'townError'],
      checkoutConfirm: ['checkoutConfirm', 'confirmError']
    };

    form.addEventListener('input', function (event) {
      const mapping = errorMap[event.target.id];
      if (mapping) fieldError(mapping[0], mapping[1], '');
    });
    form.addEventListener('change', function (event) {
      const mapping = errorMap[event.target.id];
      if (mapping) fieldError(mapping[0], mapping[1], '');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const submit = byId('checkoutSubmit');
      const formError = byId('checkoutFormError');
      if (formError) formError.hidden = true;

      if (!cartIsValid()) {
        const blocked = byId('checkoutBlocked');
        if (blocked) blocked.hidden = false;
        DB.toast('Review your bag before placing the order request.', { type: 'error' });
        return;
      }
      if (!validate()) return;

      const fulfilment = selectedFulfilment();
      const payload = {
        name: byId('checkoutName').value,
        phone: byId('checkoutPhone').value,
        email: byId('checkoutEmail').value,
        fulfilment: fulfilment,
        county: fulfilment === 'delivery' ? byId('checkoutCounty').value : 'Migori',
        town: fulfilment === 'delivery' ? byId('checkoutTown').value : 'Kehancha',
        address: fulfilment === 'delivery' ? byId('checkoutAddress').value : '',
        notes: byId('checkoutNotes').value
      };

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Saving order request…';
      }
      try {
        const order = DB.createOrder(payload);
        if (window.history && typeof window.history.replaceState === 'function') {
          window.history.replaceState({}, '', 'checkout.html?order=' + encodeURIComponent(order.reference));
        }
        showConfirmation(order);
        DB.toast('Order request ' + order.reference + ' saved in this browser.', { type: 'success', duration: 6000 });
      } catch (error) {
        if (formError) {
          formError.textContent = error.message;
          formError.hidden = false;
        }
        DB.toast(error.message, { type: 'error' });
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = 'Place order request' +
            '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>';
        }
      }
    });
  });
})();
