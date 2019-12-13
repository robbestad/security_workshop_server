// Components
import Home from "./routes/home.svelte";
import NotFound from "./routes/notfound.svelte";
import UserCreate from "./routes/create.svelte";
import UserLogin from "./routes/login.svelte";
import UserProfile from "./routes/profile.svelte";

let routes;
const urlParams = new URLSearchParams(window.location.search);
if (!urlParams.has("routemap")) {
  routes = {
    // Exact path
    "/": Home,
    "/user/login": UserLogin,
    "/user/create": UserCreate,
    "/user/profile": UserProfile,

    // Catch-all, must be last
    "*": NotFound
  };
}
export default routes;
