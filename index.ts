import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const bkk = (add = 0) => new Date(Date.now() + 7 * 3600e3 + add * 864e5).toISOString().slice(0, 10);

Deno.serve(async () => {
  const today = bkk(), tmr = bkk(1);
  const [subs, quests, acts, users] = await Promise.all([
    db.from("push_subscriptions").select("*"), db.from("shared_quests").select("id,title,due,room"),
    db.from("class_activities").select("title,date,end_date,room_target,room"), db.from("users").select("username,data"),
  ]);
  const done = new Map((users.data ?? []).map((u: any) => [u.username, new Set((u.data?.hw ?? []).filter((h: any) => h.done).map((h: any) => h.id))]));
  let sent = 0, removed = 0;
  for (const s of subs.data ?? []) {
    const mine = (quests.data ?? []).filter((q: any) => q.room === s.room && q.due <= tmr && !done.get(s.username)?.has(q.id));
    const ev = (acts.data ?? []).filter((a: any) => (a.room_target ?? a.room) === s.room && a.date <= today && today <= (a.end_date ?? a.date));
    const lines = [
      ...mine.filter((q: any) => q.due < today).map((q: any) => `🔴 เลยกำหนด: ${q.title}`),
      ...mine.filter((q: any) => q.due === today).map((q: any) => `🟠 ส่งวันนี้: ${q.title}`),
      ...mine.filter((q: any) => q.due === tmr).map((q: any) => `🟡 พรุ่งนี้: ${q.title}`),
      ...ev.map((a: any) => `🎪 วันนี้: ${a.title}`),
    ];
    if (!lines.length) continue;
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: "School Quest · งานวันนี้", body: lines.slice(0, 5).join("\n"), tag: "sq-daily" }));
      sent++;
    } catch (e: any) {
      if (e.statusCode === 404 || e.statusCode === 410) { await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint); removed++; }
      else console.error(e.statusCode, e.body);
    }
  }
  return new Response(JSON.stringify({ sent, removed }), { headers: { "Content-Type": "application/json" } });
});