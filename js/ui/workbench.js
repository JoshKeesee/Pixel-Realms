const workbench = {
  toggled: false,
  create() {
    this.toggled = false;
    this.workbench = document.createElement("div");
    this.workbench.id = "workbench";
    this.workbench.classList = "clip";
    this.workbench.innerText = "Workbench";
    document.body.appendChild(this.workbench);
    this.container = document.createElement("div");
    this.container.id = "container";
    this.add(this.container);
    this.recipeImg = document.createElement("img");
    this.recipeImg.src = "images/recipes.png";
    this.recipeImg.id = "recipe-img";
    this.recipeImg.onclick = this.toggleRecipes;
    this.add(this.recipeImg);
    this.recipes = document.createElement("div");
    this.recipes.id = "recipes";
    this.add(this.recipes);
    const container = document.createElement("div");
    container.id = "recipe-results-container";
    this.recipes.appendChild(container);
    const back = document.createElement("div");
    back.id = "back";
    back.innerText = "Back";
    back.onclick = workbench.toggleRecipes;
    container.appendChild(back);
    this.recipeSearch = document.createElement("input");
    this.recipeSearch.id = "recipe-search";
    this.recipeSearch.placeholder = "Find a recipe...";
    this.recipeSearch.oninput = workbench.updateRecipes;
    container.appendChild(this.recipeSearch);
    this.recipeResults = document.createElement("div");
    this.recipeResults.id = "recipe-results";
    container.appendChild(this.recipeResults);
    this.recipePreviewContainer = document.createElement("div");
    this.recipePreviewContainer.id = "recipe-preview-container";
    this.recipes.appendChild(this.recipePreviewContainer);
    this.recipePreview = document.createElement("div");
    this.recipePreview.id = "recipe-preview";
    this.recipePreviewContainer.appendChild(this.recipePreview);
    this.recipeText = document.createElement("div");
    this.recipeText.id = "recipe-text";
    this.recipePreviewContainer.appendChild(this.recipeText);
    this.input = document.createElement("div");
    this.input.id = "input";
    this.container.appendChild(this.input);
    this.output = document.createElement("div");
    this.output.id = "output";
    this.container.appendChild(this.output);
    const img = document.createElement("div");
    img.id = "-1-1";
    img.onclick = this.takeOutput;
    this.output.appendChild(img);
    for (let i = 0; i < 9; i++) this.createItem(i);
  },
  add(e) {
    this.workbench.appendChild(e);
  },
  createItem(i) {
    const item = document.createElement("div");
    item.id = "item";
    item.classList = "item" + i;
    item.onclick = (e) => {
      const p = players[myId];
      let i, id;
      if (e.target.id == "item") {
        i = e.target.classList.toString().replace("item", "");
        id = e.target.getElementsByTagName("div")[0].id;
      } else {
        i = e.target.parentElement.classList.toString().replace("item", "");
        id = e.target.id;
      }
      workbench.replace(i, id, p.i[p.holding]);
    };
    this.input.appendChild(item);
    const img = document.createElement("div");
    img.id = "-1-1";
    img.style.opacity = 0;
    item.appendChild(img);
    const amount = document.createElement("div");
    amount.id = "amount";
    item.appendChild(amount);
  },
  toggle() {
    keys["x"] = false;
    keys["i"] = false;
    const img = document.querySelector("#workbench #output").getElementsByTagName("div")[0];
    img.id = "-1-1";
    img.style.opacity = 0;
    if (camera.setFade == 0) {
      camera.fadeTo(0.5);
      this.workbench.style.opacity = 1;
      this.workbench.style.pointerEvents = "auto";
      this.toggled = true;
    } else {
      const p = players[myId];
      camera.fadeTo(0);
      this.workbench.style.opacity = 0;
      this.workbench.style.pointerEvents = "none";
      const r = document.querySelector("#workbench #recipes");
      r.style.opacity = 0;
      r.style.pointerEvents = "none";
      const images = document.querySelectorAll("#workbench #item");
      for (let i = 0; i < images.length; i++) {
        const img = images[i].getElementsByTagName("div")[0];
        const it = furnace.parseId(img.id);
        if (p.i.some(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)) p.i[p.i.findIndex(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)].amount++;
        else if (p.b.some(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)) p.b[p.b.findIndex(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)].amount++;
        else if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = it;
        else if (p.b.some(e => e.item == -1)) p.b[p.b.findIndex(e => e.item == -1)] = it;
        img.id = "-1-1";
        img.style.opacity = 0;
        images[i].getElementsByTagName("div")[1].innerText = "";
      }
      this.toggled = false;
    }
  },
  replace(i, i1, i2) {
    const p = players[myId];
    let it = furnace.parseId(i1);
    if (keys["Shift"] && p.i[p.holding].item != -1 && (it.item == -1 || it.item == p.i[p.holding].item)) {
      if (it.item == -1) {
        it = { item: p.i[p.holding].item, amount: 1 };
        p.i[p.holding].amount--;
      } else if (itemStats[p.i[p.holding].item].stackable) {
        it.amount++;
        p.i[p.holding].amount--;
      }
      if (p.i[p.holding].amount < 1) {
        p.i[p.holding].amount = 1;
        p.i[p.holding].item = -1;
      }
    } else {
      p.i[p.holding] = furnace.parseId(i1);
      it = i2;
    }
    const img = document.querySelector("#workbench .item" + i).getElementsByTagName("div")[0];
    img.id = it.item.toString() + "-" + it.amount.toString();
    document.querySelector("#workbench .item" + i).getElementsByTagName("div")[1].innerText = it.amount > 1 ? it.amount : "";
    img.style.opacity = 1;
    if (it.item != -1) img.style.backgroundPosition = -1 * it.item * 50 + "px";
    else img.style.opacity = 0;
    this.check();
  },
  check() {
    const current = [];
    document.querySelectorAll("#workbench #item").forEach(i => {
      current.push(parseInt(i.getElementsByTagName("div")[0].id));
    });
    let matching = false;
    const img = document.querySelector("#workbench #output").getElementsByTagName("div")[0];
    Object.keys(recipes).every(r => {
      if (JSON.stringify(recipes[r]) == JSON.stringify(current)) {
        img.style.opacity = 1;
        if (r != -1) img.style.backgroundPosition = -1 * r * 80 + "px";
        else img.style.opacity = 0;
        img.id = r.toString() + "-" + 1;
        matching = true;
        return false;
      }
      return true;
    });
    if (!matching) img.style.opacity = 0;
  },
  takeOutput() {
    const p = players[myId];
    const img = document.querySelector("#workbench #output").getElementsByTagName("div")[0];
    if (img.id == "-1") return;
    const it = furnace.parseId(img.id);
    for (let i = 0; i < it.amount; i++) {
      if (p.i.some(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)) p.i[p.i.findIndex(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)].amount++;
      else if (p.b.some(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)) p.b[p.b.findIndex(e => itemStats[e.item].stackable && e.amount < maxItems && e.item == it.item)].amount++;
      else if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: it.item, amount: 1 };
      else if (p.b.some(e => e.item == -1)) p.b[p.b.findIndex(e => e.item == -1)] = { item: it.item, amount: 1 };
    }
    img.id = "-1-1";
    img.style.opacity = 0;
    document.querySelectorAll("#workbench #item").forEach(e => {
      const i = e.getElementsByTagName("div")[0];
      const it = furnace.parseId(i.id);
      i.id = it.item + "-" + (it.amount - 1);
      if (it.item == -1) i.style.opacity = 0;
      else i.style.opacity = 1;
      e.getElementsByTagName("div")[1].innerText = it.amount - 1 > 1 ? it.amount - 1 : "";
    });
    workbench.check();
  },
  toggleRecipes() {
    const r = document.querySelector("#workbench #recipes");
    if (r.style.opacity == 1) {
      r.style.opacity = 0;
      r.style.pointerEvents = "none";
    }
    else {
      r.style.opacity = 1;
      r.style.pointerEvents = "auto";
      workbench.updateRecipes();
      workbench.updateResult(Object.values(recipes)[0]);
    }
  },
  updateRecipes() {
    workbench.recipeResults.innerHTML = "";
    const s = workbench.recipeSearch.value.toLowerCase();
    const res = {};
    Object.keys(recipes).forEach((k, i) => (itemStats[Object.keys(recipes)[i]].name.toLowerCase().includes(s)) ? res[k] = recipes[k] : "");
    Object.values(res).forEach((v, i) => {
      const r = document.createElement("div");
      r.id = "recipe";
      const img = document.createElement("div");
      img.style.backgroundPosition = -1 * Object.keys(res)[i] * 50 + "px";
      img.onmouseover = () => workbench.updateResult(Object.values(res)[i]);
      r.appendChild(img);
      const p = players[myId];
      if (!Object.values(res)[i].every(v => v == -1 || p.i.some(e => e.item == v) || p.b.some(e => e.item == v))) r.style.background = "rgba(255, 0, 0, 0.8)";
      workbench.recipeResults.appendChild(r);
    });
  },
  updateResult(v) {
    workbench.recipePreview.innerHTML = "";
    workbench.recipeText.innerText = itemStats[Object.keys(recipes).find(e => recipes[e] == v)]?.name || "";
    for (let i = 0; i < v.length; i++) {
      const r = document.createElement("div");
      r.id = "recipe";
      const img = document.createElement("div");
      if (v[i] != -1) img.style.backgroundPosition = -1 * v[i] * 50 + "px";
      else img.style.opacity = 0;
      r.appendChild(img);
      const p = players[myId];
      if (!(v[i] == -1 || p.i.some(e => e.item == v[i]) || p.b.some(e => e.item == v[i]))) r.style.background = "rgba(255, 0, 0, 0.8)";
      workbench.recipePreview.appendChild(r);
    }
  },
};