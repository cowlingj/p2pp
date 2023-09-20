import { useEffect, useState } from "react";
import usePeer from "./usePeer";

export default function Peer() {
    const { roomCode, host, clients, create, connect } = usePeer();
    const [ roomCodeInput, setRoomCodeInput ] = useState<string>("");
  
    useEffect(() => {
      console.log('clients changed')
      Object.values(clients).forEach((conn) => {
        conn.on("data", (data) => {
          console.log(`got data ${data}`);
        })
      })
    }, [clients])

    useEffect(() => {
      console.log(`in room: ${roomCode}`)
    }, [roomCode])

    
    return <>
      <button onClick={() => create(roomCodeInput ?? undefined)}>Create Room</button>
      <input type="text" onChange={(e) => setRoomCodeInput(e.target.value)} value={roomCodeInput}></input>
      <button onClick={() => roomCodeInput && connect(roomCodeInput)}>Connect</button>
      {(host && roomCode) ? <button onClick={() => {host.send('test tx btn')}}>TX</button> : null} 
    </>
}