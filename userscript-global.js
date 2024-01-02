// ==UserScript==
// @name        Harvest Button for Basecamp (global)
// @version     1.0.1
// @updateURL   https://raw.githubusercontent.com/romainmenke/harvest-button-for-basecamp/main/userscript-global.js
// @downloadURL https://raw.githubusercontent.com/romainmenke/harvest-button-for-basecamp/main/userscript-global.js
// @description Add a Harvest Button to Basecamp ToDos. This doesn't isolate harvest from the page in iframes.
// @author      Romain Menke
// @include     https://basecamp.com/*
// @grant       none
// ==/UserScript==

class BasecampHelpers {
	constructor() {
		this.bind();
		this.init();
	}

	bind() {
		bcx.on('page:change', () => {
			console.info("BasecampHelpers: page changed");
			this.init();
		});
	}

	init() {
		this.addHarvestButtons();
		this.loadHarvest();
		this.stickyNotice();
	}

	addHarvestButtons() {
		$('li.todo:not(.has-harvest-button)').each(function () {
			var $this = $(this);
			var data_url = $this.attr('data-url');
			var permalink = 'https://basecamp.com' + $this.attr('data-url');
			var id = $this.attr('id').replace('todo_', '');
			var name = $this.find('.content_for_perma').first().text();
			var group_id = $this.attr('data-url').split('/')[3];

			var $harvestBtn = $('<span></span>');

			$harvestBtn.addClass('harvest-timer');
			$harvestBtn.attr('data-group', JSON.stringify({ "id": group_id }));
			$harvestBtn.attr('data-item', JSON.stringify({ "id": id, "name": name }));
			$harvestBtn.attr('data-permalink', permalink);

			$this.find('.content').prepend($harvestBtn);
			$this.addClass('has-harvest-button');
		});
	}

	loadHarvest() {
		window._harvestPlatformConfig = {
			"applicationName": "Basecamp"
		};

		$.getScript('https://platform.harvestapp.com/assets/platform.js');
	}

	stickyNotice() {
		let elNoticeOriginal = document.querySelector('.workspace_notice');
		let elNotice;

		let elStickyNotes = document.querySelectorAll('.workspace_notice.sticky');


		Array.from(elStickyNotes).forEach((el) => {
			document.body.removeChild(el);
		});

		if (elNoticeOriginal) {
			elNotice = elNoticeOriginal.cloneNode(true);
			elNotice.classList.add('sticky');
			document.body.appendChild(elNotice);

		} else {
			const templatePublicNotice = `<div id="publicize_toggle" data-behavior="expandable" class="workspace_notice mini public sticky">
    <div class="collapsed_content">
        <section>
            <p>The client can see all to-dos on this list</p>
        </section>
    </div>
</div>`;

			const elCopiedNotice = document.querySelector('.copied_notice');

			if (!!elCopiedNotice) {
				elCopiedNotice.insertAdjacentHTML('afterend', templatePublicNotice);

			} else {
				console.warn("BasecampHelpers: No notice found");

			}
		}

		elNotice = document.querySelector('.workspace_notice.sticky');

		function checkScrollPosition() {
			if (window.scrollY > 220) {
				elNotice.style.cssText = "position: fixed; top: 0; left: 50%; transform: translate(-50%, 0);";
			} else {
				elNotice.style.cssText = "position: relative; top: auto; left: auto; transform: none;";
			}

			window.requestAnimationFrame(checkScrollPosition);
		};

		if (!!elNotice) {
			window.requestAnimationFrame(checkScrollPosition);
		}
	}
}

new BasecampHelpers();
