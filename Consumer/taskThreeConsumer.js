const amqp = require('amqplib');
async function receiveMessages() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchange = 'merge_exchange';
        await channel.assertExchange(exchange, 'fanout', { durable: false });

        // Create a queue and bind it to the exchange
        const { queue } = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(queue, exchange, '');

        console.log("Waiting for messages...");

        // Array to hold merged messages
        let mergedMessages = [];

        channel.consume(queue, (msg) => {
            const messageContent = msg.content.toString();
            console.log(`[${mergedMessages.length + 1}] Received message`);

            // Merge the message (for example, push to an array)
            mergedMessages.push(messageContent);

            // Example: Perform action after receiving several messages
            if (mergedMessages.length >= 2) { // arbitrary merge condition
                console.log("Merged Messages:", mergedMessages.join(", "));
                mergedMessages = []; // Clear merged messages
            }
        }, {
            noAck: true
        });
    } catch (error) {
        console.error("Error receiving messages:", error);
    }
}

// Run the consumer
receiveMessages();