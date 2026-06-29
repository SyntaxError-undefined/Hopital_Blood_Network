from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import select

from models import (
    DEFAULT_SHELF_LIFE_DAYS,
    BloodBag,
    BloodBagStatus,
    BloodType,
    Hospital,
    StockSnapshot,
    create_database,
    get_session_factory,
)


OUTPUT_CSV = Path(__file__).with_name("stock_snapshots.csv")
DAYS_TO_GENERATE = 90
RANDOM_SEED = 42

# Approximate India-facing blood group mix used for synthetic allocation.
# Simplifying assumption: percentages vary by region, so this is intentionally
# rough rather than presented as clinical truth.
BLOOD_TYPE_PREVALENCE = {
    BloodType.O_POS: 0.35,
    BloodType.B_POS: 0.32,
    BloodType.A_POS: 0.22,
    BloodType.AB_POS: 0.07,
    BloodType.O_NEG: 0.018,
    BloodType.B_NEG: 0.012,
    BloodType.A_NEG: 0.008,
    BloodType.AB_NEG: 0.002,
}

TRAUMA_HEAVY_TYPES = {BloodType.O_POS, BloodType.O_NEG}


@dataclass(frozen=True)
class HospitalProfile:
    name: str
    city: str
    lat: float
    lng: float
    capacity_units: int
    restock_min_days: int
    restock_max_days: int
    reliability: float


HOSPITAL_PROFILES = [
    HospitalProfile("KEM Hospital Blood Centre", "Mumbai", 18.9977, 72.8376, 430, 5, 7, 0.92),
    HospitalProfile("Lilavati Hospital Blood Bank", "Mumbai", 19.0509, 72.8289, 310, 6, 8, 0.86),
    HospitalProfile("AIIMS Delhi Blood Centre", "Delhi", 28.5672, 77.2100, 460, 5, 7, 0.94),
    HospitalProfile("Safdarjung Hospital Blood Bank", "Delhi", 28.5687, 77.2040, 340, 6, 9, 0.84),
    HospitalProfile("Victoria Hospital Blood Bank", "Bengaluru", 12.9634, 77.5739, 300, 6, 9, 0.82),
    HospitalProfile("Apollo Hospitals Blood Bank", "Chennai", 13.0635, 80.2514, 360, 5, 8, 0.88),
]

# Simulated demand events inside the 90-day window. These are not tied to the
# current calendar; they create explainable learning signal for the demo.
DEMAND_EVENTS = {
    14: ("Ganesh Visarjan crowd injuries", 2.2),
    35: ("Diwali travel surge", 2.7),
    58: ("New year highway trauma load", 2.4),
    76: ("Regional sports final", 1.9),
}

MASS_CASUALTY_EVENT = {
    "day": 50,
    "hospital_index": 3,
    "name": "localized highway pile-up near Delhi",
    "multiplier": 4.0,
}


def snapshot_datetime(day: date) -> datetime:
    return datetime.combine(day, time(hour=18), tzinfo=timezone.utc)


def initial_stock(profile: HospitalProfile, blood_type: BloodType) -> int:
    prevalence = BLOOD_TYPE_PREVALENCE[blood_type]
    base = profile.capacity_units * prevalence
    rare_buffer = 8 if prevalence < 0.02 else 0
    return max(3, int(round(base + rare_buffer)))


def daily_usage(rng: np.random.Generator, profile: HospitalProfile, blood_type: BloodType) -> int:
    prevalence = BLOOD_TYPE_PREVALENCE[blood_type]
    expected = max(0.35, profile.capacity_units * prevalence * rng.uniform(0.020, 0.045))
    if blood_type in TRAUMA_HEAVY_TYPES:
        expected *= 1.25
    return max(0, int(rng.poisson(expected)))


def restock_quantity(rng: np.random.Generator, profile: HospitalProfile, blood_type: BloodType) -> int:
    prevalence = BLOOD_TYPE_PREVALENCE[blood_type]
    expected = profile.capacity_units * prevalence * rng.uniform(0.17, 0.33) * profile.reliability
    if prevalence < 0.02:
        expected += rng.uniform(1, 4)
    return max(1, int(round(expected)))


def make_hospitals(session) -> list[Hospital]:
    hospitals = []
    for profile in HOSPITAL_PROFILES:
        hospital = Hospital(
            name=profile.name,
            city=profile.city,
            lat=profile.lat,
            lng=profile.lng,
        )
        session.add(hospital)
        hospitals.append(hospital)
    session.flush()
    return hospitals


