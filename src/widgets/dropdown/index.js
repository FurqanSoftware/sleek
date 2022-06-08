// Copyright 2022 Furqan Software Ltd. All rights reserved.

import dom from '@toph/kernel.js/dom'

class Dropdown {
	constructor(el) {
		this.el = el
		this.init()
	}

	init() {
		if (dom.hasClass(this.el, '-select')) this.initSelect(this.el)

		const toggle = dom.$('.dropdown__toggle', this.el)
		toggle.setAttribute('tabindex', '0')
	}

	initSelect() {
		let settings = {}
		if (this.el.dataset.dropdown) settings = JSON.parse(this.el.dataset.dropdown)

		const menu = dom.$('.dropdown__menu', this.el)
		menu.innerHTML = ''

		const select = dom.$('select', this.el)

		const selectOption = (option, item) => {
			const value = option.getAttribute('value')
			select.value = value

			renderSelected(option)

			select.dispatchEvent(new Event('change', {
				bubbles: true
			}))

			for (const other of dom.$$('.-active', menu)) dom.removeClass(other, '-active')
			dom.addClass(item, '-active')
		}

		const renderSelected = (option) => {
			const toggle = dom.$('.dropdown__toggle', this.el)
			
			if (option.dataset.empty == 'true') {
				toggle.innerHTML = settings.placeholder || ''
				return
			}

			const tpl = settings.selectedTemplate || '%{label}'
			const dataset = {
				...option.dataset,
				label: dom.getText(option),
				value: option.getAttribute('value')
			}

			toggle.innerHTML = tpl.replace(/%\{([a-z]+)\}/g, (match, key) => dataset[key])
		}

		const addOption = (option) => {
			const item = document.createElement('a')
			dom.addClass(item, 'dropdown__item', '-link')
			item.setAttribute('href', 'javascript:;')
			item.setAttribute('tabindex', '0')
			
			const tpl = settings.itemTemplate || '%{label}'
			const dataset = {
				...option.dataset,
				label: dom.getText(option),
				value: option.getAttribute('value')
			}
			item.innerHTML = tpl.replace(/%\{([a-z]+)\}/g, (match, key) => dataset[key])

			menu.appendChild(item)

			dom.on(item, 'click', () => selectOption(option, item))

			if (option.value == select.value) selectOption(option, item)
		}

		for (const child of select.childNodes) {
			switch (child.tagName) {
				case 'OPTGROUP':
					const head = document.createElement('div')
					dom.addClass(head, 'dropdown__head')
					dom.setText(head, child.getAttribute('label'))
					menu.appendChild(head)

					for (const option of dom.$$('option', child)) addOption(option)

					const divider = document.createElement('div')
					dom.addClass(divider, 'dropdown__divider')
					menu.appendChild(divider)
					break

				case 'OPTION':
					addOption(child)
					break
			}
		}
	}

	open() {
		if (dom.hasClass(this.el, '-open')) return
		dom.addClass(this.el, '-open')
		const menu = dom.$('.dropdown__menu', this.el)
		if (menu) {
			this.reposition()
			dom.addClass(menu, 'animated', 'fadeInUpSmallest', 'fastest')
			dom.once(menu, 'animationend', () => { dom.removeClass(menu, 'animated', 'fadeInUpSmallest', 'fastest') })
		}
	}

	close() {
		if (!dom.hasClass(this.el, '-open')) return
		const menu = dom.$('.dropdown__menu', this.el)
		if (!menu) {
			dom.removeClass(this.el, '-open')
			return
		}
		dom.addClass(menu, 'animated', 'fadeOutUpSmall', 'fastest')
		dom.once(menu, 'animationend', () => {
			dom.removeClass(this.el, '-open')
			dom.removeClass(menu, 'animated', 'fadeOutUpSmall', 'fastest')
		})
	}

	refresh() {
		if (dom.hasClass(this.el, '-select')) this.initSelect()
	}

