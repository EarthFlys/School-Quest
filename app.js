// ===================== 0) ตั้งค่า SUPABASE (ใส่ค่าของคุณตรงนี้) =====================
const SUPABASE_URL = "https://dmiunmotmbnsswspnzjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_0wNEgBPE9JCxeV1Rg1M1GA_Gde0FHpt";

// ฟังก์ชันกลางสำหรับคุยกับ Supabase
async function sb(endpoint, method = "GET", body = null, headers = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "resolution=merge-duplicates" : "return=representation",
      ...headers
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ===================== 1) ตารางเรียน ม.6/12 ภาคเรียนที่ 2/2569 =====================
const PERIODS = [
  ["08:40","09:30"],["09:30","10:20"],["10:20","11:10"],["11:10","12:00"],["12:00","12:50"],
  ["12:50","13:40"],["13:40","14:30"],["14:30","15:20"],["15:20","16:10"],["16:10","17:00"]
];
const LUNCH = 4;
const S = (code, teacher, room) => ({ code, teacher, room });
const A = (name, room = "") => ({ name, room, activity: true });

const SCHEDULE = {
  1: [S("ว33202","ครูถนอมศักดิ์","127"), S("ว33202","ครูถนอมศักดิ์","127"), S("ค33202","ครูประยูร","621"),
      S("พ33202","ครูอนุชิต","สนามลีลาศ"), null, S("ค33102","ครูฉัตรชาวา","622"), S("ท33102","ครูสุกัญญา","328"),
      S("อ33102","ครูนงลักษณ์","224"), S("ส33204","ครูที่ปรึกษา",""), null],
  2: [S("ว30296","ครูธนพร","425/1"), S("ว30296","ครูธนพร","425/1"), S("ว30296","ครูธนพร","425/1"),
      A("ห้องสมุด"), null, S("ว33242","ครูสุปรัชญา","112"), S("ค33202","ครูประยูร","621"),
      A("ชุมนุม"), null, null],
  3: [S("อ33202","ครู Ronald","226"), S("อ33102","ครูนงลักษณ์","226"), S("ว33101","ครูศุภรดา","123"),
      S("ว33101","ครูศุภรดา","123"), null, S("ว33202","ครูถนอมศักดิ์","127"), S("ท33102","ครูสุกัญญา","328"),
      A("กิจกรรมสาธารณประโยชน์"), null, null],
  4: [S("ว30298","ครูสมปรารถนา","438"), S("ว30298","ครูสมปรารถนา","438"), S("ว33242","ครูสุปรัชญา","112"),
      S("ว33242","ครูสุปรัชญา","112"), null, S("พ33102","ครูสุวัฒชัย","545"), A("อิสระ"),
      S("ส33102","ครูอานนท์","538"), null, null],
  5: [S("ก33902","ครูสุพรรณี","217"), S("ส33102","ครูอานนท์","538"), S("ค33102","ครูฉัตรชาวา","622"),
      A("อิสระ"), null, S("ค33202","ครูประยูร","621"), S("ว33101","ครูศุภรดา","123"),
      S("ศ33102","ครูธัญพิมล","ช201"), null, null],
};

const GROUPS = {
  "ว":{name:"วิทยาศาสตร์",color:"#16a34a"}, "ค":{name:"คณิตศาสตร์",color:"#2563eb"},
  "ท":{name:"ภาษาไทย",color:"#e11d48"},   "อ":{name:"ภาษาอังกฤษ",color:"#9333ea"},
  "ส":{name:"สังคมศึกษา",color:"#d97706"}, "พ":{name:"สุขศึกษา/พลศึกษา",color:"#0d9488"},
  "ศ":{name:"ศิลปะ",color:"#db2777"},     "ก":{name:"แนะแนว",color:"#0284c7"},
};
const GRAY = "#94a3b8";
const DAYS = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const DAY_COLOR = {1:"#fde047",2:"#f9a8d4",3:"#86efac",4:"#fdba74",5:"#93c5fd"};

