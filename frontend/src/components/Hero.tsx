import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock, Lock } from 'lucide-react';
import heroCapsule from '@/assets/hero-capsule.jpg';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroCapsule}
          alt="Futuristic time capsule"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-background/50" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-secondary rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto glass-card p-8 md:p-12 border border-white/10 bg-background/20 backdrop-blur-sm">
          {/* App Logo */}
          <div className="mb-8">
            <img 
              src="/logo_main.png" 
              alt="PastPort - Digital Time Capsules" 
              className="h-16 md:h-20 mx-auto object-contain"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl app-name-bold mb-6 leading-tight">
            Store your{' '}
            <span className="text-gradient-glow animate-gradient">memories</span>
            <br />
            Unlock your{' '}
            <span className="text-gradient animate-gradient">future</span>
          </h1>

          {/* Subtitle */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl tagline text-gradient animate-gradient mb-2">
              nostalgia, reimagined
            </p>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Create digital time capsules with your most precious moments. 
              Set unlock dates, add riddles, and rediscover your past when the time is right.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 glow-hover">
              <Clock className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Time-Locked</h3>
              <p className="text-muted-foreground text-sm">
                Set future unlock dates for your memories
              </p>
            </div>
            <div className="glass-card p-6 glow-hover">
              <Sparkles className="w-8 h-8 text-accent mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Interactive</h3>
              <p className="text-muted-foreground text-sm">
                Add riddles and challenges to unlock
              </p>
            </div>
            <div className="glass-card p-6 glow-hover">
              <Lock className="w-8 h-8 text-secondary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-muted-foreground text-sm">
                Your memories are private and encrypted
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard">
              <Button size="lg" className="btn-glow text-lg px-8 py-4">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="ghost" className="btn-glass text-lg px-8 py-4">
                How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">1000+</div>
              <div className="text-sm text-muted-foreground">Capsules Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">500+</div>
              <div className="text-sm text-muted-foreground">Students Using</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">250+</div>
              <div className="text-sm text-muted-foreground">Memories Unlocked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;