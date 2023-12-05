// ==UserScript==
// @name        Harvest Button for Basecamp
// @version     1.0.0
// @updateURL   https://raw.githubusercontent.com/romainmenke/harvest-button-for-basecamp/main/userscript.js
// @downloadURL https://raw.githubusercontent.com/romainmenke/harvest-button-for-basecamp/main/userscript.js
// @description Add a Harvest Button to Basecamp ToDos
// @author      Romain Menke
// @include     https://basecamp.com/*
// @grant       none
// ==/UserScript==

const channelId = 'a5b48350-8b05-478b-8f69-0671751a42b5';

class BasecampHelpers {
	constructor() {
		this.bind();
		this.init();
	}

	bind() {
		bcx.on('page:change', () => {
			console.info('BasecampHelpers: page changed');
			this.init();
		});
	}

	init() {
		this.addHarvestButtons();
		this.stickyNotice();
	}

	addHarvestButtons() {
		document.querySelectorAll('li.todo:not(.has-harvest-button)').forEach((el) => {
			var data_url = el.getAttribute('data-url') ?? '';
			var permalink = 'https://basecamp.com' + data_url;
			var id = (el.getAttribute('id') ?? '').replace('todo_', '');
			var name = el.querySelector('.content_for_perma').textContent;
			var group_id = data_url.split('/')[3];

			var iframeURL = new URL('https://www.romainmenke.com/harvest-button-for-basecamp/');

			iframeURL.hash = window.btoa(window.encodeURIComponent(JSON.stringify({
				permalink: permalink,
				group: { 'id': group_id },
				item: { 'id': id, 'name': name },
				applicationName: 'Basecamp',
			})));

			var iframe = document.createElement('iframe');
			iframe.setAttribute('data-harvest-button', '');
			iframe.setAttribute('src', iframeURL.href);
			iframe.setAttribute('loading', 'lazy');
			iframe.setAttribute('width', '20');
			iframe.setAttribute('height', '20');
			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('style', 'transform: translateY(3px);');

			iframe.onload = () => {
				iframe.contentWindow.postMessage({
					channelId: channelId,
				}, 'https://www.romainmenke.com');

				iframe.onload = null;
			};

			window.addEventListener('message', (event) => {
				if (event.data?.channelId !== channelId) {
					return;
				}

				if (event.source !== iframe.contentWindow) {
					return;
				}

				if (event.data?.event !== 'resize') {
					return;
				}

				if (event.data?.resize?.mode === 'fullscreen') {
					iframe.setAttribute(
						'style',
						`
							position: fixed;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							z-index: 999999;
						`,
					);
					return;
				}

				if (event.data?.resize?.mode === 'button') {
					iframe.setAttribute('style', 'transform: translateY(3px);');
					return;
				}
			}, false);

			el.querySelector('.content').prepend(iframe);
			el.classList.add('has-harvest-button');
		});
	}

	stickyNotice() {
		let elNoticeOriginal = document.querySelector('.workspace_notice');
		let elNotice;

		let elStickyNotes = document.querySelectorAll('.workspace_notice.sticky');


		elStickyNotes.forEach((el) => {
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

			if (elCopiedNotice) {
				elCopiedNotice.insertAdjacentHTML('afterend', templatePublicNotice);

			} else {
				console.warn('BasecampHelpers: No notice found');

			}
		}

		elNotice = document.querySelector('.workspace_notice.sticky');

		function checkScrollPosition() {
			if (window.scrollY > 220) {
				elNotice.style.cssText = 'position: fixed; top: 0; left: 50%; transform: translate(-50%, 0);';
			} else {
				elNotice.style.cssText = 'position: relative; top: auto; left: auto; transform: none;';
			}

			window.requestAnimationFrame(checkScrollPosition);
		}

		if (elNotice) {
			window.requestAnimationFrame(checkScrollPosition);
		}
	}
}

new BasecampHelpers();
