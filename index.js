"use strict";

/*
    PeerJS Extension for Scratch

    MIT License

    Copyright (C) 2025 Mike Renaker "MikeDEV".

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

function fatalAlert(message) {
    alert(message);
    throw new Error(message);
}

/*
    https://github.com/peers/peerjs

    Copyright (c) 2015 Michelle Bu and Eric Zhang, http://peerjs.com

    (The MIT License)

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const PEERJS_SCRIPT = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";

function loadScript(callback, error) {

    // Check if the script is already loaded
    if (document.querySelector('script[src="' + PEERJS_SCRIPT + '"]')) {
        console.log("PeerJS already loaded");
        if (callback) {
            callback();
        }
        return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = PEERJS_SCRIPT;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    script.onload = () => {
        console.log("PeerJS loaded");
        if (callback) {
            callback();
        }
    }

    script.onerror = () => {
        if (error) {
            error();
        }
    }
}

/*
    https://github.com/skeeto/ulid-js

    This is free and unencumbered software released into the public domain.

    Anyone is free to copy, modify, publish, use, compile, sell, or
    distribute this software, either in source code form or as a compiled
    binary, for any purpose, commercial or non-commercial, and by any
    means.

    In jurisdictions that recognize copyright laws, the author or authors
    of this software dedicate any and all copyright interest in the
    software to the public domain. We make this dedication for the benefit
    of the public at large and to the detriment of our heirs and
    successors. We intend this dedication to be an overt act of
    relinquishment in perpetuity of all present and future rights to this
    software under copyright law.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
    ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    For more information, please refer to http://unlicense.org/
*/
function ULID() {
    const BASE32 = [
        '0', '1', '2', '3', '4', '5', '6', '7',
        '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q',
        'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
    ];
    let last = -1;
    /* Pre-allocate work buffers / views */
    let ulid = new Uint8Array(16);
    let time = new DataView(ulid.buffer, 0, 6);
    let rand = new Uint8Array(ulid.buffer, 6, 10);
    let dest = new Array(26);

    function encode(ulid) {
        dest[0] = BASE32[ ulid[0] >> 5];
        dest[1] = BASE32[(ulid[0] >> 0) & 0x1f];
        for (let i = 0; i < 3; i++) {
            dest[i*8+2] = BASE32[ ulid[i*5+1] >> 3];
            dest[i*8+3] = BASE32[(ulid[i*5+1] << 2 | ulid[i*5+2] >> 6) & 0x1f];
            dest[i*8+4] = BASE32[(ulid[i*5+2] >> 1) & 0x1f];
            dest[i*8+5] = BASE32[(ulid[i*5+2] << 4 | ulid[i*5+3] >> 4) & 0x1f];
            dest[i*8+6] = BASE32[(ulid[i*5+3] << 1 | ulid[i*5+4] >> 7) & 0x1f];
            dest[i*8+7] = BASE32[(ulid[i*5+4] >> 2) & 0x1f];
            dest[i*8+8] = BASE32[(ulid[i*5+4] << 3 | ulid[i*5+5] >> 5) & 0x1f];
            dest[i*8+9] = BASE32[(ulid[i*5+5] >> 0) & 0x1f];
        }
        return dest.join('');
    }

    return function() {
        let now = Date.now();
        if (now === last) {
            /* 80-bit overflow is so incredibly unlikely that it's not
                * considered as a possiblity here.
                */
            for (let i = 9; i >= 0; i--)
                if (rand[i]++ < 255)
                    break;
        } else {
            last = now;
            time.setUint16(0, (now / 4294967296.0) | 0);
            time.setUint32(2, now | 0);
            window.crypto.getRandomValues(rand);
        }
        return encode(ulid);
    };
}

