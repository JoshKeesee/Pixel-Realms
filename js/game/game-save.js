let db;
const request = window.indexedDB.open("PixelRealms", 3);
request.onupgradeneeded = e => {
	db = e.target.result;
	db.createObjectStore("saves", { keyPath: "id" });
};
request.onsuccess = e => db = e.target.result;
request.onerror = e => console.log("IndexedDB error: " + e.target.errorCode);

const save = {
	cancel: true,
	save() {
		setTimeout(save.save, 10000);
		if (!map || !players || online || mainMenu.ready || save.cancel || typeof user.id != "number" || !readyToAnimate) return;
		const transaction = db.transaction(["saves"], "readwrite");
		const objectStore = transaction.objectStore("saves");
		objectStore.put({ id: user.id, map, l: daylight.level, players });
		console.log("Game saved");
	},
	async load() {
		save.cancel = false;
		buffer = {};
		buffer[myId] = { x: players[myId].x, y: players[myId].y, health: players[myId].health };
		if (online || typeof user.id != "number") return;
		map = updateMap(JSON.parse(defaultMap));
		players[myId] = JSON.parse(defaultPlayer);
		players[myId].name = user.name;
		buffer = {};
		buffer[myId] = { x: players[myId].x, y: players[myId].y, health: players[myId].health };
		const transaction = db.transaction(["saves"], "readonly");
		const objectStore = transaction.objectStore("saves");
		const request = objectStore.get(user.id);
		request.onsuccess = e => {
			if (e.target.result) {
				const save = e.target.result;
				map = updateMap(save.map);
				players = save.players;
				daylight.level = save.l;
				buffer = {};
				Object.keys(players).forEach(k => buffer[k] = { x: players[k].x, y: players[k].y, health: players[k].health });
				players[myId].name = user.name;
			}
		};
	},
	delete() {
		if (typeof user.id != "number") return;
		const transaction = db.transaction(["saves"], "readwrite");
		const objectStore = transaction.objectStore("saves");
		objectStore.delete(user.id);
	},
};

save.save();