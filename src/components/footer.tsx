import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full h-auto border-t border-gray-700 relative z-30 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">

          <div className="text-center sm:text-left">
            <p>© 2025 Pedro The Raccoon</p>
          </div>

          <div className="flex gap-6 justify-center">
            <Link 
              href="https://twitter.com/InjPedro" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
            <svg className="h-6 w-6" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" fill="white" />
            </svg>
            </Link>
            <Link 
              href="https://discord.com/invite/DuBAdjV4Rp" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <svg className="h-6 w-6" viewBox="0 0 16 16">
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" fill="white" />
              </svg>
            </Link>
            <Link 
              href="https://pedro-7.gitbook.io/pedro-meme-coin" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 16 16">
                <path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 0 1 1.267 2.025 1.226 1.226 0 0 1-2.002-1.334L8.58 5.963v4.353a1.226 1.226 0 1 1-1.008-.036V5.887a1.226 1.226 0 0 1-.666-1.608L5.093 2.465l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.03 1.03 0 0 0 0-1.457" fill="white" />
              </svg>
            </Link>
            <Link 
              href="mailto:pedroinjective@gmail.com" 
              className="hover:opacity-70 transition-opacity"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
                <path d="M12 13.065 1.94 6.482a1.001 1.001 0 0 1 .96-1.482h18.2a1.001 1.001 0 0 1 .96 1.482L12 13.065Zm0 2.201-9.96-6.52V18.2h19.92V8.746l-9.96 6.52Z" fill="white" />
              </svg>
            </Link>
          </div>

          <div className="text-center sm:text-right">
            <p>Memecoin Built for BBG</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;