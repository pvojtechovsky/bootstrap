/**
 * --------------------------------------------------------------------------
 * Bootstrap dom/selector-engine.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { isDisabled, isVisible, parseSelector, getRootElement } from '../util/index.js'

const getSelector = element => {
  let selector = element.getAttribute('data-bs-target')

  if (!selector || selector === '#') {
    let hrefAttribute = element.getAttribute('href')

    // The only valid content that could double as a selector are IDs or classes,
    // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
    // `document.querySelector` will rightfully complain it is invalid.
    // See https://github.com/twbs/bootstrap/issues/32273
    if (!hrefAttribute || (!hrefAttribute.includes('#') && !hrefAttribute.startsWith('.'))) {
      return null
    }

    // Just in case some CMS puts out a full URL with the anchor appended
    if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
      hrefAttribute = `#${hrefAttribute.split('#')[1]}`
    }

    selector = hrefAttribute && hrefAttribute !== '#' ? parseSelector(hrefAttribute.trim()) : null
  }

  return selector
}

const SelectorEngine = {
  find(selector, element) {
    // eslint-disable-next-line no-eq-null
    if (element == null) {
      console.log(new Error("rootElement must be provided"))
      element = document.documentElement
    }

    return [].concat(...element.querySelectorAll(selector))
  },

  findOne(selector, element) {
    // eslint-disable-next-line no-eq-null
    if (element == null) {
      console.log(new Error("rootElement must be provided"));
      element = document.documentElement;
    }

    return element.querySelector(selector)
  },

  children(element, selector) {
    return [].concat(...element.children).filter(child => child.matches(selector))
  },

  parents(element, selector) {
    const parents = []
    let ancestor = element.parentNode.closest(selector)

    while (ancestor) {
      parents.push(ancestor)
      ancestor = ancestor.parentNode.closest(selector)
    }

    return parents
  },

  prev(element, selector) {
    let previous = element.previousElementSibling

    while (previous) {
      if (previous.matches(selector)) {
        return [previous]
      }

      previous = previous.previousElementSibling
    }

    return []
  },
  // TODO: this is now unused; remove later along with prev()
  next(element, selector) {
    let next = element.nextElementSibling

    while (next) {
      if (next.matches(selector)) {
        return [next]
      }

      next = next.nextElementSibling
    }

    return []
  },

  focusableChildren(element) {
    const focusables = [
      'a',
      'button',
      'input',
      'textarea',
      'select',
      'details',
      '[tabindex]',
      '[contenteditable="true"]'
    ].map(selector => `${selector}:not([tabindex^="-"])`).join(',')

    return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el))
  },

  getSelectorFromElement(element) {
    const selector = getSelector(element)

    if (selector) {
      return SelectorEngine.findOne(selector, getRootElement(element)) ? selector : null
    }

    return null
  },

  getElementFromSelector(element) {
    const selector = getSelector(element)

    return selector ? SelectorEngine.findOne(selector, getRootElement(element)) : null
  },

  getMultipleElementsFromSelector(element) {
    const selector = getSelector(element)

    return selector ? SelectorEngine.find(selector, getRootElement(element)) : []
  }
}

export default SelectorEngine
