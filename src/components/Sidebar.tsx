interface Props {
    active: string;
    setActive: (value: string) => void;
  }
  
  function Sidebar({
    active,
    setActive,
  }: Props) {
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
            className="
            w-full
            text-left
            p-3
            rounded-lg
            hover:bg-slate-800
            "
          >
            Dashboard
          </button>
  
          <button
            onClick={() =>
              setActive("institutes")
            }
            className="
            w-full
            text-left
            p-3
            rounded-lg
            hover:bg-slate-800
            "
          >
            Institutes
          </button>
  
          <button
            onClick={() =>
              setActive("users")
            }
            className="
            w-full
            text-left
            p-3
            rounded-lg
            hover:bg-slate-800
            "
          >
            Users
          </button>
  
        </div>
      </div>
    );
  }
  
  export default Sidebar;