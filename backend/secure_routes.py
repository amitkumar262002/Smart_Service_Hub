# Secure Routes - Role-Based Data Access Control
# Users see only their own data
# Providers see only their own data
# Owner sees all data

from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os

secure_bp = Blueprint('secure', __name__, url_prefix='/api/secure')

# Owner email (must match Firebase owner account)
OWNER_EMAIL = "supermanverma@gmail.com"

def get_user_email():
    """Get user email from request header"""
    return request.headers.get('X-User-Email', '').lower()

def get_user_id():
    """Get user ID from request header"""
    return request.headers.get('X-User-ID', '')

def get_user_role():
    """Get user role from request header"""
    return request.headers.get('X-User-Role', 'user')

def is_owner(email):
    """Check if user is owner"""
    return email and email.lower() == OWNER_EMAIL.lower()

def is_authenticated():
    """Check if user is authenticated"""
    return bool(get_user_email())

# ============ AUTHORIZATION DECORATORS ============

def require_auth(f):
    """Require user to be authenticated"""
    def require_auth_wrapper(*args, **kwargs):
        if not is_authenticated():
            return jsonify({"error": "unauthorized", "message": "Authentication required"}), 401
        return f(*args, **kwargs)
    require_auth_wrapper.__name__ = f.__name__ + '_secure_auth'
    return require_auth_wrapper

def require_owner(f):
    """Require user to be owner"""
    def require_owner_wrapper(*args, **kwargs):
        email = get_user_email()
        if not is_owner(email):
            return jsonify({"error": "forbidden", "message": "Owner access required"}), 403
        return f(*args, **kwargs)
    require_owner_wrapper.__name__ = f.__name__ + '_secure_owner'
    return require_owner_wrapper

# ============ USER PROFILE & DATA ============

@secure_bp.route('/user/profile', methods=['GET'])
@require_auth
def get_user_profile():
    """Get current user's profile (user can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    role = get_user_role()
    
    # Only users can access this endpoint
    if role != 'user':
        return jsonify({"error": "forbidden", "message": "User access required"}), 403
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Find user by email or ID
    user = next((u for u in db.get('users', []) 
                if (u.get('email', '').lower() == email or u.get('id') == user_id)), None)
    
    if not user:
        # If user not found in database, create a temporary profile from headers
        # This ensures the endpoint always works for authenticated users
        return jsonify({
            "user": {
                "id": user_id,
                "email": email,
                "name": email.split('@')[0],
                "phone": "",
                "role": "user",
                "avatar": None,
                "created_at": datetime.utcnow().isoformat(),
                "note": "Profile created from authentication headers"
            }
        })
    
    # Return only user's own data (no sensitive info)
    return jsonify({
        "user": {
            "id": user.get('id'),
            "name": user.get('name'),
            "email": user.get('email'),
            "phone": user.get('phone'),
            "role": user.get('role'),
            "avatar": user.get('avatar'),
            "created_at": user.get('createdAt')
        }
    })

@secure_bp.route('/user/bookings', methods=['GET'])
@require_auth
def get_user_bookings():
    """Get current user's bookings (user can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Get only user's bookings
    bookings = [b for b in db.get('bookings', []) 
                if b.get('user_id') == user_id or b.get('user_email', '').lower() == email]
    
    return jsonify({
        "bookings": bookings,
        "total": len(bookings)
    })

@secure_bp.route('/user/stats', methods=['GET'])
@require_auth
def get_user_stats():
    """Get current user's statistics (user can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Get user's bookings
    user_bookings = [b for b in db.get('bookings', []) 
                     if b.get('user_id') == user_id or b.get('user_email', '').lower() == email]
    
    # Calculate user's stats
    total_bookings = len(user_bookings)
    completed_bookings = len([b for b in user_bookings if b.get('status') == 'completed'])
    pending_bookings = len([b for b in user_bookings if b.get('status') == 'pending'])
    
    # Get user's transactions
    user_transactions = [t for t in db.get('transactions', []) 
                        if t.get('user_id') == user_id or t.get('user_email', '').lower() == email]
    
    total_spent = sum([t.get('amount', 0) for t in user_transactions])
    
    return jsonify({
        "stats": {
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "total_spent": total_spent,
            "average_transaction": total_spent / len(user_transactions) if user_transactions else 0
        }
    })

# ============ PROVIDER DATA ============

@secure_bp.route('/provider/profile', methods=['GET'])
@require_auth
def get_provider_profile():
    """Get current provider's profile (provider can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    role = get_user_role()
    
    # Only providers can access this
    if role != 'provider':
        return jsonify({"error": "forbidden", "message": "Provider access required"}), 403
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Find provider by email or ID
    provider = next((p for p in db.get('providers', []) 
                    if (p.get('email', '').lower() == email or p.get('id') == user_id)), None)
    
    if not provider:
        # If provider not found in database, create a temporary profile from headers
        # This ensures the endpoint always works for authenticated providers
        return jsonify({
            "provider": {
                "id": user_id,
                "email": email,
                "name": email.split('@')[0],
                "phone": "",
                "category": "General",
                "rating": 0.0,
                "verified": False,
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "note": "Profile created from authentication headers"
            }
        })
    
    # Return only provider's own data
    return jsonify({
        "provider": {
            "id": provider.get('id'),
            "name": provider.get('name'),
            "email": provider.get('email'),
            "phone": provider.get('phone'),
            "category": provider.get('category'),
            "rating": provider.get('rating'),
            "verified": provider.get('verified'),
            "status": provider.get('status'),
            "created_at": provider.get('createdAt')
        }
    })

