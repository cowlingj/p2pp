import { ConnectionInfo } from "../usePeer";
import { Button, DialogContent, Divider, FormControl, FormLabel, IconButton, Input, List, ListItem, Stack, Typography } from "@mui/joy";
import { X } from 'lucide-react';
import Drawer from '@mui/joy/Drawer';
import { useState } from "react";

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

export function ConnectionsMenu({ isOpen, close, connectionInfo, connect, disconnectAll, disconnect }: { isOpen: boolean; close: () => void; connectionInfo: ConnectionInfo; connect: (id: string) => void; disconnectAll: () => void; disconnect: (peer: string, connection: string) => void; }) {
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
          {connectionInfo.connections.map(conn => <ListItem key={`${conn[0]}-${conn[1]}`}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography>{conn[0]}</Typography>
              <Button variant="plain" onClick={() => disconnect(...conn)}>Disconnect</Button>
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
