// Copyright 2024 Furqan Software Ltd. All Rights Reserved.

import dom from '@toph/kernel.js/dom'
import fn from '@toph/kernel.js/fn'
import http from '@toph/kernel.js/http'

class Dropdown {
	constructor(el, root) {
		this.el = el
		this.root = root
		if (this.el.dataset.dropdown) this.settings = JSON.parse(this.el.dataset.dropdown)
		else this.settings = {}
		this.init()
	}

	init() {
		if (dom.hasClass(this.el, '-select')) this.initSelect()
		if (this.settings.search) this.initSearch()

		const toggle = dom.$('.dropdown__toggle', this.el)
		toggle.setAttribute('tabindex', '0')
	}

	initSelect() {
		const menu = dom.$('.dropdown__menu', this.el)
		menu.innerHTML = ''

		const select = dom.$('select', this.el)

		const selectOption = (option, item) => {
			const value = option.getAttribute('value')
			select.value = value

			this.renderOptionSelected(option)

			select.dispatchEvent(new Event('change', {
				bubbles: true
			}))

			for (const other of dom.$$('.-active', menu)) dom.removeClass(other, '-active')
			dom.addClass(item, '-active')
		}

		const addOption = (option) => {
			const item = this.makeOptionItem(option)

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

	initSearch() {
		const toggle = dom.$('.dropdown__toggle', this.el)
		const search = document.createElement('div')
		dom.addClass(search, 'dropdown__search')
		search.innerHTML = '<input class="form__field" placeholder="Search">'
		this.searchEl = search

		const applySearch = fn.debounce((...args) => this.applySearch(...args), 375)

		const input = dom.$('input', search)
		dom.on(input, 'keydown', event => {
			if (event.keyCode !== 13) return
			event.preventDefault()
		})
		dom.on(input, 'keyup', event => applySearch(input.value))
	}

	applySearch(query) {
		if (!query) return
		if (this.searchXhr) {
			this.searchXhr.abort()
			delete this.searchXhr
		}
		const searchOptions = {}
		if (this.root && this.root.searchHTTPHeaders) searchOptions.headers = this.root.searchHTTPHeaders
		this.searchXhr = http.get(`${this.settings.search.url}${this.settings.search.url.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`, searchOptions, (err, data) => {
			if (err) {
				console.error(err)
				return
			}

			const items = JSON.parse(data)

			const menu = dom.$('.dropdown__menu', this.el)
			for (const el of dom.$$('.dropdown__item', menu)) dom.detach(el)

			const addItem = (data) => {
				const {label, value, ...rest} = data

				const item = this.makeItem(data)
				menu.appendChild(item)

				if (dom.hasClass(this.el, '-select')) {
					const select = dom.$('select', this.el)	
					dom.on(item, 'click', () => {
						select.innerHTML = ''

						const option = document.createElement('option')
						for (const k of Object.keys(rest)) option.setAttribute(`data-${k}`, rest[k])
						option.setAttribute('value', value)
						option.setAttribute('selected', true)
						dom.setText(option, label)
						select.appendChild(option)

						this.renderSelected(data)
					})
				}
			}

			addItem({empty: 'true', label: 'None'})
			for (const item of items) addItem({...item, label: item.text, value: item.id})

			this.reposition()
		})
	}

	renderSelected(data) {
		const toggle = dom.$('.dropdown__toggle', this.el)
		
		if (data.empty == 'true') {
			toggle.innerHTML = this.settings.placeholder || ''
			return
		}

		const tpl = this.settings.selectedTemplate || '%{label}'
		toggle.innerHTML = this.executeTemplate(tpl, data)
	}

	renderOptionSelected(option) {
		const data = this.extractOptionData(option)
		this.renderSelected(data)
	}

	makeItem(data) {
		const item = document.createElement('a')
		dom.addClass(item, 'dropdown__item', '-link')
		item.setAttribute('href', 'javascript:;')
		item.setAttribute('tabindex', '0')

		const tpl = (data.empty != 'true' ? this.settings.itemTemplate : this.settings.emptyItemTemplate) || '%{label}'
		item.innerHTML = this.executeTemplate(tpl, data)

		if (this.settings.navigate && !data.empty) item.setAttribute('href', this.executeTemplate(this.settings.navigate.urlTemplate, data))

		return item
	}

	makeOptionItem(option) {
		const data = this.extractOptionData(option)
		return this.makeItem(data)
	}

	extractOptionData(option) {
		let data = {}
		const {extra, empty} = option.dataset
		if (extra) data = {...data, ...JSON.parse(extra)}
		if (empty) data = {...data, empty}
		data = {
			...data,
			label: dom.getText(option),
			value: option.getAttribute('value')
		}
		return data
	}

	executeTemplate(tpl, data) {
		if (typeof tpl === 'function') return tpl(data)
		if (tpl.match(/^\*[a-zA-Z]+$/)) return this.executeTemplate(this.root.templates[tpl.substr(1)], data)
		return tpl.replace(/%\{([a-z]+)\}/g, (match, key) => data[key])
	}

	open() {
		if (dom.hasClass(this.el, '-open')) return

		dom.addClass(this.el, '-open')

		const menu = dom.$('.dropdown__menu', this.el)
		if (menu) {
			dom.addClass(menu, 'animated', 'fadeInUpSmallest', 'fastest')
			dom.once(menu, 'animationend', () => { dom.removeClass(menu, 'animated', 'fadeInUpSmallest', 'fastest') })
			const active = dom.$('.dropdown__item.-active', menu)
			if (active) {
				const top = Math.max(0, Math.floor(active.offsetTop - dom.getHeight(menu)/3))
				menu.scrollTo({
					top,
					behavior: 'instant'
				})
			}
		}

		const search = this.searchEl
		if (search) {
			if (dom.hasClass(this.el, '-select')) {
				const toggle = dom.$('.dropdown__toggle', this.el)
				dom.addClass(toggle, 'hidden')
				toggle.insertAdjacentElement('afterend', search)
			} else {
				const menu = dom.$('.dropdown__menu', this.el)
				menu.insertBefore(search, menu.firstChild)
			}
			const input = dom.$('input', search)
			input.focus()
		}

		this.reposition()
	}

	close() {
		if (!dom.hasClass(this.el, '-open')) return
		const menu = dom.$('.dropdown__menu', this.el)
		if (!menu) {
			dom.removeClass(this.el, '-open')
			return
		}
		const search = dom.$('.dropdown__search', this.el)
		if (this.searchEl) {
			const toggle = dom.$('.dropdown__toggle', this.el)
			dom.detach(search)
			dom.removeClass(toggle, 'hidden')
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
			} else if (pos.left+menuWidth < document.documentElement.clientWidth) {
				top = `${elHeight}px`
				right = 'auto'
				left = '1rem'
			} else {
				left = `-${pos.left}px`
				right = 'auto'
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
	constructor(root = document.body, options) {
		this.root = root
		this.dropdowns = new Map()
		this.templates = options.templates || {}
		this.searchHTTPHeaders = options.searchHTTPHeaders || {}

		dom.on(root, 'click', event => {
			const el = dom.between(event.target, root, '.dropdown')
			if (!el) {
				this.closeAll()
				return
			}

			this.makeOnce(el)

			const search = dom.between(event.target, root, '.dropdown__search')
			if (search) return

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
		const dropdown = new Dropdown(el, this)
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
