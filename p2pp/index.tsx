import { renderToReadableStream } from "react-dom/server";
import { networkInterfaces } from 'node:os';
import App from "./App";

const build = await Bun.build({
    entrypoints: [ './hydrate.tsx' ],
    target: "browser",
    splitting: true,
    publicPath: '/bundle/',
    sourcemap: "inline"
})

const outputs = Object.fromEntries(build.outputs.map(out => [`/bundle/${out.path.substring(2)}`, out.text()]))

const server = Bun.serve({
    async fetch(req) {

        const url = new URL(req.url)
        if (Object.keys(outputs).includes(url.pathname)) {
            return new Response(await outputs[url.pathname], {
                headers: { "Content-Type": "text/javascript" }
            })
        }

      const stream = await renderToReadableStream(
        <App />,
        {
            bootstrapModules: ['/bundle/hydrate.js']
        }
      );
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    },
  });

console.log(`Available at ${server.hostname}:${server.port}`)
for (let iface of Object.values(networkInterfaces()).map(info => info?.filter(i => i.family = 'IPv4')[0]).filter(i => !!i)) {
    console.log(`Available at ${iface?.address}:${server.port}`)
}