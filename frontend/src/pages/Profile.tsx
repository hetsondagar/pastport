import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Save, 
  Loader2,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: ''
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Real-time validation
  useEffect(() => {
    const errors = { name: '', bio: '', currentPassword: '', newPassword: '', confirmPassword: '' };
    
    // Name validation
    if (profileData.name && profileData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Bio validation
    if (profileData.bio && profileData.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }
    
    // Password validation
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    
    if (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
  }, [profileData, passwordData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Provide specific validation errors
    if (validationErrors.name) {
      toast({
        title: "Invalid Name",
        description: "Your name must be at least 2 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    if (validationErrors.bio) {
      toast({
        title: "Bio Too Long",
        description: "Your bio cannot exceed 500 characters. Please shorten it.",
        variant: "destructive"
      });
      return;
    }
    
    if (!profileData.name) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast({
          title: "Profile Updated Successfully! ✨",
          description: "Your profile information has been saved.",
        });
      } else {
        // Provide user-friendly error messages
        let errorMessage = result.message || "Please try again.";
        
        if (errorMessage.toLowerCase().includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (errorMessage.toLowerCase().includes('unauthorized')) {
          errorMessage = "Your session has expired. Please login again.";
        } else if (errorMessage.toLowerCase().includes('validation')) {
          errorMessage = "Please check your information and try again.";
        }
        
        toast({
          title: "Unable to Update Profile",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile Update Failed",
        description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Provide specific validation errors
    if (!passwordData.currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!passwordData.newPassword) {
      toast({
        title: "New Password Required",
        description: "Please enter a new password.",
        variant: "destructive"
      });
      return;
    }
    
    if (validationErrors.newPassword) {
      toast({
        title: "Invalid New Password",
        description: "Your new password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    if (!passwordData.confirmPassword) {
      toast({
        title: "Confirm Password Required",
        description: "Please confirm your new password.",
        variant: "destructive"
      });
      return;
    }
    
    if (validationErrors.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "The new password and confirmation password don't match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmPassword
    });
      
      if (result.success) {
        toast({
          title: "Password Changed Successfully! 🔒",
          description: "Your password has been updated. Please use your new password for future logins.",
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        // Provide user-friendly error messages
        let errorMessage = result.message || "Please check your current password.";
        
        if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('invalid')) {
          errorMessage = "Your current password is incorrect. Please try again.";
        } else if (errorMessage.toLowerCase().includes('same')) {
          errorMessage = "Your new password cannot be the same as your current password.";
        } else if (errorMessage.toLowerCase().includes('weak')) {
          errorMessage = "Please choose a stronger password with at least 6 characters.";
        } else if (errorMessage.toLowerCase().includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        toast({
          title: "Unable to Change Password",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Password Change Failed",
        description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getJoinedDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="btn-glass hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/dashboard'}
                className="btn-glass hover:bg-white/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card border-white/10 mb-6">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-2 border-white/20">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-blue-500">
                        {getInitials(profileData.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{profileData.name || 'User'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className={`glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400 transition-all duration-200 ${
                          validationErrors.name 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : profileData.name && !validationErrors.name 
                              ? 'border-green-500/50 focus:border-green-500' 
                              : 'focus:border-blue-500'
                        }`}
                      />
                      {profileData.name && (
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

                  {/* Bio Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className={`w-full min-h-[100px] px-3 py-2 glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400 rounded-md resize-none transition-all duration-200 ${
                          validationErrors.bio 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : 'focus:border-blue-500'
                        }`}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      {validationErrors.bio && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.bio}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground ml-auto">
                        {profileData.bio.length}/500
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="btn-glow transition-all duration-200"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

              {/* Stats Card */}
              <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="w-5 h-5" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card-enhanced p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user?.stats?.capsulesCreated || 0}</div>
                      <div className="text-sm text-muted-foreground">Capsules Created</div>
                    </div>
                    <div className="glass-card-enhanced p-4 text-center">
                      <div className="text-2xl font-bold text-accent">{user?.stats?.capsulesUnlocked || 0}</div>
                      <div className="text-sm text-muted-foreground">Capsules Unlocked</div>
                    </div>
                    <div className="glass-card-enhanced p-4 text-center">
                      <div className="text-2xl font-bold text-secondary">{user?.stats?.riddlesSolved || 0}</div>
                      <div className="text-sm text-muted-foreground">Riddles Solved</div>
                    </div>
                    <div className="glass-card-enhanced p-4 text-center">
                      <div className="text-2xl font-bold text-gradient">{user?.stats?.friendsCount || 0}</div>
                      <div className="text-sm text-muted-foreground">Friends</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Card */}
              {user?.badges && user.badges.length > 0 && (
                <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="w-5 h-5" />
                      Your Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {user.badges.map((badge: any, index: number) => (
                        <Badge key={index} variant="secondary" className="glass-card border-white/10">
                          <span className="mr-2">{badge.icon}</span>
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={`glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400 transition-all duration-200 ${
                          validationErrors.newPassword 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : passwordData.newPassword && !validationErrors.newPassword 
                              ? 'border-green-500/50 focus:border-green-500' 
                              : 'focus:border-blue-500'
                        }`}
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {passwordData.newPassword && (
                        <div className="absolute right-10 top-3">
                          {validationErrors.newPassword ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400 transition-all duration-200 ${
                          validationErrors.confirmPassword 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : passwordData.confirmPassword && !validationErrors.confirmPassword 
                              ? 'border-green-500/50 focus:border-green-500' 
                              : 'focus:border-blue-500'
                        }`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {passwordData.confirmPassword && (
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
                    disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || Object.values(validationErrors).some(error => error !== '')}
                    className="btn-glow"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

              {/* Account Info */}
              <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.stats?.joinedAt ? getJoinedDate(user.stats.joinedAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
