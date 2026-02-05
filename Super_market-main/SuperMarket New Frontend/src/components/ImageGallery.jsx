import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Image as ImageIcon,
  Search,
  Download,
  Trash2,
  Grid,
  List,
  Filter
} from 'lucide-react';

const ImageGallery = ({ images = [], onDelete, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filteredImages, setFilteredImages] = useState(images);

  useEffect(() => {
    let filtered = images;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by model
    if (selectedModel !== 'all') {
      filtered = filtered.filter(image => image.model === selectedModel);
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedModel]);

  const getUniqueModels = () => {
    const models = images.map(image => image.model);
    return [...new Set(models)];
  };

  const getModelDisplayName = (modelName) => {
    const modelNames = {
      'dalle': 'DALL-E 3',
      'midjourney': 'Midjourney',
      'stability': 'Stable Diffusion'
    };
    return modelNames[modelName] || modelName;
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
          <p className="text-gray-500">Generate your first AI image to see it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search images by prompt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Model Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Models</option>
                {getUniqueModels().map(model => (
                  <option key={model} value={model}>
                    {getModelDisplayName(model)}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredImages.length} of {images.length} images
        </p>
        {filteredImages.length !== images.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedModel('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Images Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative group">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDownload?.(image.url, `image-${image.id}.png`)}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(image.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-3">
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.prompt}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getModelDisplayName(image.model)}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(image.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <Card key={image.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1 line-clamp-2">{image.prompt}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getModelDisplayName(image.model)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(image.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload?.(image.url, `image-${image.id}.png`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State for Filtered Results */}
      {filteredImages.length === 0 && images.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedModel('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGallery;
