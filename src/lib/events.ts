import type { DynamicEvent } from "./api";
import { getPublicEventsApi, getPublicSliderEventsApi, getPublicEventBySlugApi } from "./api";

export type EventData = DynamicEvent;

export const fetchEvents = async (): Promise<EventData[]> => {
  const data = await getPublicEventsApi();
  return data?.events || [];
};

export const fetchSliderEvents = async (): Promise<EventData[]> => {
  const data = await getPublicSliderEventsApi();
  return data?.events || [];
};

export const getEventBySlug = async (slug: string): Promise<EventData | null> => {
  if (!slug) return null;
  const data = await getPublicEventBySlugApi(slug);
  return data?.event || null;
};
