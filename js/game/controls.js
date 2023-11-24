const keys = {};
let dp;
const controls = {
	right: {
		zKey: "z",
		xKey: "x",
		cKey: "c",
		up: "ArrowUp",
		down: "ArrowDown",
		left: "ArrowLeft",
		right: "ArrowRight",
	},
	left: {
		zKey: "o",
		xKey: "i",
		cKey: "p",
		up: "w",
		down: "s",
		left: "a",
		right: "d",
	},
};
let tileIndex = 0;

function keydown(e) {
	if (!readyToAnimate || keys[e.key]) return;
	keys[e.key] = true;
	if (e.key == "Space" || e.key == "Tab") e.preventDefault();
}

async function keyup(e) {
	const t = players[myId] ? players[myId].controls : "right";
	if ((e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) && text.toggled && chat.toggled && tutorial) text.skip();
	if (mainMenu.curr == 1 && mainMenu.r && mainMenu.ready) {
		if (e.key == controls[t].left || gp.left(true)) {
			mainMenu.privateInput.focus();
			mainMenu.privateJoin.style = "";
		}
		if ((e.key == controls[t].right || gp.right(true)) && (devs[user.name] || (admins[user.id] && online))) {
			if (document.activeElement == mainMenu.privateInput || typeof user.id != "number") mainMenu.switchButton(0, "1");
			else mainMenu.switchButton(0, "2");
		}
		if ((e.key == controls[t].down || gp.down(true)) && document.activeElement != mainMenu.privateInput) mainMenu.switchButton(0, devs[user.name] || (admins[user.id] && online) ? "2" : "1");
		if (e.key == "Enter" || gp.enter()) mainMenu.click();
	} else if (mainMenu.curr == 2 && mainMenu.r && mainMenu.ready && (devs[user.name] || (admins[user.id] && online))) {
		if (e.key == controls[t].left || gp.left(true)) mainMenu.switchButton(0, "1");
		if (e.key == controls[t].up || gp.up(true)) mainMenu.switchButton(0, "0");
	} else if (ui.toggled && !mainMenu.ready) {
		if (e.key == "ArrowRight" || gp.right(true)) {
			if (document.activeElement == ui.promptText && ui.promptType == "prompt") ui.switchPromptButton(false);
			else ui.switchPromptButton(true);
		}
		if (e.key == controls[t].left || gp.left(true)) {
			if (ui.selection == "ui-continue") ui.switchPromptButton(false);
			else if (ui.promptType == "prompt") ui.promptText.focus();
		}
		if (e.key == "Enter" || gp.enter()) ui.clickSelection();
	}
	if (ui.toggled || !readyToAnimate) Object.keys(keys).forEach(k => delete keys[k]);
	if (document.activeElement == mainMenu.privateInput) return mainMenu.privateJoin.style = "";
	if (document.activeElement == ui.promptText) { ui.continue.style = ""; ui.cancel.style = ""; return }
	if (mainMenu.buttons > 0 && mainMenu.ready) {
		if (e.key == controls[t].up || gp.up(true)) mainMenu.switchButton(-1);
		if (e.key == controls[t].down || gp.down(true)) mainMenu.switchButton(1);
		if (e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) mainMenu.click();
	} else if (ui.death) {
		if (e.key == controls[t].up || gp.up(true)) ui.switchButton(-1);
		if (e.key == controls[t].down || gp.down(true)) ui.switchButton(1);
		if (e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) ui.click();
	} else if (pause.toggled && !mainMenu.ready) {
		if (e.key == controls[t].up || gp.up(true)) pause.switchButton(-1);
		if (e.key == controls[t].down || gp.down(true)) pause.switchButton(1);
		if (e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) pause.click();
	}

	if (e.key) keys[e.key] = false;
	else e.key = null;

	if ((e.key == "/" || gp.chat()) && !chat.toggled && !pause.toggled && !text.toggled) chat.toggle();
	if (gp.profile() && !text.toggled) profile.toggle();
	if ((gp.pause() || e.key == "Escape") && !text.toggled && !document.body.contains(mainMenu.mainMenu)) pause.toggle();
	if (profile.toggled && gp.enter()) (user.id) ? logoutUser() : window.open("login.html?server=" + serverUrl, "sub", `top=${(screen.height - 800) / 4},left=${(screen.width - 600) / 2},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,frame=no,width=600,height=800`);
	if (ui.death && gp.enter()) ui.hideDeathScreen();
	if (chat.toggled || pause.toggled || e.metaKey || e.ctrlKey || e.altKey) return;
	if (!editor.enabled) {
		const p = players[myId];
		if (!p) return;
		const type = itemStats[p.i[p.holding].item].type;
		if ((e.key == controls[t].zKey || gp.zKey(true)) && ["helmet", "chestplate", "leggings"].includes(type)) {
			const i = ["helmet", "chestplate", "leggings"].indexOf(type);
			const h = p.i[p.holding].item;
			if (type == "helmet" && p.headArmor != -1) p.i[p.holding].item = 36 + 3 * p.headArmor;
			else if (type == "chestplate" && p.bodyArmor != -1) p.i[p.holding].item = 37 + 3 * p.bodyArmor;
			else if (type == "leggings" && p.legArmor != -1) p.i[p.holding].item = 38 + 3 * p.legArmor;
			else p.i[p.holding].item = -1;
			if (i == 0) p.headArmor = itemStats[h].setArmor;
			else if (i == 1) p.bodyArmor = itemStats[h].setArmor;
			else p.legArmor = itemStats[h].setArmor;
			if (socket.connected && online) socket.emit("update player", p);
			wardrobe.updateImages();
		} else if ((e.key == controls[t].zKey || gp.zKey(true, true)) && itemStats[p.i[p.holding].item].type == "bow" && (p.i.includes(67) || p.b.includes(67))) {
			let speed;
			if (p.rotate < 15) return;
			if (p.i.includes(67)) p.i[p.i.indexOf(67)] = "-1";
			else p.b[p.b.indexOf(67)] = "-1";
			if (p.rotate >= 45) speed = 20;
			else if (p.rotate >= 30) speed = 10;
			else speed = 5;
			const { x: px, y: py } = (gp.connected) ? gp.getRightJoystick() : { x: p.mouse.x + p.cx, y: p.mouse.y + p.cy };
			const angle = Math.atan2(py - (p.y + tsize / 2), px - (p.x + tsize / 2));
			map[p.scene].entities.push({
				type: "arrow",
				id: 2,
				speed,
				dir: 0,
				angle: angle + Math.PI / 4,
				moving: true,
				x: p.x + tsize / 2 + Math.cos(angle) * tsize,
				y: p.y + tsize / 2 + Math.sin(angle) * tsize,
				size: 60,
				from: myId,
				hit: false,
			});
			socket.emit("update entity", [map[p.scene].entities[map[p.scene].entities.length - 1], map[p.scene].entities.length - 1]);
		}

		if (e.key == "l") leaderboard.toggled = !leaderboard.toggled;
		else if (touching.workbench && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled && document.activeElement != workbench.recipeSearch) workbench.toggle();
		else if (touching.wardrobe && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) wardrobe.toggle();
		else if (touching.furnace && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) furnace.toggle(touching.furnace.index);
		else if (touching.sign && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) text.set([touching.sign.t], "tilemap", 67);
		else if ((e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) && text.toggled) text.skip();
		else if (touching["minecart"] && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) player.toggleMinecart(players[myId], touching["minecart"]);
		else if (touching["boat"] && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) player.toggleBoat(players[myId], touching["boat"]);
		else if (touching.bed && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled && daylight.level >= 15) player.toggleBed(players[myId]);
		else if (touching.chest && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) chest.toggle(touching.chest.index);
		else if (touching.teleporter && (e.key == controls[t].xKey || gp.xKey()) && !text.toggled) {
			camera.fadeTo(1, 500, true);
			setTimeout(() => {
				const prev = players[myId].scene;
				players[myId].scene = touching.teleporter.t;
				if (map[players[myId].scene].type == "house") players[myId].dx = (touching.teleporter.tile == 98 || touching.teleporter.tile == 122) ? (map[players[myId].scene].cols / 2 - 1) * tsize : (map[players[myId].scene].cols / 2) * tsize;
				if (map[players[myId].scene].type == "house") players[myId].dy = (map[players[myId].scene].rows - 1) * tsize;
				if (touching.teleporter.tile == map[prev].layers.scenery.length + map[prev].cols / 2 - 1 || touching.teleporter.tile == map[prev].layers.scenery.length + map[prev].cols / 2 || (touching.teleporter.tile == 77 && map[prev].type == "cave")) {
					players[myId].dx = map[prev].fromX * tsize || players[myId].dx;
					players[myId].dy = map[prev].fromY * tsize || players[myId].dy;
					if (touching.teleporter.tile == map[prev].layers.scenery.length + map[prev].cols / 2) players[myId].dx += tsize;
				}
				if (map[players[myId].scene].type == "cave") players[myId].dx = 0;
				if (map[players[myId].scene].type == "cave") players[myId].dy = tsize;
				players[myId].x = players[myId].dx;
				players[myId].y = players[myId].dy;
			}, 200);
		}
		else if ((e.key == controls[t].xKey || gp.xKey()) && !text.toggled && document.activeElement != workbench.recipeSearch) backpack.toggle();
		if (wardrobe.toggled) {
			if (e.key == controls[t].up || gp.up(true)) wardrobe.switchColumn((wardrobe.current - 1 >= 0) ? wardrobe.current - 1 : 2);
			if (e.key == controls[t].down || gp.down(true)) wardrobe.switchColumn((wardrobe.current + 1 <= 2) ? wardrobe.current + 1 : 0);
			if (e.key == controls[t].left || gp.left(true)) wardrobe.switchItem(true, wardrobe.current);
			if (e.key == controls[t].right || gp.right(true)) wardrobe.switchItem(false, wardrobe.current);
		}
	}

	if ((e.key == "e" || gp.editor()) && (devs[user.name] || (admins[user.id] && online)) && !text.toggled && !ui.death && readyToAnimate && !workbench.toggled && !wardrobe.toggled && !backpack.toggled && !chest.toggled && !furnace.toggled && !ui.toggled) {
		editor.enabled = !editor.enabled;
		if (tutorial && !text.toggled && editor.enabled) text.set(["Great job! To switch blocks, use the number keys and press the same key again to access more blocks of that type.", "If you want to speed up placing blocks, press the t key to toggle autotiling.", "To reset a scene, press the r key. To remove a scene, press the - key.", "Press the e key again to disable the editor."]);
		if (tutorial && !text.toggled && !editor.enabled) text.set(["You're a fast learner! Next up are admin commands. Press the / key to open the chat, or click the chat icon."]);
		if (!editor.enabled) { players[myId].dx = players[myId].x = Math.floor(players[myId].mouse.x / tsize) * tsize; players[myId].dy = players[myId].y = Math.floor(players[myId].mouse.y / tsize) * tsize; document.exitPointerLock() }
		else { ctx.canvas.requestPointerLock(); players[myId].mouse.x = players[myId].x; players[myId].mouse.y = players[myId].y }
	} else if (!(devs[user.name] || (admins[user.id] && online))) editor.enabled = false;
	if (editor.enabled) {
		if ((e.key == "Enter" || e.key == controls[t].xKey || gp.enter()) && tutorial) return text.skip();
		const p = players[myId];
		if (e.key == "y") editor.selected = editor.copy;
		if (e.key == "t" || gp.autotiling()) autotiling = !autotiling;
		if (e.key == "r" || gp.reset()) {
			const type = await ui.prompt("What type of scene is this? (woods, house, cave)");
			if (!type) return;
			const ores = { gold: 57, iron: 58, ruby: 59, diamond: 60, emerald: 61, platinum: 62, coal: 63 };
			let c = 8, r = 6, ore;
			if (type != "house") {
				c = parseInt(await ui.prompt("Number columns (max 150, min 5):"));
				if (!/^(\d)+$/g.test(c) || c < 5 || c > 150) return;
				r = parseInt(await ui.prompt("Number rows (max 150, min 5):"));
				if (!/^(\d)+$/g.test(r) || r < 5 || r > 150) return;
				if (type == "cave") ore = ores[(await ui.prompt("What ores do you want in this cave? (" + Object.keys(ores).toString().replaceAll(",", ", ") + ")")).toLowerCase()] || 57;
			}
			const reset = await ui.confirm("Are you sure? This will reset the map");
			if (!reset) return;
			map[editor.scene].cols = c;
			map[editor.scene].rows = r;
			map[editor.scene].type = (type) ? type.toLowerCase() : "woods";
			resetMap(editor.scene, ore);

			if (socket.connected && online) socket.emit("update map", [map[editor.scene], editor.scene]);
		};
		if (e.key == "-" || gp.delete()) {
			if (map.length == 1) return;
			const reset = await ui.confirm("Are you sure? This will delete the map");
			if (!reset) return;
			const s = editor.scene;
			map.splice(editor.scene, 1);
			if (editor.scene >= map.length) players[myId].scene = editor.scene = map.length - 1;
			if (socket.connected && online) socket.emit("delete map", s);
		}
		if (![1, 2, 3, 4, 5, 6, 7, 8].includes(Number(e.key)) && !(gp.connected && gp.zKey(true))) return;
		const curr = players[myId].holding;
		let tiles = tileKey[curr];
		if (autotiling) tiles = tiles.filter(e => !Object.values(autotilingSets).flat().includes(e) || autotilingMap[e]);
		if (editor.selected != tiles[tileIndex] || tileIndex >= tiles.length - 1) tileIndex = 0; else tileIndex++;
		editor.selected = tiles[tileIndex];
		editor.layer = "scenery";
		if (curr == 6) editor.layer = "structure";
		if (editor.selected == 40 || editor.selected == 76 || curr == 0 || curr == 1) editor.layer = "ground";
		if (editor.selected == 132 || editor.selected == 134 || editor.selected == 192) editor.layer = "scenery";
	}
}

