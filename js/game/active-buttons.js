const activeButtons = {
	check(p) {
		if (!p || editor.enabled || p.bed) return;
		const { dx, dy, scene, dir, i, holding, zKey } = p;
		let x = dx, y = dy, key = "";
		if (dir == 0) y += tsize;
		if (dir == 1) y -= tsize;
		if (dir == 2) x -= tsize;
		if (dir == 3) x += tsize;
		x = Math.floor(x / tsize);
		y = Math.floor(y / tsize);
		if (x < 0 || x >= map[scene].cols || y < 0 || y >= map[scene].rows) return;
		const tile = getTile(scene, "scenery", x, y);
		if (!blockStats[tile] && !itemStats[i[holding]]) return;
		if (blockStats[tile]?.type == "utility") key = controls[players[myId].controls].xKey;
		else if (canBreak(i[holding], tile)) key = controls[players[myId].controls].zKey;
		else if (
			((itemStats[i[holding]]?.placeable && tile == -1) ||
			itemStats[i[holding]]?.placeOn) &&
			!zKey
		) key = controls[players[myId].controls].cKey;
		else return;
		activeButtons.draw(
			key,
			key == controls[players[myId].controls].cKey ? itemStats[i[holding]] : blockStats[tile],
			x,
			blockStats[tile]?.height ? y - blockStats[tile].height / 2 : y,
			tile,
			10
		);
	},
	draw(key, item, x, y, tile, mt = 0) {
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
		if (key == controls[players[myId].controls].xKey) text = "Use";
		else if (key == controls[players[myId].controls].zKey) text = "Break";
		else if (key == controls[players[myId].controls].cKey) text = "Place";
		ctx.fillText(
			`${text} ${item.name} (${controls[players[myId].controls][Object.keys(controls[players[myId].controls]).find(k => controls[players[myId].controls][k] == key)]})`,
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