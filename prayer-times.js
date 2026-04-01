// Prayer Times Manager
class PrayerTimesManager {
  constructor() {
    this.prayerData = null;
    this.init();
  }

  async init() {
    await this.loadCSV();
    this.updatePrayerTimes();
  }

  async loadCSV() {
    try {
      const response = await fetch('prayer-times.csv');
      const csvText = await response.text();
      this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading prayer times CSV:', error);
    }
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    this.prayerData = {};
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const date = values[0].trim();
      
      const data = {
        fajr_begins: values[1].trim(),
        fajr_jamah: values[2].trim(),
        zuhr_begins: values[4].trim(),
        zuhr_jamah: values[5].trim(),
        asr_begins: values[6].trim(),
        asr_jamah: values[8].trim(),
        maghrib_begins: values[9].trim(),
        maghrib_jamah: values[10].trim(),
        isha_begins: values[11].trim(),
        isha_jamah: values[12].trim()
      };
      
      this.prayerData[date] = data;
    }
  }

  getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertTo12Hour(time24) {
    if (!time24) return '--:-- --';
    
    const [hours, minutes] = time24.split(':');
    let hours24 = parseInt(hours, 10);
    const mins = minutes;
    
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    
    return `${String(hours12).padStart(2, '0')}:${mins} ${ampm}`;
  }

  updatePrayerTimes() {
    const dateKey = this.getCurrentDate();
    const times = this.prayerData[dateKey];
    
    if (!times) {
      console.warn(`No prayer times found for ${dateKey}`);
      return;
    }

    // Update prayer time elements based on data attributes
    this.updateElementsByDataAttribute('fajr', times.fajr_begins, times.fajr_jamah);
    this.updateElementsByDataAttribute('dhuhr', times.zuhr_begins, times.zuhr_jamah);
    this.updateElementsByDataAttribute('asr', times.asr_begins, times.asr_jamah);
    this.updateElementsByDataAttribute('maghrib', times.maghrib_begins, times.maghrib_jamah);
    this.updateElementsByDataAttribute('isha', times.isha_begins, times.isha_jamah);
  }

  updateElementsByDataAttribute(prayer, adhanTime, iqamaTime) {
    // Update adhan times
    const adhanElements = document.querySelectorAll(`[data-prayer="${prayer}"][data-time-type="adhan"]`);
    adhanElements.forEach(el => {
      el.textContent = this.convertTo12Hour(adhanTime);
    });

    // Update iqama times
    const iqamaElements = document.querySelectorAll(`[data-prayer="${prayer}"][data-time-type="iqama"]`);
    iqamaElements.forEach(el => {
      el.textContent = this.convertTo12Hour(iqamaTime);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PrayerTimesManager();
  });
} else {
  new PrayerTimesManager();
}
