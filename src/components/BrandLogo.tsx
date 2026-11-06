import React from 'react';

interface BrandLogoProps {
  className?: string;
  wordmark?: boolean;
}

/** An audioguide identity inspired by the museum hangar, not an official museum seal. */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', wordmark = false }) => (
  <span className={`museum-brand ${className}`} aria-hidden="true">
    <svg className="museum-brand-mark" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 43V30a20 20 0 0 1 40 0v13M8 44h48" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 43V29h10v14" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M13 52c7-4 12 4 19 0s13-4 20 0" stroke="var(--museum-ochre, #B99556)" strokeWidth="3" strokeLinecap="round" />
    </svg>
    {wordmark && <span className="museum-brand-wordmark">D-DAY OMAHA<small>AUDIOGUIDE</small></span>}
  </span>
);
