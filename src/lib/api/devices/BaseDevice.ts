import DefaultOverview from '$lib/components/deviceOverviews/DefaultOverview.svelte';
import type { SvelteComponent } from 'svelte';
import BaseDeviceHistory from '$lib/components/deviceHistories/BaseDeviceHistory.svelte';
import { ConnectionStatus } from '$lib/store/GeneralStore';
import ApiClient from '$lib/api/ApiClient';

export interface IReturnBaseDeviceState {
	connectionStatus: ConnectionStatus;
	timestamp: number;
}

export default class BaseDevice {
	protected _nodeId: string;
	protected _endpointId: string;
	protected _vendor: string | undefined;
	protected _product: string | undefined;
	protected _manualPairingCode: string;
	protected _qrCode: string;

	constructor(
		nodeId: string,
		endpointId: string,
		vendor: string | undefined,
		product: string | undefined,
		manualPairingCode: string,
		qrCode: string
	) {
		this._nodeId = nodeId;
		this._endpointId = endpointId;
		this._vendor = vendor;
		this._product = product;
		this._manualPairingCode = manualPairingCode;
		this._qrCode = qrCode;
	}

	initialize = (): Promise<void> => {
		return new Promise<void>((resolve) => {
			resolve();
		});
	}

	getHistory = (): Promise<IReturnBaseDeviceState[]> => {
		return new Promise<IReturnBaseDeviceState[]>((resolve, reject) => {
			ApiClient.getHistory<IReturnBaseDeviceState>(this._nodeId, this._endpointId).then((data) => {
				resolve(data);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	getOverviewComponent: any = () => {
		return DefaultOverview;
	}

	getHistoryComponent: any = () => {
		return BaseDeviceHistory;
	}

	get nodeId(): string {
		return this._nodeId;
	}

	get endpointId(): string {
		return this._endpointId;
	}

	get vendor() {
		return this._vendor;
	}

	get product() {
		return this._product;
	}

	get manualPairingCode(): string {
		return this._manualPairingCode;
	}

	get qrCode(): string {
		return this._qrCode;
	}

	get formattedVendorAndProduct(): string {
		if (!this._vendor && !this._product) return 'Unknown device';
		return [this._vendor, this._product].filter(Boolean).join(' - ')
	}
}
