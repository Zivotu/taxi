// Function to get ISO week number
export const getWeekNumber = (d: Date): number => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export const getYearAndWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const getYearAndMonth = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  try {
    const date = new Date(dateString);
     // Provjera je li datum ispravan prije formatiranja
    if (isNaN(date.getTime())) {
        // Ako je datum neispravan (npr. zbog unosa 'yyyy-mm-ddT...'), pokušaj parsirati samo datumski dio
        const ISODateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
        if (ISODateMatch) {
            const simplerDate = new Date(ISODateMatch[1] + "T00:00:00Z"); // Osiguraj UTC interpretaciju samo datuma
             if (!isNaN(simplerDate.getTime())) {
                return simplerDate.toLocaleDateString('hr-HR', options);
            }
        }
        return dateString; // Vrati originalni string ako je parsiranje neuspješno
    }
    return date.toLocaleDateString('hr-HR', options);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Vrati originalni string u slučaju greške
  }
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};