// ===================== 2) ระบบเกม & ข้อมูล =====================
const DIFF = { easy:{xp:10,icon:"⭐"}, normal:{xp:20,icon:"⭐⭐"}, hard:{xp:40,icon:"⭐⭐⭐"} };
const PETS = ["🥚","🐣","🐥","🐤","🐔","🦅","🐉"];
const TITLES = ["มือใหม่","นักเรียนฝึกหัด","นักผจญภัย","อัศวินการบ้าน","จอมเวทย์ความรู้","ปรมาจารย์","ตำนานห้องเรียน"];
const QUOTES = [
  "วันนี้จะเป็นวันที่ดี สู้ๆ นะ!", "อย่าลืมเคลียร์เควสก่อนไปนอนล่ะ 🎮",
  "เลเวลอัพอยู่ไม่ไกล ลุยเลย!", "พักได้ แต่อย่ายอมแพ้!", "ระบบซิงค์ข้อมูลออนไลน์เรียบร้อย ✨"
];
const EV = { "สอบ":{icon:"📝",color:"#ef4444"}, "กิจกรรม":{icon:"🎪",color:"#a855f7"}, "วันหยุด":{icon:"🏖️",color:"#22c55e"}, "อื่นๆ":{icon:"📌",color:"#64748b"} };
const levelOf = xp => Math.floor(xp / 100) + 1;
const rank = lv => Math.min(Math.floor((lv - 1) / 2), PETS.length - 1);
const BADGES = [
  { id:"first", icon:"🗡️", name:"เควสแรก", desc:"ทำเควสสำเร็จ 1 ครั้ง", test:d => d.done >= 1 },
  { id:"five", icon:"🛡️", name:"นักล่าเควส", desc:"สำเร็จ 5 เควส", test:d => d.done >= 5 },
  { id:"twenty", icon:"👑", name:"ราชาการบ้าน", desc:"สำเร็จ 20 เควส", test:d => d.done >= 20 },
  { id:"streak3", icon:"🔥", name:"ไฟลุก", desc:"เข้าต่อเนื่อง 3 วัน", test:d => d.streak >= 3 },
  { id:"lv5", icon:"💎", name:"เลเวล 5", desc:"ไปถึงเลเวล 5", test:d => levelOf(d.xp) >= 5 },
];

const $ = s => document.querySelector(s), qsa = s => Array.from(document.querySelectorAll(s));
const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const label = s => s.activity ? s.name : s.code;
const metaOf = s => s ? [s.teacher, s.room && "📍" + s.room].filter(Boolean).join(" · ") : "";
const colorOf = s => s.activity ? GRAY : (GROUPS[s.code[0]]?.color || GRAY);
const fmtShort = ds => new Date(ds + "T00:00").toLocaleDateString("th-TH", { day:"numeric", month:"short" });
const daysLeft = due => { const t = new Date(); t.setHours(0,0,0,0); return Math.round((new Date(due + "T00:00") - t) / 864e5); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

let actx;
function sfx(type){
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === "level" ? [523,659,784,1047] : type === "coin" ? [988,1319,1760] : [660,880];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.08;
      o.type = "square"; o.frequency.value = f;
      g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.11);
    });
  } catch {}
}

