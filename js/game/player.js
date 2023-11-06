let touching = {};
const player = {
	respawn(p) {
		if (!p) return;
		if (p.bed) player.toggleBed(p);
		if (typeof p.minecart == "number") player.toggleMinecart(p);
		if (typeof p.boat == "number") player.toggleBoat(p);
		p.x = p.dx = p.respawnX;
		p.y = p.dy = p.respawnY;
		p.scene = p.respawnScene;
		p.health = 100;
		p.hunger = 150;
		p.dir = 0;
		p.xp -= 500;
		if (p.xp < 0) p.xp = 0;
		if (socket.connected && online) socket.emit("update player", p);
	},
	draw(p) {
		if (!p || p.editor) return;
		if (p.scene != players[myId].scene || p.health <= 0) return;
		let dx = p.x, dy = p.y;
		if (p.id != myId) {
			dx = buffer[p.id].x;
			dy = buffer[p.id].y;
		}
		if (!p.bed && typeof p.minecart != "number" && typeof p.boat != "number") {
			ctx.drawImage(
				images[p.legColor + " leg"],
				(p.frame + (p.dir * 4)) * tsize,
				0,
				tsize,
				tsize,
				dx,
				dy,
				tsize,
				tsize
			);
			if (p.legArmor > -1) ctx.drawImage(
				images["leg armor"],
				(p.legArmor * 16 + (p.frame + (p.dir * 4))) * tsize,
				0,
				tsize,
				tsize,
				dx,
				dy,
				tsize,
				tsize
			);
			ctx.drawImage(
				images[p.bodyColor + " body"],
				(p.frame + (p.dir * 4)) * tsize,
				0,
				tsize,
				tsize,
				dx,
				dy,
				tsize,
				tsize
			);
			if (p.bodyArmor * 16 > -1) ctx.drawImage(
				images["body armor"],
				(p.bodyArmor * 16 + (p.frame + (p.dir * 4))) * tsize,
				0,
				tsize,
				tsize,
				dx,
				dy,
				tsize,
				tsize
			);
		}
		ctx.drawImage(
			images[p.headColor + " head"],
			(p.frame + (p.dir * 4)) * tsize,
			0,
			tsize,
			tsize,
			dx,
			(p.bed || (typeof p.boat == "number" && p.dir == 1)) ? dy + 20 : dy,
			tsize,
			tsize
		);
		if (p.headArmor > -1) ctx.drawImage(
			images["head armor"],
			(p.headArmor * 16 + (p.frame + (p.dir * 4))) * tsize,
			0,
			tsize,
			tsize,
			dx,
			(p.bed || (typeof p.boat == "number" && p.dir == 1)) ? dy + 20 : dy,
			tsize,
			tsize
		);
		if (p.i[p.holding].item != -1 && p.rotate != 0) {
			if (p.hunger > 100 && itemStats[p.i[p.holding].item].type == "food") return;
			if (["helmet", "chestplate", "leggings", "minecart"].includes(itemStats[p.i[p.holding].item].type)) return;
			let s = 60, x = dx, y = dy + 10, f = frame;

			const tools = ["pickaxe", "sword", "axe", "hoe"];
			const bow = itemStats[p.i[p.holding].item].type == "bow";

			if (bow && !p.i.includes(67) && !p.b.includes(67)) return;

			ctx.save();
			if (!bow) {
				if (p.dir == 1 || p.dir == 2) x -= s;
				else x += tsize;
				ctx.translate(x + s / 2, y + s / 2);
				if (
					tools.includes(itemStats[p.i[p.holding].item].type) ||
					itemStats[p.i[p.holding].item].name == "Stick"
				) ctx.rotate(Math.cos(p.rotate / 10) / 2);
				if (itemStats[p.i[p.holding].item].type == "food") ctx.translate((p.dir == 1 || p.dir == 2) ? s / 2 : -tsize + s / 2, 10 * Math.cos(p.rotate / 2));
				if (p.dir == 1 || p.dir == 2) ctx.scale(-1, 1);
				ctx.translate(-(x + s / 2), -(y + s / 2));
			} else {
				const { x: px, y: py } = (gp.connected) ? gp.getRightJoystick() : { x: p.mouse.x + p.cx, y: p.mouse.y + p.cy };
				const angle = Math.atan2(py - (dy + tsize / 2), px - (dx + tsize / 2));
				x = -(s / 2);
				y = -(s / 2);
				ctx.translate(dx + tsize / 2 + Math.cos(angle) * tsize, dy + tsize / 2 + Math.sin(angle) * tsize);
				ctx.rotate(angle + Math.PI / 4);
				if (p.rotate < 15) f = 0;
				else if (p.rotate < 30) f = 1;
				else if (p.rotate < 45) f = 2;
				else f = 3;
			}

			ctx.drawImage(
				images["items"],
				(itemStats[p.i[p.holding].item].animate) ? p.i[p.holding].item * tsize + f * tsize : p.i[p.holding].item * tsize,
				0,
				tsize,
				tsize,
				x,
				y,
				s,
				s
			);

			if (bow) ctx.drawImage(
				images["items"],
				67 * tsize,
				0,
				tsize,
				tsize,
				x - (f - 3) * 5,
				y + (f - 3) * 5,
				s,
				s
			);

			ctx.restore();
		}
	},
	drawNametag(p) {
		if (!p || p.editor || p.health <= 0) return;
		if (p.scene != players[myId].scene || !buffer[p.id]) return;
		let dx = p.x, dy = p.y;
		if (p.id != myId) {
			dx = buffer[p.id].x;
			dy = buffer[p.id].y;
		}
		ctx.textAlign = "center";
		ctx.font = "15px pixel";
		if (devs[user.name]) {
			const sp = 12;
			ctx.beginPath();
			ctx.fillStyle = p.team || "white";
			ctx.moveTo(dx + (tsize / 2) - sp, dy - 4);
			ctx.lineTo(dx + (tsize / 2) + sp, dy - 4);
			ctx.lineTo(dx + (tsize / 2), dy + 5);
			ctx.fill();
			ctx.fillStyle = "white";
			ctx.fillText(p.name, dx + tsize / 2, (p.id != myId && p.health < 100) ? dy - 16 : dy - 8);
		} else {
			ctx.fillStyle = p.team || "white";
			ctx.fillText(p.name, dx + tsize / 2, (p.id != myId && p.health < 100) ? dy - 8 : dy);
		}
	},
	frames(p) {
		if (p.id == myId) {
			editor.frame++;
			if (editor.frame > 3) editor.frame = 0;
			if (!p || editor.enabled) return p.frame = frame = 0;
		}

		if (typeof p.stamina == "undefined") p.stamina = 100;

		if ((p.x != p.dx || p.y != p.dy) && !ui.death) {
			p.frame++;
			p.hunger -= 0.02;
			const angle = Math.atan2(0, Math.abs(p.dx - p.x));
			if (p.speed > 5) {
				p.stamina -= 1;
				if (p.stamina < 0) {
					p.stamina = 0;
					p.staminaCooldown = true;
				}
				particles.add(20, {
					x: p.x + tsize / 2,
					y: p.y + tsize - 20,
					z: 0,
					radius: 5 + Math.random() * 5,
					speed: 0.5,
					gravity: 0,
					color: "lightgray",
					type: "smoke",
					opacity: 0.4,
					shape: "circle",
					angle,
					scene: p.scene,
				});
			} else {
				p.stamina += p.staminaCooldown ? 0.8 : 0.1;
				if (p.stamina > 100) p.stamina = 100;
				if (p.stamina >= 20) p.staminaCooldown = false;
			}
		} else {
			p.frame = 0;
			p.stamina += 1;
			if (p.stamina > 100) p.stamina = 100;
			if (p.stamina >= 20) p.staminaCooldown = false;
		}
		if (p.frame > 3) p.frame = 0;

		if (
			p.hunger >= 100 &&
			p.health < 100 &&
			Number.isInteger(p.health) &&
			p.health > 0
		) particles.add(1, {
			x: Math.floor(Math.random() * (tsize - 20) + 10),
			y: tsize - 20,
			z: 1,
			shape: 0,
			opacity: 1,
			type: "health",
			radius: 12,
			gravity: 0,
			angle: -Math.PI / 2,
			id: p.id,
			scene: p.scene,
		});

		if (p.id != myId) return;

		map[p.scene].layers.scenery.forEach((t, i) => {
			const f = map[p.scene].furnace[i];
			if (!f) return;
			if (t != 72 || f?.inputId <= 0 || f?.cooked > 99 || f?.fuelLevel <= 0) return;
			const x = i % map[p.scene].cols, y = (i - x) / map[p.scene].cols;
			particles.add(10, {
				x: x * tsize + Math.random() * tsize,
				y: y * tsize + Math.random() * (tsize - tsize / 2),
				z: 1,
				radius: 5 + Math.random() * 5,
				speed: 0.5,
				gravity: -1,
				color: "lightgray",
				type: "smoke",
				opacity: 0.4,
				shape: "circle",
				angle: Math.atan2(0, 0),
				scene: p.scene,
			});
		});

		frame++;
		if (frame > 3) frame = 0;

		if (ui.death) return;

		p.cooldown--;
		if (p.cooldown < 0) p.cooldown = 0;

		p.hunger -= 0.02;
		if (p.speed > 5) p.hunger -= 0.02;
		if (p.hunger < 0) p.hunger = 0;
		if (p.hunger > 150) p.hunger = 150;
		if (p.hunger <= 0) p.health -= 0.1;

		let c, r;
		c = Math.floor(p.dx / tsize);
		r = Math.floor(p.dy / tsize);
		if (enemies.walls(p.scene)[getIndex(p.scene, c, r)] == 1 && !p.bed && !p.minecart && !p.boat) {
			p.health -= 0.5;
			if (
				enemies.walls(p.scene)[getIndex(p.scene, c + 1, r)] == 1 &&
				enemies.walls(p.scene)[getIndex(p.scene, c - 1, r)] == 1 &&
				enemies.walls(p.scene)[getIndex(p.scene, c, r + 1)] == 1 &&
				enemies.walls(p.scene)[getIndex(p.scene, c, r - 1)] == 1
			) p.health -= 0.5;
		} else if (p.hunger >= 100) p.health += 0.5;
		if (p.health > 100) p.health = 100;
		if (p.health < 0) p.health = 0;
	},
	toggleBed(p) {
		if (!p) return;

		if (p.bed) {
			const openSpots = [], range = 1;
			for (let x = -range; x <= range; x++) {
				for (let y = -range; y <= range + 1; y++) {
					openSpots.push({ x: Math.floor(p.dx / tsize) + x, y: Math.floor(p.dy / tsize) + y });
				}
			}
			openSpots.every(c => {
				if (getTile(p.scene, "scenery", c.x, c.y) == -1) { p.dx = c.x * tsize; p.dy = c.y * tsize; return false }
				else return true;
			});
			p.respawnX = p.x = p.dx;
			p.respawnY = p.y = p.dy;
			p.respawnScene = p.scene;
			p.bed = false;
		} else {
			if (p.dir == 1) p.dy -= tsize;
			else if (p.dir == 0) p.dy += tsize;
			else if (p.dir == 2) p.dx -= tsize;
			else if (p.dir == 3) p.dx += tsize;
			if (getTile(p.scene, "scenery", Math.floor(p.dx / tsize), Math.floor(p.dy / tsize)) == 133) p.dy -= tsize;
			if (
				Object.values(players).some(v => v.bed == getIndex(
					p.scene,
					Math.floor(p.dx / tsize),
					Math.floor(p.dy / tsize)
				) + "-" + p.scene && v.bed && v.id != p.id)
			) return;
			p.dir = 0;
			p.x = p.dx;
			p.y = p.dy;
			p.bed = getIndex(p.scene, Math.floor(p.dx / tsize), Math.floor(p.dy / tsize)) + "-" + p.scene;
		}
		if (socket.connected && online) socket.emit("update player", p);
	},
	toggleMinecart(p, e) {
		if (!p) return;
		touching = {};

		if (typeof p.minecart == "number") {
			p.x = p.dx = e.x = e.dx;
			p.y = p.dy = e.y = e.dy;
			e.moving = false;
			if (socket.connected && online) socket.emit("update entity", [e, p.minecart])
			const openSpots = [], range = 1;
			for (let x = -range; x <= range; x++) {
				for (let y = -range; y <= range + 1; y++) {
					openSpots.push({ x: Math.floor(e.dx / tsize) + x, y: Math.floor(e.dy / tsize) + y });
				}
			}
			openSpots.every(c => {
				if (getTile(p.scene, "scenery", c.x, c.y) == -1) {
					p.x = p.dx = c.x * tsize;
					p.y = p.dy = c.y * tsize;
					return false;
				}
				else return true;
			});
			p.minecart = false;
		} else {
			if (p.dir == 1) p.dy -= tsize;
			else if (p.dir == 0) p.dy += tsize;
			else if (p.dir == 2) p.dx -= tsize;
			else if (p.dir == 3) p.dx += tsize;
			p.x = p.dx;
			p.y = p.dy;
			p.minecart = map[p.scene].entities.indexOf(e);
			if (e.dir == 0) p.dir = 2;
			else p.dir = 0;
		}
		if (socket.connected && online) socket.emit("update player", p);
	},
	toggleBoat(p, e) {
		if (!p) return;
		touching = {};

		if (typeof p.boat == "number") {
			p.x = p.dx = e.x = e.dx;
			p.y = p.dy = e.y = e.dy;
			e.moving = false;
			if (socket.connected && online) socket.emit("update entity", [e, p.boat]);
			if (p.dir == 0) p.dy += tsize;
			else if (p.dir == 1) p.dy -= tsize;
			else if (p.dir == 2) p.dx -= tsize;
			else if (p.dir == 3) p.dx += tsize;
			p.x = p.dx;
			p.y = p.dy;
			p.boat = false;
		} else {
			if (p.dir == 1) p.dy -= tsize;
			else if (p.dir == 0) p.dy += tsize;
			else if (p.dir == 2) p.dx -= tsize;
			else if (p.dir == 3) p.dx += tsize;
			p.x = p.dx;
			p.y = p.dy;
			p.boat = map[p.scene].entities.indexOf(e);
			p.dir = e.dir;
		}
		if (socket.connected && online) socket.emit("update player", p);
	},
	updateMinecart(p, e) {
		if (!p) return;
		const prev = { x: e.x, y: e.y }, rails = [172, 173, 174, 175, 176, 177], movement = {
			u: keys[controls[p.controls].up] || gp.up(),
			d: keys[controls[p.controls].down] || gp.down(),
			l: keys[controls[p.controls].left] || gp.left(),
			r: keys[controls[p.controls].right] || gp.right(),
		};
		if (!e) player.toggleMinecart(p, e);
		Object.values(movement).forEach(v => (v) ? e.moving = true : "");
		if (!e.moving) return touching["minecart"] = e;
		const i = map[p.scene].entities.indexOf(e);
		let c, r, tile;
		c = Math.floor(e.dx / tsize);
		r = Math.floor(e.dy / tsize);
		tile = getTile(p.scene, "scenery", c, r);
		if (tile == 172) e.dir = 1;
		else if (tile == 173) e.dir = 0;
		else if (rails.indexOf(tile) > 1 && e.x == e.dx && e.y == e.dy) {
			if (e.dir == 0) e.dir = 1; else e.dir = 0;
			if (tile == 174) {
				if (e.dir == 0) p.dir = 3;
				else p.dir = 0;
			} else if (tile == 175) {
				if (e.dir == 0) p.dir = 3;
				else p.dir = 1;
			} else if (tile == 176) {
				if (e.dir == 0) p.dir = 2;
				else p.dir = 1;
			} else if (tile == 177) {
				if (e.dir == 0) p.dir = 2;
				else p.dir = 0;
			}
		}
		if (e.dir == 1) {
			if (movement.u) p.dir = 1; else if (movement.d) p.dir = 0;
			if (p.dir == 1) r--; else r++;
			tile = getTile(p.scene, "scenery", c, r);
			if (rails.includes(tile) && e.x == e.dx && e.y == e.dy) {
				if (p.dir == 0) e.dy += tsize;
				else if (p.dir == 1) e.dy -= tsize;
			}
		} else {
			if (movement.l) p.dir = 2; else if (movement.r) p.dir = 3;
			if (p.dir == 2) c--; else c++;
			tile = getTile(p.scene, "scenery", c, r);
			if (rails.includes(tile) && e.x == e.dx && e.y == e.dy) {
				if (p.dir == 3) e.dx += tsize;
				else if (p.dir == 2) e.dx -= tsize;
			}
		}
		e.x += e.speed * Math.sign(e.dx - e.x);
		e.y += e.speed * Math.sign(e.dy - e.y);
		p.dx = p.x = e.x;
		p.dy = p.y = e.y;
		touching["minecart"] = e;
		if (
			(e.x != prev.x || e.y != prev.y) &&
			socket.connected &&
			online
		) socket.emit("update entity", [e, i]);
	},
	updateBoat(p, e) {
		if (!p) return;
		const prev = { x: e.x, y: e.y }, movement = {
			u: keys[controls[p.controls].up] || gp.up(),
			d: keys[controls[p.controls].down] || gp.down(),
			l: keys[controls[p.controls].left] || gp.left(),
			r: keys[controls[p.controls].right] || gp.right(),
		};
		if (!e) player.toggleBoat(p, e);
		Object.values(movement).forEach(v => (v) ? e.moving = true : "");
		let c, r, tile;
		c = Math.floor(e.dx / tsize);
		r = Math.floor(e.dy / tsize);
		if (e.dir == 0) r++;
		if (e.dir == 1) r--;
		if (e.dir == 2) c--;
		if (e.dir == 3) c++;
		tile = getTile(p.scene, "ground", c, r);
		if (!e.moving) return touching["boat"] = (tile != 40) ? e : "";
		const i = map[p.scene].entities.indexOf(e);
		if (movement.u && e.x == e.dx && e.y == e.dy) { e.dy -= tsize; e.dir = 1 }
		if (movement.d && e.x == e.dx && e.y == e.dy) { e.dy += tsize; e.dir = 0 }
		if (movement.l && e.x == e.dx && e.y == e.dy) { e.dx -= tsize; e.dir = 2 }
		if (movement.r && e.x == e.dx && e.y == e.dy) { e.dx += tsize; e.dir = 3 }
		c = Math.floor(e.dx / tsize);
		r = Math.floor(e.dy / tsize);
		tile = getTile(p.scene, "ground", c, r);
		if (
			tile != 40 ||
			c < 0 ||
			r < 0 ||
			c > map[p.scene].cols - 1 ||
			r > map[p.scene].rows - 1
		) { e.dx = e.x; e.dy = e.y }
		e.x += e.speed * Math.sign(e.dx - e.x);
		e.y += e.speed * Math.sign(e.dy - e.y);
		p.dx = p.x = e.x;
		p.dy = p.y = e.y;
		p.dir = e.dir;
		c = Math.floor(e.dx / tsize);
		r = Math.floor(e.dy / tsize);
		if (e.dir == 0) r++;
		if (e.dir == 1) r--;
		if (e.dir == 2) c--;
		if (e.dir == 3) c++;
		tile = getTile(p.scene, "ground", c, r);
		touching["boat"] = (tile != 40) ? e : "";
		if (
			(e.x != prev.x || e.y != prev.y) &&
			socket.connected &&
			online
		) socket.emit("update entity", [e, i]);
	},
	updateArrow(p, e) {
		e.x += Math.cos(e.angle - Math.PI / 4) * e.speed;
		e.y += Math.sin(e.angle - Math.PI / 4) * e.speed;
		if (
			e.x < 0 ||
			e.y < 0 ||
			e.x > map[p.scene].cols * tsize ||
			e.y > map[p.scene].rows * tsize ||
			enemies.walls(p.scene)[
			getIndex(p.scene, Math.floor(e.x / tsize), Math.floor(e.y / tsize))
			] == 1 ||
			e.speed.toFixed(0) == 0
		) {
			if (socket.connected && online) socket.emit("remove entity", map[p.scene].entities.indexOf(e));
			map[p.scene].entities.splice(map[p.scene].entities.indexOf(e), 1);
			return;
		}
		if (socket.connected && online) socket.emit("update entity", [e, map[p.scene].entities.indexOf(e)]);
	},
	checkHits(p) {
		Object.values(map[p.scene].entities).forEach(e => {
			if (!e || e.id != 2) return;
			if (e.from == myId) player.updateArrow(p, e);
			else if (
				colliding({
					x: e.x,
					y: e.y,
					w: 0,
					h: 0,
				}, {
					x: p.x,
					y: p.y,
					w: tsize,
					h: tsize,
				}) &&
				!p.bed &&
				p.cooldown == 0 &&
				(players[e.from].team != p.team && p.team)
			) {
				if (
					p.dx == p.respawnX &&
					p.dy == p.respawnY &&
					p.scene == p.respawnScene &&
					p.dir == 0
				) return;
				gp.vibrate(10);
				const d = (p.headArmor + p.bodyArmor + p.legArmor + 4) > e.speed * 2 ? 2 : (p.headArmor + p.bodyArmor + p.legArmor + 4);
				p.health -= Math.floor(e.speed * 2 / d);
				p.cooldown = 2;
				if (socket.connected && online) socket.emit("remove entity", map[p.scene].entities.indexOf(e));
				map[p.scene].entities.splice(map[p.scene].entities.indexOf(e), 1);
			}
		});
		Object.values(players).concat(map[p.scene].entities.filter(e => e?.enemy)).forEach(v => {
			if (v.id == myId) return;
			const openSpots = [];
			openSpots.push({ x: Math.floor(p.dx / tsize) + 1, y: Math.floor(p.dy / tsize), dir: 2 });
			openSpots.push({ x: Math.floor(p.dx / tsize) - 1, y: Math.floor(p.dy / tsize), dir: 3 });
			openSpots.push({ x: Math.floor(p.dx / tsize), y: Math.floor(p.dy / tsize) + 1, dir: 1 });
			openSpots.push({ x: Math.floor(p.dx / tsize), y: Math.floor(p.dy / tsize) - 1, dir: 0 });
			openSpots.push({ x: Math.floor(p.dx / tsize), y: Math.floor(p.dy / tsize), dir: v.dir });
			openSpots.every(c => {
				if (
					colliding({
						x: v.x,
						y: v.y,
						w: tsize,
						h: tsize,
					}, {
						x: p.x,
						y: p.y,
						w: tsize,
						h: tsize,
					}) &&
					v.rotate != 0 &&
					v.rotate != 0 && (
						itemStats[v.i[v.holding]].type == "sword" ||
						itemStats[v.i[v.holding]].type == "axe"
					) &&
					!v.editor &&
					v.dir == c.dir &&
					!text.toggled &&
					p.cooldown == 0 &&
					!p.bed &&
					(v.team != p.team || !p.team || v.enemy || v.animal)
				) {
					if (
						p.dx == p.respawnX &&
						p.dy == p.respawnY &&
						p.scene == p.respawnScene &&
						p.dir == 0
					) return;
					gp.vibrate(10);
					p.health -= Math.floor(Math.max(itemStats[v.i[v.holding]].power / (p.headArmor + p.bodyArmor + p.legArmor), 2));
					p.cooldown = 2;
					const dx = p.dx, dy = p.dy;
					if (c.dir == 0) p.dy = p.y = (c.y + 2) * tsize;
					else if (c.dir == 1) p.dy = p.y = (c.y - 2) * tsize;
					else if (c.dir == 2) p.dx = p.x = (c.x - 2) * tsize;
					else if (c.dir == 3) p.dx = p.x = (c.x + 2) * tsize;
					else if (v.dir == 0) p.dy = p.y = (Math.floor(v.dy / tsize) - 1) * tsize;
					else if (v.dir == 1) p.dy = p.y = (Math.floor(v.dy / tsize) + 1) * tsize;
					else if (v.dir == 2) p.dx = p.x = (Math.floor(v.dx / tsize) + 1) * tsize;
					else if (v.dir == 3) p.dx = p.x = (Math.floor(v.dx / tsize) - 1) * tsize;
					if (enemies.walls(p.scene)[getIndex(p.scene, Math.floor(p.dx / tsize), Math.floor(p.dy / tsize))] == 1) {
						p.dx = p.x = dx;
						p.dy = p.y = dy;
					}
					p.dx = Math.floor(p.dx / tsize) * tsize;
					p.dy = Math.floor(p.dy / tsize) * tsize;
					if (workbench.toggled) workbench.toggle();
					if (backpack.toggled) backpack.toggle();
					if (chest.toggled) chest.toggle();
					if (furnace.toggled) furnace.toggle();
					if (wardrobe.toggled) wardrobe.toggle();
					return false;
				} else return true;
			});
		});
		if (p.health <= 0) {
			p.health = 0;
			ui.showDeathScreen(p);
		}
	},
	update(p) {
		if (ui.death || tutorial) return;
		if (!p.controls) p.controls = "right";
		if (!p.speed) p.speed = 5;
		if (p.team) p.bodyColor = p.team;
		[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(i => (keys[i] && !chat.toggled && !pause.toggled) ? p.holding = i - 1 : "");
		if (gp.lb()) p.holding--;
		if (gp.rb()) p.holding++;
		if (p.holding > 8) p.holding = 0;
		if (p.holding < 0) p.holding = 8;
		p.editor = editor.enabled;
		p.cx = camera.x;
		p.cy = camera.y;
		if (p.bed && daylight.level < 15) player.toggleBed(p);
		if (typeof p.minecart == "number" && !editor.enabled) player.updateMinecart(p, map[p.scene].entities[p.minecart]);
		if (typeof p.boat == "number" && !editor.enabled) player.updateBoat(p, map[p.scene].entities[p.boat]);
		player.checkHits(p);
		if (
			boss.lorax.f == p.id ||
			camera.setFade != 0 ||
			text.toggled ||
			p.bed ||
			typeof p.minecart == "number" ||
			typeof p.boat == "number" ||
			chat.toggled ||
			pause.toggled ||
			editor.enabled ||
			ui.toggled
		) return;
		p.i.forEach((v, i) => (typeof v != "object") ? p.i[i] = { item: v, amount: 1 } : "");
		p.b.forEach((v, i) => (typeof v != "object") ? p.b[i] = { item: v, amount: 1 } : "");
		p.i.forEach(v => v.amount > maxItems ? v.amount = maxItems : "");
		p.b.forEach(v => v.amount > maxItems ? v.amount = maxItems : "");
		p.i.forEach(v => { if (v.amount <= 0 || (v.item == -1 && v.amount > 1)) { v.amount = 0; v.item = -1 } });
		p.b.forEach(v => { if (v.amount <= 0 || (v.item == -1 && v.amount > 1)) { v.amount = 0; v.item = -1 } });
		p.i.forEach(v => !itemStats[v.item].stackable ? v.amount = 1 : "");
		p.b.forEach(v => !itemStats[v.item].stackable ? v.amount = 1 : "");

		if (p.x == p.dx && p.y == p.dy) {
			if (keys["Shift"] && p.hunger >= 25 && p.stamina > 0 && !p.staminaCooldown) p.speed = 8;
			else p.speed = 5;
		}
		if ((keys[controls[p.controls].up] || gp.up()) && p.x == p.dx && p.y == p.dy) { p.dy -= tsize; p.dir = 1 }
		if ((keys[controls[p.controls].down] || gp.down()) && p.x == p.dx && p.y == p.dy) { p.dy += tsize; p.dir = 0 }
		if ((keys[controls[p.controls].left] || gp.left()) && p.x == p.dx && p.y == p.dy) { p.dx -= tsize; p.dir = 2 }
		if ((keys[controls[p.controls].right] || gp.right()) && p.x == p.dx && p.y == p.dy) { p.dx += tsize; p.dir = 3 }

		let c, r, tile, index, entity;

		c = Math.floor(p.dx / tsize);
		r = Math.floor(p.dy / tsize);
		tile = getTile(p.scene, "scenery", c, r);
		entity = map[p.scene].entities.find(e => e && e.x == c * tsize && e.y == r * tsize && !e.enemy && !e.animal);

		const s = !dontCollide.includes(tile) || !dontCollide.includes(getTile(p.scene, "structure", c, r)) || getTile(p.scene, "ground", c, r) == 40 || entity;
		if (!editor.enabled && s) { p.dx = p.x; p.dy = p.y }
		if (p.dx < 0) p.x = p.dx = 0;
		if (p.dy < 0) p.y = p.dy = 0;
		if (p.dx / tsize > map[p.scene].cols - 1) p.x = p.dx = (map[p.scene].cols - 1) * tsize;
		if (p.dy / tsize > map[p.scene].rows - 1) p.y = p.dy = (map[p.scene].rows - 1) * tsize;

		p.x += p.speed * Math.sign(p.dx - p.x);
		p.y += p.speed * Math.sign(p.dy - p.y);
		p.zKey = gp.zKey() || keys[controls[p.controls].zKey];
		editor.scene = p.scene;
		if (p.zKey && p.i[p.holding].item != -1) p.rotate++;
		else p.rotate = 0;
		if (itemStats[p.i[p.holding].item].type == "food" && p.rotate >= 100 && p.hunger <= 100) {
			p.hunger += itemStats[p.i[p.holding].item].hunger;
			p.i[p.holding].amount--;
			p.rotate = 0;
			if (p.i[p.holding].amount < 1) p.i[p.holding] = { item: -1, amount: 1};
			if (p.hunger > 100) p.hunger = 150;
		}

		c = Math.floor(p.dx / tsize);
		r = Math.floor(p.dy / tsize);
		if (p.dir == 1) r -= 1;
		else if (p.dir == 0) r += 1;
		else if (p.dir == 2) c -= 1;
		else if (p.dir == 3) c += 1;
		tile = getTile(p.scene, "scenery", c, r);
		const ct = getTile(p.scene, "scenery", Math.floor(p.dx / tsize), Math.floor(p.dy / tsize));

		const door = getTile(p.scene, "structure", c, r);
		index = getIndex(p.scene, c, r);
		const teleport = [68, 77, 98, 99, 122, 123, 130];
		entity = map[p.scene].entities.find(e => e && e.x == c * tsize && e.y == r * tsize);
		touching = {};
		if (p.x == p.dx && p.y == p.dy && tile == 64 && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.workbench = true;
		else if (p.x == p.dx && p.y == p.dy && tile == 72 && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.furnace = { index };
		else if (p.x == p.dx && p.y == p.dy && (tile == 132 || tile == 133) && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.bed = true;
		else if (p.x == p.dx && p.y == p.dy && (tile == 134 || tile == 135) && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.wardrobe = true;
		else if (p.x == p.dx && p.y == p.dy && tile == 65 && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.chest = { index };
		else if (p.x == p.dx && p.y == p.dy && tile == 67 && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.sign = { t: map[p.scene].text[index] };
		else if (
			p.x == p.dx &&
			p.y == p.dy &&
			quickTp.includes(ct)
			&& (
				(p.dir == 1 && ct == 201) ||
				(p.dir == 2 && ct == 205) ||
				(p.dir == 0 && ct == 209) ||
				(p.dir == 3 && ct == 213)
			)) {
			camera.fadeTo(1, 500, true);
			setTimeout(() => {
				const t = map[players[myId].scene].teleport[getIndex(p.scene, Math.floor(p.dx / tsize), Math.floor(p.dy / tsize))];
				players[myId].scene = t.to;
				const x = map[players[myId].scene].cols - t.fromX;
				const y = map[players[myId].scene].rows - t.fromY;
				if (t.fromX == 0 || t.fromX == map[players[myId].scene].cols - 1) players[myId].dx = (x == 1) ? x * tsize : (x - 2) * tsize;
				else players[myId].dy = (y == 1) ? y * tsize : (y - 2) * tsize;
				players[myId].x = players[myId].dx;
				players[myId].y = players[myId].dy;
			}, 200);
		} else if (p.x == p.dx && p.y == p.dy && teleport.includes(tile) && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.teleporter = { t: map[p.scene].teleport[index], tile };
		else if (p.x == p.dx && p.y == p.dy && entity && !entity.moving && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching[entity.type] = entity;
		else if (p.x == p.dx && p.y == p.dy && map[p.scene].type == "house" && (index == map[p.scene].layers.scenery.length + map[p.scene].cols / 2 - 1 || index == map[p.scene].layers.scenery.length + map[p.scene].cols / 2)) touching.teleporter = { t: map[p.scene].from, tile: index };
		else if (p.x == p.dx && p.y == p.dy && teleport.includes(door) && c >= 0 && r >= 0 && c < map[p.scene].cols && r < map[p.scene].rows) touching.teleporter = { t: map[p.scene].teleport[index], tile: door };
		if (p.i.every(v => v.item == 24 && v.amount == maxItems) && p.b.every(v => v.item == 24 && v.amount == maxItems) && boss.lorax.f != myId) {
			boss.lorax.follow(p.id, 1);
			camera.follow("lorax");
		}
		if (
			p.zKey &&
			canBreak(p.i[p.holding].item, tile) &&
			p.x == p.dx &&
			p.y == p.dy &&
			(p.i.some(e => e.item == -1) ||
			p.b.some(e => e.item == -1) ||
			p.i.some(e => e.amount < maxItems && blockStats[tile].gives.some(i => e.item == i)) ||
			p.b.some(e => e.amount < maxItems && blockStats[tile].gives.some(i => e.item == i)))
		) {
			if (map[p.scene].break[index] >= 0) map[p.scene].break[index] += itemStats[p.i[p.holding].item].power / (50 * blockStats[tile].durability);
			else map[p.scene].break[index] = 0;
			if (Math.abs(map[p.scene].break[index] - Math.floor(map[p.scene].break[index])) < 0.1) {
				if (socket.connected && online) socket.emit("update break", [map[p.scene].break[index], p.scene, index]);
				gp.vibrate(5, 0.1);
			}
			if (map[p.scene].break[index] < 9) return;
			delete map[p.scene].break[index];
			blockStats[tile].gives.forEach(i => {
				if (blockStats[tile].stackable && p.i.some(e => e.amount < maxItems && e.item == i)) p.i[p.i.findIndex(e => e.amount < maxItems && e.item == i)].amount++;
				else if (blockStats[tile].stackable && p.b.some(e => e.amount < maxItems && e.item == i)) p.b[p.b.findIndex(e => e.amount < maxItems && e.item == i)].amount++;
				else if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: i, amount: 1 };
				else p.b[p.b.findIndex(e => e.item == -1)] = { item: i, amount: 1 };
			});
			player.getLvl(blockStats[tile].xp);
			const prev = itemStats[blockStats[map[p.scene].layers.scenery[getIndex(p.scene, c, r)]].gives[0]].placeId;
			map[p.scene].layers.scenery[getIndex(p.scene, c, r)] = -1;
			delete map[p.scene].chest[getIndex(p.scene, c, r)];
			delete map[p.scene].furnace[getIndex(p.scene, c, r)];
			editor.updateAutotiling(c, r, prev, p.scene, "scenery");
			if (socket.connected && online) {
				socket.emit("update map", [map[players[myId].scene], players[myId].scene]);
				socket.emit("update break", [-1, p.scene, index]);
			}
		} else {
			if (map[p.scene].break[index]) {
				delete map[p.scene].break[index];
				if (socket.connected && online) socket.emit("update break", [-1, p.scene, index]);
			}
		}
		if (
			p.zKey &&
			entity?.type == "minecart" &&
			(p.i.some(e => e.item == -1) ||
				p.b.some(e => e.item == -1))
		) {
			if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: 54, amount: 1 };
			else p.b[p.b.findIndex(e => e.item == -1)] = { item: 54, amount: 1 };
			map[p.scene].entities.splice(map[p.scene].entities.indexOf(entity), 1);
			if (socket.connected && online) socket.emit("remove entity", map[p.scene].entities.indexOf(entity));
		}
		if (
			p.zKey &&
			entity?.type == "boat" &&
			(p.i.some(e => e.item == -1) ||
				p.b.some(e => e.item == -1))
		) {
			if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: 68, amount: 1 };
			else p.b[p.b.findIndex(e => e.item == -1)] = { item: 68, amount: 1 };
			map[p.scene].entities.splice(map[p.scene].entities.indexOf(entity), 1);
			if (socket.connected && online) socket.emit("remove entity", map[p.scene].entities.indexOf(entity));
		}

		if ((keys[controls[p.controls].cKey] || gp.cKey()) && itemStats[p.i[p.holding].item].placeable && !p.editor && !(p.zKey || gp.zKey())) {
			index = getIndex(p.scene, c, r);
			if (!(index > map[p.scene].cols * map[p.scene].rows - 1) && !map[p.scene]["structure"][index]) {
				if (tile == -1 && !itemStats[p.i[p.holding].item].placeOn) {
					if (itemStats[p.i[p.holding].item].name == "Chest") map[p.scene].chest[index] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
					if (itemStats[p.i[p.holding].item].name == "Furnace") map[p.scene].furnace[index] = {};
					if (autotilingMap[itemStats[p.i[p.holding].item].placeId]) {
						const e = itemStats[p.i[p.holding].item].placeId;
						map[p.scene].layers["scenery"][index] = editor.getAutotile(c, r, e, e, p.scene, "scenery");
						editor.updateAutotiling(c, r, e, p.scene, "scenery");
					} else map[p.scene].layers["scenery"][index] = itemStats[p.i[p.holding].item].placeId || p.i[p.holding].item * 1000;
					p.i[p.holding].amount--;
					if (socket.connected && online) socket.emit("update map", [map[players[myId].scene], players[myId].scene]);
				} else if (
					(itemStats[p.i[p.holding].item].placeOn?.includes(tile) ||
					itemStats[p.i[p.holding].item].placeOn?.includes(getTile(p.scene, "ground", c, r)))
				) {
					let dir = p.dir;
					if (itemStats[p.i[p.holding].item].type == "minecart") dir = (tile == 172) ? 1 : 0;
					map[p.scene].entities.push({
						type: itemStats[p.i[p.holding].item].type,
						id: itemStats[p.i[p.holding].item].id,
						speed: itemStats[p.i[p.holding].item].speed || 5,
						dir,
						moving: false,
						x: c * tsize,
						y: r * tsize,
						dx: c * tsize,
						dy: r * tsize,
					});
					p.i[p.holding].item = -1;
					if (socket.connected && online) socket.emit("update map", [map[players[myId].scene], players[myId].scene]);
				}
			}
		}
	},
	getLvl(xp = 50) {
		const p = players[myId];
		if (!p.xp) p.xp = 0;
		const l = (Math.floor(p.xp / 100) + 1) / 2;
		p.xp += Math.round(Math.max(xp / l, 1));
		p.xp = Math.max(Math.round(p.xp), 0);
	}
};