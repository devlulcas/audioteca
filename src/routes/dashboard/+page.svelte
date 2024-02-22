<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<h1>Add sound</h1>

<form action="?/addSound" method="post" use:enhance>
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>

    <label for="file">File</label>
    <input type="file" id="file" name="file" required>

    <button type="submit">Add</button>
</form>
