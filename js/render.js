"use strict";
/* ============================================================================
   HYPER OLYMPIC — All rendering / drawing functions.
   ============================================================================ */

// ---- NES-ish palette --------------------------------------------------------
const P = {
  sky:"#5c94fc", skyNight:"#101820", crowd:"#c84818", crowdShadow:"#7c1808",
  track:"#b86c1c", trackLine:"#fff", trackInfield:"#3aa03a", trackShadow:"#8c4a14",
  red:"#e83820", yellow:"#ffce5e", white:"#fff", black:"#000", tan:"#f4c080",
  scoreboard:"#0820a0", sbLight:"#3868d8",
  baton:"#ffd070", hurdle:"#e8d090", hurdleShadow:"#7c5c30",
  p1:"#fcfcfc", p2:"#f0c060",
  text:"#fff",
  sand:"#d4b060", sandDark:"#c0a050",
  javelin:"#e0e0e0", javelinTip:"#c04040",
};

// ---- DRAWING PRIMITIVES -----------------------------------------------------
function drawAthlete(cx, gy, frame, dir, shirt, airborne=false, jumpH=0){
  ctx.save();
  ctx.translate(cx, gy - jumpH);
  if (airborne) {
    ctx.fillStyle = P.tan;
    ctx.beginPath(); ctx.arc(0, -27, 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(-4, -23); ctx.lineTo(4, -23); ctx.lineTo(3, -14); ctx.lineTo(-3, -14);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#4a3c2c"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-1, -14); ctx.lineTo( 5, -10);
    ctx.moveTo( 1, -14); ctx.lineTo( 6, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -21); ctx.lineTo( 5, -19);
    ctx.moveTo(0, -21); ctx.lineTo(-5, -19);
    ctx.stroke();
  } else {
    const legSwing = Math.sin(frame * Math.PI/2) * 4;
    ctx.fillStyle = P.tan;
    ctx.beginPath(); ctx.arc(0, -26, 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(-4, -22); ctx.lineTo(4, -22); ctx.lineTo(3, -12); ctx.lineTo(-3, -12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#4a3c2c"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-1, -12); ctx.lineTo(-2 - legSwing, -2);
    ctx.moveTo( 1, -12); ctx.lineTo( 2 + legSwing, -2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo( 4 + legSwing, -14);
    ctx.moveTo(0, -20); ctx.lineTo(-4 - legSwing, -14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHurdle(px, laneY){
  const w = 6, h = 12;
  ctx.fillStyle = P.hurdleShadow;
  ctx.fillRect(px-1, laneY-2, 8, 2);
  ctx.fillStyle = P.hurdle;
  ctx.fillRect(px-w/2, laneY-h-2, w, 1);
  ctx.fillRect(px-w/2, laneY-h-2, 1, h);
  ctx.fillRect(px+w/2-1, laneY-h-2, 1, h);
  ctx.fillStyle = P.hurdleShadow;
  ctx.fillRect(px-2, laneY-h+2, 4, 1);
  ctx.fillStyle = P.hurdle;
  ctx.fillRect(px-2, laneY-h+4, 4, 1);
  ctx.fillStyle = P.hurdleShadow;
  ctx.fillRect(px-2, laneY-h+6, 4, 1);
}

function drawHurdleFallen(px, laneY){
  ctx.save();
  ctx.translate(px, laneY);
  ctx.fillStyle = P.hurdleShadow; ctx.fillRect(-4, -2, 8, 2);
  ctx.fillStyle = P.hurdle; ctx.fillRect(-4, -3, 8, 1);
  ctx.fillStyle = P.hurdleShadow; ctx.fillRect(-3, -4, 6, 1);
  ctx.restore();
}

function drawJavelinSprite(px, py, angle){
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-angle * Math.PI / 180);
  ctx.fillStyle = P.javelin;
  ctx.fillRect(-12, -1, 24, 2);
  ctx.fillStyle = P.javelinTip;
  ctx.fillRect(12, -2, 4, 4);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-12, -1, 3, 2);
  ctx.restore();
}

function drawHighJumpBar(px, barTopY){
  ctx.fillStyle = P.white;
  ctx.fillRect(px-12, barTopY, 2, 158 - barTopY);
  ctx.fillRect(px+10, barTopY, 2, 158 - barTopY);
  ctx.fillStyle = P.red;
  ctx.fillRect(px-14, barTopY, 28, 2);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(px-12, barTopY-2, 24, 2);
}

function drawAngleIndicator(cx, cy, angle){
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#000a";
  ctx.fillRect(-20, -24, 40, 28);
  ctx.strokeStyle = P.yellow;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 16, -Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = P.trackLine;
  ctx.fillRect(-1, 0, 2, -16);
  const rad = -angle * Math.PI / 180;
  ctx.strokeStyle = P.red;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(rad) * 14, Math.sin(rad) * 14);
  ctx.stroke();
  ctx.fillStyle = P.yellow;
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillText(angle.toFixed(0) + "°", 0, 12);
  ctx.restore();
}

function drawStadium(offsetX){
  const grad = ctx.createLinearGradient(0, 50, 0, 78);
  grad.addColorStop(0, "#4a6a9a");
  grad.addColorStop(0.5, "#3a5a8a");
  grad.addColorStop(1, "#2a4a7a");
  ctx.fillStyle = grad;
  for (let i=0;i<10;i++){
    const x = ((i*52 + offsetX) % (VIEW_W+60)) - 30;
    ctx.fillRect(x, 60, 44, 18);
    ctx.fillRect(x+10, 56, 24, 6);
  }
  for (let i=0;i<8;i++){
    const x = ((i*32 + offsetX*1.3) % (VIEW_W+40)) - 20;
    ctx.fillStyle = (i%2)? P.red : P.yellow;
    ctx.fillRect(x, 50, 6, 4);
    ctx.fillStyle = "#444"; ctx.fillRect(x+2, 54, 1, 8);
  }
}

function drawCrowd(offsetX){
  const colors = [P.crowd, "#ffce5e", "#fcfcfc", "#3868d8", "#61d838", "#e83820"];
  for (let y=80; y<110; y+=3){
    for (let x=0; x<VIEW_W; x+=3){
      const i = ((x/3 + y/3 + (offsetX|0)/3) | 0);
      if (i % 3 === 0){
        ctx.fillStyle = colors[(i>>1)%colors.length];
        ctx.fillRect(x,y,2,2);
        if (i % 7 === 0){
          ctx.fillStyle = "#fff";
          ctx.fillRect(x,y-1,1,1);
        }
      } else {
        ctx.fillStyle = P.crowdShadow;
        ctx.fillRect(x,y,2,2);
      }
    }
  }
}

function drawRunningSurface(){
  const trackGrad = ctx.createLinearGradient(0, TRACK_LANE_TOP, 0, TRACK_LANE_BOT+4);
  trackGrad.addColorStop(0, "#c87c2c");
  trackGrad.addColorStop(0.3, P.track);
  trackGrad.addColorStop(0.7, "#a85c0c");
  trackGrad.addColorStop(1, "#984c0c");
  ctx.fillStyle = trackGrad;
  ctx.fillRect(0, TRACK_LANE_TOP, VIEW_W, TRACK_LANE_BOT-TRACK_LANE_TOP+4);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0,TRACK_LANE_TOP,VIEW_W,2);
  for (let i=0;i<5;i++){
    const y = TRACK_LANE_TOP + i*7;
    ctx.fillStyle = (i%2)? "rgba(0,0,0,0.12)":"rgba(255,255,255,0.04)";
    ctx.fillRect(0,y,VIEW_W,1);
  }
  ctx.fillStyle = P.trackLine;
  ctx.fillRect(0,TRACK_LANE_TOP,VIEW_W,1);
  ctx.fillRect(0,TRACK_LANE_BOT,VIEW_W,1);
}

function drawScoreboard(){
  const ev = run.ev;
  ctx.fillStyle = "#0418a0";
  ctx.fillRect(8, 6, 120, 38);
  const sbGrad = ctx.createLinearGradient(10, 8, 10, 42);
  sbGrad.addColorStop(0, "#4878e8");
  sbGrad.addColorStop(0.5, "#2858c8");
  sbGrad.addColorStop(1, "#1848b8");
  ctx.fillStyle = sbGrad;
  ctx.fillRect(10,8,116,34);
  ctx.fillStyle = "#0820a0";
  ctx.fillRect(12,10,112,30);
  ctx.fillStyle = P.yellow; ctx.font="7px monospace"; ctx.textAlign="left";
  ctx.fillText(ev.name, 16, 19);
  ctx.fillStyle = P.white;
  if (ev.type === "longjump" || ev.type === "javelin" || ev.type === "shotput" || ev.type === "highjump" || ev.type === "triplejump") {
    ctx.fillText("WR   : "+ev.wrDist.toFixed(2)+"m", 16, 28);
    ctx.fillText("QUAL : "+ev.qualifyDist.toFixed(2)+"m", 16, 36);
  } else {
    ctx.fillText("WR   : "+ev.wrTime.toFixed(2), 16, 28);
    ctx.fillText("QUAL : "+ev.qualifyTime.toFixed(2), 16, 36);
  }
}

function drawSandPit(boardPx, pitEndPx){
  const sandGrad = ctx.createLinearGradient(boardPx, TRACK_LANE_TOP+4, boardPx, TRACK_LANE_BOT);
  sandGrad.addColorStop(0, "#e4c070");
  sandGrad.addColorStop(0.5, P.sand);
  sandGrad.addColorStop(1, "#c4a050");
  ctx.fillStyle = sandGrad;
  ctx.fillRect(boardPx, TRACK_LANE_TOP+4, pitEndPx - boardPx, TRACK_LANE_BOT - TRACK_LANE_TOP - 4);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let i=0;i<4;i++){
    const y = TRACK_LANE_TOP + 8 + i * 8;
    ctx.fillRect(boardPx, y, pitEndPx - boardPx, 1);
  }
  ctx.fillStyle = P.white;
  ctx.fillRect(boardPx-1, TRACK_LANE_TOP+2, 2, TRACK_LANE_BOT - TRACK_LANE_TOP);
}

// ---- SCENE RENDERING --------------------------------------------------------
function render(){
  ctx.save();
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  switch(scene){
    case Scene.MENU: renderMenu(); break;
    case Scene.EVENTCARD: renderTrackBg(); renderEventCard(); break;
    case Scene.COUNTDOWN: renderTrack(); renderCountdownOverlay(); break;
    case Scene.RACE: renderTrack(); renderHUD(); break;
    case Scene.FINISH: renderTrack(); renderFinishOverlay(); break;
    case Scene.GAMEOVER: renderTrack(); renderGameOver(); break;
  }
  ctx.restore();
}

function renderTrackBg(){
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 120);
  skyGrad.addColorStop(0, "#6ca4fc");
  skyGrad.addColorStop(0.5, P.sky);
  skyGrad.addColorStop(1, "#4c84dc");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0,0,VIEW_W,120);
  drawStadium(0);
  ctx.fillStyle = P.crowd; ctx.fillRect(0,80,VIEW_W,30);
  drawCrowd(0);
  const grassGrad = ctx.createLinearGradient(0, 110, 0, 118);
  grassGrad.addColorStop(0, "#4ab04a");
  grassGrad.addColorStop(1, "#2a802a");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0,110,VIEW_W,8);
  ctx.fillStyle = P.track; ctx.fillRect(0,TRACK_LANE_TOP,VIEW_W,TRACK_LANE_BOT-TRACK_LANE_TOP+4);
  ctx.fillStyle = P.trackShadow; ctx.fillRect(0,TRACK_LANE_TOP,VIEW_W,2);
}

