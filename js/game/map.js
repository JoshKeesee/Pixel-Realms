function drawLayer(l, s) {
	for (let c = 0; c < map[s].cols; c++) {
		for (let r = 0; r < map[s].rows; r++) {
			if (inViewport(c * tsize, r * tsize, tsize + editor.enabled ? 400 : 0)) continue;
			let tile = Math.floor(getTile(s, l, c, r));
			if (tile == 65) Object.keys(players).forEach(id => {
				if (
					players[id].chest == getIndex(s, c, r) &&
					typeof players[id].chest == "number" &&
					players[id].scene == players[myId].scene
				) tile = 66;
			});
			if (tile != -1) {
				ctx.fillStyle = "black";
				const fountain = [136, 137, 138, 139, 140, 141, 142, 143, 144];
				let img = images["tilemap"], animate = tile == 40 || tile == 68 || tile == 72 || quickTp.includes(tile);
				if (l == "break") img = images["break"];
				if (tile / 1000 >= 1) {
					img = images["items"];
					tile = tile / 1000;
					animate = itemStats[tile].animate;
				}
				if (tile != 999 && !fountain.includes(tile)) ctx.drawImage(
					img,
					(animate) ? tile * tsize + frame * tsize : tile * tsize,
					0,
					tsize,
					tsize,
					c * tsize,
					r * tsize,
					tsize,
					tsize
				);
				else if (fountain.includes(tile)) ctx.drawImage(
					img,
					tile * tsize + frame * 9 * tsize,
					0,
					tsize,
					tsize,
					c * tsize,
					r * tsize,
					tsize,
					tsize
				);
				else ctx.clearRect(c * tsize, r * tsize, tsize, tsize);
			}
		}
	}
}

function inViewport(x, y, margin) {
	return !(
		x >= camera.x - margin &&
		x <= camera.x + ctx.canvas.width + margin &&
		y >= camera.y - margin &&
		y <= camera.y + ctx.canvas.height + margin
	);
};

function drawEntity(e) {
	if (!e) return;
	let x = e.x, y = e.y, s = e.size || tsize, f = e.frame || 0, a = e.animal ? (e.id + (e.dir * 4)) * tsize + e.frame * tsize : e.id * tsize + e.dir * tsize;
	if (e.angle) {
		ctx.save();
		ctx.translate(e.x, e.y);
		ctx.rotate(e.angle);
		x = -(s / 2);
		y = -(s / 2);
	}
	ctx.drawImage(
		images["entities"],
		a,
		0,
		tsize,
		tsize,
		x,
		y,
		s,
		s
	);
	if (e.angle) ctx.restore();
}

function getTile(s, l, c, r) {
	const i = getIndex(s, c, r);
	if (i > map[s].cols * map[s].rows - 1) return null;
	if (map[s].layers[l]) return map[s].layers[l][i];
	return map[s][l][i] || -1;
}

function getAllTiles(s, c, r) {
	const tiles = [];
	Object.keys(map[s].layers).forEach(l => tiles.push(map[s].layers[l].indexOf(getIndex(s, c, r))));
	return tiles;
}

function getIndex(s, c, r) {
	return r * map[s].cols + c;
}

function resetMap(s = -1, ore = 57) {
	if (!editor.enabled) return;

	let ground = 0;
	if (map[editor.scene].type == "house") ground = 76;
	else if (map[editor.scene].type == "cave") ground = 22;
	map[editor.scene].break = {};
	map[editor.scene].structure = {};
	map[editor.scene].text = {};
	map[editor.scene].chest = {};
	map[editor.scene].teleport = {};
	map[editor.scene].entities = [];
	map[editor.scene].layers = {
		ground: [],
		scenery: [],
	};

	for (let i = 0; i < map[editor.scene].cols * map[editor.scene].rows; i++) {
		map[editor.scene].layers.ground[i] = ground;
		map[editor.scene].layers.scenery[i] = -1;
	}

	if (map[editor.scene].cols >= 10 && map[editor.scene].rows >= 10 && ground != 22) {
		for (let i = 0; i < map[editor.scene].cols; i++) {
			map[editor.scene].layers.scenery[i] = 53;
			map[editor.scene].layers.scenery[map[editor.scene].layers.scenery.length - 1 - i] = 53;
		}

		for (let i = 1; i < map[editor.scene].rows; i++) {
			map[editor.scene].layers.scenery[i * map[editor.scene].cols] = 53;
			map[editor.scene].layers.scenery[(i * map[editor.scene].cols) - 1] = 53;
		}
	}

	if (ground == 76 && s >= 0) {
		map[editor.scene].from = s;
		for (let i = 0; i < map[editor.scene].cols / 2 - 1; i++) {
			const s = map[editor.scene].layers.scenery;
			s[(s.length - 1) - i] = 999;
			s[(s.length - map[editor.scene].cols) + i] = 999;
		}
	}

	if (ground == 22 && s >= 0) {
		generateCave(editor.scene, ore);
		map[editor.scene].layers.scenery[0] = 77;
		map[editor.scene].teleport[0] = s;
	}
}

function generateCave(s, l) {
	const cave = map[s].layers.scenery;
	const caveSize = map[s].cols * map[s].rows;
	for (let i = 0; i < cave.length; i++) {
		cave[i] = 999;
	}
	let x = y = 0, random, amount;
	for (let i = 0; i < caveSize; i++) {
		random = Math.floor(Math.random() * 2);
		amount = Math.floor(Math.random() * (2 + 1) - 1);
		if (y <= 0 || x <= 0) amount = 1;
		if (y >= map[s].rows - 1 || x >= map[s].cols - 1) amount = -1;
		if (random == 0) x += amount;
		else y += amount;
		cave[getIndex(s, x, y)] = (Math.floor(Math.random() * 20) == 0) ? l : -1;
	}
	cave[getIndex(s, 1, 0)] = -1;
	cave[getIndex(s, 0, 1)] = -1;
	cave[getIndex(s, 1, 1)] = -1;
}