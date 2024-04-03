import { io } from 'socket.io-client';
import { connectedStore, ConnectionStatus, socketStore } from '$lib/store/GeneralStore';
import { get } from 'svelte/store';

const BACKEND_URL = 'http://192.168.178.65:8000';
export const connectSocket = () => {
	if (get(socketStore) !== undefined) {
		return;
	}
	const socket = io(BACKEND_URL);

	socket.on('connect', () => {
		console.log('Connected to socket');
		connectedStore.set(ConnectionStatus.CONNECTED);
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from socket');
		connectedStore.set(ConnectionStatus.DISCONNECTED);
	});

	socket.on('error', (error) => {
		console.error('Socket error:', error);
	});

	socket.on('data', (data) => {
		console.log('Received data:', data);
	});

	// socket.on('onOffState', (data) => {
	// 	console.log('Received onOffState:');
	// 	console.log(data);
	// });

	socketStore.set(socket);
}