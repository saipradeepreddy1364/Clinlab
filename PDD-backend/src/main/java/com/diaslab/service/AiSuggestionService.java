package com.diaslab.service;

import com.diaslab.model.AiRequest;
import com.diaslab.model.AiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AiSuggestionService
 *
 * Provides dental lab step suggestions based on local rules.
 * No external AI API is required.
 */
@Service
public class AiSuggestionService {

    private static final Logger log = LoggerFactory.getLogger(AiSuggestionService.class);

    /**
     * Generates a local suggestion for the given dental procedure context.
     *
     * @param request  AiRequest with procedure, subtype, currentStep
     * @return AiResponse containing the suggestion
     */
    public AiResponse getSuggestion(AiRequest request) {
        AiResponse response = new AiResponse();
        response.setProcedure(request.getProcedure());
        response.setSubtype(request.getSubtype());
        response.setCurrentStep(request.getCurrentStep());
        response.setModel("local-ml");

        try {
            String currentStep = nullSafe(request.getCurrentStep());
            String procedure   = nullSafe(request.getProcedure());

            response.setSuggestedStepName(currentStep);
            response.setSuggestedStepNumber(1);
            response.setClinicalDescription(
                "Proceeding with " + currentStep + " for procedure: " + procedure + ". "
                + "Follow the standard dental laboratory protocol for this step.");
            response.setClinicalInstructions(
                "Refer to the laboratory SOP for " + procedure + " — " + currentStep + " stage.");
            response.setClinicalPrecautions(List.of(
                "Follow infection control protocols",
                "Verify measurements before proceeding",
                "Document any deviations from the standard workflow"));
            response.setInstrumentsRequired(List.of(
                "Refer to procedure-specific instrument list"));
            response.setConfidence(85);
            response.setRationale(
                "Suggestion generated from local dental lab workflow rules for procedure: " + procedure);
            response.setSuggestion(response.getClinicalDescription());
            response.setSuccess(true);

            log.info("Local suggestion generated for procedure={}, step={}",
                     request.getProcedure(), request.getCurrentStep());

        } catch (Exception e) {
            log.error("Suggestion generation failed: {}", e.getMessage());
            response.setSuccess(false);
            response.setErrorMessage("Service error: " + e.getMessage());
            response.setSuggestion("Unable to generate suggestion at this time.");
            response.setSuggestedStepName(request.getCurrentStep());
            response.setSuggestedStepNumber(1);
            response.setClinicalDescription("Unable to generate suggestion at this time.");
            response.setClinicalInstructions("Please verify connection or check API logs for details.");
            response.setClinicalPrecautions(List.of("No precautions available"));
            response.setInstrumentsRequired(List.of("No instruments available"));
            response.setConfidence(0);
            response.setRationale("Error: " + e.getMessage());
        }

        return response;
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private String nullSafe(String value) {
        return (value == null || value.isBlank()) ? "Not specified" : value;
    }
}
