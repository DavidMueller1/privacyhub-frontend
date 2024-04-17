<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import DeviceSelection from '$lib/components/DeviceSelection.svelte';
	import { type PopupSettings, popup } from '@skeletonlabs/skeleton';
	import type BaseDevice from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnitHistory from '$lib/components/deviceHistories/OnOffPluginUnitHistory.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let loadingDevices = true;
	let loadingData = true;

	interface Data {
		timestamp: number;
		value: boolean;
	}

	const generateRandomTimestampToday = () => {
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
		const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
		return startOfDay.getTime() + Math.random() * (endOfDay.getTime() - startOfDay.getTime());
	}

	// Some random testing data
	let data = [
		{ timestamp: generateRandomTimestampToday(), value: true },
		{ timestamp: generateRandomTimestampToday(), value: false },
		{ timestamp: generateRandomTimestampToday(), value: true },
		{ timestamp: generateRandomTimestampToday(), value: false },
		{ timestamp: generateRandomTimestampToday(), value: true },
		{ timestamp: generateRandomTimestampToday(), value: false },
		{ timestamp: generateRandomTimestampToday(), value: true },
		{ timestamp: generateRandomTimestampToday(), value: false },
		{ timestamp: generateRandomTimestampToday(), value: true },
		{ timestamp: generateRandomTimestampToday(), value: false },
	]
	data = data.sort((a, b) => a.timestamp - b.timestamp);

	let fixedData: Data[] = []
	data.forEach((entry, index) => {
		fixedData.push({ timestamp: entry.timestamp, value: entry.value });
		const next = data[index + 1];
		if (next) {
			fixedData.push({ timestamp: next.timestamp, value: entry.value });
		}
	});

	export let width = 640;
	export let height = 400;
	export let marginTop = 10;
	export let marginRight = 20;
	export let marginBottom = 30;
	export let marginLeft = 30;

	let gx;
	let gy;

	$: x = d3.scaleTime(d3.extent(fixedData.map(entry => entry.timestamp)), [marginLeft, width - marginRight]).nice();
	$: y = d3.scaleLinear(d3.extent(fixedData.map(entry => entry.value ? 1 : 0)), [height - marginBottom, marginTop]);
	$: d3.select(gx).call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M')));
	$: d3.select(gy).call(d3.axisLeft(y));
	// $: line = d3.line((d, i) => x(i), y);
	onMount(() => {
		// console.log(line);
	})

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom',
		closeQuery: '.close-popup'
	}

	let currentDevice: BaseDevice | undefined = undefined;

	const handleDeviceSelection = (event: CustomEvent<{ device: BaseDevice }>) => {
		currentDevice = event.detail.device;
		console.log(event.detail.device);
	}
</script>

<style>
    .chart :global(div) {
        font: 10px sans-serif;
        background-color: steelblue;
        text-align: right;
        padding: 3px;
        margin: 1px;
        color: white;
    }
</style>

<div class="container h-full mx-auto flex justify-center items-center">
	<DeviceSelection on:select={handleDeviceSelection} />
	<div class="space-y-10 text-center flex flex-col items-center">
		<button class="btn variant-ghost-tertiary" use:popup={popupClick}>
			{#if currentDevice}
				{[currentDevice?.vendor, currentDevice?.product].filter(Boolean).join(' ')}
			{:else}
				<LoadingSpinner classes="h-6 w-6" />
			{/if}
		</button>
		<h2 class="h2">History</h2>
		<svelte:component this={currentDevice?.getHistoryComponent()} device={currentDevice} />
	</div>
</div>

