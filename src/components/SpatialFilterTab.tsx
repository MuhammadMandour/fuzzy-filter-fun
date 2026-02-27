import { useState, useCallback } from 'react';
import { ImageBox } from './ImageBox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  loadImageToCanvas, cloneImageData,
  addUniformNoise, addGaussianNoise, addSaltPepperNoise,
  averageFilter, gaussianFilter, medianFilter,
  sobelFilter, robertsFilter, prewittFilter, cannyEdgeDetector,
  equalizeImage,
} from '@/lib/imageProcessing';

export function SpatialFilterTab() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [noisy, setNoisy] = useState<ImageData | null>(null);
  const [filtered, setFiltered] = useState<ImageData | null>(null);

  const [noiseType, setNoiseType] = useState('gaussian');
  const [noisePercent, setNoisePercent] = useState(20);
  const [filterType, setFilterType] = useState('average');
  const [kernelSize, setKernelSize] = useState(3);

  const handleUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    const { imageData } = await loadImageToCanvas(url);
    URL.revokeObjectURL(url);
    setOriginal(imageData);
    setNoisy(null);
    setFiltered(null);
  }, []);

  const applyNoise = useCallback(() => {
    if (!original) return;
    const src = cloneImageData(original);
    let result: ImageData;
    switch (noiseType) {
      case 'uniform': result = addUniformNoise(src, noisePercent); break;
      case 'salt_pepper': result = addSaltPepperNoise(src, noisePercent); break;
      default: result = addGaussianNoise(src, noisePercent);
    }
    setNoisy(result);
    setFiltered(null);
  }, [original, noiseType, noisePercent]);

  const applyFilter = useCallback(() => {
    const src = noisy || original;
    if (!src) return;
    let result: ImageData;
    const k = kernelSize % 2 === 0 ? kernelSize + 1 : kernelSize;
    switch (filterType) {
      case 'gaussian': result = gaussianFilter(src, k); break;
      case 'median': result = medianFilter(src, k); break;
      case 'sobel': result = sobelFilter(src); break;
      case 'roberts': result = robertsFilter(src); break;
      case 'prewitt': result = prewittFilter(src); break;
      case 'canny': result = cannyEdgeDetector(src, k); break;
      case 'equalize': result = equalizeImage(src); break;
      default: result = averageFilter(src, k);
    }
    setFiltered(result);
  }, [noisy, original, filterType, kernelSize]);

  const isEdgeFilter = ['sobel', 'roberts', 'prewitt'].includes(filterType);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Image Boxes */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImageBox title="Original Image" imageData={original} onUpload={handleUpload} />
        <ImageBox title="After Noise" imageData={noisy} />
        <ImageBox title="After Filter" imageData={filtered} />
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-72 shrink-0 space-y-6">
        {/* Noise Controls */}
        <div className="control-panel">
          <h3 className="text-sm font-mono text-primary uppercase tracking-wider">Noise</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Select value={noiseType} onValueChange={setNoiseType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="gaussian">Gaussian</SelectItem>
                  <SelectItem value="salt_pepper">Salt & Pepper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Percentage: {noisePercent}%</label>
              <Slider value={[noisePercent]} onValueChange={([v]) => setNoisePercent(v)} min={1} max={100} step={1} className="mt-2" />
            </div>
            <Button onClick={applyNoise} disabled={!original} className="w-full" size="sm">Apply Noise</Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="control-panel">
          <h3 className="text-sm font-mono text-primary uppercase tracking-wider">Filter</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="gaussian">Gaussian</SelectItem>
                  <SelectItem value="median">Median</SelectItem>
                  <SelectItem value="sobel">Sobel</SelectItem>
                  <SelectItem value="roberts">Roberts</SelectItem>
                  <SelectItem value="prewitt">Prewitt</SelectItem>
                  <SelectItem value="canny">Canny</SelectItem>
                  <SelectItem value="equalize">Equalize</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEdgeFilter && filterType !== 'equalize' && (
              <div>
                <label className="text-xs text-muted-foreground">Kernel Size: {kernelSize % 2 === 0 ? kernelSize + 1 : kernelSize}</label>
                <Slider value={[kernelSize]} onValueChange={([v]) => setKernelSize(v)} min={3} max={15} step={2} className="mt-2" />
              </div>
            )}
            <Button onClick={applyFilter} disabled={!original} className="w-full" size="sm">Apply Filter</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
