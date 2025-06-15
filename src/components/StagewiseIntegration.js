import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StagewiseToolbar } from '@stagewise/toolbar-react';

const StagewiseIntegration = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Create a container for the stagewise toolbar
      let stagewiseContainer = document.getElementById('stagewise-toolbar-root');
      
      if (!stagewiseContainer) {
        stagewiseContainer = document.createElement('div');
        stagewiseContainer.id = 'stagewise-toolbar-root';
        document.body.appendChild(stagewiseContainer);
      }

      // Configuration object with empty plugins array
      const stagewiseConfig = {
        plugins: []
      };

      // Create a React root for the toolbar (React 18)
      const root = createRoot(stagewiseContainer);
        root.render(<StagewiseToolbar config={stagewiseConfig} />);

      // Cleanup function
      return () => {
          root.unmount();
        if (stagewiseContainer && stagewiseContainer.parentNode) {
          stagewiseContainer.parentNode.removeChild(stagewiseContainer);
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default StagewiseIntegration; 