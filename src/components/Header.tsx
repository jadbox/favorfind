import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, BookOpen, User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-medical-600" />
          <span className="text-2xl font-bold text-gray-900">Medeligo</span>
        </Link>
        
        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/library" 
            className="btn btn-ghost btn-sm flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Library</span>
          </Link>
          
          {/* User Profile */}
          <div className="avatar">
            <div className="w-10 rounded-full ring ring-medical-600 ring-offset-2">
              <div className="bg-medical-600 flex items-center justify-center h-full w-full rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;