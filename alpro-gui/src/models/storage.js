class Storage {
  constructor(...storeNames) {
    let openRequest = indexedDB.open("database");

    // initialization
    openRequest.onupgradeneeded = () => {
      let db = openRequest.result;

      storeNames.forEach((name) => {
        if (!db.objectStoreNames.contains(name))
          db.createObjectStore(name);
      });
    };

    // error
    openRequest.onerror = () => {
      console.log("Error", openRequest.error);
    }
  }

  getDatabaseConnection() {
    let openRequest = indexedDB.open("database");

    return new Promise((resolve, reject) => {
      openRequest.onsuccess = () => resolve(openRequest.result);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onupgradeneeded = () => reject("Database out of date");
    });
  }

  asyncWrapper(storeName, mode, requestBuilder) {
    return this.getDatabaseConnection()
      .then(db => {
        let transaction = db.transaction(storeName, mode);
        let requests = requestBuilder(transaction);

        return new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve(requests.map(req => req.result));
          transaction.onerror = () => reject(requests.map(req => req.error));
        });
      });
  }

  getFullStoreByName(name) {
    return this.asyncWrapper(name, 'readonly',
      (transaction) => {
        return [transaction.objectStore(name).getAll()];
      }
    ).then(res => res[0]);
  }

  updateStoreWithValue(name, indexerFunction, value, indexMaxSize) {
    // updateLocalStorageIndexValue

    return this.asyncWrapper(name, 'readwrite',
      (transaction) => {
        const obj = {
          timestamp: new Date(),
          value,
        };
        const key = indexerFunction(value);
        // somehow limit size ?
        return [transaction.objectStore(name).put(obj, key)];
      }
    ).then(res => res[0]);
  }

  updateStoreWithValues(name, indexerFunction, values, indexMaxSize) {
    // updateLocalStorageIndexValues

    return this.asyncWrapper(name, 'readwrite',
      (transaction) => {
        let store = transaction.objectStore(name);
        let reqs = [];
        values.forEach(value => {
          const obj = {
            timestamp: new Date(),
            value,
          };

          const key = indexerFunction(value);
          // somehow limit size ?
          reqs.push(store.put(obj, key));
        });

        return reqs;
      }
    ).then(res => res);
  }

  getValueFromStore(name, subKey) {
    // getValueFromLocalStorageIndex

    return this.asyncWrapper(name, 'readonly',
      (transaction) => {
        return [transaction.objectStore(name).get(subKey)];
      }
    ).then(res => res[0].value);
  }

  getValuesFromStore(name, subKeys) {
    // getValuesFromLocalStorageIndex

    return this.asyncWrapper(name, 'readonly',
      (transaction) => {
        let store = transaction.objectStore(name);
        let reqs = [];
        subKeys.forEach(subKey => {
          reqs.push(store.get(subKey));
        });
        return reqs;
      }
    ).then(res => res.map(obj => obj.value));
  }
}

export const STORE_NAME_FILE_INDEX = 'file-index';
export const STORE_NAME_RECENT_PROJECTS = 'recent-projects';

const storage = new Storage(STORE_NAME_FILE_INDEX, STORE_NAME_RECENT_PROJECTS);

export default storage;