const amqp = require('amqplib');

const EXCHANGE = 'crypto_exchange';

async function startWorker() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertExchange(EXCHANGE, 'topic', { durable: false });
    
    // Création d'une queue temporaire pour écouter les prix
    const q = await channel.assertQueue('', { exclusive: true });
    
    // On s'abonne à TOUS les prix (price.*)
    channel.bindQueue(q.queue, EXCHANGE, 'price.#');

    console.log("🧠 Worker Math prêt. En attente de données...");

    // Mémoire simple pour comparer avec le prix précédent
    let lastPrices = {};

    channel.consume(q.queue, (msg) => {
        const data = JSON.parse(msg.content.toString());
        const coin = data.coin;
        const currentPrice = parseFloat(data.price);

        if (lastPrices[coin]) {
            // --- FORMULE MATHÉMATIQUE ---
            // Variation % = ((Nouveau - Ancien) / Ancien) * 100
            const variation = ((currentPrice - lastPrices[coin]) / lastPrices[coin]) * 100;

            // Si chute de plus de 10% (simulé), on lance une ALERTE
            if (variation < -10) {
                const alertMsg = {
                    level: 'CRITICAL',
                    message: `Crash détecté sur ${coin} ! Chute de ${variation.toFixed(2)}%`,
                    timestamp: new Date().toISOString()
                };

                // On republie dans RabbitMQ sur un canal différent
                channel.publish(EXCHANGE, 'alert.critical', Buffer.from(JSON.stringify(alertMsg)));
                console.log(`⚠️ ALERTE GÉNÉRÉE pour ${coin}`);
            }
        }

        lastPrices[coin] = currentPrice;
    }, { noAck: true });
}

startWorker();