function renderTrack(){
  const ev = run.ev;
  const isLJ = (ev.type === "longjump");
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 120);
  skyGrad.addColorStop(0, "#6ca4fc");
  skyGrad.addColorStop(0.5, P.sky);
  skyGrad.addColorStop(1, "#4c84dc");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0,0,VIEW_W,120);
  const parX = -run.scroll*0.15;
  drawStadium(parX);
  ctx.fillStyle = P.crowd; ctx.fillRect(0,80,VIEW_W,30);
  drawCrowd(-run.scroll*0.4);
  drawScoreboard();
  const grassGrad = ctx.createLinearGradient(0, 110, 0, 118);
  grassGrad.addColorStop(0, "#4ab04a");
  grassGrad.addColorStop(1, "#2a802a");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0,110,VIEW_W,8);
  if (isLJ) {
    const mToPx = (VIEW_W-40) / ev.distance;
    const boardPx = 20 + ev.boardAt*mToPx - run.scroll;
    const pitEndPx = 20 + ev.distance*mToPx - run.scroll;
    drawRunningSurface();
    drawSandPit(boardPx, pitEndPx);
    ctx.fillStyle = P.trackLine;
    for (let m=10;m<=ev.boardAt;m+=10){
      const px = 20 + m*mToPx - run.scroll;
      if (px < 0 || px > VIEW_W) continue;
      ctx.fillRect(px|0, TRACK_LANE_TOP+1, 1, TRACK_LANE_BOT-TRACK_LANE_TOP-1);
      if (scene===Scene.RACE||scene===Scene.FINISH){
        ctx.fillStyle = "#000a"; ctx.fillRect(px-10,170,20,8);
        ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
        ctx.fillText(m+"m", px, 177);
        ctx.fillStyle = P.trackLine;
      }
    }
    ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
    for (let d=1;d<=9;d++){
      const m = ev.boardAt + d;
      const px = 20 + m*mToPx - run.scroll;
      if (px < boardPx-2 || px > pitEndPx+2) continue;
      ctx.fillStyle = "#000a"; ctx.fillRect(px-8,170,16,8);
      ctx.fillStyle = P.yellow;
      ctx.fillText(d+"m", px, 177);
    }
    const playerScreenX = 20 + run.player.x*mToPx - run.scroll;
    drawAthlete(playerScreenX, 158, run.player.frameIdx, 1, P.p1, run.player.airborne, run.player.jumpHeight);
    ctx.fillStyle = "#000a"; ctx.fillRect(playerScreenX-9,168,18,8);
    ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
    ctx.fillText("P1", playerScreenX, 174);
    const lj = run.lj;
    if (lj) {
      ctx.fillStyle = "#000a"; ctx.fillRect(4, 210, 180, 14);
      ctx.fillStyle = P.white; ctx.font="7px monospace"; ctx.textAlign="left";
      const bestStr = lj.bestDist > 0 ? lj.bestDist.toFixed(2)+"m" : "--";
      ctx.fillText("ATTEMPT "+lj.attempt+"/"+ev.attempts+"  BEST "+bestStr, 8, 220);
      if (run.phase==="flight" && lj.takeoffSpeed > 0) {
        const curDist = Math.max(0, run.player.x - ev.boardAt);
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="8px monospace"; ctx.textAlign="center";
        ctx.fillText(curDist.toFixed(2)+"m", 140, 200);
      } else if (run.phase==="landed" && !lj.foul) {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText(lj.landDist.toFixed(2)+"m", 140, 202);
      } else if (run.phase==="landed" && lj.foul) {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.red; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText("FOUL!", 140, 202);
      }
    }
    return;
  }
  if (ev.type === "javelin") {
    const mToPx = (VIEW_W-40) / ev.distance;
    const boardPx = 20 + ev.boardAt*mToPx - run.scroll;
    drawRunningSurface();
    ctx.fillStyle = P.red;
    ctx.fillRect(boardPx-1, TRACK_LANE_TOP+2, 3, TRACK_LANE_BOT-TRACK_LANE_TOP-2);
    ctx.fillStyle = P.yellow;
    ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText("BOARD", boardPx, TRACK_LANE_TOP-2);
    ctx.fillStyle = P.trackLine;
    for (let m=10;m<=ev.distance;m+=10){
      const px = 20 + m*mToPx - run.scroll;
      if (px < 0 || px > VIEW_W) continue;
      ctx.fillRect(px|0, TRACK_LANE_TOP+1, 1, TRACK_LANE_BOT-TRACK_LANE_TOP-1);
      if (scene===Scene.RACE||scene===Scene.FINISH){
        ctx.fillStyle = "#000a"; ctx.fillRect(px-10,170,20,8);
        ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
        ctx.fillText(m+"m", px, 177);
        ctx.fillStyle = P.trackLine;
      }
    }
    const jav = run.jav;
    const playerScreenX = 20 + run.player.x*mToPx - run.scroll;
    drawAthlete(playerScreenX, 158, run.player.frameIdx, 1, P.p1);
    ctx.fillStyle = "#000a"; ctx.fillRect(playerScreenX-9,168,18,8);
    ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
    ctx.fillText("P1", playerScreenX, 174);
    if (jav) {
      ctx.fillStyle = "#000a"; ctx.fillRect(4, 210, 180, 14);
      ctx.fillStyle = P.white; ctx.font="7px monospace"; ctx.textAlign="left";
      const bestStr = jav.bestDist > 0 ? jav.bestDist.toFixed(2)+"m" : "--";
      ctx.fillText("ATTEMPT "+jav.attempt+"/"+ev.attempts+"  BEST "+bestStr, 8, 220);
      if (jav.throwPhase === "aiming") {
        const boardScrX = 20 + ev.boardAt*mToPx - run.scroll;
        drawAngleIndicator(boardScrX, 120, jav.throwAngle);
        ctx.fillStyle = P.yellow; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText("PRESS TO THROW!", 128, 190);
      } else if (jav.throwPhase === "flight") {
        const jx = 20 + jav.javX*mToPx - run.scroll;
        const jy = 140 - jav.javY * 3;
        const angle = Math.atan2(-jav.javVy, jav.javVx) * 180 / Math.PI;
        drawJavelinSprite(jx, jy, -angle);
        const curDist = Math.max(0, jav.javX - ev.boardAt);
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="8px monospace"; ctx.textAlign="center";
        ctx.fillText(curDist.toFixed(2)+"m", 140, 200);
      } else if (jav.throwPhase === "landed" && !jav.foul) {
        const landPx = 20 + (ev.boardAt + jav.landDist)*mToPx - run.scroll;
        drawJavelinSprite(landPx, 150, 20);
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText(jav.landDist.toFixed(2)+"m", 140, 202);
      } else if (jav.throwPhase === "landed" && jav.foul) {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.red; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText("FOUL!", 140, 202);
      }
    }
    return;
  }
  if (ev.type === "shotput") {
    const mToPx = (VIEW_W-40) / ev.distance;
    const boardPx = 20 + ev.boardAt*mToPx - run.scroll;
    drawRunningSurface();
    ctx.fillStyle = P.red;
    ctx.fillRect(boardPx-1, TRACK_LANE_TOP+2, 3, TRACK_LANE_BOT-TRACK_LANE_TOP-2);
    ctx.fillStyle = P.yellow;
    ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText("BOARD", boardPx, TRACK_LANE_TOP-2);
    ctx.fillStyle = P.trackLine;
    for (let m=1;m<=ev.distance;m++){
      const px = 20 + m*mToPx - run.scroll;
      if (px < 0 || px > VIEW_W) continue;
      ctx.fillRect(px|0, TRACK_LANE_TOP+1, 1, TRACK_LANE_BOT-TRACK_LANE_TOP-1);
      if (scene===Scene.RACE||scene===Scene.FINISH){
        ctx.fillStyle = "#000a"; ctx.fillRect(px-8,170,16,8);
        ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
        ctx.fillText(m+"m", px, 177);
        ctx.fillStyle = P.trackLine;
      }
    }
    const sp = run.sp;
    const playerScreenX = 20 + run.player.x*mToPx - run.scroll;
    drawAthlete(playerScreenX, 158, run.player.frameIdx, 1, P.p1);
    ctx.fillStyle = "#000a"; ctx.fillRect(playerScreenX-9,168,18,8);
    ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
    ctx.fillText("P1", playerScreenX, 174);
    if (sp) {
      ctx.fillStyle = "#000a"; ctx.fillRect(4, 210, 180, 14);
      ctx.fillStyle = P.white; ctx.font="7px monospace"; ctx.textAlign="left";
      const bestStr = sp.bestDist > 0 ? sp.bestDist.toFixed(2)+"m" : "--";
      ctx.fillText("ATTEMPT "+sp.attempt+"/"+ev.attempts+"  BEST "+bestStr, 8, 220);
      if (sp.throwPhase === "aiming") {
        drawAngleIndicator(boardPx, 120, sp.throwAngle);
        ctx.fillStyle = P.yellow; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText("PRESS TO PUT!", 128, 190);
      } else if (sp.throwPhase === "flight") {
        const sx = 20 + sp.spX*mToPx - run.scroll;
        const sy = 140 - sp.spY * 3;
        ctx.fillStyle = P.yellow;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI*2);
        ctx.fill();
        const curDist = Math.max(0, sp.spX - ev.boardAt);
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="8px monospace"; ctx.textAlign="center";
        ctx.fillText(curDist.toFixed(2)+"m", 140, 200);
      } else if (sp.throwPhase === "landed" && !sp.foul) {
        const landPx = 20 + (ev.boardAt + sp.landDist)*mToPx - run.scroll;
        ctx.fillStyle = P.yellow;
        ctx.beginPath();
        ctx.arc(landPx, 158, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(landPx, 158, 2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText(sp.landDist.toFixed(2)+"m", 140, 202);
      } else if (sp.throwPhase === "landed" && sp.foul) {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.red; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText("FOUL!", 140, 202);
      }
    }
    return;
  }
  if (ev.type === "highjump") {
    const mToPx = (VIEW_W-40) / ev.distance;
    const boardPx = 20 + ev.boardAt*mToPx - run.scroll;
    drawRunningSurface();
    ctx.fillStyle = P.red;
    ctx.fillRect(boardPx-1, TRACK_LANE_TOP+2, 3, TRACK_LANE_BOT-TRACK_LANE_TOP-2);
    ctx.fillStyle = P.yellow;
    ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText("BAR", boardPx, TRACK_LANE_TOP-2);
    ctx.fillStyle = P.trackLine;
    for (let m=5;m<=ev.distance;m+=5){
      const px = 20 + m*mToPx - run.scroll;
      if (px < 0 || px > VIEW_W) continue;
      ctx.fillRect(px|0, TRACK_LANE_TOP+1, 1, TRACK_LANE_BOT-TRACK_LANE_TOP-1);
      if (scene===Scene.RACE||scene===Scene.FINISH){
        ctx.fillStyle = "#000a"; ctx.fillRect(px-8,170,16,8);
        ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
        ctx.fillText(m+"m", px, 177);
        ctx.fillStyle = P.trackLine;
      }
    }
    const hj = run.hj;
    const barTopY = 158 - (hj.barHeight * HIGHJUMP_PIXELS_PER_M);
    drawHighJumpBar(boardPx, barTopY);
    const playerScreenX = 20 + run.player.x*mToPx - run.scroll;
    drawAthlete(playerScreenX, 158, run.player.frameIdx, 1, P.p1, run.player.airborne, run.player.jumpHeight);
    ctx.fillStyle = "#000a"; ctx.fillRect(playerScreenX-9,168,18,8);
    ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
    ctx.fillText("P1", playerScreenX, 174);
    if (hj) {
      ctx.fillStyle = "#000a"; ctx.fillRect(4, 210, 190, 14);
      ctx.fillStyle = P.white; ctx.font="7px monospace"; ctx.textAlign="left";
      const bestStr = hj.bestHeight > 0 ? hj.bestHeight.toFixed(2)+"m" : "--";
      ctx.fillText("ATTEMPT "+hj.attempt+"/"+ev.attempts+"  BAR "+hj.barHeight.toFixed(2)+"m  BEST "+bestStr, 8, 220);
      if (run.phase==="flight") {
        ctx.fillStyle = P.yellow; ctx.font="8px monospace"; ctx.textAlign="center";
        ctx.fillText("GO!", 140, 200);
      } else if (run.phase==="landed" && !hj.foul && hj.cleared) {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.yellow; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText("CLEAR!", 140, 202);
      } else if (run.phase==="landed") {
        ctx.fillStyle = "#000a"; ctx.fillRect(100, 190, 80, 14);
        ctx.fillStyle = P.red; ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText(hj.foul ? "FOUL!" : "FAILED", 140, 202);
      }
    }
    return;
  }
  drawRunningSurface();
  const stepM = 10;
  ctx.fillStyle = P.trackLine;
  for (let m=stepM;m<=ev.distance;m+=stepM){
    const px = 20 + m*((VIEW_W-40)/ev.distance) - run.scroll;
    if (px < 0 || px > VIEW_W) continue;
    ctx.fillRect(px|0, TRACK_LANE_TOP+1, 1, TRACK_LANE_BOT-TRACK_LANE_TOP-1);
    if (scene===Scene.RACE || scene===Scene.FINISH||scene===Scene.COUNTDOWN){
      ctx.fillStyle = "#000a"; ctx.fillRect(px-10,170,20,8);
      ctx.fillStyle = P.yellow; ctx.font = "6px monospace"; ctx.textAlign="center";
      ctx.fillText(m+"m", px, 177);
      ctx.fillStyle = P.trackLine;
    }
  }
  const fpx = 20 + ev.distance*((VIEW_W-40)/ev.distance) - run.scroll;
  if (fpx > 0 && fpx < VIEW_W+2){
    for (let y=TRACK_LANE_TOP;y<TRACK_LANE_BOT;y+=4){
      ctx.fillStyle = (((y/4)|0)%2===0) ? "#000" : "#fff";
      ctx.fillRect(fpx-2, y, 4, 4);
    }
  }
  if (ev.type === "hurdles" && run.clearFlags) {
    for (let i=0;i<ev.obstacles.length;i++){
      const hx = ev.obstacles[i];
      const px = 20 + hx*((VIEW_W-40)/ev.distance) - run.scroll;
      if (px < -8 || px > VIEW_W+8) continue;
      if (run.clearFlags[i]) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        drawHurdleFallen(px, 156);
        ctx.restore();
      } else if (run.hitFlags[i]) {
        drawHurdleFallen(px, 156);
      } else {
        drawHurdle(px-1, 144);
        drawHurdle(px+1, 158);
      }
    }
  }
  const mToPx = (VIEW_W-40) / ev.distance;
  const playerScreenX = 20 + run.player.x*mToPx - run.scroll;
  const cpuScreenX    = 20 + run.cpu.x*mToPx - run.scroll;
  if (ev.type==="hurdles" && run.clearFlags) {
    run.cpu.airborne = false;
    let near=false;
    for (const hx of ev.obstacles){ if (Math.abs(run.cpu.x - hx) < 1.4){ near=true; break; } }
    if (near){ run.cpu.jumpHeight = 8 + 4*Math.sin(run.clock*16); run.cpu.airborne=true; }
    else run.cpu.jumpHeight = 0;
  }
  drawAthlete(cpuScreenX, 144, run.cpu.frameIdx, 1, P.red, ev.type==="hurdles" && run.cpu.airborne, run.cpu.jumpHeight||0);
  drawAthlete(playerScreenX, 158, run.player.frameIdx, 1, P.p1, run.player.airborne, run.player.jumpHeight);
  ctx.fillStyle = "#000a"; ctx.fillRect(playerScreenX-9,168,18,8);
  ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
  ctx.fillText("P1", playerScreenX, 174);
  if (ev.type === "hurdles"){
    ctx.fillStyle = "#000a"; ctx.fillRect(4, 210, 120, 14);
    ctx.fillStyle = P.white; ctx.font="7px monospace"; ctx.textAlign="left";
    ctx.fillText("HURDLES "+run.player.hurdlesCleared+"/"+(ev.obstacles.length)+"  HIT "+run.player.hurdlesHit, 8, 220);
  }
}

