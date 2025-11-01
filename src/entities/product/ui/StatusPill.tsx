export default function StatusPill({ status }: { status: "active" | "inactive" }) {
  const color = status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{status}</span>;
}
