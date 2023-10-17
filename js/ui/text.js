const text = {
  i: 0,
  li: 0,
  t: [],
  curr: "",
  toggled: false,
  type: false,
  create() {
    this.toggled = false;
    this.text = document.createElement("div");
    this.text.id = "text-container";
    this.text.onclick = this.skip;
    document.body.appendChild(this.text);
    this.img = document.createElement("div");
    this.img.style.height = "150px";
    this.img.style.width = "150px";
    this.img.style.backgroundSize = "auto 150px";
    this.img.style.overflow = "hidden";
    this.add(this.img);
    this.container = document.createElement("div");
    this.add(this.container);
    this.continue = document.createElement("div");
    this.continue.id = "continue";
    this.continue.innerText = "Continue";
    this.continue.onmouseup = this.next;
    this.add(this.continue);
  },
  add(el) {
    this.text.appendChild(el);
  },
  set(t, img = "", id = 0) {
    this.t = t;
    this.i = 0;
		if (img) {
			this.img.style.width = "150px";
			this.img.style.height = "150px";
    	this.img.style.backgroundImage = `url("${images[img].src}")`;
    	this.img.style.backgroundPosition = -1 * id * 150 + "px";
		} else { this.img.style.width = 0; this.img.style.height = 0 }
    if (!this.toggled) this.toggle();
    this.next();
  },
  show(t) {
    text.container.innerHTML = "";
    text.continue.style.display = "none";
    text.li = 0;
    text.type = true;
    text.curr = t;
    setTimeout(text.nextLetter, 50);
  },
  nextLetter() {
    text.container.innerHTML += text.curr[text.li];
    text.li++;
    if (text.type && text.li < text.curr.length) setTimeout(text.nextLetter, 50);
    else {
      text.continue.style.display = "block";
      text.container.innerHTML = text.curr;
    }
  },
  next() {
    text.type = false;
    if (text.i < text.t.length) text.show(text.t[text.i]);
    else text.toggle();
    text.i++;
  },
  skip() {
    if (text.container.innerHTML == text.curr) text.next();
    else text.type = false;
  },
  toggle() {
    this.toggled = !this.toggled;
    if (this.toggled) {
      this.text.style.opacity = 1;
      this.text.style.pointerEvents = "auto";
    } else {
      this.text.style.opacity = 0;
      this.text.style.pointerEvents = "none";
      this.type = false;
    }
  },
};