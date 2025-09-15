// extract-kmz.js
import fs from "fs";
import AdmZip from "adm-zip";
import { parseStringPromise } from "xml2js";

const kmzPath = "./CATEOS.kmz";   // ruta al archivo KMZ
const outputPath = "./CATEOS.json";

async function extractKmz(kmzFile, outputFile) {
  // 1. Abrir KMZ (zip)
  const zip = new AdmZip(kmzFile);
  const entries = zip.getEntries();
  const kmlEntry = entries.find(e => e.entryName.toLowerCase().endsWith(".kml"));

  if (!kmlEntry) {
    throw new Error("No se encontró archivo KML dentro del KMZ.");
  }

  // 2. Leer KML
  const kmlData = kmlEntry.getData().toString("utf8");

  // 3. Parsear KML a JSON
  const kmlObj = await parseStringPromise(kmlData, { explicitArray: false });

  // Navegar hasta los Placemark
  const placemarks = [];
  function collectPlacemarks(node) {
    if (!node) return;
    if (node.Placemark) {
      const pm = Array.isArray(node.Placemark) ? node.Placemark : [node.Placemark];
      placemarks.push(...pm);
    }
    if (node.Document) collectPlacemarks(node.Document);
    if (node.Folder) {
      const folders = Array.isArray(node.Folder) ? node.Folder : [node.Folder];
      for (const f of folders) collectPlacemarks(f);
    }
  }

  collectPlacemarks(kmlObj.kml.Document);

  // 4. Convertir placemarks en JSON simplificado
  const features = placemarks.map(pm => {
    const name = pm.name || null;
    const description = pm.description || null;

    let geometry = null;
    if (pm.Point && pm.Point.coordinates) {
      const coords = pm.Point.coordinates.trim().split(",").map(Number);
      geometry = { type: "Point", coordinates: coords.slice(0, 2) };
    } else if (pm.LineString && pm.LineString.coordinates) {
      const coords = pm.LineString.coordinates.trim().split(/\s+/).map(c => {
        const [lon, lat] = c.split(",").map(Number);
        return [lon, lat];
      });
      geometry = { type: "LineString", coordinates: coords };
    } else if (pm.Polygon) {
      const coordsText = pm.Polygon.outerBoundaryIs.LinearRing.coordinates.trim();
      const coords = coordsText.split(/\s+/).map(c => {
        const [lon, lat] = c.split(",").map(Number);
        return [lon, lat];
      });
      geometry = { type: "Polygon", coordinates: [coords] };
    }

    // ExtendedData
    const extended = {};
    if (pm.ExtendedData) {
      if (pm.ExtendedData.Data) {
        const dataArr = Array.isArray(pm.ExtendedData.Data) ? pm.ExtendedData.Data : [pm.ExtendedData.Data];
        for (const d of dataArr) {
          extended[d.$?.name] = d.value || null;
        }
      }
      if (pm.ExtendedData.SchemaData && pm.ExtendedData.SchemaData.SimpleData) {
        const sdArr = Array.isArray(pm.ExtendedData.SchemaData.SimpleData)
          ? pm.ExtendedData.SchemaData.SimpleData
          : [pm.ExtendedData.SchemaData.SimpleData];
        for (const sd of sdArr) {
          extended[sd.$?.name] = sd._ || null;
        }
      }
    }

    return { name, description, geometry, extended };
  });

  const result = { type: "FeatureCollection", features };

  // 5. Guardar en JSON
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");
  console.log(`✅ Datos extraídos en: ${outputFile}`);
}

extractKmz(kmzPath, outputPath).catch(err => {
  console.error("Error:", err);
});
