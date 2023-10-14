---
title: P2P w/ TS
revealOptions:
  transition: 'none'
  progress: false
  slideNumber: false
  showSlideNumber: 'speaker'
  controls: false
---

# Building a Peer to Peer System with TypeScript

Jonathan Cowling - [linkedin.com/in/jonathan-cowling](https://www.linkedin.com/in/jonathan-cowling/)

---

## How to Use PeerJS

1. Create a peer: `const peer = new Peer("optional-id");`
2. Create a connection: `const connection = peer.connect("other-peer-id");`
3. Receive connections: `peer.on("connect", (connection) => { ... });`
4. Send a message: `connection.send("string, blob, whatever")`
5. Receive messages: `connection.on("data", (data) => { ... });`

> See: [https://peerjs.com/](https://peerjs.com/)

---

## Could a Peer to Peer solution work for you?

1. How important is the data to your org?
2. How personal is it to users?
3. How much throughput are you expecting?
4. How varied are the devices/peers?
5. How long does data need to last?

Notes:

Common use Cases:

- Gaming
- File sharing
- Voice & Video

---

## Learn More

- https://peerjs.com/
- https://eytanmanor.medium.com/an-architectural-overview-for-web-rtc-a-protocol-for-implementing-video-conferencing-e2a914628d0e
