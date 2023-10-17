const quickTp = [201, 205, 209, 213];
let autotiling = false, tutorial = false;
const editor = {
	selected: 0,
	enabled: false,
	copy: 0,
	layer: "ground",
	scene: 0,
	frame: 0,
	async run() {
		if (ui.toggled || ui.death || !readyToAnimate) {
			if (document.pointerLockElement == ctx.canvas || !readyToAnimate) document.exitPointerLock();
			return;
		}
		if (!(devs[user.name] || ((admins[user.id] && online) && online)) || tutorial) return;
		if (document.pointerLockElement != ctx.canvas) ctx.canvas.requestPointerLock();
		if (keys["ArrowUp"] || keys["w"] || gp.up()) players[myId].mouse.y -= 10;
		if (keys["ArrowDown"] || keys["s"] || gp.down()) players[myId].mouse.y += 10;
		if (keys["ArrowLeft"] || keys["a"] || gp.left()) players[myId].mouse.x -= 10;
		if (keys["ArrowRight"] || keys["d"] || gp.right()) players[myId].mouse.x += 10;
		let c = Math.floor((camera.x + ctx.canvas.width / 2) / tsize);
		let r = Math.floor((camera.y + ctx.canvas.height / 2) / tsize);
		if (c < 0) c = 0;
		if (c >= map[editor.scene].cols) c = map[editor.scene].cols - 1;
		if (r < 0) r = 0;
		if (r >= map[editor.scene].cols) r = map[editor.scene].rows - 1;
		const tile = getTile(editor.scene, editor.layer, c, r);
		const index = getIndex(editor.scene, c, r);
		const ores = { gold: 57, iron: 58, ruby: 59, diamond: 60, emerald: 61, platinum: 62, coal: 63 };

		editor.copy = tile;
		ctx.fillStyle = "black";

		let t = editor.selected;
		if (t / 1000 >= 1) t = t / 1000;
		ctx.globalAlpha = 0.8;
		if (t == 78 || t == 102 || t == 126 || t == 132 || t == 134 || t == 136) {
			let i = 0, sm = (t == 126), maxr = sm ? 2 : 4, maxc = sm ? 3 : 6;
			if (t == 132 || t == 134) { maxc = 1; maxr = 2 }
			if (t == 136) { maxc = 3; maxr = 3 }
			for (let rows = 0; rows < maxr; rows++) {
				for (let cols = 0; cols < maxc; cols++) {
					ctx.drawImage(
						images["tilemap"],
						(t + i) * tsize,
						0,
						tsize,
						tsize,
						(cols + c) * tsize,
						(rows + r) * tsize,
						tsize,
						tsize
					);
					i++;
				}
			}
		} else if (editor.selected != 999) ctx.drawImage(
			images[(editor.selected / 1000 >= 1) ? "items" : "tilemap"],
			t * tsize,
			0,
			tsize,
			tsize,
			c * tsize,
			r * tsize,
			tsize,
			tsize
		);
		else ctx.fillRect(c * tsize, r * tsize, tsize, tsize);

		ctx.globalAlpha = 1.0;

		ctx.drawImage(
			images["editor"],
			editor.frame * tsize,
			0,
			tsize,
			tsize,
			c * tsize,
			r * tsize,
			tsize,
			tsize
		);

		ctx.globalAlpha = 1.0;

		if (players[myId].mouse.click || gp.cKey(players[myId].holding == 6)) {
			if (editor.selected == editor.current) return;
			const prevAutotile = Object.keys(autotilingMap).find(e => autotilingMap[e] == Object.keys(autotilingSets).find(e => autotilingSets[e].includes(getTile(editor.scene, editor.layer, c, r))));
			let place = editor.selected;
			if (autotiling && autotilingMap[editor.selected]) {
				let e = editor.selected;
				place = this.getAutotile(c, r, editor.selected, e);
				this.updateAutotiling(c, r, e);
			}
			if (editor.selected == 68 || editor.selected == 77 || quickTp.includes(editor.selected)) {
				players[myId].mouse.click = false;
				const s = parseInt(await ui.prompt("What scene should this lead to? (0 - " + map.length + ", current: " + editor.scene + ")"));
				if (/^(\d)+$/g.test(s) && s != editor.scene) {
					if (s >= map.length) {
						let type = await ui.prompt("What type of scene is this? (woods, house, cave)") || "woods";
						let cols = 8, rows = 6, fromX = 0, fromY = 1, ore;
						if (type != "house") {
							cols = parseInt(await ui.prompt("Number columns (max 150, min 5):"));
							if (!/^(\d)+$/g.test(cols) || cols < 5 || cols > 150) return;
							rows = parseInt(await ui.prompt("Number rows (max 150, min 5):"));
							if (!/^(\d)+$/g.test(rows) || rows < 5 || rows > 150) return;
							if (type == "cave") ore = ores[(await ui.prompt("What ores do you want in this cave? (" + Object.keys(ores).toString().replaceAll(",", ", ") + ")")).toLowerCase()] || 57;
						}
						editor.createScene(type, cols, rows, { fromX, fromY }, type == "cave", ore);
					}
					if (!quickTp.includes(editor.selected)) map[editor.scene].teleport[index] = (s >= map.length) ? map.length : s;
					else map[editor.scene].teleport[index] = { to: (s >= map.length) ? map.length : s, fromX: c, fromY: r };
				} else return;
			}
			if (editor.selected == 67) {
				players[myId].mouse.click = false;
				const s = await ui.prompt("What should this sign say?");
				if (!s) return;
				map[editor.scene].text[index] = s;
			}
			if (editor.selected == 65) map[editor.scene].chest[index] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
			if (editor.selected == 72) map[editor.scene].furnace[index] = {};

			if (editor.layer == "ground") Object.keys(map[editor.scene].layers).forEach(layer => {
				map[editor.scene].layers[layer][index] = -1;
				delete map[editor.scene].break[index];
				delete map[editor.scene].structure[index];
				delete map[editor.scene].text[index];
				delete map[editor.scene].chest[index];
				delete map[editor.scene].teleport[index];
				delete map[editor.scene].entities.find(e => e.dx == c * tsize && e.dy == r * tsize);
			});
			if (editor.selected == 78 || editor.selected == 102 || editor.selected == 126 || editor.selected == 132 || editor.selected == 134 || editor.selected == 136) {
				players[myId].mouse.click = false;
				const doors = [98, 99, 122, 123, 130];
				let i = 0, sm = (editor.selected == 126), maxr = sm ? 2 : 4, maxc = sm ? 3 : 6;
				if (editor.selected == 132 || editor.selected == 134) { maxc = 1; maxr = 2 }
				if (editor.selected == 136) { maxc = 3; maxr = 3 }
				for (let rows = 0; rows < maxr; rows++) {
					for (let cols = 0; cols < maxc; cols++) {
						const ind = getIndex(editor.scene, cols + c, rows + r);
						if (editor.layer != "scenery") map[editor.scene][editor.layer][ind] = editor.selected + i;
						else map[editor.scene].layers[editor.layer][ind] = editor.selected + i;
						if (doors.includes(editor.selected + i) && editor.selected != editor.copy && !(editor.selected == 132 || editor.selected == 134 || editor.selected == 136)) {
							map[editor.scene].teleport[getIndex(editor.scene, cols + c, rows + r)] = map.length;
						}
						i++;
					}
				}

				if (editor.selected != editor.copy && !(editor.selected == 132 || editor.selected == 134 || editor.selected == 136)) {
					type = (editor.selected == 126) ? "cave" : "house";
					let cols = 8, rows = 6, fromX = 2 + c, fromY = 4 + r, ore = false;
					if (type == "cave") {
						cols = parseInt(await ui.prompt("Number columns (max 150, min 5):"));
						if (!/^(\d)+$/g.test(cols) || cols < 5 || cols > 150) return;
						rows = parseInt(await ui.prompt("Number rows (max 150, min 5):"));
						if (!/^(\d)+$/g.test(rows) || rows < 5 || rows > 150) return;
						ore = ores[(await ui.prompt("What ores do you want in this cave? (" + Object.keys(ores).toString().replaceAll(",", ", ") + ")")).toLowerCase()] || 57;
						fromX = 1 + c;
						fromY = 2 + r;
					}
					editor.createScene(type, cols, rows, { fromX, fromY }, true, ore);
				}
			} else {
				map[editor.scene].layers[editor.layer][index] = place;
				if (autotiling) this.updateAutotiling(c, r, prevAutotile);
			}

			if (socket.connected && online) socket.emit("update map", [map[editor.scene], editor.scene]);
		}
	},
	createScene(type, cols, rows, extras = {}, s = false, ore = false) {
		const scene = editor.scene;
		editor.scene = map.length;
		map[map.length] = {
			type,
			cols,
			rows,
			layers: {
				ground: [],
				scenery: [],
			},
			break: {},
			structure: {},
			text: {},
			chest: {},
			furnace: {},
			teleport: {},
			entities: [],
			...extras
		};
		if (s && ore) resetMap(scene, ore);
		else if (s) resetMap(scene);
		else resetMap();
		editor.scene = scene;

		if (socket.connected && online) socket.emit("update map", [map[map.length - 1], map.length - 1]);
	},
	drawCenter() {
		const size = 8;
		ctx.beginPath();
		ctx.fillStyle = "gray";
		ctx.strokeStyle = "darkgray";
		ctx.globalAlpha = 0.7;
		ctx.arc(ctx.canvas.width / 2 - size / 2, ctx.canvas.height / 2 - size / 2, size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		editor.updateData();
	},
	updateData() {
		let mt = 100, size = 15;
		ctx.globalAlpha = "1.0";
		ctx.fillStyle = "black";
		ctx.fillRect(0, mt - size / 2, 200, size * 12 - size / 2);
		ctx.fillStyle = "white";
		ctx.font = size + "px Arial";
		ctx.fillText("Scene: " + editor.scene, 10, mt + size * 1);
		ctx.fillText("Layer: " + editor.layer, 10, mt + size * 2);
		ctx.fillText("Selected: " + editor.selected, 10, mt + size * 3);
		ctx.fillText("Copy: " + editor.copy, 10, mt + size * 4);
		ctx.fillText("X: " + players[myId].mouse.x, 10, mt + size * 5);
		ctx.fillText("Y: " + players[myId].mouse.y, 10, mt + size * 6);
		ctx.fillText("Col: " + Math.floor(players[myId].mouse.x / tsize), 10, mt + size * 7);
		ctx.fillText("Row: " + Math.floor(players[myId].mouse.y / tsize), 10, mt + size * 8);
		ctx.fillText("Click: " + players[myId].mouse.click, 10, mt + size * 9);
		ctx.fillText("Autotiling: " + autotiling, 10, mt + size * 10);
	},
	getAutotile(c, r, d, e, s = editor.scene, l = editor.layer) {
		const curr = autotilingMap[e];
		if (!curr) return d;
		const tiles = autotilingSets[curr];
		if (!tiles.includes(d) || c > map[s].cols || r > map[s].rows) return d;
		let currStr = "";
		currStr += tiles.includes(getTile(s, l, c, r - 1)) ? curr : 0;
		currStr += tiles.includes(getTile(s, l, c - 1, r)) ? curr : 0;
		currStr += tiles.includes(getTile(s, l, c, r + 1)) ? curr : 0;
		currStr += tiles.includes(getTile(s, l, c + 1, r)) ? curr : 0;
		return autotilingRecipes[currStr] || d;
	},
	updateAutotiling(c, r, e, s = editor.scene, l = editor.layer) {
		map[s].layers[l][getIndex(s, c, r - 1)] = this.getAutotile(c, r - 1, getTile(s, l, c, r - 1), e, s, l);
		map[s].layers[l][getIndex(s, c - 1, r)] = this.getAutotile(c - 1, r, getTile(s, l, c - 1, r), e, s, l);
		map[s].layers[l][getIndex(s, c, r + 1)] = this.getAutotile(c, r + 1, getTile(s, l, c, r + 1), e, s, l);
		map[s].layers[l][getIndex(s, c + 1, r)] = this.getAutotile(c + 1, r, getTile(s, l, c + 1, r), e, s, l);
	},
};