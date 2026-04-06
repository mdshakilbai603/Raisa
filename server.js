// server.js - Node.js Backend for Abstract Global
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

app.use(express.static(path.join(__dirname, 'public')));

// ডাটা স্টোর (মেমোরিতে সাময়িকভাবে সেভ থাকবে)
let activeNodes = {}; 
let chatHistory = [];

io.on('connection', (socket) => {
    console.log('A Global Node Connected: ' + socket.id);

    // ১. ইউজার রেজিস্ট্রেশন ও ডিসকভারি
    socket.on('register_node', (userData) => {
        activeNodes[socket.id] = {
            id: socket.id,
            name: userData.name,
            loc: userData.loc,
            avatar: userData.avatar
        };
        
        // নতুন ইউজারকে পুরনো মেসেজ পাঠানো (Persistence)
        socket.emit('load_history', chatHistory);
        
        // সবাইকে আপডেট ইউজার লিস্ট পাঠানো
        io.emit('update_user_list', Object.values(activeNodes));
    });

    // ২. মেসেজ ও ফাইল আদান-প্রদান
    socket.on('send_message', (data) => {
        // মেসেজ হিস্টোরিতে সেভ করা
        chatHistory.push(data);
        if (chatHistory.length > 100) chatHistory.shift(); // শেষ ১০০ মেসেজ রাখা

        io.emit('receive_message', data); 
    });

    // ৩. লোকেশন শেয়ারিং
    socket.on('share_location', (locData) => {
        socket.broadcast.emit('track_node', locData);
    });

    // ৪. ডিসকানেক্ট হ্যান্ডলিং
    socket.on('disconnect', () => {
        if (activeNodes[socket.id]) {
            delete activeNodes[socket.id];
            io.emit('update_user_list', Object.values(activeNodes));
            console.log('Node Disconnected');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ABSTRACT Server running on port ${PORT}`);
});
