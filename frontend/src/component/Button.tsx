function Button({ symbol, id, onClick, disable }: { symbol: string, id: string, onClick: () => void, disable: boolean}) {

  return (
    <div>
      <button id={id} className=" border-5 border-black h-[100px] w-[100px] text-[50px] text-black font-bold" onClick={onClick} disabled={disable}>
        {symbol}
      </button>
    </div>
  )
}

export default Button;
