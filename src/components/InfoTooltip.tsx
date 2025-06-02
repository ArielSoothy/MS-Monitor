import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './InfoTooltip.module.css';

interface InfoTooltipProps {
  content: string;
  title?: string;
  detailedContent?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  detailedContent,
  position = 'auto',
  trigger = 'hover',
  size = 'small',
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && position === 'auto' && iconRef.current && tooltipRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Calculate best position
      let newPosition = 'bottom';
      
      // Check if tooltip would overflow viewport
      if (iconRect.bottom + tooltipRect.height > viewport.height - 20) {
        newPosition = 'top';
      }
      if (iconRect.right + tooltipRect.width > viewport.width - 20) {
        newPosition = newPosition === 'top' ? 'top' : 'left';
      }
      if (iconRect.left - tooltipRect.width < 20) {
        newPosition = newPosition === 'top' ? 'top' : 'right';
      }

      setCalculatedPosition(newPosition as any);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    } else {
      // For hover trigger, also support click to toggle
      setIsVisible(!isVisible);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        iconRef.current && !iconRef.current.contains(e.target as Node)) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (trigger === 'click') {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [trigger]);

  const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;

  return (
    <div className={`${styles.tooltipContainer} ${className || ''}`}>
      <button
        ref={iconRef}
        className={`${styles.tooltipIcon} ${styles[size]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label="More information"
      >
        <HelpCircle size={iconSize} />
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[calculatedPosition]} ${styles[size]}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.tooltipContent}>
            {title && <div className={styles.tooltipTitle}>{title}</div>}
            <div className={styles.tooltipText}>{content}</div>
            {detailedContent && (
              <div className={styles.tooltipDetails}>{detailedContent}</div>
            )}
          </div>
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
