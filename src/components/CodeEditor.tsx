import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const CodeEditor = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-card border-border text-center">
          <h2 className="text-xl font-semibold mb-4">Upload Your Profile Picture</h2>
          <p className="text-muted-foreground mb-6">
            Select an image to generate your unique Bakugan. Supported formats: JPG, PNG.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <Input type="file" accept=".jpg,.jpeg,.png" className="max-w-sm" />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
              Generate Bakugan
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

