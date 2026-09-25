import { initializeFederation } from './app/core/federation/mfe-manifest';

initializeFederation()
  .then((manifest) => {
    (window as Window & { __fintrackMfeManifest?: typeof manifest }).__fintrackMfeManifest = manifest;
    return import('./bootstrap');
  })
  .catch((error: unknown) => {
    console.error('FinTrack federation initialization failed', error);
    document.body.innerHTML = '<main class="startup-error"><h1>FinTrack is unavailable</h1><p>The application configuration could not be loaded. Refresh and try again.</p></main>';
  });
