import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

export default function Landing() {
  const [isDesktopLogoHovered, setIsDesktopLogoHovered] = useState(false);
  const [isMobileLogoHovered, setIsMobileLogoHovered] = useState(false);

  const staticLogo = "https://cdn.glitch.global/f341fe61-4868-4d79-bad9-1a5804bea407/Mapso%20(Energy)%204.png?v=1713580027089"; // Path to the static image of the logo
  const animatedLogo = "https://cdn.glitch.global/f341fe61-4868-4d79-bad9-1a5804bea407/Mapso%20(Energy)%204.gif?v=1713577237481"; // Path to the animated GIF
  const mobileStaticLogo = "https://cdn.glitch.global/f341fe61-4868-4d79-bad9-1a5804bea407/Mapso%20(Energy)%204.png?v=1713580027089"; // Static version for mobile logo
  const mobileAnimatedLogo = "https://cdn.glitch.global/f341fe61-4868-4d79-bad9-1a5804bea407/Mapso%20(Energy)%204.gif?v=1713577237481"; // Animated version for mobile logo

  return (
    <div className="Logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' }}>
      <div className="animated-gif-box2">
        <Link to="/Products">
          <img
            className="animated-gif2"
            src={isDesktopLogoHovered ? animatedLogo : staticLogo}
            alt="Desktop logo"
            onMouseEnter={() => setIsDesktopLogoHovered(true)}
            onMouseLeave={() => setIsDesktopLogoHovered(false)}
            onTouchStart={() => setIsDesktopLogoHovered(true)}
            onTouchEnd={() => setIsDesktopLogoHovered(false)}
            // style={{ width: '200px', height: '200px' }}  // Adjust the size as needed
          />
        </Link>
      </div>
      <div className="mobile-logo-box">
        <Link to="/Products">
          <img
            src={isMobileLogoHovered ? mobileAnimatedLogo : mobileStaticLogo}
            alt="Mobile logo"
            onMouseEnter={() => setIsMobileLogoHovered(true)}
            onMouseLeave={() => setIsMobileLogoHovered(false)}
            onTouchStart={() => setIsMobileLogoHovered(true)}
            onTouchEnd={() => setIsMobileLogoHovered(false)}
            style={{ width: '100px', height: '100px' }}  // Adjust the size for mobile logo as needed
          />
        </Link>
      </div>
    </div>
  );
}
