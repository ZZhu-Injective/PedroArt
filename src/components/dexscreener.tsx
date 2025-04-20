import React from "react";

const DexScreenerEmbed: React.FC = () => {
  return (
    <div
      className="relative w-full pt-2 pb-2 max-w-[85rem] mx-auto"
      style={{ aspectRatio: "16/9" }}
    >
      <iframe
        src="https://dexscreener.com/injective/inj15ckgh6kdqg0x5p7curamjvqrsdw4cdzz5ky9v6?embed=1&loadChartSettings=0&trades=0&tabs=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=1D"
        className="absolute w-full h-full top-0 left-0 border-0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default DexScreenerEmbed;