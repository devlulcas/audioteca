<script lang="ts">
	import type { ActionFailBody } from '$lib/server/errors/action-fail';

	let { body } = $props<{ body: ActionFailBody | null }>();
</script>

{#if body && ['warning', 'error'].includes(body.as)}
	<p class="message" class:warning={body.as === 'warning'} class:error={body.as === 'error'}>
		{body.message}
	</p>
{/if}

<style>
	.message {
		padding: 1em;
		margin: 1em 0;
		border-radius: 0.5em;
	}

	.warning {
		background-color: #ff0;
		color: #000;
	}

	.error {
		background-color: #f00;
		color: white;
	}
</style>
