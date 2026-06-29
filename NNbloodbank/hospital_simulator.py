from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request


DEFAULT_API_BASE = "http://127.0.0.1:8000"

EVENTS = [
    {
        "hospital_id": 1,
        "blood_type": "O-",
        "new_count": 8,
        "label": "KEM Hospital Blood Centre: O- dropping",
    },
    {
        "hospital_id": 1,
        "blood_type": "O-",
        "new_count": 4,
        "label": "KEM Hospital Blood Centre: O- now critical",
    },
    {
        "hospital_id": 3,
        "blood_type": "O-",
        "new_count": 22,
        "label": "AIIMS Delhi Blood Centre: confirms surplus O-",
    },
]


def post_stock_update(api_base: str, event: dict[str, object]) -> tuple[int, dict[str, object]]:
    payload = json.dumps(
        {
            "hospital_id": event["hospital_id"],
            "blood_type": event["blood_type"],
            "new_count": event["new_count"],
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{api_base.rstrip('/')}/stock/update",
        data=payload,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        return response.status, json.loads(body)


def run(api_base: str, delay_seconds: float) -> int:
    print(f"Hospital simulator sending {len(EVENTS)} events to {api_base.rstrip('/')}")
    for event in EVENTS:
        print(f"\nSending update: {event['label']}")
        try:
            status, response_body = post_stock_update(api_base, event)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8")
            print(f"  Status: {exc.code} | {body}")
            return 1
        except urllib.error.URLError as exc:
            print(f"  Could not reach API: {exc.reason}")
            print("  Start FastAPI first, then rerun this script.")
            return 1

        print(f"  Status: {status} | {response_body}")
        time.sleep(delay_seconds)

    print("\nDone. Refreshing dashboard polls should now show the updated network state.")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replay a small hospital stock update sequence against the running API."
    )
    parser.add_argument(
        "--api-base",
        default=DEFAULT_API_BASE,
        help=f"FastAPI base URL. Defaults to {DEFAULT_API_BASE}.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=2.0,
        help="Seconds to pause between events so the dashboard can visibly catch up.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    raise SystemExit(run(args.api_base, args.delay))
