import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

type ViewportMode = 'desktop' | 'mobile';

interface ViewportConfig {
  mode: ViewportMode;
  width: string;
  icon: React.ReactNode;
  label: string;
}

const viewportConfigs: ViewportConfig[] = [
  { mode: 'desktop', width: '100%', icon: <Monitor className="w-4 h-4" />, label: 'Desktop' },
  { mode: 'mobile', width: '375px', icon: <Smartphone className="w-4 h-4" />, label: 'Mobile' },
];

const ViewportToggle: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    const config = viewportConfigs.find(c => c.mode === viewportMode);
    if (!config) return;

    if (viewportMode === 'desktop') {
      // Reset to full width
      rootElement.style.maxWidth = '';
      rootElement.style.margin = '';
      rootElement.style.boxShadow = '';
      rootElement.style.border = '';
    } else {
      // Apply mobile width
      rootElement.style.maxWidth = config.width;
      rootElement.style.margin = '0 auto';
      rootElement.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
      rootElement.style.border = '1px solid #e5e7eb';
    }
  }, [viewportMode]);

  // Only show in development mode
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Toggle Button */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-all"
          title="Show Viewport Toggle"
        >
          <Monitor className="w-5 h-5" />
        </button>
      )}

      {/* Viewport Control Panel */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Viewport Preview</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Hide"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {viewportConfigs.map((config) => (
              <button
                key={config.mode}
                onClick={() => setViewportMode(config.mode)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${viewportMode === config.mode 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {config.icon}
                <span className="font-medium">{config.label}</span>
                {config.mode !== 'desktop' && (
                  <span className={`ml-auto text-xs ${viewportMode === config.mode ? 'text-white/80' : 'text-gray-500'}`}>
                    {config.width}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Development Mode Only
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewportToggle;
