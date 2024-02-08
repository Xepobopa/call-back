import { nanoid } from 'nanoid'

const users = {}

export default function initSocket(socket) {
    let id

    const emit = (userId, event, data) => {
        const receiver = users[userId]
        if (receiver) {
            receiver.emit(event, data)
        }
    }

    socket
        .on('init', () => {
            id = nanoid(5)
            users[id] = socket
            console.log(id, 'connected')
            socket.emit('init', { id })
        })
        .on('connection', (data) => {
            emit(data.to, 'connection', {...data, from: id});
        })
        .on('sendMessage', (data) => {
            emit(data.to, 'sendMessage', {...data, from: id});
        })
        .on('call', (data) => {
            emit(data.to, 'call', {...data, from: id});
        })
        .on('finishConnection', (data) => {
            emit(data.to, 'finishConnection', {...data, from: id});
        })
        .on('request', (data) => {
            emit(data.to, 'request', { from: id })
        })
        .on('encryptionPayload', (data) => {
            emit(data.to, 'encryptionPayload', {...data, from: id })
        })
        .on('call', (data) => {
            emit(data.to, 'call', { ...data, from: id })
        })
        .on('end', (data) => {
            emit(data.to, 'end')
        })
        .on('send', (data) => {
            emit(data.to, 'send', { ...data, from: id });
        })
        .on('voiceCallStart', (data) => {
            emit(data.to, 'voiceCallStart', {...data, from: id})
        })
        .on('voiceCallReject', (data) => {
            emit(data.to, 'voiceCallReject', {...data, from: id})
        })
        .on('voiceCallSuccess', (data) => {
            emit(data.to, 'voiceCallSuccess', {...data, from: id})
        })
        .on('voiceCallEnd', (data) => {
            emit(data.to, 'voiceCallEnd', {...data, from: id})
        })
        .on('disconnect', () => {
            if (id) {
                console.log(id, 'disconnected');
                delete users[id];
            }
        })
}