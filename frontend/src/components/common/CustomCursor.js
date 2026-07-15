import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Mouse coordinate tracking values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for smooth trailing ring
  const ringX = useSpring(mouseX, { stiffness: 450, damping: 28, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 450, damping: 28, mass: 0.5 });

  // Instant dot coordinates
  const dotX = useSpring(mouseX, { stiffness: 1200, damping: 40 });
  const dotY = useSpring(mouseY, { stiffness: 1200, damping: 40 });

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
      const target = e.target.closest('button, a, [role="button"], input, .epic-card, .cursor-interact');
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

  // Hide on touch devices
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
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 99999,
        }}
        animate={{
          width: isHovered ? (hoverText ? 84 : 54) : 32,
          height: isHovered ? (hoverText ? 84 : 54) : 32,
          backgroundColor: isHovered ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
          borderColor: isHovered ? '#00f2fe' : 'rgba(255, 255, 255, 0.45)',
          borderWidth: isHovered ? '2px' : '1.5px',
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="custom-cursor-ring"
      >
        {hoverText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#00f2fe',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
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
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 100000,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: isHovered ? '#00f2fe' : '#ffffff',
          boxShadow: isHovered ? '0 0 12px #00f2fe' : '0 0 6px rgba(255, 255, 255, 0.8)',
        }}
        animate={{
          scale: isHovered ? 0 : 1, // Hide inner dot inside large hover bubble
          opacity: isHovered ? 0 : 1
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};

export default CustomCursor;
