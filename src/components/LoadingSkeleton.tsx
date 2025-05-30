import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'text';
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1, 
  height,
  width,
  className 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`${styles.skeletonCard} ${className || ''}`}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonCircle}></div>
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: '100%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '90%' }}></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`${styles.skeletonTable} ${className || ''}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonTableRow}>
                <div className={styles.skeletonCell} style={{ width: '25%' }}></div>
                <div className={styles.skeletonCell} style={{ width: '20%' }}></div>
                <div className={styles.skeletonCell} style={{ width: '30%' }}></div>
                <div className={styles.skeletonCell} style={{ width: '25%' }}></div>
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className={`${styles.skeletonChart} ${className || ''}`} style={{ height, width }}>
            <div className={styles.skeletonChartBars}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={styles.skeletonBar}
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                ></div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`${styles.skeletonText} ${className || ''}`} style={{ height, width }}>
            <div className={styles.skeletonLine}></div>
          </div>
        );

      default:
        return (
          <div 
            className={`${styles.skeletonBase} ${className || ''}`} 
            style={{ height, width }}
          ></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default React.memo(LoadingSkeleton);
