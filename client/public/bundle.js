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
  function c(t, e, n) {
    t.insertBefore(e, n || null);
  }
  function a(t) {
    t.parentNode.removeChild(t);
  }
  function u(t) {
    return document.createElement(t);
  }
  function l(t) {
    return document.createTextNode(t);
  }
  function f() {
    return l(" ");
  }
  function d(t, e, n, r) {
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
  function m(t, e) {
    (e = "" + e), t.data !== e && (t.data = e);
  }
  let g;
  function y(t) {
    g = t;
  }
  function b() {
    if (!g) throw new Error("Function called outside component initialization");
    return g;
  }
  function $() {
    const t = b();
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
  const v = [],
    x = [],
    w = [],
    k = [],
    _ = Promise.resolve();
  let E = !1;
  function A(t) {
    w.push(t);
  }
  function L() {
    const t = new Set();
    do {
      for (; v.length; ) {
        const t = v.shift();
        y(t), C(t.$$);
      }
      for (; x.length; ) x.pop()();
      for (let e = 0; e < w.length; e += 1) {
        const n = w[e];
        t.has(n) || (n(), t.add(n));
      }
      w.length = 0;
    } while (v.length);
    for (; k.length; ) k.pop()();
    E = !1;
  }
  function C(t) {
    null !== t.fragment &&
      (t.update(),
      r(t.before_update),
      t.fragment && t.fragment.p(t.ctx, t.dirty),
      (t.dirty = [-1]),
      t.after_update.forEach(A));
  }
  const O = new Set();
  let N;
  function T(t, e) {
    t && t.i && (O.delete(t), t.i(e));
  }
  function j(t, e, n, r) {
    if (t && t.o) {
      if (O.has(t)) return;
      O.add(t),
        N.c.push(() => {
          O.delete(t), r && (n && t.d(1), r());
        }),
        t.o(e);
    }
  }
  function F(t) {
    t && t.c();
  }
  function M(t, n, s) {
    const { fragment: i, on_mount: c, on_destroy: a, after_update: u } = t.$$;
    i && i.m(n, s),
      A(() => {
        const n = c.map(e).filter(o);
        a ? a.push(...n) : r(n), (t.$$.on_mount = []);
      }),
      u.forEach(A);
  }
  function S(t, e) {
    const n = t.$$;
    null !== n.fragment &&
      (r(n.on_destroy),
      n.fragment && n.fragment.d(e),
      (n.on_destroy = n.fragment = null),
      (n.ctx = []));
  }
  function q(t, e) {
    -1 === t.$$.dirty[0] &&
      (v.push(t), E || ((E = !0), _.then(L)), t.$$.dirty.fill(0)),
      (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31);
  }
  function H(e, o, s, i, c, a, u = [-1]) {
    const l = g;
    y(e);
    const f = o.props || {},
      d = (e.$$ = {
        fragment: null,
        ctx: null,
        props: a,
        update: t,
        not_equal: c,
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
    (d.ctx = s
      ? s(
          e,
          f,
          (t, n, r = n) => (
            d.ctx &&
              c(d.ctx[t], (d.ctx[t] = r)) &&
              (d.bound[t] && d.bound[t](r), h && q(e, t)),
            n
          )
        )
      : []),
      d.update(),
      (h = !0),
      r(d.before_update),
      (d.fragment = !!i && i(d.ctx)),
      o.target &&
        (o.hydrate
          ? d.fragment &&
            d.fragment.l(
              (function(t) {
                return Array.from(t.childNodes);
              })(o.target)
            )
          : d.fragment && d.fragment.c(),
        o.intro && T(e.$$.fragment),
        M(e, o.target, o.anchor),
        L()),
      y(l);
  }
  class R {
    $destroy() {
      S(this, 1), (this.$destroy = t);
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
  const D = [];
  function P(t, e) {
    return { subscribe: B(t, e).subscribe };
  }
  function B(e, n = t) {
    let r;
    const o = [];
    function i(t) {
      if (s(e, t) && ((e = t), r)) {
        const t = !D.length;
        for (let t = 0; t < o.length; t += 1) {
          const n = o[t];
          n[1](), D.push(n, e);
        }
        if (t) {
          for (let t = 0; t < D.length; t += 2) D[t][0](D[t + 1]);
          D.length = 0;
        }
      }
    }
    return {
      set: i,
      update: function(t) {
        i(t(e));
      },
      subscribe: function(s, c = t) {
        const a = [s, c];
        return (
          o.push(a),
          1 === o.length && (r = n(i) || t),
          s(e),
          () => {
            const t = o.indexOf(a);
            -1 !== t && o.splice(t, 1), 0 === o.length && (r(), (r = null));
          }
        );
      }
    };
  }
  function I(e, n, s) {
    const i = !Array.isArray(e),
      c = i ? [e] : e,
      a = n.length < 2;
    return P(s, e => {
      let s = !1;
      const u = [];
      let l = 0,
        f = t;
      const d = () => {
          if (l) return;
          f();
          const r = n(i ? u[0] : u, e);
          a ? e(r) : (f = o(r) ? r : t);
        },
        h = c.map((t, e) =>
          t.subscribe(
            t => {
              (u[e] = t), (l &= ~(1 << e)), s && d();
            },
            () => {
              l |= 1 << e;
            }
          )
        );
      return (
        (s = !0),
        d(),
        function() {
          r(h), f();
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
      c = "",
      a = t.split("/");
    for (a[0] || a.shift(); (o = a.shift()); )
      "*" === (n = o[0])
        ? (i.push("wild"), (c += "/(.*)"))
        : ":" === n
        ? ((r = o.indexOf("?", 1)),
          (s = o.indexOf(".", 1)),
          i.push(o.substring(1, ~r ? r : ~s ? s : o.length)),
          (c += ~r && !~s ? "(?:/([^/]+?))?" : "/([^/]+?)"),
          ~s && (c += (~r ? "?" : "") + "\\" + o.substring(s)))
        : (c += "/" + o);
    return {
      keys: i,
      pattern: new RegExp("^" + c + (e ? "(?=$|/)" : "/?$"), "i")
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
        i && F(i.$$.fragment), (e = l(""));
      },
      m(t, r) {
        i && M(i, t, r), c(t, e, r), (n = !0);
      },
      p(t, n) {
        const c = {};
        if ((2 & n[0] && (c.params = t[1]), o !== (o = t[0]))) {
          if (i) {
            N = { r: 0, c: [], p: N };
            const t = i;
            j(t.$$.fragment, 1, 0, () => {
              S(t, 1);
            }),
              N.r || r(N.c),
              (N = N.p);
          }
          o
            ? (F((i = new o(s(t))).$$.fragment),
              T(i.$$.fragment, 1),
              M(i, e.parentNode, e))
            : (i = null);
        } else o && i.$set(c);
      },
      i(t) {
        n || (i && T(i.$$.fragment, t), (n = !0));
      },
      o(t) {
        i && j(i.$$.fragment, t), (n = !1);
      },
      d(t) {
        t && a(e), i && S(i, t);
      }
    };
  }
  function U() {
    const t = window.location.href.indexOf("#/");
    let e = t > -1 ? window.location.href.substr(t + 1) : "/";
    const n = e.indexOf("?");
    let r = "";
    return (
      n > -1 && ((r = e.substr(n + 1)), (e = e.substr(0, n))),
      { location: e, querystring: r }
    );
  }
  const V = P(U(), function(t) {
    const e = () => {
      t(U());
    };
    return (
      window.addEventListener("hashchange", e, !1),
      function() {
        window.removeEventListener("hashchange", e, !1);
      }
    );
  });
  I(V, t => t.location), I(V, t => t.querystring);
  function W(t) {
    if (!t || t.length < 1 || ("/" != t.charAt(0) && 0 !== t.indexOf("#/")))
      throw Error("Invalid parameter location");
    setTimeout(() => {
      window.location.hash = ("#" == t.charAt(0) ? "" : "#") + t;
    }, 0);
  }
  function Z(t) {
    if (!t || !t.tagName || "a" != t.tagName.toLowerCase())
      throw Error('Action "link" can only be used with <a> tags');
    const e = t.getAttribute("href");
    if (!e || e.length < 1 || "/" != e.charAt(0))
      throw Error('Invalid value for "href" attribute');
    t.setAttribute("href", "#" + e);
  }
  function G(e, n, r) {
    let o,
      s = t;
    !(function(t, e, n) {
      t.$$.on_destroy.push(
        (function(t, e) {
          const n = t.subscribe(e);
          return n.unsubscribe ? () => n.unsubscribe() : n;
        })(e, n)
      );
    })(e, V, t => r(4, (o = t))),
      e.$$.on_destroy.push(() => s());
    let { routes: i = {} } = n,
      { prefix: c = "" } = n;
    class a {
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
        c && t.startsWith(c) && (t = t.substr(c.length) || "/");
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
    for (const [t, e] of u) l.push(new a(t, e));
    let f = null,
      d = {};
    const h = $(),
      p = (t, e) => {
        setTimeout(() => {
          h(t, e);
        }, 0);
      };
    return (
      (e.$set = t => {
        "routes" in t && r(2, (i = t.routes)),
          "prefix" in t && r(3, (c = t.prefix));
      }),
      (e.$$.update = () => {
        if (17 & e.$$.dirty[0]) {
          r(0, (f = null));
          let t = 0;
          for (; !f && t < l.length; ) {
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
              r(0, (f = l[t].component)), r(1, (d = e)), p("routeLoaded", n);
            }
            t++;
          }
        }
      }),
      [f, d, i, c]
    );
  }
  class K extends R {
    constructor(t) {
      super(), H(this, t, G, z, s, { routes: 2, prefix: 3 });
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
    let n, r, s, l, d, h, m, g, y, b, $, v, x, w, k, _, E, A, L, C;
    return {
      c() {
        (n = u("section")),
          (r = u("h2")),
          (r.textContent = "Hjem!"),
          (s = f()),
          (l = u("p")),
          (l.textContent = "Ting du kan prøve:"),
          (d = f()),
          (h = u("ul")),
          (m = u("li")),
          (g = u("a")),
          (g.textContent = "Opprette en konto"),
          ($ = f()),
          (v = u("li")),
          (x = u("a")),
          (x.textContent = "Logge inn"),
          (_ = f()),
          (E = u("li")),
          (A = u("a")),
          (A.textContent = "Besøke din profilside"),
          p(r, "class", "routetitle"),
          p(g, "href", "/user/create"),
          p(x, "href", "/user/login"),
          p(A, "href", "/user/profile");
      },
      m(t, e) {
        c(t, n, e),
          i(n, r),
          i(n, s),
          i(n, l),
          i(n, d),
          i(n, h),
          i(h, m),
          i(m, g),
          (y = Z.call(null, g) || {}),
          (b = tt.call(null, g) || {}),
          i(h, $),
          i(h, v),
          i(v, x),
          (w = Z.call(null, x) || {}),
          (k = tt.call(null, x) || {}),
          i(h, _),
          i(h, E),
          i(E, A),
          (L = Z.call(null, A) || {}),
          (C = tt.call(null, A) || {});
      },
      p: t,
      i: t,
      o: t,
      d(t) {
        t && a(n),
          y && o(y.destroy) && y.destroy(),
          b && o(b.destroy) && b.destroy(),
          w && o(w.destroy) && w.destroy(),
          k && o(k.destroy) && k.destroy(),
          L && o(L.destroy) && L.destroy(),
          C && o(C.destroy) && C.destroy();
      }
    };
  }
  V.subscribe(t => {
    (X = t.location + (t.querystring ? "?" + t.querystring : "")), Q.map(Y);
  });
  class nt extends R {
    constructor(t) {
      super(), H(this, t, null, et, s, {});
    }
  }
  function rt(e) {
    let n;
    return {
      c() {
        (n = u("section")), (n.innerHTML = "<h1>Rute ikke funnet!</h1>");
      },
      m(t, e) {
        c(t, n, e);
      },
      p: t,
      i: t,
      o: t,
      d(t) {
        t && a(n);
      }
    };
  }
  class ot extends R {
    constructor(t) {
      super(), H(this, t, null, rt, s, {});
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
        c(t, e, n);
      },
      d(t) {
        t && a(e);
      }
    };
  }
  function ct(e) {
    let n,
      o,
      s,
      g,
      y,
      b,
      $,
      v,
      x,
      w,
      k,
      _,
      E,
      A,
      L,
      C,
      O,
      N,
      T,
      j,
      F,
      M,
      S,
      q,
      H,
      R,
      D = e[0] && it();
    return {
      c() {
        (n = u("section")),
          (o = u("h1")),
          (o.textContent = "Opprett en konto"),
          (s = f()),
          (g = u("div")),
          (g.textContent =
            "Brukernavn kan være hva som helst, men passord må inneholde følgende: 2\n    store bokstaver, 2 irregulære tegn (eks: @!& osv) og minst 1 tall."),
          (y = f()),
          (b = u("form")),
          ($ = u("div")),
          D && D.c(),
          (v = f()),
          (x = u("label")),
          (x.innerHTML =
            '<div>Brukernavn:</div> \n        <input type="text" placeholder="username">'),
          (w = f()),
          (k = u("label")),
          (_ = u("div")),
          (_.textContent = "Passord:"),
          (E = f()),
          (A = u("input")),
          (L = f()),
          (C = u("label")),
          (O = u("input")),
          (N = f()),
          (T = u("div")),
          (j = u("small")),
          (F = l("Passord:\n        ")),
          (M = u("strong")),
          (S = l(e[1])),
          (q = l("\n        gyldig: ")),
          (H = l(e[2])),
          p(A, "class", e[3]),
          p(A, "type", "password"),
          p(A, "placeholder", "password"),
          p(O, "class", "submit"),
          p(O, "type", "submit"),
          (O.value = "Opprett konto"),
          p($, "class", "login"),
          p(b, "id", "loginForm"),
          (R = [
            d(A, "keyup", e[4]),
            d(O, "submit", h(e[5])),
            d(b, "submit", h(e[5]))
          ]);
      },
      m(t, e) {
        c(t, n, e),
          i(n, o),
          i(n, s),
          i(n, g),
          i(n, y),
          i(n, b),
          i(b, $),
          D && D.m($, null),
          i($, v),
          i($, x),
          i($, w),
          i($, k),
          i(k, _),
          i(k, E),
          i(k, A),
          i($, L),
          i($, C),
          i(C, O),
          i(b, N),
          i(b, T),
          i(T, j),
          i(j, F),
          i(j, M),
          i(M, S),
          i(j, q),
          i(j, H);
      },
      p(t, e) {
        t[0] ? D || ((D = it()), D.c(), D.m($, v)) : D && (D.d(1), (D = null)),
          8 & e[0] && p(A, "class", t[3]),
          2 & e[0] && m(S, t[1]),
          4 & e[0] && m(H, t[2]);
      },
      i: t,
      o: t,
      d(t) {
        t && a(n), D && D.d(), r(R);
      }
    };
  }
  function at(t, e, n) {
    var r,
      o,
      s = "",
      i = !1,
      c = "untouched";
    return [
      r,
      s,
      i,
      c,
      function(t) {
        n(1, (s = t.target.value)),
          n(2, (i = st(s))),
          i ? n(3, (c = "green")) : !i && o && n(3, (c = "red"));
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
                ? W("/user/login")
                : (n(0, (r = !0)), n(3, (c = "red")));
          });
      }
    ];
  }
  class ut extends R {
    constructor(t) {
      super(), H(this, t, at, ct, s, {});
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
        c(t, e, n);
      },
      d(t) {
        t && a(e);
      }
    };
  }
  function ft(e) {
    let n,
      r,
      o,
      s,
      l,
      h,
      m,
      g,
      y,
      b = e[0] && lt();
    return {
      c() {
        (n = u("form")),
          (r = u("div")),
          b && b.c(),
          (o = f()),
          (s = u("label")),
          (s.innerHTML = '<input type="text" placeholder="username">'),
          (l = f()),
          (h = u("label")),
          (h.innerHTML = '<input type="password" placeholder="password">'),
          (m = f()),
          (g = u("label")),
          (g.innerHTML = "<button>Logg inn</button>"),
          p(r, "class", "login"),
          p(n, "id", "loginForm"),
          (y = d(n, "submit", e[1]));
      },
      m(t, e) {
        c(t, n, e),
          i(n, r),
          b && b.m(r, null),
          i(r, o),
          i(r, s),
          i(r, l),
          i(r, h),
          i(r, m),
          i(r, g);
      },
      p(t, e) {
        t[0] ? b || ((b = lt()), b.c(), b.m(r, o)) : b && (b.d(1), (b = null));
      },
      i: t,
      o: t,
      d(t) {
        t && a(n), b && b.d(), y();
      }
    };
  }
  function dt(t, e, n) {
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
              "success" === t.status ? W("/user/profile") : n(0, (r = !0));
          }),
          t.preventDefault();
      }
    ];
  }
  class ht extends R {
    constructor(t) {
      super(), H(this, t, dt, ft, s, {});
    }
  }
  function pt(t) {
    let e, n, r;
    return {
      c() {
        (e = u("h1")), (n = l("Velkommen ")), (r = l(t[0]));
      },
      m(t, o) {
        c(t, e, o), i(e, n), i(e, r);
      },
      p(t, e) {
        1 & e[0] && m(r, t[0]);
      },
      d(t) {
        t && a(e);
      }
    };
  }
  function mt(e) {
    let n,
      r = e[1] && pt(e);
    return {
      c() {
        (n = u("section")), r && r.c();
      },
      m(t, e) {
        c(t, n, e), r && r.m(n, null);
      },
      p(t, e) {
        t[1]
          ? r
            ? r.p(t, e)
            : ((r = pt(t)), r.c(), r.m(n, null))
          : r && (r.d(1), (r = null));
      },
      i: t,
      o: t,
      d(t) {
        t && a(n), r && r.d();
      }
    };
  }
  function gt(t, e, n) {
    var r,
      o,
      s = "";
    return (
      (o = async () => {
        const t = await fetch("/api/v1/session");
        var e = await t.json();
        n(0, (s = e.username)), n(1, (r = !0));
      }),
      b().$$.on_mount.push(o),
      [s, r]
    );
  }
  class yt extends R {
    constructor(t) {
      super(), H(this, t, gt, mt, s, {});
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
  function vt(e) {
    let n;
    const r = new K({ props: { routes: $t } });
    return (
      r.$on("conditionsFailed", xt),
      r.$on("routeLoaded", wt),
      {
        c() {
          F(r.$$.fragment);
        },
        m(t, e) {
          M(r, t, e), (n = !0);
        },
        p: t,
        i(t) {
          n || (T(r.$$.fragment, t), (n = !0));
        },
        o(t) {
          j(r.$$.fragment, t), (n = !1);
        },
        d(t) {
          S(r, t);
        }
      }
    );
  }
  function xt(t) {
    console.error("Caught event conditionsFailed", t.detail),
      (logbox += "conditionsFailed - " + JSON.stringify(t.detail) + "\n"),
      replace("/error");
  }
  function wt(t) {
    console.info("Caught event routeLoaded", t.detail);
  }
  return new (class extends R {
    constructor(t) {
      super(), H(this, t, null, vt, s, {});
    }
  })({ target: document.querySelector("main") });
})();
//# sourceMappingURL=bundle.js.map
