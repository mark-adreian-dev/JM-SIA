const amqp = require('amqplib/callback_api');
const bodyParser = require("body-parser")
const cors = require('cors')
const cookieParser = require('cookie-parser')
const convert = require('xml-js');
const axios = require('axios');


const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(cors())
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

app.listen(PORT, (err) => {
    if(err) console.log(err)
    else console.log(`The server is running on PORT:${PORT}`)
})


app.get("/", (req, res) => { res.render('index') })

// When the send button is click
app.post("/xml", (req, res) => {

  const data = req.body.data //Raw XML data
  const receipient = req.body.reciepient //Where the data will be sent

  //connects to RabbitMQ Server
  amqp.connect('amqp://localhost', function(connectionErr, connection) {
    if (connectionErr) throw connectionErr;
    connection.createChannel(function(createChannelErr, channel) {
      if (createChannelErr) throw createChannelErr 

      //Converting XML to JSON
      const jsonResult = convert.xml2json(data, {
        compact: true,
        spaces: 2
      });

      //Sending the converted XML data to JSON to the proper reciepient
      channel.sendToQueue(receipient, Buffer.from(JSON.stringify(jsonResult)));
    });
  });
})

app.post("/aggregator", (req, res) => {
  const message = req.body.message

    function sendMessage(message) {
      amqp.connect('amqp://localhost', function(errorConnect, connection) {
          if (errorConnect) {
              console.error("Error connecting:", errorConnect);
              return;
          }

          connection.createChannel(function(errorChannel, channel) {
              if (errorChannel) {
                  console.error("Error creating channel:", errorChannel);
                  connection.close();
                  return;
              }

              const exchange = 'merge_exchange';
              channel.assertExchange(exchange, 'fanout', { durable: false }, function(errorAssert) {
                  if (errorAssert) {
                      console.error("Error asserting exchange:", errorAssert);
                      channel.close();
                      connection.close();
                      return;
                  }

                  channel.publish(exchange, '', Buffer.from(message));

                  // Close channel and connection after publishing
                  setTimeout(() => {
                      channel.close();
                      connection.close();
                  }, 500);
              });
          });
      });
  }

  // Call sendMessage 
  sendMessage(message);

})

app.post('/form', (req, res) => {
  const emailData = req.body.email
  const passwordData = req.body.password


  amqp.connect('amqp://localhost', function(errorConnect, connection) {
    if (errorConnect) throw errorConnect;

    connection.createChannel(function(errorChannel, channel) {
        if (errorChannel) throw errorChannel;
      
        const queue = 'form';
        const registrationData = {
          email: emailData,
          password: passwordData
        }
        console.log(registrationData)
        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(registrationData)));
    });
  });
})

app.post("/form2", (req, res) => {
  const user = req.body
  console.log(user)
  async function sendApiRequest(queue, message) {
    try {
        // Connect to RabbitMQ
        amqp.connect('amqp://localhost', (connectionErr, connection) => {
          if(connectionErr) throw connectionErr
          connection.createChannel((channelErr, channel) => {
            if(channelErr) throw channelErr
            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
          });
        });      
    } catch (error) {
        console.error('Error sending message:', error);
    }
  }

  // Api request data
  const apiRequestData = {
      url: `'http://localhost:8081/users/add/${user.region}'`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
  };

  sendApiRequest(`route_${user.region}`, apiRequestData);
})