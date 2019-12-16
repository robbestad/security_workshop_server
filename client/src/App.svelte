<header>
  <div>Security Demo</div>
  <nav>
    <ul>
      <li>
        <a href="/#/">Start</a>
      </li>
      <li>
        <a href="/#/user/profile">Profile</a>
      </li>
      {#if showLogin}
        <li>
          <a href="/#/user/login">Login</a>
        </li>
      {/if}
    </ul>
  </nav>
</header>
<Router
  {routes}
  on:conditionsFailed="{conditionsFailed}"
  on:routeLoaded="{routeLoaded}"
/>
<footer>
  <p>&copy; Sven Anders Robbestad 2019</p>
</footer>

<script>
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import { onMount, onDestroy } from "svelte";

  var showLogin = document.cookie.indexOf("showlogin=false") === -1; //usikker cookie, ikke bruk til autentisering, bare for raskere tilgang for usikre operasjoner
  var isAuthenticated;
  var expireTime, interval;
  var t0=performance.now(), t1;
  function startInterval(callback, milliseconds) {
      console.log("create interval")
    interval = setInterval(callback, milliseconds);

    onDestroy(() => {
        console.log("destroying interval")
      clearInterval(interval);
    });
  }
  onDestroy(() => {
        console.log("destroying interval")
      clearInterval(interval);
    });
  async function fetchSession() {
    console.count("session")
    const res = await fetch(`/api/v1/session`);
    const result = await res.json();
    isAuthenticated = result.username !== undefined;
    if (isAuthenticated) {
      t1 = performance.now();
      console.log("refresh cookie interval: ", t1 - t0 + " milliseconds");
      t0 = performance.now();
      expireTime = new Date(new Date().getTime() + 50000).toGMTString();
      document.cookie =
        "showlogin=false;expires=" +
        new Date(expireTime).toGMTString() +
        ";path=/";
    }
  }
  onMount(async () => {
    fetchSession();
    startInterval(fetchSession, 60000);
  });

  // Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
  function conditionsFailed(event) {
    console.error("Caught event conditionsFailed", event.detail);
    logbox += "conditionsFailed - " + JSON.stringify(event.detail) + "\n";
    replace("/error");
  }

  // Handles the "routeLoaded" event dispatched by the router after a route has been successfully loaded
  function routeLoaded(event) {
    console.info("Caught event routeLoaded", event.detail);
  }
</script>
