from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import uuid, datetime, os, json, time
import urllib.parse, urllib.request
from flask import Response
import stripe
from admin_routes import admin_bp
from secure_routes import secure_bp

app = Flask(__name__)

# Enable CORS for ALL requests (dev mode) - ONLY use Flask-CORS, no manual headers
CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "expose_headers": ["Content-Type", "X-Total-Count"],
         "max_age": 3600,
         "supports_credentials": False
     }}
)

# Initialize SocketIO for WebRTC signaling
socketio = SocketIO(app, cors_allowed_origins="*")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

DB_FILE = os.path.join(DATA_DIR, "db.json")
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f:
        json.dump({"users":[], "providers":[], "services":[], "bookings":[], "reviews":[], "transactions":[]}, f)

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

def read_db():
    with open(DB_FILE) as f:
        return json.load(f)

def write_db(d):
    with open(DB_FILE, "w") as f:
        json.dump(d, f, indent=2)

# Very light per-IP rate limiter for API routes (demo only)
RATE = {}
WINDOW_SECONDS = 60
MAX_REQ = 100

@app.before_request
def rate_limit():
    path = request.path or ''
    if not path.startswith('/api/'):
        return
    ip = request.headers.get('X-Forwarded-For', request.remote_addr) or 'anon'
    now = int(time.time())
    bucket = RATE.get(ip)
    if not bucket or now - bucket['ts'] >= WINDOW_SECONDS:
        RATE[ip] = {'ts': now, 'count': 1}
        return
    bucket['count'] += 1
    if bucket['count'] > MAX_REQ:
        return jsonify({"error": "rate_limited", "retry_after_sec": max(0, WINDOW_SECONDS - (now - bucket['ts']))}), 429

@app.route("/")
def health():
    return {"status":"ok", "time": datetime.datetime.utcnow().isoformat()}

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    db = read_db()
    payload = request.json or {}
    user = {
        "id": str(uuid.uuid4()),
        "name": payload.get("name"),
        "email": payload.get("email"),
        "phone": payload.get("phone"),
        "role": payload.get("role","user"),
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    if payload.get("firebase_uid"):
        user["firebase_uid"] = payload.get("firebase_uid")
    db["users"].append(user)
    write_db(db)
    return jsonify({"user": user})


@app.route("/api/auth/login", methods=["POST"])
def login_user():
    """Simple login that maps a Firebase-authenticated email to a backend user.

    We assume the frontend has already done Firebase Authentication (email/password
    or other providers) and is just giving us the verified email + optional
    profile info so we can create or fetch a local user record.
    """
    db = read_db()
    payload = request.json or {}
    email = (payload.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "missing_email"}), 400
    users = db.get("users", [])
    existing = next((u for u in users if (u.get("email") or "").lower() == email), None)
    if existing:
        return jsonify({"user": existing})

    user = {
        "id": str(uuid.uuid4()),
        "name": payload.get("name"),
        "email": email,
        "phone": payload.get("phone"),
        "role": payload.get("role", "user"),
        "createdAt": datetime.datetime.utcnow().isoformat(),
    }
    if payload.get("firebase_uid"):
        user["firebase_uid"] = payload.get("firebase_uid")
    users.append(user)
    db["users"] = users
    write_db(db)
    return jsonify({"user": user})

@app.route("/api/services", methods=["GET"])
def list_services():
    db = read_db()
    q = request.args.get("q","").lower()
    cat = request.args.get("category")
    services = db["services"]
    if q:
        services = [s for s in services if q in s.get("title","").lower() or q in s.get("description","").lower()]
    if cat:
        services = [s for s in services if s.get("category")==cat]
    return jsonify({"services": services})

@app.route("/api/providers", methods=["GET"])
def list_providers():
    db = read_db()
    return jsonify({"providers": db.get("providers", [])})

