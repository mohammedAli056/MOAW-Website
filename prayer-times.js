// Prayer Times Manager
class PrayerTimesManager {
  constructor() {
    this.prayerData = null;
    this.prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    this.init();
  }

  async init() {
    await this.loadCSV();
    this.updatePrayerTimes();
    this.highlightNextPrayer();
    // Update highlighting every minute
    setInterval(() => this.highlightNextPrayer(), 60000);
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

  highlightNextPrayer() {
    const dateKey = this.getCurrentDate();
    const times = this.prayerData[dateKey];
    
    if (!times) return;

    // Get current time in 24-hour format
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 100 + currentMinutes; // Convert to HHMM format (e.g., 1445 for 2:45 PM)

    // Prayer times mapping with their iqama times
    const prayerTimes = [
      { name: 'fajr', iqama: times.fajr_jamah },
      { name: 'dhuhr', iqama: times.zuhr_jamah },
      { name: 'asr', iqama: times.asr_jamah },
      { name: 'maghrib', iqama: times.maghrib_jamah },
      { name: 'isha', iqama: times.isha_jamah }
    ];

    // Find next prayer
    let nextPrayer = null;
    for (let prayer of prayerTimes) {
      const [hours, minutes] = prayer.iqama.split(':');
      const prayerTime = parseInt(hours) * 100 + parseInt(minutes);

      if (prayerTime > currentTime) {
        nextPrayer = prayer.name;
        break;
      }
    }

    // If no prayer found (after Isha), next is Fajr
    if (!nextPrayer) {
      nextPrayer = 'fajr';
    }

    // Remove highlighting from all prayers
    this.prayerOrder.forEach(prayer => {
      this.removeHighlight(prayer);
    });

    // Add highlighting to next prayer
    this.addHighlight(nextPrayer);
  }

  addHighlight(prayerName) {
    // Find all elements with this prayer
    const prayerElements = document.querySelectorAll(`[data-prayer="${prayerName}"]`);
    
    prayerElements.forEach(el => {
      // For table rows
      if (el.tagName === 'TD') {
        const row = el.closest('tr');
        if (row) {
          row.classList.add('prayer-highlight');
        }
      }
      // For divs (index.html)
      else if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
        // Find the parent flex container (the immediate parent div that contains both prayer name and times)
        let parent = el.parentElement;
        while (parent && parent.tagName !== 'SECTION') {
          if (parent.classList.contains('flex') && parent.classList.contains('justify-between')) {
            parent.classList.add('prayer-highlight');
            break;
          }
          parent = parent.parentElement;
        }
      }
      
      // Add highlighted class to the element itself
      el.classList.add('highlighted');
    });
  }

  removeHighlight(prayerName) {
    const prayerElements = document.querySelectorAll(`[data-prayer="${prayerName}"]`);
    
    prayerElements.forEach(el => {
      // For table rows
      if (el.tagName === 'TD') {
        const row = el.closest('tr');
        if (row) {
          row.classList.remove('prayer-highlight');
        }
      }
      // For divs (index.html)
      else if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
        let parent = el.parentElement;
        while (parent && parent.tagName !== 'SECTION') {
          if (parent.classList.contains('flex') && parent.classList.contains('justify-between')) {
            parent.classList.remove('prayer-highlight');
            break;
          }
          parent = parent.parentElement;
        }
      }
      
      el.classList.remove('highlighted');
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