function confetti(x = innerWidth / 2, y = innerHeight / 2){
  const colors = ["#facc15","#f472b6","#4ade80","#60a5fa","#fb923c"];
  for (let i = 0; i < 28; i++){
    const p = document.createElement("i");
    p.style.cssText = `position:fixed;width:8px;height:8px;z-index:58;pointer-events:none;left:${x}px;top:${y}px;background:${colors[i%5]};animation:burst 1s steps(10) forwards;--dx:${(Math.random()-.5)*360}px;--dy:${-Math.random()*260}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function syncToGoogleCalendar(title, due, details = ""){
  const dStr = due.replace(/-/g, "");
  const text = encodeURIComponent(`⚔️ เควส: ${title}`);
  const detailsEnc = encodeURIComponent(`รายละเอียด: ${details}\n\nจัดการผ่าน School Quest 🎒`);
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dStr}/${dStr}&details=${detailsEnc}`;
  window.open(url, "_blank");
}

// ===================== 3) จัดการผู้ใช้ผ่าน Supabase =====================
const newData = () => ({ hw:[], events:[], xp:0, coins:0, streak:0, lastDay:"", done:0, badges:[], avatar:"🐱", room:"ม.6/12" });

let user = null, NAME = "", ROOM = "ม.6/12", AVATAR = "🐱", D = null;
let page = "home", qFilter = "todo", editingId = null;
let calY, calM, selDate = iso(new Date());
let selectedTimetableDay = Math.min(Math.max(new Date().getDay(), 1), 5);

async function persist(){
  if (!user) return;
  try {
    await sb(`users?username=eq.${user}`, "PATCH", { data: D });
  } catch (err) {
    console.error("ซิงค์ข้อมูลไม่สำเร็จ:", err);
  }
}
function commit(){ persist(); renderAll(); }
const pending = () => D.hw.filter(h => !h.done).sort((a, b) => a.due.localeCompare(b.due));

async function hash(pw, salt){
  if (!crypto.subtle) return btoa(unescape(encodeURIComponent(salt + pw)));
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

qsa("#avatarPicker span").forEach(el => el.onclick = () => {
  qsa("#avatarPicker span").forEach(x => x.classList.remove("sel"));
  el.classList.add("sel");
  selectedAvatar = el.dataset.av;
});
let selectedAvatar = "🐱";

let authMode = "login";
qsa(".auth-tabs button").forEach(b => b.onclick = () => {
  authMode = b.dataset.mode;
  qsa(".auth-tabs button").forEach(x => x.classList.toggle("active", x === b));
  $("#auth").classList.toggle("register", authMode === "register");
  $("#authMsg").textContent = "";
  sfx();
});

$("#authForm").onsubmit = async e => {
  e.preventDefault();
  const f = e.target.elements, box = $(".auth-box");
  const username = f["username"].value.trim().toLowerCase(), pw = f["password"].value;
  const fail = msg => { $("#authMsg").textContent = msg; box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); };
  
  try {
    if (authMode === "register"){
      const name = f["name"].value.trim(), room = f["room"].value.trim() || "ม.6/12";
      if (!name) return fail("กรุณาใส่ชื่อที่ให้เรียก");
      
      const check = await sb(`users?username=eq.${username}&select=username`);
      if (check && check.length > 0) return fail("ชื่อผู้ใช้นี้มีคนใช้แล้ว");

      const salt = uid(), dat = newData();
      dat.avatar = selectedAvatar; dat.room = room;
      const hashed = await hash(pw, salt);

      await sb("users", "POST", { username, name, room, salt, hash: hashed, data: dat });
    } else {
      const res = await sb(`users?username=eq.${username}&select=*`);
      if (!res || res.length === 0) return fail("ไม่พบชื่อผู้ใช้นี้");
      const u = res[0];
      const hashed = await hash(pw, u.salt);
      if (hashed !== u.hash) return fail("รหัสผ่านไม่ถูกต้อง");
    }
    localStorage.setItem("ms_session", username);
    e.target.reset(); sfx("level");
    startApp(username);
  } catch (err) {
    fail("เชื่อมต่อฐานข้อมูลไม่สำเร็จ กรุณาเช็กเน็ตหรือการตั้งค่า Supabase");
    console.error(err);
  }
};

async function startApp(username){
  try {
    const res = await sb(`users?username=eq.${username}&select=*`);
    if (!res || res.length === 0) return showAuth();
    const u = res[0];
    user = u.username; NAME = u.name; ROOM = u.room || "ม.6/12";
    D = Object.assign(newData(), u.data);
    AVATAR = D.avatar || "🐱";
    
    $("#auth").classList.add("hidden"); $("#app").classList.remove("hidden");
    dailyCheck(); renderAll(); showPage("home");
  } catch (err) {
    console.error(err);
    showAuth();
  }
}

function showAuth(){ $("#app").classList.add("hidden"); $("#auth").classList.remove("hidden"); }
function logout(){ localStorage.removeItem("ms_session"); user = null; D = null; showAuth(); }

function dailyCheck(){
  const today = iso(new Date());
  if (D.lastDay === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  D.streak = D.lastDay === iso(y) ? D.streak + 1 : 1;
  D.lastDay = today; D.coins += 5;
  checkBadges(); persist();
  setTimeout(() => toast(`🔥 เข้าใช้งานต่อเนื่อง ${D.streak} วัน · +5 🪙`), 700);
}

function gainXP(n){
  const before = levelOf(D.xp);
  D.xp += n;
  const lv = levelOf(D.xp);
  if (lv > before){
    $("#luText").innerHTML = `LEVEL UP!<br>LV.${lv}`;
    const el = $("#levelup"); el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    setTimeout(() => { sfx("level"); confetti(); }, 300);
    setTimeout(() => el.classList.remove("show"), 2300);
  }
}

function checkBadges(){
  BADGES.forEach(b => {
    if (!D.badges.includes(b.id) && b.test(D)){
      D.badges.push(b.id); D.coins += 20;
      setTimeout(() => toast(`🏆 ปลดล็อก ${b.icon} ${b.name} +20 🪙`), 1400);
    }
  });
}

function toggleQuest(h, btn){
  if (!h) return;
  h.done = !h.done;
  if (h.done){
    const late = daysLeft(h.due) < 0, base = DIFF[h.diff || "normal"].xp;
    h.xpGot = late ? Math.ceil(base / 2) : base;
    h.coinGot = late ? 2 : 5;
    D.done++; D.coins += h.coinGot;
    const r = btn.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    sfx("coin"); navigator.vibrate?.(20);
    toast(`${late ? "⏰ ส่งช้า" : "🎉 เควสสำเร็จ"} +${h.xpGot} XP · +${h.coinGot} 🪙`);
    gainXP(h.xpGot);
  } else {
    D.done = Math.max(0, D.done - 1);
    D.coins = Math.max(0, D.coins - (h.coinGot || 0));
    D.xp = Math.max(0, D.xp - (h.xpGot || 0));
    h.xpGot = h.coinGot = 0;
  }
  checkBadges(); commit();
}

// ===================== 4) คอมโพเนนต์ & หน้าจอ =====================
const pageHead = (icon, title, sub, actions = "") => `
  <div class="page-head pop"><div><div class="page-icon">${icon}</div>
  <h1 class="page-title">${title}</h1><p class="muted">${sub}</p></div>
  <div class="head-actions">${actions}</div></div>`;
const empty = (emoji, text) => `<div class="empty pop"><div class="big">${emoji}</div><p>${text}</p></div>`;
const callout = (icon, title, sub = "", pct = null) => `
  <div class="callout box pop"><span class="c-icon">${icon}</span><div><b>${esc(title)}</b>
  <div class="muted">${esc(sub)}</div>${pct !== null ? `<div class="xpbar thin"><div style="width:${pct}%"></div></div>` : ""}</div></div>`;

function dueInfo(h){
  if (h.done) return ["", "✔ สำเร็จ"];
  const d = daysLeft(h.due);
  if (d < 0) return ["late", `เลยกำหนด ${-d} วัน`];
  if (d === 0) return ["soon", "ส่งวันนี้!"];
  if (d === 1) return ["soon", "ส่งพรุ่งนี้"];
  return ["", `อีก ${d} วัน`];
}

function questItem(h, i = 0){
  const [cls, txt] = dueInfo(h), dif = DIFF[h.diff || "normal"];
  return `<div class="quest box pop ${h.done ? "done" : ""}" data-id="${h.id}" style="--c:#5856d6;--i:${i}">
    <button class="check" data-act="toggle" aria-label="สำเร็จ">${h.done ? "✔" : ""}</button>
    <div class="q-info" data-act="edit">
      <div class="q-title">${esc(h.title)}</div>
      ${h.note ? `<div class="muted small">${esc(h.note)}</div>` : ""}
      <div class="tags"><span class="tag">👨‍🏫 ${esc(h.teacher)}</span>
        <span class="tag gray">${esc(h.type)}</span>
        <span class="tag ${cls}">📅 ${fmtShort(h.due)} · ${txt}</span></div>
    </div>
    <div class="quest-actions">
      <button class="btn sm" data-act="sync-cal" data-id="${h.id}" title="ซิงค์ไป Google Calendar">🗓️ ซิงค์</button>
      <div class="reward">+${dif.xp}XP</div>
    </div>
    <button class="del" data-act="del" aria-label="ลบ">✕</button></div>`;
}

function nowCard(){
  const d = new Date().getDay(), arr = SCHEDULE[d], m = nowMin();
  if (!arr) return callout("🏖️", "วันนี้วันหยุด!", "พักผ่อนให้เต็มที่ แล้วค่อยมาลุยเควส");
  const cur = PERIODS.findIndex(([a, b]) => m >= toMin(a) && m < toMin(b));
  if (cur === LUNCH) return callout("🍱", "พักกลางวัน", "เติมพลังให้เต็มหลอด!");
  if (cur >= 0 && arr[cur]){
    const s = arr[cur], [a, b] = PERIODS[cur].map(toMin);
    return callout("📖", `กำลังเรียน: ${label(s)}`, `คาบ ${cur + 1} · ${metaOf(s)} · เหลือ ${b - m} นาที`, (m - a) / (b - a) * 100);
  }
  const nx = PERIODS.findIndex(([a], p) => toMin(a) > m && arr[p]);
  if (nx >= 0){
    const s = arr[nx];
    return callout("⏭️", `คาบถัดไป: ${label(s)}`, `${PERIODS[nx][0]} น. · ${metaOf(s)} · อีก ${toMin(PERIODS[nx][0]) - m} นาที`);
  }
  return callout("🎉", "เลิกเรียนแล้ว!", "ได้เวลาไปเคลียร์เควสการบ้านกันแล้ว");
}

function renderSide(){
  const lv = levelOf(D.xp);
  $("#avatarDisplay").textContent = AVATAR;
  $("#sideName").textContent = NAME;
  $("#sideRoom").textContent = ROOM;
  $("#badge").textContent = pending().length || "";
}

function renderHome(){
  const lv = levelOf(D.xp), prog = D.xp % 100, hr = new Date().getHours();
  const greet = hr < 12 ? "อรุณสวัสดิ์" : hr < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
  const randomQuote = QUOTES[Math.floor(Math.abs(Math.sin(D.xp + D.coins)) * QUOTES.length)];
  const pend = pending();
  
  $("#page-home").innerHTML =
    pageHead("👋", `${greet}, ${esc(NAME)}!`, `💬 "${randomQuote}"`,
      `<button class="icon-btn" data-act="theme" title="สลับโหมด">🌓</button>
       <button class="icon-btn" data-act="logout" title="ออกจากระบบ">🚪</button>`) +
    `<div class="player box pop" style="--i:1">
      <div class="pet">${PETS[rank(lv)]}</div>
      <div class="player-info">
        <div class="px">LV.${lv} · ${TITLES[rank(lv)]}</div>
        <div class="xpbar"><div style="width:${prog}%"></div></div>
        <div class="px" style="font-size:9px;color:var(--muted)">${prog} / 100 XP ถึงเลเวลถัดไป</div>
      </div>
      <div class="stats">
        <div class="stat"><span>🪙</span><b>${D.coins}</b><small>เหรียญ</small></div>
        <div class="stat"><span>🔥</span><b>${D.streak}</b><small>วันติด</small></div>
        <div class="stat"><span>⚔️</span><b>${D.done}</b><small>สำเร็จ</small></div>
      </div>
    </div>` +
    nowCard() +
    `<h3 class="h3">⚔️ เควสที่ใกล้ถึงกำหนด</h3>` +
    (pend.length ? pend.slice(0, 3).map(questItem).join("") : empty("✨", "ไม่มีเควสค้าง เยี่ยมมาก!")) +
    `<h3 class="h3">🏆 ความสำเร็จ (${D.badges.length}/${BADGES.length})</h3>
     <div class="badges">${BADGES.map((b, i) => `<div class="badge box pop ${D.badges.includes(b.id) ? "" : "locked"}" style="--i:${i}" title="${b.desc}">
       <span>${b.icon}</span><small><b>${b.name}</b></small><small class="muted">${b.desc}</small></div>`).join("")}</div>`;
}

function renderTimetable(){
  const today = new Date().getDay(), m = nowMin();
  const arr = SCHEDULE[selectedTimetableDay] || [];
  
  const dayBtns = [1,2,3,4,5].map(d => `
    <button class="day-tab ${d === selectedTimetableDay ? "active" : ""}" data-act="tt-day" data-day="${d}">
      ${DAYS[d].slice(0,3)}
    </button>`).join("");

  let listHtml = "";
  arr.forEach((s, p) => {
    if (!s && p !== LUNCH) return;
    const [st, en] = PERIODS[p];
    if (p === LUNCH){
      listHtml += `<div class="card lunch-card box">🍱 พักกลางวัน · ${st} - ${en} น.</div>`;
      return;
    }
    const isNow = (selectedTimetableDay === today && m >= toMin(st) && m < toMin(en));
    const isPast = (selectedTimetableDay === today && m >= toMin(en));
    const c = colorOf(s);
    
    listHtml += `
      <div class="tt-row box ${isNow ? "now" : ""} ${isPast ? "past" : ""}" style="--c:${c}">
        <div class="tt-time"><span>คาบ ${p+1}</span><small>${st}-${en}</small></div>
        <div class="tt-divider"></div>
        <div class="tt-detail">
          <b>${esc(label(s))}</b>
          <div class="muted small">${metaOf(s)}</div>
        </div>
        ${isNow ? `<span class="tag" style="--c:#ff9500">กำลังเรียน</span>` : ""}
      </div>`;
  });

  const curP = SCHEDULE[today] ? PERIODS.findIndex(([a, b]) => m >= toMin(a) && m < toMin(b)) : -1;
  const head = `<tr><th>วัน / คาบ</th>${PERIODS.map((p, i) => 
    `<th class="${today === selectedTimetableDay && i === curP ? "now-col" : ""}"><span class="px">${i+1}</span><small>${p[0]}-${p[1]}</small></th>`).join("")}</tr>`;
  
  const body = [1,2,3,4,5].map(d => `<tr class="${d === today ? "today" : ""}">
    <th class="day" style="--dc:${DAY_COLOR[d]}">${DAYS[d]}</th>
    ${SCHEDULE[d].map((s, p) => {
      if (p === LUNCH) return d === 1 ? `<td rowspan="5" class="lunch"><span>พักกลางวัน</span></td>` : "";
      if (!s) return `<td></td>`;
      return `<td class="cell" style="--c:${colorOf(s)}">
        <b>${esc(label(s))}</b>${s.teacher ? `<small>${esc(s.teacher)}</small>` : ""}${s.room ? `<small>📍${esc(s.room)}</small>` : ""}</td>`;
    }).join("")}</tr>`).join("");

  $("#page-timetable").innerHTML =
    pageHead("📅", "ตารางเรียน", `${ROOM} · ภาคเรียนที่ 2/2569`) +
    `<div class="mobile-tt-container">
       <div class="tt-days-bar">${dayBtns}</div>
       <div class="tt-list">${listHtml}</div>
     </div>
     <div class="desktop-tt-container">
       <div class="table-wrap pop"><table class="tt"><thead>${head}</thead><tbody>${body}</tbody></table></div>
     </div>
     <div class="legend pop">${Object.values(GROUPS).map(g => `<span style="--c:${g.color}">${g.name}</span>`).join("")}</div>`;
}

function renderQuests(){
  const list = qFilter === "todo" ? pending()
    : qFilter === "done" ? D.hw.filter(h => h.done)
    : [...D.hw].sort((a, b) => a.due.localeCompare(b.due));
  const segs = [["todo","ค้างอยู่"],["done","สำเร็จ"],["all","ทั้งหมด"]]
    .map(([k, t]) => `<button data-act="filter" data-f="${k}" class="${qFilter === k ? "active" : ""}">${t}</button>`).join("");
  $("#page-quests").innerHTML =
    pageHead("⚔️", "กระดานเควส", `ค้างอยู่ ${pending().length} · สำเร็จแล้ว ${D.done} เควส`) +
    `<div class="toolbar pop"><div class="seg">${segs}</div><span class="spacer"></span>
     <button class="btn primary sm" data-act="add-quest">+ เพิ่มเควสใหม่</button></div>` +
    (list.length ? list.map(questItem).join("")
      : empty(qFilter === "done" ? "📭" : "🎯", qFilter === "done" ? "ยังไม่มีเควสที่สำเร็จ" : "ไม่มีเควสค้าง กดปุ่มด้านบนเพื่อเพิ่ม"));
}

function itemsOn(ds){
  return [
    ...D.hw.filter(h => h.due === ds).map(h => ({ kind:"hw", id:h.id, title:h.title, short:h.teacher,
      color:"#5856d6", done:h.done, sub:`⚔️ เควส · ${h.teacher} · ${h.type}` })),
    ...D.events.filter(e => e.date === ds).map(e => ({ kind:"ev", id:e.id, title:e.title,
      short:`${EV[e.type].icon}${e.title}`, color:EV[e.type].color, sub:`${EV[e.type].icon} ${e.type}` })),
  ];
}

function renderCalendar(){
  const start = new Date(calY, calM, 1).getDay(), dim = new Date(calY, calM + 1, 0).getDate(), todayS = iso(new Date());
  let cells = "";
  for (let i = 0; i < start; i++) cells += `<div class="cal-cell blank"></div>`;
  for (let d = 1; d <= dim; d++){
    const ds = iso(new Date(calY, calM, d)), items = itemsOn(ds), wd = (start + d - 1) % 7;
    cells += `<button class="cal-cell ${ds === todayS ? "today" : ""} ${ds === selDate ? "sel" : ""} ${wd === 0 || wd === 6 ? "weekend" : ""}"
      data-act="date" data-date="${ds}"><span class="num">${d}</span><div class="dots">
      ${items.slice(0, 3).map(it => `<i style="--c:${it.color}">${esc(it.short)}</i>`).join("")}
      ${items.length > 3 ? `<i class="more">+${items.length - 3}</i>` : ""}</div></button>`;
  }
  const sel = itemsOn(selDate), selWd = new Date(selDate + "T00:00").getDay();
  const selLabel = new Date(selDate + "T00:00").toLocaleDateString("th-TH", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const classes = SCHEDULE[selWd] ? SCHEDULE[selWd].filter(Boolean).length : 0;
  $("#page-calendar").innerHTML =
    pageHead("🗓️", "ปฏิทิน", "กำหนดส่งเควสและกิจกรรมสำคัญ") +
    `<div class="cal-head pop">
      <h2>${new Date(calY, calM).toLocaleDateString("th-TH", { month:"long", year:"numeric" })}</h2>
      <button class="icon-btn" data-act="cal" data-d="-1">◀</button>
      <button class="btn sm" data-act="cal" data-d="0">วันนี้</button>
      <button class="icon-btn" data-act="cal" data-d="1">▶</button>
    </div>
    <div class="cal box pop" style="--i:1">
      <div class="cal-week">${["อา","จ","อ","พ","พฤ","ศ","ส"].map(w => `<span>${w}</span>`).join("")}</div>
      <div class="cal-grid">${cells}</div>
    </div>
    <div class="day-panel box pop" style="--i:2">
      <div class="panel-head"><div style="display:block"><b>${selLabel}</b>
        <div class="muted small">${classes ? `📚 มีเรียน ${classes} คาบ` : "🏖️ ไม่มีเรียน"}</div></div>
        <div><button class="btn sm" data-act="add-event" data-date="${selDate}">+ กิจกรรม</button>
        <button class="btn sm primary" data-act="add-quest" data-date="${selDate}">+ เควส</button></div></div>
      ${sel.length ? sel.map(it => `<div class="day-item ${it.done ? "done" : ""}" style="--c:${it.color}">
        <span class="sq"></span>
        <div class="t" ${it.kind === "hw" ? `data-act="edit" data-id="${it.id}"` : ""}><b>${esc(it.title)}</b><div class="muted small">${esc(it.sub)}</div></div>
        ${it.kind === "ev" ? `<button class="del" data-act="del-ev" data-id="${it.id}">✕</button>` : ""}</div>`).join("")
        : `<p class="muted" style="padding:10px 0">ยังไม่มีเควสหรือกิจกรรมในวันนี้ 😴</p>`}
    </div>`;
}

function renderAll(){ renderSide(); renderHome(); renderTimetable(); renderQuests(); renderCalendar(); }

function showPage(p){
  page = p;
  qsa(".page").forEach(s => s.classList.toggle("active", s.id === "page-" + p));
  qsa(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page === p));
  const el = $("#page-" + p);
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  scrollTo(0, 0);
}

// ===================== 5) Modal ฟอร์ม =====================
function fillTeachers(){
  const teachers = [...new Set(Object.values(SCHEDULE).flat().filter(s => s && s.teacher).map(s => s.teacher))].sort();
  $("#teacherSelect").innerHTML = teachers.map(t => `<option>${t}</option>`).join("") + `<option>คุณครูท่านอื่น</option>`;
  $("#eventType").innerHTML = Object.keys(EV).map(k => `<option>${k}</option>`).join("");
}

function openModal(kind){ const m = $("#modal"); m.dataset.form = kind; m.classList.add("open"); }
function closeModal(){ $("#modal").classList.remove("open"); }

function openQuest(h = null, date = null){
  editingId = h?.id || null;
  const f = $("#questForm").elements, tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  $("#questForm").reset();
  $("#qHead").textContent = h ? "✏️ EDIT QUEST" : "⚔️ NEW QUEST";
  f["title"].value = h?.title || "";
  f["teacher"].value = h?.teacher || f["teacher"].options[0].value;
  f["type"].value = h?.type || "การบ้าน";
  f["due"].value = h?.due || date || iso(tmr);
  f["diff"].value = h?.diff || "normal";
  f["note"].value = h?.note || "";
  openModal("quest");
}

function openEvent(date){
  $("#eventForm").reset();
  $("#eventForm").elements["date"].value = date || iso(new Date());
  openModal("event");
}

$("#questForm").onsubmit = e => {
  e.preventDefault();
  const f = e.target.elements;
  const data = { title:f["title"].value.trim(), teacher:f["teacher"].value, type:f["type"].value,
                 due:f["due"].value, diff:f["diff"].value, note:f["note"].value.trim() };
  if (!data.title) return;
  if (editingId) Object.assign(D.hw.find(x => x.id === editingId), data);
  else D.hw.push({ id:uid(), done:false, ...data });
  closeModal(); sfx(); toast(editingId ? "✏️ แก้ไขเควสแล้ว" : "⚔️ รับเควสใหม่เรียบร้อย!");
  commit();
};

$("#eventForm").onsubmit = e => {
  e.preventDefault();
  const f = e.target.elements;
  D.events.push({ id:uid(), title:f["title"].value.trim(), type:f["type"].value, date:f["date"].value });
  selDate = f["date"].value;
  closeModal(); sfx(); toast("🗓️ เพิ่มกิจกรรมสำเร็จ");
  commit();
};

// ===================== 6) Event Listeners =====================
document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id || t.closest("[data-id]")?.dataset.id;
  const h = D?.hw.find(x => x.id === id);
  switch (act){
    case "page":      sfx(); showPage(t.dataset.page); break;
    case "theme":     toggleTheme(); break;
    case "logout":    if (confirm("ต้องการออกจากระบบใช่ไหม?")) logout(); break;
    case "add-quest": openQuest(null, t.dataset.date); break;
    case "add-event": openEvent(t.dataset.date); break;
    case "close":     closeModal(); break;
    case "filter":    qFilter = t.dataset.f; sfx(); renderQuests(); break;
    case "toggle":    toggleQuest(h, t); break;
    case "edit":      if (h) openQuest(h); break;
    case "sync-cal":  if (h) syncToGoogleCalendar(h.title, h.due, `ครูผู้สอน: ${h.teacher} (${h.type}) - ${h.note || ""}`); break;
    case "tt-day":    selectedTimetableDay = +t.dataset.day; sfx(); renderTimetable(); break;
    case "del":       if (confirm("ลบเควสนี้ใช่ไหม?")){ D.hw = D.hw.filter(x => x.id !== id); commit(); } break;
    case "del-ev":    D.events = D.events.filter(x => x.id !== id); commit(); break;
    case "date":      selDate = t.dataset.date; sfx(); renderCalendar(); break;
    case "cal": {
      const d = +t.dataset.d;
      if (d === 0){ const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); selDate = iso(n); }
      else { const n = new Date(calY, calM + d, 1); calY = n.getFullYear(); calM = n.getMonth(); }
      sfx(); renderCalendar(); break;
    }
  }
});

function toggleTheme(){
  const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  localStorage.setItem("ms_theme", t);
  sfx();
}

// ===================== 7) Init =====================
document.documentElement.dataset.theme = localStorage.getItem("ms_theme")
  || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const n0 = new Date(); calY = n0.getFullYear(); calM = n0.getMonth();
fillTeachers();
const session = localStorage.getItem("ms_session");
if (session) {
  startApp(session);
} else {
  showAuth();
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
