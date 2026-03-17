// No-op shim: re-export the native RN fetch APIs so any package that
// imports from whatwg-fetch still gets valid objects, but we never let
// the polyfill override the native fetch with an XHR-based version.
exports.fetch = globalThis.fetch;
exports.Headers = globalThis.Headers;
exports.Request = globalThis.Request;
exports.Response = globalThis.Response;
