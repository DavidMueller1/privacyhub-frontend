<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import BaseDevice from '$lib/api/devices/BaseDevice';

	export let classes: string = '';
	export let date = new Date(Date.now());

	const dispatch = createEventDispatcher<{ dateUpdate:{ newDate: Date } }>();

	let year = "";
	let month = "";
	let day = "";

	let hours = "";
	let minutes = "";
	let seconds = "";

	$: year = year.replace(/[^0-9]/g, '')
	$: month = month.replace(/[^0-9]/g, '')
	$: day = day.replace(/[^0-9]/g, '')

	$: hours = hours.replace(/[^0-9]/g, '')
	$: minutes = minutes.replace(/[^0-9]/g, '')
	$: seconds = seconds.replace(/[^0-9]/g, '')

	// Date updated from inside
	const updateDate = () => {
		console.log("UPDATE DATE");
		console.log(year, month, day, hours, minutes, seconds);
		date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hours),
			Number(minutes),
			Number(seconds)
		);
		dispatch('dateUpdate', { newDate: date })
	}

	// Date updated from outside
	$: date && dateChanged();
	const dateChanged = () => {
		console.log("DATE CHANGED");
		console.log(date);
		year = date.getFullYear().toString();
		month = (date.getMonth() + 1).toString();
		day = date.getDate().toString();
		hours = date.getHours().toString();
		minutes = date.getMinutes().toString();
		seconds = date.getSeconds().toString();
	}

	$: if (year.length > 4) {
		year = year.slice(0, 4);
	}

	$: if (month.length > 2) {
		month = month.slice(0, 2);
	}

	$: if (day.length > 2) {
		day = day.slice(0, 2);
	}

	$: if (hours.length > 2) {
		hours = hours.slice(0, 2);
	}

	$: if (Number(hours) > 23) {
		hours = "23";
	}

	$: if (minutes.length > 2) {
		minutes = minutes.slice(0, 2);
	}

	$: if (Number(minutes) > 59) {
		minutes = "59";
	}

	$: if (seconds.length > 2) {
		seconds = seconds.slice(0, 2);
	}

	$: if (Number(seconds) > 59) {
		seconds = "59";
	}

</script>

<style>
	input {
		min-width: 0;
		border: none;
		flex-grow: 1;
	}
</style>

<div class="flex flex-col w-40 {classes}">
	<div class="flex flex-row w-full">
		<input class="rounded-tl-3xl" bind:value={day} on:input={updateDate}>
		<input bind:value={month} on:input={updateDate}>
		<input class="rounded-tr-3xl" bind:value={year} on:input={updateDate}>
	</div>
	<div class="flex flex-row w-full">
		<input class="rounded-bl-3xl" bind:value={hours} on:input={updateDate}>
		<input bind:value={minutes} on:input={updateDate}>
		<input class="rounded-br-3xl" bind:value={seconds} on:input={updateDate}>
	</div>
</div>