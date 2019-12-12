<form id="loginForm" on:submit={handleClick}>
          <div class="login">
            <label>
              <input type="text" placeholder="username" />
            </label>
            <label>
              <input type="password" placeholder="password" />
            </label>
            <label>
              <button>Logg inn</button>
            </label>
          </div>
        </form>
<script>
import {push, pop, replace} from 'svelte-spa-router'
function handleClick(event){
    console.log(event.target)
 const username = event.target[0].value;
              const password = event.target[1].value;
              const body = JSON.stringify({ username, password });
              fetch("/api/v1/user/login", {
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
                  if(loginResult.status==="success"){
                    push('/profile')
                  }
                });
              event.preventDefault();
            }

</script>