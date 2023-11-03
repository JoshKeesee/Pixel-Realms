const inventory = {
	draw(p) {
		if (!p || editor.enabled) return;
		const s = 52, sp = 4;
		const x = lighting.canvas.width / 2 - (50 * (p.i.length / 2)) + sp * 2;
		const y = lighting.canvas.height - s - lighting.lineWidth - 21;
		lighting.font = "12px pixel";
		for (let i = 0; i < p.i.length; i++) {
			if (p.holding != i) {
				if (colliding(p.mouse, {
					x: (i * s + x) - i * sp,
					y,
					w: s,
					h: s,
				})) {
					if (p.mouse.click) p.holding = i;
					lighting.filter = "brightness(150%)";
				}
				lighting.drawImage(
					images["inventory"],
					0,
					0,
					s,
					s,
					(i * s + x) - i * sp,
					y,
					s,
					s
				);
				lighting.filter = "brightness(100%)";
				if (p.i[i].item > -1) inventory.drawItem(i, s, p, x, y, sp);
			}
		}
		const i = p.holding;
		lighting.drawImage(
			images["inventory"],
			52,
			0,
			s,
			s,
			(i * s + x) - i * sp,
			y,
			s,
			s
		);
		if (p.i[i].item > -1) inventory.drawItem(i, s, p, x, y, sp);
		lighting.textAlign = "center";
		lighting.fillText(itemStats[p.i[p.holding].item].name, lighting.canvas.width / 2, y - sp);
	},
	drawItem(i, s, p, x, y, sp) {
		const space = 10;
		lighting.drawImage(
			images["items"],
			(itemStats[p.i[i].item].animate && itemStats[p.i[i].item].type != "bow") ? p.i[i].item * tsize + frame * tsize : p.i[i].item * tsize,
			0,
			tsize,
			tsize,
			(i * s + x) + space / 2 - i * sp,
			y + space / 2,
			s - space,
			s - space
		);
		lighting.fillStyle = "white";
		lighting.textAlign = "right";
		if (p.i[i].amount > 1) lighting.fillText(p.i[i].amount, (i * s + x) + (s - 5) - i * sp, y + (s - 5));
	},
}