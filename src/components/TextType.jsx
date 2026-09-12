import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './TextType.css';

const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return undefined;
    gsap.set(cursorRef.current, { opacity: 1 });
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
    return () => tween.kill();
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return undefined;
    let timeout;
    const currentText = textArray[currentTextIndex] || '';
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

    const execute = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) return;
          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex(previous => (previous + 1) % textArray.length);
          setCurrentCharIndex(0);
        } else {
          timeout = window.setTimeout(() => setDisplayedText(previous => previous.slice(0, -1)), deletingSpeed);
        }
      } else if (currentCharIndex < processedText.length) {
        timeout = window.setTimeout(() => {
          setDisplayedText(previous => previous + processedText[currentCharIndex]);
          setCurrentCharIndex(previous => previous + 1);
        }, variableSpeed ? getRandomSpeed() : typingSpeed);
      } else if (loop || currentTextIndex < textArray.length - 1) {
        timeout = window.setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    };

    timeout = window.setTimeout(execute, currentCharIndex === 0 && !isDeleting && displayedText === '' ? initialDelay : 0);
    return () => window.clearTimeout(timeout);
  }, [currentCharIndex, currentTextIndex, deletingSpeed, displayedText, getRandomSpeed, initialDelay, isDeleting, isVisible, loop, onSentenceComplete, pauseDuration, reverseMode, textArray, typingSpeed, variableSpeed]);

  const currentText = textArray[currentTextIndex] || '';
  const shouldHideCursor = hideCursorWhileTyping && (currentCharIndex < currentText.length || isDeleting);
  const color = textColors.length ? textColors[currentTextIndex % textColors.length] : 'inherit';

  return createElement(
    Component,
    { ref: containerRef, className: `text-type ${className}`.trim(), ...props },
    <span className="text-type__content" style={{ color }}>{displayedText}</span>,
    showCursor && <span ref={cursorRef} className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`.trim()} aria-hidden="true">{cursorCharacter}</span>
  );
};

export default TextType;
