var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-IMwUce/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// index.js
var PROVIDER = "github";
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return handleAuth(env, url);
    if (url.pathname === "/callback") return handleCallback(request, env, url);
    if (url.pathname === "/report") return handleReport(request, env);
    return new Response("Hello \u2014 Decap OAuth Proxy funcionando.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};
var ORIGENS_PERMITIDAS = [
  "https://lafim.pages.dev",
  "http://localhost:3000"
];
function corsHeaders(origem) {
  const permitida = ORIGENS_PERMITIDAS.includes(origem) ? origem : ORIGENS_PERMITIDAS[0];
  return {
    "Access-Control-Allow-Origin": permitida,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function corta(valor, max) {
  const texto = String(valor ?? "");
  return texto.length > max ? `${texto.slice(0, max)}\u2026` : texto;
}
__name(corta, "corta");
function escapaHtml(texto) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(escapaHtml, "escapaHtml");
async function handleReport(request, env) {
  const origem = request.headers.get("Origin") || "";
  const cors = corsHeaders(origem);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return new Response("Use POST.", { status: 405, headers: cors });
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return new Response(null, { status: 204, headers: cors });
  }
  let dados;
  try {
    const bruto = await request.text();
    if (bruto.length > 4096) return new Response("Corpo grande demais.", { status: 413, headers: cors });
    dados = JSON.parse(bruto);
  } catch {
    return new Response("JSON inv\xE1lido.", { status: 400, headers: cors });
  }
  const linhas = [
    "<b>\u26A0\uFE0F Erro no painel do LaFiM</b>",
    "",
    `<b>Tipo:</b> ${escapaHtml(corta(dados.tipo, 40))}`,
    `<b>Mensagem:</b> ${escapaHtml(corta(dados.mensagem, 300))}`
  ];
  if (dados.status) linhas.push(`<b>HTTP:</b> ${escapaHtml(corta(dados.status, 10))}`);
  if (dados.recurso) linhas.push(`<b>Recurso:</b> <code>${escapaHtml(corta(dados.recurso, 200))}</code>`);
  if (dados.pagina) linhas.push(`<b>P\xE1gina:</b> ${escapaHtml(corta(dados.pagina, 150))}`);
  if (dados.navegador) linhas.push(`<b>Navegador:</b> ${escapaHtml(corta(dados.navegador, 150))}`);
  linhas.push(`<b>Quando:</b> ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID.trim(),
        text: linhas.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
  } catch {
  }
  return new Response(null, { status: 204, headers: cors });
}
__name(handleReport, "handleReport");
function handleAuth(env, url) {
  const params = new URLSearchParams({
    // trim: a variável no painel veio com \n no fim em pelo menos um dos
    // ambientes, o que gerava client_id=...%0A e um OAuth inválido
    client_id: env.GITHUB_CLIENT_ID.trim(),
    scope: "repo,user",
    // derivado da própria request: o redirect_uri precisa apontar para o
    // /callback DESTE Worker, que é o que está registrado no OAuth App
    redirect_uri: `${url.origin}/callback`
  });
  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
__name(handleAuth, "handleAuth");
async function handleCallback(request, env, url) {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("C\xF3digo de autoriza\xE7\xE3o n\xE3o encontrado.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID.trim(),
        client_secret: env.GITHUB_CLIENT_SECRET.trim(),
        code
      })
    }
  );
  if (!tokenResponse.ok) {
    return htmlResponse(
      `Erro ao contatar o GitHub: ${tokenResponse.status} ${tokenResponse.statusText}`,
      502
    );
  }
  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    return htmlResponse(`Erro OAuth: ${tokenData.error_description}`, 400);
  }
  const payload = JSON.stringify({
    token: tokenData.access_token,
    provider: PROVIDER
  });
  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Autenticando...</title></head>
  <body>
    <p id="msg">Autenticado com sucesso. Esta janela ser\xE1 fechada automaticamente.</p>
    <script>
      (function () {
        if (!window.opener) {
          document.getElementById('msg').textContent =
            'N\xE3o foi poss\xEDvel falar com o painel: o navegador cortou o v\xEDnculo ' +
            'com a janela que abriu esta (Cross-Origin-Opener-Policy do GitHub). ' +
            'Feche esta janela e tente entrar novamente.';
          return;
        }
        function receiveMessage(message) {
          window.opener.postMessage(
            'authorization:${PROVIDER}:success:' + ${JSON.stringify(payload)},
            message.origin
          );
          window.removeEventListener('message', receiveMessage, false);
          // quem fecha esta janela \xE9 o pr\xF3prio Decap, ao receber o token
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:${PROVIDER}', '*');
      })();
    <\/script>
  </body>
</html>`;
  return htmlResponse(html, 200);
}
__name(handleCallback, "handleCallback");
function htmlResponse(body, status) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(htmlResponse, "htmlResponse");

// C:/Users/andne/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/andne/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-IMwUce/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// C:/Users/andne/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-IMwUce/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
