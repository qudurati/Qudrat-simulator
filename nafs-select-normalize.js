// NAFS display normalization
// Keep stored/internal values unchanged, but normalize labels shown to users.
(function () {
  'use strict';

  function normalizeText(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/القراءة/g, 'لغتي');
  }

  function normalizeElement(el) {
    if (!el || el.nodeType !== 1) return;

    // Normalize option labels while preserving their original values.
    if (el.tagName === 'OPTION') {
      el.textContent = normalizeText(el.textContent);
      return;
    }

    // Normalize common form labels/placeholders without changing stored values.
    if (el.hasAttribute && el.hasAttribute('placeholder')) {
      el.setAttribute('placeholder', normalizeText(el.getAttribute('placeholder')));
    }
    if (el.hasAttribute && el.hasAttribute('title')) {
      el.setAttribute('title', normalizeText(el.getAttribute('title')));
    }

    // Text nodes cover lists, cards, tables and generated report previews.
    Array.from(el.childNodes || []).forEach(function (node) {
      if (node.nodeType === 3 && node.nodeValue && node.nodeValue.indexOf('القراءة') !== -1) {
        node.nodeValue = normalizeText(node.nodeValue);
      }
    });

    if (el.querySelectorAll) {
      el.querySelectorAll('option').forEach(function (option) {
        option.textContent = normalizeText(option.textContent);
      });
    }
  }

  function normalizePage(root) {
    if (!root) return;
    if (root.nodeType === 1) normalizeElement(root);
    if (root.querySelectorAll) {
      root.querySelectorAll('*').forEach(normalizeElement);
    }
  }

  function start() {
    normalizePage(document.body);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 3 && node.nodeValue && node.nodeValue.indexOf('القراءة') !== -1) {
            node.nodeValue = normalizeText(node.nodeValue);
          } else if (node.nodeType === 1) {
            normalizePage(node);
          }
        });

        if (mutation.type === 'characterData' && mutation.target.nodeValue && mutation.target.nodeValue.indexOf('القراءة') !== -1) {
          mutation.target.nodeValue = normalizeText(mutation.target.nodeValue);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Expose formatter for report/PDF code that builds strings outside the DOM.
    window.nafsDisplaySubject = normalizeText;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();