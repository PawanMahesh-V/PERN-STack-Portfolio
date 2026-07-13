import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    // Lock the height on mount so mobile address bar changes don't cause vertical jumps
    if (typeof window !== 'undefined') {
      setViewportHeight(`${window.innerHeight}px`);
    }

    // Let the animation play for 2.8 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Allow fade out to finish before unmounting
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: viewportHeight, /* Locked height prevents jumping */
            backgroundColor: '#09090b', /* Match the dark theme base */
            zIndex: 99999,
            overflow: 'hidden'
          }}
        >
          <svg viewBox="0 0 800 300" style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '100%', 
            maxWidth: '600px', 
            height: 'auto', 
            overflow: 'visible' 
          }}>
            <g transform="translate(400, 150)">
              <motion.text
                x="0"
                y="0"
                style={{ textAnchor: 'middle', dominantBaseline: 'central' }}
                /* Using only pre-installed system cursive fonts guarantees ZERO network delay */
                fontFamily="'Brush Script MT', 'Apple Chancery', 'Snell Roundhand', cursive"
                fontSize="180"
                fontWeight="300"
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ strokeDasharray: 2500, strokeDashoffset: 2500, fill: "rgba(255,255,255,0)" }}
                animate={{ strokeDashoffset: 0, fill: "rgba(255,255,255,1)" }}
                transition={{ 
                  strokeDashoffset: { duration: 2.5, ease: "linear", delay: 0.1 },
                  fill: { duration: 0.8, ease: "easeIn", delay: 1.8 }
                }}
              >
                hello
              </motion.text>
            </g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
