export interface SpaceEvent {
  id: string;
  name: string;
  title?: string;
  net?: string;
  window_start?: string;
  launch_service_provider?: {
    name: string;
    abbrev?: string;
    description?: string;
    info_url?: string;
  };
  agency?: {
    name: string;
    abbrev?: string;
  };
  location?: {
    name: string;
  };
  pad?: {
    location: {
      name: string;
      map_url?: string;
    };
  };
  image?: string;
  description?: string;
  explanation?: string;
  mission?: {
    description?: string;
  };
  vidURLs?: Array<{
    url: string;
    title?: string;
  }>;
}

export interface NASAEvent {
  id: string;
  title: string;
  link: string;
  categories: Array<{
    id: number;
    title: string;
  }>;
  geometries: Array<{
    date: string;
    type: string;
    coordinates: [number, number];
  }>;
  explanation?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
