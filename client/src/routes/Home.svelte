<style>
  /* Style for "active" links; need to mark this :global because the router adds the class directly */
  :global(a.active) {
    color: crimson;
  }
</style>

<section>
  <h2 class="routetitle">Hjem!</h2>

  <p>Ting du kan prøve:</p>
  <ul>
    <li>
      <a href="/user/create" use:link use:active>Opprette en konto</a>
    </li>
    <li>
      <a href="/user/login" use:link use:active>Logge inn</a>
    </li>
    <li>
      <a href="/user/profile" use:link use:active>Besøke din profilside</a>
    </li>
  </ul>

</section>

<script>
  import Router from "svelte-spa-router";
  import {
    link,
    push,
    pop,
    replace,
    location,
    querystring
  } from "svelte-spa-router";
  import active from "svelte-spa-router/active";
</script>
