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
const onesignalConfig = OneSignal.createConfiguration({
    appKey: process.env['ONESIGNAL_REST_API_KEY'],
    userKey: process.env['ONESIGNAL_AUTH_KEY'],
  })

const client = new OneSignal.DefaultApi(onesignalConfig);

app.get('/sendPushNotification', async (req, res) => {
    console.log('SendPushNotification');
    const notification = new OneSignal.Notification();
    notification.app_id = process.env['ONESIGNAL_APP_ID'];
    notification.included_segments = ['Subscribed Users'];
    notification.contents = {
        en: "Hello OneSignal!"
    };
    const response = await client.createNotification(notification);
    if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(error => error.message).join(', ');
        console.error(`OneSignal API Error: ${errorMessages}`);
    } else {
        console.log(response);
    }
    res.send(200);
})

const io = new Server(server, { cors: { origin: '*'}, transports: ['websocket', 'polling'] } );
io.on('connection', initSocket)

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server ready on port ${port} 🚀`)
})