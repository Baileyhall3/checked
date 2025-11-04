class DateUtils {
    static toLongDate(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';
        return parsedDate.toDateString(); // Example: "Mon Dec 30 2024"
    }

    static toFullDateTime(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';
    
        return parsedDate.toLocaleString('en-GB', {
            weekday: 'short',  // "Mon"
            year: 'numeric',   // "2024"
            month: 'short',    // "Dec"
            day: '2-digit',    // "30"
            hour: '2-digit',   // "15"
            minute: '2-digit', // "00"
            hour12: false      // Use 24-hour format
        }).replace(',', '');  // Example: Mon Dec 30 2024 15:00
    }    

    static toShortDayMonth(date: Date, dayContext = false) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';
    
        if (dayContext) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to midnight
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
    
            // Compare only the date part
            const parsedDateStr = parsedDate.toDateString();
            const todayStr = today.toDateString();
            const yesterdayStr = yesterday.toDateString();
            const tomorrowStr = tomorrow.toDateString();
    
            if (parsedDateStr === todayStr) return 'Today';
            if (parsedDateStr === yesterdayStr) return 'Yesterday';
            if (parsedDateStr === tomorrowStr) return 'Tomorrow';    
        }

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
        };
    
        return parsedDate.toLocaleDateString('en-US', options);
    }
    

    static toShortDate(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        return `${day}/${month}/${year}`; // Example: "30/12/2024"
    }

    static toDateTime(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';

        const shortDate = DateUtils.toShortDate(parsedDate);
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

        return `${shortDate} ${hours}:${minutes}`; // Example: "30/12/2024 15:45"
    }

    static toTime(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';
    
        return parsedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }     // Example: "15:45"

    static toInputFormatDate(date: Date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        return `${year}-${month}-${day}`; // Example: "2024-12-30"
    }

    static getLast7Days() {
        const today = new Date();
        const last7Days = [];
    
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            
            // Format the date as DD/MM/YYYY
            const formattedDate = ("0" + date.getDate()).slice(-2) + "/" +
                                  ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
                                  date.getFullYear();
            last7Days.push(formattedDate);
        }
    
        return last7Days;
    }

    static toRelevantDateOrTime(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();

        const isSameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        if (isSameDay(date, now)) {
            // Show time if today
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isSameDay(date, yesterday)) {
            return 'Yesterday';
        } else {
            // Show formatted date otherwise
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    /**
     * Convert a time string like "09:00:00" into "09:00"
     * @param time - Time in format "HH:mm:ss" or "H:m:s"
     * @returns Time in format "HH:mm"
     */
    static toShortTime(time: string | null | undefined): string {
        if (!time) return "";

        const parts = time.split(":");
        if (parts.length < 2) return time;

        const hours = parts[0].padStart(2, "0");
        const minutes = parts[1].padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    /**
     * Get the difference in days between 2 dates.
     * @param date1 - Lower date
     * @param date2 - Higher date
     * @returns number of days
     */
    static dateDiff(date1: Date, date2: Date): number {
        const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

        const diffMs = d2.getTime() - d1.getTime();
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    }
}

export default DateUtils;