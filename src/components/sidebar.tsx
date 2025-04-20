'use client';

import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`relative ${
        isCollapsed ? 'w-16' : 'w-16 md:w-48'
      } bg-white shadow-lg flex flex-col justify-between flex-shrink-0 transition-all duration-300 ease-in-out`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 bg-black rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200 hidden md:block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'}
          />
        </svg>
      </button>

      <div className="p-4 flex flex-col items-center space-y-4 flex-grow mt-12">
        <SidebarLink
          href="/dashboard/mywallet"
          iconPath="M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z"
          label="Meme Mine"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/tokeninfo"
          iconPath="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1 5h-2v6h2v-6z"
          label="Meme Info"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/tokenholders"
          iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM6 20a6 6 0 0112 0H6z"
          label="Meme Hold"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/converter"
          iconPath="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
          label="Meme Conv"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/airdrop"
          iconPath="M12 2c-2.5 0-4.8 1-6.5 2.7L12 12l6.5-7.3C16.8 3 14.5 2 12 2zm0 18c-2.2 0-4.2-1-5.5-2.6l5.5-6.2 5.5 6.2C16.2 19 14.2 20 12 20zm0-16c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"
          label="Meme Drop"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/nftholders"
          iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM6 20a6 6 0 0112 0H6z"
          label="NFTs Hold"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/eligable"
          iconPath="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.293 14.707l5.657-5.657-1.414-1.414-4.243 4.243-2.121-2.121-1.414 1.414 3.535 3.536z"
          label="U Eligable"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dashboard/scamscanner"
          iconPath="M12 2a10 10 0 100 20 10 10 0 000-20zm-3.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-7.07 6.07a5.5 5.5 0 016.14 0 .75.75 0 11-.86 1.22 4 4 0 00-4.42 0 .75.75 0 11-.86-1.22z"
          label="Scam Scan"
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="p-4 mt-auto">
        <SidebarLink
          href="/dashboard"
          iconPath="M6 18L18 6M6 6l12 12"
          label="Disconnect"
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
};

interface SidebarLinkProps {
  href: string;
  iconPath: string;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  iconPath,
  label,
  isCollapsed,
  isActive,
}) => {
  const isStrikethrough = ['Scam Scanner', 'Governance', 'Weed Click'].includes(label);

  return (
    <a
      href={href}
      className={`flex items-center lg:justify-start p-2 text-gray-700 hover:text-gray-900 ${
        isActive ? 'bg-gray-100 text-gray-900' : 'hover:bg-black'
      } rounded-lg w-full transition-all duration-200 ease-in-out transform hover:scale-105 border border-black hover:text-white hover:bg-black`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
      </svg>
      <span
        className={`hidden ${
          !isCollapsed ? 'md:inline' : ''
        } text-sm font-medium ml-2 ${isStrikethrough ? 'line-through' : ''}`}
      >
        {label}
      </span>
    </a>
  );
};

export default Sidebar;