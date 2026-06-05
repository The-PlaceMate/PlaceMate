interface Props {
    text: string;
  }
  
  function AuthButton({
    text,
  }: Props) {
    return (
      <button
        className="
        w-full
        bg-blue-600
        text-white
        py-4
        rounded-xl
        font-semibold
        hover:bg-blue-700
        transition
        shadow-lg
        "
      >
        {text}
      </button>
    );
  }
  
  export default AuthButton;