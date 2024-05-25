<script lang="ts">
	import * as d3 from 'd3';
	import { ConnectionStatus } from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnit from '$lib/api/devices/OnOffPluginUnit';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { centerEvent, getTimestampDifference } from '$lib/components/deviceHistories/HistoryUtils';
	import type ContactSensor from '$lib/api/devices/ContactSensor';
	import { type PopupSettings, popup } from '@skeletonlabs/skeleton';

	export let device: OnOffPluginUnit | ContactSensor;

	export let width = 640;
	export let height = 150;
	export let marginTop = 20;
	export let marginBottom = 20;
	export let marginRight = 20;
	export let marginLeft = 45;

	export let title = 'On / Off State';
	export let trueString = 'ON';
	export let trueColor = '#3c8eae';
	export let falseString = 'OFF';
	export let falseColor = '#3d3e46';

	let isLoading = true;

	// Bindings
	let viewBoxBinding: HTMLElement;
	let xAxisGridBinding: SVGElement;
	let yAxisBinding: SVGElement;

	// The start and end of the graph's x-axis
	export let timestampStart: number = 0;
	export let timestampEnd: number = 0;

	let booleanAttributeName: string = '';
	$: booleanAttributeName = device instanceof OnOffPluginUnit ? 'onOffState' : 'booleanState';


	// Get the history data of the device
	let data: {
		connectionStatus: ConnectionStatus;
		booleanState: boolean;
		timestampStart: number;
		timestampEnd: number;
	}[] = [];

	let popupDetailList: PopupSettings[] = [];

	$: device && loadData();

	const loadData = () => {
		device.getHistory().then(history => {
			isLoading = true;

			const dataTemp: {
				connectionStatus: ConnectionStatus;
				booleanState: boolean;
				timestamp: number;
			}[] = [];
			data = [];

			// Remove duplicate entries
			history.forEach((entry, index) => {
				const dataObject = {
					connectionStatus: entry.connectionStatus,
					booleanState: entry[booleanAttributeName],
					timestamp: entry.timestamp
				};

				// Remove duplicate entries
				if (
					dataTemp.length > 0
					&& dataTemp[dataTemp.length - 1].booleanState === dataObject.booleanState
					&& dataTemp[dataTemp.length - 1].connectionStatus === dataObject.connectionStatus
				) {
					return;
				}

				dataTemp.push(dataObject);
			});

			// Calculate the start and end of the data
			dataTemp.forEach((entry, index) => {
				const timestampEnd = dataTemp[index + 1]?.timestamp ?? Date.now();
				const dataObject = {
					connectionStatus: entry.connectionStatus,
					booleanState: entry.booleanState,
					timestampStart: entry.timestamp,
					timestampEnd: timestampEnd
				};

				popupDetailList.push({
					event: 'hover',
					target: `popupDetails-${index}`,
					placement: 'top'
				});

				data.push(dataObject);
			});
			data = data;
			console.log("BARD DATA");
			console.log(data);

			// Calculate the start and end of the data
			const start = d3.min(data.map(entry => entry.timestampStart));
			const end = d3.max(data.map(entry => entry.timestampEnd));
			timestampStart = start ?? 0;
			timestampEnd = end ?? 0;

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
	// $: d3.select(yAxisBinding).call(d3.axisLeft(y).tickValues([0, 1]).tickFormat(d => d ? 'ON' : 'OFF')) && d3.select(yAxisBinding).selectAll('path').remove() && d3.select(yAxisBinding).selectAll('line').remove();

	$: d3.select(viewBoxBinding).call(d3.drag().on('drag', dragEvent));
	$: d3.select(viewBoxBinding).call(d3.zoom().on('zoom', zoomEvent));

</script>

{#each data as entry, index}
	<div class="card p-2 variant-filled-surface w-40" data-popup="popupDetails-{index}">
		<div class="flex flex-col items-center space-y-4">
			<div class="flex flex-col items-center">
				<div
					class="font-bold text-xl"
				>{entry.booleanState ? trueString : falseString}</div>
<!--				style="color: {entry.booleanState ? trueColor : falseColor}"-->
				<div class="flex flex-row align-middle">
					<div>from</div>
					<div>{new Date(entry.timestampStart).toLocaleString()}</div>
				</div>
			</div>
		</div>
		<div class="arrow variant-filled-surface" />
	</div>
{/each}

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
				>{title}</text>
			</g>
			<g fill="none">
				<clipPath id="clip">
					<rect x={marginLeft} y={0} width={width - marginLeft - marginRight} height={height} />
				</clipPath>
				{#each data as entry, index}
					{#if entry.connectionStatus === ConnectionStatus.CONNECTED}
						<rect
							x={x(entry.timestampStart)}
							y={marginTop}
							width={x(entry.timestampEnd) - x(entry.timestampStart)}
							height={height - marginBottom - marginTop}
							fill={entry.booleanState ? trueColor : falseColor}
							use:popup={popupDetailList[index]}
						/>
					{/if}
				{/each}
				<use href="#chart-path" clip-path="url(#clip)" stroke="#3c8eae" stroke-width="4" />
			</g>
<!--			<g fill="none">-->
<!--				<clipPath id="clip">-->
<!--					<rect x={marginLeft} y={0} width={width - marginLeft - marginRight} height={height} />-->
<!--				</clipPath>-->
<!--				<path id="chart-path" d={d3.line()(data.map(entry => [x(entry.timestamp), y(entry.booleanState ? 1 : 0)]))}></path>-->
<!--				<use href="#chart-path" clip-path="url(#clip)" stroke="#3c8eae" stroke-width="4" />-->
<!--			</g>-->
		</svg>
	</div>
{/if}