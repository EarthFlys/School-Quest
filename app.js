// ===================== 0) ตั้งค่า SUPABASE & หัวหน้าห้อง =====================
const SUPABASE_URL = "https://dmiunmotmbnsswspnzjt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaXVubW90bWJuc3N3c3Buemp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjY0MDMsImV4cCI6MjA5MjcwMjQwM30.euitW1by8xkBnH3YtTOf2v6gWazVJLebyPDXF_COOYM"; // (ใช้คีย์ของคุณตัวเดิมได้เลยครับ)

// 👑 ตั้งค่ารายชื่อบัญชีหัวหน้าห้อง (เพิ่มชื่อและรหัสผ่านได้หลายคน)
const LEADERS = {
  "gun": "gunzaza",
  "earthflyszx_": "earthzaza",
  "อีกคนก็ได้": "รหัสลับของเขา"
};

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

// ===================== 1) ตารางเรียน ม.6/12 =====================
const PERIODS = [
  ["08:40","09:30"],["09:30","10:20"],["10:20","11:10"],["11:10","12:00"],["12:00","12:50"],
  ["12:50","13:40"],["13:40","14:30"],["14:30","15:20"],["15:20","16:10"],["16:10","17:00"]
];
const LUNCH = 4;
const S = (code, teacher, room) => ({ code, teacher, room });
const A = (name, room = "") => ({ name, room, activity: true });

const SCHEDULE = {
  1: [S("ว33202","ครูถนอมศักดิ์","127"), S("ว33202","ครูถนอมศักดิ์","127"), S("ค33202","ครูประยูร","621"),
      S("พ33202","ครูอนุชิต","สนามลีลาศ"), null, S("ค33102","ครูฉัชวา","622"), S("ท33102","ครูสุกัญญา","328"),
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
  5: [S("ก33902","ครูสุพรรณี","217"), S("ส33102","ครูอานนท์","538"), S("ค33102","ครูฉัชวา","622"),
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
  "หัวหน้าห้องประกาศงานใหม่แล้วจ้า เช็กกันด้วยเด้อ!", "อย่าลืมเช็คงานนะงับเพื่อนๆ จุ้บๆ",
  "ตามงานด้วยเด้อ", "งานก็เหมือนเงิน ไม่มี", "หัวหน้าห้องลั่นจัด"
];
const EV = { "สอบ":{icon:"📝",color:"#ef4444"}, "กิจกรรม":{icon:"🎪",color:"#a855f7"}, "วันหยุด":{icon:"🏖️",color:"#22c55e"}, "อื่นๆ":{icon:"📌",color:"#64748b"} };
const levelOf = xp => Math.floor(xp / 100) + 1;
const rank = lv => Math.min(Math.floor((lv - 1) / 2), PETS.length - 1);
const BADGES = [
  { id:"first", icon:"🗡️", name:"เควสแรก", desc:"ทำเควสสำเร็จ 1 ครั้ง", test:d => d.done >= 1 },
  { id:"five", icon:"🛡️", name:"นักล่าเควส", desc:"สำเร็จ 5 เควส", test:d => d.done >= 5 },
  { id:"twenty", icon:"👑", name:"ราชาการบ้าน", desc:"สำเร็จ 20 เควส", test:d => d.done >= 20 },
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
const enc = encodeURIComponent;
const isLeaderName = u => Object.prototype.hasOwnProperty.call(LEADERS, u);
const normRoom = r => (r || "").replace(/\s+/g, "") || "ม.6/12";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function toast(msg, ms = 2200){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms);
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

// ===================== 3) จัดการผู้ใช้ & ข้อมูลห้องเรียน =====================
const newData = () => ({ hw:[], xp:0, coins:0, streak:0, lastDay:"", done:0, badges:[], avatar:"🐱", room:"ม.6/12", role:"student" });

let user = null, NAME = "", ROOM = "ม.6/12", ROLE = "student", AVATAR = "🐱", D = null;
let actsErr = "";
let sharedQuests = [], classActivities = [], members = [], membersErr = "", openQuests = new Set();
let books = [], bookErr = "", bookSubject = "all", bookSearch = "", bookCover = null;
let page = "home", qFilter = "todo", qSearch = "", saving = false;
let calY, calM, selDate = iso(new Date());
let selectedTimetableDay = Math.min(Math.max(new Date().getDay(), 1), 5);

function errInfo(err){
  let o = {}; try { o = JSON.parse(err.message); } catch {}
  return { code: o.code || "", msg: o.message || String(err.message || err), details: o.details || "" };
}
function friendlyErr(err, table){
  const e = errInfo(err), m = (e.msg + " " + e.details).toLowerCase();
  if (e.code === "42501" || m.includes("row-level security")) return `Supabase ไม่อนุญาตให้เขียนตาราง ${table} (RLS) · รัน schema.sql`;
  if (e.code === "42P01" || e.code === "PGRST205" || m.includes("does not exist") && m.includes("relation")) return `ยังไม่มีตาราง ${table} · รัน schema.sql`;
  if (!navigator.onLine || /failed to fetch|networkerror/i.test(e.msg)) return "ไม่มีอินเทอร์เน็ต ลองใหม่อีกครั้ง";
  return e.msg.slice(0, 110);
}

async function loadClassData(){
  const r = enc(ROOM);
  const [q, a] = await Promise.allSettled([
    sb(`shared_quests?room=eq.${r}&select=*`),
    sb(`class_activities?room_target=eq.${r}&select=*`)
  ]);
  if (q.status === "fulfilled") sharedQuests = q.value || [];
  else console.error("โหลดเควสไม่สำเร็จ:", q.reason);
  if (a.status === "fulfilled"){ classActivities = a.value || []; actsErr = ""; }
  else { actsErr = friendlyErr(a.reason, "class_activities"); console.error("โหลดกิจกรรมไม่สำเร็จ:", a.reason); }
  try {
    const all = await sb("users?select=username,name,room,data");
    members = (all || []).filter(m => normRoom(m.room) === ROOM)
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "th"));
    membersErr = "";
  } catch (err) {
    console.error("โหลดรายชื่อสมาชิกไม่สำเร็จ:", err);
    membersErr = String(err.message || err).slice(0, 140);
  }
}

async function persist(){
  if (!user) return false;
  try {
    await sb(`users?username=eq.${enc(user)}`, "PATCH", { data: D, role: ROLE });
    return true;
  } catch (err) {
    console.error("ซิงค์ข้อมูลไม่สำเร็จ:", err);
    toast("⚠️ บันทึกไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วลองใหม่");
    return false;
  }
}
async function commit(){ await persist(); await loadClassData(); await loadBooks(); renderAll(); }

const isQuestDone = id => D.hw.some(h => h.id === id && h.done);
const memberDone = (m, id) => m.username === user ? isQuestDone(id)
  : (m.data?.hw || []).some(h => h.id === id && h.done);

// เขียน HTML เฉพาะเมื่อเนื้อหาเปลี่ยน และไม่เล่นแอนิเมชันซ้ำตอนรีเฟรชเงียบๆ
function put(id, html){
  const el = $("#page-" + id);
  if (el._h === html) return;
  el.classList.toggle("quiet", !!el._h && el.classList.contains("active"));
  el.innerHTML = html; el._h = html;
}
const PUT = new Proxy({}, { set(_, id, html){ put(id, html); return true; } });
const pendingShared = () => sharedQuests.filter(q => !isQuestDone(q.id)).sort((a,b) => a.due.localeCompare(b.due));

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
  const username = f["username"].value.trim().toLowerCase(), pw = f["password"].value.trim();
  const fail = msg => { $("#authMsg").textContent = msg; box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); };
  
  try {
    let assignedRole = "student";
    if (isLeaderName(username)) {
      if (pw !== LEADERS[username]) return fail("รหัสผ่านหัวหน้าห้องไม่ถูกต้อง!");
      assignedRole = "leader";
    }

    if (authMode === "register"){
      const name = f["name"].value.trim(), room = normRoom(f["room"].value);
      if (!name) return fail("กรุณาใส่ชื่อที่ให้เรียก");
      
      const check = await sb(`users?username=eq.${enc(username)}&select=username`);
      if (check && check.length > 0) return fail("ชื่อผู้ใช้นี้มีคนใช้แล้ว");

      const salt = uid(), dat = newData();
      dat.avatar = selectedAvatar; dat.room = room; dat.role = assignedRole;
      const hashed = await hash(pw, salt);

      await sb("users", "POST", { username, name, room, role: assignedRole, salt, hash: hashed, data: dat });
    } else {
      const res = await sb(`users?username=eq.${enc(username)}&select=*`);
      if (!res || res.length === 0) return fail("ไม่พบชื่อผู้ใช้นี้");
      const u = res[0];
      let hashed = await hash(pw, u.salt);
      if (hashed !== u.hash){
        // หัวหน้าที่รหัสตรงกับ LEADERS แต่แฮชในฐานข้อมูลเก่า/ไม่ตรง → ซ่อมให้อัตโนมัติ
        if (isLeaderName(username) && pw === LEADERS[username]){
          const salt = uid();
          await sb(`users?username=eq.${enc(username)}`, "PATCH", { salt, hash: await hash(pw, salt) });
        } else return fail("รหัสผ่านไม่ถูกต้อง");
      }

      if (isLeaderName(username) && u.role !== "leader") {
        assignedRole = "leader";
        await sb(`users?username=eq.${enc(username)}`, "PATCH", { role: "leader" });
      } else {
        assignedRole = u.role || "student";
      }
    }
    localStorage.setItem("ms_session", username);
    e.target.reset(); sfx("level");
    startApp(username);
  } catch (err) {
    fail("เชื่อมต่อฐานข้อมูลไม่สำเร็จ กรุณาเช็กเน็ต");
    console.error(err);
  }
};

