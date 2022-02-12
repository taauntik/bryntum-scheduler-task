public with sharing class SchedulingComponentController {
    @AuraEnabled
    public static Event saveEvent(Event item) {
        upsert item;
        return item;
    }

    @AuraEnabled
    public static Boolean removeEvents(String[] ids) {
        Event[] target = [SELECT Id FROM Event WHERE Id IN :ids];

        try {
            delete target;
            return true;
        } catch (DmlException e) {
            return false;
        }
    }

    @AuraEnabled
    public static Event createEvent(Event item) {
        String userId = UserInfo.getUserId();
        item.OwnerId = userId;

        upsert item;
        return item;
    }

    @AuraEnabled
    public static List<Property__c> getProperties() {
        return [SELECT Id, Name, Date_Listed__c, Date_Closed__c, Picture__c, Broker__r.Picture_IMG__c
                FROM Property__c];
    }

    @AuraEnabled
    public static List<Event> getEvents() {
        return [SELECT Id, WhatId, StartDateTime, EndDateTime, Subject
            FROM Event];
    }
}
