import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'framer-motion';
import heroVideo from './assets/hero_video.mp4';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

// ==========================================
// COMPONENTS
// ==========================================

const GlobalThemeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Climate+Crisis&display=swap');
    @keyframes liquid-shine {
      0% { transform: translateX(-150%) skewX(-45deg); }
      100% { transform: translateX(200%) skewX(-45deg); }
    }
    .animate-liquid-shine {
      animation: liquid-shine 2.5s infinite linear;
    }
    .font-climate { 
      font-family: 'Climate Crisis', sans-serif; 
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(168, 85, 247, 0.15);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
  `}</style>
);

const LiquidGlassButton = ({ onClick, children, className = "", innerClassName = "" }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] group cursor-target transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]",
      className
    )}
  >
    {/* Glowing gradient border effect */}
    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-fuchsia-500/50 to-purple-500/50 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
    <span className="absolute inset-0 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c084fc_0%,#a855f7_50%,#c084fc_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

    {/* Inner glass pill */}
    <span className={cn(
      "relative h-full w-full rounded-full bg-[#07040f]/80 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-[#07040f]/40 transition-colors duration-300 overflow-hidden",
      innerClassName
    )}>
      {/* Liquid shine sweeping across */}
      <span className="absolute top-0 -left-[150%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-45deg] animate-liquid-shine pointer-events-none" />
      <span className="relative z-10 text-white font-semibold tracking-widest">{children}</span>
    </span>
  </button>
);

const FloatingStars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      xStart: Math.random() * 100,
      yStart: Math.random() * 100,
      xEnd: Math.random() * 100,
      yEnd: Math.random() * 100,
      duration: 30 + Math.random() * 40,
      size: 20 + Math.random() * 40,
      delay: Math.random() * -30,
      rotateDirection: Math.random() > 0.5 ? 360 : -360
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {stars.map((star) => (
        <motion.img
          key={star.id}
          src="https://i.postimg.cc/yYNDR31M/star.png"
          alt=""
          className="absolute opacity-20 mix-blend-screen"
          style={{ width: star.size, height: star.size }}
          animate={{
            left: [`${star.xStart}vw`, `${star.xEnd}vw`, `${star.xStart}vw`],
            top: [`${star.yStart}vh`, `${star.yEnd}vh`, `${star.yStart}vh`],
            rotate: [0, star.rotateDirection]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear",
            delay: star.delay
          }}
        />
      ))}
    </div>
  );
};

const TextPressure = ({
  text = 'Compressa',
  fontFamily = 'Compressa VF',
  fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = '',
  minFontSize = 16,
}) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>
    );
  }, [fontFamily, fontUrl, textColor, strokeColor, strokeWidth]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent cursor-target">
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${className} ${flex ? 'flex justify-between' : ''} ${stroke ? 'stroke' : ''
          } uppercase text-center`}
        style={{
          fontFamily,
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          fontWeight: 100,
          color: stroke ? undefined : textColor,
        }}
      >
        {chars.map((char, i) => (
          <span key={i} ref={(el) => (spansRef.current[i] = el)} data-char={char} className="inline-block">
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

const ScrollFloatChar = ({ char, progress, index }) => {
  const stagger = 0.02;
  const start = Math.min(index * stagger, 0.8);
  const end = Math.min(start + 0.2, 1);

  const y = useTransform(progress, [start, end], ["120%", "0%"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scaleY = useTransform(progress, [start, end], [2.3, 1]);
  const scaleX = useTransform(progress, [start, end], [0.7, 1]);

  return (
    <motion.span
      style={{
        y,
        opacity,
        scaleX,
        scaleY,
        display: 'inline-block',
        transformOrigin: '50% 0%',
        willChange: 'opacity, transform'
      }}
      className="cursor-target"
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
};

const ScrollFloat = ({
  children,
  containerClassName = '',
  textClassName = '',
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'end 40%']
  });

  const chars = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('');
  }, [children]);

  return (
    <h2 ref={containerRef} className={`my-2 md:my-5 overflow-hidden ${containerClassName}`}>
      <span className={`inline-block text-[clamp(2.2rem,8vw,7rem)] tracking-tight leading-[1.1] ${textClassName}`}>
        {chars.map((char, index) => (
          <ScrollFloatChar
            key={index}
            char={char}
            progress={scrollYProgress}
            index={index}
          />
        ))}
      </span>
    </h2>
  );
};

const ScrollReveal = ({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
}) => {
  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <motion.span
          className="inline-block word"
          key={index}
          variants={{
            hidden: { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : 'none' },
            visible: { opacity: 1, filter: enableBlur ? 'blur(0px)' : 'none' }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      );
    });
  }, [children, baseOpacity, enableBlur, blurStrength]);

  return (
    <div className={`my-5 ${containerClassName}`}>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-10%" }}
        transition={{ staggerChildren: 0.02 }}
        className={`text-[clamp(1.2rem,3.5vw,3.5rem)] leading-[1.4] font-light tracking-wide ${textClassName}`}
      >
        {splitText}
      </motion.p>
    </div>
  );
};

