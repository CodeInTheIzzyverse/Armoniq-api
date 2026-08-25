import { registerAs } from '@nestjs/config';

export interface GoogleMapsConfig {
	apiKey: string;
}

export default registerAs('googleMaps', () => ({
	apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
}));
