import type { DeliveryLocation } from '@/types';

export function savedDeliveryLocation(label: string, coordinates: { latitude: number; longitude: number } | null): DeliveryLocation {
  if (coordinates && hasDeliveryLocation(coordinates)) return coordinates;
  const pincode = label.match(/\b[1-9]\d{5}\b/)?.[0];
  return pincode ? { pincode } : {};
}

export function locationFromParams(params: URLSearchParams): DeliveryLocation {
  const pincode = params.get('pincode')?.trim();
  const lat = params.get('lat');
  const lon = params.get('lon');
  if (pincode && !/^[1-9]\d{5}$/.test(pincode)) throw new Error('Enter a valid six-digit Indian pincode.');
  const hasCoordinates = lat !== null || lon !== null;
  if (hasCoordinates && (!lat?.trim() || !lon?.trim() || !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lon)) || Math.abs(Number(lat)) > 90 || Math.abs(Number(lon)) > 180)) {
    throw new Error('A valid latitude and longitude must be supplied together.');
  }
  return {
    ...(pincode ? { pincode } : {}),
    ...(hasCoordinates ? { latitude: Number(lat), longitude: Number(lon) } : {}),
  };
}

export function hasDeliveryLocation(location: DeliveryLocation): boolean {
  return Boolean((location.pincode && /^[1-9]\d{5}$/.test(location.pincode)) ||
    (typeof location.latitude === 'number' && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
     typeof location.longitude === 'number' && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180));
}

export function appendDeliveryLocation(params: URLSearchParams, label: string,
  coordinates: { latitude: number; longitude: number } | null): void {
  params.delete('pincode');
  params.delete('lat');
  params.delete('lon');
  if (coordinates && hasDeliveryLocation(coordinates)) {
    params.set('lat', String(coordinates.latitude));
    params.set('lon', String(coordinates.longitude));
  } else {
    // Also support labels saved by the previous location picker, such as "Noida, 201301".
    const pincode = label.match(/\b[1-9]\d{5}\b/)?.[0];
    if (pincode) params.set('pincode', pincode);
  }
}
