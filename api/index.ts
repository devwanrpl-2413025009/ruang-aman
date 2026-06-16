import express, { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import ws from "ws";

// ─── Pool: pilih @neondatabase/serverless (Neon cloud) atau pg (lokal) ──────
let PoolCtor: new (opts: { connectionString?: string }) => {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number | null }>;
};
const isNeon = process.env.DATABASE_URL?.includes("neon.tech");

if (isNeon) {
  const mod = await import("@neondatabase/serverless");
  mod.neonConfig.webSocketConstructor = ws;
  PoolCtor = mod.Pool;
} else {
  const mod = await import("pg");
  PoolCtor = mod.Pool;
}

const pool = new PoolCtor({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());

// ─── Schema init (runs on cold start) ────────────────────────────────────────
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'waiting',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      timestamp VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      trigger TEXT NOT NULL,
      feeling TEXT NOT NULL,
      wellness_tip TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP
  `);
  await pool.query(`
    ALTER TABLE sessions ADD COLUMN IF NOT EXISTS counselor_nip VARCHAR(20) REFERENCES counselors(nip)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counselors (
      nip VARCHAR(20) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedCounselors() {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync("sarah123", salt, 64).toString("hex");
  const passwordHash = `${salt}:${hash}`;

  await pool.query(
    `INSERT INTO counselors (nip, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (nip) DO NOTHING`,
    ["198804052015042001", "Bu Sarah, M.Pd.", passwordHash]
  );
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(_req: Request, res: Response, next: NextFunction) {
  if (!schemaReady) {
    schemaReady = initSchema().then(() => seedCounselors()).catch((err) => {
      console.error("Schema/seed init failed:", err);
      throw err;
    });
  }
  schemaReady.then(() => next()).catch(() => {
    res.status(500).json({ error: "Database initialization failed" });
  });
}

app.use("/api", ensureSchema);

// ─── API Routes ──────────────────────────────────────────────────────────────

// Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Chat History
app.get("/api/chat/history", async (req, res) => {
  try {
    const studentId = (req.query.studentId as string) || "Anonimus_8891";
    const counselorNip = req.query.counselor_nip as string | undefined;

    // Auto-assign session if a counselor is fetching and session is unassigned
    if (counselorNip) {
      await pool.query(
        `UPDATE sessions SET counselor_nip = $1 WHERE id = $2 AND counselor_nip IS NULL`,
        [counselorNip, studentId]
      );
    }

    // Auto-mark messages as read based on who is fetching
    if (counselorNip) {
      await pool.query(
        `UPDATE messages SET read_at = NOW() WHERE session_id = $1 AND role = 'user' AND read_at IS NULL`,
        [studentId]
      );
    } else {
      await pool.query(
        `UPDATE messages SET read_at = NOW() WHERE session_id = $1 AND role = 'model' AND read_at IS NULL`,
        [studentId]
      );
    }

    const result = await pool.query(
      `SELECT id, role, text, timestamp, read_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [studentId]
    );

    // Get session counselor info
    const sessionResult = await pool.query(
      `SELECT s.counselor_nip, c.name AS counselor_name
       FROM sessions s
       LEFT JOIN counselors c ON s.counselor_nip = c.nip
       WHERE s.id = $1`,
      [studentId]
    );

    const sessionRow = sessionResult.rows[0] as { counselor_nip?: string; counselor_name?: string } | undefined;

    res.json({
      messages: result.rows,
      session_counselor_nip: sessionRow?.counselor_nip || null,
      session_counselor_name: sessionRow?.counselor_name || null,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Chat Send
app.post("/api/chat", async (req, res) => {
  try {
    const { message, studentId, timestamp } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const currentStudentId = studentId || "Anonimus_8891";
    const ts = timestamp || String(Date.now());

    const userMsgId = `msg-${currentStudentId}-${Date.now()}`;

    await pool.query(
      `INSERT INTO sessions (id, name, status) VALUES ($1, $1, 'active')
       ON CONFLICT (id) DO UPDATE SET status = 'active'`,
      [currentStudentId]
    );

    await pool.query(
      `INSERT INTO messages (id, session_id, role, text, timestamp) VALUES ($1, $2, 'user', $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [userMsgId, currentStudentId, message, ts]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Counselor Queue
app.get("/api/counselor/queue", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.status, s.created_at, s.counselor_nip, c.name AS counselor_name
       FROM sessions s
       LEFT JOIN counselors c ON s.counselor_nip = c.nip
       ORDER BY s.created_at DESC`
    );
    res.json({ queue: result.rows });
  } catch (error) {
    console.error("Error fetching queue:", error);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// Counselor Send Message
app.post("/api/counselor/message", async (req, res) => {
  try {
    const { studentId, text, timestamp, counselor_nip } = req.body;
    if (!studentId || !text) {
      return res.status(400).json({ error: "studentId and text are required" });
    }
    if (!counselor_nip) {
      return res.status(400).json({ error: "counselor_nip is required" });
    }

    // Auto-assign if session is unassigned
    await pool.query(
      `UPDATE sessions SET counselor_nip = $1 WHERE id = $2 AND counselor_nip IS NULL`,
      [counselor_nip, studentId]
    );

    // Validate assignment
    const sessionResult = await pool.query(
      `SELECT counselor_nip FROM sessions WHERE id = $1`,
      [studentId]
    );

    const sessionRow2 = sessionResult.rows[0] as { counselor_nip?: string } | undefined;
    const assignedNip = sessionRow2?.counselor_nip;
    if (assignedNip && assignedNip !== counselor_nip) {
      const counselorResult = await pool.query(
        `SELECT name FROM counselors WHERE nip = $1`,
        [assignedNip]
      );
      const handlerName = (counselorResult.rows[0] as { name: string } | undefined)?.name || "Konselor lain";
      return res.status(403).json({ error: `Session ini sedang ditangani oleh ${handlerName}`, blocked: true });
    }

    const ts = timestamp || String(Date.now());
    const msgId = `cmsg-${studentId}-${Date.now()}`;

    await pool.query(
      `INSERT INTO messages (id, session_id, role, text, timestamp) VALUES ($1, $2, 'model', $3, $4)`,
      [msgId, studentId, text, ts]
    );

    res.json({ success: true, message: { id: msgId, role: "model", text, timestamp: ts } });
  } catch (error) {
    console.error("Error sending counselor message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Counselor Release Session
app.post("/api/counselor/release-session", async (req, res) => {
  try {
    const { studentId, counselor_nip } = req.body;
    if (!studentId || !counselor_nip) {
      return res.status(400).json({ error: "studentId and counselor_nip are required" });
    }

    await pool.query(
      `UPDATE sessions SET counselor_nip = NULL WHERE id = $1 AND counselor_nip = $2`,
      [studentId, counselor_nip]
    );

    res.json({ success: true, message: "Session released" });
  } catch (error) {
    console.error("Error releasing session:", error);
    res.status(500).json({ error: "Failed to release session" });
  }
});

// Counselor Login
app.post("/api/counselor/login", async (req, res) => {
  try {
    const { nip, password } = req.body;
    if (!nip || !password) {
      return res.status(400).json({ error: "NIP and password are required" });
    }

    const result = await pool.query(
      `SELECT name, password_hash FROM counselors WHERE nip = $1`,
      [nip]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "NIP atau kata sandi salah" });
    }

    const { name, password_hash: stored } = result.rows[0] as { name: string; password_hash: string };
    const [salt, hash] = stored.split(":");
    const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash))) {
      return res.status(401).json({ error: "NIP atau kata sandi salah" });
    }

    res.json({ success: true, name, nip });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Session Reset
app.post("/api/session/reset", async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    await pool.query(`DELETE FROM messages WHERE session_id = $1`, [studentId]);
    await pool.query(`DELETE FROM journals WHERE student_id = $1`, [studentId]);
    await pool.query(`DELETE FROM sessions WHERE id = $1`, [studentId]);
    res.json({ success: true, message: `All data for ${studentId} deleted.` });
  } catch (error) {
    console.error("Error resetting session:", error);
    res.status(500).json({ error: "Failed to reset session" });
  }
});

// Journals CRUD
app.get("/api/journals", async (req, res) => {
  try {
    const studentId = req.query.studentId as string;
    if (!studentId) {
      return res.status(400).json({ error: "studentId query param is required" });
    }
    const result = await pool.query(
      `SELECT id, student_id, date, trigger, feeling, wellness_tip FROM journals WHERE student_id = $1 ORDER BY created_at DESC`,
      [studentId]
    );
    res.json({ journals: result.rows });
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
});

app.post("/api/journals", async (req, res) => {
  try {
    const { studentId, date, trigger, feeling, wellnessTip } = req.body;
    if (!studentId || !trigger || !feeling) {
      return res.status(400).json({ error: "studentId, trigger, and feeling are required" });
    }
    const id = `journal-${studentId}-${Date.now()}`;
    const tip = wellnessTip || "Grounding: Ambil nafas lembut 4-4-4, regangkan pundak, katakan 'Aku aman dan mampu melalui ini.'";
    const dateStr = date || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    await pool.query(
      `INSERT INTO journals (id, student_id, date, trigger, feeling, wellness_tip) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, studentId, dateStr, trigger, feeling, tip]
    );

    res.json({ success: true, journal: { id, student_id: studentId, date: dateStr, trigger, feeling, wellness_tip: tip } });
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ error: "Failed to create journal" });
  }
});

app.delete("/api/journals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM journals WHERE id = $1`, [id]);
    res.json({ success: true, message: `Journal ${id} deleted.` });
  } catch (error) {
    console.error("Error deleting journal:", error);
    res.status(500).json({ error: "Failed to delete journal" });
  }
});

export default app;
