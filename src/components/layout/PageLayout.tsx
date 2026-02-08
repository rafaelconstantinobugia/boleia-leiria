import { BottomNav } from './BottomNav';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
}

export function PageLayout({ children, title, showNav = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>
      )}
      <main className={cn("container px-4 py-4", showNav && "pb-20")}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
