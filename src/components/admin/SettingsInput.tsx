interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}

export const SettingsInput = ({ label, value, onChange, type = "text" }: InputProps) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">
      {label}
    </label>
    <input 
      type={type}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);