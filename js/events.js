"use strict";
/* ============================================================================
   HYPER OLYMPIC — Event definitions, update logic, finish logic.
   ============================================================================ */

// ---- EVENT DEFINITIONS ------------------------------------------------------
registerEvent({
  id:"DASH100", name:"100M DASH",
  distance: 100,
  qualifyTime: 11.50,
  wrTime: 9.95,
  cpuTargetTime: CPU_TARGET_TIME_100,
  type:"run",
  obstacles: null,
});

registerEvent({
  id:"HURDLES110", name:"110M HURDLES",
  distance: 110,
  qualifyTime: 15.20,
  wrTime: 13.20,
  cpuTargetTime: 15.40,
  type:"hurdles",
  obstacles: (() => {
    const n = 10, first = 11, last = 100, arr = [];
    for (let i=0;i<n;i++) arr.push(first + (last-first)*i/(n-1));
    return arr;
  })(),
});

registerEvent({
  id:"LJUMP", name:"LONG JUMP",
  type:"longjump",
  distance: LONGJUMP_BOARD_AT + LONGJUMP_PIT_LEN,
  boardAt: LONGJUMP_BOARD_AT,
  qualifyDist: LONGJUMP_QUALIFY,
  wrDist: LONGJUMP_WR,
  attempts: LONGJUMP_ATTEMPTS,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"JAVELIN", name:"JAVELIN THROW",
  type:"javelin",
  distance: 60,
  boardAt: 30,
  qualifyDist: 65.00,
  wrDist: 89.58,
  attempts: 3,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"SHOTPUT", name:"SHOT PUT",
  type:"shotput",
  distance: 10,
  boardAt: 5,
  qualifyDist: 15.50,
  wrDist: 23.37,
  attempts: 3,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"HJUMP", name:"HIGH JUMP",
  type:"highjump",
  distance: HIGHJUMP_RUNWAY,
  boardAt: HIGHJUMP_BAR_AT,
  startHeight: HIGHJUMP_START_HEIGHT,
  heightStep: HIGHJUMP_HEIGHT_STEP,
  qualifyDist: HIGHJUMP_QUALIFY,
  wrDist: HIGHJUMP_WR,
  attempts: HIGHJUMP_ATTEMPTS,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"TJUMP", name:"TRIPLE JUMP",
  type:"triplejump",
  distance: TRIPLEJUMP_BOARD_AT + TRIPLEJUMP_PIT_LEN,
  boardAt: TRIPLEJUMP_BOARD_AT,
  qualifyDist: TRIPLEJUMP_QUALIFY,
  wrDist: TRIPLEJUMP_WR,
  attempts: TRIPLEJUMP_ATTEMPTS,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"ARCHERY", name:"ARCHERY",
  type:"archery",
  distance: 0,
  boardAt: 0,
  qualifyDist: ARCHERY_QUALIFY,
  wrDist: ARCHERY_WR,
  attempts: ARCHERY_ATTEMPTS,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

registerEvent({
  id:"SKEET", name:"SKEET SHOOTING",
  type:"skeet",
  distance: 0,
  boardAt: 0,
  qualifyDist: SKEET_QUALIFY,
  wrDist: SKEET_WR,
  attempts: SKEET_ATTEMPTS,
  qualifyTime: 0, wrTime: 0, cpuTargetTime: 0, obstacles: null,
});

// ---- COUNTDOWN --------------------------------------------------------------
function updateCountdown(dt){
  consumeRunPress(); consumeJumpPress();
  run.countdownT -= dt;
  if (run.countdownT <= 0){
    run.phase = "running";
    scene = Scene.RACE;
    Audio.gunshot();
  } else if (run.countdownT <= 2.0 && !run._beeped2){ run._beeped2=true; Audio.beep(660); }
  else if (run.countdownT <= 1.0 && !run._beeped1){ run._beeped1=true; Audio.beep(740); }
}

// ---- RACE UPDATE (dash / hurdles) ------------------------------------------
function updateRace(dt){
  if (run.ev.type === "longjump") { updateLongJump(dt); return; }
  if (run.ev.type === "javelin") { updateJavelin(dt); return; }
  if (run.ev.type === "shotput") { updateShotPut(dt); return; }
  if (run.ev.type === "highjump") { updateHighJump(dt); return; }
  if (run.ev.type === "triplejump") { updateTripleJump(dt); return; }
  if (run.ev.type === "archery") { updateArchery(dt); return; }
  if (run.ev.type === "skeet") { updateSkeet(dt); return; }
  if (run.phase !== "running") return;
  const ev = run.ev;

  const p = consumeRunPress();
  if (run.player.stumbleT > 0) {
    run.player.stumbleT -= dt;
    run.player.vx *= 0.86;
    if (run.player.vx < 0) run.player.vx = 0;
  } else if (p){
    run.player.lastPress = p;
    run.player.presses++;
    run.player.vx = Math.min(MAX_SPEED, run.player.vx + PRESS_GAIN);
    run.player.frameIdx = (run.player.frameIdx + 1) % 4;
  } else {
    run.player.vx *= FRICTION;
    if (run.player.vx < 0) run.player.vx = 0;
  }

  if (ev.type === "hurdles") {
    if (!run.player.airborne && run.player.stumbleT <= 0 && consumeJumpPress()) {
      run.player.airborne = true;
      run.player.jumpT = 0;
      run.player.jumpVy = 1.9;
      Audio.jumpSfx();
    }
    if (run.player.airborne) {
      run.player.jumpT += dt;
      const g = 7.0;
      run.player.jumpHeight = Math.max(0, run.player.jumpVy*run.player.jumpT - 0.5*g*run.player.jumpT*run.player.jumpT);
      if (run.player.jumpHeight <= 0 && run.player.jumpT > 0.05) {
        run.player.airborne = false;
        run.player.jumpHeight = 0;
        Audio.landSfx();
      }
    }
  }

  run.player.x += run.player.vx;

  const cpuSpeed = ev.distance / (ev.cpuTargetTime * FPS);
  run.cpu.vx = cpuSpeed * (1 + 0.04*Math.sin(run.clock*4));
  run.cpu.x += run.cpu.vx;

  run.clock += dt;

  run.cpu.frameTimer += dt;
  if (run.cpu.frameTimer > 0.08){ run.cpu.frameTimer = 0; run.cpu.frameIdx = (run.cpu.frameIdx + 1) % 4; }

  if (ev.type === "hurdles" && run.clearFlags) {
    const mToPx = (VIEW_W-40) / ev.distance;
    for (let i=0;i<ev.obstacles.length;i++){
      if (run.clearFlags[i] || run.hitFlags[i]) continue;
      const hx = ev.obstacles[i];
      const dx = run.player.x - hx;
      if (Math.abs(dx) < 0.6) {
        if (run.player.airborne && run.player.jumpHeight > 4) {
          run.clearFlags[i] = true;
          run.player.hurdlesCleared++;
          addScore(HURDLE_CLEAR_BONUS);
          Audio.beep(900);
        } else if (!run.player.airborne) {
          run.hitFlags[i] = true;
          run.player.hurdlesHit++;
          run.player.vx *= 0.35;
          run.player.stumbleT = 0.45;
          Audio.thud();
        }
      }
    }
  }

  const mToPx = (VIEW_W-40) / ev.distance;
  run.scroll = Math.max(0, run.player.x * mToPx - 60);

  if (!run.player.finished && run.player.x >= ev.distance){
    run.player.finished = true;
    run.player.finishTime = run.clock;
  }
  if (!run.cpu.finished && run.cpu.x >= ev.distance){
    run.cpu.finished = true;
    run.cpu.finishTime = run.clock;
  }
  if (run.player.finished){
    finishRace();
  } else if (run.clock > 30.0){
    run.player.finishTime = run.clock;
    finishRace();
  }
}

// ---- RACE FINISH (dash / hurdles) ------------------------------------------
function finishRace(){
  run.phase = "done";
  Audio.cheer();
  const ev = run.ev;
  const t = run.player.finishTime;
  run.Qualified = (t <= ev.qualifyTime);
  run.newWR = (t < ev.wrTime);

  let pts = 0;
  if (run.Qualified){
    pts = SCORE_PER_QUALIFY + Math.floor((ev.qualifyTime - t) * SCORE_BONUS_PER_SEC);
    if (ev.type === "hurdles") pts += run.player.hurdlesCleared * HURDLE_CLEAR_BONUS;
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.max(0, Math.floor((30.0 - t) * 100));
    if (ev.type === "hurdles") pts += run.player.hurdlesCleared * 200;
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  scene = Scene.FINISH;
}

// ---- LONG JUMP UPDATE -------------------------------------------------------
function updateLongJump(dt){
  const ev = run.ev;
  const lj = run.lj;
  const p = run.player;

  if (run.phase === "runup") {
    const press = consumeRunPress();
    if (press) {
      p.lastPress = press;
      p.presses++;
      p.vx = Math.min(MAX_SPEED, p.vx + PRESS_GAIN);
      p.frameIdx = (p.frameIdx + 1) % 4;
    } else {
      p.vx *= FRICTION;
      if (p.vx < 0) p.vx = 0;
    }
    p.x += p.vx;
    run.clock += dt;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);
    if (consumeJumpPress() && p.x >= ev.boardAt - 1.5) {
      if (p.x <= ev.boardAt + 0.5 && p.vx > 0.02) {
        lj.takeoffX = p.x;
        lj.takeoffSpeed = p.vx;
        lj.flightT = 0.65 + p.vx * 6.5;
        lj.flightElapsed = 0;
        lj.pumps = 0;
        lj.lastPumpKey = null;
        lj.foul = false;
        p.airborne = true;
        p.jumpT = 0;
        p.jumpVy = 2.0;
        run.phase = "flight";
        Audio.jumpSfx();
      } else {
        foulAttempt();
      }
    } else if (p.x > ev.boardAt + 0.5) {
      foulAttempt();
    }
    return;
  }

  if (run.phase === "flight") {
    lj.flightElapsed += dt;
    const press = consumeRunPress();
    if (press && press !== lj.lastPumpKey) {
      lj.lastPumpKey = press;
      lj.pumps++;
      Audio.beep(500 + lj.pumps * 60);
    }
    p.jumpT += dt;
    const g = 7.0;
    p.jumpHeight = Math.max(0, p.jumpVy*p.jumpT - 0.5*g*p.jumpT*p.jumpT);
    p.x += lj.takeoffSpeed * 0.85;
    run.clock += dt;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);
    if (lj.flightElapsed >= lj.flightT || (p.jumpHeight <= 0 && lj.flightElapsed > 0.35)) {
      const baseDist = Math.max(0, (lj.takeoffSpeed * 60 - 4.5) * 1.5);
      const pumpBonus = Math.min(lj.pumps, Math.floor(lj.flightT / 0.12)) * LONGJUMP_PUMP_DIST;
      const earlyLoss = Math.max(0, ev.boardAt - lj.takeoffX);
      p.x = ev.boardAt + Math.max(0, baseDist + pumpBonus - earlyLoss);
      lj.landDist = Math.max(0, p.x - ev.boardAt);
      p.airborne = false;
      p.jumpHeight = 0;
      p.vx = 0;
      run.scroll = Math.max(0, p.x*((VIEW_W-40)/ev.distance) - 60);
      Audio.landSfx();
      run.phase = "landed";
      lj.resultTimer = 2.2;
    }
    return;
  }

  if (run.phase === "landed") {
    lj.resultTimer -= dt;
    if (lj.resultTimer <= 0 || enterPressed()) {
      lj.distances.push(lj.foul ? 0 : lj.landDist);
      if (!lj.foul && lj.landDist > lj.bestDist) lj.bestDist = lj.landDist;
      if (lj.attempt >= ev.attempts) {
        finishLongJump();
      } else {
        lj.attempt++;
        p.x = 0; p.vx = 0; p.airborne = false; p.jumpHeight = 0;
        lj.foul = false;
        run.phase = "runup";
      }
    }
    return;
  }
}

function foulAttempt(){
  const lj = run.lj;
  lj.foul = true;
  lj.landDist = 0;
  Audio.thud();
  run.phase = "landed";
  lj.resultTimer = 1.8;
}

function finishLongJump(){
  const ev = run.ev;
  const best = run.lj.bestDist;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 1000);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 100);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- SHOT PUT UPDATE --------------------------------------------------------
