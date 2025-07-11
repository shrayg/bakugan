import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import ImageUpload from "@/components/ImageUpload";
import GeneratedImage from "@/components/GeneratedImage";
import { FeatureSection } from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [appImage, setAppImage] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const generateRef = useRef(null);
  const galleryRef = useRef(null);

  const scrollToSection = (section) => {
    const refs = {
      generate: generateRef,
      gallery: galleryRef
    };
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabaseAdmin
        .from('images')
        .select('id, url, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch images:', error);
        return;
      }

      if (data) {
        setImages(
          data.map(img => ({
            id: img.id,
            url: img.url,
            timestamp: img.created_at
          }))
        );
      }
    };

    fetchImages();
  }, []);

  const handleImageUpload = (imageUrl) => {
    setUploadedImage(imageUrl);
    setGeneratedImage(null);
    setDone(false);

    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        setAppImage([{ blob }]);
      });
  };

  const generateImage = async () => {
    if (!appImage || appImage.length === 0) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = 'Use the attached image as theme inspiration. Create a high-resolution, photo-realistic product mockup of a Bakugan Evolutions ‘Starter Pack’ in its official clear plastic blister packaging, displayed on a clean white background with soft, even studio lighting. Keep the realistic toy blister pack layout, showing one Bakugan figure in an open pose and two closed bakugan spheres, with the Bakugan Evolutions logo, Starter Pack label, and small warning text in their usual positions. Adapt the entire packaging colors, background graphics, iconography, and the colors and details of the Bakugan figure and spheres to match the visual style, color palette, and theme of the attached image, ensuring it looks like an authentic collectible product ready for retail while fully matching the theme you provide. Make sure its centered and 1:1. https://imgur.com/a/wLUgnRf';
      const imageObj = appImage[0];

      const toBase64 = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      let base64Image = null;
      if (imageObj.blob) {
        base64Image = await toBase64(imageObj.blob);
      } else {
        toast({
          title: 'Error',
          description: 'Could not extract image data from uploaded file.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return;
      }

      const response = await openai.responses.create({
        model: 'gpt-4o',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              {
                type: 'input_image',
                image_url: `data:image/png;base64,${base64Image}`,
                detail: 'auto'

              },
            ],
          },
        ],
        tools: [{ type: 'image_generation' }],
      });

      const imageData = response.output
        .filter((output) => output.type === 'image_generation_call')
        .map((output) => output.result);

      const generatedImageBase64 = imageData[0];
      if (generatedImageBase64) {
        setGeneratedImage(`data:image/png;base64,${generatedImageBase64}`);
        toast({
          title: 'Image generated successfully!',
          description: 'Your generated Bakugan is ready.',
        });

        const dataURL = `data:image/png;base64,${generatedImageBase64}`;

        const res = await fetch(dataURL);
        const blob = await res.blob();

        const fileName = `bakugan-${Date.now()}.png`;
        const { error: upLoadErr } = await supabaseAdmin
          .storage
          .from('bakugan-images')
          .upload(fileName, blob, { contentType: 'image/png' });
        if (upLoadErr) {
          console.error('Storage upload error:', upLoadErr);
          console.error('Error message:', upLoadErr.message);
          throw upLoadErr;
        }

        const { data } = supabaseAdmin
          .storage
          .from('bakugan-images')
          .getPublicUrl(fileName);

        if (!data || !data.publicUrl) {
          console.error('getPublicUrl failed: Missing public URL');
          throw new Error('Failed to retrieve public URL');
        }

        const publicUrl = data.publicUrl;

        console.log('About to insert with URL:', publicUrl);

        const { error: dbErr } = await supabaseAdmin
          .from('images')
          .insert({
            url: publicUrl,
            user_id: null
          });
        if (dbErr) {
          console.error('Detailed insert error:', dbErr);
          console.error('Error code:', dbErr.code);
          console.error('Error message:', dbErr.message);
          console.error('Error details:', dbErr.details);
          throw dbErr;
        }

        toast({ title: 'Image saved to gallery!' });

      } else {
        toast({
          title: 'Generation failed',
          description: 'Failed to generate image.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Generation failed',
        description: 'An error occurred while generating the image.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setDone(true);
    }
  };

  const downloadImage = async (imageUrl, id) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bakugan-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20">
        <HeroSection />
        
        <section ref={generateRef} className="py-20 px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Ready to generate!
            </div>
          </div>
          
          <Card className="p-6 bg-card border-border text-center max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Your Profile Picture</h2>
            <p className="text-muted-foreground mb-6">
              Select an image to generate your unique Bakugan. Supported formats: JPG, PNG.
            </p>
            <div className="flex flex-col items-center space-y-4">
              {uploadedImage ? (
                <div className="space-y-3 md:space-y-4 text-center">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="mx-auto max-w-full h-24 md:h-32 lg:h-48 object-contain rounded-lg shadow-lg"
                  />
                  <Button
                    onClick={() => setUploadedImage(null)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs md:text-sm"
                  >
                    Choose Different Image
                  </Button>
                </div>
              ) : (
                <ImageUpload onImageUpload={handleImageUpload} />
              )}

              <Button
                onClick={generateImage}
                disabled={!uploadedImage || isGenerating}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
              >
                <Sparkles className="mr-2" size={16} />
                {isGenerating ? 'Generating Your Bakugan...' : 'Generate Bakugan'}
              </Button>
              {generatedImage && (
                <GeneratedImage
                  imageUrl={generatedImage}
                  isGenerating={isGenerating}
                  onDownload={downloadImage}
                />
              )}
            </div>
          </Card>
        </section>
        
        <section ref={galleryRef} className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore the Bakugan Gallery
              </h2>
              <p className="text-xl text-muted-foreground">
                See all the amazing Bakugan generated by our community!
              </p>
            </div>

            {images.length === 0 ? (
              <Card className="p-4 bg-card border-border flex items-center justify-center h-48">
                <span className="text-muted-foreground">No Bakugan created yet</span>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="gallery-item stitched-border">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Bakugan ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 md:p-3 lg:p-4 flex justify-between items-center">
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => downloadImage(image.url, image.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;



