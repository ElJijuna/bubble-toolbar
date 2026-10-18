import React, { forwardRef, useState } from 'react';
import type { BubbleIconButtonProps } from '../types';

/**
 * Standard inline SVG icons for quick prototyping out-of-the-box
 */
const ICONS: Record<string, React.ReactNode> = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  theme: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  notifications: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  logo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export const BubbleIconButton = forwardRef<HTMLButtonElement, BubbleIconButtonProps>(
  (
    {
      name,
      icon,
      active = false,
      badge,
      tooltip,
      children,
      className = '',
      style,
      onMouseEnter,
      onMouseLeave,
      ariaLabel,
      ...rest
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const iconContent = icon || (name ? ICONS[name] : null) || children;
    const computedAriaLabel = ariaLabel || tooltip || (name ? `${name} button` : 'button');

    const buttonStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: 'none',
      background: active
        ? 'rgba(0, 0, 0, 0.08)'
        : isHovered
        ? 'rgba(0, 0, 0, 0.05)'
        : 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      padding: 0,
      margin: 0,
      outline: 'none',
      transition: 'background-color 0.15s ease, transform 0.15s ease',
      transform: isHovered ? 'scale(1.06)' : 'scale(1)',
      flexShrink: 0,
      ...style,
    };

    const badgeStyles: React.CSSProperties = {
      position: 'absolute',
      top: '4px',
      right: '4px',
      minWidth: '7px',
      height: '7px',
      padding: typeof badge === 'number' || typeof badge === 'string' ? '1px 3px' : 0,
      borderRadius: '9999px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      fontSize: '9px',
      fontWeight: 'bold',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.9)',
    };

    return (
      <button
        ref={ref}
        type="button"
        title={tooltip}
        aria-label={computedAriaLabel}
        className={`bubble-icon-button ${active ? 'bubble-icon-button--active' : ''} ${className}`.trim()}
        style={buttonStyles}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        {...rest}
      >
        {iconContent}
        {badge ? (
          <span className="bubble-icon-button__badge" style={badgeStyles}>
            {typeof badge !== 'boolean' ? badge : null}
          </span>
        ) : null}
      </button>
    );
  }
);

BubbleIconButton.displayName = 'BubbleIconButton';

