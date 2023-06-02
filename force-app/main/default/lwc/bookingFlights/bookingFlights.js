import { LightningElement, api, wire } from 'lwc';
import getAirportName from '@salesforce/apex/FlightController.getAirportName';

export default class BookingFlight extends LightningElement {
  @api recordId;
  airportName;

  @wire(getAirportName, { airportId: '$recordId' })
  wiredGetAirportName({ error, data }) {
    if (data) {
      this.airportName = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.airportName = undefined;
    }
  }
}