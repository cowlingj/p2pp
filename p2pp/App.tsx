import { Box, CssBaseline, CssVarsProvider, Sheet } from "@mui/joy";
import { Suspense, lazy } from "react";
import { ToastContainer } from 'react-toastify';

const Peer = lazy(() => import("./Peer"))

export default function App() {
 return <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="/build/node_modules/react-toastify/dist/ReactToastify.css" />
          </head>
          <body>
          <CssVarsProvider>
            <CssBaseline />
            <ToastContainer />
            <Sheet sx={{height: "100vh", width: "100vw"}}>
                <Suspense fallback={<p>loading</p>}>
                    <Peer />
                </Suspense>
            </Sheet>
          </CssVarsProvider>
        </body>

            </html>

}