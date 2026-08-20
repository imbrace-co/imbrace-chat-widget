/* eslint-disable no-unused-vars */
import io from 'socket.io-client';
import Peer from 'simple-peer';

import { SOCKET_ENDPOINT } from '../api/config';

import { isNull, isNullString } from './string';

import { tokenTypes } from '../constants/token';

let onReceiveMessageCallback;
let onJoinedConversationCallback;
let socket;
let xToken;
let organizationId;

// For WebRTC
let localStream;
let incomingStream;
let connections = [];
let initPeerRequest = false;
let roomReady = false;
let debug = false;
let newData = null;
let callback = null;
let streamCallback = null;


export function initWebSocket(channelId, targetOnReceiveMessageCallback, targetOnJoinedConversationCallback) {
    console.log('initWebSocket', channelId, {socket});
    onReceiveMessageCallback = targetOnReceiveMessageCallback;
    onJoinedConversationCallback = targetOnJoinedConversationCallback;

    if (!socket) {
        startSocketIO(channelId);
    } else {
        socket.disconnect();
        socket.close();
        socket.io.disconnect();
        socket = null;
        xToken = null;
        organizationId = null;
        startSocketIO(channelId);
    }
}

function startSocketIO(channelId) {
    const channelInfo = JSON.parse(window.localStorage.getItem(channelId) || '{}');
    // Always recompute from the latest localStorage — never reuse a value left in
    // the module-level xToken by a previous connect (that could be a stale/ghost
    // token that no longer maps to a contact → socket joins no room → no realtime).
    xToken = null;
    // channel-service resolves the widget socket by auth.token:
    //   con_*  → contactRepository.findById   (stable contact id — preferred)
    //   acc_*  → contactRepository.findByAccessToken
    // Prefer the stable contact_id: the access_token can drift out of sync with the
    // DB (an old session's acc_ token lingers in localStorage after the contact is
    // re-registered), and the widget socket authing with that ghost token resolves
    // to no contact, so it never joins its conversation room and only sees replies
    // after a reload. contact_id (con_*) is the immutable id and always resolves.
    if (!isNullString(channelInfo.contact_id)) {
        xToken = channelInfo.contact_id;
    } else if (!isNullString(channelInfo.access_token)) {
        xToken = channelInfo.access_token;
    } else if (!isNullString(channelInfo.token)) {
        xToken = channelInfo.token;
    }

    if (!isNullString(channelInfo.organization_id)) {
        organizationId = channelInfo.organization_id;
    }

    if (!isNull(xToken)) {
        const opt = {
            transports: ['websocket'],
            path: '/ws',
            query: {},
            auth: {
                token: xToken,
            },
            reconnection: true,
        };

        const socketUrl = `${SOCKET_ENDPOINT()}/${organizationId}`;
        // console.log('socketUrl =', socketUrl);

        socket = io(socketUrl, opt);
        // console.log('socket =', socket);

        socket.on('conversation.message_created', (message) => {
            onReceiveMessageCallback({ id: new Date().getTime(), ...message });
        });

        socket.on('conversation.joined', (payload) => {
            onJoinedConversationCallback(payload);
        });

        return socket;
    }

    return socket;
}

function startSocketCommunication() {
    //console.log('startSocketCommunication');
    // socket.emit('room.join', { room_id: 'room_imbrace_testing' });
    // socket.emit('room.init_peer', { room_id: 'room_imbrace_testing' });
    // socket.emit('room.signaling', { room_id: 'room_imbrace_testing' });
    if (initPeerRequest) {
        initPeerClient();
    }
    // add host connection
}

function handleHostConnection(room) {
    logConnection(room, true, true, false);
    if (initPeerRequest) {
        initPeerClient();
    }
}

function handleCustomerConnection(room) {
    roomReady = true;
    logConnection(room, false, true, false);
    if (initPeerRequest) {
        initPeerClient();
    }
}

function logConnection(_room, _initiator, _roomReady, _peerStarted) {
    const newConnection = {
        room: _room, // socket.io server room
        initiator: _initiator, // client initiates the communication
        roomReady: _roomReady, // socket.io room is created or joined
        peerStarted: _peerStarted, // the peer connection is started
    };

    connections.push(newConnection);
}

function handleInitPeer(room) {
    const connection = findConnection(room);
    attemptPeerStart(connection);
}

function handleSendSignal(message) {
    console.log('handleSendSignal', message);
    let connection = findConnection(message.room_id);
    console.log('connection.peer', !connection.peer, connection);
    try {
        if (connection && !connection.peer) {
            createPeerConnection(connection);
            connection.peer.signal(message.data);
        } else {
            connection.peer.signal(message.data);
        }
    } catch (e) {
        console.log('handleSendSignal e=', e);
    }
}