function updateShotPut(dt){
  const ev = run.ev;
  const sp = run.sp;
  const p = run.player;

  if (run.phase === "runup") {
    const press = consumeRunPress();
    if (press) {
      p.lastPress = press;
      p.presses++;
      p.vx = Math.min(SHOTPUT_MAX_SPEED, p.vx + SHOTPUT_PRESS_GAIN);
      p.frameIdx = (p.frameIdx + 1) % 4;
    } else {
      p.vx *= FRICTION;
      if (p.vx < 0) p.vx = 0;
    }
    p.x += p.vx;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);

    if (sp.throwPhase === "idle") {
      run.clock += dt;
      if (consumeJumpPress() && p.x >= ev.boardAt - 1.5) {
        if (p.x <= ev.boardAt + 0.5 && p.vx > 0.02) {
          sp.throwX = p.x;
          sp.throwSpeed = p.vx;
          sp.throwAngle = 45;
          sp.angleDir = 1;
          sp.throwPhase = "aiming";
          p.airborne = false;
          p.vx = 0;
          Audio.jumpSfx();
        } else {
          foulShotPut();
        }
      } else if (p.x > ev.boardAt + 0.5) {
        foulShotPut();
      }
      return;
    }
  }

  if (sp.throwPhase === "aiming") {
    sp.throwAngle += sp.angleDir * 120 * dt;
    if (sp.throwAngle >= 80) { sp.throwAngle = 80; sp.angleDir = -1; }
    if (sp.throwAngle <= 10) { sp.throwAngle = 10; sp.angleDir = 1; }
    if (consumeJumpPress()) {
      sp.throwPhase = "flight";
      sp.flightT = 0.8 + sp.throwSpeed * 5.0;
      sp.flightElapsed = 0;
      const rad = sp.throwAngle * Math.PI / 180;
      const power = 2.5 + sp.throwSpeed * 12;
      sp.spVx = Math.cos(rad) * power;
      sp.spVy = Math.sin(rad) * power;
      sp.spX = ev.boardAt;
      sp.spY = 0;
      Audio.beep(800);
    }
    run.clock += dt;
    return;
  }

  if (sp.throwPhase === "flight") {
    sp.flightElapsed += dt;
    sp.spX += sp.spVx;
    sp.spVy -= 0.12;
    sp.spY += sp.spVy;
    if (sp.spY <= 0 && sp.flightElapsed > 0.2) {
      sp.spY = 0;
      sp.landDist = Math.max(0, sp.spX - ev.boardAt);
      sp.throwPhase = "landed";
      sp.resultTimer = 2.2;
      Audio.landSfx();
    }
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, (ev.boardAt + (sp.spX - ev.boardAt) * 0.5) * mToPx - 60);
    run.clock += dt;
    return;
  }

  if (sp.throwPhase === "landed") {
    sp.resultTimer -= dt;
    if (sp.resultTimer <= 0 || enterPressed()) {
      sp.distances.push(sp.foul ? 0 : sp.landDist);
      if (!sp.foul && sp.landDist > sp.bestDist) sp.bestDist = sp.landDist;
      if (sp.attempt >= ev.attempts) {
        finishShotPut();
      } else {
        sp.attempt++;
        p.x = 0; p.vx = 0; p.airborne = false; p.jumpHeight = 0;
        sp.foul = false;
        run.phase = "runup";
        sp.throwPhase = "idle";
      }
    }
    return;
  }
}

