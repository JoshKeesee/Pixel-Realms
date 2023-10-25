const furnace = {
  fuelLevel: 0,
  cooked: 0,
  current: -1,
  inputId: -1,
  toggled: false,
  currentFurnace: false,
  create() {
    this.toggled = false;
    this.furnace = document.createElement("div");
    this.furnace.id = "furnace";
    this.furnace.classList = "clip";
    this.furnace.innerText = "Furnace";
    document.body.appendChild(this.furnace);
    this.container = document.createElement("div");
    this.container.id = "container";
    this.add(this.container);
    this.inputContainer = document.createElement("div");
    this.inputContainer.id = "input-container";
    this.container.appendChild(this.inputContainer);
    this.input = document.createElement("div");
    this.input.id = "input";
    this.input.onclick = () => {
      const p = players[myId];
      const img = document.querySelector("#furnace #input").getElementsByTagName("div")[0];
      furnace.replace(img.id, p.i[p.holding].item);
    }
    this.inputContainer.appendChild(this.input);
    this.fire = document.createElement("div");
    this.fire.id = "fire";
    this.fire.style.backgroundPosition = -1 * Math.ceil((9 / 100) * (100 - 0)) * tsize + "px";
    this.inputContainer.appendChild(this.fire);
    this.fuel = document.createElement("div");
    this.fuel.id = "fuel";
    this.fuel.onclick = this.addFuel;
    this.inputContainer.appendChild(this.fuel);
    this.progress = document.createElement("progress");
    this.progress.id = "progress";
    this.progress.max = 100;
    this.container.appendChild(this.progress);
    this.output = document.createElement("div");
    this.output.id = "output";
    this.container.appendChild(this.output);
    let img = document.createElement("div");
    img.id = "-1";
    img.onclick = this.takeOutput;
    this.output.appendChild(img);
    img = document.createElement("div");
    img.id = "-1";
    this.input.appendChild(img);
    img = document.createElement("div");
    img.id = "-1";
    this.fuel.appendChild(img);
		furnace.updateValue();
  },
  add(e) {
    this.furnace.appendChild(e);
  },
  toggle(i) {
    keys["x"] = false;
    keys["i"] = false;
    const img = document.querySelector("#furnace #output").getElementsByTagName("div")[0];
    img.id = "-1";
    img.style.opacity = 0;
    if (camera.setFade == 0) {
      camera.fadeTo(0.5);
      this.furnace.style.opacity = 1;
      this.furnace.style.pointerEvents = "auto";
      this.toggled = true;

      const p = players[myId];
			p.furnace = this.currentFurnace = i;

      furnace.updateData();
    } else {
      const p = players[myId];
      camera.fadeTo(0);
      furnace.sync(false);
      this.furnace.style.opacity = 0;
      this.furnace.style.pointerEvents = "none";
      this.toggled = false;
			p.furnace = this.currentFurnace = false;
      this.inputId = -1;
      this.cooked = 0;
      this.current = -1;
      this.fuelLevel = 0;
    }

    if (socket.connected && online) socket.emit("update player", { furnace: players[myId].furnace });
  },
  replace(i1, i2) {
    let img = document.querySelector("#furnace #output").getElementsByTagName("div")[0];
    img.style.opacity = 0;
    img.id = "-1";
    const p = players[myId];
    p.i[p.holding].item = parseInt(i1);
    img = document.querySelector("#furnace #input").getElementsByTagName("div")[0];
    img.id = i2;
    img.style.opacity = 1;
    furnace.inputId = i2;
    if (i2 != -1) img.style.backgroundPosition = -1 * i2 * 50 + "px";
    else img.style.opacity = 0;
    const current = Object.values(furnaceRecipes).find(e => e.from == parseInt(i2));
    if (current) this.current = Object.keys(furnaceRecipes)[Object.values(furnaceRecipes).indexOf(current)];
    else this.current = -1;
    this.cooked = 0;
    this.check();
    furnace.sync();
  },
  check() {
    let matching = false;
		const image = document.querySelector("#furnace #output");
		if (!image) return;
    const img = image.getElementsByTagName("div")[0];
    Object.keys(furnaceRecipes).every(r => {
      if (this.current == r && this.fuelLevel > 0 && this.cooked >= 100 && furnace.currentFurnace == players[myId].furnace) {
        img.style.opacity = 1;
        if (r != -1) img.style.backgroundPosition = -1 * r * 80 + "px";
        else img.style.opacity = 0;
        img.id = r.toString();
        matching = true;
        this.cooked = 100;
        furnace.sync(false);
        return false;
      }
      return true;
    });
    if (!matching) {
      img.id = "-1";
      img.style.opacity = 0;
    }
  },
  takeOutput() {
    const p = players[myId];
    let img = document.querySelector("#furnace #output").getElementsByTagName("div")[0];
    if (img.id == "-1") return;
    if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: img.id, amount: 1 };
    else if (p.b.some(e => e.item == -1)) p.b[p.b.findIndex(e => e.item == -1)] = { item: img.id, amount: 1 };
    else return;
    img.id = "-1";
    img.style.opacity = 0;
    img = document.querySelector("#furnace #input").getElementsByTagName("div")[0];
    img.id = "-1";
    img.style.opacity = 0;
    furnace.inputId = -1;
    furnace.cooked = 0;
    furnace.current = -1;

    furnace.sync();
  },
  addFuel() {
    const p = players[myId];
    if (itemStats[p.i[p.holding].item].type != "fuel") return;
    furnace.fuelLevel += itemStats[p.i[p.holding].item].fuelAmount;
    p.i[p.holding].item = -1;

    furnace.sync();
  },
  sync(s = true) {
    const p = players[myId];

    if (p.furnace < 0) return;

		map[p.scene].furnace[p.furnace] = {
			fuelLevel: furnace.fuelLevel,
			cooked: furnace.cooked,
			current: furnace.current,
      inputId: furnace.inputId,
		};

    if (socket.connected && online && s) socket.emit("update furnace", [
      map[p.scene].furnace[p.furnace],
      p.scene,
      p.furnace,
    ]);
  },
  updateData() {
    const p = players[myId];
    if (!map[p.scene].furnace[p.furnace]) return;
    const { fuelLevel, cooked, current, inputId } = map[p.scene].furnace[p.furnace];
    furnace.fuelLevel = fuelLevel >= -1 ? fuelLevel : 0;
    furnace.cooked = cooked >= -1 ? cooked : 0;
    furnace.current = current >= -1 ? current : -1;
    furnace.inputId = inputId >= -1 ? inputId : -1;

    const image = document.querySelector("#furnace #input");
		if (!image) return;
    const img = image.getElementsByTagName("div")[0];
    img.id = furnace.inputId.toString();
    img.style.opacity = 1;
    if (furnace.inputId != -1) img.style.backgroundPosition = -1 * furnace.inputId * 50 + "px";
    else img.style.opacity = 0;

    const l = (furnace.fuelLevel > 100) ? 100 : furnace.fuelLevel;
    furnace.fire.style.backgroundPosition = -1 * Math.ceil((9 / 100) * (100 - l)) * tsize + "px";
    furnace.progress.value = furnace.cooked;

    furnace.check();
  },
  updateValue() {
    furnace.fuelLevel -= 0.5;
    if (furnace.fuelLevel < 0) {
      furnace.cooked = furnace.fuelLevel = 0;
      furnace.check();
    }
    const l = (furnace.fuelLevel > 100) ? 100 : furnace.fuelLevel;
    if (furnace.fire) furnace.fire.style.backgroundPosition = -1 * Math.ceil((9 / 100) * (100 - l)) * tsize + "px";
    if (furnace.current == -1 || furnace.fuelLevel == 0) {
      furnace.check();
      if (furnace.progress) furnace.progress.value = furnace.cooked = 0;
      return;
    }
		if (furnace.progress) furnace.progress.value = furnace.cooked += 100 / furnaceRecipes[furnace.current].time;
    if (furnace.cooked > 99) furnace.check();
  },
};