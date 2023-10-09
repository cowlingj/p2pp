import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import usePeer, { Message, Options } from "./usePeer";
import { Button, DialogTitle, Divider, FormControl, FormLabel, Grid, IconButton, Input, MenuButton, Sheet, Stack, Switch, Textarea, Tooltip, Typography, useColorScheme } from "@mui/joy";
import { Cog, Cross, Moon, Sun, SunMoon } from 'lucide-react';

import { toast } from 'react-toastify';
import DevMenu from "./components/DevMenu";
import { ConnectionsMenu } from "./components/ConnectionsMenu";
import ClientPage from "./components/ClientPage";

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
  const [devOptions, setDevOptions] = useState<Options>({
    misbehaving: false,
    host: "0.peerjs.com",
    port: 443,
    secure: true,
  });
  const { connectionInfo, send, messages, connect, disconnect, disconnectAll } = usePeer(devOptions);
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    connectionInfo.errors.forEach(error => toast.error(error))
  }, [connectionInfo.errors])

  return <MessagesContext.Provider value={{ messages }}>
    <Stack sx={{ height: "100%" }}>
      <ConnectionsMenu isOpen={connectionsDrawerOpen} close={() => setConnectionsDrawerOpen(false)} connectionInfo={connectionInfo} connect={connect} disconnectAll={disconnectAll} disconnect={disconnect} />
      <DevMenu options={devOptions} setOptions={setDevOptions}></DevMenu>

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
        {(connectionInfo.connections.length > 0 || messages.length > 0) && <ClientPage send={(msg) => send(msg)} />}
      </Stack>
    </Stack>
  </MessagesContext.Provider>

}


