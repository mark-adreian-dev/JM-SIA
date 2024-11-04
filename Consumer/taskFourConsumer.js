var amqp = require('amqplib/callback_api');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

//Prints the message to the terminal
const consumeCallback = msg => {
    const jsonFormatData = JSON.parse(msg.content)
    console.log(" [x] Received \n", jsonFormatData);
} 

//Ask for its name
readline.question("Enter Name: ", (reciepient) => {

    //Connects to amqp client to where amqp client will connect to RabitMQ Server
    amqp.connect('amqp://localhost', (connectionErr, connection) => {
        if (connectionErr) { throw connectionErr; }
        connection.createChannel(function(createChannelErr, channel) {
            if (createChannelErr)  throw createChannelErr;
            channel.assertQueue(reciepient, { durable: false });
            console.log("Waiting for (XML Data): ");  

            //if a message was sent to this reciepient it will run the consumeCallBack function
            channel.consume(reciepient, consumeCallback, {noAck: true});
        });
    });
})

