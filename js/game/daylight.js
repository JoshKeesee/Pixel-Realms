const daylight = {
	level: 0,
	fade: 0,
	draw(s) {
		if (this.level >= 24) this.level = 0;
		if (players[myId].bed) this.fade += 0.01 * (0.8 - this.fade);
		else {
			if (map[s].type == "cave") this.fade = 0.8;
			else if (this.level == 14 || this.level == 23) this.fade += 0.008 * (0.2 - this.fade);
			else if (this.level == 15 || this.level == 22) this.fade += 0.008 * (0.4 - this.fade);
			else if (this.level == 16 || this.level == 21) this.fade += 0.008 * (0.6 - this.fade);
			else if (this.level >= 17 && this.level <= 20) this.fade += 0.008 * (0.8 - this.fade);
			else this.fade += 0.008 * (0 - this.fade);
		}
		lighting.globalAlpha = (colliding({
			x: lighting.canvas.width / 2 - 30,
			y: 10,
			w: 60,
			h: 60,
		}, {
			x: players[myId].x - camera.x.toFixed(0),
			y: players[myId].y - camera.y.toFixed(0),
			w: tsize,
			h: tsize,
		})) ? 0.2 : 1.0;
		lighting.drawImage(
			images["daylight"],
			Math.floor(this.level) * tsize,
			0,
			tsize,
			tsize,
			lighting.canvas.width / 2 - 30,
			10,
			60,
			60
		);
		lighting.globalAlpha = 1.0;
	},
	drawLighting(s) {
		if (editor.enabled) return;
		const c = [];
		let i = -1;
		while ((i = map[s].layers.scenery.indexOf(32000, i + 1)) != -1) {
			const x = i % map[s].cols;
			const y = (i - x) / map[s].cols;
			c.push({ x: x * tsize + tsize / 2 - camera.x, y: y * tsize + tsize / 2 - camera.y });
		}
		i = -1;
		while ((i = map[s].layers.scenery.indexOf(72, i + 1)) != -1) {
			const x = i % map[s].cols;
			const y = (i - x) / map[s].cols;
			c.push({ x: x * tsize + tsize / 2 - camera.x, y: y * tsize + tsize / 2 - camera.y });
		}
		Object.keys(players).forEach(id => {
			const p = players[id];
			if (p.scene == s && p.i[p.holding].item == 32 && p.zKey) c.push({
				x: p.x + tsize / 2 - camera.x,
				y: p.y + tsize / 2 - camera.y,
			});
		});
		c.forEach(c => this.addLight(lighting, c));
		return lighting.canvas;
	},
	addLight(l, { x, y }) {
		const lightRadius = 600;
		if (
			players[myId].bed ||
			(x - lightRadius > l.canvas.width ||
			y - lightRadius > l.canvas.height ||
			x + lightRadius < 0 ||
			y + lightRadius < 0) ||
			daylight.fade.toFixed(1) == 0
		) return;
		l.globalCompositeOperation = "destination-out";
		l.drawImage(images["lighting"], x - lightRadius / 2, y - lightRadius / 2);
	},
}