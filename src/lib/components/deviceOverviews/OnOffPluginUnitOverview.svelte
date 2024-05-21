<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import type BaseDevice from '$lib/api/devices/BaseDevice';
	import Fa from 'svelte-fa';
	import { getModalStore, type ModalSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import { socketStore } from '$lib/store/GeneralStore';

	export let device: OnOffPluginUnit;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.state = data.state;
		}
	});

	$socketStore.on('connectionStatus', (data) => {
		console.log('connectionStatus', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.connectionStatus = data.connectionStatus;
		}
	});

	$socketStore.on('privacyState', (data) => {
		console.log('privacyState', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.privacyState = data.privacyState;
		}
	});

	// Modal
	const modalStore = getModalStore();

	const detailsModalSettings: ModalSettings = {
		type: 'component',
		component: 'onOffPluginUnitDetails',
		meta: { device: device },
	};

	// State Popup
	const popupState: PopupSettings = {
		event: 'hover',
		target: 'popupState',
		placement: 'top'
	};

	// UI events
	const openDetailsModal = (event: MouseEvent) => {
		if ((event.target as HTMLElement).localName === 'div') {
			return;
		}
		modalStore.trigger(detailsModalSettings);
	}

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

<button
	class="card flex items-center space-x-8 px-8 h-20 hover:cursor-pointer"
	on:click={openDetailsModal}
>
	<i class="fa-solid fa-plug"></i>
	<p>{device.formattedVendorAndProduct}</p>
	<SlideToggle
		name={device.nodeId}
		checked={device.state}
		active="bg-primary-500"
		class="!ml-auto slide-toggle"
		on:click={(event) => event.stopPropagation()}
		on:change={onOffStateChanged}
	/>
</button>