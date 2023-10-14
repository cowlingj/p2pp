import { createContext, useEffect, useState } from "react";
import type { Message, Options } from "./usePeer";
import usePeer from "./usePeer";
import { Button, IconButton, Sheet, Stack, Tooltip, Typography, useColorScheme } from "@mui/joy";
import { Cog, Moon, Sun } from 'lucide-react';

import { toast } from 'react-toastify';
import DevMenu from "../DevMenu";
import { ConnectionsMenu } from "../ConnectionsMenu";
import ClientPage from "../ClientPage";

export const MessagesContext = createContext<{
  messages: Message[],
}>({ messages: [] });

function NoConnections({ openDraw }: { openDraw: () => void }) {
  return <Stack height="100%" justifyContent="center" alignItems="center">
    <Typography>You have No Connections</Typography>
    <Button onClick={openDraw} variant="plain">Add Some</Button>
  </Stack>
}

export default function Peer() {

  const [connectionsDrawerOpen, setConnectionsDrawerOpen] = useState(false);
  const [options, setOptions] = useState<Options>({
    timeout: 60_000,
    host: "proud-snow-7945.fly.dev",
    port: 443,
    path: '/app',
    secure: true,
  });
  const { connectionInfo, send, messages, connect, disconnect, init } = usePeer(options);
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    connectionInfo.errors.forEach(error => toast.error(error))
  }, [connectionInfo.errors])

  useEffect(() => {
    if (connectionsDrawerOpen && !connectionInfo.id) {
      init();
    }
  }, [connectionInfo, init, connectionsDrawerOpen])

  return <MessagesContext.Provider value={{ messages }}>
    <Stack sx={{ height: "100%" }}>
      <ConnectionsMenu isOpen={connectionsDrawerOpen} close={() => setConnectionsDrawerOpen(false)} connectionInfo={connectionInfo} options={options} connect={connect} disconnectAll={init} disconnect={disconnect} />
      <DevMenu options={options} setOptions={setOptions}></DevMenu>

      <Sheet>
        <Tooltip title="Manage Connections">
          <IconButton onClick={() => setConnectionsDrawerOpen(true)}>
            <Cog />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle Dark Mode">
          <IconButton onClick={() => { setMode(mode === 'dark' ? 'light' : 'dark') }}>
            {mode === 'dark' ? <Sun /> : <Moon />}
          </IconButton>
        </Tooltip>
      </Sheet>

      <Stack p={{ xs: 2, l: 8 }} flexGrow={1}>
        {messages.length === 0 && connectionInfo.connections.length === 0 && <NoConnections openDraw={() => setConnectionsDrawerOpen(true)} />}
        {(connectionInfo.connections.length > 0 || messages.length > 0) && <ClientPage send={(msg) => send(msg)} connectionInfo={connectionInfo} />}
      </Stack>
    </Stack>
  </MessagesContext.Provider>

}