def generate_stock_history(session, rng: np.random.Generator, start_date: date) -> pd.DataFrame:
    hospitals = make_hospitals(session)
    records = []

    for hospital_index, (hospital, profile) in enumerate(zip(hospitals, HOSPITAL_PROFILES)):
        stock = {blood_type: initial_stock(profile, blood_type) for blood_type in BloodType}
        next_restock_day = {
            blood_type: int(rng.integers(profile.restock_min_days, profile.restock_max_days + 1))
            for blood_type in BloodType
        }

        for day_offset in range(DAYS_TO_GENERATE):
            current_date = start_date + timedelta(days=day_offset)
            event_name, event_multiplier = DEMAND_EVENTS.get(day_offset, (None, 1.0))

            for blood_type in BloodType:
                if day_offset == next_restock_day[blood_type]:
                    if rng.random() < profile.reliability:
                        stock[blood_type] += restock_quantity(rng, profile, blood_type)
                    next_restock_day[blood_type] += int(
                        rng.integers(profile.restock_min_days, profile.restock_max_days + 1)
                    )

                usage = daily_usage(rng, profile, blood_type)
                if event_name:
                    usage = int(round(usage * (event_multiplier if blood_type in TRAUMA_HEAVY_TYPES else 1.35)))

                if (
                    day_offset == MASS_CASUALTY_EVENT["day"]
                    and hospital_index == MASS_CASUALTY_EVENT["hospital_index"]
                ):
                    multiplier = MASS_CASUALTY_EVENT["multiplier"] if blood_type in TRAUMA_HEAVY_TYPES else 2.0
                    usage = int(round(max(usage, 1) * multiplier))

                weekend_factor = 1.12 if current_date.weekday() in {5, 6} else 1.0
                stock[blood_type] = max(0, int(round(stock[blood_type] - usage * weekend_factor)))

                snapshot = StockSnapshot(
                    hospital_id=hospital.id,
                    blood_type=blood_type,
                    count=stock[blood_type],
                    timestamp=snapshot_datetime(current_date),
                )
                session.add(snapshot)
                records.append(
                    {
                        "date": current_date.isoformat(),
                        "hospital_id": hospital.id,
                        "hospital_name": hospital.name,
                        "city": hospital.city,
                        "blood_type": blood_type.value,
                        "count": stock[blood_type],
                    }
                )

    return pd.DataFrame(records)


def collection_date_for_available_bag(
    rng: np.random.Generator, simulation_end: date, near_expiry: bool
) -> date:
    if near_expiry:
        days_before_end = int(rng.integers(DEFAULT_SHELF_LIFE_DAYS - 5, DEFAULT_SHELF_LIFE_DAYS + 1))
    else:
        days_before_end = int(rng.integers(2, DEFAULT_SHELF_LIFE_DAYS - 6))
    return simulation_end - timedelta(days=days_before_end)


def generate_blood_bags(session, rng: np.random.Generator, simulation_end: date) -> None:
    latest_snapshots = session.execute(
        select(StockSnapshot).where(StockSnapshot.timestamp == snapshot_datetime(simulation_end))
    ).scalars()

    for snapshot in latest_snapshots:
        for _ in range(snapshot.count):
            near_expiry = rng.random() < 0.22
            collection_date = collection_date_for_available_bag(rng, simulation_end, near_expiry)
            session.add(
                BloodBag(
                    hospital_id=snapshot.hospital_id,
                    blood_type=snapshot.blood_type,
                    collection_date=collection_date,
                    status=BloodBagStatus.AVAILABLE,
                )
            )

        expired_count = max(1, int(round(snapshot.count * rng.uniform(0.03, 0.08)))) if snapshot.count else 1
        for _ in range(expired_count):
            collection_date = simulation_end - timedelta(
                days=int(rng.integers(DEFAULT_SHELF_LIFE_DAYS + 3, DEFAULT_SHELF_LIFE_DAYS + 18))
            )
            session.add(
                BloodBag(
                    hospital_id=snapshot.hospital_id,
                    blood_type=snapshot.blood_type,
                    collection_date=collection_date,
                    status=BloodBagStatus.EXPIRED,
                )
            )


def main() -> None:
    rng = np.random.default_rng(RANDOM_SEED)
    end_date = date.today()
    start_date = end_date - timedelta(days=DAYS_TO_GENERATE - 1)

    create_database(reset=True)
    Session = get_session_factory()
    with Session() as session:
        stock_df = generate_stock_history(session, rng, start_date)
        session.flush()
        generate_blood_bags(session, rng, end_date)
        session.commit()

    stock_df.to_csv(OUTPUT_CSV, index=False)
    print(f"Created SQLite database: {Path(__file__).with_name('blood_network.db')}")
    print(f"Exported stock snapshot CSV: {OUTPUT_CSV}")
    print(f"Rows: {len(stock_df)} stock snapshots across {DAYS_TO_GENERATE} days")


if __name__ == "__main__":
    main()
