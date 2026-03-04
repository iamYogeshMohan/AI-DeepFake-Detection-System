document.addEventListener('DOMContentLoaded', () => {

    // --- Upload Form Logic ---
    const uploadArea = document.getElementById('upload-area');
    const uploadInput = document.getElementById('media-upload');
    const previewArea = document.getElementById('preview-area');
    const mediaContainer = document.getElementById('media-preview-container');
    const btnCancel = document.getElementById('btn-cancel');
    const btnAnalyze = document.getElementById('btn-analyze');

    const processingArea = document.getElementById('processing-area');
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('processing-status');

    const resultArea = document.getElementById('result-area');
    const resultTitle = document.getElementById('result-title');
    const resultIcon = document.getElementById('result-icon');
    const meterFill = document.getElementById('meter-fill');
    const confidenceScore = document.getElementById('confidence-score');
    const resultDesc = document.getElementById('result-description');
    const btnAnalyzeAnother = document.getElementById('btn-analyze-another');

    let currentFile = null;

    if (uploadArea && uploadInput) {

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Click to browse
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // Cancel Preview
        btnCancel.addEventListener('click', () => {
            currentFile = null;
            uploadInput.value = '';
            mediaContainer.innerHTML = '';
            previewArea.style.display = 'none';
            uploadArea.style.display = 'block';
        });

        // Analyze another
        btnAnalyzeAnother.addEventListener('click', () => {
            resultArea.style.display = 'none';
            uploadArea.style.display = 'block';
            currentFile = null;
            uploadInput.value = '';
            meterFill.style.width = '0%';
            confidenceScore.innerText = '0';
        });

        // Start Analysis
        btnAnalyze.addEventListener('click', () => {
            if (!currentFile) return;

            // UI Transition
            previewArea.style.display = 'none';
            processingArea.style.display = 'block';

            // Simulating progress steps while we wait for backend
            let prog = 0;
            const progressInterval = setInterval(() => {
                prog += Math.random() * 15;
                if (prog > 90) prog = 90; // Wait at 90% for backend
                progressFill.style.width = prog + '%';

                if (prog > 30 && prog < 60) statusText.innerText = 'Extracting facial features...';
                else if (prog >= 60) statusText.innerText = 'Running CNN models...';
            }, 500);

            // Send to backend
            const formData = new FormData();
            formData.append('media', currentFile);

            fetch('/api/analyze', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    clearInterval(progressInterval);
                    progressFill.style.width = '100%';
                    statusText.innerText = 'Analysis Complete!';

                    setTimeout(() => {
                        showResult(data);
                    }, 500);
                })
                .catch(err => {
                    clearInterval(progressInterval);
                    alert('An error occurred during analysis.');
                    console.error(err);
                    processingArea.style.display = 'none';
                    uploadArea.style.display = 'block';
                });
        });
    }

    function handleFileSelect(file) {
        // Validate
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/avi'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file format. Only JPG, PNG, and MP4/AVI are supported.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('File is too large! Maximum 50MB.');
            return;
        }

        currentFile = file;

        // Generate Preview
        mediaContainer.innerHTML = '';
        const url = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = url;
            mediaContainer.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            mediaContainer.appendChild(video);
        }

        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
    }

    function showResult(data) {
        if (data.error) {
            alert(data.error);
            processingArea.style.display = 'none';
            uploadArea.style.display = 'block';
            return;
        }

        processingArea.style.display = 'none';
        resultArea.style.display = 'block';

        // Reset classes
        resultTitle.className = '';
        resultIcon.className = 'result-icon';
        meterFill.className = 'meter-fill';

        const isFake = data.result === 'Fake';

        // Apply logic
        if (isFake) {
            resultTitle.innerText = 'DeepFake Detected';
            resultTitle.classList.add('fake');
            resultIcon.classList.add('fake');
            resultIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            meterFill.classList.add('fake');
            resultDesc.innerText = 'The system has found evidence of manipulation or AI generation.';
        } else {
            resultTitle.innerText = 'Authentic Media';
            resultTitle.classList.add('real');
            resultIcon.classList.add('real');
            resultIcon.innerHTML = '<i class="fa-solid fa-shield-check"></i>';
            meterFill.classList.add('real');
            resultDesc.innerText = 'No evidence of manipulation found. The media appears authentic.';
        }

        // Populate reasoning
        document.getElementById('result-reason').innerText = data.reason || 'No specific reasoning provided.';

        // Animate meter
        setTimeout(() => {
            meterFill.style.width = data.confidence + '%';

            // animate number
            let start = 0;
            const end = parseFloat(data.confidence);
            const duration = 1000;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = end / steps;

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    clearInterval(timer);
                    start = end;
                }
                confidenceScore.innerText = start.toFixed(1);
            }, stepTime);

        }, 100);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }

            // Close mobile menu if open
            if (document.querySelector('.nav-links').style.display === 'flex') {
                document.querySelector('.nav-links').style.display = 'none';
            }
        });
    });

    // Mobile menu toggle (simple version)
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(5, 5, 16, 0.95)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            }
        });
    }

    // Reset inline styles on window resize for nav
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.style.display = 'flex';
            navLinks.style.position = 'static';
            navLinks.style.flexDirection = 'row';
            navLinks.style.background = 'transparent';
            navLinks.style.padding = '0';
            navLinks.style.borderBottom = 'none';
        } else if (window.innerWidth <= 768 && navLinks) {
            if (navLinks.style.position === 'static') {
                navLinks.style.display = 'none';
            }
        }
    });
});
