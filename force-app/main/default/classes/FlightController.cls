public with sharing class FlightController {

    @AuraEnabled(cacheable=true)
    public static String getAirportName(Id airportId) {
        Airport__c airport = [SELECT Name FROM Airport__c WHERE Id = :airportId];
        return airport.Name;
    }
    
    @AuraEnabled(cacheable=true)
    public static Airport__c searchAirports(String iataCode) {
        List<Airport__c> airports = [SELECT Id, Name, Location__Latitude__s, Location__Longitude__s FROM Airport__c WHERE IATA__c = :iataCode LIMIT 1];
        return airports.isEmpty() ? null : airports[0];
    }

    private static Decimal calculateDistance(Decimal airport1Latitude, Decimal airport1Longitude, Decimal airport2Latitude, Decimal airport2Longitude) {
        Integer earthRadius = 6371;
        Decimal latitudeRadians1 = airport1Latitude * Math.PI/180; 
        Decimal latitudeRadians2 = airport2Latitude * Math.PI/180;
        Decimal latitudeDelta = (airport2Latitude - airport1Latitude) * Math.PI/180; 
        Decimal longitudeDelta = (airport2Longitude - airport1Longitude) * Math.PI/180;
        Decimal a = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) + Math.cos(latitudeRadians1) * Math.cos(latitudeRadians2) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);
        Decimal arc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        Decimal distance = earthRadius * arc;
        return distance;
    }

    @AuraEnabled(cacheable=true)
    public static Decimal getDistanceBetweenAirports(Id airportId1, Id airportId2) {
    Airport__c airport1 = [SELECT Location__Latitude__s, Location__Longitude__s FROM Airport__c WHERE Id = :airportId1];
    Airport__c airport2 = [SELECT Location__Latitude__s, Location__Longitude__s FROM Airport__c WHERE Id = :airportId2];
    return calculateDistance(airport1.Location__Latitude__s, airport1.Location__Longitude__s, airport2.Location__Latitude__s, airport2.Location__Longitude__s);
}
}