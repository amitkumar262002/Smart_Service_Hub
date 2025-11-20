# Admin Routes - Owner Only Access
# This module handles all admin panel operations with strict owner-only access control

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import json
import os

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Owner email (must match Firebase owner account)
OWNER_EMAIL = "supermanverma@gmail.com"

def is_owner(email):
    """Check if user is the owner"""
    return email and email.lower() == OWNER_EMAIL.lower()

def require_owner(f):
    """Decorator to require owner access"""
    def require_owner_admin_wrapper(*args, **kwargs):
        email = request.headers.get('X-User-Email', '')
        if not is_owner(email):
            return jsonify({"error": "unauthorized", "message": "Only owner can access this"}), 403
        return f(*args, **kwargs)
    require_owner_admin_wrapper.__name__ = f.__name__ + '_admin_owner'
    return require_owner_admin_wrapper

# ============ STATS & METRICS ============

@admin_bp.route('/stats', methods=['GET'])
@require_owner
def get_stats():
    """Get comprehensive admin statistics"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    users = db.get('users', [])
    providers = db.get('providers', [])
    bookings = db.get('bookings', [])
    transactions = db.get('transactions', [])
    
    # Calculate stats
    total_users = len(users)
    active_users = len([u for u in users if u.get('status') == 'active'])
    
    total_providers = len(providers)
    active_providers = len([p for p in providers if p.get('status') == 'active'])
    
    total_bookings = len(bookings)
    completed_bookings = len([b for b in bookings if b.get('status') == 'completed'])
    
    total_revenue = sum([t.get('amount', 0) for t in transactions])
    total_transactions = len(transactions)
    avg_transaction = total_revenue / total_transactions if total_transactions > 0 else 0
    
    return jsonify({
        "stats": {
            "users": {
                "total": total_users,
                "active": active_users,
                "list": users[:10]  # Return first 10 for display
            },
            "providers": {
                "total": total_providers,
                "active": active_providers,
                "list": providers[:10]
            },
            "bookings": {
                "total": total_bookings,
                "completed": completed_bookings
            },
            "revenue": {
                "total": total_revenue,
                "transactions": total_transactions,
                "average_transaction": avg_transaction
            }
        }
    })

@admin_bp.route('/fraud-metrics', methods=['GET'])
@require_owner
def get_fraud_metrics():
    """Get fraud detection metrics"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    transactions = db.get('transactions', [])
    
    # Analyze transactions
    by_method = {}
    high_value_count = 0
    
    for t in transactions:
        method = t.get('method', 'unknown')
        by_method[method] = by_method.get(method, 0) + 1
        
        if t.get('amount', 0) >= 2000:
            high_value_count += 1
    
    return jsonify({
        "by_method": by_method,
        "high_value_count": high_value_count,
        "total_transactions": len(transactions)
    })

# ============ USER MANAGEMENT ============

@admin_bp.route('/users', methods=['GET'])
@require_owner
def get_all_users():
    """Get all users"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    users = db.get('users', [])
    return jsonify({"users": users, "total": len(users)})

@admin_bp.route('/users/<user_id>', methods=['GET'])
@require_owner
def get_user(user_id):
    """Get specific user details"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    user = next((u for u in db.get('users', []) if u.get('id') == user_id), None)
    if not user:
        return jsonify({"error": "user_not_found"}), 404
    
    return jsonify({"user": user})

@admin_bp.route('/users/<user_id>/role', methods=['PUT'])
@require_owner
def update_user_role(user_id):
    """Update user role"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    payload = request.json or {}
    new_role = payload.get('role')
    
    if new_role not in ['user', 'provider', 'admin']:
        return jsonify({"error": "invalid_role"}), 400
    
    user = next((u for u in db.get('users', []) if u.get('id') == user_id), None)
    if not user:
        return jsonify({"error": "user_not_found"}), 404
    
    user['role'] = new_role
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2)
    
    return jsonify({"user": user, "message": "Role updated successfully"})

@admin_bp.route('/users/<user_id>/status', methods=['PUT'])
@require_owner
def update_user_status(user_id):
    """Update user status (active/suspended/banned)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    payload = request.json or {}
    new_status = payload.get('status')
    
    if new_status not in ['active', 'suspended', 'banned']:
        return jsonify({"error": "invalid_status"}), 400
    
    user = next((u for u in db.get('users', []) if u.get('id') == user_id), None)
    if not user:
        return jsonify({"error": "user_not_found"}), 404
    
    user['status'] = new_status
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2)
    
    return jsonify({"user": user, "message": "Status updated successfully"})

