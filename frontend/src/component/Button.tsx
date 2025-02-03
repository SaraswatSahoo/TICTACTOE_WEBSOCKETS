function Button({ symbol, id, onClick }: { symbol: string, id: string, onClick: () => void}) {

  return (
    <div>
      <button id={id} className=" border-5 border-black h-[100px] w-[100px] text-[50px] text-black font-bold" onClick={onClick} >
        {symbol}
      </button>
    </div>
  )
}

export default Button;
