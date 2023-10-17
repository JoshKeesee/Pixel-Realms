const gp = {
	id: null,
	connected: false,
	device: null,
	buttons: [],
	axes: [],
	updateGamepad() {
		this.device = navigator.getGamepads()[this.id];
		keyup({ key: null });
	},
	getRightJoystick() {
		if (!this.connected) return;
		return { x: Math.abs(this.device.axes[2]) > 0 ? this.device.axes[2] * tsize + players[myId].x + tsize / 2 : 0, y: Math.abs(this.device.axes[3]) > 0 ? this.device.axes[3] * tsize + players[myId].y + tsize / 2 : 0 };
	},
	up(c) {
		if (!this.connected) return false;
		if (c) {
			const t = this.connected && this.device.axes[1] < -0.5 > 0 && !gp.axes[0];
			gp.axes[0] = this.device.axes[1] < -0.5;
			return t;
		}
		return this.device.axes[1] < -0.5;
	},
	down(c) {
		if (!this.connected) return false;
		if (c) {
			const t = this.connected && this.device.axes[1] > 0.5 > 0 && !gp.axes[1];
			gp.axes[1] = this.device.axes[1] > 0.5;
			return t;
		}
		return this.device.axes[1] > 0.5;
	},
	left(c) {
		if (!this.connected) return false;
		if (c) {
			const t = this.connected && this.device.axes[0] < -0.5 > 0 && !gp.axes[2];
			gp.axes[2] = this.device.axes[0] < -0.5;
			return t;
		}
		return this.device.axes[0] < -0.5;
	},
	right(c) {
		if (!this.connected) return false;
		if (c) {
			const t = this.connected && this.device.axes[0] > 0.5 > 0 && !gp.axes[3];
			gp.axes[3] = this.device.axes[0] > 0.5;
			return t;
		}
		return this.device.axes[0] > 0.5;
	},
	zKey(c = false, r = false) {
		if (!this.connected) return false;
		if (c) {
			if (r) {
				const t = this.connected && this.device.buttons[7].value < 0.5 && gp.buttons[7];
				gp.buttons[7] = this.device.buttons[7].value > 0;
				return t;
			}
			const t = this.connected && this.device.buttons[7].value > 0 && !gp.buttons[7];
			gp.buttons[7] = this.device.buttons[7].value > 0;
			return t;
		}
		return this.connected && this.device.buttons[7].value > 0.5;
	},
	checkKey(k) {
		if (!this.connected) return false;
		const t = this.connected && !this.device.buttons[k]?.pressed && gp.buttons[k];
		gp.buttons[k] = this.device.buttons[k]?.pressed;
		return t;
	},
	xKey() { return this.checkKey(3) },
	cKey(c = false) {
		if (!this.connected) return false;
		if (c) {
			const t = this.connected && this.device.buttons[6].value > 0 && !gp.buttons[6];
			gp.buttons[6] = this.device.buttons[6].value > 0;
			return t;
		}
		return this.connected && this.device.buttons[6].value > 0.5;
	},
	editor() { return this.checkKey(2) },
	enter(c = false) { return this.checkKey(0) },
	close() { return this.checkKey(1) },
	chat() { return this.checkKey(15) },
	profile() { return this.checkKey(12) },
	autotiling() { return this.checkKey(13) },
	pause() { return this.checkKey(9) },
	reset() { return this.checkKey(10) },
	delete() { return this.checkKey(11) },
	lb() { return this.checkKey(4) },
	rb() { return this.checkKey(5) },
	vibrate(duration, weakMagnitude = 1.0, strongMagnitude = 1.0) {
		if (!this.connected || !duration) return;
		if (this.device.vibrationActuator) this.device.vibrationActuator.playEffect("dual-rumble", {
			startDelay: 0,
			duration,
			weakMagnitude,
			strongMagnitude,
		});
	},
};