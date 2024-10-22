import { WebSocketServer } from "ws"; // Import WebSocket
import http from "http"; // Import HTTP
import express from "express"; // Import Express

const app = express(); // Create an Express application
const server = http.createServer(app); // Create an HTTP server and pass the Express app to it

// Initialize the WebSocket server on top of the HTTP server
const wss = new WebSocketServer({ server });

// Store WebSocket clients globally
let clients = [];
console.log("start")
// WebSocket connection setup
wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);

  // Handle disconnection
  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
    console.log("Client disconnected");
  });
});

// Function to send a message to all connected WebSocket clients
export function webSocketUtils(message) {
  console.log("Sending message to all clients:", message);
  // Send message to all connected WebSocket clients
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN = 1
      client.send(JSON.stringify({ message }));
    }
  });
}

// Start the HTTP and WebSocket server
server.listen(2000, () => {
  console.log(`WebSocket server is running and listening on port 2000`);
});


