import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth trailing coordinates for the ring
  const ringX = useSpring(mouseX, { stiffness: 600, damping: 35, mass: 0.4 });
  const ringY = useSpring(mouseY, { stiffness: 600, damping: 35, mass: 0.4 });

  // Instant dot coordinates
  const dotX = useSpring(mouseX, { stiffness: 1500, damping: 45 });
  const dotY = useSpring(mouseY, { stiffness: 1500, damping: 45 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e) => {
      // Only expand for actual interactive targets: buttons, links, chips, explicit action triggers
      // Do NOT trigger on generic large card backgrounds
      const target = e.target.closest('button, a, [role="button"], input, select, .MuiChip-root, .cursor-interact');
      if (target) {
        setIsHovered(true);
        const customText = target.getAttribute('data-cursor-text');
        if (customText) {
          setHoverText(customText);
        } else {
          setHoverText('');
        }
      } else {
        setIsHovered(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  // Hide on touch devices or when not visible
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Spring Physics Ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: 'center center',
        }}
        animate={{
          width: isHovered ? (hoverText ? 'auto' : 48) : 32,
          minWidth: isHovered ? (hoverText ? 72 : 48) : 32,
          height: isHovered ? (hoverText ? 36 : 48) : 32,
          paddingLeft: isHovered && hoverText ? 14 : 0,
          paddingRight: isHovered && hoverText ? 14 : 0,
          backgroundColor: isHovered ? 'rgba(0, 242, 254, 0.18)' : 'transparent',
          borderColor: isHovered ? '#00f2fe' : 'rgba(255, 255, 255, 0.55)',
          borderWidth: isHovered ? '1.5px' : '1.5px',
          borderStyle: 'solid',
          borderRadius: 9999, // Perfectly round ring or pill, NEVER a square box
          x: '-50%',
          y: '-50%',
          boxShadow: isHovered ? '0 0 20px rgba(0, 242, 254, 0.45)' : 'none',
          backdropFilter: isHovered ? 'blur(4px)' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {hoverText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '0 0 8px rgba(0, 242, 254, 0.8)'
            }}
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>

      {/* Center Precision Dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          pointerEvents: 'none',
          zIndex: 1000000,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: isHovered ? '#00f2fe' : '#ffffff',
          boxShadow: isHovered ? '0 0 10px #00f2fe' : '0 0 6px rgba(255, 255, 255, 0.9)',
        }}
        animate={{
          x: '-50%',
          y: '-50%',
          scale: isHovered && hoverText ? 0 : (isHovered ? 1.4 : 1),
          opacity: isHovered && hoverText ? 0 : 1
        }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
};

export default CustomCursor;
