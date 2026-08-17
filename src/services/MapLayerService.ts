export interface MapTileLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  isSatellite?: boolean;
}

export class MapLayerService {
  private static layers: MapTileLayer[] = [
    {
      id: 'esri-satellite',
      name: 'Vệ tinh Esri World Imagery (Chính xác cao)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
      isSatellite: true
    },
    {
      id: 'google-satellite',
      name: 'Vệ tinh Google Maps Hybrid',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: 'Map data &copy; Google',
      maxZoom: 20,
      isSatellite: true
    },
    {
      id: 'osm-standard',
      name: 'Bản đồ đường bộ OpenStreetMap Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      isSatellite: false
    }
  ];

  public static getAvailableLayers(): MapTileLayer[] {
    return this.layers;
  }

  public static getDefaultLayer(): MapTileLayer {
    return this.layers[0];
  }
}
