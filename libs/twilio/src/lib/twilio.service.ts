import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio/lib';

@Injectable()
export class TwilioService implements OnModuleInit {
  private readonly logger = new Logger(TwilioService.name);

  private accountSid: string | undefined;
  private authToken: string | undefined;
  private phoneNumber: string | undefined;

  private client: Twilio;

  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    const twilio = await this.configService.get('twilio');
    this.accountSid = twilio.accountSID;
    this.authToken = twilio.authToken;
    this.phoneNumber = twilio.phoneNumber;

    this.client = new Twilio(this.accountSid, this.authToken);
  }

  async sendSms(to: string, body: string) {
    try {
      await this.client.messages.create({
        from: this.phoneNumber,
        to,
        body,
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
