<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import { type ModalSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/store/GeneralStore';
	import OverviewBase from '$lib/components/deviceOverviews/OverviewBase.svelte';
	import type { AccessLevel } from '$lib/util/EnvChecker';
	import type ExtendedColorLight from '$lib/api/devices/ExtendedColorLight';

	export let device: ExtendedColorLight;
	export let accessLevel: AccessLevel;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		console.log('booleanState Plug', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.state = data.state;
		}
	});

	// Modal
	const detailsModalSettings: ModalSettings = {
		type: 'component',
		component: 'extendedColorLightDetails',
		meta: { device: device, accessLevel: accessLevel },
	};

	// UI events
	const onOffStateChanged = () => {
		console.log('======device.state', device.state);
		ApiClient.setOnOff(accessLevel, device.nodeId, device.endpointId, device.state)
			.then(() => {
				// device.state = deviceState;
			})
			.catch((error) => {
				console.error('Error setting device enabled:', error.toString());
			});
	};
</script>

<OverviewBase
	device={device}
	detailsModalSettings={detailsModalSettings}
	icon="fa-lightbulb"
>
	<SlideToggle
		name={device.nodeId}
		bind:checked={device.state}
		active="bg-primary-500"
		class="!ml-auto slide-toggle"
		on:click={(event) => event.stopPropagation()}
		on:change={onOffStateChanged}
	/>
</OverviewBase>