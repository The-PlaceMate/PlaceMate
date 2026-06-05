interface Props {
    active: string;
    setActive: (value: string) => void;
  }
  
  function Sidebar({
    active,
    setActive,
  }: Props) {
    const itemClass = (value: string) => `
      w-full
      text-left
      p-3
      rounded-lg
      ${active === value ? "bg-slate-800" : "hover:bg-slate-800"}
    `;

    return (
      <div className="w-72 bg-slate-900 text-white p-6">
  
        <h1 className="text-3xl font-bold mb-10">
          PlaceMate
        </h1>
  
        <div className="space-y-2">
  
          <button
            onClick={() =>
              setActive("dashboard")
            }
            className={itemClass("dashboard")}
          >
            Dashboard
          </button>
  
          <button
            onClick={() =>
              setActive("institutes")
            }
            className={itemClass("institutes")}
          >
            Institutes
          </button>
  
          <button
            onClick={() =>
              setActive("users")
            }
            className={itemClass("users")}
          >
            Users
          </button>
  
        </div>
      </div>
    );
  }
  
  export default Sidebar;
