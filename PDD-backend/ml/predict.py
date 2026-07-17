import pickle
import os
import sys

def main():
    model_path = os.path.join("saved_model", "dental_model.pkl")
    encoder_path = os.path.join("saved_model", "label_encoder.pkl")

    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        print("Error: Saved model files not found. Please run 'python train_model.py' first to train the model.")
        sys.exit(1)

    print("Loading ML model...")
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(encoder_path, "rb") as f:
        le = pickle.load(f)
    print("Model loaded successfully!\n")

    print("=" * 60)
    print("DENTAL LAB STEP PREDICTOR - INTERACTIVE DEMO")
    print("=" * 60)

    # Let the user enter inputs or use defaults for demonstration
    print("\nEnter details for the procedure:")
    procedure = input("Procedure (e.g. FPD, Complete Denture, Implant): ").strip()
    subtype = input("Subtype (e.g. Metal Ceramic, BPS Teeth Setting): ").strip()
    current_step = input("Current Step (e.g. FPD Wax Pattern, Articulation, Secondary Cast): ").strip()

    if not procedure or not current_step:
        print("\nError: Procedure and Current Step are required inputs!")
        return

    # Combine input text exactly as done during training
    input_text = f"{procedure.lower()} | {subtype.lower()} | {current_step.lower()}"

    print("\n" + "-" * 50)
    print(f"Combined Query Text: '{input_text}'")
    print("-" * 50)

    try:
        # Get prediction and probabilities
        pred_encoded = model.predict([input_text])[0]
        pred_proba = model.predict_proba([input_text])[0]
        
        confidence = max(pred_proba) * 100
        next_step = le.inverse_transform([pred_encoded])[0]

        print(f"\n>>> PREDICTED NEXT STEP: {next_step}")
        print(f">>> MODEL CONFIDENCE: {confidence:.2f}%")
        
        # Display top 3 choices with their confidence
        print("\nTop 3 Alternative Suggestions:")
        top_indices = pred_proba.argsort()[-3:][::-1]
        for idx in top_indices:
            label = le.classes_[idx]
            conf = pred_proba[idx] * 100
            print(f"  - {label:<35} (Confidence: {conf:.2f}%)")

    except Exception as e:
        print(f"\nAn error occurred during prediction: {e}")

if __name__ == "__main__":
    main()
