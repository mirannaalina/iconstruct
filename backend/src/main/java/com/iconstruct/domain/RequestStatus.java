package com.iconstruct.domain;

public enum RequestStatus {
    ACTIVE,       // Cerere activă, așteaptă oferte
    IN_PROGRESS,  // O ofertă a fost acceptată, lucrare în derulare
    ON_THE_WAY,   // Meseriaș pe drum
    WORKING,      // Meseriaș la lucru
    COMPLETED,    // Finalizat
    CANCELLED,    // Anulat
    EXPIRED       // Expirat fără ofertă acceptată
}
