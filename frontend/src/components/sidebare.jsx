import React from 'react';
import {
  Truck,
  Home,
  Package,
  Users,
  MapPin,
  Settings,
  BarChart3,
  Fuel,
  X
} from 'lucide-react';
import { NavLink } from "react-router-dom";


export default function Sidebare() {
  const menuItems = [
    { icon: Fuel, label: 'FuelLog',path:'/fuel-logs' },
    { icon: Truck, label: 'truck', path: '/trucks' },
    { icon: Package, label: 'trailer', path: '/trailers' },
    { icon: Users, label: 'Chauffeurs', path: '/chauffeurs' },
    { icon: MapPin, label: 'trajet', path: '/trips' },
    { icon: BarChart3, label: 'maintenance', active: false },
    { icon: BarChart3, label: 'maintenance rule', active: false },
    { icon: Settings, label: 'pneu',path: '/pneus' },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b8492] rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#2a6570]">SyncRoad</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            if (item.path) {
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-[#3b8492] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            } else {
              return (
                <div
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.active ? 'bg-[#3b8492] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              );
            }
          })}
        </nav>


      </aside>
    </>
  );
}