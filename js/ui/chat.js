const chat = {
  toggled: false,
	savedMessages: [],
	curr: 0,
  create() {
		this.savedMessages = [];
		this.curr = 0;
    this.toggled = false;
    this.container = document.createElement("div");
    this.container.id = "chat-container";
    ui.add(this.container);
    this.icon = document.createElement("div");
    this.icon.id = "chat-icon";
    this.icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" id="chat-svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"></path>
      </svg>
    `;
    this.icon.onclick = chat.toggle;
    this.container.appendChild(this.icon);
    this.ping = document.createElement("div");
    this.ping.id = "chat-ping";
    this.icon.appendChild(this.ping);
    this.chatBar = document.createElement("div");
    this.chatBar.id = "chat-bar";
    this.messages = document.createElement("div");
    this.messages.id = "chat-messages";
    this.chatBar.appendChild(this.messages);
    const input = document.createElement("input");
    input.type = "text";
    input.id = "chat-input";
    input.placeholder = "Say something...";
    input.onkeyup = this.send;
    input.autocomplete = "off";
    this.chatBar.appendChild(input);
    ui.add(this.chatBar);
    this.check();
  },
  send(e) {
		if (e.key == "ArrowUp") { e.preventDefault(); chat.switchMessage(-1) }
		if (e.key == "ArrowDown") { e.preventDefault(); chat.switchMessage(1) }
    if (e.key != "Enter" || e.metaKey) return;
    const i = document.querySelector("#chat-input");
    if (i.value[0] == "/" && (devs[user.name] || (admins[user.id] && online))) {
      const commands = i.value.split(" ");
      if (commands[0] == "/give") {
        let p;
        if (commands[1] == "@s") p = players[myId];
        else p = Object.values(players).find(e => e.name.replaceAll(" ", "_") == commands[1]);
        if (!p) return chat.receive({ name: "Error", message: `Couldn't find a player with the name ${commands[1]}.` });
				if (!Number(commands[2])) commands[2] = Object.keys(itemStats).find(e => itemStats[e] == Object.values(itemStats).find(({ name }) => name.toLowerCase().replaceAll(" ", "_") == commands[2])) || commands[2];
        if (!commands[2] || (p.i.indexOf(-1) == -1 && p.b.indexOf(-1) == -1) || !itemStats[commands[2]]) return chat.receive({ name: "Error", message: `Couldn't give item to player.` });
        if (myId != p.id && socket.connected && online) socket.emit("give item", [p.id, commands[2], commands[3] || 1]);
        else {
          const amount = commands[3] || 1;
          for (let i = 0; i < amount; i++) {
            if (p.i.includes(-1)) p.i[p.i.indexOf(-1)] = commands[2];
            else if (p.b.includes(-1)) p.b[p.b.indexOf(-1)] = commands[2];
          }
        }
        chat.receive({ name: "Success", message: `Gave ${p.name} ${itemStats[commands[2]].name}` });
      } else if (commands[0] == "/clear") {
        let id;
        if (commands[1] == "@s") id = myId;
        else id = Object.values(players).find(e => e.name.replaceAll(" ", "_") == commands[1])?.id;
        if (!id) return chat.receive({ name: "Error", message: `Couldn't find a player with the name ${commands[1]}.` });
        if (id != myId) {
          if (commands[2] == "i" && socket.connected && online) socket.emit("clear inventory", id);
          else if (commands[2] == "b" && socket.connected && online) socket.emit("clear backpack", id);
          else return chat.receive({ name: "Error", message: `${commands[2]} is not an option. Choose either i or b.` });
        } else if (commands[2] == "i" || commands[2] == "b") players[id][commands[2]] = players[id][commands[2]].map(e => -1);
        else return chat.receive({ name: "Error", message: `${commands[2]} is not an option. Choose either i or b.` });
        chat.receive({ name: "Success", message: `Cleared ${players[id].name}'s ${(commands[2] == "i") ? "inventory" : "backpack"}` });
      } else if (commands[0] == "/time") {
        if (commands[1] < 0) return chat.receive({ name: "Error", message: `Please choose a number between 0 and 24.` });
        daylight.level = Math.floor(Number(commands[1])) - 1;
				game.daylight();
        if (socket.connected && online) {
					daylight.level++;
					socket.emit("update daylight", daylight.level);
				}
        chat.receive({ name: "Success", message: `Set time to ${daylight.level}.` });
      } else if (commands[0] == "/tp") {
        const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any entities or players with ${commands[1]}.`});
				if (!(commands[2] >= 0) && Object.keys(chat.getQuery(commands[2])).length == 0) return chat.receive({ name: "Error", message: `Couldn't find any entities or players with ${commands[2]}.`});
        const tpTo = (Object.values(chat.getQuery(commands[2]))[0]?.id) ? Object.values(chat.getQuery(commands[2]))[0] : {
					dx: commands[2] >= 0 ? Number(commands[2]) * tsize : -1,
					dy: commands[3] >= 0 ? Number(commands[3]) * tsize : -1,
					scene: commands[4] >= 0 ? Number(commands[4]) : players[myId].scene,
				};
        if (tpTo.dx < 0 || tpTo.dy < 0) return chat.receive({ name: "Error", message: `Please choose an x and y value.` });
        Object.values(query).forEach(v => {
          if (v.id) {
	          v.x = v.dx = tpTo.dx;
	          v.y = v.dy = tpTo.dy;
						v.scene = tpTo.scene;
	          if (v.id != myId && socket.connected && online) socket.emit("tp", [v.id, tpTo.x, tpTo.y, tpTo.scene]);
					}
        });
        chat.receive({ name: "Success", message: `Teleported ${commands[1]} to (${tpTo.x}, ${tpTo.y}) in scene ${tpTo.scene}.` });
      } else if (commands[0] == "/kick") {
        if (!devs[user.name] || !(admins[user.id] && online)) return chat.receive({ name: "Error", message: `You don't have access to kick people.`});
				const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any entities or players with ${commands[1]}.`});
				Object.keys(query).forEach(k => query[k].health ? query[k].health = -1 : "");
        Object.values(query).forEach(v => {
          if (v.id) {
          	if (v.id != myId && socket.connected && online) socket.emit("kick", v.id);
					}
        });
        chat.receive({ name: "Success", message: `Kicked ${commands[1]} from game.` });
			} else if (commands[0] == "/ban") {
        if (!devs[user.name] || !(admins[user.id] && online)) return chat.receive({ name: "Error", message: `You don't have access to ban people.`});
				const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any entities or players with ${commands[1]}.`});
				if (length > 1) return chat.receive({ name: "Error", message: `You can only ban one person.`});
				Object.keys(query).forEach(k => query[k].health ? query[k].health = -1 : "");
        Object.values(query).forEach(v => {
          if (v.id) {
          	if (v.id != myId && socket.connected && online) socket.emit("ban", v.id);
					}
        });
        chat.receive({ name: "Success", message: `Banned ${commands[1]} from game.`});
			} else if (commands[0] == "/op") {
        if (!devs[user.name] || !(admins[user.id] && online)) return chat.receive({ name: "Error", message: `You don't have access to give people the admin role.`});
        const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any players with ${commands[1]}.`});
        Object.values(query).forEach(v => {
          if (v.id) {
          	if (v.id != myId && socket.connected && online) socket.emit("op", v.id);
					}
        });
        chat.receive({ name: "Success", message: `Gave ${commands[1]} the admin role.`});
      } else if (commands[0] == "/unop") {
        if (!devs[user.name] || !(admins[user.id] && online)) return chat.receive({ name: "Error", message: `You don't have access to remove people from the admin role.`});
        const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any players with ${commands[1]}.`});
        Object.values(query).forEach(v => {
          if (v.id) {
          	if (v.id != myId && socket.connected && online) socket.emit("unop", v.id);
					}
        });
        chat.receive({ name: "Success", message: `Removed ${commands[1]} from the admin role.` });
      } else if (commands[0] == "/spawn") {
				const type = commands[1];
				if (!enemyTypes[type] && !animalTypes[type]) return chat.receive({ name: "Error", message: `${commands[1]} is not a valid entity type.` });
				const { x, y, scene } = { x: commands[2] || -1, y: commands[3] || -1, scene: commands[4] || players[myId].scene };
				if (enemyTypes[type]) enemies.spawn({ x: x * tsize, y: y * tsize, scene, type: type.replace("_", " ") });
				else animals.spawn({ x: x * tsize, y: y * tsize, scene, type: type.replace("_", " ") });
				chat.receive({ name: "Success", message: `Spawned ${type} at (${x}, ${y}) in scene ${scene}.` });
			} else if (commands[0] == "/kill") {
        const query = chat.getQuery(commands[1]);
        const length = Object.keys(query).length;
        if (length == 0) return chat.receive({ name: "Error", message: `Couldn't find any entities or players with ${commands[1]}.`});
				Object.keys(query).forEach(k => query[k].health ? query[k].health = -1 : "");
        if (socket.connected && online) Object.values(query).forEach((v, i) => {
          if (v) {
            if (!v.id || v.enemy || v.animal) {
              socket.emit("remove entity", i);
              map[v.scene].entities.splice(i, 1);
            } else if (v.id != myId) socket.emit("kill", v.id);
          }
        });
        if (commands[1] == "@e") map[players[myId].scene].entities = [];
				chat.receive({ name: "Success", message: `Killed ${length} ${Object.values(query).some(v => v?.animal || v?.enemy) ? "entities" : "players"}.` });
			} else {
        chat.receive({ name: "Error", message: `${commands[0]} is not a command.`});
      }
    } else {
      if (i.value.length == 0 || !socket.connected || !online) return;
      socket.emit("chat message", i.value);
    }
		chat.savedMessages.push(i.value);
		chat.curr = chat.savedMessages.length;
    i.value = "";
  },
  receive(data) {
    const c = document.createElement("div");
    c.id = "chat-message";
    const name = document.createElement("div");
    name.innerText = data.name;
    const message = document.createElement("div");
    message.innerText = data.message;
    c.appendChild(name);
    c.appendChild(message);
    document.querySelector("#chat-messages").appendChild(c);
    document.querySelector("#chat-messages").scrollTop = document.querySelector("#chat-messages").scrollHeight;
    if (!chat.toggled) chat.ping.style.display = "block";
  },
  toggle() {
    if ((!online && !devs[user.name]) || players[myId].editor) return;
    if (profile.toggled) profile.toggle();
		if (pause.toggled) pause.toggle();
    chat.toggled = !chat.toggled;
		if (tutorial && !text.toggled && chat.toggled) text.set(["Alright, commands are pretty easy.", "Run /give to give a player an item (/give [player or @s] [item_name] amount?)", "Run /tp to teleport players (/tp [player or @s] [x y scene or another player])", "Run /clear to clear a player's backpack or inventory (/clear [player or @s] [i or b])", "Run /time to set the time (/time [0-24])", "Run /ban to ban a player (/ban [player])", "Run /kick to kick a player (/kick [player])", "And lastly, run /op or /unop to toggle a player's admin role (/[op or unop] [player])", "Press the chat icon or click somewhere to close the chat."]);
		if (tutorial && !chat.toggled) tutorial = false;
    if (chat.toggled) chat.ping.style.display = "none";
    const c = document.querySelector("#chat-bar");
    if (c.style.right == "-2px") c.style.right = "-100%";
    else c.style.right = "-2px";
    if (chat.toggled && !tutorial) document.querySelector("#chat-input").select();
    else document.querySelector("#chat-input").blur();
  },
	switchMessage(value) {
		const i = document.querySelector("#chat-input");
		this.curr += value;
		if (this.curr < 0) this.curr = 0;
		if (this.curr > this.savedMessages.length - 1) {
			this.curr = this.savedMessages.length - 1;
			i.value = "";
		} else i.value = this.savedMessages[this.curr];
    const len = i.value.length;
    if (i.setSelectionRange) {
        i.focus();
        i.setSelectionRange(len, len);
    } else if (i.createTextRange) {
        const t = i.createTextRange();
        t.collapse(true);
        t.moveEnd("character", len);
        t.moveStart("character", len);
        t.select();
    }
	},
  check() {
		if (!this.container) return;
    if (!online && !devs[user.name]) {
      this.icon.style.display = "none";
      this.container.style.display = "none";
    } else {
      this.icon.style.display = "block";
      this.container.style.display = "block";
    }
  },
  getQuery(command) {
    if (command == "@a") return players;
    if (command == "@s") return { [myId]: players[myId] };
    if (command == "@e") return { ...map[players[myId].scene].entities };
    const id = Object.values(players).find(p => p.name.replaceAll(" ", "_") == command)?.id;
    if (!id) return {};
    return { [id]: players[id] };
  },
};