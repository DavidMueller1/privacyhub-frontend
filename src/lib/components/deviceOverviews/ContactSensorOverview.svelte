<script lang="ts">
	import { getModalStore, type ModalSettings, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/store/GeneralStore';
	import type ContactSensor from '$lib/api/devices/ContactSensor';
	import { ConnectionStatus, PrivacyState } from '$lib/api/devices/BaseDevice';
	import OverviewIcon from '$lib/components/util/OverviewIcon.svelte';

	export let device: ContactSensor;

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
		component: 'onOffPluginUnitDetails', // TODO
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
</script>

<div class="card p-4 variant-filled-primary" data-popup="popupState">
	<div class="flex flex-col">
		<div class="flex flex-row">
			<div>Test 1</div>
			<div>Test 2</div>
		</div>
	</div>
	<div class="arrow variant-filled-primary" />
</div>
<button
	class="card flex items-center space-x-8 px-8 h-20 hover:cursor-pointer"
	on:click={openDetailsModal}
>
	<OverviewIcon icon="fa-satellite-dish" connectionStatus={device.connectionStatus} privacyState={device.privacyState} popupSettings={popupState} />
<!--	<i class="fa-solid fa-satellite-dish {stateIconColor}" use:popup={popupState}></i>-->
	<p class="text-left">{device.formattedVendorAndProduct}</p>
	{#if device.state}
<!--		<i class="fa-solid fa-check text-3xl text-green-500 ml-auto"></i>-->
		<i class="fa-solid fa-circle text-3xl text-green-500 ml-auto"></i>
	{:else}
<!--		<i class="fa-solid fa-times text-3xl text-red-500 ml-auto"></i>-->
		<i class="fa-regular fa-circle text-3xl text-red-500 ml-auto"></i>
	{/if}
</button>