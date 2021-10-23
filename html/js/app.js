(function () {
	let MenuTpl = `
		<div id="menu_{{_namespace}}_{{_name}}" class="dialog {{#isBig}}big{{/isBig}}">
			<div class="head">
				<span>{{title}}</span>
				<div class="head_bg"></div>
			</div>
			<div class="dialog-container">
				<input type="text" name="value" id="inputText" placeholder="{{title}}" />
				<button type="button" name="cancel">
					<span>Cancel</span>
				</button>
				<button type="button" name="submit">
					<span>Submit</span>
				</button>
			</div>
			<div class="dialog_bg"></div>
		</div>`;

	window.RDX_MENU = {};
	RDX_MENU.ResourceName = 'rdx_menu_dialog';
	RDX_MENU.opened = {};
	RDX_MENU.focus = [];
	RDX_MENU.pos = {};

	RDX_MENU.open = function (namespace, name, data) {
		if (typeof RDX_MENU.opened[namespace] == 'undefined') {
			RDX_MENU.opened[namespace] = {};
		}

		if (typeof RDX_MENU.opened[namespace][name] != 'undefined') {
			RDX_MENU.close(namespace, name);
		}

		if (typeof RDX_MENU.pos[namespace] == 'undefined') {
			RDX_MENU.pos[namespace] = {};
		}

		if (typeof data.type == 'undefined') {
			data.type = 'default';
		}

		if (typeof data.align == 'undefined') {
			data.align = 'top-left';
		}

		data._index = RDX_MENU.focus.length;
		data._namespace = namespace;
		data._name = name;

		RDX_MENU.opened[namespace][name] = data;
		RDX_MENU.pos[namespace][name] = 0;

		RDX_MENU.focus.push({
			namespace: namespace,
			name: name
		});

		document.onkeyup = function (key) {
			if (key.which == 27) { // Escape key
				SendMessage(RDX_MENU.ResourceName, 'menu_cancel', data);
			} else if (key.which == 13) { // Enter key
				SendMessage(RDX_MENU.ResourceName, 'menu_submit', data);
			}
		};

		RDX_MENU.render();
	};

	RDX_MENU.close = function (namespace, name) {
		delete RDX_MENU.opened[namespace][name];

		for (let i = 0; i < RDX_MENU.focus.length; i++) {
			if (RDX_MENU.focus[i].namespace == namespace && RDX_MENU.focus[i].name == name) {
				RDX_MENU.focus.splice(i, 1);
				break;
			}
		}

		RDX_MENU.render();
	};

	RDX_MENU.render = function () {
		let menuContainer = $('#menus')[0];
		$(menuContainer).find('button[name="submit"]').unbind('click');
		$(menuContainer).find('button[name="cancel"]').unbind('click');
		$(menuContainer).find('[name="value"]').unbind('input propertychange');
		menuContainer.innerHTML = '';
		$(menuContainer).hide();

		for (let namespace in RDX_MENU.opened) {
			for (let name in RDX_MENU.opened[namespace]) {
				let menuData = RDX_MENU.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));

				switch (menuData.type) {

					case 'default': {
						view.isDefault = true;
						break;
					}

					case 'big': {
						view.isBig = true;
						break;
					}

					default: break;
				}

				let menu = $(Mustache.render(MenuTpl, view))[0];

				$(menu).css('z-index', 1000 + view._index);

				$(menu).find('button[name="submit"]').click(function () {
					RDX_MENU.submit(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				$(menu).find('button[name="cancel"]').click(function () {
					RDX_MENU.cancel(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				$(menu).find('[name="value"]').bind('input propertychange', function () {
					this.data.value = $(menu).find('[name="value"]').val();
					RDX_MENU.change(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				if (typeof menuData.value != 'undefined') {
					$(menu).find('[name="value"]').val(menuData.value);
				}

				menuContainer.appendChild(menu);
			}
		}

		$(menuContainer).show();
		$("#inputText").focus();
	};

	RDX_MENU.submit = function (namespace, name, data) {
		SendMessage(RDX_MENU.ResourceName, 'menu_submit', data);
	};

	RDX_MENU.cancel = function (namespace, name, data) {
		SendMessage(RDX_MENU.ResourceName, 'menu_cancel', data);
	};

	RDX_MENU.change = function (namespace, name, data) {
		SendMessage(RDX_MENU.ResourceName, 'menu_change', data);
	};

	RDX_MENU.getFocused = function () {
		return RDX_MENU.focus[RDX_MENU.focus.length - 1];
	};

	window.onData = (data) => {
		switch (data.action) {

			case 'openMenu': {
				RDX_MENU.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenu': {
				RDX_MENU.close(data.namespace, data.name);
				break;
			}
		}
	};

	window.onload = function (e) {
		window.addEventListener('message', (event) => {
			onData(event.data);
		});
	};

})();
