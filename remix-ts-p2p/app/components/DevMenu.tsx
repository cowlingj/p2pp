import { useEffect, useState } from "react";
import { FormControl, FormLabel, IconButton, Input, Stack, Switch, Typography, Drawer } from "@mui/joy";
import { X } from 'lucide-react';

import type { Options } from "./Peer/usePeer";

export default function DevMenu({ options, setOptions }: { options: Options, setOptions: React.Dispatch<React.SetStateAction<Options>> }) {
  const [devDrawerOpen, setDevDrawerOpen] = useState(false);

  const [ tempOptions, setTempOptions ] = useState(options);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === '.') { setDevDrawerOpen(open => !open) } };
    document.addEventListener('keydown', listener)
    return () => { document.removeEventListener("keydown", listener); }
  }, [setDevDrawerOpen])

  return <Drawer open={devDrawerOpen} onClose={() => {setOptions(tempOptions); setDevDrawerOpen(false)}} size="lg" anchor="right">
    <Stack p={2} spacing={2}>
      <IconButton onClick={() => { setOptions(tempOptions); setDevDrawerOpen(false) }} sx={{ alignSelf: "flex-end" }}>
        <X />
      </IconButton>
      <Typography>Demo Options:</Typography>
      <FormControl>
        <FormLabel>Timeout (ms)</FormLabel>
        <Input type="number" value={tempOptions.timeout} onChange={(e) => { setTempOptions((options: Options) => ({ ...options, timeout: parseInt(e.target.value) })) }} />
      </FormControl>
      <FormControl>
        <FormLabel>Host</FormLabel>
        <Input type="text" value={tempOptions.host} onChange={(e) => { setTempOptions((options: Options) => ({ ...options, host: e.target.value })) }} />
      </FormControl>
      <FormControl>
        <FormLabel>Port</FormLabel>
        <Input type="number" value={tempOptions.port} onChange={(e) => { setTempOptions((options: Options) => ({ ...options, port: parseInt(e.target.value) })) }} />
      </FormControl>
      <FormControl>
        <FormLabel>Path</FormLabel>
        <Input type="text" value={tempOptions.path} onChange={(e) => { setTempOptions((options: Options) => ({ ...options, path: e.target.value })) }} />
      </FormControl>
      <FormControl>
        <FormLabel>Secure</FormLabel>
        <Switch checked={tempOptions.secure} onChange={(e) => { setTempOptions((options: Options) => ({ ...options, secure: e.target.checked })) }} />
      </FormControl>
    </Stack>
  </Drawer>
}