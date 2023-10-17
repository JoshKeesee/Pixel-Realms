const boss = {
	lorax: {
		x: 0,
		y: 0,
		dx: 0,
		dy: 0,
		f: "",
		speed: 10,
		draw() {
			if (!this.f) return;
			ctx.drawImage(
				images["boss"],
				frame * tsize,
				0,
				tsize,
				tsize,
				this.x,
				this.y,
				tsize,
				tsize,
			);
		},
		update() {
			if (!boss.lorax.f || camera.setFade != 0) return;
			const t = boss.lorax;
			let p;
			if (t.f != "leave") {
				p = players[t.f];
				t.dx = p.dx;
				t.dy = p.dy;
			} else if (t.x == t.dx && t.y == t.dy) {
				boss.lorax.follow("", 0);
				boss.lorax.speed = 10;
			}
			t.x += t.speed * Math.sign(t.dx - t.x);
			t.y += t.speed * Math.sign(t.dy - t.y);
			if (t.f != "leave" && t.x == p.dx && t.y == p.dy) {
				p.i = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
				p.b = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
				t.follow("leave");
				t.dx = 0;
				t.dy = 0;
				t.speed = 80;
				camera.follow(p.id);
			}
		},
		follow(id, f) {
			if (f) camera.fadeTo(f, 1000);
			this.f = id;
		},
	},
};