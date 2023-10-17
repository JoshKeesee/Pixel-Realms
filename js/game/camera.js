const camera = {
	x: 0,
	y: 0,
	zoom: 1,
	fade: 0,
	setX: 0,
	setY: 0,
	setZoom: 1,
	setFade: 0,
	smoothing: 0.2,
	f: "",
	s: false,
	update() {
		if (!boss[camera.f] && camera.f != myId) camera.follow(myId);
		const p = (players[camera.f]) ? players[camera.f] : boss[camera.f];
		if (!p) return;
		camera.set(p.x, p.y);
		if (editor.enabled) camera.set(p.mouse.x, p.mouse.y, 0.8);

		if (camera.f != "lorax" && !editor.enabled) {
			if (camera.setX < 0 && map[p.scene].cols >= Math.floor(ctx.canvas.width / tsize)) camera.setX = 0;
			if (camera.setY < 0 && map[p.scene].rows >= Math.floor(ctx.canvas.width / tsize)) camera.setY = 0;
			if (camera.setX + ctx.canvas.width > map[p.scene].cols * tsize && map[p.scene].cols >= Math.floor(ctx.canvas.width / tsize)) camera.setX = map[p.scene].cols * tsize - ctx.canvas.width;
			if (camera.setY + ctx.canvas.height > map[p.scene].rows * tsize && map[p.scene].rows >= Math.floor(ctx.canvas.width / tsize)) camera.setY = map[p.scene].rows * tsize - ctx.canvas.height;
		} else if (!editor.enabled) camera.setZoom = 1.5;

		const s = !camera.s ? camera.smoothing : 1;
		camera.x += s * (camera.setX - camera.x);
		camera.y += s * (camera.setY - camera.y);
		camera.zoom += s * (camera.setZoom - camera.zoom);
		camera.fade += camera.smoothing * (camera.setFade - camera.fade);
	},
	set(x, y, z = 1, s = 0.2) {
		camera.setX = x - ctx.canvas.width / 2 + tsize / 2;
		camera.setY = y - ctx.canvas.height / 2 + tsize / 2;
		camera.setZoom = z;
		camera.smoothing = s;
	},
	follow(id) {
		camera.f = id;
	},
	fadeTo(l, t, s = false) {
		this.s = s;
		this.setFade = l;
		if (t) setTimeout(() => this.fadeTo(0), t);
	},
	drawFade() {
		ctx.globalAlpha = camera.fade;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},
};