// function fmt24to12(t: string) {
//   if (!t) return "—";
//   const [hStr, mStr] = t.split(":");
//   const h = parseInt(hStr, 10);
//   const m = mStr ?? "00";
//   const ampm = h >= 12 ? "PM" : "AM";
//   const h12 = h % 12 || 12;
//   return `${h12}:${m} ${ampm}`;
// }

function fmt24to12(t: string) {
  if (!t) return "—";
  
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const h12 = h % 12 || 12;

  let period = "";

  // Determine the Bangla period based on the 24-hour clock hour
  if (h >= 0 && h < 4) {
    period = "রাত";      // 12:00 AM to 3:59 AM
  } else if (h >= 4 && h < 6) {
    period = "ভোর";      // 4:00 AM to 5:59 AM
  } else if (h >= 6 && h < 12) {
    period = "সকাল";     // 6:00 AM to 11:59 AM
  } else if (h >= 12 && h < 15) {
    period = "দুপুর";     // 12:00 PM to 2:59 PM
  } else if (h >= 15 && h < 18) {
    period = "বিকাল";     // 3:00 PM to 5:59 PM
  } else if (h >= 18 && h < 20) {
    period = "সন্ধ্যা";    // 6:00 PM to 7:59 PM
  } else {
    period = "রাত";      // 8:00 PM to 11:59 PM
  }

  // Format: "সকাল 10:30" (Period comes first in Bangla)
  return `${period} ${h12}:${m}`;
}

export { fmt24to12 };