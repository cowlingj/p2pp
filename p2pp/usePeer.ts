/// <reference lib="dom" />

import Peer, { DataConnection } from "peerjs"
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export type ConnectionInfo = { connections: [peer: string, connection: string][], id: string | undefined, errors: string[] };

export default function usePeer() {

    const [ peer, setPeer ] = useState<Peer | undefined>(() => new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })));
    const [ connectionInfo, setConnectionInfo ] = useState<ConnectionInfo>({ id: peer?.id, connections: [], errors: [] });
    const [ onReceive, setOnReceive ] = useState<(msg: any) => void>((msg: any) => {});

    useEffect(() => {
        if (peer === undefined) {
            return
        }

        peer.on('connection', (conn) => {   
            conn.on('close', () => {
                setConnectionInfo(({id, connections}) => ({
                    connections: (connections ?? [])?.filter(id => id[1] !== conn.connectionId),
                    id,
                    errors: []
                }))
            });
            conn.on("open", () => {
                setConnectionInfo(({id, connections}) => ({
                    connections: [ [conn.peer, conn.connectionId], ...connections ],
                    id,
                    errors: []
                }))
            });
            conn.on("data", console.log) // FIXME
        });
    
        peer.on('error', (e) => {
            setConnectionInfo(({errors, ...rest}) => ({
                errors: [e.message],
                ...rest
            }))
        });
        peer.on('open', (code) => {            
            setConnectionInfo({ connections: [], id: code, errors: [] });
        })
    
        peer.on('close', () => {
            setConnectionInfo({ id: undefined, connections: [], errors: []});
            setPeer(undefined);
        });
    }, [peer])


    useEffect(() => {
        const listener = () => peer?.destroy();
        window.addEventListener('unload', listener)
        return () => window.removeEventListener('unload', listener);
    }, [peer]);

    return {
        connectionInfo,
        send: (msg: any) => connectionInfo.connections.forEach((conn) => (peer?.getConnection(...conn) as DataConnection | undefined)?.send(msg)),
        receive: (callback: (msg: any) => void) => {}, // FIXME: setOnReceive(callback),
        connect: (id: string) => {
            if (peer === undefined) {
                return
            }
            const conn = peer.connect(id); 
            setConnectionInfo(({id, connections}) => ({
                connections: [ [conn.peer, conn.connectionId], ...connections ],
                id,
                errors: []
            }));
        },
        disconnect: (id: string) => peer?.getConnection(peer.id, id)?.close(),
        disconnectAll: () => peer?.destroy(),
        reconnect: () => {
            const newPeer = new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })); 
            setPeer(newPeer);
            setConnectionInfo({ id: newPeer?.id, connections: [], errors: [] })
        }
    }
}