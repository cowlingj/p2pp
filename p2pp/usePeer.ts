/// <reference lib="dom" />

import Peer, { DataConnection } from "peerjs"
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';


export type ConnectionInfo = { connections: [peer: string, connection: string][], id: string | undefined, errors: string[] };
export type Message = {content: string, from: [peer: string, connection: string], date: Date, id: string};
type Messages = { [key: string]: Message};

const timeout = 60_000;

export default function usePeer() {

    const [ peer, setPeer ] = useState<Peer | undefined>(() => new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })));
    const [ connectionInfo, setConnectionInfo ] = useState<ConnectionInfo>({ id: peer?.id, connections: [], errors: [] });
    const [ messages, setMessages ] = useState<Messages>({});
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    useEffect(() => {
        if (peer === undefined) {
            return
        }

        peer.on('connection', (conn) => {   
            conn.on('close', () => {
                setConnectionInfo(({id, connections}) => ({
                    connections: (connections ?? [])?.filter(id => id[0] === conn.peer && id[1] !== conn.connectionId),
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
            conn.on("data", (data) => { 
                const uuid = uuidv4()
                setMessages({
                    ...messagesRef.current,
                    [uuid]: {
                        id: uuid,
                        content: typeof data === "string" ? data : JSON.stringify(data),
                        from: [conn.peer, conn.connectionId],
                        date: new Date()
                    }})
                setTimeout(() => setMessages((m: Messages) => {const {[uuid]: _, ...rest} = m; return rest}), timeout)
            });
        });
    
        peer.on('error', (e) => {
            setConnectionInfo(({errors, ...rest}) => ({
                errors: [e.message],
                ...rest
            }))
        });
        peer.on('open', (code) => {            
            setConnectionInfo({ connections: [], id: code, errors: [] });
        });
    }, [peer, messagesRef, setMessages, setConnectionInfo, setPeer])


    useEffect(() => {
        const listener = () => peer?.destroy();
        window.addEventListener('unload', listener)
        return () => window.removeEventListener('unload', listener);
    }, [peer]);

    return {
        connectionInfo,
        send: useCallback((msg: string) => {
            const uuid = uuidv4()
            console.log(`adding to ${Object.values(messagesRef?.current).length} messages`)
            setMessages({
                ...messagesRef.current,
                [uuid]: {
                    id: uuid,
                    content: msg,
                    from: [connectionInfo.id!, ""],
                    date: new Date()
                }});
            setTimeout(() => setMessages((m: Messages) => {const {[uuid]: _, ...rest} = m; return rest}), timeout);
            connectionInfo.connections.forEach((conn) => (peer?.getConnection(...conn) as DataConnection | undefined)?.send(msg));
        }, [connectionInfo, peer]),
        messages: Object.values(messages),
        connect: useCallback((id: string) => {
            if (peer === undefined) {
                setConnectionInfo((info) => ({ ...info, errors: ["Application not ready"]}))
                return
            }
            if (connectionInfo.connections.find((conn) => conn[0] == id)) {
                setConnectionInfo((info) => ({ ...info, errors: ["Already Connected"]}))
                return
            }
            const conn = peer.connect(id); 
            setConnectionInfo(({id, connections}) => ({
                connections: [ [conn.peer, conn.connectionId], ...connections ],
                id,
                errors: []
            }));
        }, [peer, setConnectionInfo]),
        disconnect: useCallback((peerId: string, connection: string) => {
            peer?.getConnection(peerId, connection)?.close();
            setConnectionInfo(({id, connections}) => ({
                connections: (connections ?? [])?.filter(id => id[0] === peerId && id[1] !== connection),
                id,
                errors: []
            }));
        }, [peer]),
        disconnectAll: useCallback(() => {
            peer?.destroy();
            const newPeer = new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })); 
            setPeer(newPeer);
            setConnectionInfo({ id: newPeer.id, connections: [], errors: [] });
        }, [peer]),
        reconnect: useCallback(() => {
            const newPeer = new Peer(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" })); 
            setPeer(newPeer);
            setConnectionInfo({ id: newPeer.id, connections: [], errors: [] });
        }, [setPeer, setConnectionInfo])
    }
}