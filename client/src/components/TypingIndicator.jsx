function TypingIndicator() {

  return (

    <div className="flex items-center gap-2 px-5 py-3 glass rounded-2xl w-fit">

      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />

      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />

      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />

    </div>

  );
}

export default TypingIndicator;