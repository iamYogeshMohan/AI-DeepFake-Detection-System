import os
import sqlite3
import random
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__name__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max-limit
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi'}

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__name__)), 'deepguard.db')

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                result TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                reason TEXT
            )
        ''')
        try:
            cursor.execute('ALTER TABLE history ADD COLUMN reason TEXT DEFAULT "Not available"')
        except sqlite3.OperationalError:
            pass  # Column likely already exists
        conn.commit()

init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def mock_ai_inference(filepath):
    """Simulates AI model analyzing the file."""
    # Simulate processing time
    time.sleep(2.5) 
    
    # Mock result (either Real or Fake)
    is_fake = random.choice([True, False])
    confidence = round(random.uniform(75.0, 99.9), 2)
    
    if is_fake:
        reason = random.choice([
            "Inconsistent facial lighting and unnatural shadows.",
            "Unnatural blinking pattern detected.",
            "Edge blending artifacts around the subject's face.",
            "Mismatched pixel noise patterns in the background."
        ])
    else:
        reason = random.choice([
            "Consistent pixel noise level across the media.",
            "No facial blending artifacts found.",
            "Natural lighting and shadows observed.",
            "Temporal consistency is stable."
        ])
    
    return {
        'result': 'Fake' if is_fake else 'Real',
        'confidence': confidence,
        'reason': reason
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect')
def detect():
    return render_template('detect.html')

@app.route('/history')
def history():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM history ORDER BY timestamp DESC')
        records = cursor.fetchall()
    return render_template('history.html', records=records)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'media' not in request.files:
        return jsonify({'error': 'No file part provided'}), 400
        
    file = request.files['media']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to prevent overwriting files with the same name
        unique_filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Run AI Model (Mock)
        analysis = mock_ai_inference(filepath)
        
        # Save to database
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO history (filename, result, confidence, reason) VALUES (?, ?, ?, ?)',
                (filename, analysis['result'], analysis['confidence'], analysis['reason'])
            )
            conn.commit()
            
        return jsonify({
            'success': True,
            'filename': filename,
            'result': analysis['result'],
            'confidence': analysis['confidence'],
            'reason': analysis['reason']
        })
        
    return jsonify({'error': 'Invalid file type. Allowed: jpg, png, mp4, avi.'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