@secure_bp.route('/provider/bookings', methods=['GET'])
@require_auth
def get_provider_bookings():
    """Get current provider's bookings (provider can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    role = get_user_role()
    
    # Only providers can access this
    if role != 'provider':
        return jsonify({"error": "forbidden", "message": "Provider access required"}), 403
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Get only provider's bookings
    bookings = [b for b in db.get('bookings', []) 
                if b.get('provider_id') == user_id or b.get('provider_email', '').lower() == email]
    
    return jsonify({
        "bookings": bookings,
        "total": len(bookings)
    })

@secure_bp.route('/provider/stats', methods=['GET'])
@require_auth
def get_provider_stats():
    """Get current provider's statistics (provider can only see their own)"""
    email = get_user_email()
    user_id = get_user_id()
    role = get_user_role()
    
    # Only providers can access this
    if role != 'provider':
        return jsonify({"error": "forbidden", "message": "Provider access required"}), 403
    
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    # Get provider's bookings
    provider_bookings = [b for b in db.get('bookings', []) 
                        if b.get('provider_id') == user_id or b.get('provider_email', '').lower() == email]
    
    # Calculate provider's stats
    total_bookings = len(provider_bookings)
    completed_bookings = len([b for b in provider_bookings if b.get('status') == 'completed'])
    pending_bookings = len([b for b in provider_bookings if b.get('status') == 'pending'])
    
    # Get provider's earnings
    provider_transactions = [t for t in db.get('transactions', []) 
                           if t.get('provider_id') == user_id or t.get('provider_email', '').lower() == email]
    
    total_earnings = sum([t.get('amount', 0) for t in provider_transactions])
    
    return jsonify({
        "stats": {
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "total_earnings": total_earnings,
            "average_earning": total_earnings / len(provider_transactions) if provider_transactions else 0
        }
    })

# ============ OWNER ONLY - ALL DATA ============

@secure_bp.route('/admin/all-users', methods=['GET'])
@require_owner
def get_all_users():
    """Get all users (owner only)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    users = db.get('users', [])
    return jsonify({
        "users": users,
        "total": len(users)
    })

@secure_bp.route('/admin/all-providers', methods=['GET'])
@require_owner
def get_all_providers():
    """Get all providers (owner only)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    providers = db.get('providers', [])
    return jsonify({
        "providers": providers,
        "total": len(providers)
    })

@secure_bp.route('/admin/all-bookings', methods=['GET'])
@require_owner
def get_all_bookings():
    """Get all bookings (owner only)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    bookings = db.get('bookings', [])
    return jsonify({
        "bookings": bookings,
        "total": len(bookings)
    })

@secure_bp.route('/admin/all-transactions', methods=['GET'])
@require_owner
def get_all_transactions():
    """Get all transactions (owner only)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    transactions = db.get('transactions', [])
    total_revenue = sum([t.get('amount', 0) for t in transactions])
    
    return jsonify({
        "transactions": transactions,
        "total": len(transactions),
        "total_revenue": total_revenue
    })

@secure_bp.route('/admin/dashboard', methods=['GET'])
@require_owner
def get_admin_dashboard():
    """Get complete admin dashboard (owner only)"""
    db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")
    with open(db_file) as f:
        db = json.load(f)
    
    users = db.get('users', [])
    providers = db.get('providers', [])
    bookings = db.get('bookings', [])
    transactions = db.get('transactions', [])
    
    return jsonify({
        "dashboard": {
            "users": {
                "total": len(users),
                "active": len([u for u in users if u.get('status') == 'active']),
                "suspended": len([u for u in users if u.get('status') == 'suspended'])
            },
            "providers": {
                "total": len(providers),
                "active": len([p for p in providers if p.get('status') == 'active']),
                "verified": len([p for p in providers if p.get('verified')])
            },
            "bookings": {
                "total": len(bookings),
                "completed": len([b for b in bookings if b.get('status') == 'completed']),
                "pending": len([b for b in bookings if b.get('status') == 'pending']),
                "cancelled": len([b for b in bookings if b.get('status') == 'cancelled'])
            },
            "revenue": {
                "total": sum([t.get('amount', 0) for t in transactions]),
                "transactions": len(transactions),
                "average": sum([t.get('amount', 0) for t in transactions]) / len(transactions) if transactions else 0
            }
        }
    })

# ============ SECURITY ENDPOINTS ============

@secure_bp.route('/verify-access', methods=['GET'])
@require_auth
def verify_access():
    """Verify user access and get their role"""
    email = get_user_email()
    role = get_user_role()
    user_id = get_user_id()
    
    return jsonify({
        "authenticated": True,
        "email": email,
        "role": role,
        "user_id": user_id,
        "is_owner": is_owner(email),
        "permissions": {
            "can_view_own_data": True,
            "can_view_all_data": is_owner(email),
            "can_manage_users": is_owner(email),
            "can_manage_providers": is_owner(email)
        }
    })

@secure_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })
