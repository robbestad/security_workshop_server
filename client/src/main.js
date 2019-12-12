// Initialize the Svelte app and inject it in the DOM
import App from "./App.svelte";
const app = new App({
  target: document.querySelector("main")
});

export default app;