function renderHUD(){
  const ev = run.ev;
  ctx.fillStyle = "#0418a0";
  ctx.fillRect(180, 6, 70, 38);
  const hudGrad = ctx.createLinearGradient(182, 8, 182, 42);
  hudGrad.addColorStop(0, "#4878e8");
  hudGrad.addColorStop(0.5, "#2858c8");
  hudGrad.addColorStop(1, "#1848b8");
  ctx.fillStyle = hudGrad;
  ctx.fillRect(182,8,66,34);
  ctx.fillStyle = "#0820a0";
  ctx.fillRect(184,10,62,30);
  ctx.fillStyle = P.yellow; ctx.font="7px monospace"; ctx.textAlign="left";
  ctx.fillText("TIME",188,19);
  ctx.fillStyle = P.white; ctx.font="10px monospace";
  ctx.fillText(run.clock.toFixed(2)+'"', 188, 30);
  ctx.fillStyle = P.yellow; ctx.font="6px monospace";
  ctx.fillText("LIVES "+lives+"  SCORE "+padScore(scoreDisplay), 188, 38);
  ctx.fillStyle = "#000a"; ctx.fillRect(4, 222, 60, 14);
  ctx.fillStyle = P.white; ctx.font="7px monospace";
  ctx.fillText("DIST "+(run.player.x).toFixed(1).padStart(5,"0")+"m", 8, 232);
  const sp = run.player.vx / MAX_SPEED;
  ctx.fillStyle = "#000a"; ctx.fillRect(196, 222, 58, 14);
  ctx.fillStyle = "#333"; ctx.fillRect(200, 226, 50, 6);
  ctx.fillStyle = sp>0.85? P.yellow : (sp>0.5? "#61d838" : "#888");
  ctx.fillRect(200,226, 50*Math.min(1,sp), 6);
  ctx.fillStyle = "#000a"; ctx.fillRect(VIEW_W/2-44, 222, 88, 14);
  ctx.fillStyle = P.yellow; ctx.font="7px monospace"; ctx.textAlign="center";
  ctx.fillText("EVENT "+(eventIndex+1)+"/"+EVENTS.length+"  "+ev.name, VIEW_W/2, 232);
}

