const chest = {
  i: -1,
  toggled: false,
  create() {
    this.toggled = false;
    this.chest = document.createElement("div");
    this.chest.id = "chest";
    this.chest.classList = "clip";
    this.chest.innerText = "Chest";
    document.body.appendChild(this.chest);
    this.container = document.createElement("div");
    this.container.id = "container";
    this.add(this.container);
    for (let i = 0; i < 32; i++) this.createItem(i);
  },
  add(e) {
    this.chest.appendChild(e);
  },
  createItem(i) {
    const item = document.createElement("div");
    item.id = "item";
    item.classList = "item" + i;
    item.onclick = (e) => {
      const p = players[myId];
      let i;
      if (e.target.id == "item") {
        i = e.target.classList.toString().replace("item", "");
      } else {
        i = e.target.parentElement.classList.toString().replace("item", "");
      }
      i = parseInt(i);
      chest.replace(i, map[p.scene].chest[this.i][i], p.i[p.holding].item);
    };
    this.container.appendChild(item);
    const img = document.createElement("div");
    item.appendChild(img);
  },
  toggle(i) {
    keys["x"] = false;
    keys["i"] = false;
    this.i = i;
    if (camera.setFade == 0) {
      camera.fadeTo(0.5);
      this.chest.style.opacity = 1;
      this.chest.style.pointerEvents = "auto";
      players[myId].chest = i;
      this.update(map[players[myId].scene].chest[i]);
      this.toggled = true;
    } else {
      camera.fadeTo(0);
      this.chest.style.opacity = 0;
      this.chest.style.pointerEvents = "none";
      players[myId].chest = false;
      this.update(map[players[myId].scene].chest[i]);
      this.toggled = false;
    }

    if (socket.connected && online) socket.emit("update player", { chest: players[myId].chest });
  },
  replace(i, i1, i2) {
    const p = players[myId];
    p.i[p.holding].item = i1;
    map[p.scene].chest[this.i][i] = i2;
    chest.update(map[p.scene].chest[this.i]);
  },
  update(b, u = true) {
    for (let i = 0; i < b.length; i++) {
      const img = document.querySelector("#chest .item" + i).getElementsByTagName("div")[0];
      img.id = b[i].toString();
      img.style.opacity = 1;
      let id = b[i] * 50;
      if (itemStats[b[i]].animate && itemStats[b[i]].name != "Bow") id += frame * 50;
      if (b[i] != -1) img.style.backgroundPosition = -1 * id + "px";
      else img.style.opacity = 0;
    }

    if ((!socket.connected && online) || !u) return;
    const p = players[myId];
    socket.emit("update chest", [
      map[p.scene].chest[p.chest],
      p.scene,
      p.chest,
    ]);
  },
};