package com.diaslab.controller;

import com.diaslab.model.AiRequest;
import com.diaslab.model.AiResponse;
import com.diaslab.service.AiSuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AiSuggestionController
 *
 * Exposes the AI suggestion endpoint independently of the ML/Flask pipeline.
 *
 * POST /api/ai-suggestion
 *   Body: { "procedure": "...", "subtype": "...", "currentStep": "...", "additionalContext": "..." }
 *   Returns: { "success": true, "suggestion": "...", "model": "...", ... }
 */
@RestController
@RequestMapping("/api")
public class AiSuggestionController {

    private final AiSuggestionService aiSuggestionService;

    public AiSuggestionController(AiSuggestionService aiSuggestionService) {
        this.aiSuggestionService = aiSuggestionService;
    }

    /**
     * Get an AI-generated expert suggestion for a dental lab procedure step.
     *
     * @param request  JSON body with procedure context
     * @return 200 OK with suggestion details
     */
    @PostMapping("/ai-suggestion")
    public ResponseEntity<AiResponse> getAiSuggestion(@RequestBody AiRequest request) {
        AiResponse response = aiSuggestionService.getSuggestion(request);
        // Always return 200 — the `success` field in the body indicates outcome
        return ResponseEntity.ok(response);
    }
}
