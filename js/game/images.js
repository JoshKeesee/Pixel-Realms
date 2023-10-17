const images = {};
let imagesLoaded = 0;
let frame = 0;
let readyToAnimate = false;
const tsize = 80;

function loadImages() {
	images["tilemap"] = new Image();
	images["tilemap"].src = "images/spritesheets/tilemap.png";
	images["entities"] = new Image();
	images["entities"].src = "images/spritesheets/entities.png";
	images["particles"] = new Image();
	images["particles"].src = "images/spritesheets/particles.png";
	images["break"] = new Image();
	images["break"].src = "images/spritesheets/break.png";
	images["editor"] = new Image();
	images["editor"].src = "images/spritesheets/editor.png";
	images["items"] = new Image();
	images["items"].src = "images/spritesheets/items.png";
	images["daylight"] = new Image();
	images["daylight"].src = "images/spritesheets/daylight-cycle.png";
	images["health"] = new Image();
	images["lighting"] = new Image();
	images["lighting"].src = "images/lighting.png";
	images["health"].src = "images/health.png";
	images["boss"] = new Image();
	images["boss"].src = "images/spritesheets/bosses.png";
	images["white head"] = new Image();
	images["white head"].src = "images/characters/heads/white-head.png";
	images["brown head"] = new Image();
	images["brown head"].src = "images/characters/heads/brown-head.png";
	images["black head"] = new Image();
	images["black head"].src = "images/characters/heads/black-head.png";
	images["yellow head"] = new Image();
	images["yellow head"].src = "images/characters/heads/yellow-head.png";
	images["dark knight head"] = new Image();
	images["dark knight head"].src = "images/characters/heads/dark-knight-head.png";
	images["red body"] = new Image();
	images["red body"].src = "images/characters/bodies/red-body.png";
	images["blue body"] = new Image();
	images["blue body"].src = "images/characters/bodies/blue-body.png";
	images["green body"] = new Image();
	images["green body"].src = "images/characters/bodies/green-body.png";
	images["yellow body"] = new Image();
	images["yellow body"].src = "images/characters/bodies/yellow-body.png";
	images["red straps body"] = new Image();
	images["red straps body"].src = "images/characters/bodies/red-straps-body.png";
	images["dark knight body"] = new Image();
	images["dark knight body"].src = "images/characters/bodies/dark-knight-body.png";
	images["blue leg"] = new Image();
	images["blue leg"].src = "images/characters/legs/blue-legs.png";
	images["gray leg"] = new Image();
	images["gray leg"].src = "images/characters/legs/gray-legs.png";
	images["jeans leg"] = new Image();
	images["jeans leg"].src = "images/characters/legs/jeans-legs.png";
	images["dark knight leg"] = new Image();
	images["dark knight leg"].src = "images/characters/legs/dark-knight-legs.png";
	images["head armor"] = new Image();
	images["head armor"].src = "images/characters/armor/head-armor.png";
	images["body armor"] = new Image();
	images["body armor"].src = "images/characters/armor/body-armor.png";
	images["leg armor"] = new Image();
	images["leg armor"].src = "images/characters/armor/leg-armor.png";

	Object.keys(images).forEach(i => images[i].onload = loadedImage);

	return new Promise(res => setInterval(() => readyToAnimate ? res() : "", 1000));
}

function loadedImage() {
	imagesLoaded++;
	if (imagesLoaded == Object.keys(images).length) readyToAnimate = true;
}