@app.route("/api/proxy")
def proxy_image():
    # Minimal image proxy to avoid external referrer/CORS issues in dev
    url = request.args.get('url', '')
    if not url:
        return jsonify({"error":"missing_url"}), 400
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http","https"):
        return jsonify({"error":"invalid_scheme"}), 400
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = r.read()
            ctype = r.headers.get('Content-Type', 'application/octet-stream')
            return Response(data, headers={"Content-Type": ctype, "Cache-Control": "public, max-age=86400"})
    except Exception as e:
        return jsonify({"error":"fetch_failed","detail":str(e)}), 502

@app.route("/api/bookings", methods=["POST"])
def create_booking():
    db = read_db()
    payload = request.json or {}
    booking = {
        "id": str(uuid.uuid4()),
        "user_id": payload.get("user_id"),
        "provider_id": payload.get("provider_id"),
        "service_id": payload.get("service_id"),
        "datetime": payload.get("datetime"),
        "address": payload.get("address"),
        "status":"pending",
        "payment_status":"unpaid",
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    db["bookings"].append(booking)
    write_db(db)
    return jsonify({"booking": booking})

@app.route("/api/bookings/<booking_id>", methods=["GET"])
def get_booking(booking_id):
    db = read_db()
    bookings = db.get("bookings", [])
    services = {s.get("id"): s for s in db.get("services", [])}
    providers = {p.get("id"): p for p in db.get("providers", [])}
    booking = next((b for b in bookings if b.get("id") == booking_id), None)
    if not booking:
        return jsonify({"error": "booking_not_found"}), 404
    svc = services.get(booking.get("service_id")) or {}
    prov = providers.get(booking.get("provider_id")) or {}
    item = dict(booking)
    item["service_title"] = svc.get("title")
    item["service_price"] = svc.get("price")
    item["provider_name"] = prov.get("name") or prov.get("id")
    return jsonify({"booking": item})

@app.route("/api/bookings/<booking_id>/status", methods=["POST"])
def update_booking_status(booking_id):
    db = read_db()
    payload = request.json or {}
    bookings = db.get("bookings", [])
    booking = next((b for b in bookings if b.get("id") == booking_id), None)
    if not booking:
        return jsonify({"error": "booking_not_found"}), 404
    status = payload.get("status")
    payment_status = payload.get("payment_status")
    new_datetime = payload.get("datetime")
    if status:
        booking["status"] = status
    if payment_status:
        booking["payment_status"] = payment_status
    if new_datetime:
        booking["datetime"] = new_datetime
    booking["updatedAt"] = datetime.datetime.utcnow().isoformat()
    write_db(db)
    return jsonify({"booking": booking})

@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    db = read_db()
    users = db.get("users", [])
    bookings = db.get("bookings", [])
    services = {s.get("id"): s for s in db.get("services", [])}
    user = next((u for u in users if u.get("id") == user_id), None)
    if not user:
        return jsonify({"error": "user_not_found"}), 404
    user_bookings = [b for b in bookings if b.get("user_id") == user_id]
    total_bookings = len(user_bookings)
    completed = len([b for b in user_bookings if (b.get("status") or "").lower() in ("completed", "finished")])
    upcoming = len([b for b in user_bookings if (b.get("status") or "").lower() in ("pending", "confirmed", "scheduled")])
    cancelled = len([b for b in user_bookings if (b.get("status") or "").lower() in ("cancelled", "canceled")])
    total_spend = 0
    for b in user_bookings:
        svc = services.get(b.get("service_id")) or {}
        total_spend += svc.get("price") or 0
    stats = {
        "total_bookings": total_bookings,
        "completed": completed,
        "upcoming": upcoming,
        "cancelled": cancelled,
        "total_spend": total_spend,
    }
    return jsonify({"user": user, "stats": stats})

@app.route("/api/users/<user_id>/bookings", methods=["GET"])
def user_bookings(user_id):
    db = read_db()
    bookings = db.get("bookings", [])
    services = {s.get("id"): s for s in db.get("services", [])}
    providers = {p.get("id"): p for p in db.get("providers", [])}
    items = []
    for b in bookings:
        if b.get("user_id") != user_id:
            continue
        svc = services.get(b.get("service_id")) or {}
        prov = providers.get(svc.get("provider_id")) or {}
        item = dict(b)
        item["service_title"] = svc.get("title")
        item["service_price"] = svc.get("price")
        item["provider_name"] = prov.get("id")
        items.append(item)
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return jsonify({"bookings": items})

@app.route("/api/providers/<provider_id>/bookings", methods=["GET"])
def provider_bookings(provider_id):
    db = read_db()
    bookings = db.get("bookings", [])
    services = {s.get("id"): s for s in db.get("services", [])}
    items = []
    total_amount = 0
    today = datetime.datetime.utcnow().date().isoformat()
    today_count = 0
    active = 0
    completed = 0
    for b in bookings:
        if b.get("provider_id") != provider_id:
            continue
        svc = services.get(b.get("service_id")) or {}
        item = dict(b)
        price = svc.get("price") or 0
        item["service_title"] = svc.get("title")
        item["service_price"] = price
        items.append(item)
        total_amount += price
        status = (b.get("status") or "").lower()
        if status in ("pending", "confirmed", "scheduled"):
            active += 1
        if status in ("completed", "finished"):
            completed += 1
        dt = (b.get("datetime") or "").split("T")[0]
        if dt == today:
            today_count += 1
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    stats = {
        "total_bookings": len(items),
        "today_bookings": today_count,
        "active": active,
        "completed": completed,
        "total_earnings": total_amount,
    }
    return jsonify({"bookings": items, "stats": stats})

@app.route("/api/payments/create", methods=["POST"])
def payments_create():
    payload = request.json or {}
    db = read_db()
    amount = payload.get("amount", 0)
    payment = {
        "payment_id": str(uuid.uuid4()),
        "amount": amount,
        "status":"created",
        "method": payload.get("method", "mock"),
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    tx = {
        "id": payment["payment_id"],
        "booking_id": payload.get("booking_id"),
        "amount": amount,
        "method": payment["method"],
        "status": payment["status"],
        "createdAt": payment["createdAt"]
    }
    db.setdefault("transactions", []).append(tx)
    write_db(db)
    return jsonify(payment)

@app.route("/api/payments/stripe/checkout", methods=["POST"])
def stripe_checkout():
    payload = request.json or {}
    amount = int(payload.get("amount", 0))
    booking_id = payload.get("booking_id")
    success_url = payload.get("success_url") or "http://localhost:5173/bookings"
    cancel_url = payload.get("cancel_url") or f"http://localhost:5173/pay/{booking_id}"
    if amount <= 0:
        return jsonify({"error": "invalid_amount"}), 400

    # In local/demo mode without Stripe keys, return a mock session so the
    # frontend flow continues without hard failure.
    if not STRIPE_SECRET_KEY:
        mock_id = f"mock_{uuid.uuid4().hex[:8]}"
        return jsonify({"id": mock_id, "url": success_url})

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "product_data": {"name": f"Booking {booking_id or ''}"},
                    "unit_amount": amount * 100,
                },
                "quantity": 1,
            }],
            metadata={"booking_id": booking_id or ""},
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return jsonify({"id": session.id, "url": session.url})
    except Exception as e:
        return jsonify({"error": "stripe_error", "detail": str(e)}), 500

