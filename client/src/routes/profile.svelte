<section>
  {#if !isAuthenticated}
     <div class="center">
     Vennligst vent... henter din brukerinformasjon.
     </div>
  {/if}
  {#if isAuthenticated}
    <h1>Velkommen {name}</h1>
    <div>
        Hva kan jeg gjøre for deg i dag?
    </div>
  {/if}
</section>

<script>
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  var name = "";
  var isAuthenticated;

  onMount(async () => {
    const res = await fetch(`/api/v1/session`);
    var result = await res.json();
    if(result.message === "Unauthorized!"){
          replace("/user/login");
    }
    isAuthenticated = true;
    console.log(result);
    name = result.username;
  });
</script>
