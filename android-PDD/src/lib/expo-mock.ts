export const setNotificationHandler = () => {};
export const getPermissionsAsync = async () => ({ status: 'granted' });
export const requestPermissionsAsync = async () => ({ status: 'granted' });
export const getExpoPushTokenAsync = async () => ({ data: 'mock-token' });
export const setNotificationChannelAsync = async () => {};
export const scheduleNotificationAsync = async () => {};
export const AndroidImportance = { MAX: 5 };

export const isDevice = false;

export class LegacyEventEmitter {}
export class EventEmitter {
  addListener() { return { remove: () => {} }; }
  emit() {}
}
export class UnavailabilityError extends Error {}
export const uuid = {
  v4: () => 'mock-uuid',
};
export const AndroidNotificationPriority = {
  MAX: 'max',
  HIGH: 'high',
  DEFAULT: 'default',
  LOW: 'low',
  MIN: 'min',
};

// Mocks for expo-modules-core
export class NativeModule {}
export const registerWebModule = () => {};
export class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// PermissionStatus — required by expo core re-exports
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNDETERMINED = 'undetermined',
}
export type PermissionExpiration = 'never' | number;
export type PermissionResponse = {
  status: PermissionStatus;
  expires: PermissionExpiration;
  granted: boolean;
  canAskAgain: boolean;
};

// Stubs for expo-image-picker (used via dynamic import on mobile only)
export const MediaTypeOptions = { Images: 'Images', Videos: 'Videos', All: 'All' };
export const requestMediaLibraryPermissionsAsync = async () => ({ status: PermissionStatus.GRANTED, granted: true, canAskAgain: true, expires: 'never' });
export const launchImageLibraryAsync = async () => ({ canceled: true, assets: [] });
