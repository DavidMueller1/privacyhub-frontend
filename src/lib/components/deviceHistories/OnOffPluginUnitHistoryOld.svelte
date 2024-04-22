<script lang="ts">
	import * as d3 from 'd3';
	import BaseDevice from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnit, { type IReturnOnOffPluginUnitState } from '$lib/api/devices/OnOffPluginUnit';
	import { error } from '@sveltejs/kit';
	import { ConnectionStatus } from '$lib/store/GeneralStore';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { onMount } from 'svelte';

	export let device: OnOffPluginUnit;
	export let width = 640;
	export let height = 400;
	export let marginTop = 10;
	export let marginRight = 20;
	export let marginBottom = 30;
	export let marginLeft = 30;

	let isLoading = true;

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
		isLoading = false;
		console.log("DATA:");
		console.log(data);
	}).catch((error) => {
		isLoading = false;
		console.error(error);
	});


	let viewBox: HTMLElement;
	let xAxisBinding: SVGGElement;
	let yAxisBinding: SVGGElement;

	let deltaX = 0;
	let deltaZoom = 1;

	$: zoomX = d3.zoom().scaleExtent([0.1, 10]);
	$: x1 = d3.scaleTime(d3.extent(data.map(entry => entry.timestamp)), [marginLeft, width - marginRight]);
	// $: x2 = d3.scaleTime(calculateExtendValues(d3.extent(data.map(entry => entry.timestamp))), [marginLeft, width - marginRight]);
	const x2 = d3.scaleTime(d3.extent(data.map(entry => entry.timestamp)), [marginLeft, width - marginRight]);
	$: y = d3.scaleLinear(d3.extent(data.map(entry => entry.onOffState ? 1 : 0)), [height - marginBottom, marginTop]);
	const xAxis = d3.axisBottom(x2).tickFormat(d3.timeFormat('%H:%M'));
	let gx = d3.select(xAxisBinding).call(xAxis);
	$: d3.select(yAxisBinding).call(d3.axisLeft(y));

	$: d3.select(viewBox).call(d3.drag().on('drag', dragEvent));

	$: calculateExtendValues = (currentExtend: [number, number]): [number, number] => {
		const min = currentExtend[0];
		const max = currentExtend[1];

		let returnMin = min + deltaX;
		let returnMax = max + deltaX;

		return [returnMin, returnMax];
	}

	const dragEvent = (event, d) => {
		deltaX += x1.invert(event.x - event.dx).getTime() - x1.invert(event.x).getTime();
	};

	let z = d3.zoomIdentity;

	const zoomEvent = (event) => {
		const transform = event.transform;
		const k = transform.k;
		const point = center(event, this);
		console.log(transform);

		gx.call(xAxis.scale(transform.rescaleX(x2)));

		// // const tx = () => d3.zoomTransform(d3.select(xAxis).node());
		// d3.select(xAxisBinding).call(d3.zoom().scaleTo, k, point);
		// const tx = () => d3.zoomTransform(d3.select(xAxisBinding).node());
		//
		//
		// // z = transform;
		//
		// x2 = tx().rescaleX(x2);



		// deltaZoom += 1000000;
		// d3.zoom().scaleBy(d3.select(xAxis), 100000000, point);
		// d3.select(xAxis).call(d3.zoom().scaleBy, 1000000000, point);
	};

	// center the action (handles multitouch)
	const center = (event, target) => {
		if (event.sourceEvent) {
			const p = d3.pointers(event, target);
			return [d3.mean(p, d => d[0]), d3.mean(p, d => d[1])];
		}
		return [width / 2, height / 2];
	}

	d3.select(viewBox).call(d3.zoom().on('zoom', zoomEvent));

	onMount(() => {
		console.log("Mounted");
		gx = d3.select(xAxisBinding).call(xAxis);
	});
</script>

{#if isLoading}
	<LoadingSpinner />
{:else}
	<div>
		<svg bind:this={viewBox} width={width} height={height}>
			<g bind:this={xAxisBinding} style="font-size: 15px" transform="translate(0,{height - marginBottom})" />
			<g bind:this={yAxisBinding} style="font-size: 15px" transform="translate({marginLeft},0)" />
			<g fill="none">
				<path d={d3.line()(data.map(entry => [x2(entry.timestamp), y(entry.onOffState ? 1 : 0)]))} stroke="steelblue" stroke-width="4"></path>
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