@app.route("/api/payments/upi/mock", methods=["POST"])
def upi_mock():
    payload = request.json or {}
    db = read_db()
    amount = payload.get("amount", 0)
    booking_id = payload.get("booking_id")
    tx_id = str(uuid.uuid4())
    tx = {
        "id": tx_id,
        "booking_id": booking_id,
        "amount": amount,
        "method": "upi",
        "status": "pending",
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    db.setdefault("transactions", []).append(tx)
    write_db(db)
    upi_id = payload.get("upi_id", "test@upi")
    pa = urllib.parse.quote(upi_id, safe="")
    pn = urllib.parse.quote("Smart ServiceHub", safe="")
    tn = urllib.parse.quote("Smart ServiceHub Booking", safe="")
    upi_link = f"upi://pay?pa={pa}&pn={pn}&am={amount}&cu=INR&tn={tn}"
    return jsonify({"transaction": tx, "upi_link": upi_link})

@app.route("/api/subscriptions/plans", methods=["GET"])
def list_plans():
    plans = [
        {"id": "basic", "name": "Basic", "price": 0, "features": ["List profile", "Receive bookings"]},
        {"id": "pro", "name": "Pro", "price": 499, "features": ["Boosted listing", "Priority support"]},
        {"id": "elite", "name": "Elite", "price": 999, "features": ["Top placement", "Featured badge", "Insights"]},
    ]
    return jsonify({"plans": plans})

@app.route("/api/subscriptions/subscribe", methods=["POST"])
def subscribe_plan():
    payload = request.json or {}
    provider_id = payload.get("provider_id")
    plan_id = payload.get("plan_id")
    if not provider_id or not plan_id:
        return jsonify({"error": "missing_fields"}), 400
    db = read_db()
    providers = db.get("providers", [])
    provider = next((p for p in providers if p.get("id") == provider_id), None)
    if not provider:
        return jsonify({"error": "provider_not_found"}), 404
    provider["plan"] = plan_id
    provider["plan_updated_at"] = datetime.datetime.utcnow().isoformat()
    write_db(db)
    return jsonify({"provider": provider})

@app.route("/api/admin/fraud-metrics", methods=["GET"])
def fraud_metrics():
    db = read_db()
    txs = db.get("transactions", [])
    total_amount = sum((t.get("amount") or 0) for t in txs)
    high_value = [t for t in txs if (t.get("amount") or 0) >= 2000]
    methods = {}
    for t in txs:
        m = t.get("method") or "unknown"
        methods[m] = methods.get(m, 0) + 1
    metrics = {
        "total_transactions": len(txs),
        "total_amount": total_amount,
        "high_value_count": len(high_value),
        "by_method": methods,
    }
    return jsonify({"metrics": metrics})

@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    """Get comprehensive admin statistics including users, providers, bookings, etc."""
    db = read_db()
    
    users = db.get("users", [])
    providers = db.get("providers", [])
    bookings = db.get("bookings", [])
    transactions = db.get("transactions", [])
    reviews = db.get("reviews", [])
    
    # Calculate booking stats
    completed_bookings = [b for b in bookings if b.get("status") == "completed"]
    active_bookings = [b for b in bookings if b.get("status") in ["accepted", "on_the_way", "nearby"]]
    
    # Calculate revenue
    total_revenue = sum((t.get("amount") or 0) for t in transactions)
    
    # Calculate average rating
    avg_rating = 0
    if reviews:
        avg_rating = sum((r.get("rating") or 0) for r in reviews) / len(reviews)
    
    stats = {
        "users": {
            "total": len(users),
            "active": len([u for u in users if u.get("email")]),
            "list": [
                {
                    "id": u.get("id"),
                    "name": u.get("name", "Unknown"),
                    "email": u.get("email", "N/A"),
                    "role": u.get("role", "user"),
                    "created_at": u.get("created_at", "N/A")
                }
                for u in users
            ]
        },
        "providers": {
            "total": len(providers),
            "active": len([p for p in providers if p.get("status") == "active"]),
            "list": [
                {
                    "id": p.get("id"),
                    "name": p.get("name", "Unknown"),
                    "categories": p.get("categories", []),
                    "rating": p.get("rating", 0),
                    "status": p.get("status", "inactive")
                }
                for p in providers
            ]
        },
        "bookings": {
            "total": len(bookings),
            "completed": len(completed_bookings),
            "active": len(active_bookings),
            "pending": len([b for b in bookings if b.get("status") == "pending"])
        },
        "revenue": {
            "total": total_revenue,
            "transactions": len(transactions),
            "average_transaction": total_revenue / len(transactions) if transactions else 0
        },
        "reviews": {
            "total": len(reviews),
            "average_rating": round(avg_rating, 2)
        }
    }
    
    return jsonify({"stats": stats})

@app.route("/api/bookings/<booking_id>/track", methods=["GET"])
def booking_track(booking_id):
    """Simulated live tracking similar to Swiggy-style GPS.

    We derive a virtual route between a provider hub and the user's city/area and
    move the provider along that path over time based on the booking's createdAt.
    This keeps the demo self-contained without real GPS but feels realistic.
    """
    db = read_db()
    bookings = db.get("bookings", [])
    booking = next((b for b in bookings if b.get("id") == booking_id), None)
    if not booking:
        return jsonify({"error": "booking_not_found"}), 404

    # Customer location: prefer explicit live location pushed from client device,
    # otherwise fall back to city inferred from address.
    cust_live = (db.get("customer_locations") or {}).get(booking_id) or {}
    user_lat = cust_live.get("lat")
    user_lng = cust_live.get("lng")
    if not isinstance(user_lat, (int, float)) or not isinstance(user_lng, (int, float)):
        user_lat, user_lng = 28.6139, 77.2090
        addr = (booking.get("address") or "").lower()
        if "noida" in addr:
            user_lat, user_lng = 28.5355, 77.3910
        elif "gurgaon" in addr or "gurugram" in addr:
            user_lat, user_lng = 28.4595, 77.0266
        elif "faridabad" in addr:
            user_lat, user_lng = 28.4089, 77.3178

    # Provider hub per provider (hard-coded demo hubs around NCR)
    provider_hubs = {
        "p1": (28.6280, 77.2186),  # Connaught Place
        "p2": (28.5494, 77.1996),  # Hauz Khas
        "p3": (28.5672, 77.2100),  # South Delhi
        "p4": (28.4595, 77.0266),  # Gurugram
        "p5": (28.5355, 77.3910),  # Noida
    }
    base_lat, base_lng = provider_hubs.get(booking.get("provider_id"), (28.6139, 77.2090))

    created_iso = booking.get("createdAt") or datetime.datetime.utcnow().isoformat()
    try:
        created_ts = datetime.datetime.fromisoformat(created_iso).timestamp()
    except Exception:
        created_ts = time.time() - 60
    now = time.time()

    # Simulate a 20 minute journey from hub to user location
    total_seconds = 20 * 60.0
    elapsed = max(0.0, now - created_ts)
    frac = max(0.0, min(1.2, elapsed / total_seconds))  # allow slight overshoot

    import math
    # Simple linear interpolation for path; add tiny wobble for realism
    def lerp(a, b, f):
        return a + (b - a) * f

    # If we have an explicit live location from provider, prefer that as base
    live_locs = db.get("live_locations", {})
    live = live_locs.get(booking_id) or {}
    live_lat = live.get("lat")
    live_lng = live.get("lng")

    if isinstance(live_lat, (int, float)) and isinstance(live_lng, (int, float)):
        lat = float(live_lat)
        lng = float(live_lng)
    else:
        wobble = 0.0015 * math.sin(now / 90.0)
        lat = lerp(base_lat, user_lat, min(frac, 1.0)) + wobble
        lng = lerp(base_lng, user_lng, min(frac, 1.0))

    # Status + ETA
    if frac < 0.05:
        status = "accepted"
    elif frac < 0.9:
        status = "on_the_way"
    elif frac < 1.05:
        status = "nearby"
    else:
        status = "completed"

    remaining = max(0.0, total_seconds - elapsed)
    eta_min = int(round(remaining / 60.0))

    # Rough distance estimate (not exact haversine, good enough for UI)
    earth_r = 6371.0
    dlat = math.radians(user_lat - lat)
    dlng = math.radians(user_lng - lng)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(user_lat)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1-a)))
    dist_km = earth_r * c

    return jsonify({
        "booking_id": booking_id,
        "provider_location": {"lat": lat, "lng": lng},
        "user_location": {"lat": user_lat, "lng": user_lng, "address": booking.get("address")},
        "status": status,
        "eta_minutes": eta_min,
        "distance_km": round(dist_km, 2),
        "progress": max(0.0, min(1.0, frac)),
    })

