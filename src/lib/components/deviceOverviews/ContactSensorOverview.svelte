<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import { getModalStore, type ModalSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/store/GeneralStore';
	import type ContactSensor from '$lib/api/devices/ContactSensor';

	export let device: ContactSensor;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		if (device.nodeId === data.nodeId) {
			device.state = data.state;
		}
	});

	$socketStore.on('connectionStatus', (data) => {
		if (device.nodeId === data.nodeId) {
			// TODO device.connected = data.connected;
		}
	});

	// Modal
	const modalStore = getModalStore();

	const detailsModalSettings: ModalSettings = {
		type: 'component',
		component: 'onOffPluginUnitDetails', // TODO
		meta: { device: device },
	};

	// UI events
	const openDetailsModal = (event: MouseEvent) => {
		if ((event.target as HTMLElement).localName === 'div') {
			return;
		}
		modalStore.trigger(detailsModalSettings);
	}
</script>

<button
	class="card flex items-center space-x-8 px-8 h-20 hover:cursor-pointer"
	on:click={openDetailsModal}
>
	<i class="fa-solid fa-satellite-dish"></i>
	<p class="text-left">{device.formattedVendorAndProduct}</p>
	{#if device.state}
<!--		<i class="fa-solid fa-check text-3xl text-green-500 ml-auto"></i>-->
		<i class="fa-solid fa-circle text-3xl text-green-500 ml-auto"></i>
	{:else}
<!--		<i class="fa-solid fa-times text-3xl text-red-500 ml-auto"></i>-->
		<i class="fa-regular fa-circle text-3xl text-red-500 ml-auto"></i>
	{/if}
</button>