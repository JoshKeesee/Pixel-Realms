const health = {
	draw(p) {
		if (!p) return;

		const padding = 10, scale = 2;
		lighting.drawImage(
			images["health"],
			padding,
			lighting.canvas.height - (tsize * 2) / scale - padding,
			tsize / scale,
			(tsize * 2) / scale
		);
		lighting.lineWidth = 2;
		lighting.beginPath();
		lighting.fillStyle = "white";
		lighting.rect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale / 2 - 3.5,
			160,
			10
		);
		lighting.fill();
		lighting.closePath();
		lighting.beginPath();
		lighting.fillStyle = "brown";
		lighting.fillRect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale / 2 - 2.6,
			this.getLevel((p.hunger > 100) ? 100 : p.hunger, 160),
			8.2
		);
		lighting.closePath();
		lighting.beginPath();
		lighting.strokeStyle = "black";
		lighting.strokeRect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale / 2 - 3.5,
			160,
			10
		);
		lighting.closePath();
		lighting.beginPath();
		lighting.fillStyle = "white";
		lighting.rect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale + tsize / scale / 2 - 3.5,
			200,
			10
		);
		lighting.fill();
		lighting.closePath();
		lighting.beginPath();
		lighting.fillStyle = "red";
		lighting.fillRect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale + tsize / scale / 2 - 2.6,
			this.getLevel(p.health, 200),
			8.2
		);
		lighting.closePath();
		lighting.beginPath();
		lighting.strokeStyle = "black";
		lighting.strokeRect(
			padding + tsize / scale,
			lighting.canvas.height - (tsize * 2) / scale - padding + tsize / scale + tsize / scale / 2 - 3.5,
			200,
			10
		);
		lighting.closePath();
	},
	drawHealthBar(p) {
		if (!p || p.editor || p.health <= 0 || p.health >= 100) return;
		if (p.scene != players[myId].scene || p.id == myId) return;
		let dx = p.x, dy = p.y;
		if (p.id != myId && !p.enemy && !p.animal) {
			dx = buffer[p.id].x;
			dy = buffer[p.id].y;
		}
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.fillRect(
			dx - 1,
			dy - 5,
			tsize + 2,
			10
		);
		ctx.closePath();
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.fillRect(
			dx,
			dy + 1 - 5,
			this.getLevel(p.health, tsize),
			8
		);
		ctx.closePath();
	},
	getLevel(curr, max) {
		return max - Math.round((max / 100) * (100 - curr));
	},
};