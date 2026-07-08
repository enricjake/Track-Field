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
  // sky + stadium
  ctx.fillStyle = P.sky; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  drawStadium(0);
  ctx.fillStyle = P.crowd; ctx.fillRect(0,80,VIEW_W,30);
  drawCrowd(0);
  ctx.fillStyle = P.track; ctx.fillRect(0,110,VIEW_W,130);

  // title box
  ctx.fillStyle = "#000"; ctx.fillRect(24, 28, 208, 100);
  ctx.fillStyle = P.yellow; ctx.fillRect(24, 28, 208, 6);
  ctx.fillStyle = P.red;    ctx.fillRect(24, 122, 208, 6);
  ctx.fillStyle = P.white; ctx.font="16px monospace"; ctx.textAlign="center";
  ctx.fillText("HYPER OLYMPIC", 128, 56);
  ctx.fillStyle = P.yellow; ctx.font="10px monospace";
  ctx.fillText("TRACK & FIELD", 128, 72);
  ctx.fillStyle = P.white; ctx.font="7px monospace";
  ctx.fillText("SELECT AN EVENT", 128, 96);

  // event list
  const listY = 142;
  const rowH = 18;
  for (let i=0; i<MENU_ITEMS.length; i++){
    const y = listY + i * rowH;
    const selected = (i === menuIndex);
    // highlight bar
    if (selected) {
      ctx.fillStyle = "rgba(255,206,94,0.18)";
      ctx.fillRect(24, y - 10, 208, rowH);
      ctx.fillStyle = P.yellow;
      ctx.fillRect(24, y - 10, 4, rowH);
    }
    // label
    ctx.fillStyle = selected ? P.yellow : P.white;
    ctx.font = (selected ? "9px " : "8px ") + "monospace";
    ctx.textAlign = "left";
    ctx.fillText((i+1)+".", 32, y + 3);
    ctx.textAlign = "center";
    ctx.fillText(MENU_ITEMS[i].label, 128, y + 3);
    // key hint
    ctx.fillStyle = "#666";
    ctx.font = "6px monospace";
    ctx.textAlign = "right";
    if (i === 0) ctx.fillText("PLAY ALL", 220, y + 3);
    else {
      const ev = EVENTS[MENU_ITEMS[i].eventIndex];
      ctx.fillText(ev.type === "longjump"
        ? ev.qualifyDist.toFixed(2)+"m QUAL"
        : ev.qualifyTime.toFixed(2)+'" QUAL', 220, y + 3);
    }
  }

  // controls help
  ctx.fillStyle = P.white; ctx.font="6px monospace"; ctx.textAlign="center";
  ctx.fillText("UP/DOWN or 1-4 to pick   ENTER to start", 128, 232);

  // animated athletes
  const f = (blinkT*8 | 0) % 4;
  drawAthlete(40, 232, f, 1, P.p1);
  drawAthlete(216, 232, f, 1, P.red);
}
