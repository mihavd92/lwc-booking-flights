import { LightningElement, track, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import searchAirports from '@salesforce/apex/FlightController.searchAirports';
import FLIGHT_OBJECT from '@salesforce/schema/Flight__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDistanceBetweenAirports from '@salesforce/apex/FlightController.getDistanceBetweenAirports';

export default class SearchComponent extends LightningElement {
    @track airportName;
    @track showSaveButton = false;
    @track airportId;
    @api departureAirportId;

    handleInput(event) {
        const iataCode = event.target.value;
        if (iataCode.length === 3) {
            searchAirports({ iataCode })
                .then(result => {
                    if (result) {
                        this.airportName = result.Name;
                        this.showSaveButton = true;

                        this.mapMarkers = [
                            {
                                location: {
                                    Latitude: result.Location__Latitude__s,
                                    Longitude: result.Location__Longitude__s,
                                },
                            },
                        ];

                        this.zoomLevel = 14;

                        // Set the airportId variable to the selected airport's Id
                        this.airportId = result.Id;
                    } else {
                        this.airportName = 'Введіть IATA код існуючого аеропорту';
                    }
                })
                .catch(error => {
                    this.airportName = 'Помилка: ' + error.message;
                });
        } else {
            this.airportName = null;
        }
    }

    handleClearInput() {
        const inputElement = this.template.querySelector('input');
        inputElement.value = '';
        this.airportName = null;
        this.showSaveButton = false;
    }

    handleSaveFlight() {
        const fields = {};
        fields['Name'] = `New Flight - ${new Date().getDate()}`;
        fields['Departure_Airport__c'] = this.departureAirportId;
        fields['Arrival_Airport__c'] = this.airportId;
        fields['Status__c'] = 'Scheduled Flight';
    
        getDistanceBetweenAirports({ airportId1: fields['Departure_Airport__c'], airportId2: fields['Arrival_Airport__c'] })
            .then(distance => {
                const roundedDistance = Math.round(distance);
                fields['Distance__c'] = roundedDistance;
                const toastMessage = `New Flight was created. Distance - ${roundedDistance} km.`;
                if (fields['Departure_Airport__c'] === fields['Arrival_Airport__c']) {
                    const toastEvent = new ShowToastEvent({
                        title: 'Error!',
                        message: 'Виберіть інший аеропорт',
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                    return;
                }
    
                const recordInput = { apiName: FLIGHT_OBJECT.objectApiName, fields };
    
                createRecord(recordInput)
                    .then(flight => {
                        console.log('Flight saved: ', flight.id);
                        const toastEvent = new ShowToastEvent({
                            title: 'Success!',
                            message: toastMessage,
                            variant: 'success'
                        });
                        this.dispatchEvent(toastEvent);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
    }
    
    
}
