# Neuro Trace – Dementia Detection 🧠🖋️

## 📌 Project Overview
**Neuro Trace** is an advanced AI-powered diagnostic tool designed for the early detection of Dementia and Alzheimer’s disease. By leveraging **Multimodal Machine Learning**, the system analyzes two distinct data sources: digital handwriting samples (drawing tests) and comprehensive clinical patient data. 

### 🌍 The Real-World Problem
Dementia is a global healthcare challenge, with millions of cases remaining undiagnosed until the advanced stages. Traditional diagnostic methods are often time-consuming, expensive, and require specialized clinical settings. Early detection is critical as it allows for timely intervention, which can significantly slow cognitive decline and improve the quality of life for patients and their families.

---

## ✨ Key Features
- **Multimodal Learning**: Combines computer vision (image analysis) with traditional tabular data processing for a holistic patient assessment.
- **Real-time Prediction**: Provides near-instantaneous results through a high-performance FastAPI backend.
- **Web-Based Interface**: A modern, intuitive React-based dashboard for doctors and patients to upload data easily.
- **Automated Report Generation**: Generates detailed diagnostic reports based on AI findings and clinical scores.
- **PDF Extraction**: Support for extracting clinical features directly from medical reports to minimize manual entry.

---

## 🛠️ Tech Stack
- **Languages**: Python, TypeScript
- **Deep Learning**: TensorFlow, Keras (CNN & MLP models)
- **Machine Learning**: Scikit-learn, XGBoost (Meta-ensemble)
- **Data Processing**: NumPy, Pandas, Joblib
- **Backend**: FastAPI (Asynchronous API)
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Database/Storage**: Local storage for pre-trained models (.h5, .keras, .pkl)

---

## 🏗️ System Architecture
The system follows a **Late Fusion Multimodal Architecture**:

1.  **CNN Branch (Handwriting Analysis)**: A deep Convolutional Neural Network (ConvNeXt/DenseNet) processes handwriting images (e.g., clock drawing or spiral tests) to detect fine motor tremors and spatial impairments.
2.  **MLP Branch (Clinical Data)**: A Multi-Layer Perceptron processes 36 clinical features (Age, MMSE scores, BMI, Sleep Quality, etc.).
3.  **Feature Fusion**: The high-level features from both branches are extracted and passed to a **Meta-Classifier (XGBoost)**.
4.  **Decision Output**: The ensemble model produces the final classification (Dementia vs. Non-Dementia) with a probability score.

**Data Flow**: `Input (Image + Features) → Preprocessing → Model Inference → Meta-Fusion → API Response → UI Visualization`.

---

## 🧩 Technical Trade-offs
*   **Late Fusion vs. Early Fusion**: I chose **Late Fusion** because early fusion (concatenating raw pixels with tabular data) is extremely noisy. Late fusion allows the CNN and MLP to learn high-level representations independently before combining them, which is far more stable for heterogeneous data types.
*   **XGBoost vs. Simple Dense Layer**: For the final fusion, I used **XGBoost** instead of a simple Dense layer. XGBoost is better at handling complex feature interactions and provides built-in protection against overfitting through boosting rounds and tree depth constraints.
*   **FastAPI vs. Flask**: I selected **FastAPI** for its native support for `async` operations and Pydantic validation. This allows the system to handle multiple prediction requests concurrently with lower latency compared to a standard Flask setup.

---

## 📊 Dataset Details
- **Image Data**: ~1,500 handwriting samples categorized into healthy and cognitive-decline classes.
- **Clinical Data**: Tabular dataset containing 36 features including:
    - **Demographics**: Age, Gender, Education Level.
    - **Medical History**: Family history, Cardiovascular disease, BMI.
    - **Cognitive Tests**: MMSE (Mini-Mental State Exam), Functional Assessment scores.
- **Preprocessing**: Images are resized to 224x224 and normalized. Tabular data undergoes scaling and encoding via a pre-trained `StandardScaler`.

---

## 🧠 Model Explanation & Explainability
- **CNN (Convolutional Neural Network)**: Detects subtle irregularities in handwriting strokes indicative of cognitive impairment.
- **MLP (Multi-Layer Perceptron)**: Captures non-linear relationships between medical features.
- **Model Explainability (Future Work)**: In healthcare, "Black Box" models are problematic. I plan to integrate **SHAP (SHapley Additive exPlanations)** to show doctors which specific features (e.g., MMSE score or specific handwriting patterns) contributed most to the dementia prediction.

---

## 📈 Training & Evaluation
### Training Details
- **Loss Function**: Binary Cross-Entropy
- **Optimizer**: Adam (with learning rate scheduling)
- **Epochs**: 50–100 (with Early Stopping)
- **Overfitting Control**: Dropout layers (0.3), L2 Regularization, and Data Augmentation for images.

### Evaluation Metrics
- **Accuracy**: 95%
- **Precision / Recall / F1-Score**: High consistency across classes (approx. 0.94+).
- **Why Accuracy isn't enough**: We prioritized **Recall** to ensure that potential patients are flagged for review. A false positive leads to extra tests; a false negative leads to missed treatment.

---

## ⚠️ Failure Cases & Limitations
1.  **Poor Image Quality**: Extremely blurry or low-contrast handwriting samples can lead to inaccurate CNN predictions.
2.  **Missing Clinical Data**: If critical features like MMSE are missing, the MLP branch's reliability decreases.
3.  **Noisy Inputs**: Non-handwriting images uploaded as samples are currently a point of failure, which could be mitigated with an image-type classifier.

---

## 🚧 Challenges Faced
1.  **Data Heterogeneity**: Combining pixel data with numerical data via Late Fusion.
2.  **Data Preprocessing**: Handling missing values and standardizing diverse medical reports.
3.  **Overfitting**: Solved via Transfer Learning and heavy image augmentation.

---

## 🚀 Deployment & Scalability
- **API**: High-performance FastAPI backend.
- **Scalability**: The system is designed to be **Dockerized**, allowing for easy deployment on cloud platforms like AWS or GCP. By using a Gunicorn/Uvicorn worker setup, the API can scale to handle thousands of concurrent requests in a hospital environment.
- **Cloud Integration**: Future work includes moving model weights to an S3 bucket for dynamic loading and faster updates.

---

## ⚖️ Ethical Considerations
- **Data Privacy**: Medical data must be encrypted and anonymized.
- **Model Bias**: Constant auditing for age or ethnicity bias is required.
- **Assistant, Not Replacement**: Designed to **assist** doctors, not replace them.

---

## 🏃 How to Run the Project
### 1. Setup Backend
```bash
cd Deployment
pip install -r requirements.txt
python main.py
```
### 2. Setup Frontend
```bash
cd Frontend
npm install
npm start
```
The application will be accessible at `http://localhost:3000`.

---

## 🏁 Conclusion
Neuro Trace demonstrates the power of combining clinical expertise with Deep Learning. This project taught me the complexities of multimodal data fusion, the importance of model interpretability in healthcare, and how to build a full-stack AI application from scratch.

---
*Created with ❤️ for better healthcare.*
