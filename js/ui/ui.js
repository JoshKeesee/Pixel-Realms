const ui = {
	death: false,
	buttons: 0,
	curr: 0,
	selection: "ui-cancel",
	promptType: null,
	create() {
		this.toggled = false;
		this.death = false;
		this.createPopup();
		this.deathScreen = document.createElement("div");
		this.deathScreen.id = "death-screen";
		this.deathScreenText = document.createElement("div");
		this.deathScreenText.id = "death-screen-text";
		this.deathScreenText.innerText = "You died";
		this.deathScreen.appendChild(this.deathScreenText);
		this.deathScreenRespawn = this.createButton("Respawn", "death-screen-respawn", ui.hideDeathScreen);
		this.deathScreen.appendChild(this.deathScreenRespawn);
		this.return = this.createButton("Return to main menu", "death-screen-return", () => mainMenu.create());
		this.deathScreen.appendChild(this.return);
		this.add(this.deathScreen);
		this.switchButton(0, "0");
		this.fps = document.createElement("div");
		this.fps.id = "fps";
		this.fps.innerText = "-- FPS";
		this.add(this.fps);
		this.ping = document.createElement("div");
		this.ping.id = "ping";
		this.ping.innerText = "Ping --";
		this.add(this.ping);
		this.online = document.createElement("div");
		this.online.id = "online";
		this.add(this.online);
	},
	createPopup() {
		this.container = document.createElement("div");
		this.container.id = "ui-container";
		document.body.appendChild(this.container);
		this.popup = document.createElement("div");
		this.popup.id = "ui-popup";
		this.box = document.createElement("div");
		this.box.id = "ui-box";
		this.text = document.createElement("div");
		this.text.id = "ui-popup-text";
		this.popupBox = document.createElement("div");
		this.popupBox.id = "ui-popup-box";
		this.continue = ui.createButton("", "ui-continue", () => { }, false);
		this.cancel = ui.createButton("", "ui-cancel", () => { }, false);
		this.promptText = document.createElement("input");
		this.promptText.id = "ui-prompt-text";
		this.popupBox.appendChild(this.promptText);
		this.popupBox.appendChild(this.cancel);
		this.popupBox.appendChild(this.continue);
		this.box.appendChild(this.text);
		this.box.appendChild(this.popupBox);
		this.popup.appendChild(this.box);
		this.add(this.popup);
	},
	add(el) {
		this.container.appendChild(el);
	},
	confirm(t) {
		this.promptType = "confirm";
		return new Promise(res => {
			this.continue.innerText = "Yes";
			this.cancel.innerText = "No";
			this.showPopup();
			this.switchPromptButton(true);
			this.text.innerText = t;
			this.continue.onclick = () => { ui.hidePopup(); res(true) };
			this.cancel.onclick = () => { ui.hidePopup(); res(false) };
		});
	},
	prompt(t) {
		this.promptType = "prompt";
		return new Promise(res => {
			this.continue.innerText = "Ok";
			this.cancel.innerText = "Cancel";
			this.promptText.style.display = "block";
			this.showPopup();
			this.promptText.focus();
			this.promptText.value = "";
			this.text.innerText = t;
			this.continue.onclick = () => { ui.hidePopup(); res(ui.promptText.value) };
			this.cancel.onclick = () => { ui.hidePopup(); res(false) };
		});
	},
	showPopup() {
		this.toggled = true;
		this.popup.style.pointerEvents = "auto";
		this.popup.style.opacity = 1;
	},
	hidePopup() {
		this.toggled = false;
		this.popup.style.pointerEvents = "none";
		this.popup.style.opacity = 0;
		this.promptText.style.display = "none";
	},
	createButton(text, id, onclick = () => { }, b = true) {
		const button = document.createElement("button");
		button.id = id;
		button.innerText = text;
		button.onclick = onclick;
		if (b) button.className = "button-" + mainMenu.buttons;
		if (b) button.onmouseover = () => mainMenu.switchButton(0, button.className.replace("button-", ""));
		if (b) mainMenu.buttons++;
		return button;
	},
	switchButton(val, set) {
		this.curr += Number(val);
		if (set) this.curr = Number(set);
		if (this.curr >= this.buttons) this.curr = this.buttons - 1;
		if (this.curr < 0) this.curr = 0;
		for (let i = 0; i < this.buttons; i++) document.querySelector("#death-screen .button-" + i).style = "";
		document.querySelector("#death-screen .button-" + this.curr).style.transform = "translateY(-2px)";
		document.querySelector("#death-screen .button-" + this.curr).style.background = "rgba(0, 0, 100, 0.8)";
		document.querySelector("#death-screen .button-" + this.curr).style.borderColor = "rgb(0, 0, 255)";
		document.querySelector("#death-screen .button-" + this.curr).style.boxShadow = "0 4px 10px rgb(0, 0, 255)";
	},
	switchPromptButton(y) {
		ui.promptText.blur();
		const b = y ? ui.continue : ui.cancel;
		this.selection = b.id;
		ui.continue.style = "";
		ui.cancel.style = "";
		b.style.transform = "translateY(-2px)";
	},
	clickSelection() {
		const s = ui.promptType == "prompt" ? "ui-continue" : this.selection;
		document.getElementById(s).click();
	},
	click() {
		document.querySelector("#death-screen .button-" + this.curr).click();
	},
	showDeathScreen(p) {
		if (!p || ui.death || !ui.deathScreen) return;
		if (backpack.toggled) backpack.toggle();
		if (chat.toggled) chat.toggle();
		if (pause.toggled) pause.toggle();
		if (chest.toggled) chest.toggle();
		if (furnace.toggled) furnace.toggle();
		if (profile.toggled) profile.toggle();
		if (wardrobe.toggled) wardrobe.toggle();
		if (workbench.toggled) workbench.toggle();
		ui.death = true;
		ui.deathScreen.style.pointerEvents = "auto";
		ui.deathScreen.style.opacity = 1;
		ui.buttons = 2;
		ui.switchButton(0, "0");
	},
	hideDeathScreen() {
		if (!ui.death) return;
		ui.death = false;
		ui.deathScreen.style.pointerEvents = "none";
		ui.deathScreen.style.opacity = 0;
		player.respawn(players[myId]);
		ui.switchButton(0, "0");
	},
	showOnline() {
		ui.online.style.opacity = 1;
		ui.online.style.pointerEvents = "auto";
	},
	hideOnline() {
		if (!ui.online) return;
		ui.online.style.opacity = 0;
		ui.online.style.pointerEvents = "none";
	},
	updateOnlineSpots() {
		if (!ui.online) return;
		ui.online.innerHTML = "";
		Object.values(players).forEach((p, i) => {
			if (i > 5 * 4) return;
			const spot = document.createElement("div");
			spot.id = "spot";
			const spotText = document.createElement("div");
			spotText.id = "spot-text";
			spotText.innerText = p.name;
			const pingIcon = document.createElement("div");
			pingIcon.id = "ping-icon";
			const pi = p.ping > 150 ? 150 : p.ping;
			const maxPing = 200;
			const clampedPing = Math.min(pi, maxPing);
			const normalizedPing = clampedPing / maxPing;
			const imageIndex = Math.min(Math.floor(normalizedPing * 6), 6 - 1);
			pingIcon.style.backgroundPosition = -1 * imageIndex * 32 + "px";
			spot.appendChild(spotText);
			spot.appendChild(pingIcon);
			ui.online.appendChild(spot);
		});
	},
}