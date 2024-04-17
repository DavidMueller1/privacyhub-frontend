<script lang="ts">
	import * as d3 from 'd3';
	import BaseDevice from '$lib/api/devices/BaseDevice';
	import OnOffPluginUnit, { type IReturnOnOffPluginUnitState } from '$lib/api/devices/OnOffPluginUnit';
	import { error } from '@sveltejs/kit';
	import { ConnectionStatus } from '$lib/store/GeneralStore';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	export let device: OnOffPluginUnit;
	export let width = 640;
	export let height = 400;
	export let marginTop = 10;
	export let marginRight = 20;
	export let marginBottom = 30;
	export let marginLeft = 30;

	let isLoading = true;

	let gx;
	let gy;

	$: x = d3.scaleTime(d3.extent(data.map(entry => entry.timestamp)), [marginLeft, width - marginRight]).nice();
	$: y = d3.scaleLinear(d3.extent(data.map(entry => entry.onOffState ? 1 : 0)), [height - marginBottom, marginTop]);
	$: d3.select(gx).call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M')));
	$: d3.select(gy).call(d3.axisLeft(y));

	// Some random testing data
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
</script>

{#if isLoading}
	<LoadingSpinner />
{:else}
	<div>
		<svg width={width} height={height}>
			<g bind:this={gx} transform="translate(0,{height - marginBottom})" />
			<g bind:this={gy} transform="translate({marginLeft},0)" />
			<g fill="none">
				<path d={d3.line()(data.map(entry => [x(entry.timestamp), y(entry.onOffState ? 1 : 0)]))} stroke="steelblue" stroke-width="4"></path>
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