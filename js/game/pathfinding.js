function findPath(e, dx, dy) {
	let c, r, s = e.scene;
	c = Math.floor(e.dx / tsize);
	r = Math.floor((e.dy - tsize) / tsize);
	if (
		Math.abs(dy - e.dy) >= Math.abs(dx - e.dx) &&
		dy - e.dy < 0 &&
		e.x == e.dx &&
		e.y == e.dy &&
		enemies.walls(s)[getIndex(s, c, r)] == 0
	) { e.dy -= tsize; e.dir = 1 }
	c = Math.floor(e.dx / tsize);
	r = Math.floor((e.dy + tsize) / tsize);
	if (
		Math.abs(dy - e.dy) >= Math.abs(dx - e.dx) &&
		dy - e.dy > 0 &&
		e.x == e.dx &&
		e.y == e.dy &&
		enemies.walls(s)[getIndex(s, c, r)] == 0
	) { e.dy += tsize; e.dir = 0 }
	c = Math.floor((e.dx - tsize) / tsize);
	r = Math.floor(e.dy / tsize);
	if (
		Math.abs(dx - e.dx) >= Math.abs(dy - e.dy) &&
		dx - e.dx < 0 &&
		e.x == e.dx &&
		e.y == e.dy &&
		enemies.walls(s)[getIndex(s, c, r)] == 0
	) { e.dx -= tsize; e.dir = 2 }
	c = Math.floor((e.dx + tsize) / tsize);
	r = Math.floor(e.dy / tsize);
	if (
		Math.abs(dx - e.dx) >= Math.abs(dy - e.dy) &&
		dx - e.dx > 0 &&
		e.x == e.dx &&
		e.y == e.dy &&
		enemies.walls(s)[getIndex(s, c, r)] == 0
	) { e.dx += tsize; e.dir = 3 }
	if (e.dx < 0) e.dx = 0;
	if (e.dy < 0) e.dy = 0;
	if (e.dx > (map[s].cols - 1) * tsize) e.dx = (map[s].cols - 1) * tsize;
	if (e.dy > (map[s].rows - 1) * tsize) e.dy = (map[s].rows - 1) * tsize;
	c = Math.floor(e.dx / tsize);
	r = Math.floor(e.dy / tsize);
	if (enemies.walls(s)[getIndex(s, c, r)] == 1) { e.dx = e.x; e.dy = e.y }
}