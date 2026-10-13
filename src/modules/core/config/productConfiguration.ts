import { readProductDeployment } from './productDeployment';

// Select individual public values. Never spread the complete Vite environment.
export const productDeployment = readProductDeployment({
  VITE_INSTALLATION_ID: import.meta.env.VITE_INSTALLATION_ID,
  VITE_INSTALLATION_NAME: import.meta.env.VITE_INSTALLATION_NAME,
  VITE_INSTALLATION_MODE: import.meta.env.VITE_INSTALLATION_MODE,
  VITE_PUBLIC_RELEASE_STAGE: import.meta.env.VITE_PUBLIC_RELEASE_STAGE,
  VITE_DATA_CONTROLLER_NAME: import.meta.env.VITE_DATA_CONTROLLER_NAME,
  VITE_DATA_CONTROLLER_DOCUMENT: import.meta.env.VITE_DATA_CONTROLLER_DOCUMENT,
  VITE_PRIVACY_CONTACT_EMAIL: import.meta.env.VITE_PRIVACY_CONTACT_EMAIL,
});
