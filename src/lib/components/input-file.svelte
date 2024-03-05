<script lang="ts">
	import type { Snippet } from 'svelte';

	type RejectedFile = {
		file: File;
		message: string;
	};

	type OnDropProps = {
		acceptedFiles: File[];
		rejectedFiles: RejectedFile[];
	};

	type InputFileProps = {
		name: string;
		accept: string;
		className?: string;
		id?: string;
		required?: boolean;
		maxFiles?: number;
		validateFile?: (file: File) => { valid: boolean; message: string };
		ondrop?: ({ acceptedFiles, rejectedFiles }: OnDropProps) => void;
		children: Snippet;
		dragActiveSlot?: Snippet;
		acceptedFiles?: File[];
		rejectedFiles?: RejectedFile[];
	};

	let {
		name,
		accept,
		className,
		ondrop,
		validateFile,
		maxFiles,
		children,
		dragActiveSlot,
		acceptedFiles = [],
		rejectedFiles = [],
		...rest
	} = $props<InputFileProps>();

	let input = $state<HTMLInputElement | null>(null);

	let isDragActive = $state(false);

	const validateFileList = (
		files: FileList | null
	): { acceptedFiles: File[]; rejectedFiles: RejectedFile[] } => {
		if (files && files.length > 0) {
			const limit = maxFiles || files.length;

			for (let idx = 0; idx < limit; idx++) {
				const file = files[idx];

				if (!file.type.includes(accept)) {
					rejectedFiles.push({ file, message: `File type not allowed` });
					continue;
				}

				if (validateFile) {
					const { valid, message } = validateFile(file);

					if (valid) {
						acceptedFiles.push(file);
					} else {
						rejectedFiles.push({ file, message });
					}
				} else {
					acceptedFiles.push(file);
				}
			}
		}

		return { acceptedFiles, rejectedFiles };
	};
</script>

<input
	{...rest}
	onchange={(e) => {
		const files = e.currentTarget.files;

		if (files && files.length > 0) {
			const { acceptedFiles, rejectedFiles } = validateFileList(files);

			if (ondrop) {
				ondrop({ acceptedFiles, rejectedFiles });
			}
		}
	}}
	bind:this={input}
	multiple={typeof maxFiles !== 'undefined' && maxFiles > 1}
	type="file"
	{name}
	{accept}
	style="display: none;"
/>

<button
	type="button"
	class={className}
	data-is-drag-active={isDragActive ? 'true' : 'false'}
	onclick={() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = accept;
		input.click();
	}}
	ondragenter={() => (isDragActive = true)}
	ondragleave={() => (isDragActive = false)}
	ondragover={(e) => {
		e.preventDefault();
		isDragActive = true;
	}}
	ondrop={(e) => {
		e.preventDefault();
		isDragActive = false;

		if (e.dataTransfer?.files && input) {
			input.files = e.dataTransfer.files;
		}
	}}
>
	{#if isDragActive && dragActiveSlot}
		{@render dragActiveSlot()}
	{:else}
		{@render children()}
	{/if}
</button>