function foulShotPut(){
  const sp = run.sp;
  sp.foul = true;
  sp.landDist = 0;
  sp.throwPhase = "landed";
  sp.resultTimer = 1.8;
  Audio.thud();
}

function finishShotPut(){
  const ev = run.ev;
  const best = run.sp.bestDist;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 1000);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 100);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- JAVELIN THROW UPDATE ---------------------------------------------------
function updateJavelin(dt){
  const ev = run.ev;
  const jav = run.jav;
  const p = run.player;

  if (run.phase === "runup") {
    const press = consumeRunPress();
    if (press) {
      p.lastPress = press;
      p.presses++;
      p.vx = Math.min(MAX_SPEED, p.vx + PRESS_GAIN);
      p.frameIdx = (p.frameIdx + 1) % 4;
    } else {
      p.vx *= FRICTION;
      if (p.vx < 0) p.vx = 0;
    }
    p.x += p.vx;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);

    if (jav.throwPhase === "idle") {
      run.clock += dt;
      if (consumeJumpPress() && p.x >= ev.boardAt - 1.5) {
        if (p.x <= ev.boardAt + 0.5 && p.vx > 0.02) {
          jav.throwX = p.x;
          jav.throwSpeed = p.vx;
          jav.throwAngle = 45;
          jav.angleDir = 1;
          jav.throwPhase = "aiming";
          p.airborne = false;
          p.vx = 0;
          Audio.jumpSfx();
        } else {
          foulJavelin();
        }
      } else if (p.x > ev.boardAt + 0.5) {
        foulJavelin();
      }
      return;
    }
  }

  if (jav.throwPhase === "aiming") {
    jav.throwAngle += jav.angleDir * 120 * dt;
    if (jav.throwAngle >= 80) { jav.throwAngle = 80; jav.angleDir = -1; }
    if (jav.throwAngle <= 10) { jav.throwAngle = 10; jav.angleDir = 1; }
    if (consumeJumpPress()) {
      jav.throwPhase = "flight";
      jav.flightT = 0.8 + jav.throwSpeed * 5.0;
      jav.flightElapsed = 0;
      const rad = jav.throwAngle * Math.PI / 180;
      const power = 2.5 + jav.throwSpeed * 12;
      jav.javVx = Math.cos(rad) * power;
      jav.javVy = Math.sin(rad) * power;
      jav.javX = ev.boardAt;
      jav.javY = 0;
      Audio.beep(800);
    }
    run.clock += dt;
    return;
  }

  if (jav.throwPhase === "flight") {
    jav.flightElapsed += dt;
    jav.javX += jav.javVx;
    jav.javVy -= 0.12;
    jav.javY += jav.javVy;
    if (jav.javY <= 0 && jav.flightElapsed > 0.2) {
      jav.javY = 0;
      jav.landDist = Math.max(0, jav.javX - ev.boardAt);
      jav.throwPhase = "landed";
      jav.resultTimer = 2.2;
      Audio.landSfx();
    }
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, (ev.boardAt + (jav.javX - ev.boardAt) * 0.5) * mToPx - 60);
    run.clock += dt;
    return;
  }

  if (jav.throwPhase === "landed") {
    jav.resultTimer -= dt;
    if (jav.resultTimer <= 0 || enterPressed()) {
      jav.distances.push(jav.foul ? 0 : jav.landDist);
      if (!jav.foul && jav.landDist > jav.bestDist) jav.bestDist = jav.landDist;
      if (jav.attempt >= ev.attempts) {
        finishJavelin();
      } else {
        jav.attempt++;
        p.x = 0; p.vx = 0; p.airborne = false; p.jumpHeight = 0;
        jav.foul = false;
        run.phase = "runup";
        jav.throwPhase = "idle";
      }
    }
    return;
  }
}

