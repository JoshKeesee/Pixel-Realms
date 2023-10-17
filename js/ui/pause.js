const pause = {
	toggled: false,
	buttons: 0,
	curr: 0,
	create() {
		this.buttons = 0;
		this.toggled = false;
		this.pause = document.createElement("div");
		this.pause.id = "pause";
		ui.add(this.pause);
		this.icon = document.createElement("div");
		this.icon.id = "pause-icon";
		this.icon.onclick = pause.toggle;
		for (let i = 0; i < 3; i++) this.icon.appendChild(this.createDot());
		this.add(this.icon);
		this.container = document.createElement("div");
		this.container.id = "pause-container";
		ui.add(this.container);
		this.container.appendChild(this.createButton("Return to main menu", "pause-button", () => mainMenu.create()));
		this.container.appendChild(this.createButton("Controls: right handed", "pause-button", e => players[myId].controls == "right" ? players[myId].controls = "left" : players[myId].controls = "right"));
		if ((admins[user.id] && online) || devs[user.name]) this.container.appendChild(this.createButton("Admin Tutorial", "pause-button", () => { pause.toggle(); runTutorial() }));
		this.switchButton(0, "0");
	},
	add(el) {
		this.pause.appendChild(el);
	},
	createDot() {
		const dot = document.createElement("div");
		dot.id = "pause-dot";
		return dot;
	},
	createButton(text, id, func = () => { }) {
		const button = document.createElement("div");
		button.id = id;
		button.innerText = text;
		button.onclick = func;
		button.className = "button-" + this.buttons;
		button.onmouseover = () => pause.switchButton(0, button.className.replace("button-", ""));
		pause.buttons++;
		return button;
	},
	switchButton(val, set) {
		this.curr += Number(val);
		if (set) this.curr = Number(set);
		if (this.curr >= this.buttons) this.curr = this.buttons - 1;
		if (this.curr < 0) this.curr = 0;
		for (let i = 0; i < this.buttons; i++) document.querySelector("#pause-container .button-" + i).style = "";
		document.querySelector("#pause-container .button-" + this.curr).style.transform = "translateY(-2px)";
		document.querySelector("#pause-container .button-" + this.curr).style.background = "rgba(0, 0, 50, 0.7)";
		document.querySelector("#pause-container .button-" + this.curr).style.borderColor = "rgb(0, 0, 100)";
		document.querySelector("#pause-container .button-" + this.curr).style.boxShadow = "0 4px 10px rgb(0, 0, 100)";
	},
	click() {
		if (document.querySelector("#pause-container .button-" + this.curr).innerText == "Return to main menu") this.buttons = this.curr = 0;
		document.querySelector("#pause-container .button-" + this.curr).click();
	},
	toggle() {
		if (backpack.toggled || chat.toggled || players[myId].chest || furnace.toggled || profile.toggled || text.toggled || ui.toggled || wardrobe.toggled || workbench.toggled || ui.death) return;
		if (camera.setFade == 0) {
			camera.fadeTo(0.5);
			pause.container.style.opacity = 1;
			pause.container.style.pointerEvents = "auto";
			pause.toggled = true;
		} else {
			camera.fadeTo(0);
			pause.container.style.opacity = 0;
			pause.container.style.pointerEvents = "none";
			pause.toggled = false;
		}
		pause.switchButton(0, "0");
	},
};