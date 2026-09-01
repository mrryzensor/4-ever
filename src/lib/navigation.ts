export const generateGoogleMapsLink = (venue?: string, address?: string): string => {
  const query = [venue, address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const generateGoogleMapsDirLink = (venue?: string, address?: string): string => {
  const destination = [venue, address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
};
