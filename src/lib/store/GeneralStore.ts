import { writable, type Writable } from 'svelte/store';
import { Socket } from 'socket.io-client';

export const socketStore: Writable<Socket> = writable();

export enum ConnectionStatus {
	CONNECTED,
	DISCONNECTED
}
export const connectedStore: Writable<ConnectionStatus> = writable(ConnectionStatus.DISCONNECTED);