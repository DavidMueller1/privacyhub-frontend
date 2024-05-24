<script lang="ts">
	import { type ModalSettings } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/store/GeneralStore';
	import type ContactSensor from '$lib/api/devices/ContactSensor';
	import OverviewBase from '$lib/components/deviceOverviews/OverviewBase.svelte';

	export let device: ContactSensor;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		console.log('booleanState contact', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpoint) {
			device.state = data.state;
		}
	});

	// Modal
	const detailsModalSettings: ModalSettings = {
		type: 'component',
		component: 'contactSensorDetails',
		meta: { device: device },
	};
</script>

<OverviewBase
	device={device}
	detailsModalSettings={detailsModalSettings}
	icon="fa-satellite-dish"
>
	{#if device.state}
		<!--		<i class="fa-solid fa-check text-3xl text-green-500 ml-auto"></i>-->
		<i class="fa-solid fa-circle text-3xl text-green-500 ml-auto"></i>
	{:else}
		<!--		<i class="fa-solid fa-times text-3xl text-red-500 ml-auto"></i>-->
		<i class="fa-regular fa-circle text-3xl text-red-500 ml-auto"></i>
	{/if}
</OverviewBase>