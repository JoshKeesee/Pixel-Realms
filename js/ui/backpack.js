const backpack = {
	toggled: false,
  create() {
    this.toggled = false;
    this.backpack = document.createElement("div");
    this.backpack.id = "backpack";
    this.backpack.classList = "clip";
    this.backpack.innerText = "Backpack";
    document.body.appendChild(this.backpack);
    this.container = document.createElement("div");
    this.container.id = "container";
    this.add(this.container);
    for (let i = 0; i < 32; i++) this.createItem(i);
  },
  add(e) {
    this.backpack.appendChild(e);
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
      backpack.replace(i, p.b[i], p.i[p.holding]);
    };
    this.container.appendChild(item);
    const img = document.createElement("div");
    item.appendChild(img);
    const amount = document.createElement("div");
    amount.id = "amount";
    item.appendChild(amount);
  },
  toggle() {
    keys["x"] = false;
    keys["i"] = false;
    if (camera.setFade == 0) {
      camera.fadeTo(0.5);
      this.backpack.style.opacity = 1;
      this.backpack.style.pointerEvents = "auto";
      this.update(players[myId].b);
			this.toggled = true;
    } else {
      camera.fadeTo(0);
      this.backpack.style.opacity = 0;
      this.backpack.style.pointerEvents = "none";
      this.update(players[myId].b);
			this.toggled = false;
    }
  },
  replace(i, i1, i2) {
    const p = players[myId];
    if (keys["Shift"] && p.i[p.holding].item != -1 && (p.b[i].item == -1 || p.b[i].item == p.i[p.holding].item)) {
      if (p.b[i].item == -1) {
        p.b[i] = { item: p.i[p.holding].item, amount: 1 };
        p.i[p.holding].amount--;
      } else if (itemStats[p.i[p.holding].item].stackable) {
        p.b[i].amount++;
        p.i[p.holding].amount--;
      }
      if (p.i[p.holding].amount < 1) {
        p.i[p.holding].amount = 1;
        p.i[p.holding].item = -1;
      }
    } else {
      p.i[p.holding] = i1;
      p.b[i] = i2;
    }
    backpack.update(p.b);
  },
  update(b) {
		if (!document.querySelector("#backpack")) return;
    for (let i = 0; i < b.length; i++) {
      document.querySelector("#backpack .item" + i).getElementsByTagName("div")[1].innerText = b[i].amount > 1 ? b[i].amount : "";
      const img = document.querySelector("#backpack .item" + i).getElementsByTagName("div")[0];
      img.id = b[i].item.toString();
      img.style.opacity = 1;
      let id = b[i].item * 50;
      if (itemStats[b[i].item].animate && itemStats[b[i].item].name != "Bow") id += frame * 50;
      if (b[i].item != -1) img.style.backgroundPosition = -1 * id + "px";
      else img.style.opacity = 0;
    }
  },
};