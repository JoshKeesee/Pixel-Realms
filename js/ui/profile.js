const profile = {
  toggled: false,
  create() {
    this.toggled = false;
    this.profile = document.createElement("div");
    this.profile.id = "profile-container";
    ui.add(this.profile);
    this.image = document.createElement("img");
    this.image.id = "profile-image";
    this.image.onclick = profile.toggle;
    this.image.src = "images/profile/default.png";
    this.image.draggable = false;
    this.add(this.image);
    this.account = document.createElement("div");
    this.account.id = "profile-account";
    this.add(this.account);
    profile.info(user);
  },
  changeImage(src) {
    const i = document.querySelector("#profile-image");
    i.src = src;
  },
  toggle() {
    if (chat.toggled) chat.toggle();
    if (pause.toggled) pause.toggle();
    profile.toggled = !profile.toggled;
    const a = document.querySelector("#profile-account");
    if (a.style.transform == "scale(1)") a.style.transform = "scale(0)";
    else a.style.transform = "scale(1)";
  },
  info(data) {
    const a = document.querySelector("#profile-account");
		if (!a) return;
    a.innerHTML = "";
    if (data.id != null) {
      this.changeImage(data.profile);
      this.logout = document.createElement("button");
      this.logout.id = "logout";
      this.logout.onclick = logoutUser;
      const logoutText = document.createElement("div");
      logoutText.innerText = "Logout";
      this.logout.appendChild(logoutText);
      a.appendChild(this.logout);
    } else {
      this.changeImage("images/profile/default.png");
      this.login = document.createElement("button");
      this.login.id = "login";
      this.login.innerText = "Login";
      this.login.onclick = () => window.open("login.html?server=" + serverUrl, "sub", `top=${(screen.height - 800) / 4},left=${(screen.width - 600) / 2},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,frame=no,width=600,height=800`);
      a.appendChild(this.login);
    }
  },
  add(el) {
    this.profile.appendChild(el);
  },
}

window.onmessage = async e => {
	if (mainMenu.ready) {
		setUser(e.data);
		await loginUser(e.data);
		mainMenu.backToMainMenu();
	} else handleLogin(e.data);
}

const logoutUser = () => {
  user.id = null;
  delete user.name;
  delete user.profile;
  profile.info(user);
  if (socket.connected && online) socket.emit("logout");
  localStorage.removeItem("user");
	if (!online) {
		players = {};
		players[myId] = JSON.parse(defaultPlayer);
		map = updateMap(JSON.parse(defaultMap));
		daylight.level = 0;
	}
  if (profile.toggled) profile.toggle();
  chat.check();
  ui.hideDeathScreen();
	const adminTutorial = document.querySelector("#pause-container .button-2");
	if (adminTutorial) {
		adminTutorial.remove();
		pause.curr = 0;
		pause.buttons = 2;
	}
}

const handleLogin = async data => {
  if (data) {
    if (profile.toggled) profile.toggle();
    setUser(data);
		await loginUser(data);
		if (!online) save.load();
    players[myId].name = user.name = data.username;
    players[myId].user = data;
		profile.info(user);
    chat.check();
		const adminTutorial = document.querySelector("#pause-container .button-2");
		if (!adminTutorial && ((admins[user.id] && online) || devs[user.name])) {
			pause.container.appendChild(pause.createButton("Admin Tutorial", "pause-button", () => { pause.toggle(); runTutorial() }));
			pause.curr = 0;
			pause.buttons = 3;
		}
  }
}

const loginUser = async data => {
  user.id = data.id;
  players[myId].name = user.name = data.username;
  user.profile = data.profile ? serverUrl + data.profile : "images/profile/default.png";
  players[myId].user = data;
  if (socket.connected && online) socket.emit("login", user);
}

const waitForUser = () => {
  return new Promise(res => {
    const checkUser = () => {
      if (typeof user.id == "number") res();
      else setTimeout(checkUser, 100);
    }
    checkUser();
  });
}

const setUser = data => {
  const { id, username, profile } = data;
  localStorage.setItem("user", JSON.stringify({ id, username, profile }));
};
const getUser = () => JSON.parse(localStorage.getItem("user")) || null;