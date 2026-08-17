import JSZip from 'jszip';
import { ProjectKmlFile, KmlBoundaryFeature, KmlCoordinate } from '../types';

/**
 * Calculates geodesic area of a polygon defined by lat/lng coordinates (in Hectares)
 */
export function calculatePolygonAreaHa(coords: KmlCoordinate[]): number {
  if (!coords || coords.length < 3) return 0;
  
  // Calculate centroid lat in radians for scaling longitude
  const avgLat = (coords.reduce((sum, c) => sum + c.lat, 0) / coords.length) * (Math.PI / 180);
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(avgLat);

  // Shoelace formula in projected meters
  let totalAreaSqMeters = 0;
  const numPoints = coords.length;

  for (let i = 0; i < numPoints; i++) {
    const curr = coords[i];
    const next = coords[(i + 1) % numPoints];

    const x1 = curr.lng * metersPerDegreeLng;
    const y1 = curr.lat * metersPerDegreeLat;
    const x2 = next.lng * metersPerDegreeLng;
    const y2 = next.lat * metersPerDegreeLat;

    totalAreaSqMeters += x1 * y2 - x2 * y1;
  }

  const areaSqMeters = Math.abs(totalAreaSqMeters) / 2;
  return Number((areaSqMeters / 10000).toFixed(2)); // convert m² to Ha
}

/**
 * Parses raw KML XML string into structured KmlBoundaryFeature objects
 */
