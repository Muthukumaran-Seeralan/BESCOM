/**
 * DISCOM AI - BESCOM Intelligent Redirect Logic
 * Powered by Comet Browser AI Features
 */

document.addEventListener('DOMContentLoaded', () => {
    // Stage Sections
    const sections = {
        upload: document.getElementById('upload-section'),
        status: document.getElementById('status-section'),
        results: document.getElementById('results-section'),
        redirect: document.getElementById('redirect-section')
    };

    // Indicators
    const indicators = {
        1: document.getElementById('step-1-indicator'),
        2: document.getElementById('step-2-indicator'),
        3: document.getElementById('step-3-indicator'),
        4: document.getElementById('step-4-indicator')
    };

    // UI Elements
    const billInput = document.getElementById('bill-input');
    const imagePreview = document.getElementById('image-preview');
    const progressBar = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');
    const progressPercent = document.getElementById('progress-percent');
    const aiInsight = document.getElementById('ai-insight');
    const valAccount = document.getElementById('val-account');
    const timerDots = document.getElementById('timer-dots');
    const validationMsg = document.getElementById('validation-msg');

    // Buttons
    const resetBtn = document.getElementById('reset-btn');
    const proceedToPortalBtn = document.getElementById('proceed-to-portal');
    const copyIdBtn = document.getElementById('copy-id-btn');

    // State
    let currentStep = 1;

    /**
     * UI Step Controller
     */
    function setStep(step) {
        currentStep = step;

        // Hide all sections
        Object.values(sections).forEach(s => s.classList.add('hidden'));

        // Update indicators
        Object.keys(indicators).forEach(key => {
            indicators[key].classList.remove('active', 'completed');
            if (key < step) indicators[key].classList.add('completed');
            if (key == step) indicators[key].classList.add('active');
        });

        // Show specific section
        if (step === 1) sections.upload.classList.remove('hidden');
        if (step === 2) sections.status.classList.remove('hidden');
        if (step === 3) sections.results.classList.remove('hidden');
        if (step === 4) sections.redirect.classList.remove('hidden');

        if (window.lucide) lucide.createIcons();
    }

    /**
     * File Upload & Scanning Initiation
     */
    billInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStep(2);

        const reader = new FileReader();
        reader.onload = async (event) => {
            imagePreview.src = event.target.result;
            await simulateAIScan(event.target.result);
        };
        reader.readAsDataURL(file);
    });

    /**
     * Comet AI Vision Simulation (Using Tesseract for functional OCR)
     */
    async function simulateAIScan(imageSrc) {
        progressLabel.textContent = 'Comet AI Vision initializing neural paths...';
        aiInsight.textContent = 'Analyzing document structure...';

        try {
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const prog = Math.round(m.progress * 100);
                        progressBar.style.width = `${prog}%`;
                        progressPercent.textContent = `${prog}%`;

                        if (prog < 30) aiInsight.textContent = 'Locating regional DISCOM signature...';
                        else if (prog < 60) aiInsight.textContent = 'Isolating Account ID fields...';
                        else if (prog < 90) aiInsight.textContent = 'Validating 10-digit structure...';
                        else aiInsight.textContent = 'Finalizing extraction results...';
                    }
                }
            });

            const { data: { text } } = await worker.recognize(imageSrc);
            await worker.terminate();

            // Simulate AI "thinking" time for premium feel
            setTimeout(() => {
                processExtractedText(text);
            }, 1000);

        } catch (error) {
            console.error('Scan failed:', error);
            alert('AI Scanning interrupted. Please ensure the image is clear and try again.');
            setStep(1);
        }
    }

    /**
     * Text Processing & ID Discovery
     */
    function processExtractedText(text) {
        console.log('[Comet AI Vision] Raw Extraction Buffer:', text);

        // Strict 10-digit ID pattern
        const accountRegex = /\b(\d{10})\b/;
        const match = text.match(accountRegex);

        let discoveredId = '';

        if (match) {
            discoveredId = match[1];
        } else {
            // Fallback for noisy OCR (look for labels followed by 10 digits)
            const fallbackRegex = /(?:Account|RR|Customer|ID)\s*[:\-\s]*(\d{10})/i;
            const fallbackMatch = text.match(fallbackRegex);
            discoveredId = fallbackMatch ? fallbackMatch[1] : '';
        }

        valAccount.value = discoveredId;
        const isValid = validateId();
        setStep(3);

        // AUTO-ADVANCE: If ID is valid, automatically trigger the portal redirection
        if (isValid) {
            console.log('[Comet Browser AI] Valid ID detected. Auto-advancing to portal redirection...');
            setTimeout(() => {
                startRedirectionFlow();
            }, 1500); // 1.5s delay to let user see the verified ID
        }
    }

    /**
     * Live Validation Feedback
     */
    function validateId() {
        const id = valAccount.value.trim();
        const isValid = /^\d{10}$/.test(id);

        if (isValid) {
            validationMsg.innerHTML = '<i data-lucide="check-circle" size="18"></i> Account ID Verified';
            validationMsg.style.color = 'var(--success)';
            valAccount.style.borderColor = 'var(--success)';
            valAccount.style.textShadow = '0 0 15px rgba(16, 185, 129, 0.3)';
        } else {
            validationMsg.innerHTML = '<i data-lucide="alert-circle" size="18"></i> Invalid ID (Must be 10 digits)';
            validationMsg.style.color = 'var(--error)';
            valAccount.style.borderColor = 'var(--error)';
            valAccount.style.textShadow = 'none';
        }

        if (window.lucide) lucide.createIcons();
        return isValid;
    }

    valAccount.addEventListener('input', validateId);

    /**
     * Copy to Clipboard
     */
    copyIdBtn.addEventListener('click', async () => {
        const id = valAccount.value.trim();
        if (!id) return;

        try {
            await navigator.clipboard.writeText(id);
            copyIdBtn.classList.add('copied');
            copyIdBtn.innerHTML = '<i data-lucide="check"></i>';
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                copyIdBtn.classList.remove('copied');
                copyIdBtn.innerHTML = '<i data-lucide="copy"></i>';
                if (window.lucide) lucide.createIcons();
            }, 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    });

    /**
     * Navigation & Redirection
     */
    async function startRedirectionFlow() {
        const id = valAccount.value.trim();
        if (id.length !== 10) {
            alert('Please provide a valid 10-digit BESCOM Account ID before proceeding.');
            return;
        }

        // Auto-copy for user convenience before redirect
        await navigator.clipboard.writeText(id);

        setStep(4);

        // Visual countdown simulation
        let dots = '';
        const dotInterval = setInterval(() => {
            dots = dots.length >= 3 ? '' : dots + '.';
            timerDots.textContent = dots;
        }, 500);

        // Official BESCOM Secure Portal - Quick Payment Page
        const BESCOM_URL = 'https://www.bescom.co.in/bescom/main/quick-payment';

        setTimeout(() => {
            clearInterval(dotInterval);
            console.log(`[Comet Browser AI] Navigating intelligent session to: ${BESCOM_URL}`);
            window.location.href = BESCOM_URL;
        }, 3000);
    }

    proceedToPortalBtn.addEventListener('click', startRedirectionFlow);

    /**
     * Reset Application
     */
    resetBtn.addEventListener('click', () => {
        setStep(1);
        billInput.value = '';
        valAccount.value = '';
    });
});

