/*
 * DE LA BOSS OUTFITS — contact page
 * Local-only preview enquiry form with Kenyan phone validation
 * and a WhatsApp handoff that the visitor must review and send.
 */
(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function setError(inputId, errorId, message) {
    const input = byId(inputId);
    const error = byId(errorId);
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
    return message ? input : null;
  }

  function clearErrors() {
    [
      ['contactName', 'contactNameError'],
      ['contactPhone', 'contactPhoneError'],
      ['contactEmail', 'contactEmailError'],
      ['contactMessage', 'contactMessageError'],
      ['contactConfirm', 'contactConfirmError']
    ].forEach(function (pair) {
      setError(pair[0], pair[1], '');
    });
    const feedback = byId('contactFeedback');
    if (feedback) feedback.hidden = true;
  }

  function validate() {
    const DB = window.DelaBoss;
    const name = byId('contactName');
    const phone = byId('contactPhone');
    const email = byId('contactEmail');
    const message = byId('contactMessage');
    const confirm = byId('contactConfirm');
    let first = null;

    function mark(node) {
      if (node && !first) first = node;
    }

    if (!name.value.trim() || name.value.trim().length < 2) {
      mark(setError('contactName', 'contactNameError', 'Enter your name so the note has a sender.'));
    }
    if (!phone.value.trim()) {
      mark(setError('contactPhone', 'contactPhoneError', 'Enter a phone number for this enquiry.'));
    } else if (!DB.validateKenyanPhone(phone.value)) {
      mark(setError('contactPhone', 'contactPhoneError', 'Enter a valid Kenyan mobile number, for example 0712 345 678.'));
    }
    if (email.value.trim() && !DB.validateEmail(email.value)) {
      mark(setError('contactEmail', 'contactEmailError', 'Enter a valid email address or leave this field empty.'));
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      mark(setError('contactMessage', 'contactMessageError', 'Add a little more detail — at least 10 characters.'));
    }
    if (!confirm.checked) {
      mark(setError('contactConfirm', 'contactConfirmError', 'Please confirm that you understand this is a preview form.'));
    }
    if (first) {
      first.focus();
      if (typeof first.scrollIntoView === 'function') {
        first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return false;
    }
    return true;
  }

  function composeWhatsApp() {
    const DB = window.DelaBoss;
    const settings = DB.getSettings();
    const name = byId('contactName') ? byId('contactName').value.trim() : '';
    const phone = byId('contactPhone') ? byId('contactPhone').value.trim() : '';
    const email = byId('contactEmail') ? byId('contactEmail').value.trim() : '';
    const subject = byId('contactSubject') ? byId('contactSubject').value : 'General enquiry';
    const message = byId('contactMessage') ? byId('contactMessage').value.trim() : '';
    const lines = [
      'Hello ' + settings.storeName + ',',
      '',
      'I would like to make an enquiry through the storefront preview.',
      '',
      'Subject: ' + subject
    ];
    if (name) lines.push('Name: ' + name);
    if (phone) lines.push('Phone: ' + phone);
    if (email) lines.push('Email: ' + email);
    if (message) {
      lines.push('');
      lines.push('Message:');
      lines.push(message);
    }
    lines.push('');
    lines.push('This message was prepared by the DE LA BOSS OUTFITS storefront preview. I understand that I need to review and send it myself.');
    return lines.join('\n');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const DB = window.DelaBoss;
    if (!DB) return;
    const form = byId('contactForm');
    if (!form) return;

    const errorMap = {
      contactName: ['contactName', 'contactNameError'],
      contactPhone: ['contactPhone', 'contactPhoneError'],
      contactEmail: ['contactEmail', 'contactEmailError'],
      contactMessage: ['contactMessage', 'contactMessageError'],
      contactConfirm: ['contactConfirm', 'contactConfirmError']
    };

    form.addEventListener('input', function (event) {
      const mapping = errorMap[event.target.id];
      if (mapping) setError(mapping[0], mapping[1], '');
    });
    form.addEventListener('change', function (event) {
      const mapping = errorMap[event.target.id];
      if (mapping) setError(mapping[0], mapping[1], '');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();
      if (!validate()) return;
      DB.saveEnquiry({
        name: byId('contactName').value.trim(),
        phone: byId('contactPhone').value.trim(),
        email: byId('contactEmail').value.trim(),
        subject: byId('contactSubject').value,
        message: byId('contactMessage').value.trim(),
        source: 'preview-contact-form'
      });
      const feedback = byId('contactFeedback');
      if (feedback) {
        feedback.textContent = 'Saved in this browser. This preview did not send your note to DE LA BOSS OUTFITS — use the supplied phone numbers or WhatsApp for a real conversation.';
        feedback.className = 'form-feedback form-feedback--success';
        feedback.hidden = false;
        if (typeof feedback.scrollIntoView === 'function') {
          feedback.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
      DB.toast('Enquiry saved locally. No message was sent.', { type: 'success', duration: 5600 });
      form.reset();
    });

    const whatsapp = byId('contactWhatsApp');
    if (whatsapp) {
      whatsapp.addEventListener('click', function () {
        DB.openWhatsApp(composeWhatsApp());
      });
    }
  });
})();
