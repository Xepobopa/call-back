// Using WebSockets on Heroku with Node.js
// heroku features:enable http-session-affinity -a react-webrtc-call
import express from 'express'
import { createServer } from 'http'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import initSocket from './util/initSocket.js'
import cors from 'cors';
import * as dotenv from 'dotenv';
import request from 'request';
dotenv.config();
import OneSignal from '@onesignal/node-onesignal';

const __dirname = dirname(fileURLToPath(import.meta.url))

const options = [
    cors({
        origin: '*',
        methods: '*',
        allowedHeaders: '*',
        credentials: true,
    })
];

const app = express();
app.use(options);
const server = createServer(app);

app.use(express.static(join(__dirname, '../client/dist')))

app.get('/', (req, res) => {
   res.send('Hello from server!');
});

// OneSignal
// See our Server SDKs for more details:
// https://github.com/OneSignal/onesignal-node-api


// const onesignalConfig = OneSignal.createConfiguration({
//     userKey: ,
//     appKey: process.env['ONESIGNAL_AUTH_KEY'],
//   })

// const client = new OneSignal.DefaultApi(onesignalConfig);

// const users = [];

app.get('/sendPushNotification', async (req, res) => {
    console.log('SendPushNotification');

    // if (!req.external_id) {
    //     res.status(404).send('Provide external_id!');
    //     return;
    // }

    // if (!req.userAppId) {
    //     res.status(404).send('Provide userAppId!');
    //     return;
    // }

    // users[req.userAppId] = req.external_id;

    var options = {
        json: true,
        'method': 'POST',
        'url': 'https://onesignal.com/api/v1/notifications',
        'headers': {
          'Authorization': "Basic ZjQyOTdjODYtMWQ0ZC00NWY2LTlmNmQtOTViMjY1YTdmNjMz",
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        "body": {
        //   "include_aliases": "All",
          "target_channel": "push",
          "isAnyWeb": true,
          "contents": {"en": "You've successfully received a deposit"},
          "headings": {"en": "You've received"},
          "name": "Notification",
          "app_id": "e5fb645e-3948-4d1b-86bb-d629c2368e00"
        }
        
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });

    // const notification = new OneSignal.Notification();
    // notification.app_id = process.env['ONESIGNAL_APP_ID'];
    // notification.contents = {
    //     en: "Hello OneSignal!"
    // };
    // const response = await client.createNotification(notification);
    // if (response.errors && response.errors.length > 0) {
    //     const errorMessages = response.errors.map(error => error.message).join(', ');
    //     console.error(`OneSignal API Error: ${errorMessages}`);
    // } else {
    //     console.log(response);
    // }
    res.sendStatus(200);
})

const io = new Server(server, { cors: { origin: '*'}, transports: ['websocket', 'polling'] } );
io.on('connection', initSocket)

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server ready on port ${port} 🚀`)
})