/* Веб-шим AsyncStorage поверх localStorage (тот же асинхронный контракт). */
const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    window.localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  },
  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((k) => window.localStorage.removeItem(k));
  },
  async clear(): Promise<void> {
    window.localStorage.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return Object.keys(window.localStorage);
  },
};

export default AsyncStorage;
