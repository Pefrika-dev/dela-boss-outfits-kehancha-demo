/*
 * DE LA BOSS OUTFITS — product details page
 * Reads ?id=, renders the product, handles variant selection,
 * quantity limits, add-to-bag, related pieces and WhatsApp enquiry.
 */
(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function setMeta(selector, content) {
    const node = document.querySelector(selector);
    if (node && content) node.setAttribute('content', content);
  }

  function setLink(selector, href) {
    const node = document.querySelector(selector);
    if (node && href) node.setAttribute('href', href);
  }

  function availableStock(product) {
    const DB = window.DelaBoss;
    const inBag = DB.getCart().reduce(function (total, line) {
      return line.productId === product.id ? total + (Number(line.qty) || 0) : total;
    }, 0);
    return Math.max(0, (Number(product.stock) || 0) - inBag);
  }

  function galleryHtml(product) {
    const DB = window.DelaBoss;
    const images = (Array.isArray(product.images) ? product.images : []).filter(Boolean);
    if (!images.length) images.push('assets/images/placeholder.svg');
    const stage = DB.safeImageUrl(images[0]);
    return '<div class="product-gallery">' +
      '<div class="product-gallery__stage">' +
        '<img id="productStageImage" src="' + DB.escapeAttr(stage) + '" alt="' + DB.escapeAttr(product.name + ' — product photograph') + '" width="900" height="1125" fetchpriority="high">' +
      '</div>' +
      (images.length > 1
        ? '<div class="product-gallery__thumbs" role="group" aria-label="Product photographs">' +
            images.map(function (image, index) {
              return '<button class="product-gallery__thumb" type="button" data-gallery-index="' + index + '" aria-current="' + (index === 0 ? 'true' : 'false') + '" aria-label="Show photograph ' + (index + 1) + ' of ' + images.length + '">' +
                '<img src="' + DB.escapeAttr(DB.safeImageUrl(image)) + '" alt="' + DB.escapeAttr(product.name + ' — product photograph ' + (index + 1)) + '" width="180" height="225" loading="lazy">' +
              '</button>';
            }).join('') +
          '</div>'
        : '') +
      '<div class="product-gallery__caption">' +
        '<span>Preview imagery · Stock photography</span>' +
        '<span>' + images.length + ' view' + (images.length === 1 ? '' : 's') + '</span>' +
      '</div>' +
    '</div>';
  }

  function optionsHtml(product, available) {
    const DB = window.DelaBoss;
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const soldOut = available <= 0;

    let colourHtml = '';
    if (colors.length) {
      colourHtml = '<fieldset class="option-group">' +
        '<legend class="option-label">Colour <span>' + (colors.length === 1 ? 'One colour' : 'Required') + '</span></legend>' +
        '<div class="choice-colors">' +
          colors.map(function (color) {
            const checked = colors.length === 1 && !soldOut ? ' checked' : '';
            return '<label class="choice-colour">' +
              '<input type="radio" name="colour" value="' + DB.escapeAttr(color.name) + '"' + checked + (soldOut ? ' disabled' : '') + '>' +
              '<span class="choice-colour__inner"><span class="swatch" style="--swatch:' + DB.escapeAttr(DB.colorHex(color.name)) + '"></span><span>' + DB.escapeHtml(color.name) + '</span></span>' +
            '</label>';
          }).join('') +
        '</div>' +
      '</fieldset>';
    }

    let sizeHtml = '';
    if (sizes.length) {
      sizeHtml = '<fieldset class="option-group">' +
        '<legend class="option-label">Size <span>' + (sizes.length === 1 ? 'One size' : 'Required') + '</span></legend>' +
        '<div class="choice-grid">' +
          sizes.map(function (size) {
            const checked = sizes.length === 1 && !soldOut ? ' checked' : '';
            return '<label class="choice-pill">' +
              '<input type="radio" name="size" value="' + DB.escapeAttr(size) + '"' + checked + (soldOut ? ' disabled' : '') + '>' +
              '<span>' + DB.escapeHtml(size) + '</span>' +
            '</label>';
          }).join('') +
        '</div>' +
      '</fieldset>';
    }

    return colourHtml + sizeHtml;
  }

  function stockNote(product, available) {
    const DB = window.DelaBoss;
    if (available <= 0) {
      return '<p class="stock-note stock-note--out product-detail__stock" id="stockNote" aria-live="polite">' +
        (Number(product.stock) > 0
          ? 'All available stock is already in your bag.'
          : 'This piece is currently out of stock.') +
        '</p>';
    }
    const state = DB.stockState(product);
    const low = available <= Number(DB.getSettings().lowStockThreshold || 0);
    return '<p class="stock-note stock-note--' + (low ? 'low' : 'in') + ' product-detail__stock" id="stockNote" aria-live="polite">' +
      available + ' unit' + (available === 1 ? '' : 's') + ' available to add' +
      (Number(product.stock) !== available ? ' (' + product.stock + ' total, some already in your bag)' : '') +
      '</p>';
  }

  function detailHtml(product) {
    const DB = window.DelaBoss;
    const available = availableStock(product);
    const soldOut = available <= 0;
    const details = Array.isArray(product.details) ? product.details : [];
    return galleryHtml(product) +
      '<div class="product-detail">' +
        '<p class="product-detail__category">' + DB.escapeHtml(product.category || 'Collection') + ' · ' + DB.escapeHtml(product.subcategory || 'Piece') + '</p>' +
        '<h1 id="productTitle">' + DB.escapeHtml(product.name) + '</h1>' +
        '<div class="product-detail__price">' + DB.priceHtml(product, true) + '</div>' +
        '<span class="sample-note product-detail__sample">Preview catalogue — Price and availability confirmed by the store</span>' +
        '<p class="product-detail__desc">' + DB.escapeHtml(product.description) + '</p>' +
        '<form class="product-form" id="productForm" novalidate>' +
          optionsHtml(product, available) +
          '<div class="product-form__row">' +
            '<div>' +
              '<span class="option-label" id="productQtyLabel">Quantity</span>' +
              '<div class="qty-stepper" role="group" aria-labelledby="productQtyLabel">' +
                '<button type="button" data-qty-minus aria-label="Decrease quantity">' + DB.icon('minus') + '</button>' +
                '<input id="productQty" name="quantity" type="number" min="1" max="' + Math.max(1, available) + '" value="1" inputmode="numeric" aria-labelledby="productQtyLabel"' + (soldOut ? ' disabled' : '') + '>' +
                '<button type="button" data-qty-plus aria-label="Increase quantity">' + DB.icon('plus') + '</button>' +
              '</div>' +
            '</div>' +
            stockNote(product, available) +
          '</div>' +
          '<p class="form-error product-form__message" id="productFormMessage" role="alert" hidden></p>' +
          '<div class="product-detail__actions">' +
            '<button class="btn btn--dark" type="submit"' + (soldOut ? ' disabled' : '') + '>' +
              (soldOut ? 'Currently out of stock' : 'Add to bag') +
            '</button>' +
            '<button class="btn btn--whatsapp" type="button" id="productWhatsApp">' +
              DB.icon('whatsapp') + 'Enquire on WhatsApp' +
            '</button>' +
          '</div>' +
        '</form>' +
        '<div class="product-fineprint">' +
          DB.icon('info') +
          '<p>This is a preview catalogue piece. Colour reproduction, fabric, fit and availability are confirmed by the store before purchase. Adding to your bag saves the selection in this browser only.</p>' +
        '</div>' +
        '<div class="product-accordions">' +
          '<details class="product-accordion" open>' +
            '<summary>Product details ' + DB.icon('chevron-down') + '</summary>' +
            '<div class="product-accordion__body">' +
              '<ul>' + details.map(function (item) { return '<li>' + DB.escapeHtml(item) + '</li>'; }).join('') + '</ul>' +
              (details.length ? '' : '<p>Product details are being confirmed with the store.</p>') +
            '</div>' +
          '</details>' +
          '<details class="product-accordion">' +
            '<summary>Sizing &amp; fit ' + DB.icon('chevron-down') + '</summary>' +
            '<div class="product-accordion__body">' +
              '<p>Available options are listed above. Measurements, fit notes and size guidance are confirmed by the store before an order. If you are unsure, include your usual size in a WhatsApp enquiry.</p>' +
            '</div>' +
          '</details>' +
          '<details class="product-accordion">' +
            '<summary>Ordering &amp; delivery ' + DB.icon('chevron-down') + '</summary>' +
            '<div class="product-accordion__body">' +
              '<p>Add the piece to your bag, review it, then send an order request. The request is saved in this browser only; no payment is collected and nothing is sent to the store until you continue on WhatsApp.</p>' +
              '<p style="margin-top:8px">For a real enquiry, use the WhatsApp button above. Delivery coverage, fees and collection arrangements are confirmed directly with the store.</p>' +
            '</div>' +
          '</details>' +
          '<details class="product-accordion">' +
            '<summary>Care &amp; materials ' + DB.icon('chevron-down') + '</summary>' +
            '<div class="product-accordion__body">' +
              '<p>Material and care details are confirmed by the store before purchase.</p>' +
            '</div>' +
          '</details>' +
        '</div>' +
      '</div>';
  }

  function renderNotFound() {
    const skeleton = byId('productSkeleton');
    const page = byId('productPage');
    const missing = byId('productNotFound');
    const related = byId('relatedSection');
    if (skeleton) skeleton.hidden = true;
    if (page) page.hidden = true;
    if (related) related.hidden = true;
    if (missing) missing.hidden = false;
    document.title = 'Product Not Found | DE LA BOSS OUTFITS';
    setMeta('meta[name="description"]', 'The requested product could not be found in the DE LA BOSS OUTFITS collection.');
    setMeta('meta[name="robots"]', 'noindex, nofollow');
  }

  function renderRelated(product) {
    const DB = window.DelaBoss;
    const section = byId('relatedSection');
    const grid = byId('relatedProducts');
    if (!section || !grid) return;
    const products = DB.getProducts();
    const sameCategory = products.filter(function (candidate) {
      return candidate.id !== product.id && candidate.category === product.category;
    });
    const others = products.filter(function (candidate) {
      return candidate.id !== product.id && candidate.category !== product.category;
    }).sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
    const related = sameCategory.concat(others).slice(0, 4);
    if (!related.length) {
      section.hidden = true;
      return;
    }
    grid.innerHTML = related.map(function (candidate) {
      return DB.productCardHtml(candidate);
    }).join('');
    section.hidden = false;
  }

  function renderBreadcrumb(product) {
    const breadcrumb = byId('productBreadcrumb');
    if (!breadcrumb) return;
    const DB = window.DelaBoss;
    breadcrumb.innerHTML = '<li><a href="index.html">Home</a></li>' +
      '<li><a href="shop.html">Shop</a></li>' +
      '<li><a href="shop.html?category=' + encodeURIComponent(product.category) + '">' + DB.escapeHtml(product.category) + '</a></li>' +
      '<li aria-current="page">' + DB.escapeHtml(product.name) + '</li>';
  }

  function renderMeta(product) {
    const DB = window.DelaBoss;
    const title = product.name + ' | DE LA BOSS OUTFITS';
    const description = product.description.slice(0, 155).trim();
    const image = (product.images && product.images[0]) || 'assets/images/editorial/hero.jpg';
    const url = 'https://dela-boss-outfits-kehancha-demo.netlify.app/product.html?id=' + encodeURIComponent(product.id);
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', 'https://dela-boss-outfits-kehancha-demo.netlify.app/' + image);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setLink('link[rel="canonical"]', url);
    void DB;
  }

  function showMessage(message, isError) {
    const box = byId('productFormMessage');
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
    box.className = 'form-error product-form__message' + (isError ? '' : ' form-feedback--success');
    box.setAttribute('role', isError ? 'alert' : 'status');
  }

  function updateAvailableNote(product) {
    const note = byId('stockNote');
    const qty = byId('productQty');
    if (!note) return;
    const available = availableStock(product);
    const DB = window.DelaBoss;
    if (available <= 0) {
      note.className = 'stock-note stock-note--out product-detail__stock';
      note.textContent = Number(product.stock) > 0
        ? 'All available stock is already in your bag.'
        : 'This piece is currently out of stock.';
    } else {
      const low = available <= Number(DB.getSettings().lowStockThreshold || 0);
      note.className = 'stock-note stock-note--' + (low ? 'low' : 'in') + ' product-detail__stock';
      note.textContent = available + ' unit' + (available === 1 ? '' : 's') + ' available to add' +
        (Number(product.stock) !== available ? ' (' + product.stock + ' total, some already in your bag)' : '');
    }
    if (qty) {
      qty.max = String(Math.max(1, available));
      if (Number(qty.value) > available) qty.value = String(Math.max(1, available));
      qty.disabled = available <= 0;
    }
  }

  function bind(product) {
    const DB = window.DelaBoss;
    const form = byId('productForm');
    const qty = byId('productQty');
    const images = (Array.isArray(product.images) ? product.images : []).filter(Boolean);
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];

    document.querySelectorAll('[data-gallery-index]').forEach(function (button) {
      button.addEventListener('click', function () {
        const index = Number(button.getAttribute('data-gallery-index')) || 0;
        const image = byId('productStageImage');
        if (image && images[index]) {
          image.src = DB.safeImageUrl(images[index]);
          image.alt = product.name + ' — product photograph ' + (index + 1);
        }
        document.querySelectorAll('[data-gallery-index]').forEach(function (other) {
          other.setAttribute('aria-current', other === button ? 'true' : 'false');
        });
      });
    });

    if (qty) {
      qty.addEventListener('change', function () {
        const available = availableStock(product);
        const next = Math.min(Math.max(1, parseInt(qty.value, 10) || 1), Math.max(1, available));
        qty.value = String(next);
      });
    }

    document.querySelectorAll('[data-qty-minus]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (qty) qty.value = String(Math.max(1, (parseInt(qty.value, 10) || 1) - 1));
      });
    });

    document.querySelectorAll('[data-qty-plus]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (!qty) return;
        const available = availableStock(product);
        qty.value = String(Math.min(Math.max(1, available), (parseInt(qty.value, 10) || 1) + 1));
      });
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        showMessage('', false);
        const selectedSize = form.querySelector('input[name="size"]:checked');
        const selectedColour = form.querySelector('input[name="colour"]:checked');
        if (sizes.length && !selectedSize) {
          showMessage('Please select a size before adding this piece to your bag.', true);
          const firstSize = form.querySelector('input[name="size"]');
          if (firstSize) firstSize.focus();
          return;
        }
        if (colors.length && !selectedColour) {
          showMessage('Please select a colour before adding this piece to your bag.', true);
          const firstColour = form.querySelector('input[name="colour"]');
          if (firstColour) firstColour.focus();
          return;
        }
        try {
          const result = DB.addToCart(product.id, {
            size: selectedSize ? selectedSize.value : (sizes[0] || 'One Size'),
            color: selectedColour ? selectedColour.value : (colors[0] ? colors[0].name : ''),
            qty: qty ? parseInt(qty.value, 10) || 1 : 1
          });
          const label = result.qty + ' × ' + product.name +
            (selectedSize ? ' · ' + selectedSize.value : '') +
            (selectedColour ? ' · ' + selectedColour.value : '');
          showMessage(label + ' added to your bag.', false);
          DB.toast(label + ' added to your bag.', { type: 'success' });
          if (result.limited) {
            DB.toast('Only ' + result.qty + ' unit' + (result.qty === 1 ? '' : 's') + ' could be added based on available stock.', { type: 'info' });
          }
          updateAvailableNote(product);
        } catch (error) {
          showMessage(error.message, true);
          DB.toast(error.message, { type: 'error' });
        }
      });
    }

    const whatsapp = byId('productWhatsApp');
    if (whatsapp) {
      whatsapp.addEventListener('click', function () {
        const selectedSize = form ? form.querySelector('input[name="size"]:checked') : null;
        const selectedColour = form ? form.querySelector('input[name="colour"]:checked') : null;
        const quantity = qty ? Math.max(1, parseInt(qty.value, 10) || 1) : 1;
        const settings = DB.getSettings();
        const lines = [
          'Hello ' + settings.storeName + ',',
          '',
          'I would like to enquire about this piece from the DE LA BOSS OUTFITS collection:',
          '',
          'Product: ' + product.name,
          'Reference: ' + product.id,
          'Price: ' + DB.formatKsh(product.price),
          'Size: ' + (selectedSize ? selectedSize.value : 'Not selected'),
          'Colour: ' + (selectedColour ? selectedColour.value : 'Not selected'),
          'Quantity: ' + quantity,
          '',
          'Product page: ' + window.location.href,
          '',
          'This message was prepared by the DE LA BOSS OUTFITS storefront preview. I understand that I need to review and send it myself.'
        ];
        DB.openWhatsApp(lines.join('\n'));
      });
    }

    document.addEventListener('dlb:cart-changed', function () {
      updateAvailableNote(product);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const DB = window.DelaBoss;
    if (!DB) return;
    const skeleton = byId('productSkeleton');
    const page = byId('productPage');
    try {
      const params = new URLSearchParams(window.location.search);
      const id = (params.get('id') || '').trim();
      const product = id ? DB.getProduct(id) : null;
      if (!product) {
        renderNotFound();
        return;
      }
      renderBreadcrumb(product);
      renderMeta(product);
      if (page) {
        page.innerHTML = '<div class="product-layout">' + detailHtml(product) + '</div>';
        page.hidden = false;
      }
      if (skeleton) skeleton.hidden = true;
      bind(product);
      renderRelated(product);
    } catch (error) {
      console.error('Product page could not render:', error);
      renderNotFound();
    }
  });
})();
