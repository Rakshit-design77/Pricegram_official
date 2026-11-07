"use client";

import { useSyncExternalStore } from 'react';
import { useStore } from '@/store/useStore';
import { hasDeliveryLocation, savedDeliveryLocation } from '@/lib/deliveryLocation';

const subscribe = (notify: () => void) => {
  const started = useStore.persist?.onHydrate(notify) || (() => {});
  const finished = useStore.persist?.onFinishHydration(notify) || (() => {});
  return () => { started(); finished(); };
};
const hydratedSnapshot = () => useStore.persist?.hasHydrated() ?? true;
const serverSnapshot = () => false;

export function useDeliveryLocation() {
  const location = useStore(state => state.location);
  const coordinates = useStore(state => state.locationCoordinates);
  const hydrated = useSyncExternalStore(subscribe, hydratedSnapshot, serverSnapshot);
  return { hydrated, ready: hydrated && hasDeliveryLocation(savedDeliveryLocation(location, coordinates)) };
}
