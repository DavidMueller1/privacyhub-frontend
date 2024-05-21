import { readable } from 'svelte/store';
import BaseDevice, { PrivacyState } from '$lib/api/devices/BaseDevice';
import OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
import ContactSensor from '$lib/api/devices/ContactSensor';

// export type DeviceOverview = {
// 	nodeId: string;
// 	vendor: string | undefined;
// 	product: string | undefined;
// 	state: boolean;
// };



export default abstract class ApiClient {
	private static readonly BACKEND_URL = 'http://192.168.178.21:8000';

	static commissionNodeBLEThread = (pairingCode: string): Promise<void> => {
		const payload = {
			pairingCode: pairingCode,
			threadNetworkName: 'OpenThread-7a82',
			threadNetworkOperationalDataset:
				'0e080000000000010000000300001635060004001fffe00208817262e4e69f05d30708fde8a979e6a3e2ad05105c9a9dcfd995fdb17372f7e6c67ffb9b030f4f70656e5468726561642d3761383201027a820410eba8b6f97ba68feacfb9ed8a8bcac55a0c0402a0f7f8'
		};

		return new Promise<void>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/pairing/ble-thread`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})
				// .then(response => response.json())
				.then((data) => {
					if (!data.ok) {
						reject(data.body);
					}
					console.log('Success:', data);
					resolve();
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	};

	static getNodes = (): Promise<BaseDevice[]> => {
		return new Promise<any>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes`)
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					return response.json();
				})
				.then((data) => {
					const nodes: BaseDevice[] = [];
					Promise.all(data.map((node: any) => {
						return new Promise<void>((resolve, reject) => {
							const nodeId: string = node.nodeId;
							const endpointId: string = node.endpointId;
							const vendor: string | undefined = node.vendor;
							const product: string | undefined = node.product;
							const type: string = node.type;
							const manualPairingCode: string = node.manualPairingCode;
							const qrCode: string = node.qrCode;
							const connectionStatus = node.connectionStatus;
							const privacyState = node.privacyState;
							const connectedProxy = node.connectedProxy;
							console.log("NODE");
							console.log(node);
							switch (type) {
								case 'OnOffPluginUnit': // TODO Better way to handle this
									const device = new OnOffPluginUnit(
										nodeId,
										endpointId,
										vendor,
										product,
										manualPairingCode,
										qrCode,
										connectionStatus,
										privacyState,
										connectedProxy
									);
									device.initialize().then(() => {
										nodes.push(device);
										resolve();
									});
									break;
								case 'ContactSensor':
									const contactSensor = new ContactSensor(
										nodeId,
										endpointId,
										vendor,
										product,
										manualPairingCode,
										qrCode,
										connectionStatus,
										privacyState,
										connectedProxy
									);
									contactSensor.initialize().then(() => {
										nodes.push(contactSensor);
										resolve();
									});
									break;
								default:
									console.warn(`Unknown node type: ${type}`);
									const unknownDevice = new BaseDevice(
										nodeId,
										endpointId,
										vendor,
										product,
										manualPairingCode,
										qrCode,
										connectionStatus,
										privacyState,
										connectedProxy
									);
									unknownDevice.initialize().then(() => {
										nodes.push(unknownDevice);
										resolve();
									});
									break;
							}
						});
					})).then(() => {
						nodes.sort((a, b) => {
							return a.nodeId.localeCompare(b.nodeId);
						});
						resolve(nodes);
					}).catch((error) => {
						console.error('Error:', error);
						reject(error.toString());
					});
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	};

	static setOnOff = (nodeId: string, endpointId: string, state: boolean): Promise<void> => {
		const payload = {
			state: state
		};

		return new Promise<void>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes/${nodeId}/${endpointId}/onOff`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					resolve();
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	};

	static getOnOff = (nodeId: string, endpointId: string): Promise<boolean | undefined> => {
		return new Promise<boolean | undefined>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes/${nodeId}/${endpointId}/onOff`)
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					return response.json();
				})
				.then((data) => {
					resolve(data.state);
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	}

	static updatePrivacyState = (nodeId: string, endpointId: string, privacyState: PrivacyState): Promise<void> => {
		const payload = {
			privacyState: privacyState
		};

		return new Promise<void>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes/${nodeId}/${endpointId}/privacyState`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					resolve();
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	}

	static updateConnectedProxy = (nodeId: string, endpointId: string, connectedProxy: number): Promise<void> => {
		const payload = {
			connectedProxy: connectedProxy
		};

		return new Promise<void>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes/${nodeId}/${endpointId}/connectedProxy`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					resolve();
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	}

	static getHistory<T>(nodeId: string, endpointId: string, from?: number, to?: number): Promise<T[]> {
		return new Promise<T[]>((resolve, reject) => {
			fetch(`${this.BACKEND_URL}/nodes/${nodeId}/${endpointId}/history?from=${from}&to=${to}`)
				.then((response) => {
					if (!response.ok) {
						reject(response.body);
					}
					return response.json();
				})
				.then((data) => {
					resolve(data as T[]);
				})
				.catch((error) => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	}
}
