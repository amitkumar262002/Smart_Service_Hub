import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "db.json"

# Image URL pools per category (from user)
CLEANING_IMAGES = [
    "https://sp.yimg.com/ib/th/id/OIP.Zld2pr2QHA8LVEyU-uckJAHaLG?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
    "https://sp.yimg.com/ib/th/id/OIP.Rx6sf1uk9qaYk_icirLx9AHaE8?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
    "https://up.yimg.com/ib/th/id/OIP.LmQt_RYltDGNiSXmc4bzwgHaFK?pid=Api&rs=1&c=1&qlt=95&w=140&h=97",
    "https://tse2.mm.bing.net/th/id/OIP.crsaU19KbAYq0bxL1vf_ewHaE7?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.O9jHqfR5O49kMSzhZr7CLAHaHa?pid=Api&P=0&h=180",
]

PLUMBER_IMAGES = [
    "https://sp.yimg.com/ib/th/id/OIP.eH8M5_H93ahhGxcdlPz4RwHaHa?pid=Api&w=148&h=148&c=7&dpr=2&rs=1",
    "https://tse3.mm.bing.net/th/id/OIP.TFoiCUkvsSBgrpHDnOeSJgHaE8?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.rrS1D2mztOgAeFiLX3n1LQHaE8?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.ZyJ8j1MuGqad-1Ir0Fd4cwHaE8?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.KUAsmNfV85UItUpT4yppeAHaHa?pid=Api&P=0&h=180",
]

ELECTRICIAN_IMAGES = [
    "https://tse4.mm.bing.net/th/id/OIP.xA2jVA8gX4LP2ZtK-_8ldQHaHg?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.P-CBQcugdiw56W98TaWROAHaFb?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.PpKmMd-2LrLROWliZrDOmgHaHa?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.YD5UUBp7vXF1G9HDg9BTswHaE8?pid=Api&P=0&h=180",
    "https://tse4.mm.bing.net/th/id/OIP.m5keiSbkHU176I74w32CNgHaEK?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.ykCyh1JwwvPUp9JyLPAdHAHaE8?pid=Api&P=0&h=180",
]

APPLIANCE_IMAGES = [
    "https://tse3.mm.bing.net/th/id/OIP.W517xMRMxRron8z4V1t_3gHaDt?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.3HALTKXvpgUS5rdLkjL5HQHaFF?pid=Api&P=0&h=180",
    "https://tse4.mm.bing.net/th/id/OIP.iyIPQP1FYHe1pW3u8SpDpgHaE6?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.KrclfJRO9qgncAy8pSVGNgHaE8?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.ntxc_ZTdHgdohLYNWgy_4wHaGr?pid=Api&P=0&h=180",
]

AC_IMAGES = [
    "https://tse3.mm.bing.net/th/id/OIP.bdYYZzbqEycb-IqbM-yHFQHaE7?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.csoDSm5p9IpPi6h5UjUTdAHaE7?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.OQQkbze_GXpPs6Yf8m-xnwHaEK?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.cWuTXNnN0rFKsfxUxM-xjgHaE8?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.7FfLHcvlrukDdLTKrb72SQHaGF?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.3VtJ9HnoSgRgUrbvTUAzzAHaE8?pid=Api&P=0&h=180",
]

MECHANIC_IMAGES = [
    "https://tse1.mm.bing.net/th/id/OIP.QVlOHiBbbl8btUaH4GMoawHaEx?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.4QopavoDcL4KOI4ZhctuOwHaE8?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.O6vhXxqGApIO1hedy93aWgHaFc?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.Sk-5KHXtN0wnHZDLsNueuwHaEK?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.f-Wv8uwAoZgt2rc_TfrS7gHaE8?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.q64FHaVPQaoAbNkVTX8PgQHaE7?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.TlDSoA_dPKy90Ka_ViTI_wHaEJ?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.zALq2kDNqWIm9MONBeGNtQHaFp?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP._H633vLCKCzetniWeE5-tQHaHa?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.XAvpY5TuwzE_5g5Gsh8smQHaG8?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.DS5bNr0cZojBXshIszx4DwHaE8?pid=Api&P=0&h=180",
]

TUTOR_IMAGES = [
    "https://tse3.mm.bing.net/th/id/OIP._5PioL9KFA_EL_gxsiYKYQHaEK?pid=Api&P=0&h=180",
    "https://tse4.mm.bing.net/th/id/OIP.agGP9Nbak9NwHMG87KQe1QHaFh?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.l6x85lzVJkDrG6Jh4KSlVwHaGN?pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th/id/OIP.k6DF5Z1mj8U4NfIlq_QnhQHaE8?pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th/id/OIP.8b9mkEccVpOUdaLd0OgLqAHaD3?pid=Api&P=0&h=180",
    "https://tse4.mm.bing.net/th/id/OIP.S8TV0AL1veZsMAqYRzAY0wHaFX?pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th/id/OIP.KkbayxFztn0Urxrd0INM_wHaE7?pid=Api&P=0&h=180",
    "https://tse4.mm.bing.net/th/id/OIP.5GU_dy1eFeNidbgVuXTTeQHaFk?pid=Api&P=0&h=180",
]

CATEGORY_CONFIG = {
    "Cleaning": CLEANING_IMAGES,
    "Plumber": PLUMBER_IMAGES,
    "Electrician": ELECTRICIAN_IMAGES,
    "Appliance Repair": APPLIANCE_IMAGES,
    "AC Repair": AC_IMAGES,
    "Mechanic": MECHANIC_IMAGES,
    "Tutor": TUTOR_IMAGES,
}

TARGET_SERVICE_COUNT = 1500


def load_db():
    with DB_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_db(data):
    with DB_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def next_service_id(existing_ids):
    # IDs are like s1, s2, ...; find max numeric suffix and increment
    max_n = 0
    for sid in existing_ids:
        if sid.startswith("s") and sid[1:].isdigit():
            max_n = max(max_n, int(sid[1:]))
    return max_n + 1


def pick_random_category():
    return random.choice(list(CATEGORY_CONFIG.keys()))


def generate_fake_service(idx, category, provider_id="p1"):
    # Simple generated title/description based on category
    title = f"Auto {category} service #{idx}"
    description = f"Auto-generated {category.lower()} service {idx} for demo and load testing."

    # Reasonable random price/duration ranges
    price = random.randint(200, 3000)
    duration = random.choice([30, 45, 60, 90, 120, 180])

    images = CATEGORY_CONFIG[category]
    thumbnail = random.choice(images)

    return {
      "provider_id": provider_id,
      "title": title,
      "description": description,
      "price": price,
      "duration_minutes": duration,
      "category": category,
      "thumbnail": thumbnail,
    }


def main():
    db = load_db()
    services = db.get("services", [])
    existing_ids = {s["id"] for s in services}

    current_count = len(services)
    print(f"Existing services: {current_count}")

    if current_count >= TARGET_SERVICE_COUNT:
        print("Nothing to do: already have", current_count, "services")
        return

    next_idx = next_service_id(existing_ids)
    to_add = TARGET_SERVICE_COUNT - current_count
    print(f"Adding {to_add} services starting from id s{next_idx}")

    provider_ids = [p["id"] for p in db.get("providers", [])] or ["p1"]

    for i in range(to_add):
        sid = f"s{next_idx + i}"
        category = pick_random_category()
        provider_id = random.choice(provider_ids)
        service = generate_fake_service(next_idx + i, category, provider_id)
        service["id"] = sid
        services.append(service)

    db["services"] = services
    save_db(db)
    print("Done. New services count:", len(services))


if __name__ == "__main__":
    main()
