require("http")
  .createServer((req, res) => {
    if (req.url.startsWith("/api")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ status: "ok" }));
    } else {
      res.writeHead(404);
    }
    res.end();
  })
  .listen(5000);

console.log("Node.js web server at port 5000 is running..");
