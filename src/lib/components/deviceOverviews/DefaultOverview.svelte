<script lang="ts">
	import ApiClient from '$lib/api/ApiClient.js';
	import type BaseDevice from '$lib/api/devices/BaseDevice';

	export let device: BaseDevice;
</script>

<div class="card flex justify-center items-center space-x-8 p-4">
	<p>{[device.vendor, device.product].filter(Boolean).join(' ')}</p>
</div>