const activeButtons = {
	check(p) {
		if (!p || editor.enabled || p.bed) return;
		const { dx, dy, scene, dir, i, holding, zKey, bed, minecart, boat } = p;
		let x = dx, y = dy, key = "";
		if (dir == 0) y += tsize;
		if (dir == 1) y -= tsize;
		if (dir == 2) x -= tsize;
		if (dir == 3) x += tsize;
		x = Math.floor(x / tsize);
		y = Math.floor(y / tsize);
		if (touching.teleporter && map[scene].type == "house") return activeButtons.draw(
			controls[players[myId].controls].xKey,
			{ item: "House" },
			x,
			y - 1,
			-1,
			10
		);
		if (
			x < 0 ||
			x >= map[scene].cols ||
			y < 0 ||
			y >= map[scene].rows ||
			bed ||
			typeof minecart == "number" ||
			typeof boat == "number"
		) return;
		const tile = getTile(scene, "scenery", x, y);
		if (!blockStats[tile] && !itemStats[i[holding].item]) return;
		if (blockStats[tile]?.type == "utility") key = controls[players[myId].controls].xKey;
		else if (canBreak(i[holding].item, tile)) key = controls[players[myId].controls].zKey;
		else if (
			((itemStats[i[holding].item]?.placeable && tile == -1) ||
			itemStats[i[holding].item]?.placeOn) &&
			!zKey
		) key = controls[players[myId].controls].cKey;
		else return;
		activeButtons.draw(
			key,
			key == controls[players[myId].controls].cKey ? itemStats[i[holding].item] : blockStats[tile],
			x,
			blockStats[tile]?.height ? y - blockStats[tile].height / 2 : y,
			tile,
			10
		);
	},
	draw(key, item, x, y, tile, mt = 0) {
		const c = controls[players[myId].controls];
		if (key == controls[players[myId].controls].cKey && item.placeOn) {
			if ((
				!item.placeOn.includes(tile) &&
				!item.placeOn.includes(getTile(players[myId].scene, "ground", x, y))) ||
				getTile(players[myId].scene, "ground", x, y)
			) return;
		}
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.font = "15px pixel";
		let text;
		if (item.name == "House") text = "Leave";
		else if (key == c.xKey) text = "Use";
		else if (key == c.zKey) text = "Break";
		else if (key == c.cKey) text = "Place";
		ctx.fillText(
			`${text} ${item.name} (${text == "Break" ? "Hold " + key : key})`,
			x * tsize + tsize / 2,
			players[myId].dir == 0 ? y * tsize + tsize + mt * 2 : y * tsize - mt
		);
		if (key == controls[players[myId].controls].cKey) ctx.drawImage(
			images["editor"],
			editor.frame * tsize,
			0,
			tsize,
			tsize,
			x * tsize,
			y * tsize,
			tsize,
			tsize
		);
	},
};