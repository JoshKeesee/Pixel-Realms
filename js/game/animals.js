const animals = {
	update(e) {
		if (!e) return;
		if (online && socket.connected) return;
		if (e.x == e.dx && e.y == e.dy && (Math.floor(Math.random() * (50 - 1) + 1) == 1)) {
			let moveX = e.dx, moveY = e.dy;
			const random = Math.round(Math.random()) == 0 ? tsize : -tsize;

			if (Math.round(Math.random()) == 0) moveX += random;
			else moveY += random;
			if (moveX < 0) moveX += -random * 2;
			if (moveY < 0) moveY += -random * 2;
			if (moveX >= map[e.scene].cols) moveX -= -random * 2;
			if (moveY >= map[e.scene].rows) moveY -= -random * 2;
			const { dx, dy } = { dx: moveX, dy: moveY };
			findPath(e, dx, dy);
		}
		e.x += 2 * Math.sign(e.dx - e.x);
		e.y += 2 * Math.sign(e.dy - e.y);
		Object.values(players).filter(v => v.scene == e.scene).forEach(v => {
			const openSpots = [];
			openSpots.push({ x: Math.floor(e.dx / tsize) + 1, y: Math.floor(e.dy / tsize), dir: 2 });
			openSpots.push({ x: Math.floor(e.dx / tsize) - 1, y: Math.floor(e.dy / tsize), dir: 3 });
			openSpots.push({ x: Math.floor(e.dx / tsize), y: Math.floor(e.dy / tsize) + 1, dir: 1 });
			openSpots.push({ x: Math.floor(e.dx / tsize), y: Math.floor(e.dy / tsize) - 1, dir: 0 });
			openSpots.push({ x: Math.floor(e.dx / tsize), y: Math.floor(e.dy / tsize), dir: v.dir });
			openSpots.every(c => {
				if (
					colliding({
						x: v.x,
						y: v.y,
						w: tsize,
						h: tsize,
					}, {
						x: e.x,
						y: e.y,
						w: tsize,
						h: tsize,
					}) &&
					v.rotate != 0 && (
						itemStats[v.i[v.holding].item].type == "sword" ||
						itemStats[v.i[v.holding].item].type == "axe"
					) &&
					!v.editor &&
					v.dir == c.dir &&
					!text.toggled &&
					e.cooldown == 0
				) {
					e.health -= Math.floor(itemStats[v.i[v.holding].item].power / 1);
					e.cooldown = 2;
					if (e.health <= 0) {
						if (v.id == myId) {
							const p = players[v.id];
							e.gives.forEach((item, i) => (p.i.some(e => e.item == -1)) ? p.i[p.i.findIndex(e => e.item == -1)] = { item: item, amount: 1 } : p.b.some(e => e.item == -1) ? p.b[p.b.findIndex(e => e.item == -1)] = { item: item, amount: 1 } : "");
						} else if (socket.connected && online) {
							e.gives.forEach((item, i) => socket.emit("give item", [e.gives[i], v.id, 1]));
						}
					}
					const dx = e.dx, dy = e.dy;
					if (c.dir == 0) e.dy = e.y = (c.y + 2) * tsize;
					else if (c.dir == 1) e.dy = e.y = (c.y - 2) * tsize;
					else if (c.dir == 2) e.dx = e.x = (c.x - 2) * tsize;
					else if (c.dir == 3) e.dx = e.x = (c.x + 2) * tsize;
					else if (v.dir == 0) e.dy = e.y = (Math.floor(v.dy / tsize) - 1) * tsize;
					else if (v.dir == 1) e.dy = e.y = (Math.floor(v.dy / tsize) + 1) * tsize;
					else if (v.dir == 2) e.dx = e.x = (Math.floor(v.dx / tsize) + 1) * tsize;
					else if (v.dir == 3) e.dx = e.x = (Math.floor(v.dx / tsize) - 1) * tsize;
					if (
						enemies.walls(e.scene)[getIndex(e.scene, Math.floor(e.dx / tsize), Math.floor(e.dy / tsize))] == 1 ||
						e.dx < 0 ||
						e.dy < 0 ||
						e.dx > map[e.scene].cols - 1 ||
						e.dy > map[e.scene].rows - 1
					) {
						e.dx = e.x = dx;
						e.dy = e.y = dy;
					}
					e.dx = Math.floor(e.dx / tsize) * tsize;
					e.dy = Math.floor(e.dy / tsize) * tsize;
					return false;
				}
				else return true;
			});
		});
		Object.values(map[e.scene].entities).filter(t => !t.enemy && !t.animal).forEach(t => {
			if (!t || t.id != 2) return;
			if (colliding({
				x: t.x,
				y: t.y,
				w: 0,
				h: 0,
			}, {
				x: e.x,
				y: e.y,
				w: tsize,
				h: tsize,
			})) {
				e.health -= Math.floor(t.speed / 1);
				if (e.health <= 0) {
					if (t.from == myId) {
						const p = players[t.from];
						e.gives.forEach((item, i) => (p.i.some(e => e.item == -1)) ? p.i[p.i.findIndex(e => e.item == -1)] = { item: item, amount: 1 } : p.b.some(e => e.item == -1) ? p.b[p.b.findIndex(e => e.item == -1)] = { item: item, amount: 1 } : "");
					} else if (socket.connected && online) {
						e.gives.forEach((item, i) => socket.emit("give item", [e.gives[i], t.from, 1]));
					}
				}
				map[e.scene].entities.splice(map[e.scene].entities.indexOf(t), 1);
			}
		});
		if (e.health <= 0) {
			e.health = 0;
			map[e.scene].entities.splice(map[e.scene].entities.indexOf(e), 1);
			return;
		}
	},
	frames(e) {
		if (!e) return;
		e.cooldown--;
		if (e.cooldown < 0) e.cooldown = 0;
		if (e.x != e.dx || e.y != e.dy) e.frame++;
		else e.frame = 0;
		if (e.frame > 3) e.frame = 0;
		let c, r;
		c = Math.floor(e.dx / tsize);
		r = Math.floor(e.dy / tsize);
		if (enemies.walls(e.scene)[getIndex(e.scene, c, r)] == 1) {
			e.health -= 0.5;
			if (
				enemies.walls(e.scene)[getIndex(e.scene, c + 1, r)] == 1 &&
				enemies.walls(e.scene)[getIndex(e.scene, c - 1, r)] == 1 &&
				enemies.walls(e.scene)[getIndex(e.scene, c, r + 1)] == 1 &&
				enemies.walls(e.scene)[getIndex(e.scene, c, r - 1)] == 1
			) e.health -= 0.5;
		}
	},
	spawn(e = {}) {
		if (typeof e != "object") return;
		if (typeof e.scene != "number") e.scene = players[myId].scene;
		const openSpot = enemies.getOpenSpot(e.scene);
		if (typeof e.x != "number" || typeof e.y != "number" || e.x < 0 || e.y < 0) { e.x = openSpot.x; e.y = openSpot.y }
		if (!e.type) e.type = Object.keys(animalTypes)[Math.floor(Math.random() * Object.keys(animalTypes).length)].replaceAll("_", " ");
		if (!e.gives) e.gives = animalGives[e.type];
		e.dx = e.x;
		e.dy = e.y;
		e.frame = 0;
		e.dir = 0;
		e.health = 100;
		e.animal = true;
		e.id = animalTypes[e.type];
		e.cooldown = 0;
		map[e.scene].entities.push(e);
		if (socket.connected && online) socket.emit("update entity", [e, map[e.scene].entities.indexOf(e)]);
	},
	despawn() {
		map.forEach(m => m.entities = m.entities.map(e => !e.animal));
	},
	getOpenSpot(s) {
		let openSpot = Math.floor(Math.random() * enemies.walls(s).length);
		while (enemies.walls(s)[openSpot] != 0) openSpot = Math.floor(Math.random() * enemies.walls(s).length);
		const x = openSpot % map[s].cols;
		const y = (openSpot - x) / map[s].cols;
		return { x: x * tsize, y: y * tsize };
	},
};