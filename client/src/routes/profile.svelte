<section>

  {#if isFetched}
    <h1>Velkommen {name}</h1>
  {/if}
</section>

<script>
  import { onMount } from "svelte";
  var name = "";
  var isFetched;

  onMount(async () => {
    const res = await fetch(`/api/v1/session`);
    var result = await res.json();
    name = result.username;
    isFetched = true;
  });
</script>
