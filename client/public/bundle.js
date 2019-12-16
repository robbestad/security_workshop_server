(function(l, r) {
  if (l.getElementById("livereloadscript")) return;
  r = l.createElement("script");
  r.async = 1;
  r.src =
    "//" +
    (window.location.host || "localhost").split(":")[0] +
    ":35729/livereload.js?snipver=1";
  r.id = "livereloadscript";
  l.head.appendChild(r);
})(window.document);
var app = (function() {
  "use strict";

  function noop() {}
  function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
      loc: { file, line, column, char }
    };
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a
      ? b == b
      : a !== b || (a && typeof a === "object") || typeof a === "function";
  }
  function validate_store(store, name) {
    if (!store || typeof store.subscribe !== "function") {
      throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
  }
  function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }

  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function prevent_default(fn) {
    return function(event) {
      event.preventDefault();
      // @ts-ignore
      return fn.call(this, event);
    };
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element) {
    return Array.from(element.childNodes);
  }
  function custom_event(type, detail) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, false, false, detail);
    return e;
  }

  let current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component)
      throw new Error(`Function called outside component initialization`);
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
  }
  function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
      const callbacks = component.$$.callbacks[type];
      if (callbacks) {
        // TODO are there situations where events could be dispatched
        // in a server (non-DOM) environment?
        const event = custom_event(type, detail);
        callbacks.slice().forEach(fn => {
          fn.call(component, event);
        });
      }
    };
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function flush() {
    const seen_callbacks = new Set();
    do {
      // first, call beforeUpdate functions
      // and update components
      while (dirty_components.length) {
        const component = dirty_components.shift();
        set_current_component(component);
        update(component.$$);
      }
      while (binding_callbacks.length) binding_callbacks.pop()();
      // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          callback();
          // ...so guard against infinite loops
          seen_callbacks.add(callback);
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
      $$.dirty = [-1];
      $$.after_update.forEach(add_render_callback);
    }
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }

  const globals = typeof window !== "undefined" ? window : global;
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
  }
  function init(
    component,
    options,
    instance,
    create_fragment,
    not_equal,
    props,
    dirty = [-1]
  ) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = (component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object(),
      dirty
    });
    let ready = false;
    $$.ctx = instance
      ? instance(component, prop_values, (i, ret, value = ret) => {
          if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
            if ($$.bound[i]) $$.bound[i](value);
            if (ready) make_dirty(component, i);
          }
          return ret;
        })
      : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.l(children(options.target));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }
    set_current_component(parent_component);
  }
  class SvelteComponent {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks =
        this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    $set() {
      // overridden by instance, if it has props
    }
  }

  function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, detail));
  }
  function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
  }
  function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
  }
  function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
  }
  function listen_dev(
    node,
    event,
    handler,
    options,
    has_prevent_default,
    has_stop_propagation
  ) {
    const modifiers =
      options === true
        ? ["capture"]
        : options
        ? Array.from(Object.keys(options))
        : [];
    if (has_prevent_default) modifiers.push("preventDefault");
    if (has_stop_propagation) modifiers.push("stopPropagation");
    dispatch_dev("SvelteDOMAddEventListener", {
      node,
      event,
      handler,
      modifiers
    });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", {
        node,
        event,
        handler,
        modifiers
      });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
      dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function set_data_dev(text, data) {
    data = "" + data;
    if (text.data === data) return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
  }
  class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
      if (!options || (!options.target && !options.$$inline)) {
        throw new Error(`'target' is a required option`);
      }
      super();
    }
    $destroy() {
      super.$destroy();
      this.$destroy = () => {
        console.warn(`Component was already destroyed`); // eslint-disable-line no-console
      };
    }
  }

  const subscriber_queue = [];
  /**
   * Creates a `Readable` store that allows reading by subscription.
   * @param value initial value
   * @param {StartStopNotifier}start start and stop notifications for subscriptions
   */
  function readable(value, start) {
    return {
      subscribe: writable(value, start).subscribe
    };
  }
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          // store is ready
          const run_queue = !subscriber_queue.length;
          for (let i = 0; i < subscribers.length; i += 1) {
            const s = subscribers[i];
            s[1]();
            subscriber_queue.push(s, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update(fn) {
      set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
      const subscriber = [run, invalidate];
      subscribers.push(subscriber);
      if (subscribers.length === 1) {
        stop = start(set) || noop;
      }
      run(value);
      return () => {
        const index = subscribers.indexOf(subscriber);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
        if (subscribers.length === 0) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update, subscribe };
  }
  function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    const auto = fn.length < 2;
    return readable(initial_value, set => {
      let inited = false;
      const values = [];
      let pending = 0;
      let cleanup = noop;
      const sync = () => {
        if (pending) {
          return;
        }
        cleanup();
        const result = fn(single ? values[0] : values, set);
        if (auto) {
          set(result);
        } else {
          cleanup = is_function(result) ? result : noop;
        }
      };
      const unsubscribers = stores_array.map((store, i) =>
        store.subscribe(
          value => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
              sync();
            }
          },
          () => {
            pending |= 1 << i;
          }
        )
      );
      inited = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
      };
    });
  }

  function regexparam(str, loose) {
    if (str instanceof RegExp) return { keys: false, pattern: str };
    var c,
      o,
      tmp,
      ext,
      keys = [],
      pattern = "",
      arr = str.split("/");
    arr[0] || arr.shift();

    while ((tmp = arr.shift())) {
      c = tmp[0];
      if (c === "*") {
        keys.push("wild");
        pattern += "/(.*)";
      } else if (c === ":") {
        o = tmp.indexOf("?", 1);
        ext = tmp.indexOf(".", 1);
        keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
        pattern += !!~o && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
        if (!!~ext) pattern += (!!~o ? "?" : "") + "\\" + tmp.substring(ext);
      } else {
        pattern += "/" + tmp;
      }
    }

    return {
      keys: keys,
      pattern: new RegExp("^" + pattern + (loose ? "(?=$|/)" : "/?$"), "i")
    };
  }

  /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.16.4 */

  const { Error: Error_1, Object: Object_1 } = globals;

  function create_fragment(ctx) {
    let switch_instance_anchor;
    let current;
    var switch_value = /*component*/ ctx[0];

    function switch_props(ctx) {
      return {
        props: { params: /*componentParams*/ ctx[1] },
        $$inline: true
      };
    }

    if (switch_value) {
      var switch_instance = new switch_value(switch_props(ctx));
    }

    const block = {
      c: function create() {
        if (switch_instance) create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      l: function claim(nodes) {
        throw new Error_1(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }

        insert_dev(target, switch_instance_anchor, anchor);
        current = true;
      },
      p: function update(ctx, dirty) {
        const switch_instance_changes = {};
        if (dirty[0] & /*componentParams*/ 2)
          switch_instance_changes.params = /*componentParams*/ ctx[1];

        if (switch_value !== (switch_value = /*component*/ ctx[0])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;

            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });

            check_outros();
          }

          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(
              switch_instance,
              switch_instance_anchor.parentNode,
              switch_instance_anchor
            );
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i: function intro(local) {
        if (current) return;
        if (switch_instance) transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        if (switch_instance) transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(switch_instance_anchor);
        if (switch_instance) destroy_component(switch_instance, detaching);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function getLocation() {
    const hashPosition = window.location.href.indexOf("#/");

    let location =
      hashPosition > -1 ? window.location.href.substr(hashPosition + 1) : "/";

    const qsPosition = location.indexOf("?");
    let querystring = "";

    if (qsPosition > -1) {
      querystring = location.substr(qsPosition + 1);
      location = location.substr(0, qsPosition);
    }

    return { location, querystring };
  }

  const loc = readable(getLocation(), function start(set) {
    const update = () => {
      set(getLocation());
    };

    window.addEventListener("hashchange", update, false);

    return function stop() {
      window.removeEventListener("hashchange", update, false);
    };
  });

  const location = derived(loc, $loc => $loc.location);
  const querystring = derived(loc, $loc => $loc.querystring);

  function push(location) {
    if (
      !location ||
      location.length < 1 ||
      (location.charAt(0) != "/" && location.indexOf("#/") !== 0)
    ) {
      throw Error("Invalid parameter location");
    }

    setTimeout(() => {
      window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }, 0);
  }

  function replace$1(location) {
    if (
      !location ||
      location.length < 1 ||
      (location.charAt(0) != "/" && location.indexOf("#/") !== 0)
    ) {
      throw Error("Invalid parameter location");
    }

    setTimeout(() => {
      const dest = (location.charAt(0) == "#" ? "" : "#") + location;
      history.replaceState(undefined, undefined, dest);
      window.dispatchEvent(new Event("hashchange"));
    }, 0);
  }

  function link(node) {
    if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
      throw Error('Action "link" can only be used with <a> tags');
    }

    const href = node.getAttribute("href");

    if (!href || href.length < 1 || href.charAt(0) != "/") {
      throw Error('Invalid value for "href" attribute');
    }

    node.setAttribute("href", "#" + href);
  }

  function instance($$self, $$props, $$invalidate) {
    let $loc,
      $$unsubscribe_loc = noop;

    validate_store(loc, "loc");
    component_subscribe($$self, loc, $$value =>
      $$invalidate(4, ($loc = $$value))
    );
    $$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    let { routes = {} } = $$props;
    let { prefix = "" } = $$props;

    class RouteItem {
      constructor(path, component) {
        if (
          !component ||
          (typeof component != "function" &&
            (typeof component != "object" ||
              component._sveltesparouter !== true))
        ) {
          throw Error("Invalid component object");
        }

        if (
          !path ||
          (typeof path == "string" &&
            (path.length < 1 ||
              (path.charAt(0) != "/" && path.charAt(0) != "*"))) ||
          (typeof path == "object" && !(path instanceof RegExp))
        ) {
          throw Error('Invalid value for "path" argument');
        }

        const { pattern, keys } = regexparam(path);
        this.path = path;

        if (
          typeof component == "object" &&
          component._sveltesparouter === true
        ) {
          this.component = component.route;
          this.conditions = component.conditions || [];
          this.userData = component.userData;
        } else {
          this.component = component;
          this.conditions = [];
          this.userData = undefined;
        }

        this._pattern = pattern;
        this._keys = keys;
      }

      match(path) {
        if (prefix && path.startsWith(prefix)) {
          path = path.substr(prefix.length) || "/";
        }

        const matches = this._pattern.exec(path);

        if (matches === null) {
          return null;
        }

        if (this._keys === false) {
          return matches;
        }

        const out = {};
        let i = 0;

        while (i < this._keys.length) {
          out[this._keys[i]] = matches[++i] || null;
        }

        return out;
      }

      checkConditions(detail) {
        for (let i = 0; i < this.conditions.length; i++) {
          if (!this.conditions[i](detail)) {
            return false;
          }
        }

        return true;
      }
    }

    const routesIterable =
      routes instanceof Map ? routes : Object.entries(routes);
    const routesList = [];

    for (const [path, route] of routesIterable) {
      routesList.push(new RouteItem(path, route));
    }

    let component = null;
    let componentParams = {};
    const dispatch = createEventDispatcher();

    const dispatchNextTick = (name, detail) => {
      setTimeout(() => {
        dispatch(name, detail);
      }, 0);
    };

    const writable_props = ["routes", "prefix"];

    Object_1.keys($$props).forEach(key => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Router> was created with unknown prop '${key}'`);
    });

    $$self.$set = $$props => {
      if ("routes" in $$props) $$invalidate(2, (routes = $$props.routes));
      if ("prefix" in $$props) $$invalidate(3, (prefix = $$props.prefix));
    };

    $$self.$capture_state = () => {
      return {
        routes,
        prefix,
        component,
        componentParams,
        $loc
      };
    };

    $$self.$inject_state = $$props => {
      if ("routes" in $$props) $$invalidate(2, (routes = $$props.routes));
      if ("prefix" in $$props) $$invalidate(3, (prefix = $$props.prefix));
      if ("component" in $$props)
        $$invalidate(0, (component = $$props.component));
      if ("componentParams" in $$props)
        $$invalidate(1, (componentParams = $$props.componentParams));
      if ("$loc" in $$props) loc.set(($loc = $$props.$loc));
    };

    $$self.$$.update = () => {
      if ($$self.$$.dirty[0] & /*component, $loc*/ 17) {
        {
          $$invalidate(0, (component = null));
          let i = 0;

          while (!component && i < routesList.length) {
            const match = routesList[i].match($loc.location);

            if (match) {
              const detail = {
                component: routesList[i].component,
                name: routesList[i].component.name,
                location: $loc.location,
                querystring: $loc.querystring,
                userData: routesList[i].userData
              };

              if (!routesList[i].checkConditions(detail)) {
                dispatchNextTick("conditionsFailed", detail);
                break;
              }

              $$invalidate(0, (component = routesList[i].component));
              $$invalidate(1, (componentParams = match));
              dispatchNextTick("routeLoaded", detail);
            }

            i++;
          }
        }
      }
    };

    return [component, componentParams, routes, prefix];
  }

  class Router extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance, create_fragment, safe_not_equal, {
        routes: 2,
        prefix: 3
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Router",
        options,
        id: create_fragment.name
      });
    }

    get routes() {
      throw new Error_1(
        "<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set routes(value) {
      throw new Error_1(
        "<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get prefix() {
      throw new Error_1(
        "<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set prefix(value) {
      throw new Error_1(
        "<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  // List of nodes to update
  const nodes = [];

  // Current location
  let location$1;

  // Function that updates all nodes marking the active ones
  function checkActive(el) {
    // Remove the active class from all elements
    el.node.classList.remove(el.className);

    // If the pattern matches, then set the active class
    if (el.pattern.test(location$1)) {
      el.node.classList.add(el.className);
    }
  }

  // Listen to changes in the location
  loc.subscribe(value => {
    // Update the location
    location$1 =
      value.location + (value.querystring ? "?" + value.querystring : "");

    // Update all nodes
    nodes.map(checkActive);
  });

  /**
   * @typedef {Object} ActiveOptions
   * @property {string} [path] - Path expression that makes the link active when matched (must start with '/' or '*'); default is the link's href
   * @property {string} [className] - CSS class to apply to the element when active; default value is "active"
   */

  /**
   * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
   *
   * @param {HTMLElement} node - The target node (automatically set by Svelte)
   * @param {ActiveOptions|string} [opts] - Can be an object of type ActiveOptions, or a string representing ActiveOptions.path.
   */
  function active(node, opts) {
    // Check options
    if (opts && typeof opts == "string") {
      // Interpret strings as opts.path
      opts = {
        path: opts
      };
    } else {
      // Ensure opts is a dictionary
      opts = opts || {};
    }

    // Path defaults to link target
    if (!opts.path && node.hasAttribute("href")) {
      opts.path = node.getAttribute("href");
      if (opts.path && opts.path.length > 1 && opts.path.charAt(0) == "#") {
        opts.path = opts.path.substring(1);
      }
    }

    // Default class name
    if (!opts.className) {
      opts.className = "active";
    }

    // Path must start with '/' or '*'
    if (
      !opts.path ||
      opts.path.length < 1 ||
      (opts.path.charAt(0) != "/" && opts.path.charAt(0) != "*")
    ) {
      throw Error('Invalid value for "path" argument');
    }

    // Get the regular expression
    const { pattern } = regexparam(opts.path);

    // Add the node to the list
    const el = {
      node,
      className: opts.className,
      pattern
    };
    nodes.push(el);

    // Trigger the action right away
    checkActive(el);

    return {
      // When the element is destroyed, remove it from the list
      destroy() {
        nodes.splice(nodes.indexOf(el), 1);
      }
    };
  }

  /* src/routes/home.svelte generated by Svelte v3.16.4 */
  const file = "src/routes/home.svelte";

  function create_fragment$1(ctx) {
    let section;
    let h2;
    let t1;
    let p;
    let t3;
    let ul;
    let li0;
    let a0;
    let link_action;
    let active_action;
    let t5;
    let li1;
    let a1;
    let link_action_1;
    let active_action_1;
    let t7;
    let li2;
    let a2;
    let link_action_2;
    let active_action_2;

    const block = {
      c: function create() {
        section = element("section");
        h2 = element("h2");
        h2.textContent = "Hjem!";
        t1 = space();
        p = element("p");
        p.textContent = "Ting du kan prøve:";
        t3 = space();
        ul = element("ul");
        li0 = element("li");
        a0 = element("a");
        a0.textContent = "Opprette en konto";
        t5 = space();
        li1 = element("li");
        a1 = element("a");
        a1.textContent = "Logge inn";
        t7 = space();
        li2 = element("li");
        a2 = element("a");
        a2.textContent = "Besøke din profilside";
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file, 8, 2, 179);
        add_location(p, file, 10, 2, 216);
        attr_dev(a0, "href", "/user/create");
        add_location(a0, file, 13, 6, 264);
        add_location(li0, file, 12, 4, 253);
        attr_dev(a1, "href", "/user/login");
        add_location(a1, file, 16, 6, 354);
        add_location(li1, file, 15, 4, 343);
        attr_dev(a2, "href", "/user/profile");
        add_location(a2, file, 19, 6, 435);
        add_location(li2, file, 18, 4, 424);
        add_location(ul, file, 11, 2, 244);
        add_location(section, file, 7, 0, 167);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, h2);
        append_dev(section, t1);
        append_dev(section, p);
        append_dev(section, t3);
        append_dev(section, ul);
        append_dev(ul, li0);
        append_dev(li0, a0);
        link_action = link.call(null, a0) || {};
        active_action = active.call(null, a0) || {};
        append_dev(ul, t5);
        append_dev(ul, li1);
        append_dev(li1, a1);
        link_action_1 = link.call(null, a1) || {};
        active_action_1 = active.call(null, a1) || {};
        append_dev(ul, t7);
        append_dev(ul, li2);
        append_dev(li2, a2);
        link_action_2 = link.call(null, a2) || {};
        active_action_2 = active.call(null, a2) || {};
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (link_action && is_function(link_action.destroy))
          link_action.destroy();
        if (active_action && is_function(active_action.destroy))
          active_action.destroy();
        if (link_action_1 && is_function(link_action_1.destroy))
          link_action_1.destroy();
        if (active_action_1 && is_function(active_action_1.destroy))
          active_action_1.destroy();
        if (link_action_2 && is_function(link_action_2.destroy))
          link_action_2.destroy();
        if (active_action_2 && is_function(active_action_2.destroy))
          active_action_2.destroy();
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$1.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  class Home extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, null, create_fragment$1, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Home",
        options,
        id: create_fragment$1.name
      });
    }
  }

  /* src/routes/notfound.svelte generated by Svelte v3.16.4 */

  const file$1 = "src/routes/notfound.svelte";

  function create_fragment$2(ctx) {
    let section;
    let h1;

    const block = {
      c: function create() {
        section = element("section");
        h1 = element("h1");
        h1.textContent = "Rute ikke funnet!";
        add_location(h1, file$1, 1, 0, 10);
        add_location(section, file$1, 0, 0, 0);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, h1);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$2.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  class Notfound extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, null, create_fragment$2, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Notfound",
        options,
        id: create_fragment$2.name
      });
    }
  }

  /* src/routes/note/create.svelte generated by Svelte v3.16.4 */
  const file$2 = "src/routes/note/create.svelte";

  // (5:6) {#if hasError}
  function create_if_block(ctx) {
    let div;
    let h5;

    const block = {
      c: function create() {
        div = element("div");
        h5 = element("h5");
        h5.textContent = "Notatet kunne ikke lagres!";
        add_location(h5, file$2, 6, 10, 195);
        attr_dev(div, "class", "form-error");
        add_location(div, file$2, 5, 8, 160);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, h5);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source: "(5:6) {#if hasError}",
      ctx
    });

    return block;
  }

  function create_fragment$3(ctx) {
    let section;
    let h1;
    let t1;
    let form;
    let div2;
    let t2;
    let label0;
    let div0;
    let t4;
    let input0;
    let t5;
    let label1;
    let div1;
    let t7;
    let textarea;
    let t8;
    let label2;
    let input1;
    let dispose;
    let if_block = /*hasError*/ ctx[0] && create_if_block(ctx);

    const block = {
      c: function create() {
        section = element("section");
        h1 = element("h1");
        h1.textContent = "Opprett et notat";
        t1 = space();
        form = element("form");
        div2 = element("div");
        if (if_block) if_block.c();
        t2 = space();
        label0 = element("label");
        div0 = element("div");
        div0.textContent = "Tittel:";
        t4 = space();
        input0 = element("input");
        t5 = space();
        label1 = element("label");
        div1 = element("div");
        div1.textContent = "Tekst:";
        t7 = space();
        textarea = element("textarea");
        t8 = space();
        label2 = element("label");
        input1 = element("input");
        add_location(h1, file$2, 1, 2, 12);
        add_location(div0, file$2, 10, 8, 280);
        attr_dev(input0, "type", "text");
        attr_dev(input0, "placeholder", "Tittel");
        add_location(input0, file$2, 11, 8, 307);
        add_location(label0, file$2, 9, 6, 264);
        add_location(div1, file$2, 14, 8, 387);
        add_location(textarea, file$2, 15, 8, 413);
        add_location(label1, file$2, 13, 6, 371);
        attr_dev(input1, "class", "submit");
        attr_dev(input1, "type", "submit");
        input1.value = "Lagre";
        add_location(input1, file$2, 18, 8, 472);
        add_location(label2, file$2, 17, 6, 456);
        attr_dev(div2, "class", "form-feedback");
        add_location(div2, file$2, 3, 4, 103);
        attr_dev(form, "id", "myForm");
        add_location(form, file$2, 2, 2, 40);
        add_location(section, file$2, 0, 0, 0);

        dispose = [
          listen_dev(
            input1,
            "submit",
            prevent_default(/*handleSubmit*/ ctx[1]),
            false,
            true,
            false
          ),
          listen_dev(
            form,
            "submit",
            prevent_default(/*handleSubmit*/ ctx[1]),
            false,
            true,
            false
          )
        ];
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, h1);
        append_dev(section, t1);
        append_dev(section, form);
        append_dev(form, div2);
        if (if_block) if_block.m(div2, null);
        append_dev(div2, t2);
        append_dev(div2, label0);
        append_dev(label0, div0);
        append_dev(label0, t4);
        append_dev(label0, input0);
        append_dev(div2, t5);
        append_dev(div2, label1);
        append_dev(label1, div1);
        append_dev(label1, t7);
        append_dev(label1, textarea);
        append_dev(div2, t8);
        append_dev(div2, label2);
        append_dev(label2, input1);
      },
      p: function update(ctx, dirty) {
        if (/*hasError*/ ctx[0]) {
          if (!if_block) {
            if_block = create_if_block(ctx);
            if_block.c();
            if_block.m(div2, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (if_block) if_block.d();
        run_all(dispose);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$3.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$1($$self, $$props, $$invalidate) {
    var hasError;

    function handleSubmit(event) {
      console.log("try submit", event.target);
      const title = event.target[0].value;
      const note = event.target[1].value;
      const body = JSON.stringify({ title, text: note });

      fetch("/api/v1/note/create", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        referrer: "no-referrer",
        body
      })
        .then(res => res.json())
        .then(result => {
          console.log(result);

          if (result.status === "success") {
            push("/note/list");
          } else {
            $$invalidate(0, (hasError = true));
          }
        });
    }

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("hasError" in $$props) $$invalidate(0, (hasError = $$props.hasError));
    };

    return [hasError, handleSubmit];
  }

  class Create extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$1, create_fragment$3, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Create",
        options,
        id: create_fragment$3.name
      });
    }
  }

  /* src/routes/note/list.svelte generated by Svelte v3.16.4 */
  const file$3 = "src/routes/note/list.svelte";

  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i].title;
    child_ctx[4] = list[i].text;
    child_ctx[6] = i;
    return child_ctx;
  }

  // (2:2) {#if !isAuthenticated}
  function create_if_block_1(ctx) {
    let div;

    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Vennligst vent... henter din brukerinformasjon.";
        attr_dev(div, "class", "center middle");
        add_location(div, file$3, 2, 4, 39);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1.name,
      type: "if",
      source: "(2:2) {#if !isAuthenticated}",
      ctx
    });

    return block;
  }

  // (7:2) {#if notes}
  function create_if_block$1(ctx) {
    let each_1_anchor;
    let each_value = /*notes*/ ctx[2];
    let each_blocks = [];

    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }

    const block = {
      c: function create() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        each_1_anchor = empty();
      },
      m: function mount(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }

        insert_dev(target, each_1_anchor, anchor);
      },
      p: function update(ctx, dirty) {
        if (dirty[0] & /*notes*/ 4) {
          each_value = /*notes*/ ctx[2];
          let i;

          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      d: function destroy(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching) detach_dev(each_1_anchor);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$1.name,
      type: "if",
      source: "(7:2) {#if notes}",
      ctx
    });

    return block;
  }

  // (8:4) {#each notes as { title, text }
  function create_each_block(ctx) {
    let li;
    let a;
    let t0_value = /*title*/ ctx[3] + "";
    let t0;
    let t1;

    const block = {
      c: function create() {
        li = element("li");
        a = element("a");
        t0 = text(t0_value);
        t1 = space();
        attr_dev(a, "href", "/note/id");
        add_location(a, file$3, 9, 8, 233);
        add_location(li, file$3, 8, 6, 220);
      },
      m: function mount(target, anchor) {
        insert_dev(target, li, anchor);
        append_dev(li, a);
        append_dev(a, t0);
        append_dev(li, t1);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*notes*/ 4 &&
          t0_value !== (t0_value = /*title*/ ctx[3] + "")
        )
          set_data_dev(t0, t0_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(li);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block.name,
      type: "each",
      source: "(8:4) {#each notes as { title, text }",
      ctx
    });

    return block;
  }

  function create_fragment$4(ctx) {
    let section;
    let t0;
    let h1;
    let t1;
    let t2;
    let t3;
    let if_block0 = !(/*isAuthenticated*/ ctx[1]) && create_if_block_1(ctx);
    let if_block1 = /*notes*/ ctx[2] && create_if_block$1(ctx);

    const block = {
      c: function create() {
        section = element("section");
        if (if_block0) if_block0.c();
        t0 = space();
        h1 = element("h1");
        t1 = text("Notatene til ");
        t2 = text(/*name*/ ctx[0]);
        t3 = space();
        if (if_block1) if_block1.c();
        add_location(h1, file$3, 5, 2, 131);
        add_location(section, file$3, 0, 0, 0);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        if (if_block0) if_block0.m(section, null);
        append_dev(section, t0);
        append_dev(section, h1);
        append_dev(h1, t1);
        append_dev(h1, t2);
        append_dev(section, t3);
        if (if_block1) if_block1.m(section, null);
      },
      p: function update(ctx, dirty) {
        if (!(/*isAuthenticated*/ ctx[1])) {
          if (!if_block0) {
            if_block0 = create_if_block_1(ctx);
            if_block0.c();
            if_block0.m(section, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (dirty[0] & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);

        if (/*notes*/ ctx[2]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block$1(ctx);
            if_block1.c();
            if_block1.m(section, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$4.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$2($$self, $$props, $$invalidate) {
    var name = "";
    var isAuthenticated;
    var notes;

    onMount(async () => {
      const res = await fetch(`/api/v1/session`);
      var result = await res.json();

      if (result.message === "Unauthorized!") {
        replace$1("/user/login");
      }

      $$invalidate(0, (name = result.username));
      $$invalidate(1, (isAuthenticated = true));
      const list = await fetch(`/api/v1/note/list`);
      var result2 = await list.json();
      $$invalidate(2, (notes = result2.notes));
    });

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("name" in $$props) $$invalidate(0, (name = $$props.name));
      if ("isAuthenticated" in $$props)
        $$invalidate(1, (isAuthenticated = $$props.isAuthenticated));
      if ("notes" in $$props) $$invalidate(2, (notes = $$props.notes));
    };

    return [name, isAuthenticated, notes];
  }

  class List extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$2, create_fragment$4, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "List",
        options,
        id: create_fragment$4.name
      });
    }
  }

  // Min 1 number
  // Min 2 special
  // Min 1 uppercase
  function validPass(pass) {
    if (!pass || pass.length < 3) return false;
    if (
      !pass.match(
        /^(?=(?:.*[\d]){1,})(?=(?:.*[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]){2,})(?=(?:.*[A-Z]){1,})(?:[^\x00-\x1F\x7F]){8,255}$/
      )
    ) {
      return false;
    }

    return true;
  }
  var password_validation = validPass;

  /* src/routes/user/create.svelte generated by Svelte v3.16.4 */
  const file$4 = "src/routes/user/create.svelte";

  // (12:6) {#if hasError}
  function create_if_block$2(ctx) {
    let div;
    let h5;

    const block = {
      c: function create() {
        div = element("div");
        h5 = element("h5");
        h5.textContent = "Passord er ikke gyldig!";
        add_location(h5, file$4, 13, 10, 456);
        attr_dev(div, "class", "login-error");
        add_location(div, file$4, 12, 8, 420);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, h5);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$2.name,
      type: "if",
      source: "(12:6) {#if hasError}",
      ctx
    });

    return block;
  }

  function create_fragment$5(ctx) {
    let section;
    let h1;
    let t1;
    let div0;
    let t3;
    let div1;
    let t4;
    let a;
    let t6;
    let t7;
    let form;
    let div4;
    let t8;
    let label0;
    let div2;
    let t10;
    let input0;
    let t11;
    let label1;
    let div3;
    let t13;
    let input1;
    let t14;
    let label2;
    let input2;
    let t15;
    let div5;
    let small;
    let t16;
    let strong;
    let t17;
    let t18;
    let t19;
    let dispose;
    let if_block = /*hasError*/ ctx[0] && create_if_block$2(ctx);

    const block = {
      c: function create() {
        section = element("section");
        h1 = element("h1");
        h1.textContent = "Opprett en konto";
        t1 = space();
        div0 = element("div");
        div0.textContent =
          "Brukernavn kan være hva som helst, men passord må inneholde følgende: 2\n    store bokstaver, 2 irregulære tegn (eks: @!& osv) og minst 1 tall.";
        t3 = space();
        div1 = element("div");
        t4 = text("Har du allerede en bruker? ");
        a = element("a");
        a.textContent = "Klikk her";
        t6 = text(" for å logge inn.");
        t7 = space();
        form = element("form");
        div4 = element("div");
        if (if_block) if_block.c();
        t8 = space();
        label0 = element("label");
        div2 = element("div");
        div2.textContent = "Brukernavn:";
        t10 = space();
        input0 = element("input");
        t11 = space();
        label1 = element("label");
        div3 = element("div");
        div3.textContent = "Passord:";
        t13 = space();
        input1 = element("input");
        t14 = space();
        label2 = element("label");
        input2 = element("input");
        t15 = space();
        div5 = element("div");
        small = element("small");
        t16 = text("Passord:\n        ");
        strong = element("strong");
        t17 = text(/*enteredPassword*/ ctx[1]);
        t18 = text("\n        gyldig: ");
        t19 = text(/*isValid*/ ctx[2]);
        add_location(h1, file$4, 1, 2, 12);
        add_location(div0, file$4, 2, 2, 40);
        attr_dev(a, "href", "/user/login");
        add_location(a, file$4, 7, 31, 241);
        add_location(div1, file$4, 6, 2, 204);
        add_location(div2, file$4, 17, 8, 538);
        attr_dev(input0, "type", "text");
        attr_dev(input0, "placeholder", "username");
        add_location(input0, file$4, 18, 8, 569);
        add_location(label0, file$4, 16, 6, 522);
        add_location(div3, file$4, 21, 8, 651);
        attr_dev(input1, "class", /*passwordClass*/ ctx[3]);
        attr_dev(input1, "type", "password");
        attr_dev(input1, "placeholder", "password");
        add_location(input1, file$4, 22, 8, 679);
        add_location(label1, file$4, 20, 6, 635);
        attr_dev(input2, "class", "submit");
        attr_dev(input2, "type", "submit");
        input2.value = "Opprett konto";
        add_location(input2, file$4, 30, 8, 870);
        add_location(label2, file$4, 29, 6, 854);
        attr_dev(div4, "class", "login");
        add_location(div4, file$4, 10, 4, 371);
        add_location(strong, file$4, 41, 8, 1094);
        add_location(small, file$4, 39, 6, 1061);
        add_location(div5, file$4, 38, 4, 1049);
        attr_dev(form, "id", "loginForm");
        add_location(form, file$4, 9, 2, 305);
        add_location(section, file$4, 0, 0, 0);

        dispose = [
          listen_dev(
            input1,
            "keyup",
            /*handlePasswordInput*/ ctx[4],
            false,
            false,
            false
          ),
          listen_dev(
            input2,
            "submit",
            prevent_default(/*handleSubmit*/ ctx[5]),
            false,
            true,
            false
          ),
          listen_dev(
            form,
            "submit",
            prevent_default(/*handleSubmit*/ ctx[5]),
            false,
            true,
            false
          )
        ];
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, h1);
        append_dev(section, t1);
        append_dev(section, div0);
        append_dev(section, t3);
        append_dev(section, div1);
        append_dev(div1, t4);
        append_dev(div1, a);
        append_dev(div1, t6);
        append_dev(section, t7);
        append_dev(section, form);
        append_dev(form, div4);
        if (if_block) if_block.m(div4, null);
        append_dev(div4, t8);
        append_dev(div4, label0);
        append_dev(label0, div2);
        append_dev(label0, t10);
        append_dev(label0, input0);
        append_dev(div4, t11);
        append_dev(div4, label1);
        append_dev(label1, div3);
        append_dev(label1, t13);
        append_dev(label1, input1);
        append_dev(div4, t14);
        append_dev(div4, label2);
        append_dev(label2, input2);
        append_dev(form, t15);
        append_dev(form, div5);
        append_dev(div5, small);
        append_dev(small, t16);
        append_dev(small, strong);
        append_dev(strong, t17);
        append_dev(small, t18);
        append_dev(small, t19);
      },
      p: function update(ctx, dirty) {
        if (/*hasError*/ ctx[0]) {
          if (!if_block) {
            if_block = create_if_block$2(ctx);
            if_block.c();
            if_block.m(div4, t8);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (dirty[0] & /*passwordClass*/ 8) {
          attr_dev(input1, "class", /*passwordClass*/ ctx[3]);
        }

        if (dirty[0] & /*enteredPassword*/ 2)
          set_data_dev(t17, /*enteredPassword*/ ctx[1]);
        if (dirty[0] & /*isValid*/ 4) set_data_dev(t19, /*isValid*/ ctx[2]);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (if_block) if_block.d();
        run_all(dispose);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$5.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$3($$self, $$props, $$invalidate) {
    var hasError;
    var enteredPassword = "";
    var isValid = false;
    var passwordClass = "untouched";
    var isSubmittedOnce;

    function handlePasswordInput(event) {
      $$invalidate(1, (enteredPassword = event.target.value));
      $$invalidate(2, (isValid = password_validation(enteredPassword)));

      if (isValid) {
        $$invalidate(3, (passwordClass = "green"));
      } else if (!isValid && isSubmittedOnce) {
        $$invalidate(3, (passwordClass = "red"));
      }
    }

    function handleSubmit(event) {
      console.log("try submit", event.target);
      isSubmittedOnce = true;
      const username = event.target[0].value;
      const password = event.target[1].value;
      const body = JSON.stringify({ username, password });

      fetch("/api/v1/user/create", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        referrer: "no-referrer",
        body
      })
        .then(res => res.json())
        .then(loginResult => {
          console.log(loginResult);

          if (loginResult.status === "success") {
            push("/user/profile");
          } else {
            $$invalidate(0, (hasError = true));
            $$invalidate(3, (passwordClass = "red"));
          }
        });
    }

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("hasError" in $$props) $$invalidate(0, (hasError = $$props.hasError));
      if ("enteredPassword" in $$props)
        $$invalidate(1, (enteredPassword = $$props.enteredPassword));
      if ("isValid" in $$props) $$invalidate(2, (isValid = $$props.isValid));
      if ("passwordClass" in $$props)
        $$invalidate(3, (passwordClass = $$props.passwordClass));
      if ("isSubmittedOnce" in $$props)
        isSubmittedOnce = $$props.isSubmittedOnce;
    };

    return [
      hasError,
      enteredPassword,
      isValid,
      passwordClass,
      handlePasswordInput,
      handleSubmit
    ];
  }

  class Create$1 extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$3, create_fragment$5, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Create",
        options,
        id: create_fragment$5.name
      });
    }
  }

  /* src/routes/user/login.svelte generated by Svelte v3.16.4 */
  const file$5 = "src/routes/user/login.svelte";

  // (10:4) {#if hasError}
  function create_if_block$3(ctx) {
    let div;
    let span;

    const block = {
      c: function create() {
        div = element("div");
        span = element("span");
        span.textContent = "ERROR!";
        add_location(span, file$5, 11, 8, 310);
        attr_dev(div, "class", "login-error");
        add_location(div, file$5, 10, 6, 276);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, span);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$3.name,
      type: "if",
      source: "(10:4) {#if hasError}",
      ctx
    });

    return block;
  }

  function create_fragment$6(ctx) {
    let section;
    let form;
    let h1;
    let t1;
    let div0;
    let t2;
    let a;
    let t4;
    let t5;
    let div3;
    let t6;
    let label0;
    let div1;
    let t8;
    let input0;
    let t9;
    let label1;
    let div2;
    let t11;
    let input1;
    let t12;
    let label2;
    let button;
    let dispose;
    let if_block = /*hasError*/ ctx[0] && create_if_block$3(ctx);

    const block = {
      c: function create() {
        section = element("section");
        form = element("form");
        h1 = element("h1");
        h1.textContent = "Logg inn";
        t1 = space();
        div0 = element("div");
        t2 = text(
          "Logg inn med ditt brukernavn og passord. Har du ikke en bruker? \n    "
        );
        a = element("a");
        a.textContent = "Klikk her";
        t4 = text(" for å opprette en.");
        t5 = space();
        div3 = element("div");
        if (if_block) if_block.c();
        t6 = space();
        label0 = element("label");
        div1 = element("div");
        div1.textContent = "Brukernavn:";
        t8 = space();
        input0 = element("input");
        t9 = space();
        label1 = element("label");
        div2 = element("div");
        div2.textContent = "Passord:";
        t11 = space();
        input1 = element("input");
        t12 = space();
        label2 = element("label");
        button = element("button");
        button.textContent = "Logg inn";
        add_location(h1, file$5, 2, 2, 61);
        attr_dev(a, "href", "/#/user/create");
        add_location(a, file$5, 5, 4, 160);
        add_location(div0, file$5, 3, 2, 81);
        add_location(div1, file$5, 15, 8, 369);
        attr_dev(input0, "type", "text");
        attr_dev(input0, "placeholder", "username");
        add_location(input0, file$5, 16, 8, 400);
        add_location(label0, file$5, 14, 0, 353);
        add_location(div2, file$5, 19, 8, 480);
        attr_dev(input1, "type", "password");
        attr_dev(input1, "placeholder", "password");
        add_location(input1, file$5, 20, 6, 506);
        add_location(label1, file$5, 18, 4, 464);
        add_location(button, file$5, 23, 6, 586);
        add_location(label2, file$5, 22, 4, 572);
        attr_dev(div3, "class", "login");
        add_location(div3, file$5, 8, 2, 231);
        attr_dev(form, "id", "loginForm");
        add_location(form, file$5, 1, 0, 10);
        add_location(section, file$5, 0, 0, 0);
        dispose = listen_dev(
          form,
          "submit",
          /*handleSubmit*/ ctx[1],
          false,
          false,
          false
        );
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, form);
        append_dev(form, h1);
        append_dev(form, t1);
        append_dev(form, div0);
        append_dev(div0, t2);
        append_dev(div0, a);
        append_dev(div0, t4);
        append_dev(form, t5);
        append_dev(form, div3);
        if (if_block) if_block.m(div3, null);
        append_dev(div3, t6);
        append_dev(div3, label0);
        append_dev(label0, div1);
        append_dev(label0, t8);
        append_dev(label0, input0);
        append_dev(div3, t9);
        append_dev(div3, label1);
        append_dev(label1, div2);
        append_dev(label1, t11);
        append_dev(label1, input1);
        append_dev(div3, t12);
        append_dev(div3, label2);
        append_dev(label2, button);
      },
      p: function update(ctx, dirty) {
        if (/*hasError*/ ctx[0]) {
          if (!if_block) {
            if_block = create_if_block$3(ctx);
            if_block.c();
            if_block.m(div3, t6);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (if_block) if_block.d();
        dispose();
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$6.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$4($$self, $$props, $$invalidate) {
    var hasError;

    function handleSubmit(event) {
      console.log(event.target);
      const username = event.target[0].value;
      const password = event.target[1].value;
      const body = JSON.stringify({ username, password });

      fetch("/api/v1/user/login", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        referrer: "no-referrer",
        body
      })
        .then(res => res.json())
        .then(loginResult => {
          console.log(loginResult);

          if (loginResult.status === "success") {
            push("/user/profile");
          } else {
            $$invalidate(0, (hasError = true));
          }
        });

      event.preventDefault();
    }

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("hasError" in $$props) $$invalidate(0, (hasError = $$props.hasError));
    };

    return [hasError, handleSubmit];
  }

  class Login extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$4, create_fragment$6, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Login",
        options,
        id: create_fragment$6.name
      });
    }
  }

  /* src/routes/user/profile.svelte generated by Svelte v3.16.4 */
  const file$6 = "src/routes/user/profile.svelte";

  // (1:0) {#if !isAuthenticated}
  function create_if_block_1$1(ctx) {
    let section;
    let div;

    const block = {
      c: function create() {
        section = element("section");
        div = element("div");
        div.textContent = "Vennligst vent... henter din brukerinformasjon.";
        attr_dev(div, "class", "center middle");
        add_location(div, file$6, 2, 4, 59);
        attr_dev(section, "class", "grid single");
        add_location(section, file$6, 1, 2, 25);
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, div);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$1.name,
      type: "if",
      source: "(1:0) {#if !isAuthenticated}",
      ctx
    });

    return block;
  }

  // (8:0) {#if isAuthenticated}
  function create_if_block$4(ctx) {
    let section;
    let h1;
    let t0;
    let t1;
    let t2;
    let div;
    let t4;
    let ul;
    let li0;
    let t5;
    let a0;
    let link_action;
    let t7;
    let t8;
    let li1;
    let t9;
    let a1;
    let link_action_1;
    let t11;
    let t12;
    let li2;
    let t13;
    let a2;
    let link_action_2;
    let t15;
    let t16;
    let li3;
    let t17;
    let a3;
    let link_action_3;
    let t19;

    const block = {
      c: function create() {
        section = element("section");
        h1 = element("h1");
        t0 = text("Velkommen ");
        t1 = text(/*name*/ ctx[0]);
        t2 = space();
        div = element("div");
        div.textContent = "Hva kan jeg gjøre for deg i dag?";
        t4 = space();
        ul = element("ul");
        li0 = element("li");
        t5 = text("Du kan\n        ");
        a0 = element("a");
        a0.textContent = "skrive";
        t7 = text("\n        et notat");
        t8 = space();
        li1 = element("li");
        t9 = text("Du kan også\n        ");
        a1 = element("a");
        a1.textContent = "vise";
        t11 = text("\n        dine lagrede notater");
        t12 = space();
        li2 = element("li");
        t13 = text("Eller hva med å sende en\n        ");
        a2 = element("a");
        a2.textContent = "hemmelig melding";
        t15 = text("\n        til en annen bruker?");
        t16 = space();
        li3 = element("li");
        t17 = text("Du har forresten\n        ");
        a3 = element("a");
        a3.textContent = "1";
        t19 = text("\n        ventende beskjed");
        add_location(h1, file$6, 9, 4, 209);
        add_location(div, file$6, 10, 4, 239);
        attr_dev(a0, "href", "/note/create");
        add_location(a0, file$6, 14, 8, 326);
        add_location(li0, file$6, 12, 6, 298);
        attr_dev(a1, "href", "/note/list");
        add_location(a1, file$6, 20, 8, 438);
        add_location(li1, file$6, 18, 6, 405);
        attr_dev(a2, "href", "/message/write");
        add_location(a2, file$6, 26, 8, 571);
        add_location(li2, file$6, 24, 6, 525);
        attr_dev(a3, "href", "/message/inbox");
        add_location(a3, file$6, 32, 8, 712);
        add_location(li3, file$6, 30, 6, 674);
        add_location(ul, file$6, 11, 4, 287);
        add_location(section, file$6, 8, 2, 195);
      },
      m: function mount(target, anchor) {
        insert_dev(target, section, anchor);
        append_dev(section, h1);
        append_dev(h1, t0);
        append_dev(h1, t1);
        append_dev(section, t2);
        append_dev(section, div);
        append_dev(section, t4);
        append_dev(section, ul);
        append_dev(ul, li0);
        append_dev(li0, t5);
        append_dev(li0, a0);
        link_action = link.call(null, a0) || {};
        append_dev(li0, t7);
        append_dev(ul, t8);
        append_dev(ul, li1);
        append_dev(li1, t9);
        append_dev(li1, a1);
        link_action_1 = link.call(null, a1) || {};
        append_dev(li1, t11);
        append_dev(ul, t12);
        append_dev(ul, li2);
        append_dev(li2, t13);
        append_dev(li2, a2);
        link_action_2 = link.call(null, a2) || {};
        append_dev(li2, t15);
        append_dev(ul, t16);
        append_dev(ul, li3);
        append_dev(li3, t17);
        append_dev(li3, a3);
        link_action_3 = link.call(null, a3) || {};
        append_dev(li3, t19);
      },
      p: function update(ctx, dirty) {
        if (dirty[0] & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(section);
        if (link_action && is_function(link_action.destroy))
          link_action.destroy();
        if (link_action_1 && is_function(link_action_1.destroy))
          link_action_1.destroy();
        if (link_action_2 && is_function(link_action_2.destroy))
          link_action_2.destroy();
        if (link_action_3 && is_function(link_action_3.destroy))
          link_action_3.destroy();
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$4.name,
      type: "if",
      source: "(8:0) {#if isAuthenticated}",
      ctx
    });

    return block;
  }

  function create_fragment$7(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = !(/*isAuthenticated*/ ctx[1]) && create_if_block_1$1(ctx);
    let if_block1 = /*isAuthenticated*/ ctx[1] && create_if_block$4(ctx);

    const block = {
      c: function create() {
        if (if_block0) if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        if_block1_anchor = empty();
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert_dev(target, t, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert_dev(target, if_block1_anchor, anchor);
      },
      p: function update(ctx, dirty) {
        if (!(/*isAuthenticated*/ ctx[1])) {
          if (!if_block0) {
            if_block0 = create_if_block_1$1(ctx);
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (/*isAuthenticated*/ ctx[1]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block$4(ctx);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (if_block0) if_block0.d(detaching);
        if (detaching) detach_dev(t);
        if (if_block1) if_block1.d(detaching);
        if (detaching) detach_dev(if_block1_anchor);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$7.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$5($$self, $$props, $$invalidate) {
    var name = "";
    var isAuthenticated;

    onMount(async () => {
      const res = await fetch(`/api/v1/session`);
      var result = await res.json();

      if (result.message === "Unauthorized!") {
        replace$1("/user/login");
      }

      $$invalidate(1, (isAuthenticated = true));
      $$invalidate(0, (name = result.username));
    });

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("name" in $$props) $$invalidate(0, (name = $$props.name));
      if ("isAuthenticated" in $$props)
        $$invalidate(1, (isAuthenticated = $$props.isAuthenticated));
    };

    return [name, isAuthenticated];
  }

  class Profile extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$5, create_fragment$7, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Profile",
        options,
        id: create_fragment$7.name
      });
    }
  }

  // Components

  let routes;
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("routemap")) {
    routes = {
      // Exact path
      "/": Home,
      "/user/login": Login,
      "/user/create": Create$1,
      "/user/profile": Profile,

      "/note/create": Create,
      "/note/list": List,

      // Catch-all, must be last
      "*": Notfound
    };
  }
  var routes$1 = routes;

  /* src/app.svelte generated by Svelte v3.16.4 */
  const file$7 = "src/app.svelte";

  // (11:6) {#if showLogin}
  function create_if_block$5(ctx) {
    let li;
    let a;

    const block = {
      c: function create() {
        li = element("li");
        a = element("a");
        a.textContent = "Login";
        attr_dev(a, "href", "/#/user/login");
        add_location(a, file$7, 12, 10, 222);
        add_location(li, file$7, 11, 8, 207);
      },
      m: function mount(target, anchor) {
        insert_dev(target, li, anchor);
        append_dev(li, a);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(li);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$5.name,
      type: "if",
      source: "(11:6) {#if showLogin}",
      ctx
    });

    return block;
  }

  function create_fragment$8(ctx) {
    let header;
    let div;
    let t1_1;
    let nav;
    let ul;
    let li0;
    let a0;
    let t3;
    let li1;
    let a1;
    let t5;
    let t6;
    let t7;
    let footer;
    let p;
    let current;
    let if_block = /*showLogin*/ ctx[0] && create_if_block$5(ctx);
    const router = new Router({ props: { routes: routes$1 }, $$inline: true });
    router.$on("conditionsFailed", conditionsFailed);
    router.$on("routeLoaded", routeLoaded);

    const block = {
      c: function create() {
        header = element("header");
        div = element("div");
        div.textContent = "Security Demo";
        t1_1 = space();
        nav = element("nav");
        ul = element("ul");
        li0 = element("li");
        a0 = element("a");
        a0.textContent = "Start";
        t3 = space();
        li1 = element("li");
        a1 = element("a");
        a1.textContent = "Profile";
        t5 = space();
        if (if_block) if_block.c();
        t6 = space();
        create_component(router.$$.fragment);
        t7 = space();
        footer = element("footer");
        p = element("p");
        p.textContent = "© Sven Anders Robbestad 2019";
        add_location(div, file$7, 1, 2, 11);
        attr_dev(a0, "href", "/#/");
        add_location(a0, file$7, 5, 8, 72);
        add_location(li0, file$7, 4, 6, 59);
        attr_dev(a1, "href", "/#/user/profile");
        add_location(a1, file$7, 8, 8, 127);
        add_location(li1, file$7, 7, 6, 114);
        add_location(ul, file$7, 3, 4, 48);
        add_location(nav, file$7, 2, 2, 38);
        add_location(header, file$7, 0, 0, 0);
        add_location(p, file$7, 24, 2, 420);
        add_location(footer, file$7, 23, 0, 409);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, header, anchor);
        append_dev(header, div);
        append_dev(header, t1_1);
        append_dev(header, nav);
        append_dev(nav, ul);
        append_dev(ul, li0);
        append_dev(li0, a0);
        append_dev(ul, t3);
        append_dev(ul, li1);
        append_dev(li1, a1);
        append_dev(ul, t5);
        if (if_block) if_block.m(ul, null);
        insert_dev(target, t6, anchor);
        mount_component(router, target, anchor);
        insert_dev(target, t7, anchor);
        insert_dev(target, footer, anchor);
        append_dev(footer, p);
        current = true;
      },
      p: noop,
      i: function intro(local) {
        if (current) return;
        transition_in(router.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(router.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(header);
        if (if_block) if_block.d();
        if (detaching) detach_dev(t6);
        destroy_component(router, detaching);
        if (detaching) detach_dev(t7);
        if (detaching) detach_dev(footer);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$8.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function conditionsFailed(event) {
    console.error("Caught event conditionsFailed", event.detail);
    logbox += "conditionsFailed - " + JSON.stringify(event.detail) + "\n";
    replace("/error");
  }

  function routeLoaded(event) {
    console.info("Caught event routeLoaded", event.detail);
  }

  function instance$6($$self) {
    var showLogin = document.cookie.indexOf("showlogin=false") === -1;
    var isAuthenticated;
    var expireTime, interval;
    var t0 = performance.now(),
      t1;

    function startInterval(callback, milliseconds) {
      console.log("create interval");
      interval = setInterval(callback, milliseconds);

      onDestroy(() => {
        console.log("destroying interval");
        clearInterval(interval);
      });
    }

    onDestroy(() => {
      console.log("destroying interval");
      clearInterval(interval);
    });

    async function fetchSession() {
      console.count("session");
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

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("showLogin" in $$props)
        $$invalidate(0, (showLogin = $$props.showLogin));
      if ("isAuthenticated" in $$props)
        isAuthenticated = $$props.isAuthenticated;
      if ("expireTime" in $$props) expireTime = $$props.expireTime;
      if ("interval" in $$props) interval = $$props.interval;
      if ("t0" in $$props) t0 = $$props.t0;
      if ("t1" in $$props) t1 = $$props.t1;
    };

    return [showLogin];
  }

  class App extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$6, create_fragment$8, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "App",
        options,
        id: create_fragment$8.name
      });
    }
  }

  // Initialize the Svelte app and inject it in the DOM
  const app = new App({
    target: document.querySelector("main")
  });

  return app;
})();
//# sourceMappingURL=bundle.js.map
