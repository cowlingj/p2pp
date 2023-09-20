import type { DataConnection } from "peerjs";
import Peer from "peerjs"
import type { RefObject} from "react";
import { useRef, useState } from "react"

function create(
    clients: RefObject<{[k: string]: DataConnection}>,
    setClients: (conns: {[k: string]: DataConnection}) => void,
    setRoomCode: (id: string) => void
) {
    return (room?: string) => {
        const peer = (room ? new Peer(room) : new Peer());
        console.log('new peer')

        peer.on('open', (code) => {            
            peer.on('connection', (conn) => {
              console.log('new connection')
              setClients({[conn.connectionId]: conn, ...clients?.current ?? {}}) 
            })
            peer.on('disconnected', (id) => {
                const {[id]: _,  ...rest} = clients?.current ?? {}
                setClients(rest)
            })
            setRoomCode(code)
        })
    }
}

function connect(host: RefObject<DataConnection>, setHost: (peer: DataConnection) => void, setRoomCode: (code: string) => void) {
    return (code: string) => {
        host?.current?.close();
        const peer = new Peer();
        peer.on('open', () => { 
            setHost(peer.connect(code));
            setRoomCode(code);
        });
    }
}

export default function usePeer() {
    const [ host, setHost ] = useState<DataConnection | null>(null);
    const [ clients, setClient ] = useState<{[k: string]: DataConnection}>({});
    const [ roomCode, setRoomCode ] = useState<string>();
    return { roomCode, host, clients, create: create(useRef(clients), setClient, setRoomCode), connect: connect(useRef(host), setHost, setRoomCode) }
}