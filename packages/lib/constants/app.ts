import { env } from '@documenso/lib/utils/env';

export const APP_DOCUMENT_UPLOAD_SIZE_LIMIT =
  Number(env('NEXT_PUBLIC_DOCUMENT_SIZE_UPLOAD_LIMIT')) || 50;

export const NEXT_PUBLIC_WEBAPP_URL = () => {
  const url = env('NEXT_PUBLIC_WEBAPP_URL');
  
  // Remove trailing slash if present
  const cleanUrl = url ? url.replace(/\/$/, '') : 'http://localhost:3000';
  
  console.log('NEXT_PUBLIC_WEBAPP_URL called, returning:', cleanUrl);
  
  return cleanUrl;
};

export const NEXT_PRIVATE_INTERNAL_WEBAPP_URL =
  env('NEXT_PRIVATE_INTERNAL_WEBAPP_URL') ?? NEXT_PUBLIC_WEBAPP_URL();

export const IS_BILLING_ENABLED = () => env('NEXT_PUBLIC_FEATURE_BILLING_ENABLED') === 'true';

export const API_V2_BETA_URL = '/api/v2-beta';
