<section>
  <h1>Opprett en konto</h1>
  <div>
    Brukernavn kan være hva som helst, men passord må inneholde følgende: 2
    store bokstaver, 2 irregulære tegn (eks: @!& osv) og minst 1 tall.
  </div>
  <form id="loginForm" on:submit|preventDefault={handleSubmit}>
    <div class="login">
      {#if hasError}
        <div class="login-error">
          <h5>Passord er ikke gyldig!</h5>
        </div>
      {/if}
      <label>
        <div>Brukernavn:</div>
        <input type="text" placeholder="username" />
      </label>
      <label>
        <div>Passord:</div>
        <input
          class="{passwordClass}"
          type="password"
          on:keyup="{handlePasswordInput}"
          placeholder="password"
        />
      </label>
      <label>
        <input
          class="submit"
          on:submit|preventDefault={handleSubmit}
          type="submit"
          value="Opprett konto"
        />
      </label>
    </div>
    <div>
      <small>
        Passord:
        <strong>{enteredPassword}</strong>
        gyldig: {isValid}
      </small>
    </div>
  </form>

</section>

<script>
  import { push, pop, replace } from "svelte-spa-router";
  import validPass from "../../../lib/security/password/password_validation";
  var hasError;
  var enteredPassword = "";
  var isValid = false;
  var passwordClass = "untouched";
  var isSubmittedOnce;

  function handlePasswordInput(event) {
    enteredPassword = event.target.value;
    isValid = validPass(enteredPassword);
    if (isValid) {
      passwordClass = "green";
    } else if (!isValid && isSubmittedOnce) {
      passwordClass = "red";
    }
  }

  function handleSubmit(event) {
    console.log("try submit", event.target);
    isSubmittedOnce = true;
    const username = event.target[0].value;
    const password = event.target[1].value;
    const body = JSON.stringify({ username, password });
    fetch("/api/v1/user/create", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: body
    })
      .then(res => res.json())
      .then(loginResult => {
        console.log(loginResult);
        if (loginResult.status === "success") {
          push("/user/login");
        } else {
          hasError = true;
          passwordClass = "red";
        }
      });
  }
</script>
