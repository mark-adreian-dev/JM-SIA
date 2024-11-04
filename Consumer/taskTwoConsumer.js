const amqp = require('amqplib');
const axios = require('axios');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });


readline.question("What Region: ", (region) => {
    async function consumeApiRequests(queue) {
        try {
            // Connect to RabbitMQ
            const connection = await amqp.connect('amqp://localhost');
            const channel = await connection.createChannel();

            // Ensure the queue exists
            await channel.assertQueue(queue, { durable: true });

            console.log(`Waiting for messages in queue: ${queue}`);
            
            // Consume messages
            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const requestData = JSON.parse(msg.content.toString());
                    // Make the API request
                    try {
                        let response = await axios({
                            method: requestData.method,
                            url: String(requestData.url).replaceAll("'", ""),
                            headers: requestData.headers,
                            data: requestData.body,
                        });

                        response = response.data 
                        const message = `Note: ${response.note}\nMessage: ${response.message}\n\tUser:\n\t\tEmail: ${response.data.email} \n\t\tPassowrd: ${response.data.password}\n\t\tRegion: ${response.data.region}`
                        console.log(message);

                        // Acknowledge the message
                        channel.ack(msg);
                    } catch (apiError) {
                        console.error('API Request Failed:', apiError.message);
                    }
                }
            });
        } catch (error) {
            console.error('Error consuming messages:', error);
        }
    }

    // Start the consumer
    consumeApiRequests(`route_${region}`);
})
