<script lang="ts">
	import {
		getModalStore,
		type ModalSettings,
		ProgressRadial,
		SlideToggle
	} from '@skeletonlabs/skeleton';
	import ApiClient, { type DeviceOverview } from '$lib/api/ApiClient';
	import { nodes } from '../../.svelte-kit/generated/client/app';
	import BaseDevice from '$lib/api/devices/BaseDevice';

	const modalStore = getModalStore();

	let isLoading = true;

	const codeModal: ModalSettings = {
		type: 'prompt',
		title: 'Enter Pairing Code',
		body: 'Provide the pairing code for the device you want to add and make sure it is powered on.',
		valueAttr: { type: 'text', minlength: 11, maxlength: 11, required: true },
		// Returns the updated response value
		response: (value: string) => {
			if (value) {
				addDevice(value);
			}
		}
	};

	const loadingModal: ModalSettings = {
		type: 'component',
		component: 'loading',
		title: 'Commissioning Device...',
		body: 'Attempting to pair device. This may take a moment.',
		backdropClasses: 'pointer-events-none',
		valueAttr: { type: 'text', minlength: 11, maxlength: 11, required: true }
	};

	const openModal = () => modalStore.trigger(codeModal);

	const addDevice = (pairingCode: string) => {
		console.log('Adding device with pairing code:', pairingCode);
		modalStore.trigger(loadingModal);

		ApiClient.commissionNodeBLEThread(pairingCode)
			.then(() => {
				console.log('Device added.');
				modalStore.close();
				getDeviceList();

				const confirmModal: ModalSettings = {
					type: 'alert',
					title: 'Device Added',
					body: 'The device has been successfully added to the network.',
					buttonTextCancel: 'Close'
				};
				modalStore.trigger(confirmModal);
			})
			.catch((error) => {
				console.error('Error adding device:', error);
				modalStore.close();

				const errorModal: ModalSettings = {
					type: 'alert',
					title: 'Error Adding Device',
					body: 'There was an error adding the device:<br>' + error,
					buttonTextCancel: 'Close'
				};
				modalStore.trigger(errorModal);
			});
	};

	let deviceList: BaseDevice[] = [];
	const numberOfTestDevices = 2;
	const getDeviceList = () => {
		isLoading = true;
		ApiClient.getNodes()
			.then((nodes) => {
				console.log('Nodes:', nodes);
				deviceList = nodes;
				if (deviceList.length < numberOfTestDevices) {
					for (let i = deviceList.length; i < numberOfTestDevices; i++) {
						deviceList.push(new BaseDevice(i.toString(), "Test", "Test"));
					}
				}
				isLoading = false;
			})
			.catch((error) => {
				console.error('Error getting nodes:', error);

				const errorModal: ModalSettings = {
					type: 'alert',
					title: 'Error Getting Devices',
					body: 'There was an error getting the device list:<br>' + error,
					buttonTextCancel: 'Close'
				};
				modalStore.trigger(errorModal);

				deviceList = [];
				isLoading = false;
			});
	};

	getDeviceList();

</script>


<div class="container h-full mx-auto flex justify-center items-center">
	{#if isLoading}
		<!--		<ProgressRadial width="w-28"  strokeLinecap="round" track="stroke-primary-50" meter="stroke-primary-500"/>-->
		<span class="flex justify-center">
			<svg
				class="animate-spin -ml-1 mr-3 h-12 w-12 text-sky-600"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</span>
	{:else}
		{#if deviceList.length > 0}
			<div class="w-full grid grid-cols-[repeat(auto-fit,_33.33333%)] gap-4 m-auto p-24 justify-center">
				{#each deviceList as device}
					<svelte:component this={device.getOverviewComponent()} device={device} />
				{/each}
			</div>
		{:else}
			<div class="space-y-10 text-center flex flex-col items-center">
				<h2 class="h2">Dashboard</h2>
				<p class="text-lg">No devices paired yet.</p>
			</div>
		{/if}
		<div class="fixed bottom-4 right-4">
			<button class="btn variant-filled-primary" on:click={openModal}> Add device </button>
		</div>
	{/if}
</div>

<!--<div class="card flex justify-center items-center space-x-8 p-4">
						<p>{[device.vendor, device.product].filter(Boolean).join(' ')}</p>
						<SlideToggle
							name={device.nodeId}
							checked={device.state}
							active="bg-primary-500"
							on:change={() => {
								ApiClient.setOnOff(device.nodeId, device.state)
									.then(() => {
										//device.enabled = !device.enabled;
									})
									.catch((error) => {
										console.error('Error setting device enabled:', error);
									});
							}}
						/>
					</div>-->