function findConnection(roomId) {
    console.log('findConnection', roomId, connections);
    let connection = null;

    for (let i = 0; i < connections.length; i++) {
        if (connections[i].room.room_id === roomId) {
            connection = connections[i];
        }
    }

    if (connection === null) {
        console.log('UT OH THAT CONNECTION DOESNT EXIST');
    } else {
        console.log('found the connection for room: ' + roomId);
    }

    return connection;
}

// This client receives a message
function handleMessage(message) {
    console.log('handleMessage', message);
}

function initSocketClient(stream) {
    console.log('initSocketClient', stream);
    if (!isNull(stream)) {
        console.log('init stream', stream);
        localStream = stream; // put stream in global
    }
    socket.on('room.signaling', (message) => handleSendSignal(message));
    socket.on('room.message', (message) => handleMessage(message));

    startSocketCommunication();
}

function sendSignal(data, connection) {
    console.log('sendSignal', data, connection);
    const message = {
        room_id: connection.room.room_id,
        data: JSON.stringify(data),
        // data: data,
    };
    socket.emit('room.signaling', message);
}

function handleConnection(data, peer) {
    console.log('SIMPLE PEER IS CONNECTED');
    console.log('SIMPLE PEER IS CONNECTED data =', data);
    if (localStream) {
        peer.addStream(localStream);
    }
}

function handleStream(stream) {
    console.log('handleStream', stream);
    incomingStream = stream;
    if (streamCallback) {
        streamCallback(stream);
    }
}

function handleError(err) {
    console.log('handleError', err);
}

function handleData(data) {
    const decodedString = new TextDecoder('utf-8').decode(data);
    const decodedJSON = JSON.parse(decodedString);
    newData = decodedJSON;
    if (callback) {
        callback(newData);
    }
}

function terminateSession() {
    for (let i = 0; i < connections.length; i++) {
        const peer = connections[i].peer;
        peer.destroy(); // simple-peer method to close and cleanup peer connection
        connections[i].peer = null;
        connections[i].peerStarted = false;
    }

    // TO DO destroy socket and associated rooms
    // socket.emit('hangup');
}

function handleClose(data) {
    console.log('handleClose =', data);
}

function createPeerConnection(connection) {
    console.log('createPeerConnection', connection);
    let peer;

    if (typeof localStream === 'undefined') {
        console.log('create peer');
        peer = new Peer({
            initiator: connection.initiator,
        });
    } else {
        console.log('create peer with stream', localStream);
        peer = new Peer({
            initiator: connection.initiator,
            stream: localStream,
        });
    }
    peer.on('signal', (data) => sendSignal(data, connection));
    peer.on('connect', (data) => handleConnection(data, peer));
    peer.on('error', (err) => handleError(err));
    peer.on('stream', (stream) => handleStream(stream));
    peer.on('data', (data) => handleData(data));
    peer.on('close', (data) => handleClose(data));

    connection.peerStarted = true;
    connection.peer = peer;
    console.log('createPeerConnection done', connection);
}

function isPeerStarted() {
    let peerStarted = false;

    // if any peer connection is not started then it returns false
    for (let i = 0; i < connections.length; i++) {
        peerStarted = connections[i].peerStarted;
    }
    return peerStarted;
}

function sendData(data) {
    // already connected
    if (!!socket) {
        console.log(data);
        let msg = JSON.stringify({ data: data, userId: socket.id });
        console.log(connections);
        for (let i = 0; i < connections.length; i++) {
            const peer = connections[i];
            if (peer.peerStarted) {
                const peerConn = peer.peer;
                console.log(peerConn.connected);
                if (peerConn.connected) {
                    peerConn.write(msg);
                }
            }
        }
    }
}

function getData() {
    if (newData !== null) {
        return newData;
    } else {
        return null;
    }
}

function getStream() {
    if (incomingStream !== null) {
        return incomingStream;
    } else {
        return null;
    }
}

window.onbeforeunload = () => {
    terminateSession();
};

function attemptPeerStart(connection) {
    console.log('attemptPeerStart =', connection);

    if (!connection.peerStarted && connection.roomReady) {
        createPeerConnection(connection);
    }
}

function initPeerClient() {
    initPeerRequest = true;
    console.log('initPeerClient =', connections);
    for (let i = 0; i < connections.length; i++) {
        socket.emit('initiate peer', connections[i].room.room_id);
        if (connections[i].initiator) {
            attemptPeerStart(connections[i]);
        }
    }
}

function setDebug(_debug) {
    debug = _debug;
}

function setCallback(cb) {
    callback = cb;
}

function setStreamCallback(cb) {
    streamCallback = cb;
}

function attachStream(stream) {
    console.log(connections);
    if (!!connections.length) {
        connections[0].peer.addStream(stream);
    }
}
