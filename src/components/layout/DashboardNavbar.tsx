import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/context/FlowProvider";
import { Menu, X, Wallet } from "lucide-react";

const DashboardNavbar: React.FC<{ address?: string }> = ({ address }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connectWallet, disconnectWallet } = useFlow();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-white font-bold text-xl">CodeStake</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {address ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white text-sm font-medium">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <div className="text-white/60 text-xs">Flow Wallet</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="gradient">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Flow Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <a 
                href="#features" 
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              
              {/* Mobile Wallet Connection */}
              <div className="pt-4 border-t border-white/10">
                {address ? (
                  <div className="space-y-3">
                    <div className="text-white text-sm">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        disconnectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="border-white/20 text-white hover:bg-white/10 w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      connectWallet();
                      setIsMenuOpen(false);
                    }} 
                    variant="gradient"
                    className="w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Flow Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNavbar;
