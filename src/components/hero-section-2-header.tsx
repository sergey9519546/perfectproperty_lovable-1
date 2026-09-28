import React from 'react';
import { Link } from '@tanstack/react-router';
import { LogoIcon } from '@/components/logo';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Workspace', href: '/workspace' },
  { name: 'Sheriff Sales', href: '/sheriff-sales' },
  { name: 'Deals', href: '/deals' },
  { name: 'Pricing', href: '/pricing' },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header id="hero-section-2-header">
      <nav
        data-state={menuState ? 'active' : undefined}
        className={cn(
          'fixed z-20 w-full transition-all duration-300',
          isScrolled && 'bg-background/85 border-b border-border backdrop-blur-lg shadow-2xs'
        )}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div
            className={cn(
              'relative flex flex-wrap items-center justify-between gap-6 py-5 transition-all duration-200 lg:gap-0',
              isScrolled && 'py-3'
            )}
          >
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2 text-foreground font-bold tracking-tight"
              >
                <LogoIcon />
                <span className="text-base font-bold">Profit Property</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-foreground"
              >
                {menuState ? (
                  <X className="size-6 duration-200" />
                ) : (
                  <Menu className="size-6 duration-200" />
                )}
              </button>
              <div className="m-auto hidden size-fit lg:block">
                <ul className="flex gap-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                          {item.name}
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className={cn(
                'bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-4 rounded-3xl border border-border p-6 shadow-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
                menuState && 'block flex-col'
              )}
            >
              <div className="lg:hidden w-full">
                <ul className="space-y-4 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMenuState(false)}
                        className="text-muted-foreground hover:text-foreground block font-medium duration-150"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2.5 sm:space-y-0 md:w-fit">
                <Link to="/auth" onClick={() => setMenuState(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold w-full"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link to="/workspace" onClick={() => setMenuState(false)}>
                  <RainbowButton className="h-9 px-4 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Get Unlimited Access
                  </RainbowButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
