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
	export let height = 250;
	export let marginTop = 20;
	export let marginBottom = 20;
	export let marginRight = 20;
	export let marginLeft = 45;

	let isLoading = true;

	// Bindings
	let viewBoxBinding: HTMLElement;
	let xAxisGridBinding: SVGElement;
	let yAxisBinding: SVGElement;

	// The start and end of the graph's x-axis
	export let timestampStart: number = 0;
	export let timestampEnd: number = 0;


	// Get the history data of the device
	let data: IReturnOnOffPluginUnitState[] = [];

	$: device && loadData();

	const loadData = () => {
		device.getHistory().then(history => {
			isLoading = true;
			data = [];
			history.forEach((entry, index) => {
				data.push({
					connectionStatus: entry.connectionStatus,
					onOffState: entry["onOffState"],
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

			// Calculate the start and end of the data
			const startEnd = d3.extent(data.map(entry => entry.timestamp));
			timestampStart = startEnd[0] ?? 0;
			timestampEnd = startEnd[1] ?? 0;

			isLoading = false;
		}).catch((error) => {
			isLoading = false;
			console.error(error);
		});
	}

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
	$: y = d3.scaleLinear([0, 1], [height - marginBottom, marginTop]);
	// $: d3.select(gx).call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M')));
	$: d3.select(xAxisGridBinding).call(d3.axisBottom(x).tickSize(-height).tickFormat('').ticks(10)) && d3.select(xAxisGridBinding).selectAll('path').remove() && d3.select(xAxisGridBinding).selectAll('line').attr('stroke', '#ffffff33');
	$: d3.select(yAxisBinding).call(d3.axisLeft(y).tickValues([0, 1]).tickFormat(d => d ? 'ON' : 'OFF')) && d3.select(yAxisBinding).selectAll('path').remove() && d3.select(yAxisBinding).selectAll('line').remove();

	$: d3.select(viewBoxBinding).call(d3.drag().on('drag', dragEvent));
	$: d3.select(viewBoxBinding).call(d3.zoom().on('zoom', zoomEvent));

</script>

{#if isLoading}
	<LoadingSpinner />
{:else}
	<div>
		<svg bind:this={viewBoxBinding} width={width} height={height}>
			<g>
				<rect width={width} height={height} rx="10" ry="10" fill="#ffffff11" />
			</g>
			<g bind:this={xAxisGridBinding} transform="translate(0,{height})" />
			<g bind:this={yAxisBinding} class="text-lg" transform="translate({marginLeft},0)" />
			<g>
				<text
					x={width - 30}
					y={height / 2}
					text-anchor="middle"
					alignment-baseline="middle"
					fill="#ffffff"
					transform="rotate(90, {width - 30}, {height / 2})"
				>On / Off State</text>
			</g>
			<g fill="none">
				<clipPath id="clip">
					<rect x={marginLeft} y={0} width={width - marginLeft - marginRight} height={height} />
				</clipPath>
				<path id="chart-path" d={d3.line()(data.map(entry => [x(entry.timestamp), y(entry.onOffState ? 1 : 0)]))}></path>
				<use href="#chart-path" clip-path="url(#clip)" stroke="#3c8eae" stroke-width="4" />
			</g>
		</svg>
	</div>
{/if}