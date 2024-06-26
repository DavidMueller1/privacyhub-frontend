<script lang="ts">
	import * as d3 from 'd3';
	import BaseDevice from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnit, { type IReturnOnOffPluginUnitState } from '$lib/api/devices/OnOffPluginUnit';
	import { error } from '@sveltejs/kit';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { onMount } from 'svelte';
	import { centerEvent, getTimestampDifference } from '$lib/components/deviceHistories/HistoryUtils';

	export let width = 640;
	export let height = 100;
	export let marginTop = 60;
	export let marginBottom = 30;
	export let marginRight = 45;
	export let marginLeft = 45;

	// Bindings
	let viewBoxBinding: HTMLElement;
	let xAxisBinding: SVGElement;
	let xAxisGridBinding: SVGElement;

	// The start and end of the graph's x-axis
	export let timestampStart: number = 0;
	export let timestampEnd: number = 0;

	const arrowWidth = 20;
	const arrowMarginTop = 6;
	const arrowMarginBottom = 9;


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
	$: x = d3.scaleTime([timestampStart, timestampEnd], [marginLeft, width - marginRight]);
	$: d3.select(xAxisBinding).call(d3.axisTop(x));
	$: d3.select(xAxisGridBinding).call(d3.axisBottom(x).tickSize(height - marginTop).tickFormat('').ticks(10)) && d3.select(xAxisGridBinding).selectAll('path').remove() && d3.select(xAxisGridBinding).selectAll('line').attr('stroke', '#ffffff33');

	$: d3.select(viewBoxBinding).call(d3.drag().on('drag', dragEvent));
	$: d3.select(viewBoxBinding).call(d3.zoom().on('zoom', zoomEvent));

</script>

<svg bind:this={viewBoxBinding} class="mt-0" width={width} height={height}>
	<polygon points="{marginLeft - arrowWidth / 2},{arrowMarginTop} {marginLeft + arrowWidth / 2},{arrowMarginTop} {marginLeft},{marginTop - arrowMarginBottom}" fill="#ffffff40" />
	<polygon points="{width - marginRight - arrowWidth / 2},{arrowMarginTop} {width - marginRight + arrowWidth / 2},{arrowMarginTop} {width - marginRight},{marginTop - arrowMarginBottom}" fill="#ffffff40" />
	<g bind:this={xAxisBinding} class="text-base" transform="translate(0,{marginTop})" />
	<g bind:this={xAxisGridBinding} transform="translate(0,{marginTop})" />
	<!--	<g bind:this={xAxisBinding} transform="translate(0,{height - marginBottom})" />-->
</svg>