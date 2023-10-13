import { useEffect, useRef, useState } from "react";
import type { ConnectionInfo, Options } from "./Peer/usePeer";

export default function useListPeers(poll: boolean, options: Options, connectionInfo: ConnectionInfo) {
    const [ peers, setPeers ] = useState<[peer: string, connectionId: string | undefined][]>([]);
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const connectionInfoRef = useRef(connectionInfo);
    connectionInfoRef.current = connectionInfo;

    useEffect(() => {
        if (poll) {
            const f = async () => {
                setPeers(await mapConnectionStatus(connectionInfoRef.current, discoverPeers(optionsRef.current)));
            };
            f();
            const interval = setInterval(f, 30_000);
            return () => clearInterval(interval);
        }
    }, [poll, optionsRef, connectionInfo, setPeers])

    return peers;
}

async function discoverPeers(options: Options): Promise<string[]> {
    const baseUrl = `http${options.secure ? 's' : ''}://${options.host}:${options.port}${options.path}/peerjs`;
    const res = await fetch(`${baseUrl}/peers`);
    return res.json();
}

async function mapConnectionStatus(connectionInfo: ConnectionInfo, peers: Promise<string[]>): Promise<[peer: string, connected: string | undefined][]> {
    const connectedPeers = Object.fromEntries(connectionInfo.connections);
    return (await peers)
        .filter(p => p !== connectionInfo.id)
        .map(peerId => [peerId, connectedPeers[peerId]]);
}
