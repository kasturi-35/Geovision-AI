You are helping me build a professional working prototype for my SIH project called **GeoVision AI**.

I am a beginner, and this is ONLY a prototype for an SIH second-round demonstration. Do not over-engineer the project. Prioritize a working end-to-end demo, clean UI, realistic AI workflow, and easy setup.

## PROJECT IDEA

GeoVision AI is an AI-powered geospatial mapping system that analyzes drone/aerial imagery and extracts useful land features such as:

* Buildings
* Roads
* Land/parcel boundaries
* Other visible geographic features

The system should allow a user/surveyor to upload a drone image, process it using AI, visualize the result on an interactive map, inspect detected features, and review the AI output.

The prototype should demonstrate:

UPLOAD IMAGE → AI EXTRACTION → VALIDATION → MAP VISUALIZATION → REVIEW

## REQUIRED TECH STACK

Use ONLY these technologies for the prototype:

### Frontend

* React
* JavaScript
* CSS
* OpenLayers

### Backend

* Python
* FastAPI
* Uvicorn

### AI / Computer Vision

* Ultralytics YOLO
* OpenCV
* Pillow
* NumPy

### Geometry

* Shapely

### Storage

* Local folders
* JSON files

DO NOT add PostgreSQL/PostGIS, GDAL, Rasterio, GeoPandas, Docker, cloud databases, authentication systems, or unnecessary technologies unless absolutely required.

The goal is simplicity and reliability.

---

# MAIN USER FLOW

Build the application around this flow:

1. User opens GeoVision AI dashboard.
2. User uploads an aerial/drone image.
3. Frontend sends the image to FastAPI.
4. Backend saves the uploaded image.
5. AI model analyzes the image.
6. Backend generates detection results.
7. Backend returns dynamic results to React.
8. React displays:

   * Uploaded image
   * Interactive map
   * AI detected features
   * Confidence scores
   * Statistics
   * Validation status
9. User can inspect the extracted features.
10. User can review/approve the AI result.

Every value shown in the UI must be generated from the uploaded image/result. NEVER use fixed values such as:

Buildings = 428
Roads = 76
Parcels = 1167

Different images must produce different results.

---

# IMPORTANT AI REQUIREMENT

Do NOT create a fake UI that always displays the same AI results.

The prototype must actually process the uploaded image.

Use YOLO if a trained model is available.

The application should support a custom model at:

backend/models/best.pt

If best.pt exists:

* Load it
* Run inference
* Extract detections
* Use the actual detections in the UI.

If best.pt does NOT exist:

* The application must still run.
* Clearly show that the AI model is not currently available.
* Provide a clean fallback/demo processing mode if necessary.
* NEVER pretend that fake detections are real AI detections.
* Clearly label fallback/demo results as demo results.

Do not download random models automatically without asking.

---

# DETECTION RESULT FORMAT

Backend should return dynamic JSON similar to:

{
"success": true,
"image_url": "...",
"detections": [
{
"class_name": "building",
"confidence": 0.91,
"bbox": [x1, y1, x2, y2]
}
],
"statistics": {
"buildings": 12,
"roads": 4,
"total_features": 16,
"average_confidence": 0.89
}
}

Adapt this structure if necessary.

Never hardcode statistics.

---

# FRONTEND DESIGN

Create a professional SIH-style dashboard.

Use a clean modern layout.

Suggested structure:

HEADER

* GeoVision AI
* AI-Powered Geospatial Intelligence
* Prototype badge/status

SIDEBAR

* Dashboard
* Image Upload
* AI Extraction
* Validation
* Review
* Reports

MAIN AREA

1. Upload section

Show:

* Drag and drop area
* Browse button
* Supported image formats
* Selected image preview
* Process Image button

2. AI Extraction section

Show cards:

* Buildings detected
* Roads detected
* Other features
* Average confidence

All values must come from backend results.

3. Map section

Use OpenLayers.

Display:

* Uploaded image as the map/background where practical.
* Detection bounding boxes or polygons as overlays.
* Different feature types should be visually distinguishable.
* Allow zoom and pan.

4. Validation section

Show:

* AI confidence
* Validation status
* Detection count
* Potential low-confidence detections

For example:

HIGH CONFIDENCE
MEDIUM CONFIDENCE
NEEDS REVIEW

These should be calculated from actual confidence values.

5. Review Queue

Display detections that need review.

Example:

Feature | Confidence | Status | Action

Building | 0.91 | Verified | View
Road | 0.62 | Needs Review | Inspect

Make this functional where practical.

6. Report section

Show a simple summary:

Image analyzed
Total detected features
Buildings
Roads
Average confidence
Validation status

Provide a Download Report button that downloads a JSON report or simple text report.

