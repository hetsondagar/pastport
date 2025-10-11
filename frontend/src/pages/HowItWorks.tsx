import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { 
  Clock, 
  Lock, 
  Upload, 
  Calendar, 
  Brain, 
  Gift, 
  Star, 
  BookOpen, 
  Bell, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Send,
  Eye,
  Heart,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Your Digital Time Capsule Journey</span>
            </div>
            <h1 className="text-5xl md:text-7xl app-name-bold mb-6">
              How <span className="text-gradient">PastPort</span> Works
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              <span className="text-gradient tagline">nostalgia, reimagined</span>
            </p>
          </motion.div>
        </section>

        {/* Main Steps */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">Step 1</div>
              <h3 className="text-xl font-semibold mb-3">Create Your Capsule</h3>
              <p className="text-muted-foreground">
                Upload photos, videos, voice notes, or write a heartfelt message. Add all your precious memories in one place.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">Step 2</div>
              <h3 className="text-xl font-semibold mb-3">Choose Unlock Date</h3>
              <p className="text-muted-foreground">
                Pick a future date - your birthday, graduation, anniversary, or any special moment you want to remember.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">Step 3</div>
              <h3 className="text-xl font-semibold mb-3">Add a Riddle</h3>
              <p className="text-muted-foreground">
                Make it fun! Add an optional riddle or question that you'll need to solve to unlock your memories.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">Step 4</div>
              <h3 className="text-xl font-semibold mb-3">Unlock & Relive</h3>
              <p className="text-muted-foreground">
                When the time comes, receive a notification, solve your riddle, and rediscover your past!
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Deep Dive */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl app-name-bold mb-4">
              Features You'll <span className="text-gradient">Love</span>
            </h2>
            <p className="text-xl text-muted-foreground">Everything you need to preserve and relive your memories</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Time-Locked Capsules */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Time-Locked Security</h3>
              <p className="text-muted-foreground mb-4">
                Your capsules remain securely locked until the unlock date arrives. No peeking, no cheating - just pure anticipation!
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Automatically locks until unlock date</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Get notified when it's time to unlock</span>
              </div>
            </motion.div>

            {/* Daily Journal */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover">
              <BookOpen className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Daily Journal</h3>
              <p className="text-muted-foreground mb-4">
                Capture your daily thoughts, feelings, and experiences. Build a habit of reflection with inspiring quotes and streak tracking.
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Daily inspirational quotes</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Track your journaling streak</span>
              </div>
            </motion.div>

            {/* Memory Constellation */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star className="w-12 h-12 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">Memory Constellation 🌌</h3>
                  <p className="text-muted-foreground mb-4">
                    Visualize your journal entries as a stunning 3D constellation of stars! Each star represents a day's entry, 
                    with colors reflecting your mood and brightness showing its importance. Float through space and explore your memories 
                    in a whole new way.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ultra-smooth controls</strong> - Effortless navigation with buttery-smooth camera</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Mood-based colors</strong> - Each star glows with your emotion's color</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Interactive 3D space</strong> - Click stars to read your entries</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Galaxy layout</strong> - Beautiful spiral distribution pattern</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Auto-rotate mode</strong> - Sit back and watch your memories orbit</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Monthly reset</strong> - Fresh constellation each month</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Pro Tip:</strong> Use drag to rotate, scroll to zoom, and right-click to pan. 
                      Each mood has its own color: Happy (Green), Sad (Blue), Excited (Orange), Calm (Purple), 
                      Anxious (Red), Grateful (Deep Orange), Neutral (Gray). The constellation resets monthly, 
                      so each month is a new sky full of memories!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interactive Riddles */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover">
              <Brain className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Interactive Riddles</h3>
              <p className="text-muted-foreground mb-4">
                Add an extra layer of fun! Create riddles, questions, or challenges that future-you will need to solve to access your memories.
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Customizable difficulty levels</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Hint system for tough riddles</span>
              </div>
            </motion.div>

            {/* Rich Media Support */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover">
              <Upload className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Rich Media Support</h3>
              <p className="text-muted-foreground mb-4">
                Upload and store all types of memories - photos, videos, audio recordings, and text. Your memories deserve to be preserved in full color!
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Photos, videos, and audio support</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Cloud storage with secure backup</span>
              </div>
            </motion.div>

            {/* Smart Notifications */}
            <motion.div variants={itemVariants} className="glass-card p-8 glow-hover">
              <Bell className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Smart Notifications</h3>
              <p className="text-muted-foreground mb-4">
                Never miss a moment! Get notified when your capsules are ready to unlock, or when it's time for your daily journal entry.
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Customizable notification preferences</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Email and in-app notifications</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Constellation Deep Dive */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">Explore in 3D</span>
            </div>
            <h2 className="text-4xl md:text-5xl app-name-bold mb-4">
              Your Memories as a <span className="text-gradient">Living Constellation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience your journal entries like never before - as a breathtaking 3D universe of glowing stars
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* How Constellation Works */}
            <motion.div variants={itemVariants} className="glass-card-enhanced p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-10 h-10 text-secondary" />
                    <h3 className="text-3xl font-semibold">How It Works</h3>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    Each journal entry you write becomes a glowing star in your personal galaxy. 
                    The constellation resets every month, creating a unique sky for each month of the year.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Write Journal Entry</h4>
                        <p className="text-sm text-muted-foreground">Record your day, choose your mood, and save</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-accent font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Star Appears</h4>
                        <p className="text-sm text-muted-foreground">A new star materializes in your constellation with your mood's color</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-secondary font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Explore & Reflect</h4>
                        <p className="text-sm text-muted-foreground">Navigate through 3D space, click stars to revisit memories</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Mood Color System
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#10B981'}}></div>
                        <span className="font-medium">Happy</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Vibrant Green</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#3B82F6'}}></div>
                        <span className="font-medium">Sad</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Soft Blue</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#F59E0B'}}></div>
                        <span className="font-medium">Excited</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Bright Orange</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#8B5CF6'}}></div>
                        <span className="font-medium">Calm</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Peaceful Purple</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#EF4444'}}></div>
                        <span className="font-medium">Anxious</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Alert Red</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#F97316'}}></div>
                        <span className="font-medium">Grateful</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Warm Amber</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{background: '#6B7280'}}></div>
                        <span className="font-medium">Neutral</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Balanced Gray</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Controls Guide */}
            <motion.div variants={itemVariants} className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Zap className="w-8 h-8 text-primary" />
                Ultra-Smooth Navigation Controls
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🖱️</span>
                  </div>
                  <h4 className="font-semibold mb-2">Mouse Controls</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Drag</strong> - Rotate view</li>
                    <li>• <strong>Scroll</strong> - Zoom in/out</li>
                    <li>• <strong>Right-click</strong> - Pan camera</li>
                    <li>• <strong>Click star</strong> - Read entry</li>
                  </ul>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-semibold mb-2">Touch Controls</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>1 Finger</strong> - Smooth rotate</li>
                    <li>• <strong>2 Fingers</strong> - Zoom & pan</li>
                    <li>• <strong>Tap star</strong> - Open entry</li>
                    <li>• <strong>Pinch</strong> - Zoom control</li>
                  </ul>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-semibold mb-2">Smart Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Auto-rotate</strong> - Cinematic view</li>
                    <li>• <strong>Focus mode</strong> - Zoom to star</li>
                    <li>• <strong>Reset view</strong> - Return home</li>
                    <li>• <strong>Smooth inertia</strong> - Effortless glide</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Technical Features */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-8 h-8 text-cyan-500" />
                  <h4 className="text-xl font-semibold">Visual Experience</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Multi-layer glow effects</strong> - Realistic star luminescence with rings and halos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Pulsing animations</strong> - Gentle breathing effect for living stars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Particle systems</strong> - Sparkles and cosmic dust around each star</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Background starfield</strong> - 8,000 ambient stars for depth</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-8 h-8 text-yellow-500" />
                  <h4 className="text-xl font-semibold">Performance</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>60 FPS smooth</strong> - Buttery navigation with advanced damping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>WebGL accelerated</strong> - GPU-powered 3D rendering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Mobile optimized</strong> - Works perfectly on phones and tablets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Error recovery</strong> - Graceful handling of all edge cases</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Use Cases */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl app-name-bold mb-4">
              Perfect For <span className="text-gradient">Every Occasion</span>
            </h2>
            <p className="text-xl text-muted-foreground">Here's how people are using PastPort</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Birthdays</h4>
              <p className="text-sm text-muted-foreground">
                Create a capsule on your birthday to open next year. See how much you've grown!
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Achievements</h4>
              <p className="text-sm text-muted-foreground">
                Capture your wins and milestones. Relive your success stories years later.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Gift className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Graduation</h4>
              <p className="text-sm text-muted-foreground">
                Store memories from school to open at your 10-year reunion!
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Send className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Future Self</h4>
              <p className="text-sm text-muted-foreground">
                Write letters to your future self with advice, dreams, and reflections.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Eye className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">New Year</h4>
              <p className="text-sm text-muted-foreground">
                Set goals and resolutions, then open them next year to check your progress!
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <Globe className="w-10 h-10 text-cyan-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Travel Memories</h4>
              <p className="text-sm text-muted-foreground">
                Store vacation memories and open them on the anniversary of your trip.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Security Section */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center max-w-4xl mx-auto"
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl app-name-bold mb-4">
              Your Memories Are <span className="text-gradient">Safe & Secure</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We take your privacy seriously. All your data is encrypted and stored securely in the cloud.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col items-center">
                <Lock className="w-8 h-8 text-green-500 mb-2" />
                <div className="font-semibold">End-to-End Encryption</div>
                <div className="text-muted-foreground">Your data is always encrypted</div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-blue-500 mb-2" />
                <div className="font-semibold">Private by Default</div>
                <div className="text-muted-foreground">Only you can access your capsules</div>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mb-2" />
                <div className="font-semibold">Reliable Backups</div>
                <div className="text-muted-foreground">Never lose your precious memories</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center max-w-3xl mx-auto relative overflow-hidden"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float" />
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-secondary rounded-full animate-float" style={{ animationDelay: '4s' }} />
            </div>

            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl app-name-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Create your first time capsule today and start building your digital memory collection
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="btn-glow text-lg px-8 py-4">
                    Create Your First Capsule
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="ghost" className="btn-glass text-lg px-8 py-4">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;

