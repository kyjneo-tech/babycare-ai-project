import { StateCreator } from 'zustand';

export const logger = <T>(
  config: StateCreator<T>
): StateCreator<T> => (set, get, api) =>
  config(
    (args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('  applying', args);
      }
      set(args);
      if (process.env.NODE_ENV === 'development') {
        console.log('  new state', get());
      }
    },
    get,
    api
  );
