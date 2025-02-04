import { useEffect, useRef, useState } from "react";
import Button from "./component/Button";

function App() {

    interface Player {
        name: string,
        symbol: 'X' | 'O',
    }

    const [ symbol, setSymbol ] = useState(Array(9).fill( null ));
    const [ move, setMove ] = useState('X');
    const [ winner, setWinner ] = useState(null);
    const [ players, setPlayers ] = useState<Player[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);
    const [ waiting, setWaiting ] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {

        try{

            const ws = new WebSocket(BACKEND_URL);
            wsRef.current = ws;

            ws.onmessage = (event) => {

                const data = JSON.parse(event.data);
                console.log(data);

                if(data?.type === "start"){

                    setPlayers(data?.payload?.game);
                    setWaiting(false);

                } else if(data?.type === 'move'){

                    setSymbol(data?.payload?.board);
                    setMove(data?.payload?.move);

                } else if(data?.type === 'reset'){

                    setSymbol(data?.payload?.symbol);
                    setMove(data?.payload?.move);
                    setWinner(data?.payload?.winner);

                }

            }

            return () => {
                ws.close()
            }

        } catch(e) {
            console.log("There was an error")
        }

    },[])

    function joinGame(){
        
        console.log(nameRef.current?.value)

        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: "join",
                payload: {
                    name: nameRef.current?.value
                }
            }))
        }

        setWaiting(true)

    }

    function changeMove(id : number) {

        if( symbol[id] ) return;
        const newSymbols = [...symbol];
        newSymbols[id] = move;

        let newMove;

        if(move === 'X'){
            newMove = 'O'
        } else {
            newMove = 'X'
        }

        wsRef.current?.send(JSON.stringify({
            type: "move",
            payload: {
                board: newSymbols,
                move: newMove,
            }
        }))

        setSymbol(newSymbols);
        setMove(newMove);

    }  

    function wincombination(){

        const combinations = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ]

        combinations.map( x => {
            if(symbol[x[0]] === symbol[x[1]] && symbol[x[1]] === symbol[x[2]] && symbol[x[2]] === symbol[x[0]]){
                setWinner(symbol[x[0]])
            }
        })

        return null;

    }

    useEffect(() => {
        wincombination()
    },[move])


    function resetGame(){
        
        wsRef.current?.send(JSON.stringify({
            type: "reset",
            payload: {
                move: 'X',
                winner: null,
                symbol: Array(9).fill( null ),
            }
        }))

        setMove('X');
        setWinner(null);
        setSymbol(Array(9).fill( null ));
    }

    return (
        <div className=" h-screen flex flex-col justify-center items-center">

            <h1 className=" text-[50px] font-semibold my-[20px]">TIC TAC TOE</h1>

            {(players.length < 2) ?

                ((!waiting) ?  

                    <div className=" mb-[20px] space-x-2">
                        <input type="text" placeholder="Name" className=" text-[20px] py-[5px] px-[10px] border-2 border-black font-semibold" ref={nameRef}/>
                        <button className=" bg-blue-400 text-[20px] font-semibold px-[30px] py-[8px]" onClick={joinGame} >Join</button>
                    </div>

                    :
                    
                    <div>Waiting for the other player ...</div>
                )

                :
                
                ((winner)? 

                    <div className=" flex flex-col justify-center items-center">
                        <div className=" text-[20px] font-semibold mb-[20px] ml-[50px]">
                            <div className=" grid grid-cols-2 space-y-2">
                                <span>Player 1 : {players[0]?.name}</span>
                                <span className=" ml-[20px]"> Symbol: {players[0]?.symbol}</span>
                                <span>Player 2 : {players[1]?.name}</span>
                                <span className=" ml-[20px]"> Symbol: {players[1]?.symbol}</span>
                            </div>
                        </div>
                        <div className=" text-[30px] font-semibold">
                            Winner {winner}
                        </div>
                        <button className=" bg-blue-600 text-[20px] font-semibold px-[20px] py-[10px] text-white my-[20px]" onClick={resetGame}> Reset Game</button>
                    </div>
                    

                    :

                    <div className=" flex flex-col justify-center items-center">
                        <div className=" text-[20px] font-semibold mb-[20px] ml-[50px]">
                            <div className=" grid grid-cols-2 space-y-2">
                                <span>Player 1 : {players[0]?.name}</span>
                                <span className=" ml-[20px]"> Symbol: {players[0]?.symbol}</span>
                                <span>Player 2 : {players[1]?.name}</span>
                                <span className=" ml-[20px]"> Symbol: {players[1]?.symbol}</span>
                            </div>
                        </div>
                        <div className=" text-[20px] font-semibold mb-[20px]">
                            TURN: {(move === 'X')? players[0]?.name : players[1]?.name}
                        </div>
                        <div className=" grid gap-2 grid-cols-3">
                            {symbol.map((x, index)  => 
                                <Button
                                    key={index} 
                                    id={index.toString()} 
                                    symbol={x}
                                    onClick={() => changeMove( index )}
                                />
                            )}
                        </div>
                        <button className=" bg-blue-600 text-[20px] font-semibold px-[20px] py-[10px] text-white my-[20px]" onClick={resetGame}> Reset Game</button>
                    </div>

                )
            }
   
        </div>
    )
}

export default App;