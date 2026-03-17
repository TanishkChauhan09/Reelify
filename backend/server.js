// start server
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { Server } = require('socket.io');

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
     cors: {
          origin: ['http://localhost:5173', 'http://localhost:5174'],
          credentials: true
     }
});

io.on('connection', (socket) => {
     socket.on('join-food', (foodId) => {
          if (foodId) socket.join(`food:${foodId}`);
     });
});

app.set('io', io);

server.listen(3000 , ()=> {
     console.log('Server is running on port 3000');
})  
