<section>
  {#if !isAuthenticated}
    <div class="center middle">Vennligst vent... henter din brukerinformasjon.</div>
  {/if}

  <h1>Notatene til {name}</h1>
  {#if notes}
    {#each notes as { title, text }, i}
      <li>
        <a href="/note/id">{title}</a>
      </li>
    {/each}
  {/if}
</section>

<script>
  import { onMount } from "svelte";
  import { link, replace } from "svelte-spa-router";
  var name = "";
  var isAuthenticated;
  var notes;

  onMount(async () => {
    const res = await fetch(`/api/v1/session`);
    var result = await res.json();
    if (result.message === "Unauthorized!") {
      replace("/user/login");
    }
    name = result.username;
    isAuthenticated = true;
    
    const list = await fetch(`/api/v1/note/list`);

    var result2 = await list.json();
    notes = result2.notes;
  });
</script>
