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
    img.id = "-1";
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
      workbench.replace(i, id, p.i[p.holding].item);
    };
    this.input.appendChild(item);
    const img = document.createElement("div");
    img.id = "-1";
    img.style.opacity = 0;
    item.appendChild(img);
  },
  toggle() {
    keys["x"] = false;
    keys["i"] = false;
    const img = document.querySelector("#workbench #output").getElementsByTagName("div")[0];
    img.id = "-1";
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
        p.i[p.i.findIndex(e => e.item == -1)] = { item: parseInt(img.id), amount: 1 };
        img.id = "-1";
        img.style.opacity = 0;
      }
      this.toggled = false;
    }
  },
  replace(i, i1, i2) {
    const p = players[myId];
    p.i[p.holding].item = parseInt(i1);
    const img = document.querySelector("#workbench .item" + i).getElementsByTagName("div")[0];
    img.id = i2;
    img.style.opacity = 1;
    if (i2 != "-1") img.style.backgroundPosition = -1 * i2 * 50 + "px";
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
        img.id = r.toString();
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
    if (p.i.some(e => e.item == -1)) p.i[p.i.findIndex(e => e.item == -1)] = { item: img.id, amount: 1 };
    else if (p.b.some(e => e.item == -1)) p.b[p.b.findIndex(e => e.item == -1)] = { item: img.id, amount: 1 };
    else return;
    img.id = "-1";
    img.style.opacity = 0;
    document.querySelectorAll("#workbench #item").forEach(i => {
      i = i.getElementsByTagName("div")[0];
      i.id = "-1";
      i.style.opacity = 0;
    });
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
      if (!Object.values(res)[i].every(v => v == -1 || p.i.includes(v) || p.b.includes(v))) r.style.background = "rgba(255, 0, 0, 0.8)";
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
      if (!(v[i] == -1 || p.i.includes(v[i]) || p.b.includes(v[i]))) r.style.background = "rgba(255, 0, 0, 0.8)";
      workbench.recipePreview.appendChild(r);
    }
  },
};