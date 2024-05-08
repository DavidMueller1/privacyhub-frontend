<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import SvgQR from '@svelte-put/qr/svg/QR.svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import ApiClient from '$lib/api/ApiClient';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	let showQrCode = false;

	const modalStore = getModalStore();

	const device: OnOffPluginUnit = $modalStore[0].meta.device;
	if (!device) throw new Error('Device is required for this modal.');

	const onOffStateChanged = () => {
		ApiClient.setOnOff(device.nodeId, device.endpointId, !device.state)
			.then(() => {
				device.state = !device.state;
			})
			.catch((error) => {
				console.error('Error setting device enabled:', error);
			});
	};

	onMount(() => {
		console.log("MANUAL PAIRING CODE");
		console.log(device.manualPairingCode);
		console.log("QR CODE");
		console.log(device.qrCode);
	});
</script>

{#if $modalStore[0]}
	<div class="my-modal text-center card p-4 w-modal shadow-xl space-y-4 flex flex-col">
		<div class="flex flex-row items-center space-x-4">
			{#if showQrCode}
				<button
					class="btn-icon variant-ringed-tertiary"
					on:click={() => showQrCode = false}
				>
					<i class="fa-solid fa-arrow-left"></i>
				</button>
			{:else}
				<button
					class="btn-icon variant-ringed-tertiary"
					on:click={() => modalStore.close()}
				>
					<i class="fa-solid fa-x"></i>
				</button>
			{/if}
			<header class='text-2xl font-bold'><i class="fa-solid fa-plug mr-2"></i>{device.formattedVendorAndProduct}</header>
			{#if !showQrCode}
				<button
					class="btn-icon variant-ringed-tertiary !ml-auto"
					on:click={() => showQrCode = true}
				>
					<i class="fa-solid fa-qrcode"></i>
				</button>
			{/if}
		</div>
		{#if showQrCode}
			<span class="flex flex-col justify-center items-center min-h-40">
				<span class="text-lg mb-4">
					Scan this code to pair your device to a hub of your choice.
				</span>
				<SvgQR class="w-60" data={device.qrCode} />
				<span class="text-gray-600">{device.manualPairingCode}</span>
			</span>
		{:else}
			<span class="flex justify-center items-center min-h-40">
				<button
					class="btn-icon btn-icon-xxxl {device.state ? 'variant-filled-primary' : 'variant-ghost'}"
					on:click={onOffStateChanged}
				><i class="fa-solid fa-power-off"></i></button>
			</span>
		{/if}
	</div>
{/if}
