import { Button } from "@/components/ui/button";

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export const Header = ({ onNavigate }: HeaderProps) => {
  const handleNavClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/bakugan_icon.avif" alt="Bakugan Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-foreground font-medium text-lg">Bakugan AI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button  
            onClick={() => handleNavClick('generate')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Generate
          </button>
          <button 
            onClick={() => handleNavClick('gallery')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Gallery
          </button>
        </nav>
      </div>

      <Button 
        variant="outline" 
        className="bg-transparent border-border text-foreground hover:bg-muted"
        onClick={() => handleNavClick('generate')}
      >
        Upload Image
      </Button>
    </header>
  );
};

