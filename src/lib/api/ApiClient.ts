import { readable } from 'svelte/store';


export abstract class ApiClient {
	private static readonly BACKEND_URL = "http://192.168.178.65:8000";

	static commissionNodeBLEThread = (pairingCode:string): Promise<void> => {
		const payload = {
			pairingCode: pairingCode,
			threadNetworkName: "OpenThread-7a82",
			threadNetworkOperationalDataset: "0e080000000000010000000300001635060004001fffe00208817262e4e69f05d30708fde8a979e6a3e2ad05105c9a9dcfd995fdb17372f7e6c67ffb9b030f4f70656e5468726561642d3761383201027a820410eba8b6f97ba68feacfb9ed8a8bcac55a0c0402a0f7f8"
		}

		return new Promise<void>((resolve, reject) => {
			fetch( `${this.BACKEND_URL}/pairing/ble-thread`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})
				// .then(response => response.json())
				.then(data => {
					if (!data.ok) {
						reject(data.body);
					}
					console.log('Success:', data);
					resolve();
				})
				.catch(error => {
					console.error('Error:', error);
					reject(error.toString());
				});
		});
	}

		// constructor(privacyhubNode: PrivacyhubNode) {
		// 		this.privacyhubNode = privacyhubNode;
		// 		this.logger = Logger.get("ApiClient");
		// }
		//
		// async getDeviceList(req: Request, res: Response) {
		// 		this.logger.info("getDeviceList called");
		// 		const devices = await this.privacyhubNode.matterServer.getDeviceList();
		// 		res.json(devices);
		// }
		//
		// async getDevice(req: Request, res: Response) {
		// 		this.logger.info("getDevice called");
		// 		const deviceId = req.params.deviceId;
		// 		const device = await this.privacyhubNode.matterServer.getDevice(deviceId);
		// 		res.json(device);
		// }
		//
		// async getDeviceEndpoint(req: Request, res: Response) {
		// 		this.logger.info("getDeviceEndpoint called");
		// 		const deviceId = req.params.deviceId;
		// 		const endpointId = req.params.endpointId;
		// 		const endpoint = await this.privacyhubNode.matterServer.getDeviceEndpoint(deviceId, endpointId);
		// 		res.json(endpoint);
		// }
		//
		// async getDeviceEndpointClusters(req: Request, res: Response) {
		// 		this.logger.info("getDeviceEndpointClusters called");
		// 		const deviceId = req.params.deviceId;
		// 		const endpointId = req.params.endpointId;
		// 		const clusters = await this.privacyhubNode.matterServer.getDeviceEndpointClusters(deviceId, endpointId);
		// 		res.json(clusters);
		// }
		//
		// async getDeviceEndpointClusterAttributes(req: Request, res: Response) {
		// 		this.logger.info("getDeviceEndpointClusterAttributes called");
		// 		const deviceId = req.params.deviceId;
		// 		const endpointId = req.params.endpointId;
		// 		const clusterId = req.params.clusterId;
		// 		const attributes = await this.privacyhubNode.matterServer.getDeviceEndpointClusterAttributes(deviceId, endpointId, clusterId);
		// 		res.json(attributes);
		// }
		//
		// async getDeviceEndpointClusterCommands(req: Request, res: Response) {
		// 		this.logger.info("getDeviceEndpointClusterCommands called");
		// 		const deviceId = req.params.deviceId;
		// 		const endpointId = req.params.endpointId;
		// 		const clusterId = req.params.clusterId;
		// 		const commands = await this.privacyhubNode.matterServer.getDeviceEndpointClusterCommands(deviceId, endpointId, clusterId);
		// 		res.json(commands);
		// }
		//
		// async getDeviceEndpointClusterCommand(req: Request, res
}

export const apiClientStore = readable(new ApiClient());