function foulJavelin(){
  const jav = run.jav;
  jav.foul = true;
  jav.landDist = 0;
  jav.throwPhase = "landed";
  jav.resultTimer = 1.8;
  Audio.thud();
}

function finishJavelin(){
  const ev = run.ev;
  const best = run.jav.bestDist;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 1000);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 100);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- HIGH JUMP UPDATE -------------------------------------------------------
function updateHighJump(dt){
  const ev = run.ev;
  const hj = run.hj;
  const p = run.player;

  if (run.phase === "runup") {
    const press = consumeRunPress();
    if (press) {
      p.lastPress = press;
      p.presses++;
      p.vx = Math.min(MAX_SPEED, p.vx + PRESS_GAIN);
      p.frameIdx = (p.frameIdx + 1) % 4;
    } else {
      p.vx *= FRICTION;
      if (p.vx < 0) p.vx = 0;
    }
    p.x += p.vx;
    run.clock += dt;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);

    if (consumeJumpPress() && p.x >= ev.boardAt - 1.5) {
      if (p.x <= ev.boardAt + 0.5 && p.vx > 0.02) {
        hj.takeoffX = p.x;
        hj.takeoffSpeed = p.vx;
        hj.jumpVy = 469 + p.vx * 647;
        p.airborne = true;
        p.jumpT = 0;
        p.jumpHeight = 0;
        hj.cleared = false;
        hj.foul = false;
        hj.flightT = 1.2;
        hj.flightElapsed = 0;
        run.phase = "flight";
        Audio.jumpSfx();
      } else {
        foulHighJump();
      }
    } else if (p.x > ev.boardAt + 0.5) {
      foulHighJump();
    }
    return;
  }

  if (run.phase === "flight") {
    hj.flightElapsed += dt;
    p.jumpT += dt;
    const g = HIGHJUMP_GRAVITY;
    p.jumpHeight = Math.max(0, hj.jumpVy*p.jumpT - 0.5*g*p.jumpT*p.jumpT);
    const barPx = hj.barHeight * HIGHJUMP_PIXELS_PER_M;
    p.x += hj.takeoffSpeed * 0.25;
    if (p.jumpHeight >= barPx && !hj.cleared) {
      hj.cleared = true;
      Audio.beep(900);
    }
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);
    run.clock += dt;
    if (hj.flightElapsed >= hj.flightT || (p.jumpHeight <= 0 && hj.flightElapsed > 0.1)) {
      p.airborne = false;
      run.phase = "landed";
      hj.resultTimer = 2.2;
      Audio.landSfx();
    }
    return;
  }

  if (run.phase === "landed") {
    hj.resultTimer -= dt;
    if (hj.resultTimer <= 0 || enterPressed()) {
      const h = hj.foul ? -1 : (hj.cleared ? hj.barHeight : 0);
      hj.heights.push(h);
      if (!hj.foul && hj.cleared && hj.barHeight > hj.bestHeight) {
        hj.bestHeight = hj.barHeight;
        hj.barHeight += ev.heightStep;
      }
      if (hj.attempt >= ev.attempts) {
        finishHighJump();
      } else {
        hj.attempt++;
        p.x = 0; p.vx = 0; p.airborne = false; p.jumpHeight = 0;
        hj.foul = false; hj.cleared = false;
        run.phase = "runup";
      }
    }
    return;
  }
}

