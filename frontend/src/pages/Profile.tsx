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
  Settings, 
  Camera, 
  Save, 
  Loader2,
  Edit3,
  Shield,
  Bell,
  Palette,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, updatePreferences, changePassword } = useAuth();
  const { toast } = useToast();
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: ''
  });

  // Preferences data
  const [preferences, setPreferences] = useState({
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      unlockReminders: true
    },
    privacy: {
      profileVisibility: 'friends',
      showBadges: true
    }
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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setPreferences(user.preferences || {
        theme: 'auto',
        notifications: { email: true, push: true, unlockReminders: true },
        privacy: { profileVisibility: 'friends', showBadges: true }
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
    
    if (validationErrors.name || validationErrors.bio) {
      toast({
        title: "Please fix the errors",
        description: "Complete all fields correctly to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast({
          title: "Profile Updated! ✨",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await updatePreferences(preferences);
      if (result.success) {
        toast({
          title: "Preferences Updated! 🎨",
          description: "Your preferences have been saved.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your preferences.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationErrors.newPassword || validationErrors.confirmPassword) {
      toast({
        title: "Please fix the errors",
        description: "Complete all fields correctly to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        toast({
          title: "Password Changed! 🔒",
          description: "Your password has been updated successfully.",
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({
          title: "Password Change Failed",
          description: result.message || "Please check your current password.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "An error occurred while changing your password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
            <TabsList className="grid w-full grid-cols-3 glass-card border-white/10 mb-6">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-white transition-all duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Preferences
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="btn-glass hover:bg-white/10"
                        onClick={() => {/* TODO: Implement avatar upload */}}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max size 2MB.
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="btn-glow"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="btn-glow transition-all duration-200"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="btn-glass hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
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

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="glass-card-enhanced border-white/10 bg-background/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </h3>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full px-3 py-2 glass-card border-white/10 rounded-md bg-background/50"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Unlock Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded when capsules unlock</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.unlockReminders}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, unlockReminders: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <select
                        value={preferences.privacy.profileVisibility}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisibility: e.target.value }
                        }))}
                        className="w-full px-3 py-2 glass-card border-white/10 rounded-md bg-background/50"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Badges</Label>
                        <p className="text-sm text-muted-foreground">Display your badges on your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.showBadges}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showBadges: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePreferencesUpdate}
                  disabled={isLoading}
                  className="btn-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
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
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || Object.values(validationErrors).some(error => error !== '')}
                    className="btn-glow"
                  >
                    {isLoading ? (
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
