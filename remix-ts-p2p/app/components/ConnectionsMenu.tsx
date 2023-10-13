import type { ConnectionInfo, Options } from "./Peer/usePeer";
import { Button, DialogContent, Divider, Drawer, FormControl, FormLabel, IconButton, Input, List, ListItem, Stack, Typography } from "@mui/joy";
import { X } from 'lucide-react';
import { useState } from "react";
import useListPeers from "./useListPeers";

const ConnectionInput = ({ connect }: { connect: (id: string) => void }) => {

  const [value, setValue] = useState("");

  const add = () => {
    if (value !== "") {
      connect(value);
      setValue("");
    }
  }

  return <Stack direction="row" alignItems="flex-end" spacing={2}>
    <FormControl sx={{ flexGrow: 1 }}>
      <FormLabel>Add Connection</FormLabel>
      <Input type="text" onChange={(e) => setValue(e.target.value)} value={value} />
    </FormControl>
    <Button onClick={add}>Add</Button>
  </Stack>
}

export function ConnectionsMenu({ isOpen, close, connectionInfo, options, connect, disconnectAll, disconnect }: { isOpen: boolean; close: () => void; connectionInfo: ConnectionInfo; options: Options, connect: (id: string) => void; disconnectAll: () => void; disconnect: (peer: string, connection: string) => void; }) {
  const peers = useListPeers(isOpen, options, connectionInfo);

  return <Drawer open={isOpen} onClose={close} size="lg">
    <Stack p={2} spacing={2}>
      <IconButton onClick={close} sx={{ alignSelf: "flex-end" }}>
        <X />
      </IconButton>
      <Typography>Your Connection ID:</Typography>
      <Typography level="h1">{connectionInfo.id}</Typography>
      <ConnectionInput connect={connect} />
      <Divider />
      <Button onClick={disconnectAll}>Disconnect All</Button>
      <Typography>Connections</Typography>
      <DialogContent>
        <List>
          {peers.map(conn => <ListItem key={`${conn[0]}-${conn[1]}`}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography>{conn[0]}</Typography>
              {
                conn[1] !== undefined
                  ? <Button variant="plain" onClick={() => disconnect(conn[0], conn[1]!)}>Disonnect</Button>
                  : <Button variant="plain" onClick={() => connect(conn[0])}>Connect</Button>
              }
            </Stack>
          </ListItem>
          )}
        </List>
      </DialogContent>
      <Stack>
      </Stack>
    </Stack>
  </Drawer>;
}
