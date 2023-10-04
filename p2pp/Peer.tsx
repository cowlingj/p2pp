import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import usePeer, { ConnectionInfo } from "./usePeer";
import { Button, FormControl, FormLabel, Grid, Input, Sheet, Stack, Textarea, Typography } from "@mui/joy";

import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const MessageInput = ({send}: {send: (msg: string) => void}) => {
  const [ messageInput, setMessageInput ] = useState<string>("");

  return <Stack direction="row" spacing={2} alignItems="end" sx={{  overflowAnchor: "auto" }}>
  <Textarea
    minRows={2}
    maxRows={6}
    placeholder="Type anything…"
    onChange={(e) => { setMessageInput(e.target.value)}}
    onKeyDown={(e) => { if (e.ctrlKey && e.key == 'Enter') { send(messageInput); setMessageInput(""); } }}
    value={messageInput}
  />
  <Button onClick={() => { send(messageInput); setMessageInput(""); }}>Send</Button>
</Stack>
}

const ClientPage = ({connectionInfo, send}: {connectionInfo: ConnectionInfo, send: (msg: any) => void}) => {
  const { messages } = useContext(MessagesContext);

  return <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
      sx={{
        height: "100%",
        overflowY: "scroll",
        overscrollBehaviorY: "contain",
        scrollSnapType: "y proximity",
      }}
    >
      <Typography level="h1" sx={{ overflowAnchor: "none"}}>In room: {connectionInfo?.id ?? "unknown"}</Typography>
      <Stack justifyContent="flex-end" flexGrow={1} textOverflow="scroll" sx={{ overflowAnchor: "none"}}>
        {
          Object.entries(messages)
            .sort((a, b) => a[1].expiry.getTime() - b[1].expiry.getTime())
            .map(([key, msg]) => <Typography key={key}>{msg.content}</Typography>)
        }
      </Stack>
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

  return <>
    <FormControl>
      <FormLabel>Add Connection</FormLabel>
      <Input type="text" onChange={(e) => setValue(e.target.value)}/>
    </FormControl>
    <Button onClick={add}>Add</Button>
  </>
}

type Messages = { [key: string]: {content: string, expiry: Date}};

const MessagesContext = createContext<{
  messages: Messages,
  setMessages: (messagesOrChangeFn: Messages | ((old: Messages) => Messages)) => void
}>({ messages: {}, setMessages: () => {} });

export default function PeerWrapper() {
  const [ messages, setMessages ] = useState<Messages>({});

  function showMessage(msg: string) {
    const timeout = 60_000
    const uuid = uuidv4()
    setMessages({ ...messages, [uuid]: { content: msg, expiry: new Date(new Date().getTime() + timeout)}})
    setTimeout(() => {
      const changeFn : (m: Messages) => Messages = (m: Messages) => {const {[uuid]: _, ...rest} = m; return rest}
      setMessages(changeFn)
    }, timeout)
  }

  useEffect(() => {
    console.log(`messages changed: ${JSON.stringify(messages)}`)
  }, [messages]);

  console.log("wrapper render");
  
  const addMessage = useCallback((msg: string) => { console.log("add", msg); showMessage(JSON.stringify(msg)) }, [setMessages])

  return <MessagesContext.Provider value={{ messages, setMessages }}><Peer addMessage={addMessage} /></MessagesContext.Provider>
}

function Peer({addMessage}: { addMessage: (msg: string) => void }) {

    const { connectionInfo, send, latestMessage, connect, disconnectAll } = usePeer();

    useEffect(() => { if (latestMessage !== undefined) addMessage(latestMessage.contents) }, [latestMessage, addMessage])

    useEffect(() => {
      console.log(`conection: ${JSON.stringify(connectionInfo)}`)
    }, [connectionInfo])
  
    useEffect(() => {
      connectionInfo.errors.forEach(error => toast.error(error))
    }, [connectionInfo.errors])
  
    return <Sheet sx={{ p: { xs: 2, l: 8}, height: "100%"}}>
        <ClientPage connectionInfo={connectionInfo} send={(msg) => { send(msg); addMessage("sent " + msg)}} />
        <Button onClick={disconnectAll}>Disconnect All</Button>
        <Stack>
          {
            connectionInfo.connections.map(conn => <Typography key={JSON.stringify(conn)}>{conn[0]} ({conn[1]})</Typography>)
          }
        </Stack>
        <ConnectionInput connect={connect} />
      </Sheet>
    
}