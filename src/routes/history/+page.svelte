<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

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

	// let chartRef: HTMLDivElement;
	//
	// onMount(() => {
	// 	d3.select(chartRef)
	// 		.selectAll('div')
	// 		.data(data)
	// 		.enter()
	// 		.append('div')
	// 		.style('width', d => d + 'px')
	// 		.text(d => d);
	// })
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
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">History</h2>
<!--		<div bind:this={chartRef} class="chart"></div>-->
		<svg width={width} height={height}>
			<g bind:this={gx} transform="translate(0,{height - marginBottom})" />
			<g bind:this={gy} transform="translate({marginLeft},0)" />
			<g fill="none">
				<path d={d3.line()(fixedData.map(entry => [x(entry.timestamp), y(entry.value ? 1 : 0)]))} stroke="steelblue" stroke-width="4"></path>
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
</div>
