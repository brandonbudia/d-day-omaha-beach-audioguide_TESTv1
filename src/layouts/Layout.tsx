import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  lang?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] font-sans antialiased selection:bg-[#f2ca50] selection:text-[#3c2f00]">
      {children}
    </div>
  );
};

export default Layout;
