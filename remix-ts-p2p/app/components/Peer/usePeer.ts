import type { DataConnection, MediaConnection, PeerOptions } from "peerjs";
import Peer from "./peer.client"
import { useCallback, useEffect, useRef, useState } from "react"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';


export type ConnectionInfo = { connections: [peer: string, connection: string][], id: string | undefined, errors: string[] };
export type Message = { content: string, from: [peer: string, connection: string], date: Date, id: string };
type Messages = { [key: string]: Message };

export type Options = {
    timeout: number,
    host: string,
    port: number,
    path: string,
    secure: boolean,
}

function createPeer(options?: PeerOptions): Peer | undefined {
    return Peer !== undefined ? new Peer(
        uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-" }),
        {
            host: options?.host,
            port: options?.port,
            path: options?.path,
            secure: options?.secure
        }
    ) : undefined
}

export default function usePeer(options: Options) {

    const optionsRef = useRef(options);
    optionsRef.current = options;
    
    const [peer, setPeer] = useState<Peer | undefined>();
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({ id: undefined, connections: [], errors: [] });
    const connectionInfoRef = useRef(connectionInfo);
    connectionInfoRef.current = connectionInfo;
    const [messages, setMessages] = useState<Messages>({});
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    useOptionsReInit(peer, options, setPeer, setConnectionInfo, connectionInfo);

    useEffect(() => {
        if (peer === undefined) {
            return
        }

        peer.on('connection', initConn);

        peer.on('error', (e) => {
            setConnectionInfo(({ errors, ...rest }) => ({
                errors: [e.message],
                ...rest
            }))
        });
        peer.on('open', (code) => {
            setConnectionInfo({ connections: [], id: code, errors: [] });
        });
    }, [peer, messagesRef, setMessages, setConnectionInfo, setPeer]);


    useEffect(() => {
        const listener = () => peer?.destroy();
        window.addEventListener('unload', listener)
        return () => window.removeEventListener('unload', listener);
    }, [peer]);

    return {
        connectionInfo,
        send: useCallback((msg: string) => {
            const uuid = uuidv4();
            setMessages({
                ...messagesRef.current,
                [uuid]: {
                    id: uuid,
                    content: msg,
                    from: [connectionInfo.id!, ""],
                    date: new Date()
                }
            });
            setTimeout(() => setMessages((m: Messages) => { const { [uuid]: _, ...rest } = m; return rest }), optionsRef.current.timeout);
            connectionInfo.connections.forEach((conn) => {
                const peerConnection = peer?.getConnection(...conn);
                if (
                    peerConnection !== undefined
                    && peerConnection !== null
                    && isDataConnection(peerConnection)
                ) {
                    peerConnection.send(msg);
                }
            });
        }, [connectionInfo, peer]),
        messages: Object.values(messages),
        connect: useCallback((id: string) => {
            if (peer === undefined) {
                setConnectionInfo((info) => ({ ...info, errors: ["Application not ready"] }))
                return
            }
            if (connectionInfoRef.current.connections.find((conn) => conn[0] == id)) {
                setConnectionInfo((info) => ({ ...info, errors: ["Already Connected"] }))
                return
            }
            initConn(peer.connect(id));
        }, [peer, setConnectionInfo]),
        disconnect: useCallback((peerId: string, connection: string) => {
            peer?.getConnection(peerId, connection)?.close();
            setConnectionInfo(({ id, connections }) => ({
                connections: (connections ?? [])?.filter(id => id[0] !== peerId || id[1] !== connection),
                id,
                errors: []
            }));
        }, [peer]),
        init: useCallback(() => {
            peer?.destroy();
            const newPeer = createPeer(options);
            setPeer(newPeer);
            setConnectionInfo({ id: newPeer?.id, connections: [], errors: [] });
        }, [peer, options]),
    }

    function initConn(conn: DataConnection) {
        conn.on('close', () => {
            setConnectionInfo(({ id, connections }) => ({
                connections: (connections ?? [])?.filter(id => id[0] === conn.peer && id[1] !== conn.connectionId),
                id,
                errors: []
            }));
        });
        conn.on("open", () => {
            setConnectionInfo(({ id, connections }) => ({
                connections: [[conn.peer, conn.connectionId], ...connections],
                id,
                errors: []
            }));
        });
        conn.on("data", (data) => {
            const uuid = uuidv4();
            setMessages({
                ...messagesRef.current,
                [uuid]: {
                    id: uuid,
                    content: typeof data === "string" ? data : JSON.stringify(data),
                    from: [conn.peer, conn.connectionId],
                    date: new Date()
                }
            });
            setTimeout(() => setMessages((m: Messages) => { const { [uuid]: _, ...rest } = m; return rest; }), optionsRef.current.timeout);
        });

    }
}

function isDataConnection(conn: DataConnection | MediaConnection): conn is DataConnection {
    return (conn as DataConnection).send !== undefined
}

function useOptionsReInit(
    peer: Peer | undefined,
    options: Options,
    setPeer: React.Dispatch<React.SetStateAction<Peer | undefined>>,
    setConnectionInfo: React.Dispatch<React.SetStateAction<ConnectionInfo>>,
    connectionInfo: ConnectionInfo
) {
    const prevOptionsRef = useRef(options);
    useEffect(() => {
        if (peer === undefined) {
            return;
        }
        if (options.host === prevOptionsRef.current.host
            && options.port === prevOptionsRef.current.port
            && options.path === prevOptionsRef.current.path
            && options.secure === prevOptionsRef.current.secure) {
            return;
        }
        peer?.destroy();
        const newPeer = createPeer(options);
        setPeer(newPeer);
        setConnectionInfo({ id: newPeer?.id, connections: [], errors: [] });
        prevOptionsRef.current = options;
    }, [peer, options, connectionInfo, setPeer, setConnectionInfo]);
}
