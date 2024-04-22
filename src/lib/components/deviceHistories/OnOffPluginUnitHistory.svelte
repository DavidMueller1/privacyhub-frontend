<script lang="ts">
	import * as d3 from 'd3';
	import BaseDevice from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnit, { type IReturnOnOffPluginUnitState } from '$lib/api/devices/OnOffPluginUnit';
	import { error } from '@sveltejs/kit';
	import { ConnectionStatus } from '$lib/store/GeneralStore';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { onMount } from 'svelte';
	import { centerEvent, getTimestampDifference } from '$lib/components/deviceHistories/HistoryUtils';

	export let device: OnOffPluginUnit;

	export let width = 640;
	export let height = 400;
	export let marginTop = 10;
	export let marginRight = 20;
	export let marginBottom = 30;
	export let marginLeft = 30;

	let isLoading = true;

	// Bindings
	let viewBoxBinding: HTMLElement;
	let xAxisBinding: SVGElement;
	let yAxisBinding: SVGElement;

	// The start and end of the graph's x-axis
	export let timestampStart: number = 0;
	export let timestampEnd: number = 0;


	// Get the history data of the device
	let data: IReturnOnOffPluginUnitState[] = [];

	device.getHistory().then(history => {
		history.forEach((entry, index) => {
			data.push({
				connectionStatus: entry.connectionStatus,
				onOffState: entry.onOffState,
				timestamp: entry.timestamp,
			});
			const next = history[index + 1];
			if (next) {
				data.push({
					connectionStatus: entry.connectionStatus,
					onOffState: entry.onOffState,
					timestamp: next.timestamp,
				});
			}
		});
		data = data;
		console.log("DATA:");
		console.log(data);

		// Calculate the start and end of the data
		const startEnd = d3.extent(data.map(entry => entry.timestamp));
		timestampStart = startEnd[0] ?? 0;
		timestampEnd = startEnd[1] ?? 0;

		isLoading = false;
	}).catch((error) => {
		isLoading = false;
		console.error(error);
	});

	// Event for panning the xAxis
	const dragEvent = (event, d) => {
		const panDistance = getTimestampDifference(
			event.dx,
			timestampStart,
			timestampEnd,
			width,
			marginLeft,
			marginRight
		)
		timestampStart -= panDistance;
		timestampEnd -= panDistance;
	};

	// Event for zooming the xAxis
	const zoomEvent = (event, d) => {
		const localCenter = centerEvent(event, viewBoxBinding);
		const localX = localCenter[0] - marginLeft;
		const graphWidth = width - marginLeft - marginRight;
		const zoomDelta = event.sourceEvent.deltaY;

		const timestampDifference = timestampEnd - timestampStart;

		// Calculate the new timestamp difference
		const targetTimestampDifference = timestampDifference + zoomDelta * timestampDifference / 1000;

		const differenceToCurrent = targetTimestampDifference - timestampDifference;

		// "Zoom" around the mouse position
		const distanceStart = localX / graphWidth * differenceToCurrent;
		const distanceEnd = (graphWidth - localX) / graphWidth * differenceToCurrent;

		// Update the timestamps
		timestampStart = timestampStart - distanceStart;
		timestampEnd = timestampEnd + distanceEnd;
	};

	// The D3 Magic
	// $: x = d3.scaleTime(d3.extent(data.map(entry => entry.timestamp)), [marginLeft, width - marginRight]).nice();
	$: x = d3.scaleTime([timestampStart, timestampEnd], [marginLeft, width - marginRight]);
	$: y = d3.scaleLinear([-0.01, 1], [height - marginBottom, marginTop]);
	// $: d3.select(gx).call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M')));
	$: d3.select(xAxisBinding).call(d3.axisBottom(x));
	$: d3.select(yAxisBinding).call(d3.axisLeft(y).tickValues([0, 1]).tickFormat(d => d ? 'ON' : 'OFF'));

	$: d3.select(viewBoxBinding).call(d3.drag().on('drag', dragEvent));
	$: d3.select(viewBoxBinding).call(d3.zoom().on('zoom', zoomEvent));

</script>

{#if isLoading}
	<LoadingSpinner />
{:else}
	<div>
		<svg bind:this={viewBoxBinding} width={width} height={height}>
			<g bind:this={xAxisBinding} transform="translate(0,{height - marginBottom})" />
			<g bind:this={yAxisBinding} transform="translate({marginLeft},0)" />
			<g fill="none">
				<path d={d3.line()(data.map(entry => [x(entry.timestamp), y(entry.onOffState ? 1 : 0)]))} stroke="#3c8eae" stroke-width="4"></path>
				<!--{#each data as entry}-->
				<!--	<rect x={x(entry.timestamp)} y={height - y(entry.value)} width={width / data.length} height={y(entry.value)} />-->
				<!--{/each}-->
			</g>
			<!--			<path fill="none" stroke="currentColor" stroke-width="1.5" d={line(data)} />-->
			<!--			<g fill="white" stroke="currentColor" stroke-width="1.5">-->
			<!--				{#each data as d, i}-->
			<!--					<circle key={i} cx={x(i)} cy={y(d)} r="2.5" />-->
			<!--				{/each}-->
			<!--			</g>-->
		</svg>
	</div>
{/if}