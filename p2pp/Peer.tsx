import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import usePeer, { ConnectionInfo, Message } from "./usePeer";
import { Button, DialogContent, DialogTitle, Divider, FormControl, FormLabel, Grid, Input, List, ListItem, MenuButton, Sheet, Stack, Textarea, Tooltip, Typography } from "@mui/joy";

import { toast } from 'react-toastify';
import Drawer from '@mui/joy/Drawer';

const MessageInput = ({send}: {send: (msg: string) => void}) => {
  const [ messageInput, setMessageInput ] = useState<string>("");

  return <Stack direction="row" spacing={2} alignItems="end" sx={{  overflowAnchor: "auto" }}>
  <Textarea
    minRows={1}
    placeholder="Type anything…"
    onChange={(e) => { setMessageInput(e.target.value)}}
    onKeyDown={(e) => { if (e.ctrlKey && e.key == 'Enter') { send(messageInput); setMessageInput(""); } }}
    value={messageInput}
    sx={{ flexGrow: 1 }}
  />
  <Tooltip title="Ctrl+Enter">
    <Button onClick={() => { send(messageInput); setMessageInput(""); }}>Send</Button>
  </Tooltip>
</Stack>
}

const ClientPage = ({send}: {send: (msg: any) => void}) => {
  const { messages } = useContext(MessagesContext);

  return <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="strech"
      spacing={2}
      sx={{
        height: "100%",
        overflowY: "scroll",
        overscrollBehaviorY: "contain",
        scrollSnapType: "y proximity",
      }}
      flexGrow={1}
    >
      <Stack justifyContent="flex-end" flexGrow={1} textOverflow="scroll" sx={{ overflowAnchor: "none"}} p={4}>
        {
          messages
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((msg) => <Typography key={msg.id}>{msg.content}</Typography>)
        }
      </Stack>
      <Divider />
      <MessageInput send={send}/>
    </Stack>;
}

const ConnectionInput = ({connect}: {connect: (id: string) => void}) => {
  
  const [value, setValue] = useState("");

  const add = () => {
    if (value !== "") {
      connect(value);
      setValue("");
    }
  }

  return <Stack direction="row" alignItems="flex-end" spacing={2}>
    <FormControl sx={{ flexGrow: 1}}>
      <FormLabel>Add Connection</FormLabel>
      <Input type="text" onChange={(e) => setValue(e.target.value)} value={value} />
    </FormControl>
    <Button onClick={add}>Add</Button>
  </Stack>
}

const MessagesContext = createContext<{
  messages: Message[],
}>({ messages: [] });

export default function Peer() {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const { connectionInfo, send, messages, connect, disconnect, disconnectAll } = usePeer();
  
    useEffect(() => {
      connectionInfo.errors.forEach(error => toast.error(error))
    }, [connectionInfo.errors])
  
    return <MessagesContext.Provider value={{ messages }}>
    <Stack sx={{height: "100%"}}>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Stack p={2} spacing={2}>
            <Typography>Your Connection ID:</Typography>
            <Typography level="h1">{connectionInfo.id}</Typography>
            <ConnectionInput connect={connect}/>
            <Button onClick={disconnectAll}>Disconnect All</Button>
            <Typography>Connections</Typography>
            <DialogContent>
              <List>
              {
                connectionInfo.connections.map(conn => <ListItem key={`${conn[0]}-${conn[1]}`}>
                  <Stack>
                    <Typography>{conn[0]}</Typography>
                    <Button variant="plain" onClick={() => disconnect(...conn)}>Disconnect</Button>
                  </Stack>
                </ListItem>
                )
              }
              </List>
            </DialogContent>
            <Stack>
            </Stack>
          </Stack>
        </Drawer>

        <Sheet>
          <Button onClick={() => setDrawerOpen(true)} variant="plain">Manage Connections</Button>
        </Sheet>

        <Stack p={{ xs: 2, l: 8}} flexGrow={1}>
          { messages.length === 0 && connectionInfo.connections.length === 0 && <Typography>You have No Connections <Button onClick={() => setDrawerOpen(true)} variant="plain">Add Some</Button></Typography>}
          { (connectionInfo.connections.length > 0 || messages.length > 0) && <ClientPage send={(msg) => send(msg)} /> }
        </Stack>
      </Stack>
              </MessagesContext.Provider>
    
}