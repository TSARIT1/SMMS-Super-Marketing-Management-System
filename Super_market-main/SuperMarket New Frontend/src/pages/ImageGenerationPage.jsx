import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Mail,
  Sparkles,
  Settings,
  Zap,
  Palette,
  ShoppingBag,
  Megaphone,
  Calendar
} from 'lucide-react';
import ImageGeneration from '../components/ImageGeneration';
import ImageGallery from '../components/ImageGallery';
import api from '../utils/api';

const ImageGenerationPage = () => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [stats, setStats] = useState({
    totalEmailImages: 0,
    imagesToday: 0,
    averageGenerationTime: 0,
    successRate: 0,
    bannerImages: 0,
    productImages: 0,
    promotionalImages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadGeneratedImages();
  }, []);

  const loadStats = async () => {
    try {
      // Use the image stats endpoint from the backend
      const response = await api.get('/ai/image-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load image stats:', error);
      // Set default stats if API fails
      setStats({
        totalEmailImages: 0,
        imagesToday: 0,
        averageGenerationTime: 0,
        successRate: 0,
        bannerImages: 0,
        productImages: 0,
        promotionalImages: 0
      });
    }
  };

  const loadGeneratedImages = async () => {
    try {
      // In a real implementation, this would fetch from the backend
      // For now, we'll use local storage or mock data
      const savedImages = localStorage.getItem('emailGeneratedImages');
      if (savedImages) {
        setGeneratedImages(JSON.parse(savedImages));
      }
    } catch (error) {
      console.error('Failed to load generated images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageGenerated = (newImage) => {
    const imageWithId = {
      ...newImage,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      emailType: newImage.emailType || 'custom'
    };

    const updatedImages = [imageWithId, ...generatedImages];
    setGeneratedImages(updatedImages);

    // Save to localStorage (in production, this would be saved to backend)
    localStorage.setItem('emailGeneratedImages', JSON.stringify(updatedImages));

    // Refresh stats
    loadStats();
  };

  const handleDeleteImage = (imageId) => {
    const updatedImages = generatedImages.filter(img => img.id !== imageId);
    setGeneratedImages(updatedImages);
    localStorage.setItem('emailGeneratedImages', JSON.stringify(updatedImages));
  };

  const handleDownloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-8 w-8 text-blue-600" />
            Email AI Image Generation
          </h1>
          <p className="text-gray-600 mt-1">Generate AI-powered images specifically for email marketing campaigns</p>
        </div>
        <Button onClick={loadStats} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Email Images</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEmailImages}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.imagesToday}</p>
              </div>
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Banner Images</p>
                <p className="text-2xl font-bold text-purple-600">{stats.bannerImages}</p>
              </div>
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Product Images</p>
                <p className="text-2xl font-bold text-orange-600">{stats.productImages}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Images</TabsTrigger>
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <ImageGeneration onImageGenerated={handleImageGenerated} />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <ImageGallery
            images={generatedImages}
            onDelete={handleDeleteImage}
            onDownload={handleDownloadImage}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email Banner Template */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Palette className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email Banners</h3>
                <p className="text-gray-600 mb-4">Create eye-catching banner images for email headers</p>
                <Badge variant="outline" className="mb-4">1200x300px</Badge>
                <Button className="w-full">Generate Banner</Button>
              </CardContent>
            </Card>

            {/* Product Showcase Template */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Product Showcase</h3>
                <p className="text-gray-600 mb-4">Highlight products with professional imagery</p>
                <Badge variant="outline" className="mb-4">600x400px</Badge>
                <Button className="w-full">Generate Product Image</Button>
              </CardContent>
            </Card>

            {/* Promotional Template */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Megaphone className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Promotional Images</h3>
                <p className="text-gray-600 mb-4">Create compelling promotional graphics</p>
                <Badge variant="outline" className="mb-4">800x600px</Badge>
                <Button className="w-full">Generate Promo Image</Button>
              </CardContent>
            </Card>

            {/* Seasonal Template */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Seasonal Images</h3>
                <p className="text-gray-600 mb-4">Holiday and seasonal themed graphics</p>
                <Badge variant="outline" className="mb-4">1000x400px</Badge>
                <Button className="w-full">Generate Seasonal Image</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Image Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">AI Model Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Primary AI Model</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="dalle">DALL-E 3 (OpenAI)</option>
                        <option value="midjourney">Midjourney</option>
                        <option value="stability">Stable Diffusion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Image Quality</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="standard">Standard</option>
                        <option value="high">High Quality</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Email Integration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Auto-optimize for Email</label>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">Automatically optimize images for email delivery</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Brand Consistency</label>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">Apply brand colors and style</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Save Email Image Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageGenerationPage;
