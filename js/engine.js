"use strict";
/* ============================================================================
   HYPER OLYMPIC — Engine core: constants, input, audio, state, game loop.
   ============================================================================ */

// ---- CORE CONSTANTS ---------------------------------------------------------
const VIEW_W = 256, VIEW_H = 240;
const FPS = 60;
const TRACK_LANE_TOP = 128, TRACK_LANE_BOT = 164;
const START_LIVES = 3;
const EXTRA_LIFE_EVERY = 100000;
const SCORE_PER_QUALIFY = 5000;
const SCORE_BONUS_PER_SEC = 1000;
const WR_BONUS = 10000;
const HURDLE_CLEAR_BONUS = 1000;
const LONGJUMP_BOARD_AT = 40;
const LONGJUMP_PIT_LEN = 14;
const LONGJUMP_QUALIFY = 7.50;
const LONGJUMP_WR = 8.90;
const LONGJUMP_ATTEMPTS = 3;
const LONGJUMP_PUMP_DIST = 0.16;

// ---- SHARED RUN PHYSICS -----------------------------------------------------
const START_SPEED = 0.0;
const MAX_SPEED = 0.165;
const PRESS_GAIN = 0.027;
const FRICTION = 0.97;
const CPU_TARGET_TIME_100 = 11.20;

// ---- DOM / CANVAS -----------------------------------------------------------
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ---- INPUT ------------------------------------------------------------------
const keys = Object.create(null);
const pressedThisFrame = Object.create(null);
let lastRunKey = null;

window.addEventListener("keydown", e => {
  const k = e.key;
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(k)) e.preventDefault();
  if (!keys[k]) pressedThisFrame[k] = true;
  keys[k] = true;
  if (k === "m" || k === "M") { Audio.ensure(); Audio.toggleMute(); }
},{passive:false});

window.addEventListener("keyup", e => { keys[e.key] = false; });

function consumeRunPress() {
  const leftEdge  = pressedThisFrame["ArrowLeft"]  || pressedThisFrame["z"] || pressedThisFrame["Z"];
  const rightEdge = pressedThisFrame["ArrowRight"] || pressedThisFrame["x"] || pressedThisFrame["X"];
  if (leftEdge){ pressedThisFrame["ArrowLeft"]=false; pressedThisFrame["z"]=false; pressedThisFrame["Z"]=false;}
  if (rightEdge){ pressedThisFrame["ArrowRight"]=false; pressedThisFrame["x"]=false; pressedThisFrame["X"]=false;}
  if (leftEdge && rightEdge) return null;
  if (leftEdge)  { if (lastRunKey === "L") return null; lastRunKey="L"; return "L"; }
  if (rightEdge) { if (lastRunKey === "R") return null; lastRunKey="R"; return "R"; }
  return null;
}

function consumeJumpPress() {
  const j = pressedThisFrame["ArrowUp"] || pressedThisFrame[" "];
  if (j){ pressedThisFrame["ArrowUp"]=false; pressedThisFrame[" "]=false; return true; }
  return false;
}

function enterPressed(){
  const e = pressedThisFrame["Enter"];
  if (e){ pressedThisFrame["Enter"]=false; return true; }
  return false;
}

