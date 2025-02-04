require("dotenv").config();

import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";

const app = express();

app.use(express.json());
app.use(cors());

const server = app.listen( process.env.PORT || 3000, () => {
    console.log("Server running on port 8080");
})

const ws = new WebSocketServer({ server });

interface Game {
    socket: WebSocket,
    name: string,
    symbol: 'X' | 'O',
}

let game: Game[] = [];

ws.on("connection", (socket) => {

    socket.on("message", (message: string) => {

        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage);

        if(game.length < 2){

            if(parsedMessage.type === "join"){

                game.push({
                    socket,
                    name:parsedMessage.payload.name,
                    symbol: (game.length)? 'O' : 'X'
                })

                if(game.length === 2){
                    let disabled;
                    game.map( player => { if(player.symbol === 'X'){
                        player.socket.send(JSON.stringify({
                            type: "start",
                            payload:{
                                game,
                                disabled: false
                            }
                        }))
                    } else {
                        player.socket.send(JSON.stringify({
                            type: "start",
                            payload:{
                                game,
                                disabled: true
                            }
                        }))
                    }
                        
                    })
                }
                
            }

        } else {

            if(parsedMessage.type === "move"){
                let disabled;
                game.map(x => { if(parsedMessage.payload.move === x.symbol){
                    x.socket.send(JSON.stringify({
                        parsedMessage,
                        disabled: false
                    }))
                } else {
                    x.socket.send(JSON.stringify({
                        parsedMessage,
                        disabled: true
                    }))
                }
                    
                })
            }

            if(parsedMessage.type === "reset"){
                let disabled;
                game.map(x => { if(parsedMessage.payload.move === x.symbol) {
                    x.socket.send(JSON.stringify({
                        parsedMessage,
                        disabled: false
                    })) 
                } else {
                    x.socket.send(JSON.stringify({
                        parsedMessage,
                        disabled: true
                    }))
                }
                    
                })
            }

        }

    })

    socket.on("close", () => {
        game = game.filter(player => player.socket !== socket);
        console.log("Player disconnected. Remaining players:", game.length);
    });

})

