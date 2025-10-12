import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, HelpCircle, Laugh, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyInsight, getRandomInsight, DailyInsight as InsightType } from '@/data/dailyInsights';

const DailyInsight = () => {
  const [insight, setInsight] = useState<InsightType>(getDailyInsight());
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const refreshInsight = () => {
    setIsAnimating(true);
    setShowAnswer(false);
    setTimeout(() => {
      setInsight(getRandomInsight());
      setIsAnimating(false);
    }, 300);
  };

  const getIcon = () => {
    switch (insight.type) {
      case 'quote':
        return <Sparkles className="w-6 h-6" />;
      case 'fact':
        return <Lightbulb className="w-6 h-6" />;
      case 'riddle':
        return <HelpCircle className="w-6 h-6" />;
      case 'joke':
        return <Laugh className="w-6 h-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (insight.type) {
      case 'quote':
        return 'Quote of the Day';
      case 'fact':
        return 'Fun Fact';
      case 'riddle':
        return 'Daily Riddle';
      case 'joke':
        return 'Daily Chuckle';
    }
  };

  const getTypeColor = () => {
    switch (insight.type) {
      case 'quote':
        return 'from-purple-500 to-pink-500';
      case 'fact':
        return 'from-blue-500 to-cyan-500';
      case 'riddle':
        return 'from-orange-500 to-yellow-500';
      case 'joke':
        return 'from-green-500 to-emerald-500';
    }
  };

  const getBadgeColor = () => {
    switch (insight.type) {
      case 'quote':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'fact':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'riddle':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'joke':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  return (
    <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${getTypeColor()} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                {getIcon()}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{getTypeLabel()}</h3>
                <p className="text-white/80 text-xs">Daily dose of inspiration</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshInsight}
              className="text-white hover:bg-white/20 transition-all"
              title="Get another insight"
            >
              <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={insight.content}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Content */}
              <div className="mb-4">
                {insight.type === 'quote' && (
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-6xl text-primary/20 font-serif">"</div>
                    <p className="text-white text-lg italic leading-relaxed pl-6 pr-6">
                      {insight.content}
                    </p>
                    <div className="absolute -bottom-2 -right-2 text-6xl text-primary/20 font-serif">"</div>
                  </div>
                )}
                
                {insight.type === 'fact' && (
                  <p className="text-white text-base leading-relaxed">
                    💡 {insight.content}
                  </p>
                )}
                
                {insight.type === 'riddle' && (
                  <div>
                    <p className="text-white text-base leading-relaxed mb-3">
                      🤔 {insight.content}
                    </p>
                    {!showAnswer ? (
                      <Button
                        onClick={() => setShowAnswer(true)}
                        size="sm"
                        className="btn-glow"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Show Answer
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-3 border-l-4 border-orange-500"
                      >
                        <p className="text-orange-300 font-medium">
                          ✨ Answer: {insight.answer}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
                
                {insight.type === 'joke' && (
                  <p className="text-white text-base leading-relaxed">
                    😄 {insight.content}
                  </p>
                )}
              </div>

              {/* Author/Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Badge variant="outline" className={`${getBadgeColor()} text-xs`}>
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                </Badge>
                
                {insight.author && (
                  <p className="text-muted-foreground text-sm">
                    — {insight.author}
                  </p>
                )}
                
                {!insight.author && insight.type !== 'riddle' && (
                  <p className="text-muted-foreground text-xs italic">
                    {insight.type === 'fact' ? 'Did you know?' : 'From PastPort'}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      </CardContent>
    </Card>
  );
};

export default DailyInsight;

