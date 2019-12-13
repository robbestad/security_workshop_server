// Initialize the Svelte app and inject it in the DOM
import App from "./app.svelte";
const app = new App({
  target: document.querySelector("main")
});

export default app;
