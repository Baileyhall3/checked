export function formatNotifType(type: string) {
    return type
        .split('_')                   // Split by underscore
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' ');                   // Join back with spaces
}

export function capitalize(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}