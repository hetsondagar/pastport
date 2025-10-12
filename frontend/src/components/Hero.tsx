import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock, Lock } from 'lucide-react';
import heroCapsule from '@/assets/hero-capsule.jpg';

const Hero = () => {
  return (
    <section className="relative">
      <div className="space-y-8">
        {/* App Logo */}
        <div className="mb-6">
          <img
            src="/logo_main.png"
            alt="PastPort - Digital Time Capsules"
            className="h-14 md:h-16 mx-auto object-contain"
            style={{ background: 'transparent' }}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik00MCAxNkM0OC44MzY2IDE2IDU2IDIzLjE2MzQgNTYgMzJDNjYgNDAuODM2NiA0OC44MzY2IDQ4IDQwIDQ4QzMxLjE2MzQgNDggMjQgNDAuODM2NiAyNCAzMkMyNCAyMy4xNjM0IDMxLjE2MzQgMTYgNDAgMTZaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwX2xpbmVhcl8xXzEiIHgxPSIwIiB5MT0iMCIgeDI9IjgwIiB5Mj0iODAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2NjdFQUIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOEI1Q0ZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';
            }}
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-5xl app-name-bold mb-4 leading-tight text-center">
          Store your{' '}
          <span className="text-gradient-glow animate-gradient">memories</span>
          <br />
          Unlock your{' '}
          <span className="text-gradient animate-gradient">future</span>
        </h1>

        {/* Subtitle */}
        <div className="mb-6 text-center">
          <p className="text-xl md:text-2xl tagline text-gradient animate-gradient mb-2">
            nostalgia, reimagined
          </p>
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto">
            Create digital time capsules with your most precious moments. 
            Set unlock dates, add riddles, and rediscover your past when the time is right.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 glow-hover text-center">
            <Clock className="w-6 h-6 text-primary mb-2 mx-auto" />
            <h3 className="text-sm font-semibold mb-1">Time-Locked</h3>
            <p className="text-muted-foreground text-xs">
              Set future unlock dates
            </p>
          </div>
          <div className="glass-card p-4 glow-hover text-center">
            <Sparkles className="w-6 h-6 text-accent mb-2 mx-auto" />
            <h3 className="text-sm font-semibold mb-1">Interactive</h3>
            <p className="text-muted-foreground text-xs">
              Add riddles & challenges
            </p>
          </div>
          <div className="glass-card p-4 glow-hover text-center">
            <Lock className="w-6 h-6 text-secondary mb-2 mx-auto" />
            <h3 className="text-sm font-semibold mb-1">Secure</h3>
            <p className="text-muted-foreground text-xs">
              Private & encrypted
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <Link to="/how-it-works">
            <Button size="lg" variant="ghost" className="btn-glass px-6 py-3">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-xl font-bold text-gradient">1000+</div>
            <div className="text-xs text-muted-foreground">Capsules</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gradient">500+</div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gradient">250+</div>
            <div className="text-xs text-muted-foreground">Unlocked</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;