@app.route("/api/bookings/<booking_id>/location/update", methods=["POST"])
def update_booking_location(booking_id):
    """Provider can push live GPS location for a booking.

    This endpoint is intentionally simple and unauthenticated for demo, but in
    real app you would verify provider identity and booking ownership.
    """
    db = read_db()
    payload = request.json or {}
    lat = payload.get("lat")
    lng = payload.get("lng")
    if lat is None or lng is None:
        return jsonify({"error": "missing_lat_lng"}), 400
    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except Exception:
        return jsonify({"error": "invalid_lat_lng"}), 400
    live = db.get("live_locations") or {}
    live[booking_id] = {
        "lat": lat_f,
        "lng": lng_f,
        "updatedAt": datetime.datetime.utcnow().isoformat(),
    }
    db["live_locations"] = live
    write_db(db)
    return jsonify({"ok": True, "location": live[booking_id]})

@app.route("/api/bookings/<booking_id>/customer-location/update", methods=["POST"])
def update_customer_location(booking_id):
    """Customer device can push live GPS location for a booking.

    Used so providers can see the latest customer position instead of only
    address-derived city. For demo this is unauthenticated.
    """
    db = read_db()
    payload = request.json or {}
    lat = payload.get("lat")
    lng = payload.get("lng")
    pincode = payload.get("pincode", "")
    address = payload.get("address", "")
    
    if lat is None or lng is None:
        return jsonify({"error": "missing_lat_lng"}), 400
    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except Exception:
        return jsonify({"error": "invalid_lat_lng"}), 400
    
    cust = db.get("customer_locations") or {}
    cust[booking_id] = {
        "lat": lat_f,
        "lng": lng_f,
        "pincode": pincode,
        "address": address,
        "updatedAt": datetime.datetime.utcnow().isoformat(),
    }
    db["customer_locations"] = cust
    write_db(db)
    return jsonify({"ok": True, "location": cust[booking_id]})

