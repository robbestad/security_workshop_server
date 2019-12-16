<section>
  <h1>Opprett et notat</h1>
  <form id="myForm" on:submit|preventDefault={handleSubmit}>
    <div class="form-feedback">
      {#if hasError}
        <div class="form-error">
          <h5>Notatet kunne ikke lagres!</h5>
        </div>
      {/if}
      <label>
        <div>Tittel:</div>
        <input type="text" placeholder="Tittel" />
      </label>
      <label>
        <div>Tekst:</div>
        <textarea></textarea>
      </label>
      <label>
        <input
          class="submit"
          on:submit|preventDefault={handleSubmit}
          type="submit"
          value="Lagre"
        />
      </label>
    </div>
  </form>

</section>

<script>
  import { push, pop, replace } from "svelte-spa-router";
  var hasError;

  function handleSubmit(event) {
    console.log("try submit", event.target);
    const title= event.target[0].value;
    const note = event.target[1].value;
    const body = JSON.stringify({ title, text: note});
    fetch("/api/v1/note/create", {
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
      .then(result=> {
        console.log(result);
        if (result.status === "success") {
          push("/note/list");
        } else {
          hasError = true;
        }
      });
  }
</script>
