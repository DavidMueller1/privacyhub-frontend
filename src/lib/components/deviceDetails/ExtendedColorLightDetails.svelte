<script lang="ts">
	import { type SvelteComponent } from 'svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import ApiClient from '$lib/api/ApiClient';
	import DetailsBase from '$lib/components/deviceDetails/DetailsBase.svelte';
	import { socketStore } from '$lib/store/GeneralStore';
	import type { AccessLevel } from '$lib/util/EnvChecker';
	import VerticalRangeSlider from '$lib/components/util/VerticalRangeSlider.svelte';
	import type ExtendedColorLight from '$lib/api/devices/ExtendedColorLight';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	// Socket events
	$socketStore.on('booleanState', (data) => {
		console.log('booleanState Light', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.state = data.state;
		}
	});

	$socketStore.on('lightLevel', (data) => {
		console.log('lightLevel', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			device.value = data.value;
		}
	});

	const modalStore = getModalStore();

	const accessLevel: AccessLevel = $modalStore[0].meta.accessLevel;
	if (accessLevel === undefined) throw new Error('AccessLevel is required for this modal.');

	const device: ExtendedColorLight = $modalStore[0].meta.device;
	if (!device) throw new Error('Device is required for this modal.');

	const onOffStateChanged = () => {
		ApiClient.setOnOff(accessLevel, device.nodeId, device.endpointId, !device.state)
			.then(() => {
				// device.state = !device.state;
			})
			.catch((error) => {
				console.error('Error setting device enabled:', error.toString());
			});
	};
	const onLightLevelChanged = (value: number) => {
		ApiClient.setLightLevel(accessLevel, device.nodeId, device.endpointId, value)
			.then(() => {
				device.value = value;
			})
			.catch((error) => {
				console.error('Error setting device enabled:', error.toString());
			});
	};
</script>

<DetailsBase device={device} accessLevel={accessLevel} icon="fa-lightbulb">
	<span class="flex flex-col justify-center items-center space-y-4">
		<VerticalRangeSlider
			classString=""
			width={80}
			height={250}
			minValue={0}
			maxValue={254}
			currentValue={device.value}
			color="#F1B74BFF"
			onValueChange={onLightLevelChanged}
		/>
		<button
			class="btn-icon btn-icon-xl {device.state ? 'variant-filled-primary' : 'variant-ghost'}"
			on:click={onOffStateChanged}
		><i class="fa-solid fa-power-off"></i></button>
	</span>
</DetailsBase>