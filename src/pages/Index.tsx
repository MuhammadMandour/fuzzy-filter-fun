import { useState } from 'react';
import { SpatialFilterTab } from '@/components/SpatialFilterTab';
import { HistogramTab } from '@/components/HistogramTab';
import { FrequencyFilterTab } from '@/components/FrequencyFilterTab';
import { HybridImageTab } from '@/components/HybridImageTab';

type MainTab = 'spatial' | 'histogram' | 'frequency';
type FreqSubTab = 'filter' | 'hybrid';

export default function Index() {
  const [mainTab, setMainTab] = useState<MainTab>('spatial');
  const [freqSubTab, setFreqSubTab] = useState<FreqSubTab>('filter');

  const tabs: { id: MainTab; label: string }[] = [
    { id: 'spatial', label: 'Spatial Filters' },
    { id: 'histogram', label: 'Histogram' },
    { id: 'frequency', label: 'Frequency Domain' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-mono font-bold text-primary tracking-tight">
          CV<span className="text-foreground">Lab</span>
        </h1>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${
                mainTab === tab.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {mainTab === 'spatial' && <SpatialFilterTab />}
        {mainTab === 'histogram' && <HistogramTab />}
        {mainTab === 'frequency' && (
          <div className="flex flex-col gap-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-border pb-2">
              <button
                onClick={() => setFreqSubTab('filter')}
                className={`px-3 py-1.5 text-xs font-mono rounded-t-md transition-colors ${
                  freqSubTab === 'filter'
                    ? 'bg-primary/15 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Low/High Pass
              </button>
              <button
                onClick={() => setFreqSubTab('hybrid')}
                className={`px-3 py-1.5 text-xs font-mono rounded-t-md transition-colors ${
                  freqSubTab === 'hybrid'
                    ? 'bg-primary/15 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hybrid Image
              </button>
            </div>
            {freqSubTab === 'filter' && <FrequencyFilterTab />}
            {freqSubTab === 'hybrid' && <HybridImageTab />}
          </div>
        )}
      </main>
    </div>
  );
}
