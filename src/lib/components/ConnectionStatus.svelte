<script lang="ts">
	import { connectedStore, ConnectionStatus } from '$lib/store/GeneralStore';
	import { getModeUserPrefers, modeCurrent } from '@skeletonlabs/skeleton';

	let currentMode = getModeUserPrefers();
	modeCurrent.subscribe((value) => {
		currentMode = value;
	});
</script>
<div>
	{#if $connectedStore === ConnectionStatus.CONNECTED}
		<div class="flex items-center space-x-2 px-4 py-2 rounded-full" class:bg-connected-light={currentMode} class:bg-connected-dark={!currentMode}>
			<i class="fa-solid fa-link"></i>
			<p>Connected</p>
		</div>
	{:else if $connectedStore === ConnectionStatus.CONNECTING}
		<p>Connecting</p>
	{:else if $connectedStore === ConnectionStatus.DISCONNECTED}
		<div class="flex items-center space-x-2 px-4 py-2 rounded-full" class:bg-disconnected-light={currentMode} class:bg-disconnected-dark={!currentMode}>
			<i class="fa-solid fa-link-slash"></i>
			<p>Not connected</p>
		</div>
	{:else}
		<p>Unknown</p>
	{/if}
</div>