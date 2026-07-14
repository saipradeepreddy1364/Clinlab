package com.diaslab.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AiResponse {

    private boolean success;
    private String suggestion;       // The AI-generated text
    private String model;            // Which model was used
    private String procedure;
    private String subtype;
    private String currentStep;
    private String errorMessage;     // Populated only on failure

    // Frontend expected fields
    @JsonProperty("suggested_step_name")
    private String suggestedStepName;

    @JsonProperty("suggested_step_number")
    private Integer suggestedStepNumber;

    @JsonProperty("clinical_description")
    private String clinicalDescription;

    @JsonProperty("clinical_instructions")
    private String clinicalInstructions;

    @JsonProperty("clinical_precautions")
    private List<String> clinicalPrecautions;

    @JsonProperty("instruments_required")
    private List<String> instrumentsRequired;

    @JsonProperty("confidence")
    private Integer confidence;

    @JsonProperty("rationale")
    private String rationale;

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getProcedure() {
        return procedure;
    }

    public void setProcedure(String procedure) {
        this.procedure = procedure;
    }

    public String getSubtype() {
        return subtype;
    }

    public void setSubtype(String subtype) {
        this.subtype = subtype;
    }

    public String getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(String currentStep) {
        this.currentStep = currentStep;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    // Getters and Setters for Frontend Expected Fields

    public String getSuggestedStepName() {
        return suggestedStepName;
    }

    public void setSuggestedStepName(String suggestedStepName) {
        this.suggestedStepName = suggestedStepName;
    }

    public Integer getSuggestedStepNumber() {
        return suggestedStepNumber;
    }

    public void setSuggestedStepNumber(Integer suggestedStepNumber) {
        this.suggestedStepNumber = suggestedStepNumber;
    }

    public String getClinicalDescription() {
        return clinicalDescription;
    }

    public void setClinicalDescription(String clinicalDescription) {
        this.clinicalDescription = clinicalDescription;
    }

    public String getClinicalInstructions() {
        return clinicalInstructions;
    }

    public void setClinicalInstructions(String clinicalInstructions) {
        this.clinicalInstructions = clinicalInstructions;
    }

    public List<String> getClinicalPrecautions() {
        return clinicalPrecautions;
    }

    public void setClinicalPrecautions(List<String> clinicalPrecautions) {
        this.clinicalPrecautions = clinicalPrecautions;
    }

    public List<String> getInstrumentsRequired() {
        return instrumentsRequired;
    }

    public void setInstrumentsRequired(List<String> instrumentsRequired) {
        this.instrumentsRequired = instrumentsRequired;
    }

    public Integer getConfidence() {
        return confidence;
    }

    public void setConfidence(Integer confidence) {
        this.confidence = confidence;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }
}
