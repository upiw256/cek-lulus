export default function StatCard({ title, value, color = "blue" }: any) {
  const colors: any = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div className={`p-6 rounded-3xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
      <p className="opacity-80 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}