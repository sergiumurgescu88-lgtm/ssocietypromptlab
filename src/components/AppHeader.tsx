import { useAppStore } from "@/stores/app-store";
import { Bell, Crown, Moon, Sun, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  const { user, theme, toggleTheme } = useAppStore();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{user?.credits ?? 0}</span>
          <span className="text-muted-foreground">credits</span>
        </div>

        <Button variant="gradient" size="sm" className="hidden sm:flex gap-1.5 text-xs">
          <Crown className="w-3.5 h-3.5" />
          Upgrade
        </Button>

        <Button variant="ghost" size="icon" className="relative" onClick={() => {}}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {user?.name?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
