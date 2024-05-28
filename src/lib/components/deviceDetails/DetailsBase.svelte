<script lang="ts">
	import { onMount } from 'svelte';
	import SvgQR from '@svelte-put/qr/svg/QR.svelte';

	// Stores
	import { getModalStore, ListBox, ListBoxItem, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import ApiClient from '$lib/api/ApiClient';
	import BaseDevice, { PrivacyState } from '$lib/api/devices/BaseDevice';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { socketStore } from '$lib/store/GeneralStore';
	import { AccessLevel } from '$lib/util/EnvChecker';

	// Props
	export let device: BaseDevice;
	export let accessLevel: AccessLevel;

	const NUM_PROXIES = 3;

	let showQrCode = false;

	const modalStore = getModalStore();

	// Sockets
	$socketStore.on('privacyState', (data) => {
		console.log('privacyState', data);
		if (device.nodeId === data.nodeId && device.endpointId === data.endpointId) {
			selectedPrivacyState = data.privacyState;
			lastSelectedPrivacyState = data.privacyState;
			device.privacyState = data.privacyState;
		}
	});

	// Privacy State
	const privacyStateList = [
		{ key: PrivacyState.LOCAL, text: 'Local', color: 'text-state-local' },
		{ key: PrivacyState.THIRD_PARTY, text: 'Shared', color: 'text-state-third-party' },
		{ key: PrivacyState.ONLINE, text: 'Online', color: 'text-state-online' },
	];
	let selectedPrivacyState: PrivacyState = device.privacyState;
	let lastSelectedPrivacyState: PrivacyState = device.privacyState;

	const handleSelectPrivacyState = () => {
		privacyStateLoading = true;
		ApiClient.updatePrivacyState(accessLevel, device.nodeId, device.endpointId, selectedPrivacyState).then(() => {
			lastSelectedPrivacyState = selectedPrivacyState;
			device.privacyState = selectedPrivacyState;
			privacyStateLoading = false;
			if (accessLevel !== AccessLevel.PRIVATE && selectedPrivacyState !== PrivacyState.ONLINE) {
				location.reload();
			}
		}).catch(() => {
			console.error('Failed to update privacy state');
			selectedPrivacyState = lastSelectedPrivacyState;
			privacyStateLoading = false;
		});
	};

	let privacyStateLoading = false;
	let privacyStateString = 'Unknown';
	let privacyStateColor = '';

	const updatePrivacyState = async (state: PrivacyState) => {
		privacyStateString = privacyStateList.find((x) => x.key === state)?.text || 'Unknown';
		privacyStateColor = privacyStateList.find((x) => x.key === state)?.color || '';
	};
	$: updatePrivacyState(device.privacyState);

	// Connected Proxy
	let proxyLoading = false;
	let selectedProxy: number = device.connectedProxy;
	let lastSelectedProxy: number = device.connectedProxy;
	const handleSelectProxy = () => {
		proxyLoading = true;
		ApiClient.updateConnectedProxy(accessLevel, device.nodeId, device.endpointId, selectedProxy).then(() => {
			lastSelectedProxy = selectedProxy;
			proxyLoading = false;
		}).catch(() => {
			console.error('Failed to update connected proxy');
			selectedProxy = lastSelectedProxy;
			proxyLoading = false;
		});
	};

	const popupPrivacy: PopupSettings = {
		event: 'click',
		target: 'popupPrivacy',
		placement: 'bottom',
		closeQuery: '.close-popup'
	}

	const popupPrivacyInfo: PopupSettings = {
		event: 'hover',
		target: 'popupPrivacyInfo',
		placement: 'top',
		closeQuery: '.close-popup'
	}

	const popupProxy: PopupSettings = {
		event: 'click',
		target: 'popupProxy',
		placement: 'bottom',
		closeQuery: '.close-popup'
	}

	const popupProxyInfo: PopupSettings = {
		event: 'hover',
		target: 'popupProxyInfo',
		placement: 'top',
		closeQuery: '.close-popup'
	}

	const popupProxyLocationInfo: PopupSettings = {
		event: 'hover',
		target: 'popupProxyLocationInfo',
		placement: 'top',
		closeQuery: '.close-popup'
	}

	onMount(() => {
		console.log("MANUAL PAIRING CODE");
		console.log(device.manualPairingCode);
		console.log("QR CODE");
		console.log(device.qrCode);
	});

	let rowValue = "";
	const updateRow = () => {
		rowValue = rowValue.replace(/[^0-9]/g, '');
		if (rowValue.length > 2) {
			rowValue = rowValue.substring(0, 2);
		}
	};

	let colValue = "";
	const updateCol = () => {
		colValue = colValue.replace(/[^0-9]/g, '');
		if (colValue.length > 2) {
			colValue = colValue.substring(0, 2);
		}
	};

	let proxyLocationLoading = false;

	const handleSendProxyLocation = async () => {
		proxyLocationLoading = true;
		ApiClient.sendProxyLocation(accessLevel, selectedProxy, Number(rowValue), Number(colValue)).then(() => {
			proxyLocationLoading = false;
		}).catch(() => {
			console.error('Failed to send proxy location');
			proxyLocationLoading = false;
		});
	};
</script>


<!-- Privacy State Selection Popup -->
<div class="card p-4" data-popup="popupPrivacy">
	<ListBox>
		{#each privacyStateList as privacyState}
			<ListBoxItem
				class="close-popup {privacyState.color}"
				bind:group={selectedPrivacyState}
				name="medium"
				value={privacyState.key}
				on:change={handleSelectPrivacyState}
			>{privacyState.text}</ListBoxItem>
		{/each}
	</ListBox>
</div>

<!-- Privacy State Info Popup -->
<div class="card p-4 variant-filled-surface max-w-80" data-popup="popupPrivacyInfo">
	<div class="flex flex-col items-center space-y-4">
		<div class="flex flex-col items-center text-sm">
			The privacy state of a device determines where the device data is visible and from where it can be controlled.
		</div>
		<div class="flex flex-col items-center">
			<div class="font-bold text-xl {privacyStateList.find((x) => x.key === PrivacyState.LOCAL)?.color}">
				{privacyStateList.find((x) => x.key === PrivacyState.LOCAL)?.text}
			</div>
			<div class="text-sm">The device can only be accessed via the local web interface at
				<a class="text-neutral-400" href="http://privacyhub:8080">http://privacyhub:8080</a>
				in the same network as the PrivacyHub.</div>
		</div>
		<div class="flex flex-col items-center">
			<div class="font-bold text-xl {privacyStateList.find((x) => x.key === PrivacyState.THIRD_PARTY)?.color}">
				{privacyStateList.find((x) => x.key === PrivacyState.THIRD_PARTY)?.text}
			</div>
			<div class="text-sm">The device can be accessed from third party hubs like an Alexa. Use the top right button to pair it.</div>
		</div>
		<div class="flex flex-col items-center">
			<div class="font-bold text-xl {privacyStateList.find((x) => x.key === PrivacyState.ONLINE)?.color}">
				{privacyStateList.find((x) => x.key === PrivacyState.ONLINE)?.text}
			</div>
			<div class="text-sm">In addition to the other states the device can be accessed online at
				<a class="text-neutral-400" href="https://privacyhub.ngrok.app/">https://privacyhub.ngrok.app</a>
			</div>
		</div>
	</div>
	<div class="arrow variant-filled-surface" />
</div>

<!-- Proxy Selection Popup -->
<div class="card p-4" data-popup="popupProxy">
	<ListBox>
		{#each Array(NUM_PROXIES + 1) as _, i}
			<ListBoxItem
				class="close-popup"
				bind:group={selectedProxy}
				name="medium"
				value={i}
				on:change={handleSelectProxy}
			>
				{i === 0 ? "None" : `Proxy ${i}`}
			</ListBoxItem>
		{/each}
	</ListBox>
</div>

<!-- Proxy Info Popup -->
<div class="card p-4 variant-filled-surface max-w-80" data-popup="popupProxyInfo">
	<div class="flex flex-col items-center space-y-4">
		<div class="flex flex-col items-center text-sm">
			When a device is connected to a proxy, the proxy can control and visualize the device's privacy state and show data flow from and to the device.
		</div>
	</div>
	<div class="arrow variant-filled-surface" />
</div>

<!-- Proxy Location Info Popup -->
<div class="card p-4 variant-filled-surface max-w-80" data-popup="popupProxyLocationInfo">
	<div class="flex flex-col items-center space-y-4">
		<div class="flex flex-col items-center text-sm">
			This option can be used to manually override the position of a Proxy on the Dashboard.
			For each field the number must be between 1 and 16.
		</div>
	</div>
	<div class="arrow variant-filled-surface" />
</div>

{#if $modalStore[0]}
	<div class="my-modal text-center card p-4 w-modal shadow-xl space-y-4 flex flex-col">
		<div class="flex flex-row items-center">
			{#if showQrCode}
				<button
					class="btn-icon variant-ringed-tertiary w-11 shrink-0"
					on:click={() => showQrCode = false}
				>
					<i class="fa-solid fa-arrow-left"></i>
				</button>
			{:else}
				<button
					class="btn-icon variant-ringed-tertiary w-11 shrink-0"
					on:click={() => modalStore.close()}
				>
					<i class="fa-solid fa-x"></i>
				</button>
			{/if}
			<header class='px-4 text-lg md:text-2xl font-bold flex-grow'><i class="fa-solid fa-plug mr-2"></i>{device.formattedVendorAndProduct}</header>
			{#if !showQrCode && device.privacyState !== PrivacyState.LOCAL}
				<button
					class="btn-icon variant-ringed-tertiary w-11 shrink-0 !ml-auto"
					on:click={() => showQrCode = true}
				>
					<i class="fa-solid fa-qrcode"></i>
				</button>
			{/if}
		</div>
		{#if showQrCode}
			<span class="flex flex-col justify-center items-center min-h-40">
				<span class="text-lg mb-4">
					Scan this code to pair your device to a hub of your choice.
				</span>
				<SvgQR class="w-60" data={device.qrCode} />
				<span class="text-gray-600">{device.manualPairingCode}</span>
			</span>
		{:else}
			<div class="flex flex-col">
				<div class="py-8" >
					<slot/>
				</div>
				<div class="flex flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-500">
					<div>Privacy State <i class="fa-solid fa-circle-question text-sm ml-1" use:popup={popupPrivacyInfo}></i></div>
					<button class="btn variant-ghost-tertiary h-10 w-24 {privacyStateColor}" use:popup={popupPrivacy}>
						{#if privacyStateLoading}
							<LoadingSpinner classes="h-6" />
						{:else}
							{privacyStateString}
						{/if}
					</button>
				</div>
				<div class="flex flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-500">
					<div>Connected Proxy <i class="fa-solid fa-circle-question text-sm ml-1" use:popup={popupProxyInfo}></i></div>
					<button class="btn variant-ghost-tertiary h-10 w-24" use:popup={popupProxy}>
						{#if proxyLoading}
							<LoadingSpinner classes="h-6" />
						{:else}
							{selectedProxy === 0 ? "None" : `Proxy ${selectedProxy}`}
						{/if}
					</button>
				</div>
				{#if selectedProxy !== 0}
					<div class="flex flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-500">
						<div>Proxy Location <i class="fa-solid fa-circle-question text-sm ml-1" use:popup={popupProxyLocationInfo}></i></div>
						<div class="flex flex-row space-x-2">
							<input
									class="input w-14 text-center"
									placeholder="Row"
									bind:value={rowValue}
									on:input={updateRow}
							>
							<input
									class="input w-14 text-center"
									placeholder="Col"
									bind:value={colValue}
									on:input={updateCol}
							>
							<button class="btn variant-filled-primary w-11" on:click={handleSendProxyLocation}>
								{#if proxyLocationLoading}
									<LoadingSpinner classes="h-6" />
								{:else}
									<i class="fa-solid fa-chevron-right"></i>
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
