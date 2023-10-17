const tracks = {};
tracks["wasda"] = new Audio("music/game/wasda.mp3");
tracks["grass"] = new Audio("music/game/grass.mp3");

let currentTrack;

Object.values(tracks).forEach(t => t.onended = nextTrack);

function nextTrack() {
	if (currentTrack && !tracks[currentTrack]?.ended) return tracks[currentTrack].play();
	const trackKeys = Object.keys(tracks).filter(n => n != currentTrack);
	tracks[currentTrack]?.pause();
	if (tracks[currentTrack]) tracks[currentTrack].currentTime = 0;
	currentTrack = trackKeys[Math.floor(Math.random() * trackKeys.length)];
	tracks[currentTrack].play();
}

function stopTrack() {
	tracks[currentTrack]?.pause();
	if (tracks[currentTrack]) tracks[currentTrack].currentTime = 0;
}