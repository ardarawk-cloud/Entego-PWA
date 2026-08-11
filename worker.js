import { DurableObject } from "cloudflare:workers";

const ALLOWED_STATUS = new Set(["baru","diterima","ditolak","berlangsung","selesai","dibatalkan"]);
const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const money = v => Math.max(0, Math.round(Number(v) || 0));

export class EntegoStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        vendor_id INTEGER NOT NULL DEFAULT 0,
        vendor_name TEXT NOT NULL,
        package_id TEXT NOT NULL,
        package_name TEXT NOT NULL,
        package_price INTEGER NOT NULL DEFAULT 0,
        duration TEXT NOT NULL DEFAULT '',
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        location TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        payment_method TEXT NOT NULL DEFAULT 'QRIS',
        fee INTEGER NOT NULL DEFAULT 0,
        promo INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'baru',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        type TEXT NOT NULL,
        method TEXT NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS booking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        event TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
      CREATE INDEX IF NOT EXISTS idx_events_booking ON booking_events(booking_id);
    `);
  }

  row(row) {
    if (!row) return null;
    return {
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      packageId: row.package_id,
      packageName: row.package_name,
      packagePrice: row.package_price,
      duration: row.duration,
      date: row.event_date,
      time: row.event_time,
      location: row.location,
      note: row.note,
      paymentMethod: row.payment_method,
      fee: row.fee,
      promo: row.promo,
      total: row.total,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async createBooking(input) {
    const vendorName = clean(input.vendorName, 120);
    const packageName = clean(input.packageName, 120);
    const date = clean(input.date, 20);
    const time = clean(input.time, 20);
    const location = clean(input.location, 240);
    if (!vendorName || !packageName || !date || !time || !location) throw new Error("BOOKING_REQUIRED_FIELDS");

    const now = new Date().toISOString();
    const id = `ENT-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const txId = `TX-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const packagePrice = money(input.packagePrice);
    const fee = money(input.fee ?? 75000);
    const promo = money(input.promo ?? 0);
    const total = Math.max(0, money(input.total || packagePrice + fee - promo));
    const method = clean(input.paymentMethod || "QRIS", 60);

    this.sql.exec(
      `INSERT INTO bookings (id,vendor_id,vendor_name,package_id,package_name,package_price,duration,event_date,event_time,location,note,payment_method,fee,promo,total,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      id, money(input.vendorId), vendorName, clean(input.packageId || "standard", 80), packageName, packagePrice,
      clean(input.duration, 60), date, time, location, clean(input.note, 1000), method, fee, promo, total, "baru", now, now
    );
    this.sql.exec(
      `INSERT INTO transactions (id,booking_id,type,method,amount,status,created_at) VALUES (?,?,?,?,?,?,?)`,
      txId, id, "booking_payment_record", method, total, "recorded", now
    );
    this.sql.exec(`INSERT INTO booking_events (booking_id,event,created_at) VALUES (?,?,?)`, id, "booking_created", now);
    return this.getBooking(id);
  }

  async getBooking(id) {
    const rows = this.sql.exec(`SELECT * FROM bookings WHERE id = ? LIMIT 1`, clean(id, 100)).toArray();
    return this.row(rows[0]);
  }

  async listBookings(limit = 30) {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
    return this.sql.exec(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT ?`, safeLimit).toArray().map(row => this.row(row));
  }

  async updateStatus(id, status) {
    const safeStatus = clean(status, 30);
    if (!ALLOWED_STATUS.has(safeStatus)) throw new Error("INVALID_STATUS");
    const booking = await this.getBooking(id);
    if (!booking) return null;
    const now = new Date().toISOString();
    this.sql.exec(`UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?`, safeStatus, now, booking.id);
    this.sql.exec(`INSERT INTO booking_events (booking_id,event,created_at) VALUES (?,?,?)`, booking.id, `status_${safeStatus}`, now);
    return this.getBooking(booking.id);
  }

  async listTransactions(bookingId) {
    const id = clean(bookingId, 100);
    return this.sql.exec(`SELECT id,booking_id,type,method,amount,status,created_at FROM transactions WHERE booking_id = ? ORDER BY created_at DESC`, id).toArray();
  }
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method === "OPTIONS") return new Response(null, {status: 204});

    const store = env.ENT_STORE.getByName("entego-production");
    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ok:true,service:"entego-api",storage:"durable-object-sqlite",version:"v26"});
      }
      if (url.pathname === "/api/bookings" && request.method === "POST") {
        const body = await request.json();
        const booking = await store.createBooking(body);
        return json({ok:true,booking}, 201);
      }
      if (url.pathname === "/api/bookings" && request.method === "GET") {
        const bookings = await store.listBookings(url.searchParams.get("limit") || 30);
        return json({ok:true,bookings});
      }
      if (url.pathname === "/api/transactions" && request.method === "GET") {
        const bookingId = url.searchParams.get("bookingId");
        if (!bookingId) return json({ok:false,error:"bookingId_required"}, 400);
        return json({ok:true,transactions:await store.listTransactions(bookingId)});
      }
      const match = url.pathname.match(/^\/api\/bookings\/([^/]+)$/);
      if (match && request.method === "GET") {
        const booking = await store.getBooking(decodeURIComponent(match[1]));
        return booking ? json({ok:true,booking}) : json({ok:false,error:"not_found"}, 404);
      }
      if (match && request.method === "PATCH") {
        const body = await request.json();
        const booking = await store.updateStatus(decodeURIComponent(match[1]), body.status);
        return booking ? json({ok:true,booking}) : json({ok:false,error:"not_found"}, 404);
      }
      return json({ok:false,error:"api_route_not_found"}, 404);
    } catch (error) {
      const message = String(error?.message || error);
      const badRequest = message === "BOOKING_REQUIRED_FIELDS" || message === "INVALID_STATUS";
      return json({ok:false,error:badRequest ? message : "server_error"}, badRequest ? 400 : 500);
    }
  }
};
