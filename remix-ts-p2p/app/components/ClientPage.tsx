import { useContext, useState } from "react";
import { Button, Divider, Stack, Textarea, Tooltip, Typography } from "@mui/joy";

import { MessagesContext } from "./Peer/Peer";
import type { ConnectionInfo } from "./Peer/usePeer";

const MessageInput = ({ send }: { send: (msg: string) => void }) => {
  const [messageInput, setMessageInput] = useState<string>("");

  return <Stack direction="row" spacing={2} alignItems="end" sx={{ overflowAnchor: "auto" }}>
    <Textarea
      minRows={1}
      placeholder="Type anything…"
      onChange={(e) => { setMessageInput(e.target.value) }}
      onKeyDown={(e) => { if (e.ctrlKey && e.key == 'Enter') { send(messageInput); setMessageInput(""); } }}
      value={messageInput}
      sx={{ flexGrow: 1 }}
    />
    <Tooltip title="Ctrl+Enter">
      <Button onClick={() => { send(messageInput); setMessageInput(""); }}>Send</Button>
    </Tooltip>
  </Stack>
}

export default function ClientPage({ send, connectionInfo }: { send: (msg: any) => void, connectionInfo: ConnectionInfo }) {
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
    <Stack justifyContent="flex-end" flexGrow={1} textOverflow="scroll" sx={{ overflowAnchor: "none" }} p={4}>
      {
        messages
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((msg) => <Stack key={msg.id} p={2}>
              <Typography fontStyle="italic" fontWeight={msg.from[0] === connectionInfo.id ? "bold" : "regular"}>{msg.from[0]}{msg.from[0] === connectionInfo.id && " (You)"}:</Typography>
              <Typography fontWeight={msg.from[0] === connectionInfo.id ? "bold" : "regular"} sx={{ paddingInlineStart: 2 }}>{msg.content}</Typography>
            </Stack>
          )
      }
    </Stack>
    <Divider />
    <MessageInput send={send} />
  </Stack>;
}