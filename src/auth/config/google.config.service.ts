import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
}

@Injectable()
export class GoogleConfigService {
    constructor(
        private configService: ConfigService
    ) { }

    getGoogleClientId(): string {
        const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID") || process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID is not defined");
        }
        return clientId;
    }

    getGoogleClientSecret(): string {
        const clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET") || process.env.GOOGLE_CLIENT_SECRET;
        if (!clientSecret) {
            throw new Error("GOOGLE_CLIENT_SECRET is not defined");
        }
        return clientSecret;
    }

    getGoogleCallbackUrl(): string {
        const callbackUrl = this.configService.get<string>("GOOGLE_CALLBACK_URL") || process.env.GOOGLE_CALLBACK_URL;
        if (!callbackUrl) {
            throw new Error("GOOGLE_CALLBACK_URL is not defined");
        }
        return callbackUrl;
    }

    getGoogleConfig(): GoogleConfig {
        return {
            clientId: this.getGoogleClientId(),
            clientSecret: this.getGoogleClientSecret(),
            callbackURL: this.getGoogleCallbackUrl(),
        };
    }
}