# ============ PROVIDER MANAGEMENT ============

@admin_bp.route('/providers', methods=['GET'])
@require_owner
def get_all_providers():
    """Get all providers"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    providers = db.get('providers', [])
    return jsonify({"providers": providers, "total": len(providers)})

@admin_bp.route('/providers/<provider_id>/verify', methods=['PUT'])
@require_owner
def verify_provider(provider_id):
    """Verify a provider"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    provider = next((p for p in db.get('providers', []) if p.get('id') == provider_id), None)
    if not provider:
        return jsonify({"error": "provider_not_found"}), 404
    
    provider['verified'] = True
    provider['verified_at'] = datetime.utcnow().isoformat()
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2)
    
    return jsonify({"provider": provider, "message": "Provider verified successfully"})

@admin_bp.route('/providers/<provider_id>/suspend', methods=['PUT'])
@require_owner
def suspend_provider(provider_id):
    """Suspend a provider"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    provider = next((p for p in db.get('providers', []) if p.get('id') == provider_id), None)
    if not provider:
        return jsonify({"error": "provider_not_found"}), 404
    
    provider['status'] = 'suspended'
    provider['suspended_at'] = datetime.utcnow().isoformat()
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2)
    
    return jsonify({"provider": provider, "message": "Provider suspended successfully"})

# ============ BOOKING MANAGEMENT ============

@admin_bp.route('/bookings', methods=['GET'])
@require_owner
def get_all_bookings():
    """Get all bookings"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    bookings = db.get('bookings', [])
    return jsonify({"bookings": bookings, "total": len(bookings)})

@admin_bp.route('/bookings/<booking_id>/cancel', methods=['PUT'])
@require_owner
def cancel_booking(booking_id):
    """Cancel a booking"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    booking = next((b for b in db.get('bookings', []) if b.get('id') == booking_id), None)
    if not booking:
        return jsonify({"error": "booking_not_found"}), 404
    
    booking['status'] = 'cancelled'
    booking['cancelled_at'] = datetime.utcnow().isoformat()
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2)
    
    return jsonify({"booking": booking, "message": "Booking cancelled successfully"})

# ============ REPORTS & ANALYTICS ============

@admin_bp.route('/reports/daily', methods=['GET'])
@require_owner
def get_daily_report():
    """Get daily analytics report"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    today = datetime.utcnow().date()
    
    bookings = db.get('bookings', [])
    today_bookings = [b for b in bookings if b.get('createdAt', '').startswith(str(today))]
    
    transactions = db.get('transactions', [])
    today_revenue = sum([t.get('amount', 0) for t in transactions if t.get('createdAt', '').startswith(str(today))])
    
    return jsonify({
        "date": str(today),
        "bookings": len(today_bookings),
        "revenue": today_revenue,
        "transactions": len([t for t in transactions if t.get('createdAt', '').startswith(str(today))])
    })

@admin_bp.route('/reports/export', methods=['GET'])
@require_owner
def export_report():
    """Export full report as JSON"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    return jsonify({
        "exported_at": datetime.utcnow().isoformat(),
        "data": db
    })

# ============ SYSTEM SETTINGS ============

@admin_bp.route('/settings', methods=['GET'])
@require_owner
def get_settings():
    """Get system settings"""
    return jsonify({
        "settings": {
            "owner_email": OWNER_EMAIL,
            "app_name": "Smart Service Hub",
            "version": "1.0.0",
            "features": {
                "phone_otp": True,
                "google_auth": True,
                "email_auth": True,
                "webrtc_calling": True
            }
        }
    })

@admin_bp.route('/health', methods=['GET'])
@require_owner
def health_check():
    """System health check"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "ok",
            "api": "ok",
            "auth": "ok"
        }
    })