function foulHighJump(){
  const hj = run.hj;
  hj.foul = true;
  run.phase = "landed";
  hj.resultTimer = 1.8;
  Audio.thud();
}

function finishHighJump(){
  const ev = run.ev;
  const best = run.hj.bestHeight;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 1000);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 500);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- TRIPLE JUMP UPDATE ------------------------------------------------------
function updateTripleJump(dt){
  const ev = run.ev;
  const tj = run.tj;
  const p = run.player;

  if (run.phase === "runup") {
    const press = consumeRunPress();
    if (press) {
      p.lastPress = press;
      p.presses++;
      p.vx = Math.min(MAX_SPEED, p.vx + PRESS_GAIN);
      p.frameIdx = (p.frameIdx + 1) % 4;
    } else {
      p.vx *= FRICTION;
      if (p.vx < 0) p.vx = 0;
    }
    p.x += p.vx;
    run.clock += dt;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);
    if (consumeJumpPress() && p.x >= ev.boardAt - 1.5) {
      if (p.x <= ev.boardAt + 0.5 && p.vx > 0.02) {
        tj.takeoffX = p.x;
        tj.takeoffSpeed = p.vx;
        tj.flightT = 0.45 + p.vx * 5.0;
        tj.flightElapsed = 0;
        tj.pumps = 0;
        tj.lastPumpKey = null;
        tj.foul = false;
        tj.phase = "hop";
        tj.hopDist = 0;
        tj.stepDist = 0;
        tj.jumpDist = 0;
        p.airborne = true;
        p.jumpT = 0;
        p.jumpVy = 1.8;
        run.phase = "flight";
        Audio.jumpSfx();
      } else {
        foulTripleJump();
      }
    } else if (p.x > ev.boardAt + 0.5) {
      foulTripleJump();
    }
    return;
  }

  if (run.phase === "flight") {
    tj.flightElapsed += dt;
    const press = consumeRunPress();
    if (press && press !== tj.lastPumpKey) {
      tj.lastPumpKey = press;
      tj.pumps++;
      Audio.beep(500 + tj.pumps * 60);
    }
    p.jumpT += dt;
    const g = 7.0;
    p.jumpHeight = Math.max(0, p.jumpVy*p.jumpT - 0.5*g*p.jumpT*p.jumpT);
    p.x += tj.takeoffSpeed * 0.8;
    run.clock += dt;
    const mToPx = (VIEW_W-40) / ev.distance;
    run.scroll = Math.max(0, p.x*mToPx - 60);

    if (tj.phase === "hop" && (tj.flightElapsed >= tj.flightT || (p.jumpHeight <= 0 && tj.flightElapsed > 0.25))) {
      const baseDist = Math.max(0, (tj.takeoffSpeed * 60 - 4.5) * 0.5);
      const pumpBonus = Math.min(tj.pumps, Math.floor(tj.flightT / 0.12)) * TRIPLEJUMP_PUMP_DIST;
      tj.hopDist = Math.max(0, baseDist + pumpBonus);
      tj.phase = "step";
      tj.flightT = 0.40 + tj.takeoffSpeed * 4.5;
      tj.flightElapsed = 0;
      tj.pumps = 0;
      tj.lastPumpKey = null;
      p.jumpT = 0;
      p.jumpVy = 1.6;
      Audio.jumpSfx();
    }

    if (tj.phase === "step" && (tj.flightElapsed >= tj.flightT || (p.jumpHeight <= 0 && tj.flightElapsed > 0.25))) {
      const baseDist = Math.max(0, (tj.takeoffSpeed * 60 - 4.5) * 0.5);
      const pumpBonus = Math.min(tj.pumps, Math.floor(tj.flightT / 0.12)) * TRIPLEJUMP_PUMP_DIST;
      tj.stepDist = Math.max(0, baseDist + pumpBonus);
      tj.phase = "jump";
      tj.flightT = 0.55 + tj.takeoffSpeed * 5.5;
      tj.flightElapsed = 0;
      tj.pumps = 0;
      tj.lastPumpKey = null;
      p.jumpT = 0;
      p.jumpVy = 2.0;
      Audio.jumpSfx();
    }

    if (tj.phase === "jump" && (tj.flightElapsed >= tj.flightT || (p.jumpHeight <= 0 && tj.flightElapsed > 0.3))) {
      const baseDist = Math.max(0, (tj.takeoffSpeed * 60 - 4.5) * 0.6);
      const pumpBonus = Math.min(tj.pumps, Math.floor(tj.flightT / 0.12)) * TRIPLEJUMP_PUMP_DIST;
      tj.jumpDist = Math.max(0, baseDist + pumpBonus);
      const earlyLoss = Math.max(0, ev.boardAt - tj.takeoffX);
      p.x = ev.boardAt + Math.max(0, tj.hopDist + tj.stepDist + tj.jumpDist - earlyLoss);
      tj.landDist = Math.max(0, p.x - ev.boardAt);
      p.airborne = false;
      p.jumpHeight = 0;
      p.vx = 0;
      run.scroll = Math.max(0, p.x*((VIEW_W-40)/ev.distance) - 60);
      Audio.landSfx();
      run.phase = "landed";
      tj.resultTimer = 2.2;
    }
    return;
  }

  if (run.phase === "landed") {
    tj.resultTimer -= dt;
    if (tj.resultTimer <= 0 || enterPressed()) {
      tj.distances.push(tj.foul ? 0 : tj.landDist);
      if (!tj.foul && tj.landDist > tj.bestDist) tj.bestDist = tj.landDist;
      if (tj.attempt >= ev.attempts) {
        finishTripleJump();
      } else {
        tj.attempt++;
        p.x = 0; p.vx = 0; p.airborne = false; p.jumpHeight = 0;
        tj.foul = false;
        run.phase = "runup";
      }
    }
    return;
  }
}

