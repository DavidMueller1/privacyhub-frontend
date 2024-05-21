import BaseDevice, { ConnectionStatus, PrivacyState } from '$lib/api/devices/BaseDevice';
import ApiClient from '$lib/api/ApiClient';
import OnOffPluginUnitOverview from '$lib/components/deviceOverviews/OnOffPluginUnitOverview.svelte';
import BooleanHistory from '$lib/components/deviceHistories/BooleanHistory.svelte';

export interface IReturnOnOffPluginUnitState {
	connectionStatus: ConnectionStatus;
	onOffState: boolean;
	timestamp: number;
}

export default class OnOffPluginUnit extends BaseDevice {
	state: boolean;

	constructor(
		nodeId: string,
		endpointId: string,
		vendor: string | undefined,
		product: string | undefined,
		manualPairingCode: string,
		qrCode: string,
		connectionStatus: ConnectionStatus,
		privacyState: PrivacyState,
		connectedProxy: number
	) {
		super(
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
		this.state = false;
	}

	override initialize = (): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			ApiClient.getOnOff(this.nodeId, this.endpointId).then((state) => {
				this.state = state || false;
				resolve();
			}).catch((error) => {
				console.error('Error:', error);
				reject(error.toString());
			});
		});
	}

	override getHistory = (): Promise<IReturnOnOffPluginUnitState[]> => {
		return new Promise<IReturnOnOffPluginUnitState[]>((resolve, reject) => {
			ApiClient.getHistory<IReturnOnOffPluginUnitState>(this._nodeId, this._endpointId).then((data) => {
				resolve(data);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	override getOverviewComponent = () => {
		return OnOffPluginUnitOverview;
	}

	override getHistoryComponent = () => {
		return BooleanHistory;
	}
}