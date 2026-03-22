import { useState, useEffect } from 'react';
import { LaserFlow } from './components/LaserFlow';
import { RegisterPage } from './RegisterPage';

const STAR_IMG = "https://i.postimg.cc/yYNDR31M/star.png";

// Preset configurations to scatter stars in various sizes and animation timings
const FLOATING_STARS = [
  { top: '15%', left: '15%', width: '40px', delay: '0s', duration: '4s' },
  { top: '25%', right: '15%', width: '60px', delay: '1s', duration: '5s' },
  { top: '40%', left: '8%', width: '30px', delay: '0.5s', duration: '3.5s' },
  { top: '35%', right: '25%', width: '45px', delay: '2s', duration: '6s' },
  { top: '10%', left: '60%', width: '35px', delay: '1.5s', duration: '4.5s' },
  { top: '60%', left: '20%', width: '50px', delay: '0.8s', duration: '5.2s' },
  { top: '55%', right: '10%', width: '40px', delay: '2.5s', duration: '4.8s' },
];

export default function App() {
  const [preloaderStep, setPreloaderStep] = useState(0);
  const [showRegisterPage, setShowRegisterPage] = useState(false);

  useEffect(() => {
    // Stage 1: "India's First Gameathon"
    const t1 = setTimeout(() => setPreloaderStep(1), 500);
    // Stage 2: "Presented By" + Logo
    const t2 = setTimeout(() => setPreloaderStep(2), 3500);
    // Stage 3: Reveal Main Landing Page
    const t3 = setTimeout(() => setPreloaderStep(3), 6500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (showRegisterPage) {
    return <RegisterPage />;
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] overflow-x-hidden relative font-sans text-neutral-200">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Climate+Crisis&display=swap');
          @keyframes float-star {
            0%, 100% { transform: translateY(0px) rotate(-5deg) scale(1); opacity: 0.5; }
            50% { transform: translateY(-20px) rotate(5deg) scale(1.1); opacity: 0.9; }
          }
          .star-floating {
            animation: float-star ease-in-out infinite;
          }
        `}
      </style>

      {/* Cinematic Preloader Overlay */}
      <div 
        className={`absolute inset-0 z-50 flex items-center justify-center bg-[#050505] transition-all duration-[1500ms] ease-in-out ${
          preloaderStep === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Prompt 1 */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
            preloaderStep === 1 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-md'
          }`}
        >
          <h2 className="text-xl md:text-3xl lg:text-4xl tracking-[0.4em] font-light text-white uppercase text-center drop-shadow-[0_0_15px_rgba(216,180,254,0.3)]">
            India&apos;s First Algorithm-Based Gameathon
          </h2>
        </div>

        {/* Prompt 2 */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
            preloaderStep === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'
          }`}
        >
          <p className="text-xs md:text-sm tracking-[0.5em] text-purple-200/60 uppercase mb-8">
            Presented By
          </p>
          <img 
            src="https://ritchennai.org/images/2026/RIT-logo1.webp" 
            alt="RIT Logo" 
            className="h-20 md:h-28 lg:h-36 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          />
        </div>
      </div>

      {/* Laser Component rendered full screen */}
      <LaserFlow 
        className="absolute inset-0 cursor-crosshair z-0" 
        color="#d8b4fe"
        wispDensity={1.0}
        flowSpeed={0.35}
        fogIntensity={0.6}
        wispIntensity={5.0}
        flowStrength={0.25}
        decay={1.1}
        mouseTiltStrength={0.01}
        horizontalBeamOffset={-0.1} // Adjusted to make it touch the box
        verticalBeamOffset={0.1} // Adjusted to make it touch the box
      />

      {/* Main UI Overlay */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none flex flex-col transition-all duration-[2000ms] delay-500 ease-out ${
          preloaderStep === 3 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
        }`}
      >
        
        {/* Floating Stars */}
        {FLOATING_STARS.map((star, i) => (
          <img
            key={i}
            src={STAR_IMG}
            alt="Floating Star"
            className="absolute star-floating object-contain drop-shadow-[0_0_12px_rgba(216,180,254,0.6)]"
            style={{
              top: star.top,
              left: star.left,
              right: star.right,
              width: star.width,
              animationDuration: star.duration,
              animationDelay: star.delay
            }}
          />
        ))}

        {/* Top Half: Title */}
        <div className="h-1/2 flex flex-col items-center justify-center pt-10 space-y-4 md:space-y-6">
          <h2 
            className="tracking-[0.3em] uppercase text-purple-200/80 font-semibold text-center drop-shadow-md z-20 px-4"
            style={{ fontSize: "clamp(0.6rem, 1.2vw, 1.25rem)" }}
          >
            RIT and CSBS Department proudly presents
          </h2>
          <h1 
            className="tracking-widest text-white/90 z-20"
            style={{ 
              fontFamily: "'Climate Crisis', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 7rem)" 
            }}
          >
            GAMEATHON
          </h1>
          
          {/* Liquid Glass CTA Button */}
          <button 
            className="mt-6 px-8 py-3 md:px-12 md:py-4 rounded-full pointer-events-auto relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(216,180,254,0.4)] border border-white/20 bg-white/5 backdrop-blur-md z-30"
            onClick={() => setShowRegisterPage(true)}
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative z-10 text-white font-bold tracking-[0.2em] uppercase text-xs md:text-sm drop-shadow-md">
              Register Now
            </span>
          </button>
        </div>

        {/* Bottom Half: The Box */}
        <div className="h-1/2 w-full flex justify-center px-4 md:px-12 pb-0">
          {/* Main Box Wrapper */}
          <div className="w-full max-w-6xl h-full relative">
            
            {/* Background & Borders Layer */}
            <div 
              className="absolute inset-0 rounded-t-[2.5rem] border-t-[1.5px] border-l border-r border-purple-500/30 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(20,5,35,0.7) 0%, rgba(5,0,10,0.95) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 -20px 60px -15px rgba(216, 180, 254, 0.15)'
              }}
            >
              {/* Dotted pattern overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  backgroundPosition: 'center 16px'
                }}
              />
            </div>

            {/* Abstract Graphic Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[18rem] md:w-[26rem] lg:w-[34rem] xl:w-[40rem] h-full flex justify-center items-start opacity-60 pointer-events-none mix-blend-screen">
              <img 
                src="https://i.postimg.cc/kGvhPhR7/download-(3).png" 
                alt="Abstract Graphic" 
                className="w-full h-auto object-contain object-top drop-shadow-[0_0_15px_rgba(216,180,254,0.3)] -translate-y-[15%] -translate-x-[30%]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 30%, transparent 80%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 80%)'
                }}
              />
            </div>

            {/* Silver Knight Character */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14rem] md:w-[20rem] lg:w-[26rem] xl:w-[30rem] h-full flex justify-center items-start opacity-95">
              <img 
                src="https://i.postimg.cc/tgcZRqGg/Silver-Knight.png" 
                alt="Silver Knight" 
                className="w-full h-auto object-contain object-top drop-shadow-[0_0_15px_rgba(216,180,254,0.3)] -translate-y-[18%] translate-x-[20%]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)'
                }}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