// PeerJS
// ID: peerjs
// Description: Something
// By: MikeDEV
// License: MIT
(async function (Scratch2) {

    // Require the extension to be unsandboxed
    if (!Scratch2.extensions.unsandboxed) {
        fatalAlert("The PeerJS extension must be loaded in an unsandboxed environment.");
    }

    // Require access to the VM and/or runtime
    if (!Scratch2.vm || !Scratch2.vm.runtime) {
        fatalAlert("The PeerJS extension could not detect access to the Scratch VM and/or runtime.");
    }

    // Require the browser to support WebRTC (used for connectivity)
    if (!RTCPeerConnection) {
        fatalAlert("The PeerJS extension could not detect WebRTC support.");
    }

    // Require browser to support Web Locks API (used for concurrency)
    if (!navigator.locks) {
        fatalAlert("The PeerJS extension could not detect Web Locks support. See https://developer.mozilla.org/en-US/docs/Web/API/Lock for more information.");
    }

    class Extension {
        constructor(vm) {
            this.vm = vm;
            this.peer;
            this.dataConnections = new Map();
            this.voiceConnections = new Map();
            this.newestConnected = "";
            this.lastDisconnected = "";
            this.hasMicPerms = false;
            this.ringingPeers = new Map();
            this.ulidGenerator = new ULID();
        }
        getInfo() {
            return {
                id: "peerjs",
                name: "PeerJS",
                blockIconURI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCAxOCA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExIDMxSDdWNDVIMTFWMzFaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPHBhdGggZD0iTTUuMzYzNjQgMzBMMSAyMS41VjEzSDQuMzkzOTRMNy4zMDMwMyAxNi4zMDU2SDEwLjIxMjFMMTMuMTIxMiAxM0gxN1YyMS41TDEyLjE1MTUgMzBINS4zNjM2NFoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNMiAxVjExLjVINi41VjcuNUg1LjVWNEgzVjFIMloiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNMTYgMVYxMS41SDExLjVWNy41SDEyLjVWNEgxNVYxSDE2WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik03LjUgMTQuNUgxMC41VjYuNUgxMS41VjRINi41VjYuNUg3LjVWMTQuNVoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNNSAzVjFINlYzSDVaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPHBhdGggZD0iTTcgM1YxSDhWM0g3WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik0xMCAzVjFIMTFWM0gxMFoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNMTIgM1YxSDEzVjNIMTJaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+Cg==",
                menuIconURI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4OV8xNTApIj4KPHBhdGggZD0iTTAgMjVDMCAxMS4xOTI5IDExLjE5MjkgMCAyNSAwQzM4LjgwNzEgMCA1MCAxMS4xOTI5IDUwIDI1QzUwIDM4LjgwNzEgMzguODA3MSA1MCAyNSA1MEMxMS4xOTI5IDUwIDAgMzguODA3MSAwIDI1WiIgZmlsbD0iI0U5NjE1MSIvPgo8cGF0aCBkPSJNMjcgMzNIMjNWNDdIMjdWMzNaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPHBhdGggZD0iTTIxLjM2MzYgMzJMMTcgMjMuNVYxNUgyMC4zOTM5TDIzLjMwMyAxOC4zMDU2SDI2LjIxMjFMMjkuMTIxMiAxNUgzM1YyMy41TDI4LjE1MTUgMzJIMjEuMzYzNloiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNMTggM1YxMy41SDIyLjVWOS41SDIxLjVWNkgxOVYzSDE4WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik0zMiAzVjEzLjVIMjcuNVY5LjVIMjguNVY2SDMxVjNIMzJaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPHBhdGggZD0iTTIzLjUgMTYuNUgyNi41VjguNUgyNy41VjZIMjIuNVY4LjVIMjMuNVYxNi41WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik0yMSA1VjNIMjJWNUgyMVoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8cGF0aCBkPSJNMjMgNVYzSDI0VjVIMjNaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPHBhdGggZD0iTTI2IDVWM0gyN1Y1SDI2WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik0yOCA1VjNIMjlWNUgyOFoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4OV8xNTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
                color1: "#E96151",
                blocks: [
                    {
                        opcode: "newULID",
                        blockType: Scratch2.BlockType.REPORTER,
                        disableMonitor: true,
                        text: "Generate ULID",
                    },
                    "---",
                    {
                        opcode: "whenPeerCreated",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When my peer is created",
                    },
                    {
                        opcode: "whenPeerDestroyed",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When my peer is destroyed",
                    },
                    {
                        opcode: "whenPeerDisconnected",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When my peer is disconnected",
                    },
                    {
                        opcode: "whenPeerHasError",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When my peer has an error",
                    },
                    {
                        opcode: "readPeerErrorInfo",
                        blockType: Scratch2.BlockType.REPORTER,
                        text: "Error info",
                    },
                    {
                        opcode: "isPeerConnected",
                        blockType: Scratch2.BlockType.BOOLEAN,
                        text: "Connected to PeerJS server?",
                    },
                    {
                        opcode: "createPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Connect to PeerJS as [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "A"
                            },
                        }
                    },
                    {
                        opcode: "disconnectPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Disconnect from PeerJS server",
                    },
                    {
                        opcode: "reconnectPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Reconnect to PeerJS server",
                    },
                    {
                        opcode: "destroyPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Destroy PeerJS connection",
                    },
                    "---",
                    {
                        opcode: "whenPeerConnects",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When a peer connects",
                    },
                    {
                        opcode: "readNewestPeerConnected",
                        blockType: Scratch2.BlockType.REPORTER,
                        text: "Newest peer connected",
                    },
                    {
                        opcode: "connectToPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Connect to [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    "---",
                    {
                        opcode: "whenPeerDisconnects",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When a peer disconnects",
                    },
                    
                    {
                        opcode: "readLastPeerDisconnected",
                        blockType: Scratch2.BlockType.REPORTER,
                        text: "Last peer disconnected",
                    },
                    {
                        opcode: "isOtherPeerConnected",
                        blockType: Scratch2.BlockType.BOOLEAN,
                        text: "Connected to [ID]?",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    {
                        opcode: "disconnectFromPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Disconnect from [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    "---",
                    {
                        opcode: "whenPeerRings",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When peer [ID] calls me",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    {
                        opcode: "doIHaveMicPerms",
                        blockType: Scratch2.BlockType.BOOLEAN,
                        text: "Do I have microphone access?"
                    },
                    {
                        opcode: "requestMicPerms",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Request microphone access"
                    },
                    {
                        opcode: "callPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Call peer [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    {
                        opcode: "answerPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Accept incoming call from peer [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    {
                        opcode: "hangupPeerCall",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Hangup or decline call from peer [ID]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                        }
                    },
                    "---",
                    {
                        opcode: "whenPeerGetsMessage",
                        blockType: Scratch2.BlockType.EVENT,
                        isEdgeActivated: false,
                        text: "When I get a message from peer [ID] in channel [CHANNEL]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                            CHANNEL: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "default"
                            },
                        }
                    },
                    
                    {
                        opcode: "readMessageFromPeer",
                        blockType: Scratch2.BlockType.REPORTER,
                        text: "Message from peer [ID] in channel [CHANNEL]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                            CHANNEL: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "default"
                            },
                        }
                    },
                    {
                        opcode: "doesPeerHaveChannel",
                        blockType: Scratch2.BlockType.BOOLEAN,
                        text: "Does [ID] have channel [CHANNEL]?",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                            CHANNEL: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "blueberry"
                            },
                        }
                    },
                    {
                        opcode: "sendMessageToPeer",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Send [MESSAGE] to peer [ID] using channel [CHANNEL]",
                        arguments: {
                            MESSAGE: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "hello world"
                            },
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                            CHANNEL: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "default"
                            },
                        }
                    },
                    {
                        opcode: "openNewPeerChannel",
                        blockType: Scratch2.BlockType.COMMAND,
                        text: "Open a new channel [CHANNEL] with peer [ID] and enforce order? [ORDERED]",
                        arguments: {
                            ID: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "B"
                            },
                            CHANNEL: {
                                type: Scratch2.ArgumentType.STRING,
                                defaultValue: "blueberry"
                            },
                            ORDERED: {
                                type: Scratch2.ArgumentType.BOOLEAN,
                                defaultValue: false
                            },
                        }
                    },
                ],
                menus: {},
            }
        }

        handleChannelOpen(conn, chan) {
            const self = this;
            console.log("Channel " + chan.label + " opened with peer " + conn.peer);
            conn.channels.set(chan.label, {chan, data: ""});
        }

        handleChannelClose(conn, chan) {
            const self = this;
            console.log("Channel " + chan.label + " closed with peer " + conn.peer);
            conn.channels.delete(chan.label);
        }

        handleChannelError(conn, chan, err) {
            const self = this;
            console.log("Channel " + chan.label + " error with peer " + conn.peer + ":", err);
            self.peer.errorInfo = err;
            self.vm.runtime.startHats("peerjs_whenPeerError");
        }

        async handleChannelData(conn, chan, data) {
            const self = this;
            console.log("Channel " + chan.label + " data with peer " + conn.peer + ":", data);
            const { opcode, payload } = data;
            switch (opcode) {
                case "P_MSG":
                    conn.channels.get(chan.label).data = payload;
                    self.vm.runtime.startHats("peerjs_whenPeerGetsMessage");
                    break;

                case "NEW_CHAN":
                    if (chan.label !== "default") {
                        console.warn("Attempted to call NEW_CHAN on non-default channel " + chan.label + " with peer " + conn.peer);
                        return;
                    };

                    const { id, label, ordered } = payload;

                    // Don't allow duplicate channel labels
                    if (conn.channels.has(label)) return;

                    // Acquire WebLock to prevent other peers from opening channels while we're creating this one
                    const lock_id = "peerjs_" + conn.peer + "_" + chan.label;
                    await navigator.locks.request(lock_id, { ifAvailable: true }, () => {
                        const newchan = conn.peerConnection.createDataChannel(
                            label,
                            {
                                ordered: ordered,
                                negotiated: true,
                                id: id,
                            }
                        );

                        // Synchronize channel ID counter
                        conn.idCounter = id;

                        newchan.onopen = () => {
                            self.handleChannelOpen(conn, newchan);
                        }
            
                        newchan.onclose = () => {
                            self.handleChannelClose(conn, newchan);
                        }

                        newchan.onerror = (err) => {
                            self.handleChannelError(conn, newchan, err);
                        }
            
                        newchan.onmessage = async (msg) => {
                            await self.handleChannelData(conn, newchan, JSON.parse(msg.data));
                        }
            
                        // Store channel reference
                        conn.channels.set(label, {
                            data: "",
                            chan: newchan,
                        });
                    });
                    break;
                
                default:
                    console.log("Unknown opcode: " + opcode);
                    break;
            }
        }

        // PeerJS connection event handlers
        handleDataConnection(conn) {
            const self = this;

            conn.on("open", () => {
                self.handleChannelOpen(conn, conn);
                if (conn.label === "default") {
                    self.newestConnected = conn.peer;
                    self.vm.runtime.startHats("peerjs_whenPeerConnects");
                }
            })
    
            conn.on("close", () => {
                self.handleChannelClose(conn, conn);
                if (conn.label === "default") {
                    self.lastDisconnected = conn.peer;
                    self.dataConnections.delete(conn.peer);
                    if (self.voiceConnections.has(conn.peer)) {
                        self.voiceConnections.get(conn.peer).call.close();
                    }
                    self.vm.runtime.startHats("peerjs_whenPeerDisconnects");
                }
            })
    
            conn.on("error", (err) => {
                self.handleChannelError(conn, conn, err);
            })

            conn.on("data", async (data) => {
                await self.handleChannelData(conn, conn, JSON.parse(data));
            })
        }

        newULID() {
            const self = this;
            return self.ulidGenerator();
        }

        createPeer({ID}) {
            const self = this;
            self.peer = new Peer(
                ID,
                {
                    config: {
                        iceServers: [
                            {
                                urls: "stun:vpn.mikedev101.cc:3478"
                            },
                            {
                                urls: "turn:vpn.mikedev101.cc:3478",
                                username: "free",
                                credential: "free"
                            },
                            {
                                urls: "stun:vpn.mikedev101.cc:5349"
                            },
                            {
                                urls: "turn:vpn.mikedev101.cc:5349",
                                username: "free",
                                credential: "free"
                            },
                        ]
                    },
                    debug: 2,
                }
            )

            self.peer.errorInfo = "";

            self.peer.on("open", id => {
                if (id === ID) {
                    console.log("Peer opened with ID: " + id);
                    self.vm.runtime.startHats("peerjs_whenPeerCreated");
                }
            })

            self.peer.on("connection", (conn) => {
                conn.idCounter = 2;
                conn.channels = new Map();
                self.dataConnections.set(conn.peer, conn);
                self.handleDataConnection(conn);
            })

            self.peer.on('call', async(call) => {
                if (!self.hasMicPerms || self.voiceConnections.has(call.peer)) {
                    call.close();
                    return;
                }
                self.ringingPeers.set(call.peer, call);
                self.vm.runtime.startHats("peerjs_whenPeerRings");
                console.log("Incoming call from peer " + call.peer);
            });

            self.peer.on("close", () => {
                console.log("Peer was destroyed");
                self.vm.runtime.startHats("peerjs_whenPeerDestroyed");
            })

            self.peer.on("disconnected", () => {
                console.log("Peer was disconnected");
                self.vm.runtime.startHats("peerjs_whenPeerDisconnected");
            })

            self.peer.on("error", err => {
                console.log("Peer error: " + err);
                self.peer.errorInfo = err;
                self.vm.runtime.startHats("peerjs_whenPeerHasError");
            })
        }

        readPeerErrorInfo() {
            const self = this;
            if (!self.peer) return "";
            return self.peer.errorInfo;
        }

        connectToPeer({ID}) {
            const self = this;
            if (!self.peer) return;
            if (self.dataConnections.has(ID)) return;
            const conn = self.peer.connect(ID, {
                label: "default",
                reliable: true,
            });
            self.dataConnections.set(conn.peer, conn);
            conn.idCounter = 2;
            conn.channels = new Map();
            self.handleDataConnection(conn);
        }

        disconnectFromPeer({ID}) {
            const self = this;
            if (!self.peer) return;
            if (!self.dataConnections.has(ID)) return;
            self.dataConnections.get(ID).close();
        }

        isOtherPeerConnected({ID}) {
            const self = this;
            if (!self.peer) return false;
            if (!self.dataConnections.has(ID)) return false;
            return !self.dataConnections.get(ID).disconnected;
        }

        whenPeerRings({ID}) {
            const self = this;
            return self.isOtherPeerConnected({ID});
        }

        async openNewPeerChannel({ID, CHANNEL, ORDERED}) {
            const self = this;
            if (!self.peer) return;
            if (!self.dataConnections.has(ID)) return;
            if (self.dataConnections.get(ID).channels.has(CHANNEL)) return;

            const lock_id = "peerjs_" + ID + "_" + CHANNEL;
            await navigator.locks.request(lock_id, { ifAvailable: true }, () => {

                // Create a new channel with PeerJS
                const conn = self.dataConnections.get(ID);
                const id = conn.idCounter++;
            
                // Since PeerJS doesn't natively support multiple channels, we have to create a new one manually
                const chan = conn.peerConnection.createDataChannel(
                    CHANNEL,
                    {
                        ordered: ORDERED,
                        negotiated: true,
                        id: id,
                    }
                );

                chan.onopen = () => {
                    self.handleChannelOpen(conn, chan);
                }

                chan.onclose = () => {
                    self.handleChannelClose(conn, chan);
                }

                chan.onerror = (err) => {
                    self.handleChannelError(conn, chan, err);
                }

                chan.onmessage = async (msg) => {
                    await self.handleChannelData(conn, chan, JSON.parse(msg.data));
                }

                // Store channel reference
                conn.channels.set(CHANNEL, {
                    data: "",
                    chan: chan,
                });

                // Tell the peer about the new channel
                conn.channels.get("default").chan.send(JSON.stringify({
                    opcode: "NEW_CHAN",
                    payload: {
                        id: id,
                        label: CHANNEL,
                        ordered: ORDERED,
                    },
                }));
            });
        }

        sendMessageToPeer({MESSAGE, ID, CHANNEL}) {
            const self = this;
            if (!self.peer) return;
            const conn = self.dataConnections.get(ID);
            if (!conn) return;
            if (!conn.channels.has(CHANNEL)) {
                console.warn("Channel " + CHANNEL + " does not exist for peer " + ID);
                return;
            }
            conn.channels.get(CHANNEL).chan.send(JSON.stringify({
                opcode: "P_MSG",
                payload: MESSAGE,
            }));
        }

        disconnectPeer() {
            const self = this;
            if (!self.peer) return;
            if (!self.peer.disconnected) self.peer.disconnect();
        }

        reconnectPeer() {
            const self = this;
            if (!self.peer) return;
            if (self.peer.disconnected) self.peer.reconnect();
        }

        destroyPeer() {
            const self = this;
            if (!self.peer) return;
            if (!self.peer.destroyed) self.peer.destroy();
        }

        isPeerConnected() {
            const self = this;
            if (!self.peer) return false;
            return !self.peer.disconnected && !self.peer.destroyed;
        }

        whenPeerGetsMessage({ID, CHANNEL}) {
            const self = this;
            return self.doesPeerHaveChannel({ID, CHANNEL});
        }

        doesPeerHaveChannel({ID, CHANNEL}) {
            const self = this;
            if (!self.peer) return false;
            const conn = self.dataConnections.get(ID);
            if (!conn) return false;
            return conn.channels.has(CHANNEL);
        }

        readMessageFromPeer({ID, CHANNEL}) {
            const self = this;
            if (!self.peer) return "";
            const conn = self.dataConnections.get(ID);
            if (!conn) return "";
            if (!conn.channels.has(CHANNEL)) {
                console.warn("Channel " + CHANNEL + " does not exist for peer " + ID);
                return ""
            };
            return conn.channels.get(CHANNEL).data;
        }

        readNewestPeerConnected() {
            const self = this;
            return self.newestConnected;
        }

        readLastPeerDisconnected() {
            const self = this;
            return self.lastDisconnected;
        }

        async requestMicPerms() {
            const self = this;
            self.hasMicPerms = false;
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                self.hasMicPerms = true;
            } catch (e) {
                console.warn(`Failed to get microphone permission. ${e}`);
                return;
            }
        }

        async callPeer({ID}) {
            const self = this;
            if (!self.peer) return;
            if (!self.dataConnections.has(ID)) return;
            if (!self.hasMicPerms) {
                console.warn("Please grant microphone permissions.");
                await self.requestMicPerms();
                if (!self.hasMicPerms) return;
            }
            if (self.voiceConnections.has(ID)) return;
            const lock_id = "peerjs_" + ID + "_call";
            await navigator.locks.request(lock_id, { ifAvailable: true }, async() => {
                await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    console.log("Calling peer " + ID);
                    self.handleCall(ID, self.peer.call(ID, stream));
                });
            });
        }

        hangupPeerCall({ID}) {
            const self = this;
            if (self.voiceConnections.has(ID)) self.voiceConnections.get(ID).call.close();
        }

        async answerPeer({ID}) {
            const self = this;
            if (!self.peer) return;
            if (!self.ringingPeers.has(ID)) return;
            console.log("Answering incoming call from peer " + ID);
            const call = self.ringingPeers.get(ID);
            const lock_id = "peerjs_" + ID + "_call";
            await navigator.locks.request(lock_id, { ifAvailable: true }, async() => {
                await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    call.answer(stream);
                    self.handleCall(ID, call);
                });
            });
        }

        handleCall(id, call) {
            const self = this;

            call.on("stream", (remoteStream) => {
                if (self.ringingPeers.has(id)) self.ringingPeers.delete(id);
                const audio = document.createElement("audio");
                audio.srcObject = remoteStream;
                audio.autoplay = true;
                self.voiceConnections.set(id, {
                    call: call,
                    audio: audio
                });
                audio.play();
                console.log("Picked up call with peer " + id);
            })

            call.on("close", () => {
                if (self.ringingPeers.has(id)) {
                    console.log("Declined incoming call from peer " + id);
                    self.ringingPeers.delete(id);
                } else {
                    console.log("Hung up call with peer " + id);
                    self.voiceConnections.delete(id);
                }
            })

            call.on("error", (err) => {
                console.warn("Call with peer " + id + " error: " + err);
            })
        }

        doIHaveMicPerms() {
            const self = this;
            return self.hasMicPerms;
        }
    }

    // Register the extension after the PeerJS library has loaded
    loadScript(() => {
        const extension = new Extension(Scratch2.vm);
        Scratch2.extensions.register(extension);
    }, () => {
        fatalAlert("PeerJS failed to load. Please check your internet connection.");
    });
})(Scratch);