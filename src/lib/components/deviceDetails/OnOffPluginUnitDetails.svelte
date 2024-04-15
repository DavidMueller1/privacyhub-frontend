<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	const device: OnOffPluginUnit = $modalStore[0].meta.device;
	if (!device) throw new Error('Device is required for this modal.');


</script>

{#if $modalStore[0]}
	<div class="my-modal text-center card p-4 w-modal shadow-xl space-y-4 flex flex-col">
		<div class="flex flex-row items-center space-x-4">
			<button class="btn-icon variant-soft-tertiary"><i class="fa-solid fa-x"></i></button>
			<header class='text-2xl font-bold'><i class="fa-solid fa-plug mr-2"></i>{[device.vendor, device.product].filter(Boolean).join(' ')}
			</header>
		</div>
		<span class="flex justify-center">
			TEST
<!--			<button class="btn-icon {device.state ? 'variant-filled-primary' : 'variant-ghost'}"><i class="fa-solid fa-power-off"></i></button>-->
		</span>
	</div>
{/if}
