import React, { useState } from 'react';

interface CallUIProps {
  isCalling: boolean;
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  error: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

export const CallUI: React.FC<CallUIProps> = ({
  isCalling,
  isInCall,
  callType,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  error,
  isMuted,
  isVideoOff
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isCalling && !isInCall) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'var(--card-bg, #1a1a1a)',
      padding: isMinimized ? '8px' : '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      maxWidth: '450px',
      width: '90%',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMinimized ? '0' : '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isInCall ? '#22c55e' : '#fbbf24',
            animation: isInCall ? 'none' : 'pulse 1.5s infinite'
          }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            {callType === 'audio' ? '📞 Audio Call' : '📹 Video Call'}
          </h3>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px'
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Status */}
          <div style={{
            textAlign: 'center',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#888'
          }}>
            <p style={{ margin: 0 }}>
              {isInCall ? '✓ Connected' : '⏳ Calling...'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              color: '#ff4d4f',
              marginBottom: '12px',
              padding: '8px',
              background: 'rgba(255, 77, 79, 0.1)',
              borderRadius: '4px',
              fontSize: '12px',
              border: '1px solid rgba(255, 77, 79, 0.3)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Video Display */}
          {callType === 'video' && (
            <div style={{
              position: 'relative',
              marginBottom: '12px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#000',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isInCall ? 'block' : 'none'
                }}
              />

              {/* Placeholder when no remote video */}
              {!isInCall && (
                <div style={{
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📹</div>
                  <div style={{ fontSize: '12px' }}>Waiting for response...</div>
                </div>
              )}

              {/* Local Video (Picture-in-Picture) */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  width: '100px',
                  height: '75px',
                  borderRadius: '4px',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* Audio Call Indicator */}
          {callType === 'audio' && (
            <div style={{
              textAlign: 'center',
              marginBottom: '12px',
              padding: '16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎤</div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {isInCall ? 'Audio connected' : 'Connecting audio...'}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: callType === 'video' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: isMuted ? '#ff4d4f' : 'rgba(255,255,255,0.1)',
                color: isMuted ? '#fff' : 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                if (!isMuted) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMuted) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
              <span>{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            {/* Video Toggle Button */}
            {callType === 'video' && (
              <button
                onClick={onToggleVideo}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isVideoOff ? '#ff4d4f' : 'rgba(255,255,255,0.1)',
                  color: isVideoOff ? '#fff' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isVideoOff) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVideoOff) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                <span>{isVideoOff ? '📹' : '📷'}</span>
                <span>{isVideoOff ? 'Off' : 'Video'}</span>
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#ff4d4f',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                gridColumn: callType === 'video' ? 'auto' : 'span 1'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#ff7875';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#ff4d4f';
              }}
            >
              <span>☎️</span>
              <span>End</span>
            </button>
          </div>

          {/* Call Duration (if in call) */}
          {isInCall && (
            <div style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#666'
            }}>
              ✓ Call connected
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
