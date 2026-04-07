import csv
from datetime import datetime, timedelta

# === SETTINGS ===
FILE_NAME = "prayer-times.csv"
DAYS_TO_UPDATE = 30

# === 12-HOUR INPUT (AUTO-CONVERTED) ===
FAJR = "6:00 AM"
DHUHR = "1:45 PM"
ASR = "6:30 PM"
ISHA = "9:45 PM"

# === FUNCTION: 12h → 24h ===
def convert_to_24(time_str):
    return datetime.strptime(time_str, "%I:%M %p").strftime("%H:%M:%S")

# === FUNCTION: ADD MINUTES ===
def add_minutes(time_str, minutes):
    t = datetime.strptime(time_str, "%H:%M:%S")
    t += timedelta(minutes=minutes)
    return t.strftime("%H:%M:%S")

# Convert fixed times
FAJR_24 = convert_to_24(FAJR)
DHUHR_24 = convert_to_24(DHUHR)
ASR_24 = convert_to_24(ASR)
ISHA_24 = convert_to_24(ISHA)

# === DATE RANGE ===
today = datetime.today()
end_date = today + timedelta(days=DAYS_TO_UPDATE)

# === READ FILE ===
with open(FILE_NAME, mode='r', newline='') as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    fieldnames = reader.fieldnames

# === UPDATE ===
for row in rows:
    row_date = datetime.strptime(row["d_date"], "%Y-%m-%d")

    if today <= row_date <= end_date:
        # Regular iqama updates
        row["fajr_jamah"] = FAJR_24
        row["zuhr_jamah"] = DHUHR_24
        row["asr_jamah"] = ASR_24
        row["isha_jamah"] = ISHA_24

        # 🔥 MAGHRIB = adhan + 8 minutes
        maghrib_adhan = row["maghrib_begins"]
        row["maghrib_jamah"] = add_minutes(maghrib_adhan, 8)

# === WRITE BACK ===
with open(FILE_NAME, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("✅ Updated iqama (Maghrib = adhan + 8 min)")