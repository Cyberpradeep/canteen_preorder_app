import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); // same as your backend

export default socket;