function renderEventCard(){
  const ev = curEvent();
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  ctx.fillStyle = "#000";
  ctx.fillRect(30, 72, 200, 100);
  const cardGrad = ctx.createLinearGradient(30, 72, 30, 172);
  cardGrad.addColorStop(0, "#4878e8");
  cardGrad.addColorStop(0.5, "#2858c8");
  cardGrad.addColorStop(1, "#1848b8");
  ctx.fillStyle = cardGrad;
  ctx.fillRect(30,72,196,96);
  ctx.fillStyle = "#0820a0";
  ctx.fillRect(32,74,192,92);
  ctx.fillStyle = P.yellow; ctx.font="9px monospace"; ctx.textAlign="center";
  ctx.fillText("EVENT  "+(eventIndex+1)+"  OF  "+EVENTS.length, 128, 92);
  ctx.fillStyle = P.white; ctx.font="16px monospace";
  ctx.fillText(ev.name, 128, 116);
  ctx.fillStyle = P.yellow; ctx.font="7px monospace";
  if (ev.type === "longjump") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(2)+"m", 128, 132);
    ctx.fillText("QUALIFY DIST   "+ev.qualifyDist.toFixed(2)+"m", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  RUN & JUMP AT BOARD", 128, 154);
  } else if (ev.type === "triplejump") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(2)+"m", 128, 132);
    ctx.fillText("QUALIFY DIST   "+ev.qualifyDist.toFixed(2)+"m", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  HOP STEP JUMP!", 128, 154);
  } else if (ev.type === "javelin") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(2)+"m", 128, 132);
    ctx.fillText("QUALIFY DIST   "+ev.qualifyDist.toFixed(2)+"m", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  RUN, JUMP TO AIM, JUMP TO THROW", 128, 154);
  } else if (ev.type === "shotput") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(2)+"m", 128, 132);
    ctx.fillText("QUALIFY DIST   "+ev.qualifyDist.toFixed(2)+"m", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  RUN, JUMP TO AIM, JUMP TO PUT", 128, 154);
  } else if (ev.type === "highjump") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(2)+"m", 128, 132);
    ctx.fillText("QUALIFY HEIGHT "+ev.qualifyDist.toFixed(2)+"m", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  RUN & JUMP OVER BAR", 128, 154);
  } else if (ev.type === "archery") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(0)+" PTS", 128, 132);
    ctx.fillText("QUALIFY SCORE  "+ev.qualifyDist.toFixed(0)+" PTS", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  AIM & SHOOT!", 128, 154);
  } else if (ev.type === "skeet") {
    ctx.fillText("WORLD RECORD  "+ev.wrDist.toFixed(0)+" HITS", 128, 132);
    ctx.fillText("QUALIFY SCORE  "+ev.qualifyDist.toFixed(0)+" HITS", 128, 142);
    ctx.fillStyle = P.white; ctx.font="6px monospace";
    ctx.fillText(ev.attempts+" ATTEMPTS  SHOOT CLAYS!", 128, 154);
  } else {
    ctx.fillText("WORLD RECORD  "+ev.wrTime.toFixed(2)+'"', 128, 132);
    ctx.fillText("QUALIFY TIME   "+ev.qualifyTime.toFixed(2)+'"', 128, 142);
    if (ev.type==="hurdles"){
      ctx.fillStyle = P.white; ctx.font="6px monospace";
      ctx.fillText("PRESS UP / SPACE TO CLEAR HURDLES", 128, 154);
    }
  }
  if ((blinkT|0)%2===0 || cardT < 0.5){
    ctx.fillStyle = P.yellow; ctx.font="7px monospace";
    ctx.fillText("PRESS ENTER TO BEGIN", 128, 162);
  }
}

