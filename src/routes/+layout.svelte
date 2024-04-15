<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		initializeStores,
		getDrawerStore,
		Drawer,
		LightSwitch,
		Modal,
		type ModalComponent,
		modeCurrent,
		getModeUserPrefers,
		getModeAutoPrefers
	} from '@skeletonlabs/skeleton';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	import '$lib/styles/app.css';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import Navigation from '$lib/navigation/Navigation.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	connectSocket();

	const drawerStore = getDrawerStore();

	const drawerOpen = () => {
		drawerStore.open({});
	};

	// Setting up custom modals
	import LoadingModal from '$lib/modals/LoadingModal.svelte';
	import { connectSocket } from '$lib/sockets/SocketClient';
	import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
	import OnOffPluginUnitDetails from '$lib/components/deviceDetails/OnOffPluginUnitDetails.svelte';

	const modalRegistry: Record<string, ModalComponent> = {
		loading: { ref: LoadingModal },
		onOffPluginUnitDetails: { ref: OnOffPluginUnitDetails}
	};

	// Set the current mode
	let currentMode = getModeUserPrefers();
	modeCurrent.subscribe((value) => {
		currentMode = value;
	});
</script>

<Drawer>
	<Navigation />
</Drawer>

<Modal components={modalRegistry} />
<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-0 lg:w-64">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					{#if currentMode}
						<img
							src="/images/logo_dark.svg"
							alt="PrivacyHub Logo"
							class="w-28 lg:w-36 lg:px-4"
						/>
					{:else}
						<img
							src="/images/logo_light.svg"
							alt="PrivacyHub Logo"
							class="w-28 lg:w-36 lg:px-4"
						/>
					{/if}
					<!--					<strong class="text-xl uppercase">PrivacyHub</strong>-->
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<ConnectionStatus />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<div class="flex flex-col">
			<Navigation />
		</div>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