function foulTripleJump(){
  const tj = run.tj;
  tj.foul = true;
  tj.landDist = 0;
  Audio.thud();
  run.phase = "landed";
  tj.resultTimer = 1.8;
}

function finishTripleJump(){
  const ev = run.ev;
  const best = run.tj.bestDist;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 1000);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 100);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- ARCHERY UPDATE ----------------------------------------------------------
function updateArchery(dt){
  const ev = run.ev;
  const arch = run.arch;
  const p = run.player;

  if (run.phase === "runup") {
    if (arch.shootPhase === "idle") {
      arch.aimX = 128;
      arch.aimY = 120;
      arch.targetX = 128;
      arch.targetY = 120;
      arch.shootPhase = "aiming";
      run.clock += dt;
      return;
    }
  }

  if (arch.shootPhase === "aiming") {
    arch.aimX += arch.aimDir * ARCHERY_AIM_SPEED * dt;
    if (arch.aimX >= 200) { arch.aimX = 200; arch.aimDir = -1; }
    if (arch.aimX <= 56) { arch.aimX = 56; arch.aimDir = 1; }
    
    arch.aimY += arch.aimDir * ARCHERY_AIM_SPEED * 0.6 * dt;
    if (arch.aimY >= 160) { arch.aimY = 160; arch.aimDir = -1; }
    if (arch.aimY <= 80) { arch.aimY = 80; arch.aimDir = 1; }

    arch.targetX += arch.targetMoveDir * ARCHERY_TARGET_MOVE_SPEED * dt;
    if (arch.targetX >= 180) { arch.targetX = 180; arch.targetMoveDir = -1; }
    if (arch.targetX <= 76) { arch.targetX = 76; arch.targetMoveDir = 1; }

    arch.targetY += arch.targetMoveDir * ARCHERY_TARGET_MOVE_SPEED * 0.4 * dt;
    if (arch.targetY >= 140) { arch.targetY = 140; arch.targetMoveDir = -1; }
    if (arch.targetY <= 100) { arch.targetY = 100; arch.targetMoveDir = 1; }

    if (consumeJumpPress()) {
      arch.shootPhase = "flight";
      arch.flightT = 0.3;
      arch.flightElapsed = 0;
      arch.arrowX = arch.aimX;
      arch.arrowY = arch.aimY;
      const dx = arch.targetX - arch.aimX;
      const dy = arch.targetY - arch.aimY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      arch.arrowVx = (dx / dist) * 8;
      arch.arrowVy = (dy / dist) * 8;
      Audio.beep(800);
    }
    run.clock += dt;
    return;
  }

  if (arch.shootPhase === "flight") {
    arch.flightElapsed += dt;
    arch.arrowX += arch.arrowVx;
    arch.arrowY += arch.arrowVy;
    
    if (arch.flightElapsed >= arch.flightT) {
      const dx = arch.arrowX - arch.targetX;
      const dy = arch.arrowY - arch.targetY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let score = 0;
      if (dist < 5) score = 100;
      else if (dist < 10) score = 80;
      else if (dist < 15) score = 60;
      else if (dist < 20) score = 40;
      else if (dist < 25) score = 20;
      else score = 0;
      
      arch.scores.push(score);
      arch.totalScore += score;
      arch.shootPhase = "landed";
      arch.resultTimer = 1.5;
      Audio.landSfx();
      if (score > 0) Audio.beep(600 + score);
    }
    run.clock += dt;
    return;
  }

  if (arch.shootPhase === "landed") {
    arch.resultTimer -= dt;
    if (arch.resultTimer <= 0 || enterPressed()) {
      if (arch.round >= ARCHERY_ROUNDS) {
        if (arch.attempt >= ev.attempts) {
          finishArchery();
        } else {
          arch.attempt++;
          arch.round = 1;
          arch.totalScore = 0;
          arch.scores = [];
          arch.shootPhase = "idle";
          run.phase = "runup";
        }
      } else {
        arch.round++;
        arch.shootPhase = "idle";
        run.phase = "runup";
      }
    }
    return;
  }
}

