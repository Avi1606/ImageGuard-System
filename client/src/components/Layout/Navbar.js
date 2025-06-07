import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
  X,
  Shield,
  User,
  Settings,
  LogOut,
  Upload,
  Image as ImageIcon,
  Eye,
  BarChart3,
  Brain
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navigation = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'Watermark', href: '/watermark', icon: Shield },
    { name: 'ML Detection', href: '/ml-detection', icon: Brain },
  ] : [];

  return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl text-gray-900">
                ImageGuard
              </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            {user && (
                <div className="hidden md:flex items-center space-x-4">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                    );
                  })}
                </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                  <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="hidden md:block text-gray-700 font-medium">
                    {user.username}
                  </span>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                          <Link
                              to="/profile"
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Profile Settings</span>
                          </Link>
                          <Link
                              to="/analytics"
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileOpen(false)}
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                          </Link>
                          <hr className="my-1" />
                          <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                        to="/register"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
              )}

              {/* Mobile menu button */}
              {user && (
                  <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-700 hover:text-blue-600 p-2"
                    >
                      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Mobile navigation */}
          {user && isOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                                isActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                    );
                  })}
                </div>
              </div>
          )}
        </div>

        {isProfileOpen && (
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
            />
        )}
      </nav>
  );
};

export default Navbar;