import BaseDevice from '$lib/api/devices/BaseDevice';
import ApiClient from '$lib/api/ApiClient';
import { ConnectionStatus } from '$lib/store/GeneralStore';
import ContactSensorOverview from '$lib/components/deviceOverviews/ContactSensorOverview.svelte';
import BooleanHistory from '$lib/components/deviceHistories/BooleanHistory.svelte';

export interface IReturnContactSensorState {
	connectionStatus: ConnectionStatus;
	booleanState: boolean;
	timestamp: number;
}

export default class ContactSensor extends BaseDevice {
	state: boolean;

	constructor(nodeId: string, endpointId: string, vendor: string | undefined, product: string | undefined) {
		super(nodeId, endpointId, vendor, product);
		this.state = false;
	}

	// override initialize = (): Promise<void> => {
	// 	return new Promise<void>((resolve, reject) => {
	// 		ApiClient.getOnOff(this.nodeId, this.endpointId).then((state) => {
	// 			this.state = state || false;
	// 			resolve();
	// 		}).catch((error) => {
	// 			console.error('Error:', error);
	// 			reject(error.toString());
	// 		});
	// 	});
	// }

	override getHistory = (): Promise<IReturnContactSensorState[]> => {
		return new Promise<IReturnContactSensorState[]>((resolve, reject) => {
			ApiClient.getHistory<IReturnContactSensorState>(this._nodeId, this._endpointId).then((data) => {
				resolve(data);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	override getOverviewComponent = () => {
		return ContactSensorOverview;
	}

	override getHistoryComponent = () => {
		return BooleanHistory;
	}
}