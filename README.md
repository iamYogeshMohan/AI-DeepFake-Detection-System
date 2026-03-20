# AI DeepFake Detection System

DeepGuard is a web-based application built with Flask that simulates an AI-powered detection system for DeepFakes. Users can upload images and videos (png, jpg, jpeg, mp4, avi) to be analyzed, and the system provides a confidence score and reasoning indicating whether the media is real or fake.

## Features
- **Media Upload Strategy:** Allows uploading of various image and video formats.
- **Mock AI Inference:** Simulates an AI analysis process with realistic processing times, confidence scores, and detailed reasoning for the detection results.
- **History Tracking:** All uploaded media analyses are logged into a local SQLite database and can be reviewed in the History tab.
- **Responsive Web Interface:** User-friendly frontend to quickly detect and review uploaded media.

## Tech Stack
- **Backend:** Python, Flask, SQLite
- **Frontend:** HTML, CSS

## Requirements
To install the necessary dependencies, run:
```bash
pip install -r requirements.txt
```

## Running the Application
To start the development server, run:
```bash
python app.py
```
Then, open your browser and navigate to `http://127.0.0.1:5000/`.

## License
Provided under the MIT License. See the `LICENSE` file for more details.
