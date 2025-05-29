import { useEffect } from 'react';
import ReactDOM from 'react-dom';
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

      // Create a separate React root for the toolbar
      const root = ReactDOM.createRoot ? 
        ReactDOM.createRoot(stagewiseContainer) : 
        null;

      if (root) {
        // For React 18+
        root.render(<StagewiseToolbar config={stagewiseConfig} />);
      } else {
        // Fallback for React 17
        ReactDOM.render(<StagewiseToolbar config={stagewiseConfig} />, stagewiseContainer);
      }

      // Cleanup function
      return () => {
        if (root) {
          root.unmount();
        } else {
          ReactDOM.unmountComponentAtNode(stagewiseContainer);
        }
        if (stagewiseContainer && stagewiseContainer.parentNode) {
          stagewiseContainer.parentNode.removeChild(stagewiseContainer);
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default StagewiseIntegration; 