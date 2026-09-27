import { Home } from "lucide-react";

export function LogoIcon() {
  return <Home className="h-5 w-5 text-primary" />;
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon />
      <span className="font-bold tracking-tight">Perfect Property</span>
    </div>
  );
}
