import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AuthForm = () => {
  const { login, register, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Real-time validation
  useEffect(() => {
    const errors = { name: '', email: '', password: '', confirmPassword: '' };
    
    // Name validation
    if (registerData.name && registerData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (registerData.email && !emailRegex.test(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    const password = registerData.password;
    const strength = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordStrength(strength);
    
    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (password && password.length >= 6) {
      // Clear password error if it meets minimum requirements
      errors.password = '';
    }
    
    // Confirm password validation
    if (registerData.confirmPassword && registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
  }, [registerData]);

  const isFormValid = () => {
    return registerData.name && 
           registerData.email && 
           registerData.password && 
           registerData.confirmPassword &&
           !Object.values(validationErrors).some(error => error !== '') &&
           passwordStrength.length; // Only require minimum length, not all requirements
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password to login.",
        variant: "destructive"
      });
      return;
    }

    const result = await login(loginData);
    if (result.success) {
      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged in to PastPort.",
      });
    } else {
      // Provide user-friendly error messages
      let errorMessage = result.message || "Please check your credentials.";
      
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        errorMessage = "The email or password you entered is incorrect. Please try again.";
      } else if (errorMessage.toLowerCase().includes('deactivated')) {
        errorMessage = "Your account has been deactivated. Please contact support.";
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Unable to Login",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isFormValid()) {
      // Provide specific error based on validation
      let errorDesc = "Please complete all fields correctly.";
      
      if (!registerData.name) {
        errorDesc = "Please enter your full name.";
      } else if (!registerData.email) {
        errorDesc = "Please enter your email address.";
      } else if (validationErrors.email) {
        errorDesc = "Please enter a valid email address.";
      } else if (!registerData.password) {
        errorDesc = "Please create a password.";
      } else if (validationErrors.password) {
        errorDesc = "Password must be at least 6 characters long.";
      } else if (!registerData.confirmPassword) {
        errorDesc = "Please confirm your password.";
      } else if (validationErrors.confirmPassword) {
        errorDesc = "Passwords don't match. Please check and try again.";
      }
      
      toast({
        title: "Unable to Register",
        description: errorDesc,
        variant: "destructive"
      });
      return;
    }

    const result = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword
    });

    if (result.success) {
      toast({
        title: "Welcome to PastPort! 🌟",
        description: "Your account has been created successfully. Start creating your first time capsule!",
      });
    } else {
      // Provide user-friendly error messages
      let errorMessage = result.message || "Please try again.";
      
      if (errorMessage.toLowerCase().includes('already exists')) {
        errorMessage = "An account with this email already exists. Please login or use a different email.";
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <img 
              src="/logo_main.png" 
              alt="PastPort Logo" 
              className="w-12 h-12 mx-auto mb-2 object-contain"
              style={{ background: 'transparent' }}
            />
          </div>
          <CardTitle className="text-2xl app-name-bold text-gradient">
            Welcome to PastPort
          </CardTitle>
          <p className="text-muted-foreground">
            <span className="text-gradient tagline">nostalgia, reimagined</span>
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/20 border border-white/10">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 glass-card border-white/10 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 glass-card border-white/10 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-glow transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className={`pl-10 pr-10 glass-card border-white/10 transition-all duration-200 ${
                        validationErrors.name 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : registerData.name && !validationErrors.name 
                            ? 'border-green-500/50 focus:border-green-500' 
                            : 'focus:border-blue-500'
                      }`}
                      required
                    />
                    {registerData.name && (
                      <div className="absolute right-3 top-3">
                        {validationErrors.name ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {validationErrors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className={`pl-10 pr-10 glass-card border-white/10 transition-all duration-200 ${
                        validationErrors.email 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : registerData.email && !validationErrors.email 
                            ? 'border-green-500/50 focus:border-green-500' 
                            : 'focus:border-blue-500'
                      }`}
                      required
                    />
                    {registerData.email && (
                      <div className="absolute right-3 top-3">
                        {validationErrors.email ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className={`pl-10 pr-10 glass-card border-white/10 transition-all duration-200 ${
                        validationErrors.password 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : registerData.password && !validationErrors.password 
                            ? 'border-green-500/50 focus:border-green-500' 
                            : 'focus:border-blue-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {registerData.password && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Password strength:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordStrength.length ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          At least 6 characters
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordStrength.lowercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordStrength.number ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Number
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {validationErrors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`pl-10 pr-10 glass-card border-white/10 transition-all duration-200 ${
                        validationErrors.confirmPassword 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : registerData.confirmPassword && !validationErrors.confirmPassword 
                            ? 'border-green-500/50 focus:border-green-500' 
                            : 'focus:border-blue-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {registerData.confirmPassword && (
                      <div className="absolute right-10 top-3">
                        {validationErrors.confirmPassword ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className={`w-full transition-all duration-200 ${
                    isFormValid() 
                      ? 'btn-glow bg-primary hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : isFormValid() ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    'Complete all fields to continue'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
