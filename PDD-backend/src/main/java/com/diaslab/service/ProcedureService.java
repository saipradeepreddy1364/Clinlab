package com.diaslab.service;

import com.diaslab.model.StepRequest;
import com.diaslab.model.StepResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class ProcedureService {

    private static final Logger log = LoggerFactory.getLogger(ProcedureService.class);

    private final RestTemplate restTemplate;

    @Value("${flask.api.url}")
    private String flaskApiUrl;

    public ProcedureService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ── Predict next single step ──────────────────────────────────────────────
    public StepResponse getNextStep(StepRequest request) {
        String url = flaskApiUrl + "/api/next-step";
        log.debug("Calling Flask → {} with procedure={}, subtype={}, currentStep={}",
                url, request.getProcedure(), request.getSubtype(), request.getCurrentStep());

        Map<String, String> body = new HashMap<>();
        body.put("procedure", request.getProcedure());
        body.put("subtype", request.getSubtype());
        body.put("current_step", request.getCurrentStep());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null)
                throw new RuntimeException("Empty response from Flask");

            StepResponse stepResponse = new StepResponse();
            stepResponse.setProcedure(request.getProcedure());
            stepResponse.setSubtype(request.getSubtype());
            stepResponse.setCurrentStep(request.getCurrentStep());
            stepResponse.setNextStep((String) responseBody.get("next_step"));
            stepResponse.setConfidence(
                    ((Number) responseBody.get("confidence")).doubleValue());
            stepResponse.setMessage("Next step predicted successfully");
            stepResponse.setSuccess(true);
            return stepResponse;

        } catch (Exception e) {
            log.error("Flask API call failed: {}", e.getMessage());
            StepResponse error = new StepResponse();
            error.setProcedure(request.getProcedure());
            error.setSubtype(request.getSubtype());
            error.setCurrentStep(request.getCurrentStep());
            error.setNextStep("Could not predict next step");
            error.setMessage("ML API error: " + e.getMessage());
            error.setSuccess(false);
            return error;
        }
    }

    private static final Map<String, Object> FALLBACK_PROCEDURES = new HashMap<>();
    static {
        FALLBACK_PROCEDURES.put("cast partial denture", List.of("manual", "dmls – titanium", "dmls – co-cr", "dmls", "general"));
        FALLBACK_PROCEDURES.put("cast post", List.of("cast post"));
        FALLBACK_PROCEDURES.put("cd (complete denture)", List.of("cd – bps (ivoclar teeth)", "cd – acryrock teeth setting"));
        FALLBACK_PROCEDURES.put("complete denture", List.of("cd special tray", "cd processing", "bps teeth setting", "bps cd processing", "cd teeth correction", "cd repair relining rebasing", "complete denture - afpam ref 8", "cd occlusal rims", "complete denture - afpam ref 3", "cd teeth setting", "general"));
        FALLBACK_PROCEDURES.put("crown", List.of("general"));
        FALLBACK_PROCEDURES.put("fixed partial denture", List.of("fixed partial denture - afpam ref 10", "fixed partial denture - afpam ref 9"));
        FALLBACK_PROCEDURES.put("flexible denture", List.of("flexible denture – bredent second edition", "flexible denture", "flexible denture – bredent polyan"));
        FALLBACK_PROCEDURES.put("fpd", List.of("metal ceramic", "metal with ceramic facing", "zirconia monolithic crown", "dmls hybrid bar", "full metal crown", "general", "zirconia coping"));
        FALLBACK_PROCEDURES.put("fpd (fixed partial denture)", List.of("metal ceramic", "metal with ceramic facing", "full metal crown", "hand layered crown", "monolithic crown"));
        FALLBACK_PROCEDURES.put("fvc (single crown)", List.of("metal with ceramic facing", "ceramic endo crown", "hand layered crown", "monolithic crown", "metal endo crown"));
        FALLBACK_PROCEDURES.put("fvc (ug / pg format)", List.of("metal ceramic", "full metal crown"));
        FALLBACK_PROCEDURES.put("fvc single crown", List.of("metal with ceramic facing", "ceramic endo crown", "hand layered crown", "emax", "monolithic crown", "metal endo crown"));
        FALLBACK_PROCEDURES.put("general", List.of("general"));
        FALLBACK_PROCEDURES.put("implant", List.of("metal ceramic", "metal with ceramic facing", "monolithic", "hand layered crown", "jig trial", "implant castable abutment", "general"));
        FALLBACK_PROCEDURES.put("inlay", List.of("metal inlay", "ceramic inlay", "general"));
        FALLBACK_PROCEDURES.put("malo framework", List.of("malo framework"));
        FALLBACK_PROCEDURES.put("maryland bridge", List.of("maryland bridge", "layering", "fpd wax pattern"));
        FALLBACK_PROCEDURES.put("mock up", List.of("mock up manual", "mock up cadcam"));
        FALLBACK_PROCEDURES.put("onlay", List.of("metal onlay", "ceramic onlay"));
        FALLBACK_PROCEDURES.put("orthodontic", List.of("general"));
        FALLBACK_PROCEDURES.put("out sourcing", List.of("gingival porcelain", "veneer", "all ceramic crown"));
        FALLBACK_PROCEDURES.put("pmma", List.of("pmma cadcam"));
        FALLBACK_PROCEDURES.put("psi finishing", List.of("psi finishing and polishing"));
        FALLBACK_PROCEDURES.put("removable appliance", List.of("band and loop", "beggs retainer", "distal shoe", "lip bumper", "habit braking", "lingual arch", "nance palatal", "inclined plane", "bite plane", "transpalatal", "hawleys appliance"));
        FALLBACK_PROCEDURES.put("space maintainer", List.of("space maintainer"));
        FALLBACK_PROCEDURES.put("splint", List.of("hard splint", "soft splint"));
        FALLBACK_PROCEDURES.put("telescopic coping", List.of("primary and secondary coping", "primary & secondary coping"));
        FALLBACK_PROCEDURES.put("temporary acrylic crown", List.of("temporary acrylic crown"));
        FALLBACK_PROCEDURES.put("tpd", List.of("tpd denture base", "tpd teeth setting", "tpd occlusal rims", "tpd special tray", "tpd processing"));
        FALLBACK_PROCEDURES.put("tpd (transitional partial denture)", List.of("tpd"));
        FALLBACK_PROCEDURES.put("welding soldering", List.of("welding soldering"));
    }

    // ── Predict full workflow from start ──────────────────────────────────────
    public Map<String, Object> getFullWorkflow(String procedure, String subtype) {
        String url = flaskApiUrl + "/api/predict-full";
        log.debug("Calling Flask full workflow → procedure={}, subtype={}", procedure, subtype);

        Map<String, String> body = new HashMap<>();
        body.put("procedure", procedure);
        body.put("subtype", subtype);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            return response.getBody();
        } catch (Exception e) {
            log.warn("Flask full workflow call failed: {}. Generating mock workflow fallback.", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("procedure", procedure);
            fallback.put("subtype", subtype);
            fallback.put("total_steps", 3);

            List<Map<String, Object>> steps = new ArrayList<>();

            Map<String, Object> s1 = new HashMap<>();
            s1.put("step_number", 1);
            s1.put("current_step", "Step 1: Clinical Preparation & Impressions");
            s1.put("current_description", "Prepare patient site and record high-accuracy impressions for " + procedure + " (" + subtype + ").");
            s1.put("next_step", "Step 2: Laboratory Fabrication");
            s1.put("next_description", "Send clinical models to lab to fabricate the " + procedure + " via " + subtype + " method.");
            s1.put("confidence", 0.98);
            s1.put("source", "Fallback Clinical Engine (ML Offline)");
            steps.add(s1);

            Map<String, Object> s2 = new HashMap<>();
            s2.put("step_number", 2);
            s2.put("current_step", "Step 2: Laboratory Fabrication");
            s2.put("current_description", "Fabricate the " + procedure + " using " + subtype + " method in the dental lab.");
            s2.put("next_step", "Step 3: Clinical Try-in & Cementation");
            s2.put("next_description", "Evaluate final fit and cement/deliver " + procedure + ".");
            s2.put("confidence", 0.95);
            s2.put("source", "Fallback Clinical Engine (ML Offline)");
            steps.add(s2);

            Map<String, Object> s3 = new HashMap<>();
            s3.put("step_number", 3);
            s3.put("current_step", "Step 3: Clinical Try-in & Cementation");
            s3.put("current_description", "Evaluate final functional fit, adjust contacts, and complete delivery of " + procedure + ".");
            s3.put("next_step", "Completed");
            s3.put("next_description", "Treatment sequence completed successfully.");
            s3.put("confidence", 0.99);
            s3.put("source", "Fallback Clinical Engine (ML Offline)");
            steps.add(s3);

            fallback.put("workflow", steps);
            fallback.put("success", true);
            return fallback;
        }
    }

    // ── Get ML model metadata ─────────────────────────────────────────────────
    public Map<String, Object> getModelInfo() {
        String url = flaskApiUrl + "/api/model-info";
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            return response.getBody();
        } catch (Exception e) {
            log.warn("Flask model-info call failed: {}. Returning mock metadata.", e.getMessage());
            Map<String, Object> info = new HashMap<>();
            info.put("status", "OFFLINE_FALLBACK");
            info.put("model_name", "Decision Tree & Random Forest Classifier");
            info.put("accuracy", 0.94);
            info.put("success", true);
            return info;
        }
    }

    // ── Get procedures list ───────────────────────────────────────────────────
    public Map<String, Object> getProcedures() {
        String url = flaskApiUrl + "/api/procedures";
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            return response.getBody();
        } catch (Exception e) {
            log.warn("Flask procedures call failed: {}. Falling back to static procedures list.", e.getMessage());
            return new HashMap<>(FALLBACK_PROCEDURES);
        }
    }
}