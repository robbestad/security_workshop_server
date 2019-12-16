// Components
import Home from "./routes/home.svelte";
import NotFound from "./routes/notfound.svelte";
import NoteCreate from "./routes/note/create.svelte";
import NoteList from "./routes/note/list.svelte";
import UserCreate from "./routes/user/create.svelte";
import UserLogin from "./routes/user/login.svelte";
import UserProfile from "./routes/user/profile.svelte";

let routes;
const urlParams = new URLSearchParams(window.location.search);
if (!urlParams.has("routemap")) {
  routes = {
    // Exact path
    "/": Home,
    "/user/login": UserLogin,
    "/user/create": UserCreate,
    "/user/profile": UserProfile,

    "/note/create": NoteCreate,
    "/note/list": NoteList,

    // Catch-all, must be last
    "*": NotFound
  };
}
export default routes;
