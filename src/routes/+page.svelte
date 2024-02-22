<script lang="ts">
	import { enhance } from '$app/forms';
	import { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<form method="post" use:enhance action="/?/signOut">
	<button>Sign out</button>
</form>

<h1>Audios</h1>

<ul>
	{#each data.audios as audio}
		<li>
			<p>{audio.name}</p>
			<audio controls>
				<source src={audio.url} type="audio/mpeg" />
			</audio>
		</li>
	{/each}
</ul>
