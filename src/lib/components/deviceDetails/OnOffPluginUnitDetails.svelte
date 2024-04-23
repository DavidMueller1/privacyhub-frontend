<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import ApiClient from '$lib/api/ApiClient';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

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
</script>

{#if $modalStore[0]}
	<div class="my-modal text-center card p-4 w-modal shadow-xl space-y-4 flex flex-col">
		<div class="flex flex-row items-center space-x-4">
			<button
				class="btn-icon variant-soft-tertiary"
				on:click={() => modalStore.close()}
			><i class="fa-solid fa-x"></i></button>
			<header class='text-2xl font-bold'><i class="fa-solid fa-plug mr-2"></i>{device.formattedVendorAndProduct}</header>
		</div>
		<span class="flex justify-center items-center min-h-40">
			<button
				class="btn-icon btn-icon-xxxl {device.state ? 'variant-filled-primary' : 'variant-ghost'}"
				on:click={onOffStateChanged}
			><i class="fa-solid fa-power-off"></i></button>
		</span>
	</div>
{/if}
