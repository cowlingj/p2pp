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

Notes:
- Introduction
- Story:
  - Inspiration for app
  - Functionality I want
  - Where I'm starting (Demo)

---

# Peer 2 Peer Connectivity

Notes:
- P2P vs client/server paradigm

----

# *

Notes:
Whenever I mention "No servers"

---

## How to Use PeerJS

Create a peer:
```
const peer = new Peer("optional-id");
```
Create a connection:
```
const connection = peer.connect("other-peer-id");
```
Send a message:
```
connection.send("string, blob, whatever")
```

----

Receive connections:
```
peer.on("connect", (connection) => { ... });
```
Receive messages:
```
connection.on("data", (data) => { ... });
```

> Full Documentation: [https://peerjs.com/](https://peerjs.com/)

---

## Could a Peer to Peer solution work for you?

1. How important is the data to the org?
2. How personal is it to users?
3. How much throughput are you expecting?
4. How varied are the devices/peers?
5. How long does data need to last?

Notes:

Benefits:
- Bandwidth
- Privacy

Challenges:
- Persistence
- Discovery
- Device heterogeneity

Common use Cases:
- Gaming
- File sharing
- Voice & Video

---

## Learn More

- https://peerjs.com/
- https://eytanmanor.medium.com/an-architectural-overview-for-web-rtc-a-protocol-for-implementing-video-conferencing-e2a914628d0e
