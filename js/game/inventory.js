const inventory = {
	draw(p) {
		if (!p || editor.enabled) return;
		const s = 50;
		const x = lighting.canvas.width / 2 - (s * (p.i.length / 2));
		const y = lighting.canvas.height - s - lighting.lineWidth - 21;
		lighting.strokeStyle = "darkgray";
		lighting.lineWidth = 3;
		for (let i = 0; i < p.i.length; i++) {
			lighting.globalAlpha = 0.8;
			if (colliding(p.mouse, {
				x: i * s + x,
				y,
				w: s,
				h: s,
			})) {
				if (p.mouse.click) p.holding = i;
				lighting.fillStyle = "lightgray";
			} else lighting.fillStyle = "gray";
			lighting.fillRect(i * s + x, y, s, s);
			if (p.i[i] > -1) {
				const space = 10;
				lighting.drawImage(
					images["items"],
					(itemStats[p.i[i]].animate && itemStats[p.i[i]].type != "bow") ? p.i[i] * tsize + frame * tsize : p.i[i] * tsize,
					0,
					tsize,
					tsize,
					(i * s + x) + space / 2,
					y + space / 2,
					s - space,
					s - space
				);
			}
			lighting.globalAlpha = 1.0;
			lighting.strokeRect(i * s + x, y, s, s);
		}
		lighting.strokeStyle = "lightgray";
		lighting.fillStyle = "white";
		lighting.textAlign = "center";
		lighting.font = "12px pixel";
		lighting.lineWidth = 4;
		lighting.strokeRect(p.holding * s + x, y, s, s);
		lighting.fillText(itemStats[p.i[p.holding]].name, lighting.canvas.width / 2, y - 10);
	},
}