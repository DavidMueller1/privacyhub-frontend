<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import type BaseDevice from '$lib/api/devices/BaseDevice';
	import Fa from 'svelte-fa';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';

	export let device: OnOffPluginUnit;
</script>

<div class="card flex items-center space-x-8 px-8 h-20">
	<i class="fa-solid fa-plug"></i>
	<p>{[device.vendor, device.product].filter(Boolean).join(' ')}</p>
	<SlideToggle
		name={device.nodeId}
		checked={device.state}
		active="bg-primary-500"
		class="!ml-auto"
		on:change={() => {
			ApiClient.setOnOff(device.nodeId, !device.state)
				.then(() => {
					device.state = !device.state;
				})
				.catch((error) => {
					console.error('Error setting device enabled:', error);
				});
		}}
	/>
</div>