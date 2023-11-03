const leaderboard = {
	toggled: false,
	arr: {},
	setX: 0,
	x: 0,
	maxW: 400,
	maxH: 0,
	lastHeight: 400,
	draw() {
		leaderboard.maxH = lighting.canvas.height / 1.5;
		const p = players[myId];
		const margin = 10,
			padding = 10,
			lph = 20,
			x = Math.floor(leaderboard.x) + margin,
			y = tsize,
			c = colliding(p.mouse, { x, y, w: tsize / 1.5, h: tsize / 1.5 }),
			s = c ? tsize / 1.4 : tsize / 1.5;
		lighting.drawImage(
			images["leaderboard"],
			0,
			0,
			tsize,
			tsize,
			c ? x - 2 : x,
			c ? y - 2 - margin : y - margin,
			s,
			s
		);
		lighting.beginPath();
		lighting.fillStyle = "rgba(0, 0, 100, 0.8)";
		lighting.strokeStyle = "rgb(0, 0, 255)";
		lighting.roundRect(
			(-leaderboard.maxW - 2 - padding * 2) + Math.floor(leaderboard.x),
			y - padding,
			leaderboard.maxW + padding * 2,
			leaderboard.lastHeight + padding * 2,
			10
		);
		lighting.fill();
		lighting.stroke();
		lighting.closePath();
		let y2 = y;
		Object.values(leaderboard.arr).sort((a, b) => a.xp - b.xp).filter((e, i) => i * (lph + margin) < leaderboard.maxH).forEach((e, i) => {
			leaderboard.lastHeight = ((i + 1) * (lph + margin)) - margin;
			const xp = Math.floor(e.xp / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			lighting.beginPath();
			lighting.fillStyle = e.color || "black";
			lighting.font = lph + "px pixel";
			lighting.roundRect(
				-leaderboard.maxW + Math.floor(leaderboard.x) + padding,
				y2,
				leaderboard.maxW - padding * 2,
				lph + margin / 2,
				10
			);
			lighting.fill();
			lighting.closePath();
			lighting.fillStyle = "white";
			lighting.textAlign = "left";
			lighting.fillText(
				(i + 1) + ") " + e.name,
				-leaderboard.maxW + (Math.floor(leaderboard.x) + margin / 2) + padding,
				y2 + lph
			);
			lighting.textAlign = "right";
			lighting.fillText(
				"XP Level " + xp,
				-leaderboard.maxW + (2 * Math.floor(leaderboard.x) - margin / 2) - padding,
				y2 + lph
			);
			y2 += lph + margin;
		});
		if (c && p.mouse.click) leaderboard.toggled = !leaderboard.toggled;
		leaderboard.setX = leaderboard.toggled ? leaderboard.maxW : 0;
		leaderboard.x += 0.2 * (leaderboard.setX - leaderboard.x);
	},
};