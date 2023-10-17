const ptc = document.createElement("canvas").getContext("2d");
ptc.canvas.id = "ptc";
ptc.canvas.style.zIndex = 1;
ptc.canvas.style.imageRendering = "auto";
ptc.canvas.width = window.innerWidth;
ptc.canvas.height = window.innerHeight;

const particles = {
	particles: [],
	add(amount, options = {}) {
		for (let i = 0; i < amount; i++) {
			const particle = {
				x: options.x >= 0 ? options.x : Math.random() * ptc.canvas.width,
				y: options.y >= 0 ? options.y : Math.random() * ptc.canvas.height,
				z: options.z >= 0 ? options.z : 0,
				speed: options.speed || Math.random() * 0.4 + 0.2,
				radius: options.radius || Math.random() * 4,
				angle: options.angle || Math.random() * 2 * Math.PI,
				gravity: options.gravity || 0,
				color: options.color || "gray",
				frame: options.frame || Math.random() * 100,
				opacity: options.opacity || Math.random(),
				type: options.type || "dust",
				shape: options.shape || typeof options.shape == "number" ? options.shape : "square",
				id: options.id,
				scene: options.scene,
			};

			this.particles.push(particle);
		}
	},
	addTo(el) {
		el.appendChild(ptc.canvas);
	},
	removeAll() {
		this.particles = [];
		document.querySelectorAll("#ptc")?.forEach(c => c.remove());
	},
	animate(c, z = 0) {
		ptc.clearRect(0, 0, c.canvas.width, c.canvas.height);
		ptc.canvas.width = window.innerWidth;
		ptc.canvas.height = window.innerHeight;
		if (readyToAnimate) {
			ptc.save();
			ptc.translate((ptc.canvas.width / 2), (ptc.canvas.height / 2));
			ptc.scale(camera.zoom.toFixed(3), camera.zoom.toFixed(3));
			ptc.translate(
				-camera.x.toFixed(0) - ptc.canvas.width / 2,
				-camera.y.toFixed(0) - ptc.canvas.height / 2
			);
		}
		this.particles.forEach((p, i) => {
			if ((p.scene != players[myId]?.scene && p.scene >= 0) || p.z != z) return;
			let x = p.x, y = p.y;
			p.frame++;
			p.x += p.speed * Math.cos(p.angle);
			p.y += p.speed * Math.sin(p.angle) + p.gravity;
			if (p.id) {
				x = players[p.id]?.x + p.x;
				y = players[p.id]?.y + p.y;
			}
			c.globalAlpha = p.opacity;
			if (typeof p.shape != "number") c.fillStyle = p.color;
			if (p.shape == "square") c.fillRect(p.x, p.y, p.radius, p.radius);
			else if (p.shape == "circle") {
				c.beginPath();
				c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				c.fill();
				c.closePath();
			} else c.drawImage(
				images["particles"],
				0,
				p.shape * p.radius,
				p.radius,
				p.radius,
				x,
				y,
				p.radius,
				p.radius
			);
			if (p.type == "dust") p.opacity -= 0.002;
			if (p.type == "smoke") p.opacity -= 0.01;
			if (p.type == "health") p.opacity -= 0.01;
			c.globalAlpha = 1.0;

			if (
				((p.x < 0 || p.x > ptc.canvas.width ||
				p.y < 0 || p.y > ptc.canvas.height) && p.type == "dust") ||
				p.opacity <= 0 ||
				p.radius <= 0
			) {
				this.particles.splice(i, 1);
				if (p.type == "dust") this.add(1);
			}
		});
		if (readyToAnimate) ptc.restore();
	},
};