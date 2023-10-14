
import { renderToReadableStream } from "react-dom/server";
import Main from './Main';

const build = await Bun.build({ entrypoints: ["./hydrate.tsx"] });
const hydrate = await build.outputs[0]!.text();

const server = Bun.serve({
    async fetch(req) {

      if (new URL(req.url).pathname === "/hydrate.js") {
        return new Response(hydrate, {
            headers: { "Content-Type": "text/javascript" }
        });
      }

      return new Response(await renderToReadableStream(<Main />, { bootstrapScripts: ["/hydrate.js"]}), {
        headers: { "Content-Type": "text/html" },
      });
    },
  });

console.log(`serving on http://${server.hostname}:${server.port}`);