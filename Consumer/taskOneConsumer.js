var amqp = require('amqplib/callback_api');


amqp.connect('amqp://localhost', function(errorConnect, connection) {
    if (errorConnect) throw errorConnect;
    
    connection.createChannel(function(errorChannel, channel) {
        if (errorChannel) throw errorChannel;

        const queue = 'form';
        channel.assertQueue(queue, { durable: false });
        console.log("Waiting for form submition.")
        channel.consume(queue, function(msg) {
            const registrationData = JSON.parse(msg.content)
            console.log("New user:")
            console.log("\tEmail: " + registrationData.email)
            console.log("\tPassword: " + registrationData.password)

        }, { noAck: true });
    });
});