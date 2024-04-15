import DefaultOverview from '$lib/components/deviceOverviews/DefaultOverview.svelte';
import type { SvelteComponent } from 'svelte';

export default class BaseDevice {
	private _nodeId: string;
	private _endpointId: string;
	private _vendor: string | undefined;
	private _product: string | undefined;

	constructor(nodeId: string, endpointId: string, vendor: string | undefined, product: string | undefined) {
		this._nodeId = nodeId;
		this._endpointId = endpointId;
		this._vendor = vendor;
		this._product = product;
	}

	initialize = (): Promise<void> => {
		return new Promise<void>((resolve) => {
			resolve();
		});
	}

	getOverviewComponent: any = () => {
		return DefaultOverview;
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
}
