import BaseDevice from '$lib/api/devices/BaseDevice';
import ApiClient from '$lib/api/ApiClient';
import DefaultOverview from '$lib/components/deviceOverviews/DefaultOverview.svelte';
import OnOffPluginUnitOverview from '$lib/components/deviceOverviews/OnOffPluginUnitOverview.svelte';
import { socketStore } from '$lib/store/GeneralStore';

export default class OnOffPluginUnit extends BaseDevice {
	state: boolean;

	constructor(nodeId: string, endpointId: string, vendor: string | undefined, product: string | undefined) {
		super(nodeId, endpointId, vendor, product);
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

	override getOverviewComponent = () => {
		return OnOffPluginUnitOverview;
	}
}