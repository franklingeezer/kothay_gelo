// src/components/Navbar.jsx

import React from "react";

export default function Navbar() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
          ₮
        </div>
        <h1 className="font-semibold text-lg">Takify</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          ⚙️
        </button>
      </div>

    </div>
  );
}