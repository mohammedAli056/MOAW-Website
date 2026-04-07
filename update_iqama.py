import csv
from datetime import datetime, timedelta

# === SETTINGS ===
FILE_NAME = "prayer-times.csv"
DAYS_TO_UPDATE = 30

# === 12-HOUR INPUT ===
FAJR = "6:00 AM"
DHUHR = "1:45 PM"
ASR = "6:30 PM"
ISHA = "9:45 PM"

# === FUNCTIONS ===
def convert_to_24(time_str):
    return datetime.strptime(time_str, "%I:%M %p").strftime("%H:%M:%S")

def add_minutes(time_str, minutes):
    t = datetime.strptime(time_str.strip(), "%H:%M:%S")
    t += timedelta(minutes=minutes)
    return t.strftime("%H:%M:%S")

# Convert times
FAJR_24 = convert_to_24(FAJR)
DHUHR_24 = convert_to_24(DHUHR)
ASR_24 = convert_to_24(ASR)
ISHA_24 = convert_to_24(ISHA)

# === DATE RANGE ===
today = (datetime.today() - timedelta(days=1)).date()
end_date = today + timedelta(days=DAYS_TO_UPDATE)

print(f"Updating from {today} to {end_date}")

# === READ FILE ===
with open(FILE_NAME, mode='r', newline='') as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    fieldnames = reader.fieldnames

# === UPDATE ===
updated_count = 0

for row in rows:
    try:
        row_date = datetime.strptime(row["d_date"].strip(), "%Y-%m-%d").date()
    except:
        continue

    if today <= row_date <= end_date:
        # Update iqama
        row["fajr_jamah"] = FAJR_24
        row["zuhr_jamah"] = DHUHR_24
        row["asr_jamah"] = ASR_24
        row["isha_jamah"] = ISHA_24

        # Maghrib = adhan + 8 min
        maghrib_adhan = row["maghrib_begins"].strip()
        row["maghrib_jamah"] = add_minutes(maghrib_adhan, 8)

        updated_count += 1

# === WRITE BACK ===
with open(FILE_NAME, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Updated {updated_count} rows")