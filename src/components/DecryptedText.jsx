import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

const styles = {
  wrapper: { display: 'inline', whiteSpace: 'pre-wrap' },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0
  }
};

export default function DecryptedText({
  text = '',
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const availableChars = useMemo(() => {
    const chars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter(char => char !== ' ')
      : characters.split('');
    return chars.length ? chars : ['#'];
  }, [characters, text, useOriginalCharsOnly]);

  const shuffleText = useCallback(
    (revealed) => text.split('').map((char, index) => {
      if (/\s/.test(char) || revealed.has(index)) return char;
      return availableChars[Math.floor(Math.random() * availableChars.length)];
    }).join(''),
    [availableChars, text]
  );

  const revealOrder = useMemo(() => {
    const indices = Array.from({ length: text.length }, (_, index) => index)
      .filter(index => !/\s/.test(text[index]));
    if (revealDirection === 'end') return indices.reverse();
    if (revealDirection !== 'center') return indices;
    const middle = (indices.length - 1) / 2;
    return indices.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle));
  }, [revealDirection, text]);

  const triggerDecrypt = useCallback(() => {
    setRevealedIndices(new Set());
    setDisplayText(shuffleText(new Set()));
    setIsAnimating(true);
  }, [shuffleText]);

  useEffect(() => {
    if (!isAnimating) return undefined;
    let iteration = 0;

    intervalRef.current = window.setInterval(() => {
      iteration += 1;
      setRevealedIndices(previous => {
        const next = new Set(previous);

        if (sequential) {
          const amount = Math.max(1, Math.ceil(revealOrder.length / Math.max(1, maxIterations)));
          revealOrder.slice(previous.size, previous.size + amount).forEach(index => next.add(index));
        }

        if (iteration >= maxIterations) {
          window.clearInterval(intervalRef.current);
          setIsAnimating(false);
          setDisplayText(text);
          return new Set(revealOrder);
        }

        setDisplayText(shuffleText(next));
        return next;
      });
    }, speed);

    return () => window.clearInterval(intervalRef.current);
  }, [isAnimating, maxIterations, revealOrder, sequential, shuffleText, speed, text]);

  useEffect(() => {
    if (animateOn !== 'view') return undefined;
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        triggerDecrypt();
        setHasAnimated(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, triggerDecrypt]);

  const hoverProps = animateOn === 'hover'
    ? { onMouseEnter: triggerDecrypt }
    : {};

  return (
    <motion.span ref={containerRef} className={parentClassName} style={styles.wrapper} {...hoverProps} {...props}>
      <span style={styles.srOnly}>{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span key={`${index}-${char}`} className={revealedIndices.has(index) || !isAnimating ? className : encryptedClassName}>
            {char}
          </span>
        ))}
      </span>
    </motion.span>
  );
}
