import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, Key, Bell, Moon, Sun, Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      encryptionNotifications: true,
      securityAlerts: true,
      messageNotifications: false
    },
    security: {
      autoLock: true,
      requireKeyOnStartup: true,
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    encryption: {
      defaultAlgorithm: "hybrid",
      keyLength: 256,
      compressionEnabled: true,
      metadataEncryption: true
    }
  });

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const exportKeys = () => {
    toast({
      title: "Keys Exported",
      description: "Your encryption keys have been exported securely."
    });
  };

  const importKeys = () => {
    toast({
      title: "Keys Imported",
      description: "Your encryption keys have been imported successfully."
    });
  };

  const clearAllData = () => {
    toast({
      title: "Data Cleared",
      description: "All application data has been cleared.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your secure communication experience</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">Configuration</span>
        </div>
      </div>

      {/* Appearance Settings */}
      <Card className="glass-card border-navy-light">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
          
          <Separator className="bg-navy-light" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground font-medium">Interface Scale</Label>
              <select className="mt-1 w-full p-2 glass-card border border-navy-light rounded-lg focus:border-primary focus:outline-none text-foreground">
                <option>Normal (100%)</option>
                <option>Large (125%)</option>
                <option>Extra Large (150%)</option>
              </select>
            </div>
            <div>
              <Label className="text-foreground font-medium">Language</Label>
              <select className="mt-1 w-full p-2 glass-card border border-navy-light rounded-lg focus:border-primary focus:outline-none text-foreground">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="glass-card border-navy-light">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Auto-lock Application</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically lock the app when inactive
                </p>
              </div>
              <Switch
                checked={settings.security.autoLock}
                onCheckedChange={(value) => updateSetting('security', 'autoLock', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Require Key on Startup</Label>
                <p className="text-sm text-muted-foreground">
                  Require encryption key verification when starting the app
                </p>
              </div>
              <Switch
                checked={settings.security.requireKeyOnStartup}
                onCheckedChange={(value) => updateSetting('security', 'requireKeyOnStartup', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(value) => updateSetting('security', 'twoFactorAuth', value)}
              />
            </div>
          </div>

          <Separator className="bg-navy-light" />

          <div>
            <Label className="text-foreground font-medium">Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="mt-1 w-32 glass-card border-navy-light focus:border-primary"
              min="5"
              max="120"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Automatically log out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Encryption Settings */}
      <Card className="glass-card border-navy-light">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>Encryption</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground font-medium">Default Algorithm</Label>
              <select 
                value={settings.encryption.defaultAlgorithm}
                onChange={(e) => updateSetting('encryption', 'defaultAlgorithm', e.target.value)}
                className="mt-1 w-full p-2 glass-card border border-navy-light rounded-lg focus:border-primary focus:outline-none text-foreground"
              >
                <option value="hybrid">Hybrid (Caesar + Vigenère + AES)</option>
                <option value="aes">AES Only</option>
                <option value="vigenere">Vigenère Only</option>
                <option value="caesar">Caesar Only</option>
              </select>
            </div>
            <div>
              <Label className="text-foreground font-medium">Key Length</Label>
              <select 
                value={settings.encryption.keyLength}
                onChange={(e) => updateSetting('encryption', 'keyLength', parseInt(e.target.value))}
                className="mt-1 w-full p-2 glass-card border border-navy-light rounded-lg focus:border-primary focus:outline-none text-foreground"
              >
                <option value="128">128-bit</option>
                <option value="192">192-bit</option>
                <option value="256">256-bit</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Compression</Label>
                <p className="text-sm text-muted-foreground">
                  Compress messages before encryption
                </p>
              </div>
              <Switch
                checked={settings.encryption.compressionEnabled}
                onCheckedChange={(value) => updateSetting('encryption', 'compressionEnabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Metadata Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt message metadata and timestamps
                </p>
              </div>
              <Switch
                checked={settings.encryption.metadataEncryption}
                onCheckedChange={(value) => updateSetting('encryption', 'metadataEncryption', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card border-navy-light">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important events
              </p>
            </div>
            <Switch
              checked={settings.notifications.emailAlerts}
              onCheckedChange={(value) => updateSetting('notifications', 'emailAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Encryption Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify when encryption/decryption is complete
              </p>
            </div>
            <Switch
              checked={settings.notifications.encryptionNotifications}
              onCheckedChange={(value) => updateSetting('notifications', 'encryptionNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Alert for security-related events and threats
              </p>
            </div>
            <Switch
              checked={settings.notifications.securityAlerts}
              onCheckedChange={(value) => updateSetting('notifications', 'securityAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Message Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify when new messages are received
              </p>
            </div>
            <Switch
              checked={settings.notifications.messageNotifications}
              onCheckedChange={(value) => updateSetting('notifications', 'messageNotifications', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="glass-card border-navy-light">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={exportKeys}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Keys
            </Button>
            <Button 
              onClick={importKeys}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Keys
            </Button>
          </div>

          <Separator className="bg-navy-light" />

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Danger Zone</span>
            </div>
            <p className="text-sm text-red-300 mb-4">
              The following actions cannot be undone. Please proceed with caution.
            </p>
            <Button 
              onClick={clearAllData}
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="border-navy-light text-foreground hover:bg-navy-light">
          Reset to Defaults
        </Button>
        <Button className="gradient-primary text-white hover-lift">
          Save Settings
        </Button>
      </div>
    </div>
  );
}