function mousemove(e) {
	if (ui.toggled || !players[myId] || tutorial) return;
	players[myId].mouse.x = (editor.enabled) ? players[myId].mouse.x + e.movementX : e.clientX;
	players[myId].mouse.y = (editor.enabled) ? players[myId].mouse.y + e.movementY : e.clientY;
}

function mousedown(e) {
	if (ui.toggled || !players[myId]) return;
	players[myId].mouse.click = true;
	const coords = {
		x: e.clientX,
		y: e.clientY,
		w: 0,
		h: 0,
	};

	if (!colliding({
		x: profile.account?.getBoundingClientRect().left,
		y: profile.account?.getBoundingClientRect().top,
		w: profile.account?.getBoundingClientRect().width,
		h: profile.account?.getBoundingClientRect().height,
	}, coords) && profile.toggled && e.target.id != profile.image.id) profile.toggle();
	if (!colliding({
		x: chat.chatBar?.getBoundingClientRect().left,
		y: chat.chatBar?.getBoundingClientRect().top,
		w: chat.chatBar?.getBoundingClientRect().width,
		h: chat.chatBar?.getBoundingClientRect().height,
	}, coords) && chat.toggled && (e.target.id != chat.icon.id && e.target.id != "chat-svg")) chat.toggle();
}

function mouseup() {
	if (document.activeElement == mainMenu.privateInput) mainMenu.privateJoin.style = "";
	else if (mainMenu.curr == 1 && mainMenu.r) mainMenu.switchButton(0, "1");
	if (!players[myId]) return;
	players[myId].mouse.click = false;
}

window.addEventListener("keydown", keydown, false);
window.addEventListener("keyup", keyup, false);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mousedown", mousedown);
window.addEventListener("mouseup", mouseup);
window.addEventListener("gamepadconnected", e => {
	if (!e.gamepad.id.includes("Controller")) return;
	gp.device = e.gamepad;
	gp.connected = true;
	gp.id = e.gamepad.index;
});
window.addEventListener("gamepaddisconnected", () => {
	gp.device = null;
	gp.connected = false;
	gp.id = null;
});