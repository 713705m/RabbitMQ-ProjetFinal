const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const amqp = require('amqplib');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const EXCHANGE = 'crypto_exchange';

async function startServer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: false });

    // Queue "Audit Log" qui écoute TOUT (#)
    const q = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(q.queue, EXCHANGE, '#');

    console.log("🌐 Serveur Web connecté à RabbitMQ.");

    channel.consume(q.queue, (msg) => {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        // Envoi au frontend via WebSocket
        io.emit('rabbitmq_message', {
            key: routingKey,
            data: content
        });
    }, { noAck: true });

    server.listen(3000, () => {
        console.log('✅ Site web disponible sur http://localhost:3000');
    });
}

startServer();