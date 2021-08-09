var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 240;
var FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_HEIGHT;

var canvas_ctx, image;
var framebuffer_u8, framebuffer_u32;

var AUDIO_BUFFERING = 512;
var SAMPLE_COUNT = 4*1024;
var SAMPLE_MASK = SAMPLE_COUNT - 1;
var audio_samples_L = new Float32Array(SAMPLE_COUNT);
var audio_samples_R = new Float32Array(SAMPLE_COUNT);
var audio_write_cursor = 0, audio_read_cursor = 0;

var nes = new jsnes.NES({
	onFrame: function(framebuffer_24){
		for(var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
	},
	onAudioSample: function(l, r){
		audio_samples_L[audio_write_cursor] = l;
		audio_samples_R[audio_write_cursor] = r;
		audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
	},
});

function onAnimationFrame(){
	if (window.isStop) return;
	window.requestAnimationFrame(onAnimationFrame);
	image.data.set(framebuffer_u8);
	canvas_ctx.putImageData(image, 0, 0);
	nes.frame()
	if (window.isSpeedUp) {
		nes.frame()
		nes.frame()
	}
}

function audio_remain(){
	return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;
}

function audio_callback(event){
	var dst = event.outputBuffer;
	var len = dst.length;
	
	// Attempt to avoid buffer underruns.
	if(audio_remain() < AUDIO_BUFFERING) nes.frame();
	
	var dst_l = dst.getChannelData(0);
	var dst_r = dst.getChannelData(1);
	for(var i = 0; i < len; i++){
		var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
		dst_l[i] = audio_samples_L[src_idx];
		dst_r[i] = audio_samples_R[src_idx];
	}
	
	audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
}

const nesKeys = [
	jsnes.Controller.BUTTON_UP,
	jsnes.Controller.BUTTON_DOWN,
	jsnes.Controller.BUTTON_LEFT,
	jsnes.Controller.BUTTON_RIGHT,
	jsnes.Controller.BUTTON_A,
	jsnes.Controller.BUTTON_B,
	jsnes.Controller.BUTTON_SELECT,
	jsnes.Controller.BUTTON_START
]

function keyboard(callback, event){
	for (let i = 0; i < ctls.length; i++) {
		var player;
		if (i < 8) player = 1;
		else if (i < 16) player = 2;
		else player = undefined;
		const ctlTar = ctlTars[i] || '';
		const srcKeyCode = ctlTar.split('|')[1];
		if (srcKeyCode === event.keyCode.toString()) {
			if (player) callback(player, nesKeys[i%8]);
			else window.isSpeedUp = event.type === 'keydown'
		}
	}
}

function nes_init(canvas_id){
	var canvas = document.getElementById(canvas_id);
	canvas_ctx = canvas.getContext("2d");
	image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	canvas_ctx.fillStyle = "black";
	canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	// Allocate framebuffer array.
	var buffer = new ArrayBuffer(image.data.length);
	framebuffer_u8 = new Uint8ClampedArray(buffer);
	framebuffer_u32 = new Uint32Array(buffer);
	
	// Setup audio.
	window.audio_ctx = window.audio_ctx || new window.AudioContext();
	var script_processor = window.audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
	script_processor.onaudioprocess = audio_callback;
	script_processor.connect(window.audio_ctx.destination);
}

window.nesInited = false;
window.nesAnimated = false;

function nes_boot(rom_data){
	nes.loadROM(rom_data);
	if (!nesAnimated) window.requestAnimationFrame(onAnimationFrame);
	nesAnimated = true;
	
  loadBtn.disabled = true;
  if (localStorage[localStorage.romurl]) loadBtn.disabled = false;
}

function nes_load_url(canvas_id, path){
	if (!window.nesInited) nes_init(canvas_id);
	window.nesInited = true;
	
	var req = new XMLHttpRequest();
	req.open("GET", path);
	req.overrideMimeType("text/plain; charset=x-user-defined");
	req.onerror = () => console.log(`Error loading ${path}: ${req.statusText}`);
	
	req.onload = function() {
		if (this.status === 200) {
			localStorage.romurl = path;
			nes_boot(this.responseText);
		} else if (this.status === 0) {
			// Aborted, so ignore error
		} else {
			req.onerror();
		}
	};
	
	req.send();
}

function nes_load_local(file){
	var req = new FileReader();
	
	req.onload = function(ev) {
		nes.loadROM(ev.target.result);
	};
	
	req.readAsBinaryString(file);
}

document.addEventListener('keydown', (event) => {keyboard(nes.buttonDown, event)});
document.addEventListener('keyup', (event) => {keyboard(nes.buttonUp, event)});