function renderCountdownOverlay(){
  if (run.countdownT > 2.0)      bannerText("READY?", P.yellow);
  else if (run.countdownT > 1.0) bannerText("SET!", P.white);
  else if (run.countdownT > 0)  bannerText("GO!", P.red);
}

function bannerText(s,col){
  ctx.fillStyle = "#000a"; ctx.fillRect(60,90,VIEW_W-120,40);
  ctx.fillStyle = col; ctx.font="20px monospace"; ctx.textAlign="center";
  ctx.fillText(s, VIEW_W/2, 118);
}

function renderFinishOverlay(){
  const ev = run.ev;
  const t = run.player.finishTime;
  const isLJ = (ev.type === "longjump");
  const isJav = (ev.type === "javelin");
  const isSP = (ev.type === "shotput");
  const isHJ = (ev.type === "highjump");
  const isTJ = (ev.type === "triplejump");
  const isArch = (ev.type === "archery");
  const isSkeet = (ev.type === "skeet");
  const best = isLJ ? run.lj.bestDist : (isJav ? run.jav.bestDist : (isSP ? run.sp.bestDist : (isHJ ? run.hj.bestHeight : (isTJ ? run.tj.bestDist : (isArch ? run.arch.totalScore : (isSkeet ? run.skeet.totalHits : 0))))));
  ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(20,40,216,150);
  ctx.fillStyle = "#000";
  ctx.fillRect(30, 50, 200, 134);
  const finishGrad = ctx.createLinearGradient(30, 50, 30, 184);
  finishGrad.addColorStop(0, "#4878e8");
  finishGrad.addColorStop(0.5, "#2858c8");
  finishGrad.addColorStop(1, "#1848b8");
  ctx.fillStyle = finishGrad;
  ctx.fillRect(30,50,196,130);
  ctx.fillStyle = "#0820a0";
  ctx.fillRect(32,52,192,126);
  ctx.fillStyle = P.yellow; ctx.font="12px monospace"; ctx.textAlign="center";
  ctx.fillText(ev.name, 128, 70);
  if (isLJ || isJav || isSP || isHJ || isTJ) {
    if (isHJ) {
      const heights = run.hj.heights;
      ctx.fillStyle = P.white; ctx.font="14px monospace";
      ctx.fillText('BEST '+best.toFixed(2)+'m', 128, 90);
      ctx.fillStyle = P.yellow; ctx.font="9px monospace";
      ctx.fillText("RECORD "+ev.wrDist.toFixed(2)+"m", 128, 104);
      ctx.fillStyle = P.white; ctx.font="7px monospace";
      for (let i=0;i<heights.length;i++){
        const h = heights[i];
        const label = h > 0 ? h.toFixed(2)+"m" : (h < 0 ? "FOUL" : "FAILED");
        ctx.fillText("ATTEMPT "+(i+1)+": "+label, 128, 116 + i*10);
      }
    } else {
      const distances = isLJ ? run.lj.distances : (isJav ? run.jav.distances : (isSP ? run.sp.distances : (isTJ ? run.tj.distances : [])));
      ctx.fillStyle = P.white; ctx.font="14px monospace";
      ctx.fillText('BEST '+best.toFixed(2)+'m', 128, 90);
      ctx.fillStyle = P.yellow; ctx.font="9px monospace";
      ctx.fillText("RECORD "+ev.wrDist.toFixed(2)+"m", 128, 104);
      ctx.fillStyle = P.white; ctx.font="7px monospace";
      for (let i=0;i<distances.length;i++){
        const d = distances[i];
        const label = d > 0 ? d.toFixed(2)+"m" : "FOUL";
        ctx.fillText("ATTEMPT "+(i+1)+": "+label, 128, 116 + i*10);
      }
    }
  } else if (isArch || isSkeet) {
    ctx.fillStyle = P.white; ctx.font="14px monospace";
    ctx.fillText('SCORE '+best+' PTS', 128, 90);
    ctx.fillStyle = P.yellow; ctx.font="9px monospace";
    ctx.fillText("QUALIFY "+ev.qualifyDist.toFixed(0)+" PTS", 128, 104);
    ctx.fillStyle = P.white; ctx.font="7px monospace";
    const scores = isArch ? run.arch.scores : run.skeet.hits;
    for (let i=0;i<scores.length;i++){
      ctx.fillText("ATTEMPT "+(i+1)+": "+scores[i]+" PTS", 128, 116 + i*10);
    }
  } else {
    ctx.fillStyle = P.white; ctx.font="14px monospace";
    ctx.fillText('TIME '+t.toFixed(2)+'"', 128, 90);
    ctx.fillStyle = P.yellow; ctx.font="9px monospace";
    ctx.fillText("RECORD "+ev.wrTime.toFixed(2)+'"', 128, 104);
    if (ev.type==="hurdles"){
      ctx.fillStyle = P.white; ctx.font="8px monospace";
      ctx.fillText("HURDLES CLEARED "+run.player.hurdlesCleared+"/"+ev.obstacles.length, 128, 118);
      ctx.fillText("HURDLES HIT "+run.player.hurdlesHit, 128, 128);
    }
  }
  if (run.newWR){
    const b = ((blinkT|0)%2===0);
    ctx.fillStyle = b ? P.red : P.yellow;
    ctx.font="12px monospace"; ctx.fillText("*** NEW WORLD RECORD ***",128,140);
  }
  if (run.Qualified){
    ctx.fillStyle = "#61d838"; ctx.font="10px monospace";
    ctx.fillText("QUALIFIED!", 128, 152);
  } else {
    ctx.fillStyle = P.red; ctx.font="10px monospace";
    ctx.fillText("DID NOT QUALIFY", 128, 152);
  }
  ctx.fillStyle = P.white; ctx.font="8px monospace";
  ctx.fillText("SCORE +"+run.awardedScore, 128, 164);
  ctx.fillStyle = P.yellow; ctx.font="6px monospace";
  ctx.fillText("LIVES "+lives+"   TOTAL "+padScore(scoreDisplay), 128, 176);
  if ((blinkT|0)%2===0){
    ctx.fillStyle = P.white; ctx.font="7px monospace";
    if (run.Qualified) ctx.fillText("PRESS ENTER FOR NEXT EVENT", 128, 196);
    else if (lives>0)  ctx.fillText("PRESS ENTER TO RETRY", 128, 196);
    else              ctx.fillText("PRESS ENTER", 128, 196);
  }
}

function renderGameOver(){
  ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  ctx.fillStyle = P.red; ctx.font="24px monospace"; ctx.textAlign="center";
  ctx.fillText("GAME  OVER", VIEW_W/2, 100);
  ctx.fillStyle = P.yellow; ctx.font="10px monospace";
  ctx.fillText("FINAL SCORE "+padScore(scoreDisplay), VIEW_W/2, 124);
  ctx.fillStyle = P.white; ctx.font="7px monospace";
  ctx.fillText("REACHED EVENT "+(eventIndex+1)+" — "+curEvent().name, VIEW_W/2, 142);
  if ((blinkT|0)%2===0){
    ctx.fillStyle = P.white; ctx.font="8px monospace";
    ctx.fillText("PRESS ENTER TO TRY AGAIN", VIEW_W/2, 168);
  }
}