function finishArchery(){
  const ev = run.ev;
  const best = run.arch.totalScore;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 10);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 5);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}

// ---- SKEET SHOOTING UPDATE ---------------------------------------------------
function updateSkeet(dt){
  const ev = run.ev;
  const skeet = run.skeet;
  const p = run.player;

  if (run.phase === "runup") {
    if (skeet.shootPhase === "idle") {
      skeet.hits = 0;
      skeet.clayActive = false;
      skeet.claySpawnTimer = 0.5;
      skeet.claysThisRound = 0;
      skeet.shootPhase = "shooting";
      run.clock += dt;
      return;
    }
  }

  if (skeet.shootPhase === "shooting") {
    skeet.claySpawnTimer -= dt;
    
    if (!skeet.clayActive && skeet.claySpawnTimer <= 0 && skeet.claysThisRound < SKEET_CLAYS_PER_ROUND) {
      skeet.clayActive = true;
      skeet.claysThisRound++;
      skeet.clayX = 20;
      skeet.clayY = 180 + Math.random() * 40;
      skeet.clayVx = SKEET_CLAY_SPEED + Math.random() * 0.5;
      skeet.clayVy = -2.5 - Math.random() * 1.0;
      skeet.claySpawnTimer = SKEET_CLAY_SPAWN_INTERVAL;
    }

    if (skeet.clayActive) {
      skeet.clayX += skeet.clayVx;
      skeet.clayY += skeet.clayVy;
      
      if (skeet.clayX > 240 || skeet.clayY < 20 || skeet.clayY > 220) {
        skeet.clayActive = false;
      }

      if (consumeJumpPress()) {
        const dx = skeet.clayX - 128;
        const dy = skeet.clayY - 120;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 30 && skeet.clayActive) {
          skeet.clayActive = false;
          skeet.hits++;
          skeet.totalHits++;
          Audio.gunshot();
          Audio.beep(700 + skeet.hits * 50);
        } else {
          Audio.gunshot();
        }
      }
    }

    run.clock += dt;

    if (skeet.claysThisRound >= SKEET_CLAYS_PER_ROUND && !skeet.clayActive) {
      skeet.shootPhase = "landed";
      skeet.resultTimer = 1.5;
    }
    return;
  }

  if (skeet.shootPhase === "landed") {
    skeet.resultTimer -= dt;
    if (skeet.resultTimer <= 0 || enterPressed()) {
      if (skeet.attempt >= ev.attempts) {
        finishSkeet();
      } else {
        skeet.attempt++;
        skeet.shootPhase = "idle";
        run.phase = "runup";
      }
    }
    return;
  }
}

function finishSkeet(){
  const ev = run.ev;
  const best = run.skeet.totalHits;
  run.Qualified = (best >= ev.qualifyDist);
  run.newWR = (best > ev.wrDist);
  let pts = 0;
  if (run.Qualified) {
    pts = SCORE_PER_QUALIFY + Math.floor((best - ev.qualifyDist) * 500);
    if (run.newWR) pts += WR_BONUS;
  } else {
    pts = Math.floor(best * 200);
  }
  run.awardedScore = pts;
  addScore(pts);
  if (!run.Qualified) lives = Math.max(0, lives - 1);
  run.phase = "done";
  Audio.cheer();
  scene = Scene.FINISH;
}
