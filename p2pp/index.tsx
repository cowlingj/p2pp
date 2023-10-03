import { renderToReadableStream } from "react-dom/server";
import { networkInterfaces } from 'node:os';
import App from "./App";
import { rm, readdir } from 'node:fs/promises'
import path from 'node:path'

const buildDir = 'build'

for (let file of await readdir(buildDir)) {
  await rm(path.join(buildDir, file), { recursive: true })
}

const build = await Bun.build({
    entrypoints: [ './hydrate.tsx', './node_modules/react-toastify/dist/ReactToastify.css', './node_modules/react-toastify/dist/ReactToastify.css.map' ],
    target: "browser",
    splitting: true,
    publicPath: '/build/',
    sourcemap: "inline",
    outdir: buildDir,
    naming: {
      entry: '[dir]/[name].[ext]',
      asset: '[dir]/[name].[ext]'
    }
})

if (!build.success) {
  throw new Error(build.logs.join('\n'))
}

const outputs = Object.fromEntries(build.outputs.map(out => [`/build/${out.path.substring(2)}`, out.text()]))

const server = Bun.serve({
    async fetch(req) {

        const url = new URL(req.url)

        if (url.pathname === "/") {
          return new Response(await renderToReadableStream(
            <App />,
            {
                bootstrapModules: ['/build/hydrate.js']
            }
          ), {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (url.pathname.startsWith("/build")) {
          const file = Bun.file(url.pathname.substring(1))
          return new Response(await file.stream(), {
            headers: { "Content-Type": file.type }
          })
        }

        return new Response("", { status: 404 });

    },
  });

console.log(`Available at ${server.hostname}:${server.port}`)
for (let iface of Object.values(networkInterfaces()).map(info => info?.filter(i => i.family = 'IPv4')[0]).filter(i => !!i)) {
    console.log(`Available at ${iface?.address}:${server.port}`)
}