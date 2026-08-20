import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, KeyRound, Loader2, Palette, Shield, User as UserIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import EditProfileModal from "@/components/EditProfileModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  changePasswordApi,
  deactivateAccountApi,
  updateNotificationPrefsApi,
  updatePrivacyApi,
  updateMyProfileApi,
} from "@/lib/api";
import { clearSession, getAccount, getToken, setSession } from "@/lib/session";

const roleLabels: Record<string, string> = { user: "User", investor: "Investor", founder: "Founder" };

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const token = useMemo(() => getToken(), []);
  const [account, setAccount] = useState(getAccount());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isProfilePublic, setIsProfilePublic] = useState(account?.isProfilePublic !== false);
  const [notifProduct, setNotifProduct] = useState(account?.notificationPrefs?.productUpdates !== false);
  const [notifCommunity, setNotifCommunity] = useState(account?.notificationPrefs?.communityActivity !== false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  const [primaryColor, setPrimaryColor] = useState(account?.cardColors?.primary || "#7C3AED");
  const [secondaryColor, setSecondaryColor] = useState(account?.cardColors?.secondary || "#6366f1");
  const [savingColors, setSavingColors] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    if (!token || !account) {
      navigate("/login", { replace: true });
    }
  }, [token, account, navigate]);

  if (!token || !account) {
    return null;
  }

  const handleTogglePrivacy = async (next: boolean) => {
    setIsProfilePublic(next);
    setSavingPrivacy(true);
    try {
      const res = await updatePrivacyApi(token, next);
      setAccount(res.account);
      setSession(token, res.account);
      toast({ title: next ? "Profile is now public" : "Profile is now private", description: next ? "Your QR code and profile link will work again." : "Your QR code and profile link will show 'not found' to others." });
    } catch (error) {
      setIsProfilePublic(!next);
      toast({ variant: "destructive", title: "Couldn't update privacy", description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotif(true);
    try {
      const res = await updateNotificationPrefsApi(token, { productUpdates: notifProduct, communityActivity: notifCommunity });
      setAccount(res.account);
      setSession(token, res.account);
      toast({ title: "Notification preferences saved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't save preferences", description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setSavingNotif(false);
    }
  };

  const handleSaveColors = async () => {
    setSavingColors(true);
    try {
      const res = await updateMyProfileApi(token, { cardColors: { primary: primaryColor, secondary: secondaryColor } });
      setAccount(res.account);
      setSession(token, res.account);
      toast({ title: "Card colors updated", description: "Your ID card and profile QR card now use these colors." });
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't save colors", description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setSavingColors(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Weak password", description: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match" });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi(token, { currentPassword, newPassword });
      toast({ title: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't update password", description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivateAccountApi(token);
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't deactivate account", description: error instanceof Error ? error.message : "Something went wrong." });
      setIsDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isMobile={isMobile} mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} onProfileClick={() => setIsEditModalOpen(true)} />

      <div className="lg:ml-64">
        <Topbar
          userRole={roleLabels[account.role] || account.role}
          userName={account.fullName}
          referralCode={account.referralCode || "N/A"}
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onProfileClick={() => setIsEditModalOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700">Settings</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Account Settings</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your profile, security, notifications, and privacy.</p>

          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="profile"><UserIcon className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
              <TabsTrigger value="security"><KeyRound className="w-4 h-4 mr-1.5" /> Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy"><Shield className="w-4 h-4 mr-1.5" /> Privacy</TabsTrigger>
              <TabsTrigger value="danger" className="text-red-600"><AlertTriangle className="w-4 h-4 mr-1.5" /> Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                  <CardDescription>Your headline and photo are shown on your profile card.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit Headline & Photo</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Card Colors</CardTitle>
                  <CardDescription>Customize the gradient colors on your ID/profile card.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="space-y-1">
                      <Label className="text-xs">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-9 rounded border cursor-pointer" />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 w-9 rounded border cursor-pointer" />
                        <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 text-xs" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveColors} disabled={savingColors} className="bg-violet-600 hover:bg-violet-700">
                    {savingColors ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Colors
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>You'll need your current password to set a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                    <div className="space-y-1">
                      <Label>Current Password</Label>
                      <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label>New Password</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                    </div>
                    <div className="space-y-1">
                      <Label>Confirm New Password</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                    </div>
                    <Button type="submit" disabled={isChangingPassword} className="bg-violet-600 hover:bg-violet-700">
                      {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what Founders Connect can email you about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Product Updates</p>
                      <p className="text-xs text-slate-500">New features, events, and platform announcements.</p>
                    </div>
                    <Switch checked={notifProduct} onCheckedChange={setNotifProduct} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Community Activity</p>
                      <p className="text-xs text-slate-500">Likes, comments, and messages from other members.</p>
                    </div>
                    <Switch checked={notifCommunity} onCheckedChange={setNotifCommunity} />
                  </div>
                  <Button onClick={handleSaveNotifications} disabled={savingNotif} className="bg-violet-600 hover:bg-violet-700">
                    {savingNotif ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Public Profile Visibility</CardTitle>
                  <CardDescription>Controls whether your QR code and profile link work for others.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Make my profile public</p>
                      <p className="text-xs text-slate-500">
                        {isProfilePublic
                          ? "Anyone who scans your QR code or opens your profile link can view your card."
                          : "Your QR code and profile link currently show 'not found' to everyone."}
                      </p>
                    </div>
                    <Switch checked={isProfilePublic} onCheckedChange={handleTogglePrivacy} disabled={savingPrivacy} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="pt-4">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Deactivate Account</CardTitle>
                  <CardDescription>
                    This disables your login and hides your profile. Contact the Founders Connect team to reactivate.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={() => setShowDeactivateConfirm(true)}>
                    Deactivate My Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => window.location.reload()}
        initialData={{ headline: account.headline, profilePhoto: account.profilePhoto }}
      />

      <Dialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate your account?</DialogTitle>
            <DialogDescription>
              You'll be logged out immediately and won't be able to sign back in until an admin reactivates your account. This does not delete your data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeactivateConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
              {isDeactivating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Yes, deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