@app.route("/api/bookings/<booking_id>/advanced-track", methods=["GET"])
def advanced_tracking(booking_id):
    """Advanced tracking with pincode-based location, ETA, distance, and route info."""
    db = read_db()
    bookings = db.get("bookings", [])
    booking = next((b for b in bookings if b.get("id") == booking_id), None)
    
    if not booking:
        return jsonify({"error": "booking_not_found"}), 404

    # Get customer location (live or address-based)
    cust_live = (db.get("customer_locations") or {}).get(booking_id) or {}
    user_lat = cust_live.get("lat")
    user_lng = cust_live.get("lng")
    user_pincode = cust_live.get("pincode", "")
    user_address = cust_live.get("address", booking.get("address", ""))
    
    if not isinstance(user_lat, (int, float)) or not isinstance(user_lng, (int, float)):
        user_lat, user_lng = 28.6139, 77.2090
        if "noida" in user_address.lower():
            user_lat, user_lng = 28.5355, 77.3910
        elif "gurgaon" in user_address.lower() or "gurugram" in user_address.lower():
            user_lat, user_lng = 28.4595, 77.0266
        elif "faridabad" in user_address.lower():
            user_lat, user_lng = 28.4089, 77.3178

    # Provider location
    provider_hubs = {
        "p1": (28.6280, 77.2186), "p2": (28.5494, 77.1996), "p3": (28.5672, 77.2100),
        "p4": (28.4595, 77.0266), "p5": (28.5355, 77.3910),
    }
    base_lat, base_lng = provider_hubs.get(booking.get("provider_id"), (28.6139, 77.2090))

    # Calculate journey progress
    created_iso = booking.get("createdAt") or datetime.datetime.utcnow().isoformat()
    try:
        created_ts = datetime.datetime.fromisoformat(created_iso).timestamp()
    except Exception:
        created_ts = time.time() - 60
    
    now = time.time()
    total_seconds = 20 * 60.0
    elapsed = max(0.0, now - created_ts)
    frac = max(0.0, min(1.2, elapsed / total_seconds))

    import math
    def lerp(a, b, f):
        return a + (b - a) * f

    # Current provider location
    live_locs = db.get("live_locations", {})
    live = live_locs.get(booking_id) or {}
    live_lat = live.get("lat")
    live_lng = live.get("lng")

    if isinstance(live_lat, (int, float)) and isinstance(live_lng, (int, float)):
        lat = float(live_lat)
        lng = float(live_lng)
    else:
        wobble = 0.0015 * math.sin(now / 90.0)
        lat = lerp(base_lat, user_lat, min(frac, 1.0)) + wobble
        lng = lerp(base_lng, user_lng, min(frac, 1.0))

    # Status
    if frac < 0.05:
        status = "accepted"
    elif frac < 0.9:
        status = "on_the_way"
    elif frac < 1.05:
        status = "nearby"
    else:
        status = "completed"

    remaining = max(0.0, total_seconds - elapsed)
    eta_min = int(round(remaining / 60.0))

    # Distance calculation (Haversine)
    earth_r = 6371.0
    dlat = math.radians(user_lat - lat)
    dlng = math.radians(user_lng - lng)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(user_lat)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1-a)))
    dist_km = earth_r * c

    return jsonify({
        "booking_id": booking_id,
        "provider_location": {"lat": lat, "lng": lng},
        "customer_location": {"lat": user_lat, "lng": user_lng, "pincode": user_pincode, "address": user_address},
        "status": status,
        "eta_minutes": eta_min,
        "distance_km": round(dist_km, 2),
        "progress": max(0.0, min(1.0, frac)),
        "provider_hub": {"lat": base_lat, "lng": base_lng},
        "route_info": {
            "total_distance_km": round(earth_r * 2 * math.asin(math.sqrt(math.sin(math.radians((user_lat - base_lat)/2))**2 + math.cos(math.radians(base_lat)) * math.cos(math.radians(user_lat)) * math.sin(math.radians((user_lng - base_lng)/2))**2)), 2),
            "elapsed_minutes": int(elapsed / 60),
            "total_minutes": int(total_seconds / 60)
        }
    })

