/// <reference lib="dom" />

import Peer, { DataConnection } from 'peerjs';
import { useEffect, useMemo, useState } from 'react';

export default function Main() {

    // 1. Create a peer
    const me = useMemo(() => {
        return new Peer({
            host: "proud-snow-7945.fly.dev", // my signalling server instance
            port: 443,
            path: '/app',
            secure: true,
        });
    }, []);

    const [ them, setThem ] = useState("");
    const [ ready, setReady ] = useState(false);
    const [ messageToSend, setMessageToSend ] = useState<string>("");
    const [ receivedMessage, setReceivedMessage ] = useState<string>("");
    const [ connections, setConnections ] = useState<DataConnection[]>([]);

    // 2. Create a connection
    function connect() {
        setConnections([...connections, me.connect(them)]);
        setThem("");
    }

    useEffect(() => {
        // 3. Receive connections
        me.on("connection", (connection) => { setConnections([...connections, connection]); });
        
        // Other bits of housekeeping
        me.on("open", () => { setReady(true); });
        me.on("error", console.error);
        window.addEventListener("unload", () => { me.destroy(); });
    }, [me]);

    // 4. Send a message
    function send() {
        connections.forEach(connection => connection.send(messageToSend));
        setMessageToSend("");
    }

    // 5. Receive message
    useEffect(() => {
        connections.forEach(connection => {
            connection.on("data", (data) => {
                setReceivedMessage(`${connection.peer}: ${data}`);
            });
        });
    }, [connections, setReceivedMessage]);

    return <html lang="en">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Simple React Peer</title>
        </head>
        <body>
            <input type="text" value={them} onChange={(e) => setThem(e.target.value)} />
            <button disabled={!ready} onClick={() => connect()}>Connect</button>
            <br />
            <input type="text" value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)} />
            <button disabled={connections.length === 0} onClick={() => send()}>Send</button>
            
            <p>===received===</p>
            <p>{receivedMessage}</p>
        </body>
    </html>
}
