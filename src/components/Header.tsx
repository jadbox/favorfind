import React from "react";
import { Library, Search } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-200 px-2 md:px-6 py-2 min-w-full">
      <div className="flex items-center justify-between mx-auto">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Search className="h-8 w-8 text-medical-600" />
          <span className="text-xl font-bold text-medical-600">FavorFind</span>
        </a>

        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          <a
            href="/library"
            className="btn btn-ghost btn-sm flex items-center space-x-2"
          >
            <Library className="h-8 w-8 text-medical-600" />
            <span>Saved Results</span>
          </a>

          {/* User Profile */}
          {/* <div className="avatar">
            <div className="w-10 rounded-full ring ring-medical-600 ring-offset-2">
              <div className="bg-medical-600 flex items-center justify-center h-full w-full rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
