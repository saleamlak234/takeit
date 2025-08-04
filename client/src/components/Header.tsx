import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  User, 
  Menu, 
  X, 
  LogOut, 
  DollarSign,
  Users,
  Award,
  BarChart3,
  Shield,
  Crown
} from 'lucide-react';
import PackageSlider from './PackageSlider';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getVipBadgeIcon = (vipBadge: string) => {
    switch (vipBadge) {
      case 'bronze': return <Award className="h-4 w-4 text-orange-600" />;
      case 'silver': return <Award className="h-4 w-4 text-gray-500" />;
      case 'gold': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Package Slider */}
      <PackageSlider />
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Saham Trading</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/deposits" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Deposits
                </Link>
                <Link to="/withdrawals" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Withdrawals
                </Link>
                <Link to="/commissions" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Commissions
                </Link>
                <Link to="/mlm-tree" className="text-gray-700 hover:text-primary-600 transition-colors">
                  MLM Tree
                </Link>
                <Link to="/vip-levels" className="text-gold-600 hover:text-gold-700 transition-colors font-medium flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>VIP Levels</span>
                </Link>
                <Link to="/daily-returns" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Daily Returns
                </Link>
                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition-colors font-medium">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.fullName}</span>
                  {user.vipBadge && user.vipBadge !== 'none' && (
                    <div className="flex items-center space-x-1">
                      {getVipBadgeIcon(user.vipBadge)}
                      <span className="text-xs font-bold text-gold-600">VIP {user.vipLevel}</span>
                    </div>
                  )}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {user.vipBadge && user.vipBadge !== 'none' && (
                          <div className="flex items-center space-x-1 bg-gold-100 px-2 py-1 rounded-full">
                            {getVipBadgeIcon(user.vipBadge)}
                            <span className="text-xs font-bold text-gold-800">
                              VIP {user.vipLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Balance:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {user.balance.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/vip-levels"
                        className="flex items-center px-4 py-2 text-sm text-gold-600 hover:bg-gold-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Crown className="h-4 w-4 mr-3" />
                        VIP Levels
                      </Link>
                      <Link
                        to="/deposits"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <DollarSign className="h-4 w-4 mr-3" />
                        Deposits
                      </Link>
                      <Link
                        to="/commissions"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Award className="h-4 w-4 mr-3" />
                        Commissions
                      </Link>
                      {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/vip-levels"
                    className="text-gold-600 hover:text-gold-700 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    VIP Levels
                  </Link>
                  <Link
                    to="/daily-returns"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daily Returns
                  </Link>
                  <Link
                    to="/deposits"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deposits
                  </Link>
                  <Link
                    to="/withdrawals"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Withdrawals
                  </Link>
                  <Link
                    to="/commissions"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Commissions
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'transaction_admin') && (
                    <Link
                      to="/admin"
                      className="text-red-600 hover:text-red-700 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}