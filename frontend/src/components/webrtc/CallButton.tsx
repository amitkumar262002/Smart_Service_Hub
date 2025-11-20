import React from 'react';

interface CallButtonProps {
  type: 'audio' | 'video';
  onClick: (type: 'audio' | 'video') => void;
  disabled?: boolean;
  compact?: boolean;
}

export const CallButton: React.FC<CallButtonProps> = ({ 
  type, 
  onClick, 
  disabled = false,
  compact = false
}) => {
  const buttonProps = {
    audio: {
      icon: '📞',
      label: 'Audio Call',
      title: 'Start audio call'
    },
    video: {
      icon: '📹',
      label: 'Video Call',
      title: 'Start video call'
    }
  }[type];

  return (
    <button
      className="btn btn-sm"
      onClick={() => onClick(type)}
      disabled={disabled}
      title={buttonProps.title}
      style={{
        padding: compact ? '4px 8px' : '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: compact ? '12px' : '14px',
        fontWeight: 500,
        borderRadius: '6px',
        border: 'none',
        background: 'rgba(255,255,255,0.1)',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
        }
      }}
    >
      <span>{buttonProps.icon}</span>
      {!compact && <span>{buttonProps.label}</span>}
    </button>
  );
};
