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
      chest.replace(i, map[p.scene].chest[this.i][i], p.i[p.holding]);
    };
    this.container.appendChild(item);
    const img = document.createElement("div");
    item.appendChild(img);
    const amount = document.createElement("div");
    amount.id = "amount";
    item.appendChild(amount);
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
    if (keys["Shift"] && p.i[p.holding].item != -1 && (map[p.scene].chest[this.i][i].item == -1 || map[p.scene].chest[this.i][i].item == p.i[p.holding].item)) {
      if (map[p.scene].chest[this.i][i].item == -1) {
        map[p.scene].chest[this.i][i] = { item: p.i[p.holding].item, amount: 1 };
        p.i[p.holding].amount--;
      } else if (itemStats[p.i[p.holding].item].stackable) {
        map[p.scene].chest[this.i][i].amount++;
        p.i[p.holding].amount--;
      }
      if (p.i[p.holding].amount < 1) {
        p.i[p.holding].amount = 1;
        p.i[p.holding].item = -1;
      }
    } else {
      p.i[p.holding] = i1;
      map[p.scene].chest[this.i][i] = i2;
    }
    chest.update(map[p.scene].chest[this.i]);
  },
  update(b, u = true) {
    const p = players[myId];
    b.forEach((v, i) => (typeof v != "object") ? b[i] = { item: v, amount: 1 } : "");
    for (let i = 0; i < b.length; i++) {
      document.querySelector("#chest .item" + i).getElementsByTagName("div")[1].innerText = b[i].amount > 1 ? b[i].amount : "";
      const img = document.querySelector("#chest .item" + i).getElementsByTagName("div")[0];
      img.id = b[i].item.toString();
      img.style.opacity = 1;
      let id = b[i].item * 50;
      if (itemStats[b[i].item].animate && itemStats[b[i].item].name != "Bow") id += frame * 50;
      if (b[i].item != -1) img.style.backgroundPosition = -1 * id + "px";
      else img.style.opacity = 0;
    }

    if ((!socket.connected && online) || !u) return;
    socket.emit("update chest", [
      map[p.scene].chest[p.chest],
      p.scene,
      p.chest,
    ]);
  },
};