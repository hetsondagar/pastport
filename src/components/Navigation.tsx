import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, User, Settings, LogOut, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-primary animate-pulse-glow" />
            <span className="text-2xl font-bold text-gradient">PastPort</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/create" className="text-foreground hover:text-primary transition-colors">
              Create
            </Link>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Profile
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="btn-glass">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button className="btn-glow">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/create" className="text-foreground hover:text-primary transition-colors">
                Create
              </Link>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Profile
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="btn-glass justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button className="btn-glow">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;