@app.route("/api/bookings/<booking_id>/messages", methods=["GET", "POST"])
def booking_messages(booking_id):
    db = read_db()
    db.setdefault("messages", [])
    if request.method == "GET":
        msgs = [m for m in db["messages"] if m.get("booking_id") == booking_id]
        # sort by createdAt if present
        msgs.sort(key=lambda m: m.get("createdAt", ""))
        return jsonify({"messages": msgs})
    # POST
    payload = request.json or {}
    text = (payload.get("text") or "").strip()
    image_url = (payload.get("image_url") or "").strip()
    sender = payload.get("sender") or "customer"
    if not text and not image_url:
        return jsonify({"error": "empty_message"}), 400
    msg = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "sender": sender,
        "text": text,
        "image_url": image_url or None,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    db["messages"].append(msg)
    write_db(db)
    return jsonify({"message": msg})

@app.route("/api/bookings/recent-chats", methods=["GET"])
def recent_chats():
    db = read_db()
    msgs = db.get("messages", [])
    by_booking = {}
    for m in msgs:
        bid = m.get("booking_id") or ""
        if not bid:
            continue
        cur = by_booking.get(bid)
        ts = m.get("createdAt") or ""
        if not cur or ts > cur.get("lastAt", ""):
            by_booking[bid] = {
                "booking_id": bid,
                "last_text": m.get("text") or "",
                "last_image_url": m.get("image_url"),
                "last_sender": m.get("sender") or "",
                "lastAt": ts,
            }
    items = sorted(by_booking.values(), key=lambda x: x.get("lastAt", ""), reverse=True)[:3]
    return jsonify({"chats": items})


