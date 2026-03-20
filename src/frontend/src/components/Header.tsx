import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          data-ocid="header.notifications.button"
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button
          type="button"
          data-ocid="header.user.button"
          className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-md transition-colors"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              SJ
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            Sarah Jenkins
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
