var app = (function() {
  "use strict";
  function t() {}
  function e(t) {
    return t();
  }
  function n() {
    return Object.create(null);
  }
  function r(t) {
    t.forEach(e);
  }
  function o(t) {
    return "function" == typeof t;
  }
  function s(t, e) {
    return t != t
      ? e == e
      : t !== e || (t && "object" == typeof t) || "function" == typeof t;
  }
  function i(t, e) {
    t.appendChild(e);
  }
  function a(t, e, n) {
    t.insertBefore(e, n || null);
  }
  function c(t) {
    t.parentNode.removeChild(t);
  }
  function u(t) {
    return document.createElement(t);
  }
  function l(t) {
    return document.createTextNode(t);
  }
  function d() {
    return l(" ");
  }
  function f(t, e, n, r) {
    return t.addEventListener(e, n, r), () => t.removeEventListener(e, n, r);
  }
  function h(t) {
    return function(e) {
      return e.preventDefault(), t.call(this, e);
    };
  }
  function p(t, e, n) {
    null == n
      ? t.removeAttribute(e)
      : t.getAttribute(e) !== n && t.setAttribute(e, n);
  }
  function g(t, e) {
    (e = "" + e), t.data !== e && (t.data = e);
  }
  let m;
  function v(t) {
    m = t;
  }
  function y() {
    if (!m) throw new Error("Function called outside component initialization");
    return m;
  }
  function b() {
    const t = y();
    return (e, n) => {
      const r = t.$$.callbacks[e];
      if (r) {
        const o = (function(t, e) {
          const n = document.createEvent("CustomEvent");
          return n.initCustomEvent(t, !1, !1, e), n;
        })(e, n);
        r.slice().forEach(e => {
          e.call(t, o);
        });
      }
    };
  }
  const $ = [],
    x = [],
    w = [],
    k = [],
    E = Promise.resolve();
  let _ = !1;
  function L(t) {
    w.push(t);
  }
  function A() {
    const t = new Set();
    do {
      for (; $.length; ) {
        const t = $.shift();
        v(t), C(t.$$);
      }
      for (; x.length; ) x.pop()();
      for (let e = 0; e < w.length; e += 1) {
        const n = w[e];
        t.has(n) || (n(), t.add(n));
      }
      w.length = 0;
    } while ($.length);
    for (; k.length; ) k.pop()();
    _ = !1;
  }
  function C(t) {
    null !== t.fragment &&
      (t.update(),
      r(t.before_update),
      t.fragment && t.fragment.p(t.ctx, t.dirty),
      (t.dirty = [-1]),
      t.after_update.forEach(L));
  }
  const O = new Set();
  let T;
  function j(t, e) {
    t && t.i && (O.delete(t), t.i(e));
  }
  function N(t, e, n, r) {
    if (t && t.o) {
      if (O.has(t)) return;
      O.add(t),
        T.c.push(() => {
          O.delete(t), r && (n && t.d(1), r());
        }),
        t.o(e);
    }
  }
  function H(t) {
    t && t.c();
  }
  function M(t, n, s) {
    const { fragment: i, on_mount: a, on_destroy: c, after_update: u } = t.$$;
    i && i.m(n, s),
      L(() => {
        const n = a.map(e).filter(o);
        c ? c.push(...n) : r(n), (t.$$.on_mount = []);
      }),
      u.forEach(L);
  }
  function F(t, e) {
    const n = t.$$;
    null !== n.fragment &&
      (r(n.on_destroy),
      n.fragment && n.fragment.d(e),
      (n.on_destroy = n.fragment = null),
      (n.ctx = []));
  }
  function S(t, e) {
    -1 === t.$$.dirty[0] &&
      ($.push(t), _ || ((_ = !0), E.then(A)), t.$$.dirty.fill(0)),
      (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31);
  }
  function q(e, o, s, i, a, c, u = [-1]) {
    const l = m;
    v(e);
    const d = o.props || {},
      f = (e.$$ = {
        fragment: null,
        ctx: null,
        props: c,
        update: t,
        not_equal: a,
        bound: n(),
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(l ? l.$$.context : []),
        callbacks: n(),
        dirty: u
      });
    let h = !1;
    (f.ctx = s
      ? s(
          e,
          d,
          (t, n, r = n) => (
            f.ctx &&
              a(f.ctx[t], (f.ctx[t] = r)) &&
              (f.bound[t] && f.bound[t](r), h && S(e, t)),
            n
          )
        )
      : []),
      f.update(),
      (h = !0),
      r(f.before_update),
      (f.fragment = !!i && i(f.ctx)),
      o.target &&
        (o.hydrate
          ? f.fragment &&
            f.fragment.l(
              (function(t) {
                return Array.from(t.childNodes);
              })(o.target)
            )
          : f.fragment && f.fragment.c(),
        o.intro && j(e.$$.fragment),
        M(e, o.target, o.anchor),
        A()),
      v(l);
  }
  class P {
    $destroy() {
      F(this, 1), (this.$destroy = t);
    }
    $on(t, e) {
      const n = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
      return (
        n.push(e),
        () => {
          const t = n.indexOf(e);
          -1 !== t && n.splice(t, 1);
        }
      );
    }
    $set() {}
  }
  const R = [];
  function B(t, e) {
    return { subscribe: D(t, e).subscribe };
  }
  function D(e, n = t) {
    let r;
    const o = [];
    function i(t) {
      if (s(e, t) && ((e = t), r)) {
        const t = !R.length;
        for (let t = 0; t < o.length; t += 1) {
          const n = o[t];
          n[1](), R.push(n, e);
        }
        if (t) {
          for (let t = 0; t < R.length; t += 2) R[t][0](R[t + 1]);
          R.length = 0;
        }
      }
    }
    return {
      set: i,
      update: function(t) {
        i(t(e));
      },
      subscribe: function(s, a = t) {
        const c = [s, a];
        return (
          o.push(c),
          1 === o.length && (r = n(i) || t),
          s(e),
          () => {
            const t = o.indexOf(c);
            -1 !== t && o.splice(t, 1), 0 === o.length && (r(), (r = null));
          }
        );
      }
    };
  }
  function I(e, n, s) {
    const i = !Array.isArray(e),
      a = i ? [e] : e,
      c = n.length < 2;
    return B(s, e => {
      let s = !1;
      const u = [];
      let l = 0,
        d = t;
      const f = () => {
          if (l) return;
          d();
          const r = n(i ? u[0] : u, e);
          c ? e(r) : (d = o(r) ? r : t);
        },
        h = a.map((t, e) =>
          t.subscribe(
            t => {
              (u[e] = t), (l &= ~(1 << e)), s && f();
            },
            () => {
              l |= 1 << e;
            }
          )
        );
      return (
        (s = !0),
        f(),
        function() {
          r(h), d();
        }
      );
    });
  }
  function J(t, e) {
    if (t instanceof RegExp) return { keys: !1, pattern: t };
    var n,
      r,
      o,
      s,
      i = [],
      a = "",
      c = t.split("/");
    for (c[0] || c.shift(); (o = c.shift()); )
      "*" === (n = o[0])
        ? (i.push("wild"), (a += "/(.*)"))
        : ":" === n
        ? ((r = o.indexOf("?", 1)),
          (s = o.indexOf(".", 1)),
          i.push(o.substring(1, ~r ? r : ~s ? s : o.length)),
          (a += ~r && !~s ? "(?:/([^/]+?))?" : "/([^/]+?)"),
          ~s && (a += (~r ? "?" : "") + "\\" + o.substring(s)))
        : (a += "/" + o);
    return {
      keys: i,
      pattern: new RegExp("^" + a + (e ? "(?=$|/)" : "/?$"), "i")
    };
  }
  function z(t) {
    let e, n;
    var o = t[0];
    function s(t) {
      return { props: { params: t[1] } };
    }
    if (o) var i = new o(s(t));
    return {
      c() {
        i && H(i.$$.fragment), (e = l(""));
      },
      m(t, r) {
        i && M(i, t, r), a(t, e, r), (n = !0);
      },
      p(t, n) {
        const a = {};
        if ((2 & n[0] && (a.params = t[1]), o !== (o = t[0]))) {
          if (i) {
            T = { r: 0, c: [], p: T };
            const t = i;
            N(t.$$.fragment, 1, 0, () => {
              F(t, 1);
            }),
              T.r || r(T.c),
              (T = T.p);
          }
          o
            ? (H((i = new o(s(t))).$$.fragment),
              j(i.$$.fragment, 1),
              M(i, e.parentNode, e))
            : (i = null);
        } else o && i.$set(a);
      },
      i(t) {
        n || (i && j(i.$$.fragment, t), (n = !0));
      },
      o(t) {
        i && N(i.$$.fragment, t), (n = !1);
      },
      d(t) {
        t && c(e), i && F(i, t);
      }
    };
  }
  function K() {
    const t = window.location.href.indexOf("#/");
    let e = t > -1 ? window.location.href.substr(t + 1) : "/";
    const n = e.indexOf("?");
    let r = "";
    return (
      n > -1 && ((r = e.substr(n + 1)), (e = e.substr(0, n))),
      { location: e, querystring: r }
    );
  }
  const U = B(K(), function(t) {
    const e = () => {
      t(K());
    };
    return (
      window.addEventListener("hashchange", e, !1),
      function() {
        window.removeEventListener("hashchange", e, !1);
      }
    );
  });
  I(U, t => t.location), I(U, t => t.querystring);
  function V(t) {
    if (!t || t.length < 1 || ("/" != t.charAt(0) && 0 !== t.indexOf("#/")))
      throw Error("Invalid parameter location");
    setTimeout(() => {
      window.location.hash = ("#" == t.charAt(0) ? "" : "#") + t;
    }, 0);
  }
  function W(t) {
    if (!t || !t.tagName || "a" != t.tagName.toLowerCase())
      throw Error('Action "link" can only be used with <a> tags');
    const e = t.getAttribute("href");
    if (!e || e.length < 1 || "/" != e.charAt(0))
      throw Error('Invalid value for "href" attribute');
    t.setAttribute("href", "#" + e);
  }
  function Z(e, n, r) {
    let o,
      s = t;
    !(function(t, e, n) {
      t.$$.on_destroy.push(
        (function(t, e) {
          const n = t.subscribe(e);
          return n.unsubscribe ? () => n.unsubscribe() : n;
        })(e, n)
      );
    })(e, U, t => r(4, (o = t))),
      e.$$.on_destroy.push(() => s());
    let { routes: i = {} } = n,
      { prefix: a = "" } = n;
    class c {
      constructor(t, e) {
        if (
          !e ||
          ("function" != typeof e &&
            ("object" != typeof e || !0 !== e._sveltesparouter))
        )
          throw Error("Invalid component object");
        if (
          !t ||
          ("string" == typeof t &&
            (t.length < 1 || ("/" != t.charAt(0) && "*" != t.charAt(0)))) ||
          ("object" == typeof t && !(t instanceof RegExp))
        )
          throw Error('Invalid value for "path" argument');
        const { pattern: n, keys: r } = J(t);
        (this.path = t),
          "object" == typeof e && !0 === e._sveltesparouter
            ? ((this.component = e.route),
              (this.conditions = e.conditions || []),
              (this.userData = e.userData))
            : ((this.component = e),
              (this.conditions = []),
              (this.userData = void 0)),
          (this._pattern = n),
          (this._keys = r);
      }
      match(t) {
        a && t.startsWith(a) && (t = t.substr(a.length) || "/");
        const e = this._pattern.exec(t);
        if (null === e) return null;
        if (!1 === this._keys) return e;
        const n = {};
        let r = 0;
        for (; r < this._keys.length; ) n[this._keys[r]] = e[++r] || null;
        return n;
      }
      checkConditions(t) {
        for (let e = 0; e < this.conditions.length; e++)
          if (!this.conditions[e](t)) return !1;
        return !0;
      }
    }
    const u = i instanceof Map ? i : Object.entries(i),
      l = [];
    for (const [t, e] of u) l.push(new c(t, e));
    let d = null,
      f = {};
    const h = b(),
      p = (t, e) => {
        setTimeout(() => {
          h(t, e);
        }, 0);
      };
    return (
      (e.$set = t => {
        "routes" in t && r(2, (i = t.routes)),
          "prefix" in t && r(3, (a = t.prefix));
      }),
      (e.$$.update = () => {
        if (17 & e.$$.dirty[0]) {
          r(0, (d = null));
          let t = 0;
          for (; !d && t < l.length; ) {
            const e = l[t].match(o.location);
            if (e) {
              const n = {
                component: l[t].component,
                name: l[t].component.name,
                location: o.location,
                querystring: o.querystring,
                userData: l[t].userData
              };
              if (!l[t].checkConditions(n)) {
                p("conditionsFailed", n);
                break;
              }
              r(0, (d = l[t].component)), r(1, (f = e)), p("routeLoaded", n);
            }
            t++;
          }
        }
      }),
      [d, f, i, a]
    );
  }
  class G extends P {
    constructor(t) {
      super(), q(this, t, Z, z, s, { routes: 2, prefix: 3 });
    }
  }
  const Q = [];
  let X;
  function Y(t) {
    t.node.classList.remove(t.className),
      t.pattern.test(X) && t.node.classList.add(t.className);
  }
  function tt(t, e) {
    if (
      (!(e = e && "string" == typeof e ? { path: e } : e || {}).path &&
        t.hasAttribute("href") &&
        ((e.path = t.getAttribute("href")),
        e.path &&
          e.path.length > 1 &&
          "#" == e.path.charAt(0) &&
          (e.path = e.path.substring(1))),
      e.className || (e.className = "active"),
      !e.path ||
        e.path.length < 1 ||
        ("/" != e.path.charAt(0) && "*" != e.path.charAt(0)))
    )
      throw Error('Invalid value for "path" argument');
    const { pattern: n } = J(e.path),
      r = { node: t, className: e.className, pattern: n };
    return (
      Q.push(r),
      Y(r),
      {
        destroy() {
          Q.splice(Q.indexOf(r), 1);
        }
      }
    );
  }
  function et(e) {
    let n, r, s, l, f, h, g, m, v, y, b, $, x, w, k, E, _, L, A, C;
    return {
      c() {
        (n = u("section")),
          (r = u("h2")),
          (r.textContent = "Hjem!"),
          (s = d()),
          (l = u("p")),
          (l.textContent = "Ting du kan prøve:"),
          (f = d()),
          (h = u("ul")),
          (g = u("li")),
          (m = u("a")),
          (m.textContent = "Opprette en konto"),
          (b = d()),
          ($ = u("li")),
          (x = u("a")),
          (x.textContent = "Logge inn"),
          (E = d()),
          (_ = u("li")),
          (L = u("a")),
          (L.textContent = "Besøke din profilside"),
          p(r, "class", "routetitle"),
          p(m, "href", "/user/create"),
          p(x, "href", "/user/login"),
          p(L, "href", "/user/profile");
      },
      m(t, e) {
        a(t, n, e),
          i(n, r),
          i(n, s),
          i(n, l),
          i(n, f),
          i(n, h),
          i(h, g),
          i(g, m),
          (v = W.call(null, m) || {}),
          (y = tt.call(null, m) || {}),
          i(h, b),
          i(h, $),
          i($, x),
          (w = W.call(null, x) || {}),
          (k = tt.call(null, x) || {}),
          i(h, E),
          i(h, _),
          i(_, L),
          (A = W.call(null, L) || {}),
          (C = tt.call(null, L) || {});
      },
      p: t,
      i: t,
      o: t,
      d(t) {
        t && c(n),
          v && o(v.destroy) && v.destroy(),
          y && o(y.destroy) && y.destroy(),
          w && o(w.destroy) && w.destroy(),
          k && o(k.destroy) && k.destroy(),
          A && o(A.destroy) && A.destroy(),
          C && o(C.destroy) && C.destroy();
      }
    };
  }
  U.subscribe(t => {
    (X = t.location + (t.querystring ? "?" + t.querystring : "")), Q.map(Y);
  });
  class nt extends P {
    constructor(t) {
      super(), q(this, t, null, et, s, {});
    }
  }
  function rt(e) {
    let n;
    return {
      c() {
        (n = u("section")), (n.innerHTML = "<h1>Rute ikke funnet!</h1>");
      },
      m(t, e) {
        a(t, n, e);
      },
      p: t,
      i: t,
      o: t,
      d(t) {
        t && c(n);
      }
    };
  }
  class ot extends P {
    constructor(t) {
      super(), q(this, t, null, rt, s, {});
    }
  }
  var st = function(t) {
    return (
      !(!t || t.length < 3) &&
      !!t.match(
        /^(?=(?:.*[\d]){1,})(?=(?:.*[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]){2,})(?=(?:.*[A-Z]){1,})(?:[^\x00-\x1F\x7F]){8,255}$/
      )
    );
  };
  function it(t) {
    let e;
    return {
      c() {
        (e = u("div")),
          (e.innerHTML = "<h5>Passord er ikke gyldig!</h5>"),
          p(e, "class", "login-error");
      },
      m(t, n) {
        a(t, e, n);
      },
      d(t) {
        t && c(e);
      }
    };
  }
  function at(e) {
    let n,
      o,
      s,
      m,
      v,
      y,
      b,
      $,
      x,
      w,
      k,
      E,
      _,
      L,
      A,
      C,
      O,
      T,
      j,
      N,
      H,
      M,
      F,
      S,
      q = e[0] && it();
    return {
      c() {
        (n = u("section")),
          (o = u("div")),
          (o.innerHTML =
            '<h1>Opprett en konto</h1> \n  <div>\n    Brukernavn kan være hva som helst, men passord må inneholde følgende: 2\n    store bokstaver, 2 irregulære tegn (eks: @!&amp; osv) og minst 1 tall.\n  </div> \n  <div>\n    Har du allerede en bruker? <a href="/#/user/login">Klikk her</a> for å logge inn.\n  </div>'),
          (s = d()),
          (m = u("form")),
          (v = u("div")),
          q && q.c(),
          (y = d()),
          (b = u("label")),
          (b.innerHTML =
            '<div>Brukernavn:</div> \n        <input type="text" placeholder="username">'),
          ($ = d()),
          (x = u("label")),
          (w = u("div")),
          (w.textContent = "Passord:"),
          (k = d()),
          (E = u("input")),
          (_ = d()),
          (L = u("label")),
          (A = u("input")),
          (C = d()),
          (O = u("div")),
          (T = u("small")),
          (j = l("Passord:\n        ")),
          (N = u("strong")),
          (H = l(e[1])),
          (M = l("\n        gyldig: ")),
          (F = l(e[2])),
          p(o, "class", "center"),
          p(E, "class", e[3]),
          p(E, "type", "password"),
          p(E, "placeholder", "password"),
          p(A, "class", "submit"),
          p(A, "type", "submit"),
          (A.value = "Opprett konto"),
          p(v, "class", "login"),
          p(m, "id", "loginForm"),
          (S = [
            f(E, "keyup", e[4]),
            f(A, "submit", h(e[5])),
            f(m, "submit", h(e[5]))
          ]);
      },
      m(t, e) {
        a(t, n, e),
          i(n, o),
          i(n, s),
          i(n, m),
          i(m, v),
          q && q.m(v, null),
          i(v, y),
          i(v, b),
          i(v, $),
          i(v, x),
          i(x, w),
          i(x, k),
          i(x, E),
          i(v, _),
          i(v, L),
          i(L, A),
          i(m, C),
          i(m, O),
          i(O, T),
          i(T, j),
          i(T, N),
          i(N, H),
          i(T, M),
          i(T, F);
      },
      p(t, e) {
        t[0] ? q || ((q = it()), q.c(), q.m(v, y)) : q && (q.d(1), (q = null)),
          8 & e[0] && p(E, "class", t[3]),
          2 & e[0] && g(H, t[1]),
          4 & e[0] && g(F, t[2]);
      },
      i: t,
      o: t,
      d(t) {
        t && c(n), q && q.d(), r(S);
      }
    };
  }
  function ct(t, e, n) {
    var r,
      o,
      s = "",
      i = !1,
      a = "untouched";
    return [
      r,
      s,
      i,
      a,
      function(t) {
        n(1, (s = t.target.value)),
          n(2, (i = st(s))),
          i ? n(3, (a = "green")) : !i && o && n(3, (a = "red"));
      },
      function(t) {
        console.log("try submit", t.target), (o = !0);
        const e = t.target[0].value,
          s = t.target[1].value,
          i = JSON.stringify({ username: e, password: s });
        fetch("/api/v1/user/create", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
          referrer: "no-referrer",
          body: i
        })
          .then(t => t.json())
          .then(t => {
            console.log(t),
              "success" === t.status
                ? V("/user/login")
                : (n(0, (r = !0)), n(3, (a = "red")));
          });
      }
    ];
  }
  class ut extends P {
    constructor(t) {
      super(), q(this, t, ct, at, s, {});
    }
  }
  function lt(t) {
    let e;
    return {
      c() {
        (e = u("div")),
          (e.innerHTML = "<span>ERROR!</span>"),
          p(e, "class", "login-error");
      },
      m(t, n) {
        a(t, e, n);
      },
      d(t) {
        t && c(e);
      }
    };
  }
  function dt(e) {
    let n,
      r,
      o,
      s,
      l,
      h,
      g,
      m,
      v,
      y,
      b,
      $,
      x,
      w,
      k = e[0] && lt();
    return {
      c() {
        (n = u("section")),
          (r = u("form")),
          (o = u("h1")),
          (o.textContent = "Logg inn"),
          (s = d()),
          (l = u("div")),
          (l.innerHTML =
            '\n    Logg inn med ditt brukernavn og passord. Har du ikke en bruker? \n    <a href="/#/user/create">Klikk her</a> for å opprette en.\n  '),
          (h = d()),
          (g = u("div")),
          k && k.c(),
          (m = d()),
          (v = u("label")),
          (v.innerHTML =
            '<div>Brukernavn:</div> \n        <input type="text" placeholder="username">'),
          (y = d()),
          (b = u("label")),
          (b.innerHTML =
            '<div>Passord:</div> \n      <input type="password" placeholder="password">'),
          ($ = d()),
          (x = u("label")),
          (x.innerHTML = "<button>Logg inn</button>"),
          p(g, "class", "login"),
          p(r, "id", "loginForm"),
          (w = f(r, "submit", e[1]));
      },
      m(t, e) {
        a(t, n, e),
          i(n, r),
          i(r, o),
          i(r, s),
          i(r, l),
          i(r, h),
          i(r, g),
          k && k.m(g, null),
          i(g, m),
          i(g, v),
          i(g, y),
          i(g, b),
          i(g, $),
          i(g, x);
      },
      p(t, e) {
        t[0] ? k || ((k = lt()), k.c(), k.m(g, m)) : k && (k.d(1), (k = null));
      },
      i: t,
      o: t,
      d(t) {
        t && c(n), k && k.d(), w();
      }
    };
  }
  function ft(t, e, n) {
    var r;
    return [
      r,
      function(t) {
        console.log(t.target);
        const e = t.target[0].value,
          o = t.target[1].value,
          s = JSON.stringify({ username: e, password: o });
        fetch("/api/v1/user/login", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
          referrer: "no-referrer",
          body: s
        })
          .then(t => t.json())
          .then(t => {
            console.log(t),
              "success" === t.status ? V("/user/profile") : n(0, (r = !0));
          }),
          t.preventDefault();
      }
    ];
  }
  class ht extends P {
    constructor(t) {
      super(), q(this, t, ft, dt, s, {});
    }
  }
  function pt(t) {
    let e;
    return {
      c() {
        (e = u("div")),
          (e.textContent = "Vennligst vent... henter din brukerinformasjon."),
          p(e, "class", "center");
      },
      m(t, n) {
        a(t, e, n);
      },
      d(t) {
        t && c(e);
      }
    };
  }
  function gt(t) {
    let e, n, r, o, s;
    return {
      c() {
        (e = u("h1")),
          (n = l("Velkommen ")),
          (r = l(t[0])),
          (o = d()),
          (s = u("div")),
          (s.textContent = "Hva kan jeg gjøre for deg i dag?");
      },
      m(t, c) {
        a(t, e, c), i(e, n), i(e, r), a(t, o, c), a(t, s, c);
      },
      p(t, e) {
        1 & e[0] && g(r, t[0]);
      },
      d(t) {
        t && c(e), t && c(o), t && c(s);
      }
    };
  }
  function mt(e) {
    let n,
      r,
      o = !e[1] && pt(),
      s = e[1] && gt(e);
    return {
      c() {
        (n = u("section")), o && o.c(), (r = d()), s && s.c();
      },
      m(t, e) {
        a(t, n, e), o && o.m(n, null), i(n, r), s && s.m(n, null);
      },
      p(t, e) {
        t[1] ? o && (o.d(1), (o = null)) : o || ((o = pt()), o.c(), o.m(n, r)),
          t[1]
            ? s
              ? s.p(t, e)
              : ((s = gt(t)), s.c(), s.m(n, null))
            : s && (s.d(1), (s = null));
      },
      i: t,
      o: t,
      d(t) {
        t && c(n), o && o.d(), s && s.d();
      }
    };
  }
  function vt(t, e, n) {
    var r,
      o,
      s = "";
    return (
      (o = async () => {
        const t = await fetch("/api/v1/session");
        var e = await t.json();
        "Unauthorized!" === e.message &&
          (function(t) {
            if (
              !t ||
              t.length < 1 ||
              ("/" != t.charAt(0) && 0 !== t.indexOf("#/"))
            )
              throw Error("Invalid parameter location");
            setTimeout(() => {
              const e = ("#" == t.charAt(0) ? "" : "#") + t;
              history.replaceState(void 0, void 0, e),
                window.dispatchEvent(new Event("hashchange"));
            }, 0);
          })("/user/login"),
          n(1, (r = !0)),
          console.log(e),
          n(0, (s = e.username));
      }),
      y().$$.on_mount.push(o),
      [s, r]
    );
  }
  class yt extends P {
    constructor(t) {
      super(), q(this, t, vt, mt, s, {});
    }
  }
  let bt;
  new URLSearchParams(window.location.search).has("routemap") ||
    (bt = {
      "/": nt,
      "/user/login": ht,
      "/user/create": ut,
      "/user/profile": yt,
      "*": ot
    });
  var $t = bt;
  function xt(e) {
    let n;
    const r = new G({ props: { routes: $t } });
    return (
      r.$on("conditionsFailed", wt),
      r.$on("routeLoaded", kt),
      {
        c() {
          H(r.$$.fragment);
        },
        m(t, e) {
          M(r, t, e), (n = !0);
        },
        p: t,
        i(t) {
          n || (j(r.$$.fragment, t), (n = !0));
        },
        o(t) {
          N(r.$$.fragment, t), (n = !1);
        },
        d(t) {
          F(r, t);
        }
      }
    );
  }
  function wt(t) {
    console.error("Caught event conditionsFailed", t.detail),
      (logbox += "conditionsFailed - " + JSON.stringify(t.detail) + "\n"),
      replace("/error");
  }
  function kt(t) {
    console.info("Caught event routeLoaded", t.detail);
  }
  return new (class extends P {
    constructor(t) {
      super(), q(this, t, null, xt, s, {});
    }
  })({ target: document.querySelector("main") });
})();
//# sourceMappingURL=bundle.js.map
