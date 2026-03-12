export default function Sidebar({ activeTab, setActiveTab, menus, setIsOpen }: any) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">CekLulus</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menus.map((menu: any) => (
          <button
            key={menu.id}
            onClick={() => { setActiveTab(menu.id); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
              activeTab === menu.id ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {menu.icon} {menu.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}