	reposition() {
		const menu = dom.$('.dropdown__menu', this.el)
		if (dom.hasClass(menu, '-left') || dom.hasClass(menu, '-right')) return
		if (dom.hasClass(this.el, '-select') || !dom.closest(menu.parentNode, '.dropdown__menu')) this.repositionY()
		if (dom.closest(menu.parentNode, '.dropdown__menu')) this.repositionXY()
	}

	repositionY() {
		const menu = dom.$('.dropdown__menu', this.el)
		dom.setStyles(menu, {
			height: 'auto'
		})
		const pos = this.el.getBoundingClientRect()
		if (pos.bottom+dom.getHeight(menu) < window.innerHeight) {
			// Fits below
			dom.setStyles(menu, {
				top: '100%',
				bottom: 'auto'
			})
		} else if (dom.getHeight(menu) < pos.top) {
			// Fits above
			dom.setStyles(menu, {
				top: 'auto',
				bottom: '100%'
			})
		} else if (window.innerHeight - pos.bottom > pos.top) {
			// More space below
			dom.setStyles(menu, {
				top: '100%',
				bottom: 'auto',
				height: Math.floor((window.innerHeight - pos.bottom)/window.innerHeight*100) + 'vh'
			})
		} else {
			// Assume more space above
			dom.setStyles(menu, {
				top: 'auto',
				bottom: '100%',
				height: Math.floor(pos.top/window.innerHeight*100) + 'vh'
			})
		}
	}

	repositionXY() {
		const menu = dom.$('.dropdown__menu', this.el)
		const pos = this.el.getBoundingClientRect()
		const elWidth = dom.getWidth(this.el)
		const elHeight = dom.getHeight(this.el)
		const menuWidth = dom.getWidth(menu)
		const menuHeight = dom.getHeight(menu)
		let top = '0px'
		let bottom = 'auto'
		let right = 'auto'
		let left = '100%'
		if (pos.left+elWidth+menuWidth > document.documentElement.clientWidth) {
			if (pos.left > menuWidth) {
				[left, right] = [right, left]
			} else {
				top = `${elHeight}px`
				right = 'auto'
				left = '1rem'
			}
		}
		if (pos.top+menuHeight > document.documentElement.clientHeight) {
			[top, bottom] = [bottom, top]
		}
		dom.setStyles(menu, {
			top,
			right,
			bottom,
			left
		})
	}

	isChildOf(other) {
		let target = this.el
		while (target && target.parentNode) {
			if (target.parentNode == other.el) return true;
			target = target.parentNode;
		}
		return false
	}
}

class Root {
	constructor(root = document.body) {
		this.root = root
		this.dropdowns = new Map()

		dom.on(root, 'click', event => {
			const el = dom.between(event.target, root, '.dropdown')
			if (!el) {
				this.closeAll()
				return
			}

			this.makeOnce(el)

			const toggle = dom.between(event.target, root, '.dropdown__toggle')
			if (!toggle) {
				this.closeAll()
				return
			}

			const dropdown = this.dropdowns.get(el)
			this.closeOthers(dropdown)
			if (!dom.hasClass(dropdown.el, '-open')) dropdown.open()
			else dropdown.close()
		})

		for (const el of dom.$$('.dropdown.-select', root)) this.makeOnce(el)
	}

	makeOnce(el) {
		if (this.dropdowns.has(el)) return
		const dropdown = new Dropdown(el)
		this.dropdowns.set(el, dropdown)
	}

	getOrMake(el) {
		if (!this.dropdowns.has(el)) this.makeOnce(el)
		return this.dropdowns.get(el)
	}

	closeOthers(dropdown) {
		this.dropdowns.forEach(other => {
			if (dom.hasClass(other.el, '-open') && dropdown != other && !dropdown.isChildOf(other)) other.close()
		})
	}

	closeAll() {
		this.dropdowns.forEach(dropdown => dropdown.close())
	}
}

Dropdown.Root = Root

export default Dropdown
