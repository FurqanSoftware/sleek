// Copyright 2024 Furqan Software Ltd. All Rights Reserved.

import fn from '@toph/kernel.js/fn'
import dom from '@toph/kernel.js/dom'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

class Modal {
	constructor(el, root = document.body) {
		this.el = el
		this.root = root
		this.attached = !!el.parentNode
		this._previousFocus = null

		el.setAttribute('role', 'dialog')
		el.setAttribute('aria-modal', 'true')
		el.setAttribute('tabindex', '-1')

		dom.on(el, 'click', event => {
			if (event.target != el && !dom.between(event.target, el, '[data-dismiss="modal"]')) return
			this.hide()
		})

		dom.on(el, 'keydown', event => {
			if (event.key !== 'Tab') return

			const focusable = [...el.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => el.offsetParent !== null)
			if (!focusable.length) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		})
	}

	show() {
		this._previousFocus = document.activeElement

		this.root.appendChild(this.el)

		dom.addClass(this.el, '-opening')
		fn.defer(() => dom.addClass(this.el, '-open'))
		const dialog = dom.$('.modal__dialog', this.el)
		dom.removeClass(dialog, 'animated', 'fadeOut', 'faster')
		dom.addClass(dialog, 'animated', 'fadeInDownSmall', 'faster')
		dom.once(dialog, 'animationend', () => dom.removeClass(dialog, '-opening', 'animated', 'fadeInDownSmall', 'faster'))

		blockScroll(this.root)

		const autofocus = dom.$('[data-autofocus="modal:open"]', this.el)
		if (autofocus) autofocus.focus()
		else this.el.focus()
	}

	hide() {
		const isLast = dom.$$('.modal.-open, .modal.-opening').length == 1

		dom.addClass(this.el, '-closing')
		const dialog = dom.$('.modal__dialog', this.el)
		dom.removeClass(dialog, 'animated', 'fadeInDownSmall', 'faster')
		dom.addClass(dialog, 'animated', 'fadeOut', 'faster')
		dom.once(dialog, 'animationend', () => {
			dom.removeClass(this.el, '-opening', '-open', '-closing')
			dom.removeClass(dialog, 'animated', 'fadeOut', 'faster')
			if (!this.attached) dom.detach(this.el)
			if (this._previousFocus) {
				this._previousFocus.focus()
				this._previousFocus = null
			}
		})

		if (isLast) unblockScroll(this.root)
	}
}

class Root {
	constructor(root = document.body) {
		this.root = root
		this.modals = new Map()

		dom.on(root, 'click', event => {
			const toggle = dom.between(event.target, root, '[data-toggle="modal"]')
			if (!toggle) return

			const el = dom.$(toggle.getAttribute('data-target'))
			if (!el) return

			this.makeOnce(el)

			const modal = this.modals.get(el)
			modal.show()
		})

		dom.on(document, 'keyup', event => {
			if (event.keyCode != 27) return
			const modals = dom.$$('.modal.-open')
			if (modals.length == 0) return
			const last = modals[modals.length-1]
			if (last) this.getOrMake(last).hide()
		})
	}

	makeOnce(el) {
		if (this.modals.has(el)) return
		const modal = new Modal(el)
		this.modals.set(el, modal)
	}

	getOrMake(el) {
		if (!this.modals.has(el)) this.makeOnce(el)
		return this.modals.get(el)
	}
}

const blockScroll = el => dom.addClass(el, 'modalroot', '-block')

const unblockScroll = el => dom.removeClass(el, 'modalroot', '-block')

Modal.Root = Root

export default Modal
