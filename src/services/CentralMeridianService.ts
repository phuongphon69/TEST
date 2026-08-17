import {
  getAllKttConfigs,
  findKttConfigForProvince,
  validateKttMatch,
  ProvinceKttConfig
} from '../utils/centralMeridianConfig';

export class CentralMeridianService {
  /**
   * Returns suggested KTT (Kinh tuyến trục) for a given province name.
   * Returns null if no match found (never invents unconfigured values).
   */
  public static getSuggestedMeridian(provinceName: string): number | null {
    if (!provinceName) return null;
    const config = findKttConfigForProvince(provinceName);
    return config ? config.centralMeridian : null;
  }

  /**
   * Validate if selected meridian matches standard for a province
   */
  public static validateProvinceKtt(provinceName: string, selectedMeridian: number) {
    return validateKttMatch(provinceName, selectedMeridian);
  }

  /**
   * Get complete dictionary of all provinces and central meridians
   */
  public static getAllMeridians(): ProvinceKttConfig[] {
    return getAllKttConfigs();
  }
}
