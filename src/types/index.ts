export interface SpaceEvent {
  id: string;
  name: string;
  title?: string;
  net?: string;
  window_start?: string;
  status?: {
    name: string;
    abbrev: string;
  };
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
    name?: string;
    latitude?: string;
    longitude?: string;
    total_launch_count?: number;
    location: {
      name: string;
      map_url?: string;
      country_code?: string;
    };
  };
  rocket?: {
    configuration?: {
      name: string;
      full_name?: string;
      family?: string;
      variant?: string;
      reusable?: boolean;
      launch_mass?: number;
    };
    launcher_stage?: Array<{
      type?: string;
      reused?: boolean;
      flight_number?: number | null;
    }>;
  };
  mission?: {
    name?: string;
    description?: string;
    type?: string;
    orbit?: {
      name: string;
      abbrev: string;
    };
    patches?: Array<{
      name: string;
      image_url: string;
    }>;
  };
  spacecraft_flight?: {
    spacecraft?: {
      name: string;
      status?: { name: string };
      spacecraft_config?: {
        name: string;
        type?: { name: string };
      };
    };
  };
  image?: string;
  description?: string;
  explanation?: string;
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
