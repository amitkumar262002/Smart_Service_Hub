import React, { useState, useEffect } from 'react';
import { COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '../../styles/theme';

interface AdvancedCallUIProps {
  isCalling: boolean;
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleRecording?: () => void;
  onToggleScreenShare?: () => void;
  error: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isRecording?: boolean;
  isScreenSharing?: boolean;
  callDuration?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  participants?: number;
}

export const AdvancedCallUI: React.FC<AdvancedCallUIProps> = ({
  isCalling,
  isInCall,
  callType,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleRecording,
  onToggleScreenShare,
  error,
  isMuted,
  isVideoOff,
  isRecording = false,
  isScreenSharing = false,
  callDuration = 0,
  connectionQuality = 'excellent',
  participants = 1
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (!isCalling && !isInCall) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: RADIUS.xxl,
      boxShadow: SHADOWS.xxl,
      zIndex: 9999,
      maxWidth: isMinimized ? '60px' : '420px',
      width: '90%',
      border: `1px solid ${COLORS.primary}40`,
      transition: TRANSITIONS.base,
      overflow: 'hidden',
      color: '#f1f5f9'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottom: `1px solid ${COLORS.primary}20`,
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isInCall ? '#10b981' : '#f59e0b',
            animation: isInCall ? 'none' : 'pulse 1.5s infinite',
            boxShadow: `0 0 8px ${isInCall ? '#10b981' : '#f59e0b'}`
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
              {callType === 'audio' ? '📞 Audio' : '📹 Video'}
            </h3>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>
              {isInCall ? `Connected • ${formatDuration(callDuration)}` : 'Calling...'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            padding: SPACING.sm,
            borderRadius: RADIUS.md,
            transition: TRANSITIONS.fast,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Video Section */}
          {callType === 'video' && (
            <div style={{
              position: 'relative',
              background: '#0f172a',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Local Video (Picture in Picture) */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '80px',
                height: '60px',
                borderRadius: RADIUS.md,
                overflow: 'hidden',
                border: `2px solid ${COLORS.primary}`,
                boxShadow: SHADOWS.lg
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Connection Quality Badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: getConnectionColor(),
                color: '#fff',
                padding: `${SPACING.xs} ${SPACING.md}`,
                borderRadius: RADIUS.full,
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.xs,
                boxShadow: SHADOWS.md
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#fff',
                  animation: 'pulse 1s infinite'
                }} />
                {connectionQuality}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#dc262620',
              color: '#fca5a5',
              padding: SPACING.md,
              fontSize: '12px',
              borderTop: `1px solid #dc2626`,
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.sm
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Stats */}
          {showStats && isInCall && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: SPACING.md,
              fontSize: '11px',
              borderTop: `1px solid ${COLORS.primary}20`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: SPACING.sm
            }}>
              <div>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>Duration</div>
                <div style={{ fontWeight: 600 }}>{formatDuration(callDuration)}</div>
              </div>
              <div>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>Participants</div>
                <div style={{ fontWeight: 600 }}>{participants}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: SPACING.sm,
            padding: SPACING.md,
            background: 'rgba(0,0,0,0.2)',
            borderTop: `1px solid ${COLORS.primary}20`,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: RADIUS.full,
                border: 'none',
                background: isMuted ? '#dc2626' : '#667eea',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                transition: TRANSITIONS.fast,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: SHADOWS.md
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {/* Video Button */}
            {callType === 'video' && (
              <button
                onClick={onToggleVideo}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: RADIUS.full,
                  border: 'none',
                  background: isVideoOff ? '#dc2626' : '#667eea',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: TRANSITIONS.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: SHADOWS.md
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isVideoOff ? '📹' : '📷'}
              </button>
            )}

            {/* Recording Button */}
            {onToggleRecording && (
              <button
                onClick={onToggleRecording}
                title={isRecording ? 'Stop recording' : 'Start recording'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: RADIUS.full,
                  border: 'none',
                  background: isRecording ? '#dc2626' : '#667eea',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: TRANSITIONS.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: SHADOWS.md,
                  animation: isRecording ? 'pulse 1s infinite' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🔴
              </button>
            )}

            {/* Screen Share Button */}
            {onToggleScreenShare && (
              <button
                onClick={onToggleScreenShare}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: RADIUS.full,
                  border: 'none',
                  background: isScreenSharing ? '#10b981' : '#667eea',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: TRANSITIONS.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: SHADOWS.md
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🖥️
              </button>
            )}

            {/* Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              title="Show stats"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: RADIUS.full,
                border: 'none',
                background: showStats ? '#3b82f6' : '#667eea',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                transition: TRANSITIONS.fast,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: SHADOWS.md
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              📊
            </button>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              title="End call"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: RADIUS.full,
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                transition: TRANSITIONS.fast,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: SHADOWS.md
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ☎️
            </button>
          </div>
        </>
      )}
    </div>
  );
};
