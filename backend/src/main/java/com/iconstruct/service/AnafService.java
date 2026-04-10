package com.iconstruct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnafService {

    private static final String ANAF_API_URL = "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AnafService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Validates a CUI and returns company information from ANAF
     * @param cui The company's unique identification code (without "RO" prefix)
     * @return CompanyInfo object with company details, or null if not found
     */
    public CompanyInfo validateCui(String cui) {
        try {
            // Clean the CUI - remove "RO" prefix if present and any spaces
            String cleanCui = cui.toUpperCase().replace("RO", "").replaceAll("\\s+", "").trim();

            // Validate that CUI contains only digits
            if (!cleanCui.matches("\\d+")) {
                throw new RuntimeException("CUI invalid - trebuie să conțină doar cifre");
            }

            // Prepare request body
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            List<Map<String, String>> requestBody = List.of(
                Map.of("cui", cleanCui, "data", today)
            );

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            // Make request to ANAF API
            ResponseEntity<String> response = restTemplate.exchange(
                ANAF_API_URL,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode found = root.path("found");

                if (found.isArray() && found.size() > 0) {
                    JsonNode company = found.get(0);
                    JsonNode dateGenerale = company.path("date_generale");

                    if (!dateGenerale.isMissingNode()) {
                        CompanyInfo info = new CompanyInfo();
                        info.setCui(cleanCui);
                        info.setName(dateGenerale.path("denumire").asText(""));
                        info.setAddress(dateGenerale.path("adresa").asText(""));
                        info.setValid(true);

                        // Check if company is active
                        String stare = dateGenerale.path("stare_inregistrare").asText("");
                        info.setActive(stare.isEmpty() || stare.equalsIgnoreCase("INREGISTRAT"));

                        return info;
                    }
                }

                // Check if CUI was not found
                JsonNode notFound = root.path("notfound");
                if (notFound.isArray() && notFound.size() > 0) {
                    throw new RuntimeException("CUI-ul " + cleanCui + " nu a fost găsit în baza de date ANAF");
                }
            }

            throw new RuntimeException("Nu s-a putut valida CUI-ul. Verificați și încercați din nou.");

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Eroare la comunicarea cu ANAF: " + e.getMessage());
        }
    }

    /**
     * DTO for company information from ANAF
     */
    public static class CompanyInfo {
        private String cui;
        private String name;
        private String address;
        private boolean valid;
        private boolean active;

        // Getters and setters
        public String getCui() { return cui; }
        public void setCui(String cui) { this.cui = cui; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }
}
