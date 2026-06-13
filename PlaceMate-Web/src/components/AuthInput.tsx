interface Props {
    type?: string;
    placeholder: string;
  }
  
  function AuthInput({
    type = "text",
    placeholder,
  }: Props) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        className="
        w-full
        p-4
        rounded-xl
        border
        border-slate-300
        outline-none
        focus:border-blue-600
        focus:ring-2
        focus:ring-blue-200
        transition
        "
      />
    );
  }
  
  export default AuthInput;