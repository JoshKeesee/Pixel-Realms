const ctx = document.createElement("canvas").getContext("2d");
document.body.appendChild(ctx.canvas);
const lighting = document.createElement("canvas").getContext("2d");
document.body.appendChild(lighting.canvas);
let startTime = performance.now(), startFrames = startTime, startFPS = startTime, startDaylight = startTime, startFurnace = startTime, f = 0;

function colliding(r1, r2) {
	return !(
		r1.x > r2.x + r2.w ||
		r1.x + r1.w < r2.x ||
		r1.y > r2.y + r2.h ||
		r1.y + r1.h < r2.y
	);
}

const game = {
	loop() {
		Object.keys(buffer).forEach(k => {
			if (!buffer[k] || !players[k]) return;
			buffer[k].x += 0.8 * (players[k].x - buffer[k].x);
			buffer[k].y += 0.8 * (players[k].y - buffer[k].y);
			buffer[k].health = players[k].health;
		});
		if (!players[myId] || !map || !readyToAnimate) return;
		if (!players || !map || !map[players[myId].scene]) return editor.scene = players[myId].scene = map.length - 1;
		player.update(players[myId]);
		map.filter((sc, s) => Object.values(players).some(p => p.scene == s)).forEach(m => m.entities.filter(e => e.enemy).forEach(e => enemies.update(e)));
		map.filter((sc, s) => Object.values(players).some(p => p.scene == s)).forEach(m => m.entities.filter(e => e.animal).forEach(e => animals.update(e)));
		Object.keys(boss).forEach(b => boss[b].update());
		camera.update();
	},
	sendUpdates(pSave) {
		if (!socket.connected || !online) return;
		const origP = JSON.parse(pSave), pChanges = {};
		Object.keys(players[myId]).forEach(k => (origP[k] != players[myId][k] && k != "frame") ? pChanges[k] = players[myId][k] : "");
		if (
			pChanges?.x ||
			pChanges?.dir ||
			pChanges?.y ||
			pChanges?.scene
		) {
			pChanges.x = players[myId].x;
			pChanges.y = players[myId].y;
			pChanges.dx = players[myId].dx;
			pChanges.dy = players[myId].dy;
			pChanges.dir = players[myId].dir;
			pChanges.scene = players[myId].scene;
		}
		if (
			pChanges?.health ||
			pChanges?.hunger
		) {
			pChanges.health = players[myId].health;
			pChanges.hunger = players[myId].hunger;
		}
		if (
			Object.keys(pChanges).length != 0
		) socket.emit("update player", pChanges);
	},
	daylight() {
		if ((socket.connected && online) || !readyToAnimate) return;
		if (players[myId]?.bed) daylight.level = 0;
		else daylight.level++;
		if (daylight.level == 15) animals.despawn();
		if (daylight.level == 24 || daylight.level == 0) enemies.despawn();
		map.forEach((m, scene) => {
			if (m.type != "house") {
				const maxEntities = Math.floor(Math.random() * 2);
				for (let i = 0; i < maxEntities; i++) {
					if (daylight.level >= 15) enemies.spawn({ scene });
					else if (m.type != "cave") animals.spawn({ scene });
				}
			}
		});
	},
	furnace() {
		if (!readyToAnimate || !map || !players) return;
		const p = players[myId];
		const origFurnace = p.furnace;
		Object.keys(map[p.scene].furnace).forEach(f => {
			if (f == origFurnace) return;
			p.furnace = f;
			furnace.updateData();
			furnace.updateValue();
			furnace.sync(false);
		});
		p.furnace = origFurnace;
		furnace.updateData();
		furnace.updateValue();
		furnace.sync(false);
	},
	wait(ms) {
		return new Promise(res => setTimeout(res, ms));
	},
	animate() {
		requestAnimationFrame(game.animate);
	
		const t = performance.now();
		if (t - startFPS < 1000 / FPS) return;
		const pSave = JSON.stringify(players[myId]);
		startFPS = t - (t - startFPS) % (1000 / FPS);
		game.loop();
		if (!readyToAnimate) particles.animate(ptc);
	
		if (t - startFrames >= 150) {
			if (!players[myId] || !map || !readyToAnimate) return;
			startFrames = t;
			Object.values(players).forEach(p => p.scene == players[myId].scene ? player.frames(p) : "");
			map.filter((sc, s) => Object.values(players).some(p => p.scene == s)).forEach(m => m.entities.filter(e => e.enemy).forEach(e => enemies.frames(e)));
			map.filter((sc, s) => Object.values(players).some(p => p.scene == s)).forEach(m => m.entities.filter(e => e.animal).forEach(e => animals.frames(e)));
			backpack.update(players[myId].b);
			if (chest.i > -1 && map[players[myId].scene].chest[chest.i]) chest.update(map[players[myId].scene].chest[chest.i], false);
		}
	
		if (t - startDaylight >= 24 * 60000 / 24) {
			startDaylight = t;
			game.daylight();
		}

		if (t - startFurnace >= 1000) {
			startFurnace = t;
			game.furnace();
		}
	
		if (gp.connected) gp.updateGamepad();
		if (!map || !map[players[myId]?.scene] || !readyToAnimate) return;
	
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
		ctx.globalAlpha = 1.0;
	
		ctx.save();
		ctx.translate((ctx.canvas.width / 2), (ctx.canvas.height / 2));
		ctx.scale(camera.zoom.toFixed(3), camera.zoom.toFixed(3));
		ctx.translate(
			-camera.x.toFixed(0) - ctx.canvas.width / 2,
			-camera.y.toFixed(0) - ctx.canvas.height / 2
		);
	
		Object.keys(map[players[myId].scene].layers).forEach(l => drawLayer(l, players[myId].scene));
		drawLayer("break", players[myId].scene);
	
		map[players[myId].scene].entities.forEach(e => e && !e.enemy && !e.animal ? drawEntity(e) : "");
	
		editor.scene = players[myId].scene;
		if (editor.enabled) editor.run();

		particles.animate(ctx);
	
		const pc = Object.values(players).concat(map[players[myId].scene].entities.filter(e => e?.enemy)).concat(map[players[myId].scene].entities.filter(e => e?.animal));
		pc.sort((a, b) => a.y - b.y).forEach(e => e.enemy ? enemies.draw(e) : e.animal ? drawEntity(e) : player.draw(players[e.id]));

		particles.animate(ctx, 1);
	
		drawLayer("structure", players[myId].scene);
	
		pc.sort((a, b) => a.y - b.y).forEach(p => {
			if (!p.enemy && !p.animal) player.drawNametag(p);
			if (p.health != 100) health.drawHealthBar(p);
		});
	
		Object.values(boss).forEach(b => b.draw());
		activeButtons.check(players[myId]);
		ctx.restore();
		camera.drawFade();
		lighting.canvas.width = ctx.canvas.width;
		lighting.canvas.height = ctx.canvas.height;
		lighting.globalAlpha = editor.enabled ? 0 : daylight.fade;
		lighting.clearRect(0, 0, lighting.canvas.width, lighting.canvas.height);
		lighting.fillStyle = "black";
		lighting.fillRect(0, 0, lighting.canvas.width, lighting.canvas.height);
		daylight.drawLighting(players[myId].scene);
		lighting.globalCompositeOperation = "source-over";
		lighting.globalAlpha = 1;
		daylight.draw(players[myId].scene);
		if (editor.enabled) editor.drawCenter();
		else health.draw(players[myId]);
		if (boss.lorax.f != myId && !text.toggled) inventory.draw(players[myId]);
	
		f++;
		if (t - startTime > 1000) {
			if (ui.fps) ui.fps.innerText = (f / ((t - startTime) / 1000)).toFixed(1) + " FPS";
			startTime = t;
			f = 0;
			const start = performance.now();
			if (socket.connected && online) socket.emit("ping", () => {
				players[myId].ping = (performance.now() - start).toFixed(1);
				if (ui.ping) ui.ping.style.opacity = 1;
				if (ui.ping) ui.ping.innerText = "Ping " + players[myId].ping;
				else if (ui.ping) ui.ping.style.opacity = 0;
			});
		}
	
		if (document.querySelector("#pause-container .button-1")) document.querySelector("#pause-container .button-1").innerText = "Controls: " + players[myId].controls + " handed";
	
		if (socket.connected && online) {
			ui.updateOnlineSpots();
		
			if (keys["Tab"] && online && socket.connected) ui.showOnline();
			else ui.hideOnline();

			game.sendUpdates(pSave);
		}
	},
};

game.animate();