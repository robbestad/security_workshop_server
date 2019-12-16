{#if !isAuthenticated}
  <section class="grid single">
    <div class="center middle">
      Vennligst vent... henter din brukerinformasjon.
    </div>
  </section>
{/if}
{#if isAuthenticated}
  <section>
    <h1>Velkommen {name}</h1>
    <div>Hva kan jeg gjøre for deg i dag?</div>
    <ul>
      <li>
        Du kan
        <a use:link href="/note/create">skrive</a>
        et notat
      </li>

      <li>
        Du kan også
        <a use:link href="/note/list">vise</a>
        dine lagrede notater
      </li>

      <li>
        Eller hva med å sende en
        <a use:link href="/message/write">hemmelig melding</a>
        til en annen bruker?
      </li>

      <li>
        Du har forresten
        <a use:link href="/message/inbox">1</a>
        ventende beskjed
      </li>
    </ul>
  </section>
{/if}

<script>
  import { onMount } from "svelte";
  import { link, replace } from "svelte-spa-router";
  var name = "";
  var isAuthenticated;

  onMount(async () => {
    const res = await fetch(`/api/v1/session`);
    var result = await res.json();
    if (result.message === "Unauthorized!") {
      replace("/user/login");
    }
    isAuthenticated = true;
    name = result.username;
  });
</script>
