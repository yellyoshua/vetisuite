import _ from 'underscore';
import path from 'node:path';
import storage from './storage.js';

/*
 * Copia server-local del files-manager del client. Automatiza el flujo temporal/ → carpeta final:
 * `process(data)` reescribe en el snapshot las props declaradas que apunten a `temporal/...` a su
 * ruta destino y devuelve los movimientos; `load(fileMoves)` los ejecuta tras el handler.
 */
export default function filesManager (filesConfig = {}) {
  const properties = _(Object.keys(filesConfig)).map((property) => {
    return {
      property: property,
      folder: filesConfig[property].folder,
      type: filesConfig[property].type
    };
  });

  return {
    process (data = {}) {
      if (!_(properties).size()) {
        return {snapshot: data, fileMoves: []};
      }

      const snapshot = _(data).clone();

      const fileMoves = _(properties).chain()
      .map((property) => {
        const value = snapshot[property.property];

        if (!isTemporalFile(value)) {
          return null;
        }

        const destinationPath = path.join(property.folder, value.replace('temporal/', ''));
        snapshot[property.property] = destinationPath;

        return {source: value, destination: destinationPath};
      })
      .compact()
      .value();

      return {snapshot, fileMoves};
    },
    async load (fileMoves = []) {
      if (_(fileMoves).size()) {
        await Promise.all(_(fileMoves).map((move) => storage.move(move.source, move.destination)));
      }
    }
  };
}

function isTemporalFile (filePath) {
  return filePath && typeof filePath === 'string' && filePath.startsWith('temporal/');
}
