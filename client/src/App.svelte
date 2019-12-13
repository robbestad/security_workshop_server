<!-- Show the router -->
<Router {routes} on:conditionsFailed={conditionsFailed} on:routeLoaded={routeLoaded} />
<script>
import Router from 'svelte-spa-router'
import routes from './routes'

// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
function conditionsFailed(event) {
    console.error('Caught event conditionsFailed', event.detail)
    logbox += 'conditionsFailed - ' + JSON.stringify(event.detail) + '\n'
    replace('/error')
}

// Handles the "routeLoaded" event dispatched by the router after a route has been successfully loaded
function routeLoaded(event) {
    console.info('Caught event routeLoaded', event.detail)
}

</script>
