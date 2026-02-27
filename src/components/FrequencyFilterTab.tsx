import { useState, useCallback } from 'react';
import { ImageBox } from './ImageBox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  loadImageToCanvas, fft2d, fftToImage, applyFrequencyFilter, ifft2d,
  type FFTResult,
} from '@/lib/imageProcessing';

export function FrequencyFilterTab() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [fftImage, setFftImage] = useState<ImageData | null>(null);
  const [filteredImage, setFilteredImage] = useState<ImageData | null>(null);
  const [fftData, setFftData] = useState<FFTResult | null>(null);

  const [filterType, setFilterType] = useState<'low' | 'high'>('low');
  const [radius, setRadius] = useState(30);
  const [processing, setProcessing] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    const { imageData } = await loadImageToCanvas(url);
    URL.revokeObjectURL(url);
    setOriginal(imageData);
    setProcessing(true);
    // Use setTimeout to not block UI
    setTimeout(() => {
      const fft = fft2d(imageData);
      setFftData(fft);
      setFftImage(fftToImage(fft));
      setFilteredImage(null);
      setProcessing(false);
    }, 50);
  }, []);

  const applyFilter = useCallback(() => {
    if (!fftData) return;
    setProcessing(true);
    setTimeout(() => {
      const filtered = applyFrequencyFilter(fftData, radius, filterType);
      setFilteredImage(ifft2d(filtered));
      setProcessing(false);
    }, 50);
  }, [fftData, radius, filterType]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImageBox title="Original Image" imageData={original} onUpload={handleUpload} />
        <ImageBox title="FFT Spectrum" imageData={fftImage} />
        <ImageBox title="Filtered Result" imageData={filteredImage} />
      </div>

      <div className="w-full lg:w-72 shrink-0">
        <div className="control-panel">
          <h3 className="text-sm font-mono text-primary uppercase tracking-wider">Frequency Filter</h3>
          {processing && <p className="text-xs text-primary animate-pulse">Processing...</p>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Filter Type</label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as 'low' | 'high')}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Pass</SelectItem>
                  <SelectItem value="high">High Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Radius: {radius}</label>
              <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={1} max={200} step={1} className="mt-2" />
            </div>
            <Button onClick={applyFilter} disabled={!fftData || processing} className="w-full" size="sm">
              Apply Filter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
