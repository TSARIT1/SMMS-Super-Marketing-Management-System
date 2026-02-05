import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';

const ImageGeneration = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dalle');
  const [size, setSize] = useState('1024x1024');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([
    { id: 'dalle', name: 'DALL-E 3 (OpenAI)' },
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'stability', name: 'Stable Diffusion' }
  ]);

  useEffect(() => {
    // optionally fetch available models from backend
    const fetchModels = async () => {
      try {
        const res = await api.get('/ai/image-models');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setModels(res.data.map(m => ({ id: m.name || m.id, name: m.displayName || m.name || m.id })));
        }
      } catch (err) {
        console.warn('Failed to fetch image models:', err);
      }
    };

    fetchModels();
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      // Post request using query params so backend @RequestParam picks them up
      const options = { size };
      const response = await api.post('/ai/generate-image', null, { params: { prompt: prompt.trim(), model, ...options } });

      // The backend might return several shapes; handle common ones
      let imageUrl = null;
      if (response?.data?.url) imageUrl = response.data.url;
      else if (response?.data?.imageUrl) imageUrl = response.data.imageUrl;
      else if (Array.isArray(response?.data?.images) && response.data.images[0]) imageUrl = response.data.images[0].url || response.data.images[0];

      // If backend didn't return a URL, create a small placeholder using SVG
      if (!imageUrl) {
        const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size.split('x')[0]}' height='${size.split('x')[1]}'><rect width='100%' height='100%' fill='%23EEE'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='20'>No preview</text></svg>`)}`;
        imageUrl = placeholder;
      }

      const newImage = {
        url: imageUrl,
        prompt: prompt.trim(),
        model,
        size,
        timestamp: new Date().toISOString()
      };

      onImageGenerated?.(newImage);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Generate Email Image
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <Textarea placeholder="Describe the image you want (e.g. festive banner with product)" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select className="w-full p-2 border border-gray-300 rounded-md" value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select className="w-full p-2 border border-gray-300 rounded-md" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="1024x1024">1024x1024</option>
                <option value="800x600">800x600</option>
                <option value="600x400">600x400</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateImage} disabled={loading} className="w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Generate Image'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGeneration;
