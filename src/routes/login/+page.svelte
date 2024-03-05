<script lang="ts">
	import { enhance } from "$app/forms";
	import FailMessage from "$lib/components/fail-message.svelte";
	import type { ActionData } from "./$types";

	export let form: ActionData;
</script>

<h1>Sign in</h1>
<form method="post" use:enhance>
	<FailMessage body={form} />

	<div>
		<label for="username">Username</label>
		<input name="username" id="username" /><br />
	</div>

	<div>
		<label for="password">Password</label>
		<input type="password" name="password" id="password" /><br />
	</div>

	<button type="submit">Continue</button>


	<p>
		<a href="/signup">Create an account</a>
	</p>
</form>
