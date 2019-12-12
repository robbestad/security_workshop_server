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

  function wrap(route, userData, ...conditions) {
    if (userData && typeof userData == "function") {
      conditions = conditions && conditions.length ? conditions : [];
      conditions.unshift(userData);
      userData = undefined;
    }

    if (!route || typeof route != "function") {
      throw Error("Invalid parameter route");
    }

    if (conditions && conditions.length) {
      for (let i = 0; i < conditions.length; i++) {
        if (!conditions[i] || typeof conditions[i] != "function") {
          throw Error("Invalid parameter conditions[" + i + "]");
        }
      }
    }

    const obj = { route, userData };

    if (conditions && conditions.length) {
      obj.conditions = conditions;
    }

    Object.defineProperty(obj, "_sveltesparouter", { value: true });
    return obj;
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

  function replace(location) {
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

  /* src/routes/Home.svelte generated by Svelte v3.16.4 */

  const file = "src/routes/Home.svelte";

  function create_fragment$1(ctx) {
    let h2;
    let t1;
    let p0;
    let t3;
    let p1;
    let t5;
    let ul;
    let li0;
    let t7;
    let li1;
    let t9;
    let li2;
    let t11;
    let li3;
    let t13;
    let li4;

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "Home!";
        t1 = space();
        p0 = element("p");
        p0.textContent = "Welcome to this sample code!";
        t3 = space();
        p1 = element("p");
        p1.textContent = "Things to try:";
        t5 = space();
        ul = element("ul");
        li0 = element("li");
        li0.textContent =
          "Navigate around with the links and buttons (notice how certain links become active depending on the path";
        t7 = space();
        li1 = element("li");
        li1.textContent = "Try pressing the browsers' back and forward buttons";
        t9 = space();
        li2 = element("li");
        li2.textContent =
          'The "Replace current page" button will change the page without adding a new item in the history stack (try pressing the back button!)';
        t11 = space();
        li3 = element("li");
        li3.textContent = "Manually change the URL's fragment/hash";
        t13 = space();
        li4 = element("li");
        li4.textContent = "Try refreshing the page";
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file, 0, 0, 0);
        add_location(p0, file, 2, 0, 35);
        add_location(p1, file, 3, 0, 71);
        add_location(li0, file, 5, 4, 102);
        add_location(li1, file, 6, 4, 220);
        add_location(li2, file, 7, 4, 285);
        add_location(li3, file, 8, 4, 432);
        add_location(li4, file, 9, 4, 485);
        add_location(ul, file, 4, 0, 93);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p0, anchor);
        insert_dev(target, t3, anchor);
        insert_dev(target, p1, anchor);
        insert_dev(target, t5, anchor);
        insert_dev(target, ul, anchor);
        append_dev(ul, li0);
        append_dev(ul, t7);
        append_dev(ul, li1);
        append_dev(ul, t9);
        append_dev(ul, li2);
        append_dev(ul, t11);
        append_dev(ul, li3);
        append_dev(ul, t13);
        append_dev(ul, li4);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p0);
        if (detaching) detach_dev(t3);
        if (detaching) detach_dev(p1);
        if (detaching) detach_dev(t5);
        if (detaching) detach_dev(ul);
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

  /* src/routes/login.svelte generated by Svelte v3.16.4 */
  const file$1 = "src/routes/login.svelte";

  function create_fragment$2(ctx) {
    let form;
    let div;
    let label0;
    let input0;
    let t0;
    let label1;
    let input1;
    let t1;
    let label2;
    let button;
    let dispose;

    const block = {
      c: function create() {
        form = element("form");
        div = element("div");
        label0 = element("label");
        input0 = element("input");
        t0 = space();
        label1 = element("label");
        input1 = element("input");
        t1 = space();
        label2 = element("label");
        button = element("button");
        button.textContent = "Logg inn";
        attr_dev(input0, "type", "text");
        attr_dev(input0, "placeholder", "username");
        add_location(input0, file$1, 3, 14, 110);
        add_location(label0, file$1, 2, 12, 88);
        attr_dev(input1, "type", "password");
        attr_dev(input1, "placeholder", "password");
        add_location(input1, file$1, 6, 14, 210);
        add_location(label1, file$1, 5, 12, 188);
        add_location(button, file$1, 9, 14, 314);
        add_location(label2, file$1, 8, 12, 292);
        attr_dev(div, "class", "login");
        add_location(div, file$1, 1, 10, 56);
        attr_dev(form, "id", "loginForm");
        add_location(form, file$1, 0, 0, 0);
        dispose = listen_dev(form, "submit", handleClick, false, false, false);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, form, anchor);
        append_dev(form, div);
        append_dev(div, label0);
        append_dev(label0, input0);
        append_dev(div, t0);
        append_dev(div, label1);
        append_dev(label1, input1);
        append_dev(div, t1);
        append_dev(div, label2);
        append_dev(label2, button);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(form);
        dispose();
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

  function handleClick(event) {
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
          push("/profile");
        }
      });

    event.preventDefault();
  }

  class Login extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, null, create_fragment$2, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Login",
        options,
        id: create_fragment$2.name
      });
    }
  }

  /* src/routes/Lucky.svelte generated by Svelte v3.16.4 */

  const file$2 = "src/routes/Lucky.svelte";

  function create_fragment$3(ctx) {
    let h1;
    let t1;
    let p;

    const block = {
      c: function create() {
        h1 = element("h1");
        h1.textContent = "You're in!";
        t1 = space();
        p = element("p");
        p.textContent =
          "This route has a pre-condition that stops it from loading 50% of the time. So, you were lucky you could load this route! Now, try refreshing the page.";
        attr_dev(h1, "id", "lucky");
        add_location(h1, file$2, 0, 0, 0);
        add_location(p, file$2, 2, 0, 32);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h1, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h1);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p);
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

  class Lucky extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, null, create_fragment$3, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Lucky",
        options,
        id: create_fragment$3.name
      });
    }
  }

  /* src/routes/Name.svelte generated by Svelte v3.16.4 */

  const file$3 = "src/routes/Name.svelte";

  // (3:58) {#if params.last}
  function create_if_block(ctx) {
    let t_value = /*params*/ ctx[0].last + "";
    let t;

    const block = {
      c: function create() {
        t = text(t_value);
      },
      m: function mount(target, anchor) {
        insert_dev(target, t, anchor);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*params*/ 1 &&
          t_value !== (t_value = /*params*/ ctx[0].last + "")
        )
          set_data_dev(t, t_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(t);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source: "(3:58) {#if params.last}",
      ctx
    });

    return block;
  }

  function create_fragment$4(ctx) {
    let h2;
    let t1;
    let p0;
    let t2;
    let b0;
    let t3_value = /*params*/ ctx[0].first + "";
    let t3;
    let t4;
    let b1;
    let t5;
    let p1;
    let em;
    let t7;
    let code;
    let if_block = /*params*/ ctx[0].last && create_if_block(ctx);

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "Hi there!";
        t1 = space();
        p0 = element("p");
        t2 = text("Your name is: ");
        b0 = element("b");
        t3 = text(t3_value);
        t4 = space();
        b1 = element("b");
        if (if_block) if_block.c();
        t5 = space();
        p1 = element("p");
        em = element("em");
        em.textContent = "Hint:";
        t7 = text(" Try changing the URL and add your name, e.g. ");
        code = element("code");
        code.textContent = "/hello/jane/doe";
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file$3, 0, 0, 0);
        add_location(b0, file$3, 2, 33, 72);
        add_location(b1, file$3, 2, 55, 94);
        attr_dev(p0, "id", "nameparams");
        add_location(p0, file$3, 2, 0, 39);
        add_location(em, file$3, 3, 3, 144);
        add_location(code, file$3, 3, 63, 204);
        add_location(p1, file$3, 3, 0, 141);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p0, anchor);
        append_dev(p0, t2);
        append_dev(p0, b0);
        append_dev(b0, t3);
        append_dev(p0, t4);
        append_dev(p0, b1);
        if (if_block) if_block.m(b1, null);
        insert_dev(target, t5, anchor);
        insert_dev(target, p1, anchor);
        append_dev(p1, em);
        append_dev(p1, t7);
        append_dev(p1, code);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*params*/ 1 &&
          t3_value !== (t3_value = /*params*/ ctx[0].first + "")
        )
          set_data_dev(t3, t3_value);

        if (/*params*/ ctx[0].last) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block(ctx);
            if_block.c();
            if_block.m(b1, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p0);
        if (if_block) if_block.d();
        if (detaching) detach_dev(t5);
        if (detaching) detach_dev(p1);
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

  function instance$1($$self, $$props, $$invalidate) {
    let { params = {} } = $$props;
    const writable_props = ["params"];

    Object.keys($$props).forEach(key => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Name> was created with unknown prop '${key}'`);
    });

    $$self.$set = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    $$self.$capture_state = () => {
      return { params };
    };

    $$self.$inject_state = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    return [params];
  }

  class Name extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$1, create_fragment$4, safe_not_equal, {
        params: 0
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Name",
        options,
        id: create_fragment$4.name
      });
    }

    get params() {
      throw new Error(
        "<Name>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set params(value) {
      throw new Error(
        "<Name>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src/routes/Wild.svelte generated by Svelte v3.16.4 */

  const file$4 = "src/routes/Wild.svelte";

  function create_fragment$5(ctx) {
    let h2;
    let t1;
    let p;
    let t2;
    let t3_value = /*params*/ ctx[0].wild + "";
    let t3;

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "Wild";
        t1 = space();
        p = element("p");
        t2 = text("Your message is: ");
        t3 = text(t3_value);
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file$4, 0, 0, 0);
        add_location(p, file$4, 2, 0, 34);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p, anchor);
        append_dev(p, t2);
        append_dev(p, t3);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*params*/ 1 &&
          t3_value !== (t3_value = /*params*/ ctx[0].wild + "")
        )
          set_data_dev(t3, t3_value);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p);
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

  function instance$2($$self, $$props, $$invalidate) {
    let { params = {} } = $$props;
    const writable_props = ["params"];

    Object.keys($$props).forEach(key => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Wild> was created with unknown prop '${key}'`);
    });

    $$self.$set = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    $$self.$capture_state = () => {
      return { params };
    };

    $$self.$inject_state = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    return [params];
  }

  class Wild extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$2, create_fragment$5, safe_not_equal, {
        params: 0
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Wild",
        options,
        id: create_fragment$5.name
      });
    }

    get params() {
      throw new Error(
        "<Wild>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set params(value) {
      throw new Error(
        "<Wild>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src/routes/NotFound.svelte generated by Svelte v3.16.4 */

  const file$5 = "src/routes/NotFound.svelte";

  function create_fragment$6(ctx) {
    let h2;
    let t1;
    let p;

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "NotFound";
        t1 = space();
        p = element("p");
        p.textContent = "Oops, this route doesn't exist!";
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file$5, 0, 0, 0);
        add_location(p, file$5, 2, 0, 38);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p);
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

  class NotFound extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, null, create_fragment$6, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "NotFound",
        options,
        id: create_fragment$6.name
      });
    }
  }

  /* src/routes/Nested.svelte generated by Svelte v3.16.4 */
  const file$6 = "src/routes/Nested.svelte";

  function create_fragment$7(ctx) {
    let h2;
    let t1;
    let current;

    const router = new Router({
      props: {
        routes: /*routes*/ ctx[0],
        prefix: "/nested"
      },
      $$inline: true
    });

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "Nested router";
        t1 = space();
        create_component(router.$$.fragment);
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file$6, 0, 0, 0);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        mount_component(router, target, anchor);
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
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        destroy_component(router, detaching);
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

  function instance$3($$self) {
    const routes = {
      "/wild": Wild,
      "/wild/*": Wild,
      "*": NotFound
    };

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {};

    return [routes];
  }

  class Nested extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$3, create_fragment$7, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Nested",
        options,
        id: create_fragment$7.name
      });
    }
  }

  /* src/routes/Regex.svelte generated by Svelte v3.16.4 */

  const file$7 = "src/routes/Regex.svelte";

  function create_fragment$8(ctx) {
    let h2;
    let t1;
    let p;
    let t2;
    let code;
    let t3_value = JSON.stringify(/*params*/ ctx[0]) + "";
    let t3;

    const block = {
      c: function create() {
        h2 = element("h2");
        h2.textContent = "Regex route";
        t1 = space();
        p = element("p");
        t2 = text("Match is: ");
        code = element("code");
        t3 = text(t3_value);
        attr_dev(h2, "class", "routetitle");
        add_location(h2, file$7, 0, 0, 0);
        attr_dev(code, "id", "regexmatch");
        add_location(code, file$7, 2, 13, 54);
        add_location(p, file$7, 2, 0, 41);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h2, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, p, anchor);
        append_dev(p, t2);
        append_dev(p, code);
        append_dev(code, t3);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*params*/ 1 &&
          t3_value !== (t3_value = JSON.stringify(/*params*/ ctx[0]) + "")
        )
          set_data_dev(t3, t3_value);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(h2);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(p);
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

  function instance$4($$self, $$props, $$invalidate) {
    let { params = {} } = $$props;
    const writable_props = ["params"];

    Object.keys($$props).forEach(key => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Regex> was created with unknown prop '${key}'`);
    });

    $$self.$set = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    $$self.$capture_state = () => {
      return { params };
    };

    $$self.$inject_state = $$props => {
      if ("params" in $$props) $$invalidate(0, (params = $$props.params));
    };

    return [params];
  }

  class Regex extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$4, create_fragment$8, safe_not_equal, {
        params: 0
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Regex",
        options,
        id: create_fragment$8.name
      });
    }

    get params() {
      throw new Error(
        "<Regex>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set params(value) {
      throw new Error(
        "<Regex>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  // Components

  // This demonstrates how to pass routes as a POJO (Plain Old JavaScript Object) or a JS Map
  // In this code sample we're using both (controlling at runtime what's enabled, by checking for the 'routemap=1' querystring parameter) just because we are using this code sample for tests too
  // In your code, you'll likely want to choose one of the two options only
  let routes;
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("routemap")) {
    // The simples way to define routes is to use a dictionary.
    // This is a key->value pair in which the key is a string of the path.
    // The path is passed to regexparam that does some transformations allowing the use of params and wildcards
    routes = {
      // Exact path
      "/": Home,
      "/login": Login,

      // Using named parameters, with last being optional
      "/hello/:first/:last?": Name,

      // Wildcard parameter
      "/wild": Wild,
      // Special route that has custom data that will be passed to the `routeLoaded` event
      "/wild/data": wrap(Wild, { hello: "world" }),
      "/wild/*": Wild,

      // This component contains a nested router
      // Note that we must match both '/nested' and '/nested/*' for the nested router to work (or look below at doing this with a Map and a regular expression)
      "/nested": Nested,
      "/nested/*": Nested,

      // Catch-all, must be last
      "*": NotFound
    };
  } else {
    routes = new Map();

    // Exact path
    routes.set("/", Home);
    routes.set("/", Login);

    // Allow children to also signal link activation
    routes.set("/brand", Home);

    // Using named parameters, with last being optional
    routes.set("/hello/:first/:last?", Name);

    // Wildcard parameter
    routes.set("/wild", Wild);
    // Special route that has custom data that will be passed to the `routeLoaded` event
    routes.set("/wild/data", wrap(Wild, { hello: "world" }));
    routes.set("/wild/*", Wild);

    // This route has a pre-condition function that lets people in only 50% of times (and a second pre-condition that is always true)
    // The second argument is a custom data object that will be passed to the `nn` event if the pre-conditions fail
    routes.set(
      "/lucky",
      wrap(
        Lucky,
        { foo: "bar" },
        detail => {
          return Math.random() > 0.5;
        },
        detail => {
          // This pre-condition is executed only if the first one succeeded
          // eslint-disable-next-line no-console
          console.log(
            "Pre-condition 2 executed",
            detail.location,
            detail.querystring,
            detail.userData
          );
          return true;
        }
      )
    );

    // Regular expressions
    routes.set(/^\/regex\/(.*)?/i, Regex);
    routes.set(/^\/(pattern|match)(\/[a-z0-9]+)?/i, Regex);

    // This component contains a nested router
    // Thanks to being able to define routes via regular expressions, this allows us to use a single line rather than 2 ('/nested' and '/nested/*')
    routes.set(/^\/nested(\/(.*))?/, Nested);

    // Catch-all, must be last
    routes.set("*", NotFound);
  }

  var routes$1 = routes;

  /* src/App.svelte generated by Svelte v3.16.4 */
  const file$8 = "src/App.svelte";

  function create_fragment$9(ctx) {
    let h1;
    let t1;
    let ul;
    let li0;
    let a0;
    let link_action;
    let active_action;
    let t3;
    let li1;
    let a1;
    let b;
    let link_action_1;
    let t5;
    let current;
    const router = new Router({ props: { routes: routes$1 }, $$inline: true });
    router.$on("conditionsFailed", /*conditionsFailed*/ ctx[0]);
    router.$on("routeLoaded", /*routeLoaded*/ ctx[1]);

    const block = {
      c: function create() {
        h1 = element("h1");
        h1.textContent = "svelte-spa-router example";
        t1 = space();
        ul = element("ul");
        li0 = element("li");
        a0 = element("a");
        a0.textContent = "Home";
        t3 = space();
        li1 = element("li");
        a1 = element("a");
        b = element("b");
        b.textContent = "Login";
        t5 = space();
        create_component(router.$$.fragment);
        add_location(h1, file$8, 0, 0, 0);
        attr_dev(a0, "href", "/");
        add_location(a0, file$8, 4, 8, 214);
        add_location(li0, file$8, 4, 4, 210);
        add_location(b, file$8, 5, 34, 294);
        attr_dev(a1, "href", "/login");
        add_location(a1, file$8, 5, 8, 268);
        add_location(li1, file$8, 5, 4, 264);
        attr_dev(ul, "class", "navigation-links");
        add_location(ul, file$8, 3, 0, 176);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, h1, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, ul, anchor);
        append_dev(ul, li0);
        append_dev(li0, a0);
        link_action = link.call(null, a0) || {};
        active_action = active.call(null, a0) || {};
        append_dev(ul, t3);
        append_dev(ul, li1);
        append_dev(li1, a1);
        append_dev(a1, b);
        link_action_1 = link.call(null, a1) || {};
        insert_dev(target, t5, anchor);
        mount_component(router, target, anchor);
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
        if (detaching) detach_dev(h1);
        if (detaching) detach_dev(t1);
        if (detaching) detach_dev(ul);
        if (link_action && is_function(link_action.destroy))
          link_action.destroy();
        if (active_action && is_function(active_action.destroy))
          active_action.destroy();
        if (link_action_1 && is_function(link_action_1.destroy))
          link_action_1.destroy();
        if (detaching) detach_dev(t5);
        destroy_component(router, detaching);
      }
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$9.name,
      type: "component",
      source: "",
      ctx
    });

    return block;
  }

  function instance$5($$self) {
    let logbox = "";

    function conditionsFailed(event) {
      console.error("Caught event conditionsFailed", event.detail);
      logbox += "conditionsFailed - " + JSON.stringify(event.detail) + "\n";
      replace("/wild/conditions-failed");
    }

    function routeLoaded(event) {
      console.info("Caught event routeLoaded", event.detail);
      logbox += "routeLoaded - " + JSON.stringify(event.detail) + "\n";
    }

    $$self.$capture_state = () => {
      return {};
    };

    $$self.$inject_state = $$props => {
      if ("logbox" in $$props) logbox = $$props.logbox;
    };

    return [conditionsFailed, routeLoaded];
  }

  class App extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$5, create_fragment$9, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "App",
        options,
        id: create_fragment$9.name
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
