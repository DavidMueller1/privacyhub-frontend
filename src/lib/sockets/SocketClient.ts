import { io } from 'socket.io-client';
import { connectedStore, HubConnectionStatus, socketStore } from '$lib/store/GeneralStore';
import { get } from 'svelte/store';

const BACKEND_URL = 'http://192.168.178.21:8000';
export const connectSocket = () => {
	if (get(socketStore) !== undefined) {
		console.log('Socket already connected');
		return;
	}
	const socket = io(BACKEND_URL);

	socket.on('connect', () => {
		console.log('Connected to socket');
		connectedStore.set(HubConnectionStatus.CONNECTED);
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from socket');
		connectedStore.set(HubConnectionStatus.DISCONNECTED);
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