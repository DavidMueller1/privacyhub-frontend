import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { Private } from './src/Private';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			colors: {
				'connected-light': '#7eaf57',
				'connected-dark': '#61913c',
				'disconnected-light': '#b14b4b',
				'disconnected-dark': '#7f2d2d',
				'state-local': '#4cb5dc',
				'state-online': '#55e057',
				'state-online-shared': '#f1d743',
			},
			flexGrow: {

			}
		}
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: 'skeleton',
						enhancements: true
					},
					{
						name: 'crimson',
						enhancements: true
					}
				],
				custom: [Private]
			}
		}),
	]
} satisfies Config;
