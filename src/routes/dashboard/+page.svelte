<script lang="ts">
	import { enhance } from '$app/forms';
	import FailMessage from '$lib/components/fail-message.svelte';
	import InputFile from '$lib/components/input-file.svelte';
	import type { ActionData, PageServerData } from './$types';

	let { data, form } = $props<{ form: ActionData; data: PageServerData }>();

	let acceptedFiles = $state<File[]>([]);
</script>

<h1>Add sound</h1>

<form method="post" enctype="multipart/form-data" use:enhance>
	<FailMessage body={form} />

	<input type="hidden" name="key" value={data.key} />

	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required />
	</div>

	<div>
		<label for="file">File</label>
		<InputFile id="file" name="file" accept="audio/*" acceptedFiles={acceptedFiles} required>
			{#snippet dragActiveSlot()}
				<p>Drop the file here...</p>
			{/snippet}

			<p>Drag and drop a file here, or click to select files</p>
		</InputFile>

		{#if acceptedFiles.length > 0}
			<ul>
				{#each acceptedFiles as file}
					<li>
						{file.name}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<button type="submit">Add</button>
</form>

<hr />

{#await data.lazy.myUploads}
	<p>Loading...</p>
{:then myUploads}
	{#if myUploads.length > 0}
		<h2>My uploads</h2>
		<ul>
			{#each myUploads as upload}
				<li>
					{upload.name}
				</li>
			{/each}
		</ul>
	{/if}
	<p>No uploads yet</p>
{:catch error}
	{@const errorMessage = error instanceof Error ? error.message : error}
	<strong aria-live="assertive">
		{errorMessage}
	</strong>
{/await}
