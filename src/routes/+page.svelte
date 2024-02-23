<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<form method="post" use:enhance action="/?/signOut">
	<button>Sign out</button>
</form>

<div>
	<h1>Audios</h1>
	<a href="/dashboard">Adicionar novo conteúdo</a>
</div>

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
