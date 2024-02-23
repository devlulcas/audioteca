<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	const getPresignedURL = async (file: File) => {
		const fileName = file.name;

		const formData = new FormData();

		formData.append('name', fileName);

		const response = await fetch('/api/create-presigned-url', {
			method: 'POST',
			body: formData
		});

        
		const json = await response.json();
        
		const url = json.url;
		const key = json.key;

		if (typeof url !== 'string' || typeof key !== 'string') {
			throw new Error('Invalid response from server');
		}

		return { url, key };
	};

	const uploadFile = async (url: string, file: File) => {
		const response = await fetch(url, {
			method: 'PUT',
			body: file
		});

		if (!response.ok) {
			throw new Error('Failed to upload file');
		}

		const json = await response.json();

		if (typeof json.key !== 'string') {
			throw new Error('Invalid response from server');
		}

		return json.key;
	};

	const saveSound = async (key: string, name: string) => {
		const formData = new FormData();

		formData.append('key', key);
		formData.append('name', name);

		const response = await fetch('?/addSound', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Failed to save sound');
		}
	};
</script>

<h1>Add sound</h1>

<form
	method="post"
    enctype="multipart/form-data"   
	use:enhance={async ({ formData }) => {
		const file = formData.get('file');
		const name = formData.get('name');

		if (!(file instanceof File)) {
			throw new Error('Invalid file');
		}

		if (typeof name !== 'string') {
			throw new Error('Invalid name');
		}

		try {
			const presignedUrl = await getPresignedURL(file);
			const fileKey = await uploadFile(presignedUrl.url, file);
			await saveSound(fileKey, name);

			alert('Sound added');
		} catch (error) {
			console.error(error);

			if (error instanceof Error) {
				alert(error.message);
			}

			alert('Failed to add sound');
		}
	}}
>
	<label for="name">Name</label>
	<input type="text" id="name" name="name" required />

	<label for="file">File</label>
	<input type="file" id="file" name="file" required accept="audio/*" />

	<button type="submit">Add</button>
</form>