// ---- AUDIO (procedural, Web Audio) ------------------------------------------
const Audio = (() => {
  let ctx=null, master=null, muted=false, musicGain=null;
  function ensure(){
    if (ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value=0.28; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value=0.14; musicGain.connect(master);
  }
  function blip(freq,dur,type="square",vol=0.5,dest){
    if(muted||!ctx) return;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(vol,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+dur);
    o.connect(g); g.connect(dest||master);
    o.start(); o.stop(ctx.currentTime+dur);
  }
  function noise(dur,vol=0.6,freq=1200,q=1){
    if(muted||!ctx) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate*dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++){ d[i]=(Math.random()*2-1)*(1-i/d.length); }
    const src=ctx.createBufferSource(); src.buffer=buf;
    const g=ctx.createGain(); g.gain.value=vol;
    const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=freq; f.Q.value=q;
    src.connect(g); g.connect(f); f.connect(master); src.start();
  }
  function gunshot(){ noise(0.18,0.30,180,0.7); blip(90,0.18,"square",0.22); }
  function beep(f){ blip(f,0.08,"square",0.28); }
  function cheer(){ noise(1.2,0.08,900,0.5); noise(0.9,0.06,1600,0.4); }
  function thud(){ noise(0.12,0.35,260,0.8); blip(140,0.10,"sawtooth",0.18); }
  function jumpSfx(){ blip(520,0.10,"triangle",0.22); blip(720,0.08,"triangle",0.16); }
  function landSfx(){ blip(220,0.05,"square",0.18); }
  let musicTimer=null, musicOn=false;
  const motif = [ [0,392,0.22],[0.22,440,0.22],[0.44,587,0.34],[0.78,523,0.55] ];
  function stopMusic(){ musicOn=false; if(musicTimer){clearInterval(musicTimer);musicTimer=null;} }
  function startMusic(){
    if(!ctx||muted) return;
    musicOn=true;
    let i=0;
    const loop = () => {
      if(!musicOn) return;
      const t = (i/8) % 1.6;
      motif.forEach(([at,f,d])=>{ if(Math.abs(t-at)<0.02) blip(f,d*0.9,"triangle",0.10,musicGain); });
      i += 0.2;
    };
    if(musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(loop, 200);
  }
  return {
    ensure, gunshot, beep, cheer, thud, jumpSfx, landSfx,
    startMusic, stopMusic,
    toggleMute(){ muted=!muted; if(master) master.gain.value = muted?0:0.5; return muted; },
    resume(){ if(ctx && ctx.state==="suspended") ctx.resume(); }
  };
})();

// ---- GAME STATE -------------------------------------------------------------
const Scene = { MENU:"MENU", EVENTCARD:"EVENTCARD", COUNTDOWN:"COUNTDOWN", RACE:"RACE", FINISH:"FINISH", GAMEOVER:"GAMEOVER" };
let scene = Scene.MENU;
let mode = "progression";   // "progression" or "single"
let menuIndex = 0;
let lives = START_LIVES;
let score = 0;
let scoreDisplay = 0;
let blinkT = 0;
let frameAccum = 0;
let cardT = 0;
let run = null;
const EVENTS = [];
let eventIndex = 0;

function curEvent(){ return EVENTS[eventIndex]; }

function registerEvent(ev){ EVENTS.push(ev); }

function newRunner(){
  return {
    x: 0,
    vx: START_SPEED,
    frameIdx: 0,
    frameTimer: 0,
    lastPress: null,
    presses: 0,
    finished: false,
    finishTime: 0,
    airborne:false,
    jumpT:0,
    jumpVy:0,
    jumpHeight:0,
    hurdlesCleared:0,
    hurdlesHit:0,
    stumbleT:0,
  };
}

function startRace(){
  const ev = curEvent();
  run = {
    ev: ev,
    player:newRunner(),
    cpu:newRunner(),
    clock:0,
    phase:"countdown",
    countdownT: 3.0,
    finished:false,
    Qualified:false,
    newWR:false,
    awardedScore:0,
    scroll:0,
    clearFlags: ev.obstacles ? ev.obstacles.map(()=>false) : null,
    hitFlags:   ev.obstacles ? ev.obstacles.map(()=>false) : null,
    lj: ev.type === "longjump" ? {
      attempt: 1,
      bestDist: 0,
      distances: [],
      takeoffX: 0,
      takeoffSpeed: 0,
      flightT: 0,
      flightElapsed: 0,
      pumps: 0,
      lastPumpKey: null,
      foul: false,
      landDist: 0,
      resultTimer: 0,
    } : null,
    jav: ev.type === "javelin" ? {
      attempt: 1,
      bestDist: 0,
      distances: [],
      throwX: 0,
      throwSpeed: 0,
      throwAngle: 0,
      angleDir: 1,
      throwPhase: "idle",
      javX: 0,
      javY: 0,
      javVx: 0,
      javVy: 0,
      flightT: 0,
      flightElapsed: 0,
      landDist: 0,
      foul: false,
      resultTimer: 0,
    } : null,
  };
}

// ---- CORE FUNCTIONS ---------------------------------------------------------
function addScore(pts){
  const before = score;
  score += pts;
  const tb = Math.floor(before/EXTRA_LIFE_EVERY), ta = Math.floor(score/EXTRA_LIFE_EVERY);
  for (let i=tb;i<ta;i++){ lives++; Audio.beep(880); }
}

function padScore(n){ return ("000000"+(n|0)).slice(-6); }

function gotoEventCard(){ scene = Scene.EVENTCARD; cardT = 2.4; }

function advanceAfterFinish(){
  if (mode === "single") {
    if (run.Qualified) {
      scene = Scene.MENU;
    } else {
      if (lives > 0) gotoEventCard();
      else scene = Scene.GAMEOVER;
    }
    return;
  }
  // progression mode
  if (run.Qualified) {
    eventIndex++;
    if (eventIndex >= EVENTS.length) {
      eventIndex = 0;
      scene = Scene.MENU;
    } else {
      gotoEventCard();
    }
  } else {
    if (lives > 0) gotoEventCard();
    else scene = Scene.GAMEOVER;
  }
}

function resetGame(){
  lives = START_LIVES;
  score = 0; scoreDisplay = 0;
  eventIndex = 0;
  scene = Scene.MENU;
  Audio.stopMusic();
}

// ---- MAIN LOOP --------------------------------------------------------------
let last = performance.now();
function loop(now){
  let dt = now - last; last = now;
  if (dt > 250) dt = 250;
  frameAccum += dt;
  let steps = 0;
  while (frameAccum >= 1000/FPS && steps < 5){
    update(1/60);
    frameAccum -= 1000/FPS; steps++;
    for (const k in pressedThisFrame) pressedThisFrame[k]=false;
  }
  render();
  requestAnimationFrame(loop);
}

// ---- UPDATE -----------------------------------------------------------------
function update(dt){
  blinkT += dt;
  Audio.resume();
  if (scoreDisplay < score) scoreDisplay = Math.min(score, scoreDisplay + Math.max(1, Math.ceil((score-scoreDisplay)/12)));

  switch(scene){
    case Scene.MENU:
      updateMenu(dt); break;
    case Scene.EVENTCARD:
      cardT -= dt;
      if (cardT <= 0 || enterPressed()) {
        startRace();
        if (curEvent().type === "longjump" || curEvent().type === "javelin") { run.phase = "runup"; scene = Scene.RACE; }
        else scene = Scene.COUNTDOWN;
      }
      break;
    case Scene.COUNTDOWN:
      updateCountdown(dt); break;
    case Scene.RACE:
      updateRace(dt); break;
    case Scene.FINISH:
      if (enterPressed()) advanceAfterFinish();
      break;
    case Scene.GAMEOVER:
      if (enterPressed()) resetGame();
      break;
  }
}
