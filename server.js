cat > server.js <<'EOF'
import http from "node:http";
import url from "node:url";
import { Pool } from "pg";

// --- ENV ---
const PORT = process.env.PORT || 8080;
// Use your existing Secret for password and env vars for the rest:
const DB_USER = process.env.DB_USER || "ecavo_app";
const DB_PASS = process.env.DB_PASS; // from Secret Manager
const DB_NAME = process.env.DB_NAME || "template1"; // change to your real DB later
const INSTANCE_CONNECTION_NAME = process.env.INSTANCE_CONNECTION_NAME; // ecavo-prod:europe-west1:ecavo-db-prod

// --- Postgres pool via Cloud SQL Unix socket ---
const pool = new Pool({
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  host: `/cloudsql/${INSTANCE_CONNECTION_NAME}`,
  ssl: false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 5,
});

// Simple router
const server = http.createServer(async (req, res) => {
  const path = url.parse(req.url).pathname || "/";

  if (path === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  if (path === "/dbcheck") {
    try {
      const r = await pool.query("SELECT 1 as ok");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: r.rows?.[0]?.ok === 1 }));
    } catch (e) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Root: keep it non-blocking first, then show DB time as a bonus
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase Time: ${r.rows[0].now}`);
  } catch {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("Hello from Ecavo! CI/CD is LIVE!\nDB not ready yet. Check /dbcheck.");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
EOF