---

# MAP REQUIREMENT

Use OpenLayers.

Do NOT depend on Google Maps API keys.

The prototype must work locally.

The uploaded image should be used meaningfully in the map/image visualization.

If the image does not contain geospatial coordinates, treat it as a local image coordinate system and explain this in the UI as:

"Prototype mode: image coordinates are used because the uploaded image does not contain geographic coordinates."

Do not invent real latitude/longitude values.

---

# VALIDATION

Implement a simple prototype validation layer.

For example:

confidence >= 0.80
→ High Confidence

confidence >= 0.60 and < 0.80
→ Medium Confidence

confidence < 0.60
→ Needs Review

Also perform basic geometry checks where applicable using Shapely.

Do not claim this is full cadastral/topological validation.

Label it as:

"Prototype Validation"

---

# ERROR HANDLING

Handle:

* No image selected
* Invalid image
* Very large image
* Backend unavailable
* AI model unavailable
* AI processing failure
* Invalid response
* Empty detection result

Show friendly messages instead of crashing.

For example:

"AI model is not available. Please place best.pt inside backend/models/."

---

# BACKEND STRUCTURE

Create a clean structure similar to:

project/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── models/
│   │   └── best.pt
│   ├── uploads/
│   ├── results/
│   └── ...
│
└── README.md

Adapt the structure if the existing project already has files.

IMPORTANT:
Before changing files, inspect the existing project structure and reuse working code where possible.

Do NOT unnecessarily delete working functionality.

---

# API ENDPOINTS

Implement clean FastAPI endpoints such as:

GET /
→ backend status

GET /api/health
→ health check

POST /api/process
→ upload and process image

GET /api/results/{id}
→ retrieve processing result

GET /uploads/{filename}
→ serve uploaded images/results when needed

Use CORS so the React frontend can communicate with FastAPI locally.

---

# PERFORMANCE

Keep processing reasonably fast for a prototype.

Resize very large images before inference if necessary.

Do not freeze the UI.

Show:

"Uploading..."
"Processing with AI..."
"Generating map..."
"Analysis complete"

---

# UI STYLE

The application should look like a serious geospatial AI product, not a basic college CRUD application.

Use:

* Modern cards
* Clean typography
* Consistent spacing
* Professional navigation
* Clear statistics
* Map panel
* AI status indicators
* Confidence badges
* Responsive layout

Avoid excessive animations.

Make the important information visible immediately during an SIH demonstration.

---

# VERY IMPORTANT: DYNAMIC DATA

Check the entire codebase for hardcoded values.

There must NOT be code such as:

buildings = 428
roads = 76
parcels = 1167

or fixed statistics disguised as dynamic data.

All displayed statistics must originate from the actual backend processing result.

If a value cannot be calculated from the current image, do not invent it.

---

# DEMO REQUIREMENT

The final prototype should allow me to demonstrate:

1. Open dashboard.
2. Upload an aerial/drone image.
3. Show upload preview.
4. Click Process.
5. Show AI processing.
6. Display actual detection results.
7. Show confidence scores.
8. Show detected features on the map/image.
9. Show low-confidence items in Review Queue.
10. Show validation summary.
11. Generate/download a simple report.

The entire flow should work locally.

---

# BEGINNER-FRIENDLY SETUP

Create a README.md containing EXACT commands needed to run the project.

For example:

Backend:

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Frontend:

cd frontend
npm install
npm run dev

Clearly explain:

* Where to place best.pt
* How to start backend
* How to start frontend
* Which URL to open
* How to test image upload
* How to troubleshoot common errors

Since I am a beginner, make the instructions step-by-step.

---

# CODE QUALITY

Write clean, readable code.

Add comments around important sections.

Avoid unnecessary abstraction.

Avoid unnecessary libraries.

Do not create placeholder code that looks functional but does nothing.

Do not silently swallow errors.

Use meaningful error messages.

---

# MOST IMPORTANT INSTRUCTION

This is an SIH prototype.

Do NOT spend time building production-level infrastructure.

The priority is:

WORKING DEMO
+
REAL IMAGE PROCESSING
+
REAL AI INFERENCE WHEN MODEL IS AVAILABLE
+
DYNAMIC RESULTS
+
INTERACTIVE MAP
+
VALIDATION/REVIEW
+
PROFESSIONAL UI

After inspecting my existing project, first identify what is already working and what is broken.

Then modify only what is necessary.

At the end, provide:

1. Files created
2. Files modified
3. Dependencies required
4. Exact commands to run
5. Exact URL to open
6. How to test the complete workflow
7. Any remaining limitation
8. What I should demonstrate to SIH evaluators

Do not ask me to build unnecessary features before the basic end-to-end prototype works.
