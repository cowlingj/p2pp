import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { CircularProgress, CssBaseline, CssVarsProvider, Grid, Sheet } from "@mui/joy";
import { Suspense } from "react";
import Toast from "~/components/Toast";
import Peer from "~/components/Peer/Peer";
import reactToastifyCss from 'react-toastify/dist/ReactToastify.css'

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: reactToastifyCss },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { title: "P2P Demo" },
    { name: "description", content: "Peer to Peer application demo" },
    { rel: "stylesheet", href: reactToastifyCss }
  ];
};

function Fallback() {
  return <Grid justifyContent="center" alignContent="center"><CircularProgress /></Grid>
} 

export default function Index() {
  return (
    <CssVarsProvider defaultMode="system">
    <CssBaseline />
    <Toast />
    <Sheet sx={{ height: "100dvh", width: "100dvw" }}>
      <Suspense fallback={<Fallback />}>
        <Peer />
      </Suspense>
    </Sheet>
  </CssVarsProvider>
  );
}
