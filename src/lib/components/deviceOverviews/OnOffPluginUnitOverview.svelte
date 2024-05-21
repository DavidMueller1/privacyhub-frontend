<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import type BaseDevice from '$lib/api/devices/BaseDevice';
	import Fa from 'svelte-fa';
	import { getModalStore, type ModalSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import { socketStore } from '$lib/store/GeneralStore';
	import OverviewIcon from '$lib/components/util/OverviewIcon.svelte';
	import OverviewBase from '$lib/components/deviceOverviews/OverviewBase.svelte';

	export let device: OnOffPluginUnit;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.state = data.state;
		}
	});

	// Modal
	const detailsModalSettings: ModalSettings = {
		type: 'component',
		component: 'onOffPluginUnitDetails',
		meta: { device: device },
	};

	// UI events
	const onOffStateChanged = () => {
		ApiClient.setOnOff(device.nodeId, device.endpointId, !device.state)
			.then(() => {
				device.state = !device.state;
			})
			.catch((error) => {
				console.error('Error setting device enabled:', error);
			});
	};
</script>

<OverviewBase
	device={device}
	detailsModalSettings={detailsModalSettings}
>
	<SlideToggle
		name={device.nodeId}
		checked={device.state}
		active="bg-primary-500"
		class="!ml-auto slide-toggle"
		on:click={(event) => event.stopPropagation()}
		on:change={onOffStateChanged}
	/>
</OverviewBase>