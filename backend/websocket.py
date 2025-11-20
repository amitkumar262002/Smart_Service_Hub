from flask_socketio import SocketIO, join_room, leave_room, emit, rooms
from flask import request
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_socketio(socketio):
    """Initialize WebSocket event handlers for WebRTC signaling"""
    active_users = {}  # user_id: sid mapping
    active_calls = {}  # booking_id: [user_ids]

    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        logger.info(f"Client connected: {request.sid}")
        emit('connection_response', {'data': 'Connected to WebSocket server'})

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        user_id = next((u for u, sid in active_users.items() if sid == request.sid), None)
        if user_id:
            del active_users[user_id]
            logger.info(f"User {user_id} disconnected")
            
            # Notify other users in the same booking
            for booking_id, users in list(active_calls.items()):
                if user_id in users:
                    users.remove(user_id)
                    emit('user-disconnected', {'user_id': user_id}, room=booking_id, broadcast=True)
                    if not users:
                        del active_calls[booking_id]

    @socketio.on('join')
    def on_join(data):
        """Handle user joining a booking room"""
        user_id = data.get('user_id')
        booking_id = data.get('booking_id')
        
        if not user_id or not booking_id:
            logger.warning(f"Invalid join request: user_id={user_id}, booking_id={booking_id}")
            return {'error': 'Missing user_id or booking_id'}, 400

        try:
            # Store user's socket ID
            active_users[user_id] = request.sid
            
            # Join booking room
            join_room(booking_id)
            
            # Track active calls
            if booking_id not in active_calls:
                active_calls[booking_id] = []
            if user_id not in active_calls[booking_id]:
                active_calls[booking_id].append(user_id)
            
            logger.info(f"User {user_id} joined booking {booking_id}")
            
            # Notify others in the room
            emit('user-joined', {
                'user_id': user_id,
                'users_in_call': active_calls[booking_id]
            }, room=booking_id, broadcast=True)
            
            return {'status': 'success', 'user_id': user_id}
        except Exception as e:
            logger.error(f"Error in on_join: {str(e)}")
            return {'error': str(e)}, 500

    @socketio.on('signal')
    def handle_signal(data):
        """Handle WebRTC signaling messages (offer, answer, ice-candidate)"""
        target_user = data.get('to')
        sender = data.get('from')
        signal_type = data.get('type')
        
        if not all([target_user, sender, signal_type]):
            logger.warning(f"Invalid signal: missing fields")
            return {'error': 'Missing required fields'}, 400

        try:
            logger.debug(f"Signal from {sender} to {target_user}: {signal_type}")
            
            # Forward the signal to the target user
            emit('signal', {
                'from': sender,
                'to': target_user,
                'type': signal_type,
                'data': data.get('data')
            }, room=target_user)
            
            return {'status': 'signal_sent'}
        except Exception as e:
            logger.error(f"Error handling signal: {str(e)}")
            return {'error': str(e)}, 500

    @socketio.on('end-call')
    def handle_end_call(data):
        """Handle call termination"""
        target_user = data.get('to')
        sender = data.get('from')
        
        if not all([target_user, sender]):
            logger.warning(f"Invalid end-call: missing fields")
            return {'error': 'Missing required fields'}, 400

        try:
            logger.info(f"End call from {sender} to {target_user}")
            
            # Notify the other user that the call has ended
            emit('call-ended', {
                'from': sender
            }, room=target_user)
            
            return {'status': 'call_ended'}
        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            return {'error': str(e)}, 500

    @socketio.on('call-rejected')
    def handle_call_rejected(data):
        """Handle call rejection"""
        target_user = data.get('to')
        sender = data.get('from')
        reason = data.get('reason', 'Call rejected')
        
        try:
            logger.info(f"Call rejected from {sender} to {target_user}: {reason}")
            
            emit('call-rejected', {
                'from': sender,
                'reason': reason
            }, room=target_user)
            
            return {'status': 'call_rejected'}
        except Exception as e:
            logger.error(f"Error rejecting call: {str(e)}")
            return {'error': str(e)}, 500

    @socketio.on('call-accepted')
    def handle_call_accepted(data):
        """Handle call acceptance"""
        target_user = data.get('to')
        sender = data.get('from')
        
        try:
            logger.info(f"Call accepted from {sender} to {target_user}")
            
            emit('call-accepted', {
                'from': sender
            }, room=target_user)
            
            return {'status': 'call_accepted'}
        except Exception as e:
            logger.error(f"Error accepting call: {str(e)}")
            return {'error': str(e)}, 500

    @socketio.on_error_default
    def default_error_handler(e):
        """Handle any unhandled errors"""
        logger.error(f"WebSocket error: {str(e)}")
        return {'error': 'Internal server error'}, 500

    return socketio
