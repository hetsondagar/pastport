import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Crafted with time-traveling pixels by <span className="font-semibold text-white">Het Sondagar</span> — because memories deserve a glow-up ✨
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <a
            href="https://github.com/hetsondagar"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            aria-label="Het Sondagar on GitHub"
          >
            <Github className="w-4 h-4" />
            <span>@hetsondagar</span>
          </a>
          <span className="text-muted-foreground/50">•</span>
          <a
            href="https://www.linkedin.com/in/het-sondagar-433095284/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            aria-label="Het Sondagar on LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Developed by <span className="font-semibold text-white">Het Sondagar</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;


