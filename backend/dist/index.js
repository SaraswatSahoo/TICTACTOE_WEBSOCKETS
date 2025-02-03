"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = app.listen(3001, () => {
    console.log("Server running on port 3001");
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
                    game.map(player => {
                        player.socket.send(JSON.stringify({
                            type: "start",
                            payload: {
                                game
                            }
                        }));
                    });
                }
            }
        }
        else {
            if (parsedMessage.type === "move") {
                game.map(x => {
                    x.socket.send(JSON.stringify(parsedMessage));
                });
            }
            if (parsedMessage.type === "reset") {
                game.map(x => {
                    x.socket.send(JSON.stringify(parsedMessage));
                });
            }
        }
    });
    socket.on("close", () => {
        game = game.filter(player => player.socket !== socket);
        console.log("Player disconnected. Remaining players:", game.length);
    });
});