const ScrollVelocity = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}) => {
  function VelocityText({
    children,
    baseVelocity = velocity,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle,
  }) {
    const baseX = useMotionValue(0);
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 400,
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      velocityMapping?.input || [0, 1000],
      velocityMapping?.output || [0, 5],
      { clamp: false }
    );

    const copyRef = useRef(null);
    const copyWidth = useElementWidth(copyRef);

    function wrap(min, max, v) {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, (v) => {
      if (copyWidth === 0) return '0px';
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef(1);
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    const spans = [];
    for (let i = 0; i < (numCopies ?? 1); i++) {
      spans.push(
        <span className={`flex-shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
          {children}&nbsp;
        </span>
      );
    }

    return (
      <div className={`${parallaxClassName} relative overflow-hidden`} style={parallaxStyle}>
        <motion.div
          className={`${scrollerClassName} flex whitespace-nowrap text-center text-[3rem] md:text-[5rem] tracking-[-0.02em] drop-shadow md:leading-[5rem]`}
          style={{ x, ...scrollerStyle }}
        >
          {spans}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </div>
  );
};

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = (text) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    }
    return Array.from(text);
  };

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex];
    if (splitBy === 'characters') {
      const words = currentText.split(' ');
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    if (splitBy === 'words') {
      return currentText.split(' ').map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1,
      }));
    }
    if (splitBy === 'lines') {
      return currentText.split('\n').map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1,
      }));
    }

    return currentText.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1,
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      const total = totalChars;
      if (staggerFrom === 'first') return index * staggerDuration;
      if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
      if (staggerFrom === 'center') {
        const center = Math.floor(total / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      if (staggerFrom === 'random') {
        const randomIndex = Math.floor(Math.random() * total);
        return Math.abs(randomIndex - index) * staggerDuration;
      }
      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [staggerFrom, staggerDuration]
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex);
      if (onNext) onNext(newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const prevIndex = currentTextIndex === 0 ? (loop ? 0 : currentTextIndex) : currentTextIndex - 1;
    if (prevIndex !== currentTextIndex) {
      handleIndexChange(prevIndex);
    }
  }, [currentTextIndex, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts.length, currentTextIndex, handleIndexChange]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset,
    }),
    [next, previous, jumpTo, reset]
  );

  useEffect(() => {
    if (!auto) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto]);

  return (
    <motion.span
      className={cn('flex flex-wrap whitespace-pre-wrap relative', mainClassName)}
      {...rest}
    >
      <span className="sr-only">{texts[currentTextIndex]}</span>
      {/* KEY FIX: Set mode to "wait" and removed layout prop from child to prevent layout anomalies */}
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={cn(splitBy === 'lines' ? 'flex flex-col w-full' : 'flex flex-wrap whitespace-pre-wrap relative')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0);
            return (
              <span key={wordIndex} className={cn('inline-flex', splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        array.reduce((sum, word) => sum + word.characters.length, 0)
                      ),
                    }}
                    className={cn('inline-block', elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = 'RotatingText';

const KnightParallax = () => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create 3D tilt effects
  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  // Create parallax shifting
  const abstractX = useTransform(x, [-300, 300], [-20, 20]);
  const abstractY = useTransform(y, [-300, 300], [-20, 20]);
  const knightX = useTransform(x, [-300, 300], [-50, 50]);
  const knightY = useTransform(y, [-300, 300], [-50, 50]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="py-16 md:py-32 w-full flex items-center justify-center overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col md:flex-row items-center gap-8 md:gap-16">

        {/* Left Text Context */}
        <div className="flex-1 space-y-6 md:space-y-8 z-10 text-center md:text-left mt-8 md:mt-0 order-2 md:order-1">
          <h2 className="text-[2.5rem] md:text-[5rem] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Master<br />The Board
          </h2>
          <p className="text-lg md:text-2xl font-light text-purple-200/70 max-w-lg mx-auto md:mx-0">
            Unleash algorithmic precision. Craft intelligent agents, solve complex spatial puzzles, and redefine the mechanics of play.
          </p>
          <div className="h-px w-full bg-gradient-to-r from-purple-500/30 to-transparent my-6 md:my-8" />
        </div>

        {/* Right 3D Parallax Scene */}
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1200 }}
          className="flex-1 h-[40vh] md:h-[60vh] w-full relative flex items-center justify-center cursor-target order-1 md:order-2"
        >
          <motion.div
            style={{ rotateX, rotateY }}
            className="relative w-full h-full flex items-center justify-center preserve-3d"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Background glowing abstract */}
            <motion.img
              src="https://i.postimg.cc/kGvhPhR7/download-(3).png"
              style={{ x: abstractX, y: abstractY, translateZ: -50 }}
              className="absolute w-[90%] md:w-[90%] object-contain opacity-50 mix-blend-screen pointer-events-none filter blur-[2px] hue-rotate-[280deg]"
              alt=""
            />
            {/* Foreground Knight */}
            <motion.img
              src="https://i.postimg.cc/tgcZRqGg/Silver-Knight.png"
              style={{ x: knightX, y: knightY, translateZ: 100 }}
              className="relative z-10 w-[70%] md:w-[70%] object-contain drop-shadow-[0_20px_50px_rgba(168,85,247,0.25)] pointer-events-none"
              alt="Silver Knight"
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-purple-500/20 cursor-target">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-6 md:py-8 flex justify-between items-center group"
      >
        <span className="text-xl md:text-3xl font-light tracking-wide group-hover:text-purple-300 text-purple-200/70 transition-colors uppercase pr-4">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-2xl md:text-3xl font-light text-purple-500/50 group-hover:text-purple-300"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-6 md:pb-8 text-base md:text-lg text-purple-200/50 leading-relaxed max-w-4xl font-light">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ==========================================
// MAIN REGISTER PAGE COMPONENT
// ==========================================

export function RegisterPage() {
  // Setup Lenis Smooth Scroll via dynamic script injection
  useEffect(() => {
    let lenisInstance = null;
    let rafId = null;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lenis@1.1.9/dist/lenis.min.js';
    script.async = true;
    script.onload = () => {
      lenisInstance = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time) {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    };
    document.body.appendChild(script);

    return () => {
      if (lenisInstance) lenisInstance.destroy();
      if (rafId) cancelAnimationFrame(rafId);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-[#07040f] text-zinc-100 min-h-screen font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden relative">

      {/* Global Theme Overrides */}
      <GlobalThemeStyles />

      {/* Subtle Purple Ambient Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none z-0 hidden md:block" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-900/10 blur-[150px] pointer-events-none z-0 hidden md:block" />

      {/* Background Particle Stars */}
      <FloatingStars />
      {/* Hero Section with Chess Video */}
      <section className="min-h-[100svh] min-h-screen flex flex-col items-center justify-center px-4 relative mb-16 md:mb-32 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-[#07040f]/70 z-10 mix-blend-multiply" /> {/* Dark purple overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07040f] z-10" /> {/* Fade to bottom */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50 blur-sm"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>


        {/* Mobile Animated Hero Text */}
        <div className="md:hidden w-full relative z-10 mt-12 flex items-center justify-center overflow-hidden px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 }
              }
            }}
            // Changed to justify-center, smaller 8.5vw for the wide font, and added whitespace-nowrap
            className="flex justify-center whitespace-nowrap text-[8.5vw] sm:text-[9.5vw] font-climate text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] tracking-tighter"
          >
            {"GAMEATHON".split('').map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: '50%', scale: 0.8, rotateX: 90 },
                  visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", damping: 15, stiffness: 200 } }
                }}
                style={{ transformOrigin: 'bottom' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Desktop Text Pressure */}
        <div className="hidden md:block h-[40vh] w-full max-w-7xl relative z-10 mt-16">
          <TextPressure
            text="GAMEATHON"
            flex={true}
            alpha={true}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#FFFFFF"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center mt-8 md:mt-12 cursor-target">
          <LiquidGlassButton
            onClick={() => document.getElementById('register').scrollIntoView({ behavior: 'smooth' })}
            innerClassName="px-8 md:px-12 py-4 md:py-5 text-xs md:text-sm"
          >
            REGISTER NOW
          </LiquidGlassButton>
        </div>

        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 text-center text-purple-200/60 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-medium cursor-target w-[90%] md:w-full z-10">
          <p className="mb-2">Rajalakshmi Institute of Technology</p>
          <p>National-Level Algorithm-Based Challenge</p>
        </div>
      </section>

      {/* Intro Reveal with Rotating Text */}
      <section className="py-16 md:py-32 px-4 md:px-6 max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
        <ScrollReveal baseOpacity={0} blurStrength={10} textClassName="text-zinc-300">
          A 24-hour innovation challenge exploring the intersection of Artificial Intelligence, algorithm-based game development, and strategic problem solving.
        </ScrollReveal>

        <div className="mt-12 md:mt-24 text-2xl md:text-5xl font-light text-purple-200/50 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          <span>Building</span>
          <div className="w-full max-w-[160px] md:max-w-[280px] flex justify-start relative min-h-[1.5em]">
            {/* KEY FIX: Set mode to wait so words swap smoothly without fighting for space */}
            <RotatingText
              texts={['AI Bots ✦', 'Algorithms ✦', 'VR/AR ✦', 'Puzzles ✦']}
              mainClassName="font-medium text-purple-300"
              staggerDuration={0.03}
              splitBy="characters"
              animatePresenceMode="wait"
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          </div>
        </div>
      </section>

      {/* Innovative 3D Parallax Image Section */}
      <KnightParallax />

      {/* Velocity Marquee Transition */}
      <section className="py-16 md:py-32 overflow-hidden opacity-80 md:opacity-20 hover:opacity-100 transition-opacity duration-700 select-none relative z-10">
        <ScrollVelocity
          texts={['GAMEATHON 2026', 'RIT CSBS']}
          velocity={40}
          className="text-purple-400 font-light"
        />
      </section>

      {/* Floating Highlights - Challenge Tracks */}
      <section className="py-16 md:py-32 relative z-10">
        <div className="px-4 md:px-6 mb-16 md:mb-32 text-[10px] md:text-xs uppercase tracking-[0.3em] text-purple-500/60 font-semibold text-center max-w-6xl mx-auto w-full">
          Challenge Tracks
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16 md:space-y-48">
          <ScrollFloat
            animationDuration={1.4}
            stagger={0.04}
            containerClassName="text-left"
            textClassName="text-white font-medium"
          >
            1. Chess Bots.
          </ScrollFloat>
          <ScrollFloat
            animationDuration={1.4}
            stagger={0.04}
            containerClassName="text-left md:text-center"
            textClassName="text-purple-200/70 font-medium"
          >
            2. Puzzle Solvers.
          </ScrollFloat>
          <ScrollFloat
            animationDuration={1.4}
            stagger={0.04}
            containerClassName="text-left md:text-right"
            textClassName="text-purple-300/50 font-medium"
          >
            3. Retro Games.
          </ScrollFloat>
          <ScrollFloat
            animationDuration={1.4}
            stagger={0.04}
            containerClassName="text-left md:text-center"
            textClassName="text-purple-400/40 font-medium"
          >
            4. VR/AR Games.
          </ScrollFloat>
          <ScrollFloat
            animationDuration={1.4}
            stagger={0.04}
            containerClassName="text-left"
            textClassName="text-purple-500/30 font-medium"
          >
            5. Open Innovation.
          </ScrollFloat>
        </div>
      </section>

      {/* Rules and Regulations */}
      <section className="py-16 md:py-32 px-4 md:px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-12 md:mb-16 text-[10px] md:text-xs uppercase tracking-[0.3em] text-purple-500/60 font-semibold text-center w-full">
          Rulebook
        </div>
        <div className="w-full border-t border-purple-500/20">
          <AccordionItem title="1. Team Formation & Eligibility" defaultOpen={true}>
            <ul className="list-disc pl-6 space-y-3">
              <li>Each team must consist of a minimum of 2 and a maximum of 4 members.</li>
              <li>Teams may include members from different departments as well as from different colleges.</li>
              <li>Participants are not allowed to be part of more than one team.</li>
              <li>Students from any recognized college or university are eligible to participate.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="2. Project Development Guidelines">
            <ul className="list-disc pl-6 space-y-3">
              <li>The project must be developed exclusively during the innovation challenge timeline only.</li>
              <li>Pre-built projects or previously developed codebases are not allowed, except for open-source libraries, API keys, or pretrained models.</li>
              <li>The use of AI tools is permitted; however, all submissions must be original and free from plagiarism.</li>
              <li>All games must be based on algorithmic concepts or incorporate AI-driven learning or advancements to enhance gameplay.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="3. Tools & Resources">
            <ul className="list-disc pl-6 space-y-3">
              <li>There are no restrictions on the technology stack. Participants are free to use any suitable technology.</li>
              <li>Game Engines: Unity, Unreal Engine, Godot are permitted.</li>
              <li>Languages/Frameworks: Python, Java, C/C++, JavaScript, C#, React, Flutter, Node.js, etc.</li>
              <li>Participants must bring their own laptop, chargers, accessories, and at least one extension box per team.</li>
              <li>The organizers will provide internet, workspace, event support, and mentorship.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="4. Judging Criteria">
            <ul className="list-disc pl-6 space-y-3">
              <li>Innovation and Creativity</li>
              <li>Algorithmic Implementation</li>
              <li>Technical Complexity</li>
              <li>Gameplay and User Experience</li>
              <li>Problem-Solving Approach</li>
              <li>Presentation and Demonstration</li>
            </ul>
          </AccordionItem>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-12 md:mb-16 text-[10px] md:text-xs uppercase tracking-[0.3em] text-purple-500/60 font-semibold text-center w-full">
          FAQs
        </div>
        <div className="w-full border-t border-purple-500/20">
          <AccordionItem title="Who can participate in Gameathon?">
            Students from any recognized college or university are eligible to participate in the Gameathon challenge. School students (Class 6-12) and college students can participate in the standalone Chess Tournament and Revo Racers Esports event.
          </AccordionItem>
          <AccordionItem title="What is the registration fee?">
            The entry fee is ₹300 per team for the 24-hour Gameathon Development challenge, and ₹200 for individuals participating in the Chess Tournament. Check the respective registration pages for Revo Racers entry details.
          </AccordionItem>
          <AccordionItem title="Can we use AI tools like ChatGPT or GitHub Copilot?">
            Yes, the use of AI tools is permitted to assist you during development. However, your core logic and submission must be original, and plagiarism of existing complete projects will result in disqualification.
          </AccordionItem>
          <AccordionItem title="What is the total prize pool?">
            The Gameathon hackathon features a prize pool of ₹20,000 distributed among the top winners, while the new Revo Racers Esport tournament boasts an independent massive prize pool of ₹25,000!
          </AccordionItem>
        </div>
      </section>

      {/* Split Registration Section */}
      <section id="register" className="py-24 md:py-48 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h3 className="text-[2.5rem] md:text-[5rem] font-black mb-4 md:mb-6 uppercase tracking-tighter leading-none">Choose Your Arena</h3>
          <p className="text-purple-200/50 text-base md:text-xl font-light tracking-wide max-w-2xl mx-auto">Select your path. Compete in the 24-hour algorithmic sprint, prove your mastery on the chess board, or race to victory in the esports grand prix.</p>
        </div>

        {/* Changed grid columns from md:grid-cols-2 to lg:grid-cols-3 to fit the 3rd card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">

          {/* Card 1: Gameathon */}
          <div className="glass-panel p-6 md:p-10 lg:p-12 rounded-3xl cursor-target flex flex-col justify-between group hover:border-purple-400/30 transition-colors">
            <div>
              <div className="text-purple-400/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">College Students Only</div>
              <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">Gameathon Hackathon</h4>
              <p className="text-purple-200/60 font-light mb-6 md:mb-8 text-sm md:text-base">Build AI bots, puzzle solvers, retro remakes, or VR/AR games over an intense 24-hour development cycle.</p>

              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-purple-200/80 font-light mb-8 md:mb-12">
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Team Size: 2-4 Members</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> 24-Hour Offline Hackathon</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Access to Mentors & Workspace</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Entry Fee: ₹300 per Team</li>
              </ul>
            </div>

            <LiquidGlassButton
              onClick={() => window.open('https://forms.easebuzz.in/register/RAJALAKSHMIbw5w4/Gamethon_Hackathon_Reg', '_blank', 'noopener,noreferrer')}
              innerClassName="w-full py-4 md:py-5 text-xs md:text-sm"
            >
              REGISTER FOR GAMEATHON
            </LiquidGlassButton>
          </div>

          {/* Card 2: Chess Tournament School */}
          <div className="glass-panel p-6 md:p-10 lg:p-12 rounded-3xl cursor-target flex flex-col justify-between group hover:border-purple-400/30 transition-colors">
            <div>
              <div className="text-purple-400/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">School Students</div>
              <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">Chess Tournament-School</h4>
              <p className="text-purple-200/60 font-light mb-6 md:mb-8 text-sm md:text-base">Test your strategic thinking and analytical skills against top minds in our parallel offline chess tournament.</p>

              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-purple-200/80 font-light mb-8 md:mb-12">
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Individual Participation</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Open to Schools</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Offline Knockout/Swiss Format</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Entry Fee: Free</li>
              </ul>
            </div>

            <LiquidGlassButton
              onClick={() => window.open('https://forms.gle/viWNoWwzXUDdHsdK6', '_blank', 'noopener,noreferrer')}
              innerClassName="w-full py-4 md:py-5 text-xs md:text-sm bg-[#07040f]/20 border-purple-500/30"
            >
              REGISTER FOR CHESS ( School Students Only)
            </LiquidGlassButton>
          </div>

          {/* Card 3: Revo Racers Grand Prix */}
          <div className="glass-panel p-6 md:p-10 lg:p-12 rounded-3xl cursor-target flex flex-col justify-between group hover:border-purple-400/30 transition-colors relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-purple-400/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mt-1">Esports Tournament</div>
                <img src="https://i.imageupload.app/1b6477a510223d90c9a9.png" alt="Revolution Games" className="h-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">Revo Racers Grand Prix</h4>
              <p className="text-purple-200/60 font-light mb-6 md:mb-8 text-sm md:text-base">Race to glory in a 2-stage event! Conquer online parking simulation to qualify for the ultimate offline team formula racing finals.</p>

              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-purple-200/80 font-light mb-8 md:mb-12">
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Stage 1: Online Prelims (Apr 1-2)</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Stage 2: Offline Finals (Apr 9-10)</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Team vs Team Formula Racing</li>
                <li className="flex items-center"><span className="mr-3 text-fuchsia-400 font-medium">▹</span> Massive Prize Pool: ₹25,000</li>
              </ul>
            </div>

            <LiquidGlassButton
              onClick={() => window.open('https://organizer.revoracers.com/register-tournament/rit-gameathon', '_blank', 'noopener,noreferrer')}
              innerClassName="w-full py-4 md:py-5 text-xs md:text-sm bg-[#07040f]/20 border-fuchsia-500/30"
            >
              REGISTER FOR REVO RACERS
            </LiquidGlassButton>
          </div>

          <div className="glass-panel p-6 md:p-10 lg:p-12 rounded-3xl cursor-target flex flex-col justify-between group hover:border-purple-400/30 transition-colors">
            <div>
              <div className="text-purple-400/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">College Students</div>
              <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">Chess Tournament-College</h4>
              <p className="text-purple-200/60 font-light mb-6 md:mb-8 text-sm md:text-base">Test your strategic thinking and analytical skills against top minds in our parallel offline chess tournament.</p>

              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-purple-200/80 font-light mb-8 md:mb-12">
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Individual Participation</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Open to Colleges</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Offline Knockout/Swiss Format</li>
                <li className="flex items-center"><span className="mr-3 text-purple-400">▹</span> Entry Fee: ₹200 per Person</li>
              </ul>
            </div>

            <LiquidGlassButton
              onClick={() => window.open('https://forms.easebuzz.in/register/RAJALAKSHMIbw5w4/GAMETHON_CHESS_COMPETITION', '_blank', 'noopener,noreferrer')}
              innerClassName="w-full py-4 md:py-5 text-xs md:text-sm bg-[#07040f]/20 border-purple-500/30"
            >
              REGISTER FOR CHESS ( College Students Only)
            </LiquidGlassButton>
          </div>

        </div>
      </section>

      {/* Massive Typographic Footer - Fixed Layout */}
      <footer className="pt-16 md:pt-32 pb-8 relative z-10 overflow-hidden">
        {/* Massive Text Container - Edge to Edge */}
        <div className="w-full flex justify-center items-center pointer-events-none select-none overflow-hidden px-4">
          <h2 className="text-[11.5vw] md:text-[11vw] lg:text-[10.5vw] font-climate text-transparent bg-clip-text bg-gradient-to-b from-purple-100 to-[#07040f] leading-[0.8] tracking-tighter m-0 p-0 text-center whitespace-normal md:whitespace-nowrap drop-shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            GAMEATHON
          </h2>
        </div>

        {/* Copyright Layout - Flexed on Desktop, Stacked on Mobile */}
        <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left text-purple-300/40 text-[10px] md:text-xs tracking-[0.2em] uppercase border-t border-purple-500/10 pt-8 gap-4">
          <p>Organized by Dept. of CSBS</p>
          <p>© 2026 Rajalakshmi Institute of Technology</p>
        </div>
      </footer>

    </div>
  );
}

export default RegisterPage;