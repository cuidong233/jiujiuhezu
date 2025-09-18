import { d as defineEventHandler, r as readBody, g as getHeaders, s as setHeader, c as createError } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'ipx';

const _____ = defineEventHandler(async (event) => {
  const path = event.node.req.url || "";
  const method = event.node.req.method;
  const body = method !== "GET" && method !== "HEAD" ? await readBody(event) : void 0;
  console.log(`Proxying ${method} ${path} to backend`);
  try {
    const response = await $fetch.raw(`http://localhost:3000${path}`, {
      method,
      body,
      headers: {
        ...getHeaders(event),
        host: "localhost:3000"
      }
    });
    const headers = response.headers;
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() !== "content-encoding") {
        setHeader(event, key, value);
      }
    }
    return response._data;
  } catch (error) {
    console.error("Proxy error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message
    });
  }
});

export { _____ as default };
//# sourceMappingURL=_..._.mjs.map
