import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConstellationRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main constellation page
    navigate('/memories/constellation', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to constellation...</p>
      </div>
    </div>
  );
};

export default ConstellationRedirect;