async function startApp(username){
  try {
    const res = await sb(`users?username=eq.${enc(username)}&select=*`);
    if (!res || res.length === 0) return showAuth();
    const u = res[0];
    user = u.username; NAME = u.name; ROOM = normRoom(u.room); ROLE = u.role || "student";
    
    if (isLeaderName(username)) ROLE = "leader";

    D = Object.assign(newData(), u.data);
    AVATAR = D.avatar || "🐱";
    
    await loadClassData(); await loadBooks();
    $("#auth").classList.add("hidden"); $("#app").classList.remove("hidden");
    dailyCheck(); renderAll(); showPage("home"); maybeNotify(); enablePush(true);
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

function toggleSharedQuest(qId, btn){
  if (!qId) return;
  let h = D.hw.find(x => x.id === qId);
  if (!h){ h = { id: qId, done: false }; D.hw.push(h); }
  h.done = !h.done;
  const sq = sharedQuests.find(x => x.id === qId);
  if (h.done && !h.rewarded){
    h.rewarded = true;               // ได้รางวัลครั้งเดียวต่อเควส กันกดสลับฟาร์ม XP
    const dif = DIFF[sq?.diff || "normal"];
    D.done++; D.coins += 5;
    const r = btn.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    sfx("coin"); navigator.vibrate?.(20);
    toast(`🎉 ทำเควสสำเร็จ! +${dif.xp} XP · +5 🪙`);
    gainXP(dif.xp);
  } else {
    toast(h.done ? "✔ ทำเครื่องหมายสำเร็จแล้ว" : "↩️ ยกเลิกการติ๊กแล้ว");
  }
  checkBadges();
  persist();
  const hides = h.done ? (page === "home" || (page === "quests" && qFilter === "todo"))
                       : (page === "quests" && qFilter === "done");
  if (hides){ btn.closest(".quest")?.classList.add("leaving"); setTimeout(renderAll, 380); }
  else renderAll();
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

function dueInfo(due, done){
  if (done) return ["", "✔ สำเร็จ"];
  const d = daysLeft(due);
  if (d < 0) return ["late", `เลยกำหนด ${-d} วัน`];
  if (d === 0) return ["soon", "ส่งวันนี้!"];
  if (d === 1) return ["soon", "ส่งพรุ่งนี้"];
  return ["", `อีก ${d} วัน`];
}

const memberChip = m => `<span class="chip">${esc(m.data?.avatar || "🙂")} ${esc(m.name || m.username)}</span>`;

function progressBox(q){
  if (ROLE !== "leader") return "";
  if (membersErr) return `<div class="progress"><b>👥 โหลดรายชื่อสมาชิกไม่ได้</b>
    <div class="muted small">ตรวจสิทธิ์อ่านตาราง users ใน Supabase (RLS) · ${esc(membersErr)}</div></div>`;
  if (!members.length) return `<div class="progress"><b>👥 ยังไม่พบสมาชิกในห้อง ${esc(ROOM)}</b></div>`;
  const dn = members.filter(m => memberDone(m, q.id)), pd = members.filter(m => !memberDone(m, q.id));
  const pct = Math.round(dn.length / members.length * 100), open = openQuests.has(q.id);
  return `<div class="progress ${open ? "open" : ""}">
    <div class="progress-top"><b>👥 ทำเสร็จแล้ว ${dn.length}/${members.length} คน (${pct}%)</b>
      <span class="pt-btns"><button type="button" class="btn sm" data-act="copy-pending" data-id="${q.id}">📋 ยังไม่ส่ง</button>
      <button type="button" class="btn sm" data-act="who" data-id="${q.id}">${open ? "ซ่อนรายชื่อ" : "ดูรายชื่อ"}</button></span></div>
    <div class="xpbar thin"><div style="width:${pct}%"></div></div>
    <div class="who">
      <div class="ok"><h4>✅ เสร็จแล้ว (${dn.length})</h4>${dn.map(memberChip).join("") || `<small class="muted">ยังไม่มีใครส่ง</small>`}</div>
      <div><h4>⏳ ยังไม่เสร็จ (${pd.length})</h4>${pd.map(memberChip).join("") || `<small class="muted">เสร็จครบทุกคนแล้ว 🎉</small>`}</div>
    </div></div>`;
}

function sharedQuestItem(q, i = 0){
  const done = isQuestDone(q.id);
  const [cls, txt] = dueInfo(q.due, done), dif = DIFF[q.diff || "normal"];
  return `<div class="quest box pop ${done ? "done" : ""}" data-id="${q.id}" data-q="${esc((q.title + " " + q.teacher + " " + q.type + " " + (q.note || "")).toLowerCase())}" style="--c:#5856d6;--i:${i}">
    <button class="check" data-act="toggle-shared" data-id="${q.id}" aria-label="ทำเสร็จแล้ว">${done ? "✔" : ""}</button>
    <div class="q-info">
      <div class="q-title">${esc(q.title)}</div>
      ${q.note ? `<div class="muted small">${esc(q.note)}</div>` : ""}
      <div class="tags"><span class="tag">👨‍🏫 ${esc(q.teacher)}</span>
        <span class="tag gray">${esc(q.type)}</span>
        <span class="tag ${cls}">📅 ${fmtShort(q.due)} · ${txt}</span>
        <span class="tag" style="--c:#f59e0b">👑 หัวหน้าสั่ง</span></div>
      ${progressBox(q)}
    </div>
    <div class="quest-actions">
      <button class="btn sm" data-act="sync-cal" data-title="${esc(q.title)}" data-due="${q.due}" data-note="${esc(q.note || '')}" title="ซิงค์ไป Google Calendar">🗓️ ซิงค์</button>
      <div class="reward">+${dif.xp}XP</div>
      ${ROLE === 'leader' ? `<button class="del" data-act="edit-shared" data-id="${q.id}" title="แก้ไขเควส">✏️</button><button class="del" data-act="del-shared" data-id="${q.id}" title="ลบเควส">✕</button>` : ""}
    </div></div>`;
}

function urgentBar(){
  const p = pendingShared(), late = p.filter(q => daysLeft(q.due) < 0),
    td = p.filter(q => daysLeft(q.due) === 0), tm = p.filter(q => daysLeft(q.due) === 1);
  if (!late.length && !td.length && !tm.length) return "";
  const parts = [late.length && `🔴 เลยกำหนด ${late.length}`, td.length && `🟠 ส่งวันนี้ ${td.length}`, tm.length && `🟡 ส่งพรุ่งนี้ ${tm.length}`].filter(Boolean).join(" · ");
  const names = [...late, ...td, ...tm].slice(0, 3).map(q => esc(q.title)).join(" · ");
  return `<div class="alert box pop"><span class="c-icon">⏰</span><div><b>${parts}</b><div class="muted">${names}</div></div></div>`;
}

function leaderboardHtml(){
  const rows = members.map(m => m.username === user ? { ...m, data: D } : m);
  if (!rows.some(m => m.username === user)) rows.push({ username: user, name: NAME, data: D });
  if (rows.length < 2) return "";
  rows.sort((a, b) => (b.data?.xp || 0) - (a.data?.xp || 0));
  const medal = ["🥇", "🥈", "🥉"];
  const row = (m, i) => `<div class="lb-row box ${m.username === user ? "me" : ""}"><span class="lb-rank">${medal[i] || i + 1}</span>
    <span class="lb-av">${esc(m.data?.avatar || "🙂")}</span><b>${esc(m.name || m.username)}${isLeaderName(m.username) ? " 👑" : ""}</b>
    <small class="muted">LV.${levelOf(m.data?.xp || 0)} · ${m.data?.xp || 0} XP</small></div>`;
  const myI = rows.findIndex(m => m.username === user);
  return `<h3 class="h3">🏅 อันดับห้อง ${esc(ROOM)}</h3><div class="lb">${rows.slice(0, 5).map(row).join("")}${myI >= 5 ? `<div class="lb-gap">⋯</div>${row(rows[myI], myI)}` : ""}</div>`;
}

async function copyText(t){
  try { await navigator.clipboard.writeText(t); }
  catch {
    const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch {} ta.remove();
  }
  toast("📋 คัดลอกแล้ว วางในไลน์ได้เลย");
}
function summaryText(){
  const list = sharedQuests.filter(q => daysLeft(q.due) >= 0).sort((a, b) => a.due.localeCompare(b.due));
  if (!list.length) return `✅ ห้อง ${ROOM} ไม่มีงานค้างตอนนี้`;
  return `📚 งานห้อง ${ROOM} (อัปเดต ${fmtShort(iso(new Date()))})\n` +
    list.map((q, i) => `${i + 1}) ${q.title} (${q.teacher}) · ส่ง ${fmtShort(q.due)} ${dueInfo(q.due, false)[1]}`).join("\n");
}
function applySearch(){
  qsa("#page-quests .quest").forEach(c => c.classList.toggle("hidden", !!qSearch && !(c.dataset.q || "").includes(qSearch)));
}
const actEnd = a => (a.end_date && a.end_date > a.date) ? a.end_date : a.date;
const actRange = a => actEnd(a) !== a.date ? `${fmtShort(a.date)} – ${fmtShort(a.end_date)}` : fmtShort(a.date);
const actWhen = a => {
  const st = daysLeft(a.date), en = daysLeft(actEnd(a));
  if (en < 0) return "ผ่านไปแล้ว";
  if (st > 0) return st === 1 ? "เริ่มพรุ่งนี้" : `เริ่มอีก ${st} วัน`;
  if (en === 0) return st === 0 ? "วันนี้!" : "วันสุดท้าย!";
  return `กำลังจัดอยู่ · เหลือ ${en} วัน`;
};

async function enableNotify(){
  if (!("Notification" in window)) return toast("เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน");
  const p = await Notification.requestPermission();
  if (p === "granted"){ localStorage.setItem("ms_notify", "1"); toast("🔔 เปิดแจ้งเตือนงานใกล้ส่งแล้ว"); maybeNotify(true); }
  else toast("ไม่ได้รับอนุญาตให้แจ้งเตือน");
}
const VAPID_PUBLIC = "BAuGLyLBmMwlmJQM2bimUX8Q4ocCYg1Qm1FePQRrJB-GAukPzOyurc5qmrFFTK8phZ_MJHOR6oVK___pdt8QRpw";
const b64u = v => { const r = atob((v + "=".repeat((4 - v.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(r, c => c.charCodeAt(0)); };
async function enablePush(silent = false){
  const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (silent && (!ok || Notification.permission !== "granted" || !localStorage.getItem("ms_push"))) return;
  if (!ok) return toast("เครื่องนี้ยังไม่รองรับ · iPhone ต้องกด แชร์ → เพิ่มลงหน้าจอโฮม แล้วเปิดจากไอคอน", 6000);
  if (!/^B[\w-]{60,}$/.test(VAPID_PUBLIC)) return toast("ยังไม่ได้ใส่ VAPID_PUBLIC ใน app.js", 4000);
  try {
    if (!silent && await Notification.requestPermission() !== "granted") return toast("ไม่ได้รับอนุญาตให้แจ้งเตือน");
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID_PUBLIC) });
    const j = sub.toJSON();
    await sb("push_subscriptions", "POST", { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, username: user, room: ROOM });
    localStorage.setItem("ms_push", "1");
    if (!silent) toast("🔔 เปิดแจ้งเตือนเข้าโทรศัพท์แล้ว · จะเตือนทุกเช้า");
  } catch (err) { console.error(err); if (!silent) toast("⚠️ เปิดแจ้งเตือนไม่สำเร็จ: " + friendlyErr(err, "push_subscriptions"), 5000); }
}
function maybeNotify(force){
  try {
    if (!("Notification" in window) || Notification.permission !== "granted" || !localStorage.getItem("ms_notify")) return;
    const today = iso(new Date());
    if (!force && localStorage.getItem("ms_notified") === today) return;
    const u = pendingShared().filter(q => daysLeft(q.due) <= 1);
    if (!u.length) return;
    localStorage.setItem("ms_notified", today);
    new Notification("School Quest ⏰", { body: `มี ${u.length} งานใกล้ส่ง: ${u.slice(0, 3).map(q => q.title).join(", ")}`, icon: "icon-192.png" });
  } catch {}
}

function nowCard(){
  const d = new Date().getDay(), arr = SCHEDULE[d], m = nowMin();
  if (!arr) return callout("🏖️", "วันนี้วันหยุด!", "พักผ่อนให้เต็มที่ แล้วค่อยมาลุยเควสห้องเรียน");
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
  return callout("🎉", "เลิกเรียนแล้ว!", "ได้เวลาไปเคลียร์เควสห้องเรียนกันแล้ว");
}

function renderSide(){
  const lv = levelOf(D.xp);
  $("#avatarDisplay").textContent = AVATAR;
  $("#sideName").textContent = NAME + (ROLE === 'leader' ? ' 👑' : '');
  $("#sideRoom").textContent = ROOM;
  $("#badge").textContent = pendingShared().length || "";
}

function upcomingActs(){
  const l = classActivities.filter(a => daysLeft(actEnd(a)) >= 0 && daysLeft(a.date) <= 7)
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  if (!l.length) return "";
  return `<h3 class="h3">🎪 กิจกรรมห้องที่กำลังมา</h3>` + l.map(a => callout("🎪", a.title, `${actRange(a)} · ${actWhen(a)}${a.assignee ? " · 👤 " + a.assignee : ""}`)).join("");
}

function renderHome(){
  const lv = levelOf(D.xp), prog = D.xp % 100, hr = new Date().getHours();
  const greet = hr < 12 ? "อรุณสวัสดิ์" : hr < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
  const randomQuote = QUOTES[Math.floor(Math.abs(Math.sin(D.xp + D.coins)) * QUOTES.length)];
  const pend = pendingShared();
  
  PUT.home =
    pageHead("👋", `${greet}, ${esc(NAME)}!`, `💬 "${randomQuote}"`,
      `<button class="icon-btn" data-act="notify" title="เปิดแจ้งเตือนงานใกล้ส่ง">🔔</button>
       <button class="icon-btn" data-act="theme" title="สลับโหมด">🌓</button>
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
    urgentBar() +
    nowCard() +
    `<h3 class="h3">⚔️ เควสห้องเรียนที่ต้องเคลียร์</h3>` +
    (pend.length ? pend.slice(0, 3).map(sharedQuestItem).join("") : empty("✨", "ไม่มีเควสค้าง เยี่ยมมาก!")) +
    (pend.length > 3 ? `<button class="btn sm more-btn" data-act="page" data-page="quests">ดูเควสทั้งหมด (${pend.length}) ▶</button>` : "") +
    upcomingActs() +
    leaderboardHtml() +
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

  PUT.timetable =
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
  const list = qFilter === "todo" ? pendingShared()
    : qFilter === "done" ? sharedQuests.filter(q => isQuestDone(q.id))
    : [...sharedQuests].sort((a, b) => a.due.localeCompare(b.due));
  
  const segs = [["todo","ค้างอยู่"],["done","สำเร็จแล้ว"],["all","ทั้งหมด"]]
    .map(([k, t]) => `<button data-act="filter" data-f="${k}" class="${qFilter === k ? "active" : ""}">${t}</button>`).join("");
  
  PUT.quests =
    pageHead("⚔️", "เควสห้องเรียน", `สมาชิกห้อง ${ROOM} เห็นงานชุดเดียวกันทั้งหมด`) +
    `<div class="toolbar pop"><div class="seg">${segs}</div>
     <input class="search" data-search placeholder="🔍 ค้นหางาน / ครู" value="${esc(qSearch)}"><span class="spacer"></span>
     ${ROLE === 'leader' ? `<button class="btn sm" data-act="copy-summary">📋 คัดลอกสรุปงาน</button><button class="btn primary sm" data-act="open-quest-modal">+ มอบหมายเควสให้ห้อง</button>` : `<small class="muted">👑 เฉพาะหัวหน้าห้องที่กำหนด</small>`}</div>` +
    (list.length ? list.map(sharedQuestItem).join("")
      : empty(qFilter === "done" ? "📭" : "🎯", "ไม่มีเควสในหมวดหมู่นี้ เยี่ยมมาก!"));
  applySearch();
}

function renderActivities(){
  PUT.activities =
    pageHead("🎪", "กิจกรรมห้องเรียน", `บอร์ดประกาศกิจกรรมและงานกลุ่มของห้อง ${ROOM}`) +
    `<div class="toolbar pop"><span class="spacer"></span>
     ${ROLE === 'leader' ? `<button class="btn primary sm" data-act="open-act-modal">+ เพิ่มกิจกรรมใหม่</button>` : ``}</div>` +
    (actsErr ? `<div class="alert box pop"><span class="c-icon">⚠️</span><div><b>โหลดกิจกรรมไม่ได้</b><div class="muted small">${esc(actsErr)}</div></div></div>` : "") +
    (!actsErr && classActivities.length ? [...classActivities].sort((a, b) => (daysLeft(actEnd(a)) < 0) - (daysLeft(actEnd(b)) < 0) || a.date.localeCompare(b.date)).map((a, i) => `
      <div class="quest box pop ${daysLeft(actEnd(a)) < 0 ? "past" : ""}" style="--c:#f59e0b;--i:${i}">
        <div class="q-info">
          <div class="q-title">${esc(a.title)}</div>
          ${a.description ? `<div class="muted small">${esc(a.description)}</div>` : ""}
          <div class="tags">
            <span class="tag">📅 ${actRange(a)} · ${actWhen(a)}</span>
            ${a.assignee ? `<span class="tag gray">👤 ${esc(a.assignee)}</span>` : ""}
          </div>
        </div>
        ${ROLE === 'leader' ? `<button class="del" data-act="edit-act" data-id="${esc(a.id)}" title="แก้ไข">✏️</button><button class="del" data-act="del-act" data-id="${esc(a.id)}" title="ลบ">✕</button>` : ""}
      </div>`).join("") : actsErr ? "" : empty("🎪", "ยังไม่มีประกาศกิจกรรมในห้องตอนนี้"));
}

function itemsOn(ds){
  return [
    ...sharedQuests.filter(q => q.due === ds).map(q => ({ kind:"shared", id:q.id, title:q.title, short:q.teacher,
      color:"#5856d6", done:isQuestDone(q.id), sub:`⚔️ เควสห้อง · ${q.teacher}` })),
    ...classActivities.filter(a => a.date <= ds && ds <= actEnd(a)).map(a => ({ kind:"act", id:a.id, title:a.title,
      short:`🎪${a.title}`, color:"#f59e0b", sub:`🎪 กิจกรรมห้อง` }))
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
  PUT.calendar =
    pageHead("🗓️", "ปฏิทินห้อง", `กำหนดการและกิจกรรมทั้งหมดของ ${ROOM}`) +
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
        <div class="muted small">${classes ? `📚 มีเรียน ${classes} คาบ` : "🏖️ ไม่มีเรียน"}</div></div></div>
      ${sel.length ? sel.map(it => `<div class="day-item ${it.done ? "done" : ""}" style="--c:${it.color}">
        <span class="sq"></span>
        <div class="t"><b>${esc(it.title)}</b><div class="muted small">${esc(it.sub)}</div></div></div>`).join("")
        : `<p class="muted" style="padding:10px 0">ไม่มีกำหนดการในวันนี้ 😴</p>`}
    </div>`;
}

// ===================== มุมหนังสือ =====================
async function loadBooks(){
  try { books = (await sb(`class_books?room=eq.${enc(ROOM)}&select=*`)) || []; bookErr = ""; }
  catch (err) { books = []; bookErr = String(err.message || err).slice(0, 160); console.error("โหลดหนังสือไม่สำเร็จ:", err); }
}
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "#";
// ดึงปกอัตโนมัติจากไฟล์ Google Drive ที่แชร์เป็น "ทุกคนที่มีลิงก์"
function driveThumb(u){
  if (!u || /\/folders\//.test(u)) return "";
  const m = u.match(/\/d\/([\w-]{15,})/) || u.match(/[?&]id=([\w-]{15,})/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w480` : "";
}
const hueOf = t => [...String(t)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

function fileToCover(file){
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const W = 270, H = 360, c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"), r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r;
      x.fillStyle = "#fff"; x.fillRect(0, 0, W, H); x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("อ่านรูปไม่ได้")); };
    img.src = url;
  });
}
function setCoverPreview(src){
  const p = $("#coverPrev");
  p.style.backgroundImage = src ? `url("${src}")` : ""; p.textContent = src ? "" : "📘";
}
function applyBookSearch(){
  qsa("#page-books .book").forEach(c => c.classList.toggle("hidden", !!bookSearch && !(c.dataset.q || "").includes(bookSearch)));
}

function renderBooks(){
  const subjects = [...new Set(books.map(b => b.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
  if (bookSubject !== "all" && !subjects.includes(bookSubject)) bookSubject = "all";
  const chips = ["all", ...subjects].map(s => `<button type="button" data-act="book-subject" data-s="${esc(s)}" class="${bookSubject === s ? "active" : ""}">${s === "all" ? "ทั้งหมด" : esc(s)}</button>`).join("");
  const list = books.filter(b => bookSubject === "all" || b.subject === bookSubject)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  const cards = list.map((b, i) => {
    const src = b.cover || driveThumb(b.url), isNew = b.created_at && Date.now() - new Date(b.created_at) < 7 * 864e5;
    return `<article class="book box pop" data-id="${esc(b.id)}" data-q="${esc((b.title + " " + (b.subject || "") + " " + (b.author || "") + " " + (b.description || "")).toLowerCase())}" style="--i:${Math.min(i, 10)}">
      <div class="book-cover" style="--h:${hueOf(b.title)}">
        <span class="bc-title">${esc(b.title)}</span>
        ${src ? `<img class="book-img" loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(src)}">` : ""}
        ${isNew ? `<span class="new-badge">NEW</span>` : ""}
      </div>
      <div class="book-info">
        <b class="book-title">${esc(b.title)}</b>
        <div class="tags">${b.subject ? `<span class="tag">${esc(b.subject)}</span>` : ""}${b.author ? `<span class="tag gray">✍️ ${esc(b.author)}</span>` : ""}</div>
        ${b.description ? `<div class="muted small book-desc">${esc(b.description)}</div>` : ""}
        <div class="book-actions">
          <a class="btn primary sm" href="${esc(safeUrl(b.url))}" target="_blank" rel="noopener noreferrer">📖 เปิดอ่าน</a>
          ${ROLE === "leader" ? `<button class="del" data-act="edit-book" data-id="${esc(b.id)}" title="แก้ไข">✏️</button><button class="del" data-act="del-book" data-id="${esc(b.id)}" title="ลบ">✕</button>` : ""}
        </div>
      </div></article>`;
  }).join("");
  PUT.books =
    pageHead("📚", "มุมหนังสือ", `หนังสือและเอกสารประกอบการเรียนของห้อง ${esc(ROOM)} · ${books.length} เล่ม · เก็บไว้ใน Google Drive`) +
    `<div class="toolbar pop"><div class="chips">${chips}</div>
      <input class="search" data-bsearch placeholder="🔍 ค้นหาหนังสือ" value="${esc(bookSearch)}"><span class="spacer"></span>
      ${ROLE === "leader" ? `<button class="btn primary sm" data-act="open-book-modal">+ เพิ่มหนังสือ</button>` : ""}</div>` +
    (bookErr ? `<div class="alert box pop"><span class="c-icon">⚠️</span><div><b>โหลดมุมหนังสือไม่ได้</b>
        <div class="muted small">ยังไม่ได้สร้างตาราง class_books? ให้รันไฟล์ schema.sql ใน Supabase · ${esc(bookErr)}</div></div></div>`
      : list.length ? `<div class="book-grid">${cards}</div>`
      : empty("📚", ROLE === "leader" ? "ยังไม่มีหนังสือ กด “+ เพิ่มหนังสือ” เพื่อแปะลิงก์จาก Google Drive" : "ยังไม่มีหนังสือในมุมนี้ รอหัวหน้าห้องมาเพิ่มนะ"));
  applyBookSearch();
}

const seenText = ds => {
  if (!ds) return ["off", "ยังไม่เคยเข้า"];
  const d = -daysLeft(ds);
  return d <= 0 ? ["on", "เข้าวันนี้"] : d === 1 ? ["", "เมื่อวาน"] : ["", `${d} วันก่อน`];
};

function renderMembers(){
  const rows = members.map(m => m.username === user ? { ...m, data: D, name: NAME } : m);
  if (!rows.some(m => m.username === user)) rows.push({ username: user, name: NAME, data: D });
  rows.sort((a, b) => (b.data?.lastDay || "").localeCompare(a.data?.lastDay || "") || (a.name || "").localeCompare(b.name || "", "th"));
  const today = iso(new Date()), onToday = rows.filter(m => m.data?.lastDay === today).length;
  const list = rows.map((m, i) => {
    const dt = m.data || {}, [cls, txt] = seenText(dt.lastDay), lead = isLeaderName(m.username);
    return `<div class="mem box pop ${m.username === user ? "me" : ""}" style="--i:${Math.min(i, 12)}">
      <span class="mem-av">${esc(dt.avatar || "🙂")}<i class="dot ${cls}"></i></span>
      <div class="mem-info"><b>${esc(m.name || m.username)}${lead ? " 👑" : ""}${m.username === user ? " (คุณ)" : ""}</b>
        <small class="muted">@${esc(m.username)} · LV.${levelOf(dt.xp || 0)} · สำเร็จ ${dt.done || 0} เควส</small></div>
      <span class="mem-seen ${cls}">${txt}</span></div>`;
  }).join("");
  PUT.members =
    pageHead("👥", "สมาชิกห้อง", `${ROOM} · ทั้งหมด ${rows.length} คน · เข้าใช้วันนี้ ${onToday} คน`) +
    (membersErr ? `<div class="alert box pop"><span class="c-icon">⚠️</span><div><b>โหลดรายชื่อไม่ครบ</b>
      <div class="muted small">ตรวจสิทธิ์อ่านตาราง users ใน Supabase (รัน schema.sql) · ${esc(membersErr)}</div></div></div>` : "") +
    `<div class="mem-list">${list}</div>`;
}

function renderAll(){ renderSide(); renderHome(); renderTimetable(); renderQuests(); renderActivities(); renderCalendar(); renderMembers(); renderBooks(); }

function showPage(p){
  page = p;
  qsa(".page").forEach(s => s.classList.toggle("active", s.id === "page-" + p));
  qsa(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page === p));
  const el = $("#page-" + p);
  el.classList.remove("quiet", "pop"); void el.offsetWidth; el.classList.add("pop");
  scrollTo(0, 0);
  try { $(".nav button.active")?.scrollIntoView({ inline: "center", block: "nearest" }); } catch {}
  if (p === "books") loadBooks().then(renderBooks);
}

// ===================== 5) Modal ฟอร์ม =====================
function fillTeachers(){
  const teachers = [...new Set(Object.values(SCHEDULE).flat().filter(s => s && s.teacher).map(s => s.teacher))].sort();
  $("#teacherSelect").innerHTML = teachers.map(t => `<option>${t}</option>`).join("") + `<option>คุณครูท่านอื่น</option>`;
}

function openModal(kind, item){
  if (ROLE !== "leader") return;
  const m = $("#modal"); m.dataset.form = kind;
  if (kind === "quest"){
    const f = $("#questForm").elements, editing = !!item;
    $("#questFormTitle").textContent = editing ? "✏️ แก้ไขเควส" : "⚔️ มอบหมายเควสให้ห้อง";
    $("#questSubmit").textContent = editing ? "บันทึกการแก้ไข" : "ประกาศให้ทั้งห้อง";
    f["id"].value = item?.id || "";
    if (editing){
      if (![...f["teacher"].options].some(o => o.value === item.teacher)) f["teacher"].add(new Option(item.teacher, item.teacher));
      f["title"].value = item.title; f["teacher"].value = item.teacher; f["type"].value = item.type;
      f["due"].value = item.due; f["diff"].value = item.diff || "normal"; f["note"].value = item.note || "";
    } else if (!f["due"].value) f["due"].value = iso(new Date());
  } else if (kind === "book"){
    const f = $("#bookForm").elements, editing = !!item;
    $("#bookFormTitle").textContent = editing ? "✏️ แก้ไขหนังสือ" : "📚 เพิ่มหนังสือเข้ามุมหนังสือ";
    $("#bookSubmit").textContent = editing ? "บันทึกการแก้ไข" : "เพิ่มหนังสือ";
    f["id"].value = item?.id || "";
    f["title"].value = item?.title || ""; f["subject"].value = item?.subject || ""; f["author"].value = item?.author || "";
    f["url"].value = item?.url || ""; f["description"].value = item?.description || "";
    bookCover = item?.cover || null; setCoverPreview(bookCover);
  } else {
    const f = $("#actForm").elements, editing = !!item;
    $("#actFormTitle").textContent = editing ? "✏️ แก้ไขกิจกรรม" : "🎪 เพิ่มกิจกรรมห้องเรียน";
    $("#actSubmit").textContent = editing ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม";
    f["id"].value = item?.id || "";
    if (editing){
      f["title"].value = item.title || ""; f["date"].value = item.date || ""; f["end_date"].value = item.end_date || "";
      f["assignee"].value = item.assignee || ""; f["description"].value = item.description || "";
    }
    if (!f["date"].value) f["date"].value = iso(new Date());
    f["end_date"].min = f["date"].value;
  }
  m.classList.add("open");
  setTimeout(() => $(`#${kind}Form [name=title]`)?.focus(), 80);
}

function closeModal(){
  $("#modal").classList.remove("open");
  $("#questForm").reset(); $("#actForm").reset(); $("#bookForm").reset();
  $("#bookForm").elements["id"].value = ""; bookCover = null; setCoverPreview(null);
  $("#actForm").elements["id"].value = "";
  $("#questForm").elements["id"].value = "";   // hidden input ไม่ถูก reset เอง
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

$("#questForm").onsubmit = async e => {
  e.preventDefault();
  if (saving || ROLE !== "leader") return;
  const f = e.target.elements, editId = f["id"].value;
  const data = { title: f["title"].value.trim(), teacher: f["teacher"].value, type: f["type"].value,
    due: f["due"].value, diff: f["diff"].value, note: f["note"].value.trim() };
  if (!data.title) return;
  const btn = e.target.querySelector("[type=submit]"); saving = true; btn.disabled = true;
  try {
    if (editId) await sb(`shared_quests?id=eq.${enc(editId)}`, "PATCH", data);
    else await sb("shared_quests", "POST", { id: uid(), ...data, room: ROOM, created_by: user });
    closeModal(); sfx(); toast(editId ? "✏️ แก้ไขเควสแล้ว" : "⚔️ ประกาศเควสให้เพื่อนทั้งห้องแล้ว!");
    commit();
  } catch (err) { console.error(err); toast("⚠️ บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"); }
  finally { saving = false; btn.disabled = false; }
};

// บันทึกกิจกรรม: ถ้าฐานข้อมูลไม่มีคอลัมน์ไหน / id ไม่ใช่ text ระบบจะตัดฟิลด์นั้นแล้วลองใหม่เอง
async function writeAct(editId, data){
  const dropped = [];
  for (let i = 0; i < 5; i++){
    try {
      if (editId) await sb(`class_activities?id=eq.${enc(editId)}`, "PATCH", data);
      else await sb("class_activities", "POST", data);
      return dropped;
    } catch (err) {
      const e = errInfo(err), m = e.msg;
      const col = (m.match(/'(\w+)' column/) || m.match(/column "?(\w+)"?[^]*does not exist/) || [])[1];
      if (col && col in data && !["title", "date", "room_target"].includes(col)){ delete data[col]; dropped.push(col); continue; }
      if (!editId && "id" in data && e.code === "22P02"){ delete data.id; dropped.push("id"); continue; }
      throw err;
    }
  }
  throw new Error("ลองบันทึกหลายครั้งแล้วไม่สำเร็จ");
}

$("#actForm").onsubmit = async e => {
  e.preventDefault();
  if (saving || ROLE !== "leader") return;
  const f = e.target.elements, editId = f["id"].value;
  const data = { title: f["title"].value.trim(), description: f["description"].value.trim(),
    date: f["date"].value, room: ROOM, room_target: ROOM, assignee: f["assignee"].value.trim() };
  const end = f["end_date"].value;
  if (!data.title) return toast("⚠️ ใส่ชื่อกิจกรรมก่อน");
  if (!data.date) return toast("⚠️ เลือกวันที่เริ่มก่อน");
  if (end && end < data.date) return toast("⚠️ วันสิ้นสุดต้องไม่ก่อนวันเริ่ม");
  if (editId) data.end_date = end && end > data.date ? end : null;
  else { data.id = uid(); if (end && end > data.date) data.end_date = end; }
  const btn = e.target.querySelector("[type=submit]"); saving = true; btn.disabled = true;
  try {
    const dropped = await writeAct(editId, data);
    closeModal(); sfx();
    toast(editId ? "✏️ แก้ไขกิจกรรมแล้ว" : "🎪 เพิ่มกิจกรรมห้องสำเร็จ!");
    if (dropped.includes("end_date")) setTimeout(() => toast("ℹ️ ตารางยังไม่มีคอลัมน์ end_date (บันทึกวันสิ้นสุดไม่ได้) · รัน schema.sql", 5000), 2400);
    commit();
  } catch (err) { console.error(err); toast("⚠️ บันทึกไม่สำเร็จ: " + friendlyErr(err, "class_activities"), 5000); }
  finally { saving = false; btn.disabled = false; }
};

$("#bookForm").onsubmit = async e => {
  e.preventDefault();
  if (saving || ROLE !== "leader") return;
  const f = e.target.elements, editId = f["id"].value;
  let url = f["url"].value.trim();
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  if (!/^https?:\/\/[^\s]+\.[^\s]+/i.test(url)) return toast("⚠️ ใส่ลิงก์ให้ถูกต้อง เช่น https://drive.google.com/...");
  const data = { title: f["title"].value.trim(), subject: f["subject"].value.trim(), author: f["author"].value.trim(),
    description: f["description"].value.trim(), url, cover: bookCover };
  if (!data.title) return;
  const btn = e.target.querySelector("[type=submit]"); saving = true; btn.disabled = true;
  try {
    if (editId) await sb(`class_books?id=eq.${enc(editId)}`, "PATCH", data);
    else await sb("class_books", "POST", { id: uid(), ...data, room: ROOM, created_by: user });
    closeModal(); sfx(); toast(editId ? "✏️ แก้ไขหนังสือแล้ว" : "📚 เพิ่มหนังสือเข้ามุมหนังสือแล้ว!");
    commit();
  } catch (err) { console.error(err); toast("⚠️ บันทึกไม่สำเร็จ (รูปปกใหญ่เกินไปหรือยังไม่ได้รัน schema.sql?)"); }
  finally { saving = false; btn.disabled = false; }
};
$("#coverFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try { bookCover = await fileToCover(file); setCoverPreview(bookCover); }
  catch { toast("⚠️ อ่านรูปไม่ได้ ลองรูปอื่น"); }
  e.target.value = "";
});
$("#coverClear").onclick = () => { bookCover = null; setCoverPreview(null); };
// รูปปกที่โหลดไม่ได้ → ซ่อนรูป เหลือปกสีที่มีชื่อหนังสือ
document.addEventListener("error", e => { if (e.target.matches?.("img.book-img")) e.target.remove(); }, true);

// ===================== 6) Event Listeners =====================
document.addEventListener("click", async e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id;
  switch (act){
    case "page":      sfx(); showPage(t.dataset.page); break;
    case "theme":     toggleTheme(); break;
    case "logout":    if (confirm("ต้องการออกจากระบบใช่ไหม?")) logout(); break;
    case "open-quest-modal": openModal("quest"); break;
    case "open-act-modal":   openModal("act"); break;
    case "edit-act": { const a = classActivities.find(x => String(x.id) === id); if (a) openModal("act", a); break; }
    case "close":     closeModal(); break;
    case "filter":    qFilter = t.dataset.f; sfx(); renderQuests(); break;
    case "toggle-shared": toggleSharedQuest(id || t.closest("[data-id]")?.dataset.id, t); break;
    case "open-book-modal": openModal("book"); break;
    case "edit-book": { const b = books.find(x => x.id === id); if (b) openModal("book", b); break; }
    case "pick-cover": $("#coverFile").click(); break;
    case "book-subject": bookSubject = t.dataset.s; sfx(); renderBooks(); break;
    case "del-book":
      if (confirm("ลบหนังสือเล่มนี้ออกจากมุมหนังสือใช่ไหม? (ไฟล์ใน Drive ไม่ถูกลบ)")) {
        try { await sb(`class_books?id=eq.${enc(id)}`, "DELETE"); toast("🗑️ ลบหนังสือแล้ว"); commit(); }
        catch { toast("⚠️ ลบไม่สำเร็จ ลองใหม่อีกครั้ง"); }
      }
      break;
    case "edit-shared": { const q = sharedQuests.find(x => x.id === id); if (q) openModal("quest", q); break; }
    case "copy-summary": copyText(summaryText()); break;
    case "copy-pending": {
      const q = sharedQuests.find(x => x.id === id); if (!q) break;
      const pd = members.filter(m => !memberDone(m, id));
      copyText(`⏳ ยังไม่ส่ง «${q.title}» (${pd.length} คน)\n` + (pd.map(m => m.name || m.username).join(", ") || "ส่งครบแล้ว 🎉"));
      break;
    }
    case "notify": enablePush(); break;
    case "who": {
      const box = t.closest(".progress"); if (!box) break;
      const open = box.classList.toggle("open");
      open ? openQuests.add(id) : openQuests.delete(id);
      t.textContent = open ? "ซ่อนรายชื่อ" : "ดูรายชื่อ"; sfx(); break;
    }
    case "sync-cal":  syncToGoogleCalendar(t.dataset.title, t.dataset.due, t.dataset.note); break;
    case "tt-day":    selectedTimetableDay = +t.dataset.day; sfx(); renderTimetable(); break;
    case "del-shared":
      if (confirm("ลบเควสนี้ออกจากห้องใช่ไหม?")) {
        try { await sb(`shared_quests?id=eq.${enc(id)}`, "DELETE"); toast("🗑️ ลบเควสแล้ว"); commit(); }
        catch { toast("⚠️ ลบไม่สำเร็จ ลองใหม่อีกครั้ง"); }
      }
      break;
    case "del-act":
      if (confirm("ลบกิจกรรมนี้ใช่ไหม?")) {
        try { await sb(`class_activities?id=eq.${enc(id)}`, "DELETE"); toast("🗑️ ลบกิจกรรมแล้ว"); commit(); }
        catch { toast("⚠️ ลบไม่สำเร็จ ลองใหม่อีกครั้ง"); }
      }
      break;
    case "date":      selDate = t.dataset.date; sfx(); renderCalendar(); break;
    case "cal": {
      const d = +t.dataset.d;
      if (d === 0){ const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); selDate = iso(n); }
      else { const n = new Date(calY, calM + d, 1); calY = n.getFullYear(); calM = n.getMonth(); }
      sfx(); renderCalendar(); break;
    }
  }
});

document.addEventListener("input", e => {
  if (e.target.matches("#actForm [name=date]")) $("#actForm [name=end_date]").min = e.target.value;
  if (e.target.matches("[data-bsearch]")){ bookSearch = e.target.value.trim().toLowerCase(); applyBookSearch(); }
  if (e.target.matches("[data-search]")){ qSearch = e.target.value.trim().toLowerCase(); applySearch(); }
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
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
$("#subjectList").innerHTML = Object.values(GROUPS).map(g => `<option value="${g.name}">`).join("");
const session = localStorage.getItem("ms_session");
session ? startApp(session) : showAuth();
const classSig = () => JSON.stringify([sharedQuests, classActivities, membersErr, actsErr,
  members.map(m => [m.username, (m.data?.hw || []).filter(h => h.done).length, m.data?.xp || 0])]);
async function refreshClass(){
  if (!user || document.hidden || $("#modal").classList.contains("open")) return;
  const before = classSig();
  await loadClassData();
  if (classSig() !== before) renderAll(); else { renderHome(); renderTimetable(); }
  if (page === "books"){ await loadBooks(); renderBooks(); }
}
setInterval(refreshClass, 15000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshClass(); });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
