<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import DeviceSelection from '$lib/components/DeviceSelection.svelte';
	import { type PopupSettings, popup } from '@skeletonlabs/skeleton';
	import BaseDevice, { PrivacyState } from '$lib/api/devices/BaseDevice';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DateTimeInput from '$lib/components/util/DateTimeInput.svelte';
	import TopAxis from '$lib/components/deviceHistories/common/TopAxis.svelte';
	import { AccessLevel } from '$lib/util/EnvChecker';
	import Spacer from '$lib/components/deviceHistories/common/Spacer.svelte';
	import AttributeHistory from '$lib/components/deviceHistories/AttributeHistory.svelte';
	import type { HistoryAttributeMapping } from '$lib/components/deviceHistories/HistoryUtils';

	export let data: PageData;

	let containerBinding: HTMLElement;
	const containerPadding = 40;
	let containerWidth = 0;

	const graphMarginLeft = 20;
	const graphMarginRight = 60;


	const handleResize = () => {
		containerWidth = containerBinding.clientWidth - containerPadding * 2;
		console.log(`Resized to ${containerWidth}`);
	}

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom',
		closeQuery: '.close-popup'
	}

	let currentDevice: BaseDevice | undefined = undefined;

	const handleDeviceSelection = (event: CustomEvent<{ device: BaseDevice }>) => {
		currentDevice = event.detail.device;
	}

	let historyComponent = null;

	$: historyComponent = currentDevice?.getHistoryComponent()

	let startDate = new Date();
	let endDate = new Date();

	let timestampStart = 0;
	let timestampEnd = 0;

	$: {
		startDate = new Date(timestampStart);
		endDate = new Date(timestampEnd);
	}

	const inputStartDateUpdated = (event: CustomEvent<{ newDate: Date }>) => {
		timestampStart = event.detail.newDate.getTime();
	}

	const inputEndDateUpdated = (event: CustomEvent<{ newDate: Date }>) => {
		timestampEnd = event.detail.newDate.getTime();
	}

	onMount(() => {
		handleResize();
	});

	const privacyStateAttributeMapping: HistoryAttributeMapping[] = [
		{ attributeValue: PrivacyState.LOCAL, text: 'Local', color: '#4cb5dc' },
		{ attributeValue: PrivacyState.ONLINE, text: 'Online', color: '#55e057' },
		{ attributeValue: PrivacyState.ONLINE_SHARED, text: 'Online-Shared', color: '#f1d743' },
	];
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

<svelte:window on:resize={handleResize} />

<div
	bind:this={containerBinding}
	class="box-border h-full w-full flex justify-center items-center"
	style="padding-left: {containerPadding}px; padding-right: {containerPadding}px;"
>
	{#if data.accessLevel === AccessLevel.PRIVATE}
		<DeviceSelection accessLevel={data.accessLevel} on:select={handleDeviceSelection} />
		<div class="text-center flex flex-col items-center">
			<h2 class="h2">Device</h2>
			<div class="flex flex-row w-full items-center justify-between">
				<DateTimeInput date={startDate} on:dateUpdate={inputStartDateUpdated} />
				<button class="btn variant-ghost-tertiary h-10 mx-8" use:popup={popupClick}>
					{#if currentDevice}
						{currentDevice.formattedVendorAndProduct}
					{:else}
						<LoadingSpinner classes="h-6 w-6" />
					{/if}
				</button>
				<DateTimeInput date={endDate} on:dateUpdate={inputEndDateUpdated} />
			</div>
			<TopAxis
				width={containerWidth}
				marginLeft={graphMarginLeft}
				marginRight={graphMarginRight}
				bind:timestampStart={timestampStart}
				bind:timestampEnd={timestampEnd}
			/>
			<svelte:component
				this={historyComponent}
				device={currentDevice}
				accessLevel={data.accessLevel}
				width={containerWidth}
				marginLeft={graphMarginLeft}
				marginRight={graphMarginRight}
				title={currentDevice?.getHistoryComponentTitle()}
				attributeName={currentDevice?.getHistoryComponentAttributeName()}
				attributeMapping={currentDevice?.getHistoryComponentMappings()}
				bind:timestampStart={timestampStart}
				bind:timestampEnd={timestampEnd}
			/>
			<Spacer
				width={containerWidth}
				height={20}
				marginLeft={graphMarginLeft}
				marginRight={graphMarginRight}
				bind:timestampStart={timestampStart}
				bind:timestampEnd={timestampEnd}
			/>
			<AttributeHistory
				device={currentDevice}
				accessLevel={data.accessLevel}
				width={containerWidth}
				marginLeft={graphMarginLeft}
				marginRight={graphMarginRight}
				title="Privacy State"
				attributeName="privacyState"
				attributeMapping={privacyStateAttributeMapping}
				bind:timestampStart={timestampStart}
				bind:timestampEnd={timestampEnd}
			/>
		</div>
	{:else}
		Device history is only available in the local application
	{/if}

</div>

