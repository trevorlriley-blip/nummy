export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  rating?: number;
  priceLevel?: 1 | 2 | 3;
  openNow?: boolean;
  phoneNumber?: string;
  storeType: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
