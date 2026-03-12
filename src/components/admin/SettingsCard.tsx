interface CardProps {
  title: string;
  icon: string;
  colorClass: string;
  children: React.ReactNode;
}

export const SettingsCard = ({ title, icon, colorClass, children }: CardProps) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
    <h2 className={`text-xs font-black ${colorClass} uppercase tracking-widest flex items-center gap-2`}>
      <span className="text-lg">{icon}</span> {title}
    </h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);