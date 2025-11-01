import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`;

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r p-4">
      <ul className="space-y-2">
        <li><NavLink to="/inventory" className={linkClass}>Inventario</NavLink></li>
        <li><NavLink to="/orders" className={linkClass}>Órdenes</NavLink></li>
      </ul>
    </aside>
  );
}
