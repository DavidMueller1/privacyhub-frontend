import { writable, type Writable } from 'svelte/store';
import { Socket } from 'socket.io-client';

export const socketStore: Writable<Socket> = writable();

export enum ConnectionStatus {
	DISCONNECTED,
	CONNECTING,
	CONNECTED
}
export const connectedStore: Writable<ConnectionStatus> = writable(ConnectionStatus.DISCONNECTED);