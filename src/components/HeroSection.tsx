import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Twitter } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
      
      <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
        <div className="relative flex justify-center items-center">
          <div className="w-3/4">
            <img 
              src="/bakugan_title.avif" 
              alt="Bakugan Title" 
              className="w-full h-full object-contain opacity-40 dark:opacity-20"
              style={{ filter: 'brightness(0.8)' }}
            />
            
          </div>
            <div className="absolute z-10 text-center px-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Generate your own Bakugan<br />
                <span className="text-muted-foreground">from your profile picture.</span>
              </h1>
            </div>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          Upload your profile picture and let our AI generate a unique Bakugan just for you. Download it and share with friends!
        </p>
        
        <div className="flex justify-center space-x-4 mt-8">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg" size="lg">
            Generate Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            className="bg-transparent border-border text-foreground hover:bg-muted px-8 py-3 text-lg"
            size="lg"
            onClick={() => window.open("https://x.com/i/communities/1943779137308831749", "_blank")}
          >
            <Twitter className="w-5 h-5 mr-2" />
            Join Community
          </Button>
        </div>
      </div>
    </section>
  );
};



