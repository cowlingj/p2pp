/// <reference lib="dom" />

import Peer, { DataConnection } from "peerjs"
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export type ConnectionInfo = { connections: [peer: string, connection: string][], id: string | undefined, errors: string[] };

export default function usePeer() {

    const [ peer, setPeer ] = useState<Peer | undefined>(() => new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })));
    const [ connectionInfo, setConnectionInfo ] = useState<ConnectionInfo>({ id: peer?.id, connections: [], errors: [] });
    const [ latestMessage, setLatestMessage ] = useState<{ from: [peer: string, connection: string], contents: string, date: Date}| undefined>(undefined);

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
            conn.on("data", (data) => { console.log("rx", data); setLatestMessage({from: [conn.peer, conn.connectionId], contents: JSON.stringify(data), date: new Date()})});
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
    }, [peer, setLatestMessage, setConnectionInfo, setPeer])


    useEffect(() => {
        const listener = () => peer?.destroy();
        window.addEventListener('unload', listener)
        return () => window.removeEventListener('unload', listener);
    }, [peer]);

    useEffect(() => {
        console.log("new msg", latestMessage);
    }, [latestMessage])

    return {
        connectionInfo,
        send: useCallback((msg: string) => connectionInfo.connections.forEach((conn) => (peer?.getConnection(...conn) as DataConnection | undefined)?.send(msg)), [connectionInfo, peer]),
        latestMessage: latestMessage,
        connect: useCallback((id: string) => {
            if (peer === undefined) {
                return
            }
            const conn = peer.connect(id); 
            setConnectionInfo(({id, connections}) => ({
                connections: [ [conn.peer, conn.connectionId], ...connections ],
                id,
                errors: []
            }));
        }, [peer, setConnectionInfo]),
        disconnect: useCallback((id: string) => peer?.getConnection(peer.id, id)?.close(), [peer]),
        disconnectAll: useCallback(() => peer?.destroy(), [peer]),
        reconnect: useCallback(() => {
            const newPeer = new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })); 
            setPeer(newPeer);
            setConnectionInfo({ id: newPeer?.id, connections: [], errors: [] })
        }, [setPeer, setConnectionInfo])
    }
}