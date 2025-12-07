const amqp = require('amqplib');

const EXCHANGE = 'crypto_exchange';
const COINS = ['BTC', 'ETH'];

async function startProducer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    // On crée un Exchange de type 'topic'
    await channel.assertExchange(EXCHANGE, 'topic', { durable: false });
    console.log("🚀 Producteur démarré. Envoi des prix...");

    setInterval(() => {
        COINS.forEach(coin => {
            // Simulation de prix (Math.random)
            const price = (Math.random() * 1000) + (coin === 'BTC' ? 40000 : 2000);
            
            // On simule un crash aléatoire (1 chance sur 20) pour la démo
            const isCrash = Math.random() < 0.05;
            const finalPrice = isCrash ? price * 0.8 : price; 

            const msg = {
                coin: coin,
                price: finalPrice.toFixed(2),
                timestamp: new Date().toISOString()
            };

            const routingKey = `price.${coin.toLowerCase()}`;
            
            // Envoi dans RabbitMQ
            channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(msg)));
            console.log(`[x] Envoyé ${routingKey}: $${msg.price}`);
        });
    }, 2000); // Toutes les 2 secondes
}

startProducer();