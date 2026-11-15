// Supabase Edge Function: ส่ง Web Push (เควสใหม่ + เตือน 07:00)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com",
  Deno.env.get("VAPID_PUBLIC")!,
  Deno.env.get("VAPID_PRIVATE")!,
);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const bkkDate = (offsetDays = 0) =>
  new Date(Date.now() + 7 * 3600e3 + offsetDays * 864e5).toISOString().slice(0, 10);
const thDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

async function send(sub: any, payload: object) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload), { TTL: 86400, urgency: "high" },
    );
  } catch (e: any) {
    // เครื่องที่ยกเลิก/ลบการแจ้งเตือนแล้ว -> ลบทิ้ง
    if (e.statusCode === 404 || e.statusCode === 410)
      await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    else console.error("push fail", e.statusCode, e.body);
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-secret") !== Deno.env.get("PUSH_SECRET"))
    return new Response("forbidden", { status: 403 });
  const body = await req.json();

  // ---------- เควสใหม่ ----------
  if (body.type === "new_quest") {
    const q = body.quest;
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("room", q.room);
    const payload = {
      title: "⚔️ เควสใหม่: " + q.title,
      body: `${q.teacher ?? ""} · ส่ง ${thDate(q.due)}${q.note ? " · " + q.note : ""}`,
      tag: "quest-" + q.id, url: "./",
    };
    await Promise.all((subs ?? []).filter((s) => s.username !== q.created_by).map((s) => send(s, payload)));
    return new Response("ok");
  }

  // ---------- เตือน 07:00 ----------
  if (body.type === "morning") {
    const today = bkkDate(0), tomorrow = bkkDate(1), from = bkkDate(-7);
    const { data: quests } = await db.from("shared_quests").select("*").gte("due", from).lte("due", tomorrow);
    if (!quests?.length) return new Response("no quests");
    const { data: subs } = await db.from("push_subscriptions").select("*");
    const { data: users } = await db.from("users").select("username,data");
    const doneOf = new Map<string, Set<string>>();
    for (const u of users ?? [])
      doneOf.set(u.username, new Set((u.data?.hw ?? []).filter((h: any) => h.done).map((h: any) => h.id)));

    await Promise.all((subs ?? []).map((s) => {
      const done = doneOf.get(s.username) ?? new Set();
      const mine = quests.filter((q) => q.room === s.room && !done.has(q.id));
      if (!mine.length) return;
      const late = mine.filter((q) => q.due < today), td = mine.filter((q) => q.due === today),
        tm = mine.filter((q) => q.due === tomorrow);
      const parts = [
        late.length && `เลยกำหนด ${late.length}`, td.length && `ส่งวันนี้ ${td.length}`, tm.length && `ส่งพรุ่งนี้ ${tm.length}`,
      ].filter(Boolean).join(" · ");
      const names = [...td, ...late, ...tm].slice(0, 3).map((q) => "• " + q.title).join("\n");
      return send(s, { title: "⏰ 07:00 เช็กเควสก่อนไปโรงเรียน", body: `${parts}\n${names}`, tag: "sq-daily", url: "./" });
    }));
    return new Response("ok");
  }
  return new Response("bad type", { status: 400 });
});