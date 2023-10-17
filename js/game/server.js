const serverUrl = "https://pixelwood-server.joshkeesee.repl.co/";
const socket = typeof io != "undefined" ? io(serverUrl, {
	autoConnect: false,
	forceNew: true,
	reconnection: false,
}) : "";
const FPS = 60;
let admins = {};
const devs = { "JoshKeesee": true, "Phanghost": true };
Object.freeze(devs);
let myId = "offline";
let players = {};
let buffer = {};
let map = [];
const user = { id: null };
let online = false, banned = false;
const dontCollide = [-1, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 54, 55, 56, 178, 179, 180, 78, 79, 80, 81, 82, 83, 102, 103, 104, 105, 106, 107, 136, 137, 138, 139, 140, 141, 172, 173, 174, 175, 176, 177, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 205, 209, 213];

async function loadDefault() {
	map = updateMap(JSON.parse(defaultMap));
	players[myId] = JSON.parse(defaultPlayer);
	const u = getUser();
	if (u) await loginUser(u);
}

loadDefault();

if (socket) {
	socket.on("user", p => {
		players[myId] = p;
		players[myId].id = socket.id;
	});
	socket.on("give item", ([it, amount]) => {
		const item = Object.keys(itemStats).find(e => itemStats[e] == Object.values(itemStats).find(({ name }) => name.toLowerCase().replace(" ", "_") == it)) || Number(it);
		if (!item) return;
		const p = players[myId];
		for (let i = 0; i < amount; i++) {
			if (p.i.includes(-1)) p.i[p.i.indexOf(-1)] = item;
			else if (p.b.includes(-1)) p.b[p.b.indexOf(-1)] = item;
		}

		if (socket.connected && online) socket.emit("update player", players[myId]);
	});
	socket.on("clear inventory", () => players[myId].i = players[myId].i.map(e => "-1"));
	socket.on("clear backpack", () => players[myId].b = players[myId].b.map(e => "-1"));
	socket.on("kick", () => socket.disconnect());
	socket.on("tp", ([x, y, scene]) => {
		players[myId].dx = players[myId].x = x * tsize;
		players[myId].dy = players[myId].y = y * tsize;
		players[myId].scene = scene;

		if (socket.connected && online) socket.emit("update player", players[myId]);
	});
	socket.on("init map", m => map = m);
	socket.on("init entities", entities => entities.forEach((e, i) => map[i].entities = e));
	socket.on("update map", d => {
		map[d[1]] = d[0];
		if (chest.i == -1) return;
		chest.update(map[players[myId].scene].chest[chest.i], false);
	});
	socket.on("update break", d => map[d[1]].break[d[2]] = d[0]);
	socket.on("update chest", d => map[d[1]].chest[d[2]] = d[0]);
	socket.on("update furnace", d => {
		map[d[1]].furnace[d[2]] = d[0];
		furnace.updateData();
	});
	socket.on("delete map", s => map.splice(s, 1));
	socket.on("update daylight", data => daylight.level = data);
	socket.on("init players", data => {
		players = data;
		myId = socket.id;
		buffer = {};
		Object.keys(players).forEach(k => buffer[k] = { x: players[k].x, y: players[k].y, health: players[k].health });
		if (players[myId].bed) player.toggleBed(players[myId]);
		if (typeof players[myId].minecart == "number") player.toggleMinecart(players[myId], map[players[myId].scene].entities[players[myId].minecart]);
		players[myId].dx = Math.floor(players[myId].x / tsize) * tsize;
		players[myId].dy = Math.floor(players[myId].y / tsize) * tsize;
	});
	socket.on("update player", changes => {
		if (!changes) return;
		const p = players[changes.id];
		if (!p) {
			players[changes.id] = changes;
			buffer[changes.id] = { x: changes.x, y: changes.y, health: changes.health, };
		}
		else Object.keys(changes).forEach(k => p[k] = changes[k]);
	});
	socket.on("update entity", data => {
		let e = map[data[2]].entities[data[1]];
		const changes = data[0];
		if (!e) e = changes;
		else Object.keys(changes).forEach(k => e[k] = changes[k]);
	});
	socket.on("remove entity", data => map[data[1]].entities.splice(data[0], 1));
	socket.on("remove player", id => { delete players[id]; delete buffer[id] });
	socket.on("chat message", chat.receive);
	socket.on("disconnect", () => online ? mainMenu.create("Disconnected from server.") : "");
	socket.on("update admins", a => admins = a);
	socket.on("kill", () => players[myId].health = -100);
}

function updateMap(m) {
	m.forEach((s, i) => {
		if (!m[i].break) m[i].break = {};
		if (!m[i].structure) m[i].structure = {};
		if (!m[i].text) m[i].text = {};
		if (!m[i].chest) m[i].chest = {};
		if (!m[i].furnace) m[i].furnace = {};
		if (!m[i].teleport) m[i].teleport = {};
		if (!m[i].entities) m[i].entities = [];
		s.entities.forEach((e, int) => !e ? s.entities.splice(int, 1) : "");
		s.layers.scenery.forEach((t, int) => {
			if (t == 65 && !s.chest[int]) s.chest[int] = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
			if (t == 72 && !s.furnace[int]) s.furnace[int] = {};
		});
	});
	return m;
}

function gameSave() {
	if (online || players[myId].name == "Offline") return;
	localStorage.setItem("game save", JSON.stringify({ map, players, l: daylight.level }));
}

async function gameLoad() {
	buffer = {};
	buffer[myId] = { x: players[myId].x, y: players[myId].y, health: players[myId].health };
	mainMenu.save = setInterval(gameSave, 5000);
	if (online || typeof user.id != "number") return;
	map = updateMap(JSON.parse(defaultMap));
	players[myId] = JSON.parse(defaultPlayer);
	players[myId].name = user.name;
	buffer = {};
	buffer[myId] = { x: players[myId].x, y: players[myId].y, health: players[myId].health };
	const save = JSON.parse(localStorage.getItem("game save"));
	if (!save) return gameSave();
	map = updateMap(save.map);
	players = save.players;
	daylight.level = save.l;
	buffer = {};
	Object.keys(players).forEach(k => buffer[k] = { x: players[k].x, y: players[k].y, health: players[k].health });
	players[myId].name = user.name;
}

function connect() {
	if (socket.connected || !online || mainMenu.cancel) return;
	socket.connect();
	setTimeout(connect, 10000);
}

function waitForConnect() {
	if (socket) connect();
	return new Promise(res => {
		if (socket.connected || !socket) res();
		else socket.on("connect", res);
	});
}

function checkBan(id) {
	if (socket) connect();
	return new Promise(res => socket.emit("check ban", id, res));
}