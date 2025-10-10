import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="mb-8">
        <img
          src="/logo_main.png"
          alt="PastPort Logo"
          className="w-16 h-16 mx-auto mb-4 object-contain"
          style={{ background: 'transparent' }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik0zMiAxMkM0MC44MzY2IDEyIDQ4IDE5LjE2MzQgNDggMjhDNDggMzYuODM2NiA0MC44MzY2IDQ0IDMyIDQ0QzIzLjE2MzQgNDQgMTYgMzYuODM2NiAxNiAyOEMxNiAxOS4xNjM0IDIzLjE2MzQgMTIgMzIgMTJaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwX2xpbmVhcl8xXzEiIHgxPSIwIiB5MT0iMCIgeDI9IjY0IiB5Mj0iNjQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2NjdFQUIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOEI1Q0ZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';
          }}
        />
          <h1 className="text-6xl app-name-bold text-gradient mb-4">404</h1>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for seems to have vanished into the future. 
          Don't worry, it might unlock later!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="btn-glow">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="btn-glass"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