export function parseKmlXml(xmlText: string, fileName: string, fileSize: number): ProjectKmlFile {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const features: KmlBoundaryFeature[] = [];
  const allCoords: KmlCoordinate[] = [];

  // Search Placemarks
  const placemarks = xmlDoc.getElementsByTagName('Placemark');

  const processCoordString = (coordStr: string): KmlCoordinate[] => {
    const points: KmlCoordinate[] = [];
    const tokens = coordStr.trim().split(/\s+/);

    tokens.forEach(tok => {
      const parts = tok.split(',');
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const alt = parts.length > 2 ? parseFloat(parts[2]) : undefined;

        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          points.push({ lat, lng, alt });
        }
      }
    });
    return points;
  };

  if (placemarks.length > 0) {
    Array.from(placemarks).forEach((pm, idx) => {
      const name = pm.getElementsByTagName('name')[0]?.textContent || `Khu vực ranh rà phá #${idx + 1}`;
      const desc = pm.getElementsByTagName('description')[0]?.textContent || undefined;

      // Check Polygon
      const polygons = pm.getElementsByTagName('Polygon');
      if (polygons.length > 0) {
        Array.from(polygons).forEach(poly => {
          const coordElem = poly.getElementsByTagName('coordinates')[0];
          if (coordElem && coordElem.textContent) {
            const coords = processCoordString(coordElem.textContent);
            if (coords.length > 0) {
              features.push({
                name,
                type: 'Polygon',
                coordinates: coords,
                description: desc,
                styleColor: '#10b981' // emerald
              });
              allCoords.push(...coords);
            }
          }
        });
      }

      // Check LineString
      const lines = pm.getElementsByTagName('LineString');
      if (lines.length > 0) {
        Array.from(lines).forEach(line => {
          const coordElem = line.getElementsByTagName('coordinates')[0];
          if (coordElem && coordElem.textContent) {
            const coords = processCoordString(coordElem.textContent);
            if (coords.length > 0) {
              features.push({
                name: `${name} (Ranh tuyến)`,
                type: 'LineString',
                coordinates: coords,
                description: desc,
                styleColor: '#f59e0b' // amber
              });
              allCoords.push(...coords);
            }
          }
        });
      }

      // Check Point
      const points = pm.getElementsByTagName('Point');
      if (points.length > 0) {
        Array.from(points).forEach(pt => {
          const coordElem = pt.getElementsByTagName('coordinates')[0];
          if (coordElem && coordElem.textContent) {
            const coords = processCoordString(coordElem.textContent);
            if (coords.length > 0) {
              features.push({
                name: `${name} (Mốc ranh)`,
                type: 'Point',
                coordinates: coords,
                description: desc,
                styleColor: '#ef4444' // red
              });
              allCoords.push(...coords);
            }
          }
        });
      }
    });
  } else {
    // Fallback search direct coordinates in doc
    const coordsElems = xmlDoc.getElementsByTagName('coordinates');
    Array.from(coordsElems).forEach((coordElem, i) => {
      if (coordElem.textContent) {
        const coords = processCoordString(coordElem.textContent);
        if (coords.length > 0) {
          features.push({
            name: `Phạm vi tọa độ Ranh #${i + 1}`,
            type: coords.length > 2 ? 'Polygon' : 'LineString',
            coordinates: coords,
            styleColor: '#10b981'
          });
          allCoords.push(...coords);
        }
      }
    });
  }

  // Calculate centroid
  let centerCoordinate: KmlCoordinate | undefined;
  let totalAreaHa = 0;

  if (allCoords.length > 0) {
    const avgLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
    const avgLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;
    centerCoordinate = { lat: Number(avgLat.toFixed(6)), lng: Number(avgLng.toFixed(6)) };

    const polyFeatures = features.filter(f => f.type === 'Polygon');
    if (polyFeatures.length > 0) {
      totalAreaHa = polyFeatures.reduce((sum, f) => sum + calculatePolygonAreaHa(f.coordinates), 0);
    } else if (allCoords.length >= 3) {
      totalAreaHa = calculatePolygonAreaHa(allCoords);
    }
  }

  const fileType = fileName.toLowerCase().endsWith('.kmz') ? 'kmz' : 'kml';

  return {
    id: `kml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fileName,
    fileType,
    fileSize,
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    kmlContentXml: xmlText,
    boundaryFeatures: features,
    centerCoordinate,
    totalAreaHa: Number(totalAreaHa.toFixed(2))
  };
}

/**
 * Handles file upload for both .kml and .kmz files
 */
export async function readKmlOrKmzFile(file: File): Promise<ProjectKmlFile> {
  const isKmz = file.name.toLowerCase().endsWith('.kmz');

  if (isKmz) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    // Find doc.kml or any .kml file inside zip
    let kmlFileName = Object.keys(contents.files).find(name => name.toLowerCase().endsWith('.kml'));
    if (!kmlFileName) {
      throw new Error('File KMZ không chứa file KML hợp lệ inside!');
    }
    const xmlText = await contents.files[kmlFileName].async('string');
    return parseKmlXml(xmlText, file.name, file.size);
  } else {
    const xmlText = await file.text();
    return parseKmlXml(xmlText, file.name, file.size);
  }
}

/**
 * Generates sample KML data for testing if no file uploaded yet
 */
export function generateSampleKmlFile(projectName: string, locationStr?: string): ProjectKmlFile {
  // Sample coordinates for Quảng Trị / Central Vietnam UXO project
  const sampleCoords: KmlCoordinate[] = [
    { lat: 16.892145, lng: 106.982112, alt: 25 },
    { lat: 16.897852, lng: 106.994532, alt: 30 },
    { lat: 16.891204, lng: 106.998901, alt: 22 },
    { lat: 16.883410, lng: 106.989124, alt: 18 },
    { lat: 16.885620, lng: 106.981540, alt: 20 },
    { lat: 16.892145, lng: 106.982112, alt: 25 }
  ];

  const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Ranh ranh giới thi công rà phá bom mìn - ${projectName}</name>
    <Placemark>
      <name>Ranh rà phá khu vực A - ${projectName}</name>
      <description>Ranh giới khảo sát thi công RPBM giai đoạn 1</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${sampleCoords.map(c => `${c.lng},${c.lat},${c.alt || 0}`).join(' ')}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

  return parseKmlXml(xmlSample, `Ranh_ViTri_DuAn_${projectName.replace(/\s+/g, '_')}.kml`, 12840);
}
