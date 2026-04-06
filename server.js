// server.js - Node.js Backend for Abstract Global
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // সারা বিশ্ব থেকে কানেকশন এলাউ করার জন্য
});

app.use(express.static(path.join(__current_dir, 'public')));

// ইউজার কানেকশন হ্যান্ডলিং
io.on('connection', (socket) => {
    console.log('A Global Node Connected: ' + socket.id);

    // মেসেজ আদান-প্রদান (Broadcast)
    socket.on('send_message', (data) => {
        // এখানে এনক্রিপশন লজিক যোগ করা যাবে
        io.emit('receive_message', data); 
    });

    // লোকেশন শেয়ারিং লজিক (Security Feature)
    socket.on('share_location', (locData) => {
        socket.broadcast.emit('track_node', locData);
    });

    socket.on('disconnect', () => {
        console.log('Node Disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ABSTRACT Server running on port ${PORT}`);
});
