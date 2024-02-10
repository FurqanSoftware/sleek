// Copyright 2024 Furqan Software Ltd. All Rights Reserved.

import dom from '@toph/kernel.js/dom'

class TheadFly {
	constructor(el) {
		this.el = el
		this.init()
	}

	init() {
		this.cloneThead = this.el.cloneNode(true)
		this.table = this.el.parentNode
		this.cloneTable = document.createElement('table')
		this.cloneTable.classList = this.table.classList
		this.cloneTable.appendChild(this.cloneThead)
		dom.setStyles(this.cloneTable, {
			maxWidth: 'unset'
		})

		this.repositionBound = () => { this.reposition() }
		
		this.targetEl = this.table
		this.flyEl = document.createElement('div')
		this.flyEl.appendChild(this.cloneTable)
		dom.setStyles(this.flyEl, {
			display: 'none',
			position: 'fixed',
			borderBottom: '1px solid #e7ecf1',
			boxShadow: '0 .25rem .125rem rgba(47,53,59,.025)'
		})

		if (dom.hasClass(this.targetEl.parentNode, 'tablebox')) {
			this.targetEl = this.targetEl.parentNode
			dom.setStyles(this.flyEl, {
				overflowX: 'hidden'
			})
			dom.on(this.targetEl, 'scroll', this.repositionBound, { passive: true })
		}

		this.table.insertAdjacentElement('afterend', this.flyEl)

		dom.on(window, 'scroll', this.repositionBound, { passive: true })
		dom.on(window, 'resize', this.repositionBound)
		this.reposition()
	}

	destroy() {
		dom.off(this.targetEl, 'scroll', this.repositionBound)
		dom.off(window, 'scroll', this.repositionBound)
		dom.off(window, 'resize', this.repositionBound)
	}

	reposition() {
		const offset = parseInt(this.el.getAttribute('data-theadfly-offset') || '0')
		const elRect = this.el.getBoundingClientRect()
		const tableRect = this.table.getBoundingClientRect()
		if (elRect.top >= offset || tableRect.top+tableRect.height <= offset) {
			dom.setStyles(this.flyEl, {
				display: 'none'
			})
			return
		}
		dom.setStyles(this.flyEl, {
			top: `${Math.min(offset, tableRect.top+tableRect.height-offset-elRect.height)}px`,
			width: `${this.targetEl.clientWidth}px`,
			display: 'block',
			backgroundColor: 'white'
		})
		dom.setStyles(this.cloneTable, {
			width: `${dom.getWidth(this.table)}px`,
		})
		if (this.cloneThead.innerHTML !== this.el.innerHTML) this.cloneThead.innerHTML = this.el.innerHTML
		const ths = dom.$$('th', this.el)
		const cloneThs = dom.$$('th', this.cloneThead)
		for (let i = 0; i < ths.length; i++) {
			dom.setStyles(cloneThs[i], {
				width: `${dom.getWidth(ths[i])}px`
			})
		}
		this.flyEl.scrollTo(this.targetEl.scrollLeft, this.targetEl.scrollTop)
	}
}

export default TheadFly
