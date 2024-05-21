<script lang="ts">
	import { getModalStore, type ModalSettings, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/store/GeneralStore';
	import type ContactSensor from '$lib/api/devices/ContactSensor';
	import BaseDevice, { ConnectionStatus, PrivacyState } from '$lib/api/devices/BaseDevice';
	import OverviewIcon from '$lib/components/util/OverviewIcon.svelte';

	export let device: BaseDevice;
	export let detailsModalSettings: ModalSettings;

	let connectionString = '';

	// Socket events
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

	const updateStateVisuals = (privacyState: PrivacyState, connectionStatus: ConnectionStatus) => {
		if (connectionStatus === ConnectionStatus.DISCONNECTED) {
			connectionString = 'DISCONNECTED';
		} else {
			switch (privacyState) {
				case PrivacyState.LOCAL:
					connectionString = 'LOCAL';
					break;
				case PrivacyState.THIRD_PARTY:
					connectionString = 'THIRD PARTY';
					break;
				default:
					connectionString = 'UNKNOWN';
					break;
			}
		}
	}
	$: updateStateVisuals(device.privacyState, device.connectionStatus);
</script>

<div class="card p-2 variant-filled-surface w-40" data-popup="popupState">
	<div class="flex flex-col items-center space-y-4">
		<div class="flex flex-col items-center">
			<div>State</div>
			<div class="font-bold text-xl">{connectionString}</div>
		</div>
	</div>
	<div class="arrow variant-filled-surface" />
</div>
<button
	class="card flex items-center space-x-8 px-8 h-20 hover:cursor-pointer"
	on:click={openDetailsModal}
>
	<OverviewIcon icon="fa-satellite-dish" connectionStatus={device.connectionStatus} privacyState={device.privacyState} popupSettings={popupState} />
	<!--	<i class="fa-solid fa-satellite-dish {stateIconColor}" use:popup={popupState}></i>-->
	<p class="text-left">{device.formattedVendorAndProduct}</p>
	<slot/>
</button>