# --- Simple in-memory signaling for demo WebRTC calls (NOT production ready) ---

@app.route("/api/call/<booking_id>/signal", methods=["POST", "GET"])
def call_signal(booking_id):
    """Very small signaling storage so two peers can exchange WebRTC data.

    This is demo-only: we just append to a list in db.json and let clients poll.
    In a real app, use WebSockets and proper auth.
    """
    db = read_db()
    db.setdefault("call_signals", [])
    if request.method == "GET":
        since = request.args.get("since") or ""
        # return signals for this booking created after `since`
        signals = [s for s in db["call_signals"] if s.get("booking_id") == booking_id and s.get("createdAt", "") > since]
        return jsonify({"signals": signals})

    # POST - push a new signal
    payload = request.json or {}
    sig = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "from": payload.get("from") or "unknown",
        "type": payload.get("type"),  # offer, answer, ice
        "data": payload.get("data") or {},
        "createdAt": datetime.datetime.utcnow().isoformat(),
    }
    db["call_signals"].append(sig)
    # keep only recent N to avoid growing without bound
    if len(db["call_signals"]) > 500:
        db["call_signals"] = db["call_signals"][-500:]
    write_db(db)
    return jsonify({"signal": sig})

@app.route("/api/reviews", methods=["POST"])
def post_review():
    db = read_db()
    payload = request.json or {}
    review = {
        "id": str(uuid.uuid4()),
        "booking_id": payload.get("booking_id"),
        "rating": payload.get("rating"),
        "comment": payload.get("comment"),
        "photos": payload.get("photos") or [],
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    db["reviews"].append(review)
    write_db(db)
    return jsonify({"review": review})

@app.route("/api/providers/<provider_id>/reviews", methods=["GET"])
def provider_reviews(provider_id):
    db = read_db()
    bookings = db.get("bookings", [])
    reviews = db.get("reviews", [])
    services = {s.get("id"): s for s in db.get("services", [])}
    # Map booking id -> booking with provider_id
    bookings_by_id = {b.get("id"): b for b in bookings if b.get("provider_id") == provider_id}
    items = []
    for rv in reviews:
        bid = rv.get("booking_id")
        b = bookings_by_id.get(bid)
        if not b:
            continue
        svc = services.get(b.get("service_id")) or {}
        item = dict(rv)
        item["service_title"] = svc.get("title")
        items.append(item)
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    if not items:
        return jsonify({"reviews": [], "stats": {"count": 0, "avg_rating": 0}})
    total = len(items)
    avg = sum((r.get("rating") or 0) for r in items) / float(total)
    return jsonify({"reviews": items, "stats": {"count": total, "avg_rating": avg}})

@app.route("/api/ai/recommend", methods=["POST"])
def ai_recommend():
    db = read_db()
    payload = request.json or {}
    text = (payload.get("text") or "").lower()

    keywords = {
        "plumber": ["leak", "pipe", "tap", "drain", "water"],
        "electrician": ["light", "fan", "wiring", "switch", "mcB", "short"],
        "cleaning": ["clean", "sofa", "bathroom", "kitchen", "dust"],
        "tutor": ["tutor", "math", "physics", "exam", "study"],
        "mechanic": ["car", "bike", "engine", "puncture", "brake"],
        "appliance repair": ["geyser", "microwave", "ro", "dishwasher", "appliance"],
        "ac repair": ["ac", "air conditioner", "cooling", "gas"]
    }

    score = {}
    for cat, words in keywords.items():
        score[cat] = sum(1 for w in words if w in text)

    ranked = sorted(score.items(), key=lambda x: x[1], reverse=True)
    top_categories = [c[0].title() for c in ranked if c[1] > 0][:3] or ["Plumber", "Electrician", "Cleaning"]

    # pick providers matching any of the top categories, sorted by rating
    providers = db.get("providers", [])
    def prov_match(p):
        pcats = [x.lower() for x in p.get("categories", [])]
        return any(tc.lower() in pcats for tc in top_categories)

    matched = [p for p in providers if prov_match(p)]
    matched.sort(key=lambda p: p.get("rating", 0), reverse=True)
    top_providers = [
        {
            "id": p.get("id"),
            "name": f"Provider {p.get('id')}",
            "rating": p.get("rating"),
            "categories": p.get("categories", []),
            "reason": f"High rating in {', '.join(p.get('categories', []))}"
        }
        for p in matched[:3]
    ]

    reason = "Recommendations are based on keyword match and provider ratings (mock logic)."
    return jsonify({
        "categories": top_categories,
        "providers": top_providers,
        "reason": reason
    })

# Register Admin Blueprint
app.register_blueprint(admin_bp)

# Register Secure Routes Blueprint
app.register_blueprint(secure_bp)

# Initialize WebSocket handlers for WebRTC
from websocket import init_socketio
init_socketio(socketio)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
