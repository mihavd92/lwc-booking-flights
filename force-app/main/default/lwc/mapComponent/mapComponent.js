import { LightningElement } from 'lwc';

export default class MapComponent extends LightningElement {

    mapMarkers = [
        {
          location: {
            Latitude: '48.340603615390016',
           Longitude: '29.867023510972963',
           },
         },
       ];
       
       zoomLevel = 14;

}

