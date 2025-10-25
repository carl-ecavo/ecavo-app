import http from "node:http";
const server = http.createServer((req, res) => {
  res.writeHead(200, {"content-type": "text/plain"});
  res.end("Hello from Ecavo!\n");
});
server.listen(process.env.PORT || 8080);
