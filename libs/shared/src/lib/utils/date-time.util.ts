import moment = require('moment');

export class DateTimeUtil {
  static getExpiryDate(minutes: number) {
    const createdAt = new Date();
    return moment(createdAt).add(minutes, 'minutes').toDate();
  }

  static isTokenExpired(expiryDate: Date) {
    const expirationDate = new Date(expiryDate);
    const currentDate = new Date();
    return expirationDate.getTime() <= currentDate.getTime();
  }
}
