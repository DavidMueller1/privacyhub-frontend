<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { ApiClient, apiClientStore } from '$lib/api/ApiClient';

	const modalStore = getModalStore();

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
		valueAttr: { type: 'text', minlength: 11, maxlength: 11, required: true },
	};

	const openModal = () => modalStore.trigger(codeModal);

	const addDevice = (pairingCode: string) => {
		console.log('Adding device with pairing code:', pairingCode);
		modalStore.trigger(loadingModal);

		ApiClient.commissionNodeBLEThread(pairingCode)
			.then((response) => {
				console.log('Device added:', response);
				modalStore.close();

				const confirmModal: ModalSettings = {
					type: 'alert',
					title: 'Device Added',
					body: 'The device has been successfully added to the network.',
					buttonTextCancel: 'Close',
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
					buttonTextCancel: 'Close',
				};
				modalStore.trigger(errorModal);
			});
	};

</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">Dashboard</h2>
		<p class="text-lg">No devices paired yet.</p>
	</div>
	<div class="fixed bottom-4 right-4">
		<button
			class="btn variant-filled-primary"
			on:click={openModal}
		>
			Add device
		</button>
	</div>
</div>