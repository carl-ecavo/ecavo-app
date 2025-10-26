import http from "node:http";
import { Client } from 'pg';

// --- CONNECTION CONFIGURATION ---
const DB_USER = 'postgres'; 
const DB_PASSWORD = process.env.DB_PASS; // Secret Manager injection
const DB_NAME = 'postgres';

// The full Instance Connection Name is used as the socket file name
// Format: /cloudsql/PROJECT_ID:REGION:INSTANCE_ID
const CLOUDSQL_SOCKET_PATH = `/cloudsql/totemic-chimera-476220-n3:europe-west1:ecavo-db-dev`;

const PORT = process.env.PORT || 8080;

// 2. Configure the PostgreSQL client
const client = new Client({
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: CLOUDSQL_SOCKET_PATH, // Directly specify the full Unix socket path
});
// --------------------------------

// Connect to the database on startup (or implement robust connection pooling for production)
client.connect()
  .then(() => console.log('Successfully connected to Cloud SQL database!'))
  .catch(err => console.error('Connection error: Failed to connect to database using socket path.', err.stack));


const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  
  // Example query: check the current time in the database
  client.query('SELECT NOW()')
    .then(dbRes => {
      const dbTime = dbRes.rows[0].now;
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase Time: ${dbTime}`);
    })
    .catch(err => {
      console.error('Query error:', err.stack);
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase connection FAILED. Check logs for query error.`);
    });
});

server.listen(PORT, '0.0.0.0', () => { // <--- ADDED '0.0.0.0'
  console.log(`Server listening on port ${PORT} at 0.0.0.0`);
});
