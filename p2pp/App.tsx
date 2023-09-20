import { Suspense, lazy } from "react";

const Peer = lazy(() => import("./Peer"))

export default function App() {
 return <html>
          <head></head>
          <body>
        <div>
            <Suspense fallback={<p>loading</p>}>
                <Peer />
            </Suspense>
        </div>
        </body>

            </html>

}