import { Bot } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center">
          <a href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Bot className="h-6 w-6 text-primary" />
            <span>PRZ Assistant</span>
          </a>
        </div>
      </div>
    </header>
  );
}
