const wardrobe = {
  toggled: false,
  current: 0,
  create() {
    this.toggled = false;
    this.wardrobe = document.createElement("div");
    this.wardrobe.id = "wardrobe";
    this.wardrobe.classList = "clip";
    this.wardrobe.innerText = "Wardrobe";
    document.body.appendChild(this.wardrobe);
		this.container = document.createElement("div");
    this.container.id = "container";
    this.add(this.container);
    this.innerContainer = document.createElement("div");
    this.innerContainer.id = "inner-container";
    this.container.appendChild(this.innerContainer);
    for (let i = 0; i < 3; i++) this.createColumn(i);
		this.output = document.createElement("div");
		this.output.id = "output";
		for (let i = 0; i < 6; i++) this.output.appendChild(document.createElement("div"));
		this.container.appendChild(this.output);
    this.switchColumn(0);
    document.querySelectorAll("#armor")[0].getElementsByTagName("div")[0].style.backgroundImage = `url("images/characters/armor/head-armor.png")`;
    document.querySelectorAll("#armor")[1].getElementsByTagName("div")[0].style.backgroundImage = `url("images/characters/armor/body-armor.png")`;
    document.querySelectorAll("#armor")[2].getElementsByTagName("div")[0].style.backgroundImage = `url("images/characters/armor/leg-armor.png")`;
    this.updateImages();
  },
  add(e) {
    this.wardrobe.appendChild(e);
  },
  toggle() {
    keys["x"] = false;
    keys["i"] = false;
    if (camera.setFade == 0) {
      camera.fadeTo(0.5);
      this.wardrobe.style.opacity = 1;
      this.wardrobe.style.pointerEvents = "auto";
      this.toggled = true;
      this.updateImages();
    } else {
      camera.fadeTo(0);
      this.wardrobe.style.opacity = 0;
      this.wardrobe.style.pointerEvents = "none";
      this.toggled = false;
    }
  },
  createColumn(id) {
    const column = document.createElement("div");
    column.id = "column";
    const box = document.createElement("div");
    box.id = "box";
    box.classList = "box" + id;
    box.onclick = () => wardrobe.switchColumn(id);
    const img = document.createElement("div");
    img.id = "box-img";
    box.appendChild(img);
    const arrowLeft = document.createElement("div");
    arrowLeft.id = "arrow";
    arrowLeft.classList.add("left", "left" + id);
    arrowLeft.onclick = () => wardrobe.switchItem(true, id);
    const arrowRight = document.createElement("div");
    arrowRight.id = "arrow";
    arrowRight.classList.add("right", "right" + id);
    arrowRight.onclick = () => wardrobe.switchItem(false, id);
    const armor = document.createElement("div");
    armor.id = "armor";
    armor.classList.add("armor" + id, "armor--1");
    armor.onclick = () => wardrobe.switchArmor(id);
    const armorImg = document.createElement("div");
    armorImg.id = "armor-img";
    armor.appendChild(armorImg);
    column.appendChild(arrowLeft);
    column.appendChild(box);
    column.appendChild(arrowRight);
    column.appendChild(armor);
    this.innerContainer.appendChild(column);
  },
  switchColumn(id) {
    this.current = id;
		for (let i = 0; i < 3; i++) {
			document.querySelector(".box" + i).style.outline = "3px solid lightgray";
			document.querySelector(".left" + i).style.borderRightColor = "lightgray";
			document.querySelector(".right" + i).style.borderLeftColor = "lightgray";
		}
    document.querySelector(".box" + id).style.outline = "5px solid white";
    document.querySelector(".left" + id).style.borderRightColor = "white";
    document.querySelector(".right" + id).style.borderLeftColor = "white";
  },
  switchItem(l, i) {
    if (this.current != i || (players[myId].team && i == 1)) return;
    if (l) document.querySelector(".left" + this.current).style.transform = "translateY(-2px)";
    else document.querySelector(".right" + this.current).style.transform = "translateY(-2px)";
    setTimeout(() => document.querySelectorAll("#wardrobe #arrow").forEach(e => e.style.transform = ""), 200);
    let id, type;
    const p = players[myId];
    if (this.current == 0) type = "head";
    else if (this.current == 1) type = "body";
    else type = "leg";
    const k = Object.keys(images).filter(e => e.includes(type) && !e.includes("armor") && !e.includes("dark knight"));
    id = k.indexOf(p[type + "Color"] + " " + type);
    if (l) id--;
    else id++;
    if (id < 0) id = k.length - 1;
    else if (id == k.length) id = 0;
    p[type + "Color"] = k[id].replace(" " + type, "");
    if (socket.connected && online) socket.emit("update player", { [type + "Color"]: p[type + "Color"] });
    this.updateImages();
  },
  switchArmor(id) {
    const p = players[myId];
    let type, aType;
    if (id == 0) { aType = "helmet"; type = "head" }
    else if (id == 1) { aType = "chestplate"; type = "body" }
    else { aType = "leggings"; type = "leg" }
    if (itemStats[p.i[p.holding]].type != aType && p.i[p.holding] != -1) return;
    const prev = p.i[p.holding];
    p[type + "Armor"] = itemStats[prev].setArmor;
    p.i[p.holding] = document.querySelector("#wardrobe .armor" + id).className.split(" ")[1].replace("armor-", "");
    if (socket.connected && online) socket.emit("update player", { [type + "Armor"]: p[type + "Armor"], i: p.i });
    this.updateImages();
  },
  updateImages() {
    const p = players[myId];
		if (!p) return;
    document.querySelectorAll("#box")[0].getElementsByTagName("div")[0].style.backgroundImage = `url("${images[`${p.headColor} head`].src}")`;
    document.querySelectorAll("#box")[1].getElementsByTagName("div")[0].style.backgroundImage = `url("${images[`${p.bodyColor} body`].src}")`;
    document.querySelectorAll("#box")[2].getElementsByTagName("div")[0].style.backgroundImage = `url("${images[`${p.legColor} leg`].src}")`;
    let armor = document.querySelectorAll("#armor")[0].getElementsByTagName("div")[0];
    armor.style.opacity = 1;
    armor.style.backgroundPosition = -1 * p.headArmor * 16 * 50 + "px";
    if (p.headArmor < 0) armor.style.opacity = 0;
    armor = document.querySelectorAll("#armor")[1].getElementsByTagName("div")[0];
    armor.style.opacity = 1;
    armor.style.backgroundPosition = -1 * p.bodyArmor * 16 * 50 + "px";
    if (p.bodyArmor < 0) armor.style.opacity = 0;
    armor = document.querySelectorAll("#armor")[2].getElementsByTagName("div")[0];
    armor.style.opacity = 1;
    armor.style.backgroundPosition = -1 * p.legArmor * 16 * 50 + "px";
    if (p.legArmor < 0) armor.style.opacity = 0;
    document.querySelector("#wardrobe .armor0").className = "armor0 armor-" + (p.headArmor >= 0 ? 36 + p.headArmor * 3 : -1);
    document.querySelector("#wardrobe .armor1").className = "armor1 armor-" + (p.bodyArmor >= 0 ? 37 + p.bodyArmor * 3 : -1);
    document.querySelector("#wardrobe .armor2").className = "armor2 armor-" + (p.legArmor >= 0 ? 38 + p.legArmor * 3 : -1);
		
    const character = document.querySelector("#wardrobe #output").getElementsByTagName("div");
    character[0].style.backgroundImage = `url("${images[`${p.legColor} leg`].src}")`;
    character[1].style.opacity = 1;
    if (p.legArmor != -1) character[1].style.backgroundPosition = -1 * p.legArmor * 16 * tsize + "px";
    else character[1].style.opacity = 0;
    character[2].style.backgroundImage = `url("${images[`${p.bodyColor} body`].src}")`;
    character[3].style.opacity = 1;
    if (p.bodyArmor != -1) character[3].style.backgroundPosition = -1 * p.bodyArmor * 16 * tsize + "px";
    else character[3].style.opacity = 0;
    character[4].style.backgroundImage = `url("${images[`${p.headColor} head`].src}")`;
    character[5].style.opacity = 1;
    if (p.headArmor != -1) character[5].style.backgroundPosition = -1 * p.headArmor * 16 * tsize + "px";
    else character[5].style.opacity = 0;
  },
};