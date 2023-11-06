const mainMenu = {
	buttons: 0,
	curr: 0,
	cancel: false,
	r: false,
	cancelLoad: false,
	create(n) {
		if (document.pointerLockElement == ctx.canvas) document.exitPointerLock();
		this.r = false;
		mainMenu.curr = 0;
		mainMenu.buttons = 0;
		document.body.querySelectorAll("div").forEach(e => e.remove());
		readyToAnimate = false;
		tutorial = false;
		imagesLoaded = 0;
		Object.keys(images).forEach(i => delete images[i]);
		pause.toggled = false;
		ui.death = false;
		camera.fadeTo(0);
		stopTrack();
		this.mainMenu = document.createElement("div");
		this.mainMenu.id = "main-menu";
		this.mainMenu.style.opacity = 0;
		document.body.appendChild(this.mainMenu);
		this.container = document.createElement("div");
		this.container.id = "container";
		setTimeout(() => ui.container ? ui.container.remove() : "", 400);
		this.add(this.container);
		this.sideContainer = document.createElement("div");
		this.sideContainer.id = "side-container";
		this.container.appendChild(this.sideContainer);
		particles.removeAll();
		particles.add(100);
		particles.addTo(this.container);
		this.gameTitle = document.createElement("div");
		this.gameTitle.id = "game-title";
		this.gameIcon = document.createElement("img");
		this.gameIcon.id = "game-icon";
		this.gameIcon.src = "icon.png";
		this.gameIcon.onload = () => setTimeout(() => mainMenu.mainMenu.style.opacity = 1, 100);
		this.gameText = document.createElement("div");
		this.gameText.id = "game-text";
		this.gameTitle.appendChild(this.gameIcon);
		this.gameTitle.appendChild(this.gameText);
		this.rooms = document.createElement("div");
		this.rooms.id = "rooms";
		this.rooms.style.opacity = 0;
		this.roomList = document.createElement("div");
		this.roomList.id = "room-list";
		this.container.appendChild(this.rooms);
		this.loading = document.createElement("div");
		this.loading.id = "loading";
		this.createLoading(3);
		this.add(this.loading);
		this.notification = document.createElement("div");
		this.notification.id = "notification";
		this.add(this.notification);
		if (n) this.notify(n, "red", 5000);
		this.backToMainMenu();
		setTimeout(() => this.ready = true, 100);
		mainMenu.cancel = true;
	},
	add(el) {
		this.mainMenu.appendChild(el);
	},
	createButton(text, id, onclick = () => { }, b = true) {
		const button = document.createElement("button");
		button.id = id;
		button.innerHTML = text;
		button.onclick = onclick;
		if (b) button.className = "button-" + mainMenu.buttons;
		if (b) button.onmouseover = () => mainMenu.switchButton(0, button.className.replace("button-", ""), false);
		if (b) mainMenu.buttons++;
		return button;
	},
	createLoading(num) {
		for (let i = 0; i < num; i++) {
			const img = document.createElement("img");
			img.src = "icon.png";
			this.loading.appendChild(img);
		};
	},
	switchButton(val, set, scroll = true) {
		if (mainMenu.r && mainMenu.privateInput) mainMenu.privateInput.blur();
		this.curr += Number(val);
		if (set) this.curr = Number(set);
		if (this.curr >= this.buttons) this.curr = this.buttons - 1;
		if (this.curr < 0) this.curr = 0;
		let selector = "#main-menu .button-";
		if (ui.death) selector = "#death-screen .button-";
		for (let i = 0; i < this.buttons; i++) document.querySelector(selector + i).style = "";
		document.querySelector(selector + this.curr).style.transform = "translateY(-2px)";
		if (mainMenu.r && this.curr > 2 && scroll) document.querySelector(selector + this.curr).parentElement.scrollIntoView();
		else if (mainMenu.r && scroll) mainMenu.roomList.scrollTop = "0px";
		const d = document.querySelector(selector + this.curr).id == "delete-room";
		if (mainMenu.r && this.curr != 0) return document.querySelector(selector + this.curr).style.background = d ? "rgb(250, 0, 0)" : "rgb(0, 200, 0)";
		document.querySelector(selector + this.curr).style.background = "rgba(0, 0, 100, 0.8)";
		document.querySelector(selector + this.curr).style.borderColor = "rgb(0, 0, 255)";
		document.querySelector(selector + this.curr).style.boxShadow = "0 4px 10px rgb(0, 0, 255)";
	},
	click() {
		document.querySelector("#main-menu .button-" + mainMenu.curr).click();
		if (!this.r && this.curr != 3 && this.curr != 2) this.buttons = this.curr = 0;
	},
	notify(text, color = "white", delay = 3000) {
		this.notification.style.color = color;
		this.notification.innerText = text;
		this.notification.style.opacity = 1;
		setTimeout(() => this.notification.style.opacity = 0, delay);
	},
	async joinRoom(id) {
		if (!id) return;
		const rooms = await mainMenu.getRooms();
		if (!rooms[id]) return mainMenu.notify("Couldn't find a room with that id.", "red", 5000);
		if (banned == id) return mainMenu.notify("You are banned from this room.", "red", 5000);
		if (getUser()) {
			await waitForConnect();
			await waitForUser();
			const isBanned = await checkBan(id);
			if (isBanned) banned = id;
			if (isBanned) return mainMenu.notify("You are banned from this room.", "red", 5000);
		}
		mainMenu.privateInput.blur();
		mainMenu.play(true, id);
		await waitForConnect();
		socket.emit("join room", id);
	},
	async deleteRoom(id) {
		if (!id) return;
		ui.createPopup();
		const confirm = await ui.confirm("Are you sure you want to delete this room?");
		if (ui.container) ui.container.remove();
		if (!confirm) return;
		const rooms = await mainMenu.getRooms();
		if (!rooms[id]) return mainMenu.notify("Couldn't find a room with that id.", "red", 5000);
		if (getUser()) {
			await waitForConnect();
			await waitForUser();
		} else return mainMenu.notify("You must be logged in to delete a room.", "red", 5000);
		socket.emit("delete room", id, () => mainMenu.showRooms());
	},
	async createRoom(options) {
		if (!getUser() || !options.name || !options) return;
		mainMenu.play(true);
		await waitForConnect();
		await waitForUser();
		tutorial = true;
		socket.emit("create room", options);
	},
	async loadRooms() {
		const rooms = await mainMenu.getRooms();
		if (mainMenu.roomsContainer) mainMenu.roomsContainer.remove();
		if (mainMenu.privateRoom) mainMenu.privateRoom.remove();
		mainMenu.buttons = 0;
		mainMenu.container.appendChild(mainMenu.createButton("Back", "back", () => mainMenu.backToMainMenu()));
		mainMenu.roomsContainer = document.createElement("div");
		mainMenu.roomsContainer.id = "rooms-container";
		mainMenu.privateRoom = document.createElement("div");
		mainMenu.privateRoom.id = "private-room";
		mainMenu.privateInput = document.createElement("input");
		mainMenu.privateInput.id = "private-input";
		mainMenu.privateInput.placeholder = "Enter a join code...";
		mainMenu.privateInput.type = "text";
		mainMenu.privateJoin = mainMenu.createButton("Join", "join-room", () => mainMenu.joinRoom(mainMenu.privateInput.value));
		mainMenu.privateRoom.appendChild(mainMenu.privateInput);
		mainMenu.privateRoom.appendChild(mainMenu.privateJoin);
		const myRooms = [];
		Object.keys(rooms).forEach(k => (rooms[k].creator == user.name) ? myRooms.push(k) : "");
		if (typeof user.id == "number") mainMenu.newRoom = mainMenu.createButton("Create Room (" + myRooms.length + "/3)", "join-room", async () => {
			if (myRooms.length >= 3) return mainMenu.notify("You can't exceed the max limit for rooms.");
			ui.createPopup();
			mainMenu.ready = false;
			const name = await ui.prompt("What's the room name?");
			if (!name) {
				mainMenu.ready = true;
				if (ui.container) ui.container.remove();
				return;
			}
			if (Object.values(rooms).some(r => r.name.toLowerCase().replaceAll(" ", "") == name.toLowerCase().replaceAll(" ", ""))) {
				mainMenu.ready = true;
				if (ui.container) ui.container.remove();
				mainMenu.notify(`There is already a room named "${name}".`);
				return;
			}
			const defaultMap = await ui.confirm("Do you want to use the default map?");
			const public = await ui.confirm("Is this room public?");
			const teamMap = await ui.confirm("Do you want this room to have teams (PVP)?");
			let numTeams = 0;
			if (teamMap) numTeams = Math.max(Math.min(await ui.prompt("How many teams do you want (Max 4)?"), 4), 2);
			if (ui.container) ui.container.remove();
			mainMenu.createRoom({ name, public, defaultMap, teamMap, numTeams });
		});
		mainMenu.roomsContainer.appendChild(mainMenu.privateRoom);
		if (typeof user.id == "number") mainMenu.roomsContainer.appendChild(mainMenu.newRoom);
		mainMenu.roomList.innerHTML = "";
		Object.keys(rooms).sort((a, b) => rooms[b].online - rooms[a].online).forEach(k => {
			if (!rooms[k].public && rooms[k].creator != user.name && !devs[user.name]) return;
			const public = rooms[k].public ? "Public room" : "Private room";
			const r = document.createElement("div");
			r.id = "room";
			const info = document.createElement("div");
			info.id = "room-info";
			const name = document.createElement("div");
			name.id = "room-name";
			name.innerText = rooms[k].name;
			const id = document.createElement("div");
			id.id = "room-id";
			const teams = rooms[k].teamMap ? " - Game Mode: Teams" : " - Game Mode: Normal";
			id.innerHTML = rooms[k].online + " Online - Join Code: " + rooms[k].id + " - " + public + "<br>" + "Creator: " + rooms[k].creator + " - " + rooms[k].size + teams;
			info.appendChild(name);
			info.appendChild(document.createElement("hr"));
			info.appendChild(id);
			r.appendChild(info);
			const join = mainMenu.createButton("Join", "join-room", () => mainMenu.joinRoom(rooms[k].id));
			r.appendChild(join);
			if (rooms[k].creator == user.name || devs[user.name]) r.appendChild(mainMenu.createButton(`
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
				</svg>
			`, "delete-room", () => mainMenu.deleteRoom(rooms[k].id)));
			mainMenu.roomList.appendChild(r);
		});
		if (Object.keys(rooms).length == 0) mainMenu.roomList.innerText = "No rooms found...";
	},
	async showRooms() {
		mainMenu.r = true;
		mainMenu.cancel = false;
		online = true;
		mainMenu.container.style.opacity = 0;
		mainMenu.sideContainer.style.opacity = 0;
		mainMenu.loading.style.opacity = 1;
		const ti = setTimeout(() => {
			if (!socket?.connected && online) {
				mainMenu.backToMainMenu();
				mainMenu.notify("Couldn't connect to server.", "red", 5000);
			}
		}, 20000);
		players = {};
		myId = "offline";
		players[myId] = JSON.parse(defaultPlayer);
		let load = true, v = null;
		if (online) load = await waitForConnect();
		if ((!socket?.connected && online) || mainMenu.cancel || !load) return;
		clearTimeout(ti);
		if (online) v = await waitForVersion();
		if (VERSION != v && online) {
			mainMenu.notify("You are not using the latest version.", "red", 5000);
			mainMenu.backToMainMenu();
			return;
		}
		mainMenu.rooms.innerHTML = "";
		if (getUser()) {
			await loginUser(getUser());
			await waitForUser();
		}
		await mainMenu.loadRooms();
		setTimeout(() => mainMenu.switchButton(0, "1"), 10);
		mainMenu.rooms.style.opacity = 1;
		mainMenu.rooms.style.pointerEvents = "auto";
		mainMenu.container.style.opacity = 1;
		mainMenu.loading.style.opacity = 0;
		mainMenu.sideContainer.innerHTML = "";
		mainMenu.gameText.innerText = "Join a Room";
		mainMenu.rooms.appendChild(mainMenu.gameTitle);
		mainMenu.rooms.appendChild(mainMenu.roomsContainer);
		mainMenu.rooms.appendChild(mainMenu.roomList);
		mainMenu.rooms.style.opacity = 1;
	},
	async play(o = false, room) {
		mainMenu.cancel = mainMenu.ready = mainMenu.r = mainMenu.cancelLoad = false;
		online = o;
		if (banned == room && online) return mainMenu.notify("You are banned from this room.", "red", 5000);
		mainMenu.container.style.opacity = 0;
		mainMenu.sideContainer.style.opacity = 0;
		mainMenu.rooms.style.opacity = 0;
		mainMenu.loading.style.opacity = 1;
		const ti = setTimeout(() => {
			if (!socket?.connected && online) {
				mainMenu.backToMainMenu();
				mainMenu.notify("Couldn't connect to server.", "red", 5000);
			} else if (!readyToAnimate) {
				mainMenu.backToMainMenu();
				mainMenu.notify("Couldn't load assets.", "red", 5000);
			}
		}, 20000);
		players = {};
		myId = "offline";
		players[myId] = JSON.parse(defaultPlayer);
		let load = true, v = null;
		if (online) load = await waitForConnect();
		if ((!socket?.connected && online) || mainMenu.cancel || !load) return;
		if (online) v = await waitForVersion();
		if (VERSION != v && online) {
			mainMenu.notify("You are not using the latest version.", "red", 5000);
			mainMenu.backToMainMenu();
			return;
		}
		load = await loadImages();
		if (!load) return;
		clearTimeout(ti);
		mainMenu.mainMenu.style.opacity = 0;
		mainMenu.mainMenu.style.pointerEvents = "none";
		mainMenu.container.style.pointerEvents = "none";
		mainMenu.buttons = 0;
		setTimeout(() => document.querySelector("#" + mainMenu.mainMenu.id).remove(), 500);
		nextTrack();
		ui.create();
		text.create();
		pause.create();
		chat.create();
		profile.create();
		workbench.create();
		furnace.create();
		backpack.create();
		chest.create();
		wardrobe.create();
		if (tutorial) runTutorial();
		if (getUser()) await loginUser(getUser());
		if (!online) await save.load();
		camera.fadeTo(0);
		particles.removeAll();
		particles.addTo(document.body);
	},
	backToMainMenu() {
		leaderboard.toggled = false;
		save.cancel = true;
		mainMenu.cancelLoad = true;
		mainMenu.buttons = 0;
		mainMenu.sideContainer.innerHTML = "";
		mainMenu.sideContainer.appendChild(mainMenu.createButton("Singleplayer", "play", async () => await mainMenu.play()));
		mainMenu.sideContainer.appendChild(mainMenu.createButton("Multiplayer", "play", () => mainMenu.showRooms()));
		if (!getUser()) mainMenu.sideContainer.appendChild(mainMenu.createButton("Login / Create Account", "play", () => window.open("login.html?server=" + serverUrl, "sub", `top=${(screen.height - 800) / 4},left=${(screen.width - 600) / 2},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,frame=no,width=600,height=800`)));
		else mainMenu.sideContainer.appendChild(mainMenu.createButton("Logout", "play", () => { logoutUser(); mainMenu.backToMainMenu() }));
		mainMenu.sideContainer.appendChild(mainMenu.createButton("Join Discord", "play", () => window.open("https://discord.gg/VCkGgSvCrr")));
		mainMenu.ready = false;
		mainMenu.cancel = true;
		mainMenu.container.style.opacity = 0;
		if (mainMenu.r) mainMenu.sideContainer.style.opacity = 0;
		mainMenu.rooms.style.opacity = 0;
		if (mainMenu.r) mainMenu.loading.style.opacity = 1;
		mainMenu.buttons = 4;
		setTimeout(() => {
			if (mainMenu.privateRoom) mainMenu.privateRoom.remove();
			const b = document.querySelector("#back");
			if (b) b.remove();
			mainMenu.rooms.innerHTML = "";
			mainMenu.rooms.style = "";
			if (mainMenu.roomsContainer) mainMenu.roomsContainer.remove();
			mainMenu.container.style.opacity = 1;
			mainMenu.loading.style.opacity = 0;
			mainMenu.sideContainer.style.opacity = 1;
			mainMenu.r = false;
			mainMenu.ready = true;
			mainMenu.switchButton(0, online ? "1" : "0");
			online = false;
			if (socket.connected) socket.disconnect();
			mainMenu.gameText.innerText = "Pixel Realms";
			mainMenu.sideContainer.insertBefore(mainMenu.gameTitle, mainMenu.sideContainer.firstChild);
		}, mainMenu.r ? 500 : 0);
	},
	getRooms() {
		if (!socket.connected || !online) return;
		return new Promise(res => socket.emit("get rooms", rooms => res(rooms)));
	},
};

const runTutorial = () => {
	tutorial = true;
	text.set(["Welcome to the admin tutorial! To get started, press the e key."]);
};

window.onload = () => mainMenu.create();