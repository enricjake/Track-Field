"use strict";
/* ============================================================================
   HYPER OLYMPIC — Menu / event selection screen.
   ============================================================================ */

const MENU_ITEMS = [
  { label: "ALL EVENTS", eventIndex: -1 },
  { label: "100M DASH",  eventIndex: 0 },
  { label: "110M HURDLES", eventIndex: 1 },
  { label: "LONG JUMP", eventIndex: 2 },
  { label: "JAVELIN THROW", eventIndex: 3 },
  { label: "SHOT PUT", eventIndex: 4 },
  { label: "HIGH JUMP", eventIndex: 5 },
  { label: "TRIPLE JUMP", eventIndex: 6 },
  { label: "ARCHERY", eventIndex: 7 },
  { label: "SKEET SHOOTING", eventIndex: 8 },
];

// ---- MENU UPDATE ------------------------------------------------------------
function updateMenu(dt){
  if (pressedThisFrame["ArrowUp"] || pressedThisFrame["w"] || pressedThisFrame["W"]) {
    menuIndex = Math.max(0, menuIndex - 1);
    Audio.beep(440);
  }
  if (pressedThisFrame["ArrowDown"] || pressedThisFrame["s"] || pressedThisFrame["S"]) {
    menuIndex = Math.min(MENU_ITEMS.length - 1, menuIndex + 1);
    Audio.beep(440);
  }
  // scroll wheel
  if (menuWheelAccum !== 0) {
    menuIndex = Math.max(0, Math.min(MENU_ITEMS.length - 1, menuIndex + menuWheelAccum));
    Audio.beep(440);
    menuWheelAccum = 0;
  }
  // number-key quick select
  for (let i=0;i<MENU_ITEMS.length;i++){
    if (pressedThisFrame[String(i+1)]) { selectMenu(i); return; }
  }
  if (enterPressed()) selectMenu(menuIndex);
}

function selectMenu(idx){
  Audio.ensure();
  Audio.startMusic();
  const item = MENU_ITEMS[idx];
  if (item.eventIndex === -1) {
    mode = "progression";
    eventIndex = 0;
  } else {
    mode = "single";
    eventIndex = item.eventIndex;
  }
  lives = START_LIVES;
  score = 0; scoreDisplay = 0;
  gotoEventCard();
}

// ---- MENU RENDER ------------------------------------------------------------
function renderMenu(){
  // sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 120);
  skyGrad.addColorStop(0, "#6ca4fc");
  skyGrad.addColorStop(0.5, P.sky);
  skyGrad.addColorStop(1, "#4c84dc");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0,0,VIEW_W,VIEW_H);
  drawStadium(0);
  ctx.fillStyle = P.crowd; ctx.fillRect(0,80,VIEW_W,30);
  drawCrowd(0);
  const grassGrad = ctx.createLinearGradient(0, 110, 0, 240);
  grassGrad.addColorStop(0, "#4ab04a");
  grassGrad.addColorStop(0.3, "#3a903a");
  grassGrad.addColorStop(1, "#2a702a");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0,110,VIEW_W,130);

  // title box with shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(26, 30, 208, 100);
  ctx.fillStyle = "#000";
  ctx.fillRect(24, 28, 208, 100);
  const titleGrad = ctx.createLinearGradient(24, 28, 24, 128);
  titleGrad.addColorStop(0, "#1838a8");
  titleGrad.addColorStop(0.5, "#0828a0");
  titleGrad.addColorStop(1, "#001898");
  ctx.fillStyle = titleGrad;
  ctx.fillRect(24, 28, 208, 100);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(24, 28, 208, 4);
  ctx.fillStyle = P.red;
  ctx.fillRect(24, 124, 208, 4);
  ctx.fillStyle = P.white; ctx.font="16px monospace"; ctx.textAlign="center";
  ctx.fillText("HYPER OLYMPIC", 128, 56);
  ctx.fillStyle = P.yellow; ctx.font="10px monospace";
  ctx.fillText("TRACK & FIELD", 128, 72);
  ctx.fillStyle = P.white; ctx.font="7px monospace";
  ctx.fillText("SELECT AN EVENT", 128, 96);

  // event list
  const listY = 134;
  const rowH = 14;
  for (let i=0; i<MENU_ITEMS.length; i++){
    const y = listY + i * rowH;
    const selected = (i === menuIndex);
    if (selected) {
      ctx.fillStyle = "rgba(255,206,94,0.25)";
      ctx.fillRect(24, y - 8, 208, rowH);
      ctx.fillStyle = P.yellow;
      ctx.fillRect(24, y - 8, 4, rowH);
      ctx.fillStyle = "rgba(255,206,94,0.1)";
      ctx.fillRect(28, y - 8, 204, rowH);
    }
    ctx.fillStyle = selected ? P.yellow : P.white;
    ctx.font = (selected ? "8px " : "7px ") + "monospace";
    ctx.textAlign = "left";
    ctx.fillText((i+1)+".", 32, y + 3);
    ctx.textAlign = "center";
    ctx.fillText(MENU_ITEMS[i].label, 128, y + 3);
    ctx.fillStyle = "#888";
    ctx.font = "6px monospace";
    ctx.textAlign = "right";
    if (i === 0) ctx.fillText("PLAY ALL", 220, y + 3);
    else {
      const ev = EVENTS[MENU_ITEMS[i].eventIndex];
      const isDist = ev.type === "longjump" || ev.type === "javelin" || ev.type === "shotput" || ev.type === "highjump" || ev.type === "triplejump";
      const isScore = ev.type === "archery" || ev.type === "skeet";
      if (isDist) {
        ctx.fillText(ev.qualifyDist.toFixed(2)+"m QUAL", 220, y + 3);
      } else if (isScore) {
        ctx.fillText(ev.qualifyDist.toFixed(0)+" PTS QUAL", 220, y + 3);
      } else {
        ctx.fillText(ev.qualifyTime.toFixed(2)+'" QUAL', 220, y + 3);
      }
    }
  }

  // controls help
  ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
  ctx.fillText("UP/DOWN or 1-9 to pick   ENTER to start", 128, 232);

  // animated athletes
  const f = (blinkT*8 | 0) % 4;
  drawAthlete(40, 232, f, 1, P.p1);
  drawAthlete(216, 232, f, 1, P.red);
}
