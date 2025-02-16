"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 8080");
});
const ws = new ws_1.WebSocketServer({ server });
let game = [];
ws.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        if (game.length < 2) {
            if (parsedMessage.type === "join") {
                game.push({
                    socket,
                    name: parsedMessage.payload.name,
                    symbol: (game.length) ? 'O' : 'X'
                });
                if (game.length === 2) {
                    let disabled;
                    game.map(player => {
                        if (player.symbol === 'X') {
                            player.socket.send(JSON.stringify({
                                type: "start",
                                payload: {
                                    game,
                                    disabled: false
                                }
                            }));
                        }
                        else {
                            player.socket.send(JSON.stringify({
                                type: "start",
                                payload: {
                                    game,
                                    disabled: true
                                }
                            }));
                        }
                    });
                }
            }
        }
        else {
            if (parsedMessage.type === "move") {
                let disabled;
                game.map(x => {
                    if (parsedMessage.payload.move === x.symbol) {
                        x.socket.send(JSON.stringify({
                            parsedMessage,
                            disabled: false
                        }));
                    }
                    else {
                        x.socket.send(JSON.stringify({
                            parsedMessage,
                            disabled: true
                        }));
                    }
                });
            }
            if (parsedMessage.type === "reset") {
                let disabled;
                game.map(x => {
                    if (parsedMessage.payload.move === x.symbol) {
                        x.socket.send(JSON.stringify({
                            parsedMessage,
                            disabled: false
                        }));
                    }
                    else {
                        x.socket.send(JSON.stringify({
                            parsedMessage,
                            disabled: true
                        }));
                    }
                });
            }
        }
    });
    socket.on("close", () => {
        game = game.filter(player => player.socket !== socket);
        console.log("Player disconnected. Remaining players:", game.length);
    });
});
