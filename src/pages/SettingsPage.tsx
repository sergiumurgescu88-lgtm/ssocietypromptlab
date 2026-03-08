import { UserProfile } from "@/components/UserProfile";
import { ApiKeysManager } from "@/components/ApiKeysManager";

const SettingsPage = () => (
  <div className="space-y-6 animate-fade-in max-w-2xl">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground text-sm">Manage your profile and API keys</p>
    </div>
    <UserProfile />
    <ApiKeysManager />
  </div>
);

export default SettingsPage;
