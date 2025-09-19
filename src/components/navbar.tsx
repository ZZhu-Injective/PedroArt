"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface NavItem {
  href?: string;
  label: string;
  submenu?: SubMenuItem[];
  newTab?: boolean;
}

interface SubMenuItem {
  href: string;
  label: string;
  newTab: boolean;
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target as Node)) {
        setSubMenuOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      setSubMenuOpen(false);
      setActiveSubMenu(null);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSubMenuOpen(false);
    setActiveSubMenu(null);
  };

  const toggleSubMenu = (label: string) => {
    if (activeSubMenu === label) {
      setSubMenuOpen(false);
      setActiveSubMenu(null);
    } else {
      setSubMenuOpen(true);
      setActiveSubMenu(label);
    }
  };

  const handleItemHover = (label: string) => {
    setHoveredItem(label);
    if (isLargeScreen && label === "More") {
      setSubMenuOpen(true);
      setActiveSubMenu(label);
    }
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
    if (isLargeScreen) {
      setTimeout(() => {
        if (!subMenuRef.current?.matches(':hover')) {
          setSubMenuOpen(false);
          setActiveSubMenu(null);
        }
      }, 150);
    }
  };

  const handleSubMenuLeave = () => {
    if (isLargeScreen) {
      setTimeout(() => {
        if (hoveredItem !== "More") {
          setSubMenuOpen(false);
          setActiveSubMenu(null);
        }
      }, 150);
    }
  };

  const navItems: NavItem[] = [
    { href: "/arts", label: "Fans Art" },
    { href: "/factory", label: "Factory"},
    { href: "/editor", label: "Editor"},
    { href: "/nftgenerator", label: "NFT Genrator" },
    { 
      label: "More", 
      submenu: [
        { href: "https://injectivepedro.com/", label: "Mainpage", newTab: true },
        { href: "https://job.injectivepedro.com/", label: "Talent", newTab: true },
        { href: "https://burn.injectivepedro.com/", label: "Burn", newTab: true },
        { href: "https://scam.injectivepedro.com/", label: "Scam", newTab: true },
        { href: "/dashboard", label: "Dashboard", newTab: true}
      ]
    },
  ];

  return (
    <header className="top-0 z-50 flex-shrink-0 sm:py-1 py-3 bg-white sticky border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col lg:flex-row justify-between items-center">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link
            href="/"
            className="flex items-center text-xl md:text-2xl font-bold text-black hover:text-neutral-700 transition-colors"
            onClick={closeMenu}
          >
            <img
              src="/pedro_logo4.png"
              alt="Pedro the Raccoon Logo"
              className="w-10 h-10 mr-2 rounded-full"
              width={40}
              height={40}
            />
            <span className="hidden sm:inline">PEDRO THE RACCOON</span>
            <span className="sm:hidden">PEDRO THE RACCOON </span>
          </Link>

          {!isLargeScreen && (
            <button
              aria-label="Toggle navigation menu"
              className="block lg:hidden text-black focus:outline-none hover:text-neutral-700 transition-colors"
              onClick={toggleMenu}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          )}
        </div>

        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } fixed inset-0 bg-black z-40 flex-col w-full h-full lg:relative lg:flex lg:flex-row lg:w-auto lg:items-center lg:bg-transparent lg:h-auto transition-all duration-300 ease-in-out`}
        >
          {!isLargeScreen && (
            <button
              aria-label="Close navigation menu"
              className="absolute top-6 right-6 text-white focus:outline-none hover:text-neutral-300 transition-colors lg:hidden"
              onClick={closeMenu}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <ul className="flex flex-col gap-0 mx-auto lg:gap-6 xl:gap-5 text-white lg:text-black items-center mt-28 lg:mt-0 lg:flex-row">
            {navItems.map((item) => (
              <li
                key={item.href || item.label}
                className="w-full lg:w-auto border-b border-neutral-800 lg:border-0 lg:border-neutral-200 relative"
              >
                {item.submenu ? (
                  <div 
                    className="relative" 
                    ref={subMenuRef}
                    onMouseEnter={() => handleItemHover(item.label)}
                    onMouseLeave={handleItemLeave}
                  >
                    <button
                      onClick={() => toggleSubMenu(item.label)}
                      className={`py-3 px-5 text-sm lg:text-lg font-medium block w-full text-center transition-colors duration-200 flex items-center justify-center lg:justify-start ${activeSubMenu === item.label && !isLargeScreen ? 'bg-white text-black' : 'hover:bg-white hover:text-black'}`}
                    >
                      {item.label}
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform ${activeSubMenu === item.label ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isLargeScreen && (
                      <div 
                        className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200 transition-all duration-200 ${subMenuOpen && activeSubMenu === item.label ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                        onMouseLeave={handleSubMenuLeave}
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-4 py-3 text-sm text-black hover:bg-black hover:text-white transition-colors"
                            onClick={closeMenu}
                            target={subItem.newTab ? "_blank" : undefined}
                            rel={subItem.newTab ? "noopener noreferrer" : undefined}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href || '#'}
                      className={`py-3 px-5 text-sm lg:text-lg font-medium block w-full text-center transition-colors duration-200 relative ${activeSubMenu === item.label && !isLargeScreen ? 'bg-white text-black' : 'hover:bg-white hover:text-black'}`}
                      onClick={closeMenu}
                      target={item.newTab ? "_blank" : undefined}
                      rel={item.newTab ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                      {(isLargeScreen && hoveredItem === item.label) && (
                        <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-black"></span>
                      )}
                    </Link>
                  </div>
                )}
                
                {!isLargeScreen && activeSubMenu === item.label && item.submenu && (
                  <div className="w-full bg-neutral-900">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block py-4 px-12 text-sm text-white hover:bg-white hover:text-black transition-colors"
                        onClick={closeMenu}
                        target={subItem.newTab ? "_blank" : undefined}
                        rel={subItem.newTab ? "noopener noreferrer" : undefined}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {!isLargeScreen && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-black py-5 shadow-lg lg:hidden border-t border-neutral-800">
              <div className="flex gap-8 justify-center">
                <a
                  href="https://twitter.com/InjPedro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" fill="currentColor" />
                  </svg>
                </a>
                <a
                  href="https://discord.com/invite/DuBAdjV4Rp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16">
                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" fill="currentcolor" />
                  </svg>
                </a>
                <a
                  href="https://pedro-7.gitbook.io/pedro-meme-coin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16">
                    <path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 0 1 1.267 2.025 1.226 1.226 0 0 1-2.002-1.334L8.58 5.963v4.353a1.226 1.226 0 1 1-1.008-.036V5.887a1.226 1.226 0 0 1-.666-1.608L5.093 2.465l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.03 1.03 0 0 0 0-1.457" fill="currentColor" />
                  </svg>
                </a>
                <a
                  href="mailto:pedroinjective@gmail.com"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M12 13.065 1.94 6.482a1.001 1.001 0 0 1 .96-1.482h18.2a1.001 1.001 0 0 1 .96 1.482L12 13.065Zm0 2.201-9.96-6.52V18.2h19.92V8.746l-9.96 6.52Z" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        {menuOpen && !isLargeScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-30 lg:hidden"
            onClick={closeMenu}
          />
        )}
      </div>
    </header>
  );
};

export default Navbar;