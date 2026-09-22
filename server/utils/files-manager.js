import _ from 'underscore';
import path from 'node:path';
import storage, {TEMPORAL_FOLDER} from './storage.js';

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

        if (!storage.isTemporal(value)) {
          return null;
        }

        const destinationPath = path.join(property.folder, value.replace(`${TEMPORAL_FOLDER}/`, ''));

        if (!destinationPath.startsWith(`${property.folder}/`)) {
          throw {error: 'Ruta de archivo inválida', status: 400};
        }

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
