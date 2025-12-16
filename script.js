// Polaroid configurations (sizes in cm)
const polaroidTypes = {
    classic: {
        name: 'Polaroid Clássica',
        totalWidth: 8.8,
        totalHeight: 10.7,
        imageWidth: 7.9,
        imageHeight: 7.9,
        borderTop: 0.45,
        borderSide: 0.45,
        borderBottom: 2.35
    },
    mini: {
        name: 'Instax Mini',
        totalWidth: 5.4,
        totalHeight: 8.6,
        imageWidth: 4.6,
        imageHeight: 6.2,
        borderTop: 0.4,
        borderSide: 0.4,
        borderBottom: 2.0
    },
    square: {
        name: 'Instax Square',
        totalWidth: 8.6,
        totalHeight: 7.2,
        imageWidth: 6.2,
        imageHeight: 6.2,
        borderTop: 0.5,
        borderSide: 1.2,
        borderBottom: 0.5
    },
    wide: {
        name: 'Instax Wide',
        totalWidth: 10.8,
        totalHeight: 8.6,
        imageWidth: 9.9,
        imageHeight: 6.2,
        borderTop: 0.45,
        borderSide: 0.45,
        borderBottom: 1.95
    },
    go: {
        name: 'Polaroid Go',
        totalWidth: 5.4,
        totalHeight: 6.6,
        imageWidth: 4.7,
        imageHeight: 4.7,
        borderTop: 0.35,
        borderSide: 0.35,
        borderBottom: 1.55
    },
    'mini-link': {
        name: 'Instax Mini Link',
        totalWidth: 5.4,
        totalHeight: 8.6,
        imageWidth: 4.6,
        imageHeight: 6.2,
        borderTop: 0.4,
        borderSide: 0.4,
        borderBottom: 2.0
    },
    slim: {
        name: 'Polaroid Slim',
        totalWidth: 5.0,
        totalHeight: 7.5,
        imageWidth: 4.0,
        imageHeight: 5.0,
        borderTop: 0.5,
        borderSide: 0.5,
        borderBottom: 2.0
    },
    'mini-square': {
        name: 'Mini Quadrado',
        totalWidth: 6.0,
        totalHeight: 7.0,
        imageWidth: 5.0,
        imageHeight: 5.0,
        borderTop: 0.5,
        borderSide: 0.5,
        borderBottom: 1.5
    },
    micro: {
        name: 'Micro Polaroid',
        totalWidth: 4.5,
        totalHeight: 6.0,
        imageWidth: 3.5,
        imageHeight: 3.5,
        borderTop: 0.5,
        borderSide: 0.5,
        borderBottom: 2.0
    }
};

// State
let state = {
    currentStep: 1,
    selectedType: null,
    images: [],
    currentImageIndex: 0,
    cropData: [],
    exportType: null,
    cutMarkType: 'none',
    spacing: 0,
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    specialBackground: null,
    specialFrame: null,
    // Additional effects (can combine with solid color)
    effectGradient: false,
    effectStripes: false,
    // Multiple texts support
    textElements: [],
    selectedTextIndex: -1,
    // Graphics
    graphicElements: [],
    selectedGraphicIndex: -1,
    allowOverlap: false
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedImages = document.getElementById('uploadedImages');
const imageThumbnails = document.getElementById('imageThumbnails');
const cropArea = document.getElementById('cropArea');
const cropImage = document.getElementById('cropImage');
const cropBox = document.getElementById('cropBox');
const pdfOptions = document.getElementById('pdfOptions');
const generateBtn = document.getElementById('generateBtn');
const resultGallery = document.getElementById('resultGallery');
const loadingOverlay = document.getElementById('loadingOverlay');
const continueToStep3 = document.getElementById('continueToStep3');
const continueToStep4 = document.getElementById('continueToStep4');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPolaroidSelection();
    initUpload();
    initCrop();
    initExport();
    initBackgroundOptions();
    initUnifiedCanvas();
});

// Step Navigation
function goToStep(step) {
    state.currentStep = step;
    
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });
    
    // Special handling for crop step
    if (step === 3 && state.images.length > 0) {
        initCropView();
    }
    
    // Special handling for export step - update unified canvas
    if (step === 4) {
        setTimeout(() => updateUnifiedCanvas(), 100);
    }
}

// Step 1: Polaroid Selection
function initPolaroidSelection() {
    const options = document.querySelectorAll('.polaroid-option');
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.selectedType = option.dataset.type;
            
            // Auto-advance to step 2
            setTimeout(() => goToStep(2), 300);
        });
    });
}

// Step 2: Upload
function initUpload() {
    uploadArea.addEventListener('click', () => fileInput.click());
    
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
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    continueToStep3.addEventListener('click', () => {
        if (state.images.length > 0) {
            goToStep(3);
        }
    });
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    state.images.push({
                        src: e.target.result,
                        width: img.width,
                        height: img.height,
                        file: file
                    });
                    state.cropData.push(null);
                    renderUploadedImages();
                    updateContinueButton();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderUploadedImages() {
    uploadedImages.innerHTML = state.images.map((img, i) => `
        <div class="uploaded-image">
            <img src="${img.src}" alt="Uploaded ${i + 1}">
            <button class="remove-btn" onclick="removeImage(${i})">×</button>
        </div>
    `).join('');
}

function removeImage(index) {
    state.images.splice(index, 1);
    state.cropData.splice(index, 1);
    renderUploadedImages();
    updateContinueButton();
}

function updateContinueButton() {
    continueToStep3.disabled = state.images.length === 0;
}

// Step 3: Crop
let cropState = {
    isDragging: false,
    isResizing: false,
    resizeDirection: null,
    startX: 0,
    startY: 0,
    startBoxX: 0,
    startBoxY: 0,
    startBoxWidth: 0,
    startBoxHeight: 0,
    boxX: 0,
    boxY: 0,
    boxWidth: 0,
    boxHeight: 0
};

function initCrop() {
    // Mouse events for crop box (drag)
    cropBox.addEventListener('mousedown', (e) => {
        if (e.target === cropBox) {
            startDrag(e);
        }
    });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopInteraction);
    
    // Touch events for crop box (drag)
    cropBox.addEventListener('touchstart', (e) => {
        if (e.target === cropBox) {
            e.preventDefault();
            startDrag(e.touches[0]);
        }
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
        if (cropState.isDragging || cropState.isResizing) {
            e.preventDefault();
            handleMove(e.touches[0]);
        }
    }, { passive: false });
    document.addEventListener('touchend', stopInteraction);
    
    // Resize handles
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startResize(e, handle.dataset.direction);
        });
        
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startResize(e.touches[0], handle.dataset.direction);
        }, { passive: false });
    });
    
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        resizeCropBox(1.15);
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        resizeCropBox(0.85);
    });
    
    document.getElementById('resetCrop').addEventListener('click', () => {
        initializeCropBox();
    });
    
    continueToStep4.addEventListener('click', () => {
        saveCropData();
        goToStep(4);
    });
}

function initCropView() {
    renderThumbnails();
    if (state.images.length > 0) {
        selectImageForCrop(0);
    }
}

function renderThumbnails() {
    imageThumbnails.innerHTML = state.images.map((img, i) => `
        <div class="thumbnail ${i === state.currentImageIndex ? 'active' : ''} ${state.cropData[i] ? 'cropped' : ''}" 
             onclick="selectImageForCrop(${i})">
            <img src="${img.src}" alt="Thumbnail ${i + 1}">
        </div>
    `).join('');
}

function selectImageForCrop(index) {
    // Save current crop before switching
    if (state.currentImageIndex !== index && state.images.length > 0) {
        saveCropData();
    }
    
    state.currentImageIndex = index;
    const img = state.images[index];
    
    cropImage.src = img.src;
    cropImage.onload = () => {
        // Restore previous crop or initialize
        if (state.cropData[index]) {
            restoreCropBox(state.cropData[index]);
        } else {
            initializeCropBox();
        }
    };
    
    renderThumbnails();
}

function getImageRect() {
    return cropImage.getBoundingClientRect();
}

function getAspectRatio() {
    const type = polaroidTypes[state.selectedType];
    return type.imageWidth / type.imageHeight;
}

function initializeCropBox() {
    const imgRect = getImageRect();
    const aspectRatio = getAspectRatio();
    
    // Calculate initial size (70% of smaller dimension)
    let boxWidth, boxHeight;
    
    if (aspectRatio >= 1) {
        // Wider or square
        boxWidth = Math.min(imgRect.width * 0.7, imgRect.width);
        boxHeight = boxWidth / aspectRatio;
        
        if (boxHeight > imgRect.height) {
            boxHeight = imgRect.height * 0.9;
            boxWidth = boxHeight * aspectRatio;
        }
    } else {
        // Taller
        boxHeight = Math.min(imgRect.height * 0.7, imgRect.height);
        boxWidth = boxHeight * aspectRatio;
        
        if (boxWidth > imgRect.width) {
            boxWidth = imgRect.width * 0.9;
            boxHeight = boxWidth / aspectRatio;
        }
    }
    
    cropState.boxWidth = boxWidth;
    cropState.boxHeight = boxHeight;
    cropState.boxX = (imgRect.width - boxWidth) / 2;
    cropState.boxY = (imgRect.height - boxHeight) / 2;
    
    updateCropBoxDisplay();
}

function restoreCropBox(data) {
    const imgRect = getImageRect();
    const img = state.images[state.currentImageIndex];
    
    // Convert from original image coordinates to display coordinates
    const scaleX = imgRect.width / img.width;
    const scaleY = imgRect.height / img.height;
    
    cropState.boxX = data.cropX * scaleX;
    cropState.boxY = data.cropY * scaleY;
    cropState.boxWidth = data.cropWidth * scaleX;
    cropState.boxHeight = data.cropHeight * scaleY;
    
    updateCropBoxDisplay();
}

function updateCropBoxDisplay() {
    cropBox.style.width = `${cropState.boxWidth}px`;
    cropBox.style.height = `${cropState.boxHeight}px`;
    cropBox.style.left = `${cropState.boxX}px`;
    cropBox.style.top = `${cropState.boxY}px`;
}

function startDrag(e) {
    cropState.isDragging = true;
    cropState.isResizing = false;
    cropState.startX = e.clientX;
    cropState.startY = e.clientY;
    cropState.startBoxX = cropState.boxX;
    cropState.startBoxY = cropState.boxY;
}

function startResize(e, direction) {
    cropState.isResizing = true;
    cropState.isDragging = false;
    cropState.resizeDirection = direction;
    cropState.startX = e.clientX;
    cropState.startY = e.clientY;
    cropState.startBoxX = cropState.boxX;
    cropState.startBoxY = cropState.boxY;
    cropState.startBoxWidth = cropState.boxWidth;
    cropState.startBoxHeight = cropState.boxHeight;
}

function handleMove(e) {
    if (cropState.isDragging) {
        handleDrag(e);
    } else if (cropState.isResizing) {
        handleResize(e);
    }
}

function handleDrag(e) {
    const imgRect = getImageRect();
    const deltaX = e.clientX - cropState.startX;
    const deltaY = e.clientY - cropState.startY;
    
    cropState.boxX = Math.max(0, Math.min(
        cropState.startBoxX + deltaX,
        imgRect.width - cropState.boxWidth
    ));
    cropState.boxY = Math.max(0, Math.min(
        cropState.startBoxY + deltaY,
        imgRect.height - cropState.boxHeight
    ));
    
    updateCropBoxDisplay();
}

function handleResize(e) {
    const imgRect = getImageRect();
    const aspectRatio = getAspectRatio();
    const deltaX = e.clientX - cropState.startX;
    const deltaY = e.clientY - cropState.startY;
    
    let newWidth, newHeight, newX, newY;
    const minSize = 50;
    
    switch (cropState.resizeDirection) {
        case 'se': // Bottom-right
            newWidth = Math.max(minSize, cropState.startBoxWidth + deltaX);
            newHeight = newWidth / aspectRatio;
            newX = cropState.startBoxX;
            newY = cropState.startBoxY;
            break;
            
        case 'sw': // Bottom-left
            newWidth = Math.max(minSize, cropState.startBoxWidth - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = cropState.startBoxX + cropState.startBoxWidth - newWidth;
            newY = cropState.startBoxY;
            break;
            
        case 'ne': // Top-right
            newWidth = Math.max(minSize, cropState.startBoxWidth + deltaX);
            newHeight = newWidth / aspectRatio;
            newX = cropState.startBoxX;
            newY = cropState.startBoxY + cropState.startBoxHeight - newHeight;
            break;
            
        case 'nw': // Top-left
            newWidth = Math.max(minSize, cropState.startBoxWidth - deltaX);
            newHeight = newWidth / aspectRatio;
            newX = cropState.startBoxX + cropState.startBoxWidth - newWidth;
            newY = cropState.startBoxY + cropState.startBoxHeight - newHeight;
            break;
    }
    
    // Constrain to image bounds
    if (newX < 0) {
        newX = 0;
        newWidth = cropState.startBoxX + cropState.startBoxWidth;
        newHeight = newWidth / aspectRatio;
        if (cropState.resizeDirection === 'nw' || cropState.resizeDirection === 'sw') {
            if (cropState.resizeDirection === 'nw') {
                newY = cropState.startBoxY + cropState.startBoxHeight - newHeight;
            }
        }
    }
    
    if (newY < 0) {
        newY = 0;
        newHeight = cropState.startBoxY + cropState.startBoxHeight;
        newWidth = newHeight * aspectRatio;
        if (cropState.resizeDirection === 'nw' || cropState.resizeDirection === 'ne') {
            if (cropState.resizeDirection === 'nw') {
                newX = cropState.startBoxX + cropState.startBoxWidth - newWidth;
            }
        }
    }
    
    if (newX + newWidth > imgRect.width) {
        newWidth = imgRect.width - newX;
        newHeight = newWidth / aspectRatio;
        if (cropState.resizeDirection === 'ne') {
            newY = cropState.startBoxY + cropState.startBoxHeight - newHeight;
        }
    }
    
    if (newY + newHeight > imgRect.height) {
        newHeight = imgRect.height - newY;
        newWidth = newHeight * aspectRatio;
        if (cropState.resizeDirection === 'sw') {
            newX = cropState.startBoxX + cropState.startBoxWidth - newWidth;
        }
    }
    
    // Final bounds check
    if (newX >= 0 && newY >= 0 && 
        newX + newWidth <= imgRect.width && 
        newY + newHeight <= imgRect.height &&
        newWidth >= minSize && newHeight >= minSize) {
        
        cropState.boxX = newX;
        cropState.boxY = newY;
        cropState.boxWidth = newWidth;
        cropState.boxHeight = newHeight;
        
        updateCropBoxDisplay();
    }
}

function resizeCropBox(factor) {
    const imgRect = getImageRect();
    const aspectRatio = getAspectRatio();
    
    const centerX = cropState.boxX + cropState.boxWidth / 2;
    const centerY = cropState.boxY + cropState.boxHeight / 2;
    
    let newWidth = cropState.boxWidth * factor;
    let newHeight = newWidth / aspectRatio;
    
    // Constrain to image bounds
    if (newWidth > imgRect.width) {
        newWidth = imgRect.width;
        newHeight = newWidth / aspectRatio;
    }
    if (newHeight > imgRect.height) {
        newHeight = imgRect.height;
        newWidth = newHeight * aspectRatio;
    }
    
    // Minimum size
    const minSize = 50;
    if (newWidth < minSize) {
        newWidth = minSize;
        newHeight = newWidth / aspectRatio;
    }
    
    // Calculate new position centered on previous center
    let newX = centerX - newWidth / 2;
    let newY = centerY - newHeight / 2;
    
    // Constrain position
    newX = Math.max(0, Math.min(newX, imgRect.width - newWidth));
    newY = Math.max(0, Math.min(newY, imgRect.height - newHeight));
    
    cropState.boxX = newX;
    cropState.boxY = newY;
    cropState.boxWidth = newWidth;
    cropState.boxHeight = newHeight;
    
    updateCropBoxDisplay();
}

function stopInteraction() {
    cropState.isDragging = false;
    cropState.isResizing = false;
    cropState.resizeDirection = null;
}

function saveCropData() {
    const imgRect = getImageRect();
    const img = state.images[state.currentImageIndex];
    
    // Don't save if image isn't loaded or crop box has no dimensions
    if (!img || !imgRect.width || !imgRect.height || !cropState.boxWidth || !cropState.boxHeight) {
        return;
    }
    
    // Calculate crop coordinates relative to original image
    const scaleX = img.width / imgRect.width;
    const scaleY = img.height / imgRect.height;
    
    state.cropData[state.currentImageIndex] = {
        // Original image coordinates
        cropX: cropState.boxX * scaleX,
        cropY: cropState.boxY * scaleY,
        cropWidth: cropState.boxWidth * scaleX,
        cropHeight: cropState.boxHeight * scaleY
    };
    
    renderThumbnails();
}

// Step 4: Export
function initExport() {
    const exportOptions = document.querySelectorAll('.export-option');
    
    exportOptions.forEach(option => {
        option.addEventListener('click', () => {
            exportOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.exportType = option.dataset.export;
            
            // Show PDF options if PDF selected
            if (state.exportType === 'pdf') {
                pdfOptions.classList.add('visible');
            } else {
                pdfOptions.classList.remove('visible');
            }
            
            generateBtn.disabled = false;
        });
    });
    
    // Cut mark options
    document.querySelectorAll('input[name="cutMarks"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.cutMarkType = e.target.value;
        });
    });

    // Spacing input
    const spacingInput = document.getElementById('spacingInput');
    if (spacingInput) {
        spacingInput.addEventListener('change', (e) => {
            state.spacing = parseFloat(e.target.value) || 0;
        });
    }
    
    generateBtn.addEventListener('click', generatePolaroids);
    
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
}

// Background Options
function initBackgroundOptions() {
    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.backgroundColor = option.dataset.color;
            state.backgroundType = 'solid';
            // Clear rainbow background since it cannot be combined with solid color
            if (state.specialBackground === 'rainbow') {
                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
                state.specialBackground = null;
            }
            updateUnifiedCanvas();
        });
    });

    // Special background options
    document.querySelectorAll('.bg-option').forEach(option => {
        option.addEventListener('click', () => {
            const bg = option.dataset.bg;
            
            // If rainbow is selected, clear solid color selection
            if (bg === 'rainbow') {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            }
            
            document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            state.backgroundType = 'special';
            state.specialBackground = bg;
            
            // Clear additional effects when selecting a special background
            state.effectGradient = false;
            state.effectStripes = false;
            const effectGradientCheckbox = document.getElementById('effectGradient');
            const effectStripesCheckbox = document.getElementById('effectStripes');
            if (effectGradientCheckbox) effectGradientCheckbox.checked = false;
            if (effectStripesCheckbox) effectStripesCheckbox.checked = false;
            
            updateUnifiedCanvas();
        });
    });

    // Frame options (separate from backgrounds)
    document.querySelectorAll('.frame-option').forEach(option => {
        option.addEventListener('click', () => {
            // Toggle frame selection
            if (option.classList.contains('selected')) {
                option.classList.remove('selected');
                state.specialFrame = null;
            } else {
                document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                state.specialFrame = option.dataset.frame;
            }
            updateUnifiedCanvas();
        });
    });

    // Custom color picker
    const customColorPicker = document.getElementById('customColorPicker');
    const hexInput = document.getElementById('hexInput');
    const rgbR = document.getElementById('rgbR');
    const rgbG = document.getElementById('rgbG');
    const rgbB = document.getElementById('rgbB');
    const cmykC = document.getElementById('cmykC');
    const cmykM = document.getElementById('cmykM');
    const cmykY = document.getElementById('cmykY');
    const cmykK = document.getElementById('cmykK');

    customColorPicker.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        const rgb = hexToRgb(e.target.value);
        if (rgb) {
            rgbR.value = rgb.r;
            rgbG.value = rgb.g;
            rgbB.value = rgb.b;
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            cmykC.value = Math.round(cmyk.c);
            cmykM.value = Math.round(cmyk.m);
            cmykY.value = Math.round(cmyk.y);
            cmykK.value = Math.round(cmyk.k);
        }
    });

    hexInput.addEventListener('input', (e) => {
        let hex = e.target.value;
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            customColorPicker.value = hex;
            const rgb = hexToRgb(hex);
            if (rgb) {
                rgbR.value = rgb.r;
                rgbG.value = rgb.g;
                rgbB.value = rgb.b;
                const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
                cmykC.value = Math.round(cmyk.c);
                cmykM.value = Math.round(cmyk.m);
                cmykY.value = Math.round(cmyk.y);
                cmykK.value = Math.round(cmyk.k);
            }
        }
    });

    [rgbR, rgbG, rgbB].forEach(input => {
        input.addEventListener('input', () => {
            const r = parseInt(rgbR.value) || 0;
            const g = parseInt(rgbG.value) || 0;
            const b = parseInt(rgbB.value) || 0;
            const hex = rgbToHex(r, g, b);
            customColorPicker.value = hex;
            hexInput.value = hex;
            const cmyk = rgbToCmyk(r, g, b);
            cmykC.value = Math.round(cmyk.c);
            cmykM.value = Math.round(cmyk.m);
            cmykY.value = Math.round(cmyk.y);
            cmykK.value = Math.round(cmyk.k);
        });
    });

    [cmykC, cmykM, cmykY, cmykK].forEach(input => {
        input.addEventListener('input', () => {
            const c = parseInt(cmykC.value) || 0;
            const m = parseInt(cmykM.value) || 0;
            const y = parseInt(cmykY.value) || 0;
            const k = parseInt(cmykK.value) || 0;
            const rgb = cmykToRgb(c, m, y, k);
            rgbR.value = rgb.r;
            rgbG.value = rgb.g;
            rgbB.value = rgb.b;
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            customColorPicker.value = hex;
            hexInput.value = hex;
        });
    });

    document.getElementById('applyCustomColor').addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        state.backgroundColor = customColorPicker.value;
        state.backgroundType = 'solid';
        // Clear rainbow since it can't combine with solid colors
        if (state.specialBackground === 'rainbow') {
            document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
            state.specialBackground = null;
        }
        updateUnifiedCanvas();
    });

    // Additional effects checkboxes
    const effectGradientCheckbox = document.getElementById('effectGradient');
    const effectStripesCheckbox = document.getElementById('effectStripes');

    if (effectGradientCheckbox) {
        effectGradientCheckbox.addEventListener('change', () => {
            state.effectGradient = effectGradientCheckbox.checked;
            // Clear special backgrounds that conflict with additional effects
            if (state.effectGradient && state.specialBackground) {
                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
                state.specialBackground = null;
                state.backgroundType = 'solid';
            }
            updateUnifiedCanvas();
        });
    }

    if (effectStripesCheckbox) {
        effectStripesCheckbox.addEventListener('change', () => {
            state.effectStripes = effectStripesCheckbox.checked;
            // Clear special backgrounds that conflict with additional effects
            if (state.effectStripes && state.specialBackground) {
                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
                state.specialBackground = null;
                state.backgroundType = 'solid';
            }
            updateUnifiedCanvas();
        });
    }
}

// ========================================
// UNIFIED CANVAS - Positioning Text & Graphics
// ========================================

let unifiedCanvasState = {
    isDragging: false,
    isResizing: false,
    isRotating: false,
    dragTarget: null, // 'text-0', 'graphic-0', etc.
    resizeTarget: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startElementWidth: 0,
    startElementHeight: 0,
    startElementAngle: 0,
    elementCenterX: 0,
    elementCenterY: 0,
    previewImage: null,
    // Animation frame tracking for smooth rendering
    animationFrameId: null,
    isRendering: false,
    needsRender: false,
    // Cached images to prevent flickering
    cachedImages: new Map()
};

function initUnifiedCanvas() {
    const canvas = document.getElementById('unifiedPreviewCanvas');
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseUp);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleCanvasMouseDown({ clientX: touch.clientX, clientY: touch.clientY, target: e.target });
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleCanvasMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });
    canvas.addEventListener('touchend', handleCanvasMouseUp);

    // Add text button
    document.getElementById('addTextBtn')?.addEventListener('click', addNewText);
    
    // Reset text positions button
    document.getElementById('resetTextPositionsBtn')?.addEventListener('click', resetTextPositions);
    
    // Text controls
    document.getElementById('textContent')?.addEventListener('input', updateSelectedText);
    document.getElementById('fontSelect')?.addEventListener('change', updateSelectedText);
    document.getElementById('textColor')?.addEventListener('input', updateSelectedText);
    document.getElementById('textSize')?.addEventListener('input', updateSelectedTextSize);
    document.getElementById('textAngle')?.addEventListener('input', updateSelectedTextAngle);
    document.getElementById('deleteTextBtn')?.addEventListener('click', deleteSelectedText);

    // Graphic upload
    const graphicUploadArea = document.getElementById('graphicUploadArea');
    const graphicInput = document.getElementById('graphicInput');
    
    if (graphicUploadArea && graphicInput) {
        graphicUploadArea.addEventListener('click', () => graphicInput.click());
        graphicUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            graphicUploadArea.classList.add('dragover');
        });
        graphicUploadArea.addEventListener('dragleave', () => {
            graphicUploadArea.classList.remove('dragover');
        });
        graphicUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            graphicUploadArea.classList.remove('dragover');
            handleGraphicFiles(e.dataTransfer.files);
        });
        graphicInput.addEventListener('change', (e) => {
            handleGraphicFiles(e.target.files);
        });
    }

    // Graphic angle control
    document.getElementById('graphicAngle')?.addEventListener('input', updateSelectedGraphicAngle);

    // Overlap checkbox
    const overlapCheckbox = document.getElementById('overlapCheckbox');
    if (overlapCheckbox) {
        overlapCheckbox.addEventListener('change', (e) => {
            state.allowOverlap = e.target.checked;
            updateUnifiedCanvas();
        });
    }

    // Initial render
    setTimeout(() => updateUnifiedCanvas(), 100);
}

function addNewText() {
    const newText = {
        text: 'Novo texto',
        font: 'Arial',
        color: '#333333',
        size: 20,
        x: 0.5,
        y: 0.85 + (state.textElements.length * 0.05), // Stagger new texts
        angle: 0,
        scale: 1
    };
    state.textElements.push(newText);
    state.selectedTextIndex = state.textElements.length - 1;
    updateTextControls();
    updateUnifiedCanvas();
    renderTextList();
}

function resetTextPositions() {
    state.textElements.forEach((text, i) => {
        text.x = 0.5;
        text.y = 0.85 + (i * 0.05);
    });
    updateUnifiedCanvas();
}

function updateSelectedText() {
    if (state.selectedTextIndex < 0 || state.selectedTextIndex >= state.textElements.length) return;
    
    const text = state.textElements[state.selectedTextIndex];
    text.text = document.getElementById('textContent')?.value || '';
    text.font = document.getElementById('fontSelect')?.value || 'Arial';
    text.color = document.getElementById('textColor')?.value || '#333333';
    
    updateUnifiedCanvas();
    renderTextList();
}

function updateSelectedTextSize() {
    if (state.selectedTextIndex < 0 || state.selectedTextIndex >= state.textElements.length) return;
    
    const sizeInput = document.getElementById('textSize');
    const sizeValue = document.getElementById('textSizeValue');
    if (sizeInput) {
        state.textElements[state.selectedTextIndex].size = parseInt(sizeInput.value);
        if (sizeValue) sizeValue.textContent = `${sizeInput.value}px`;
    }
    updateUnifiedCanvas();
}

function updateSelectedTextAngle() {
    if (state.selectedTextIndex < 0 || state.selectedTextIndex >= state.textElements.length) return;
    
    const angleInput = document.getElementById('textAngle');
    const angleValue = document.getElementById('textAngleValue');
    if (angleInput) {
        state.textElements[state.selectedTextIndex].angle = parseInt(angleInput.value);
        if (angleValue) angleValue.textContent = `${angleInput.value}°`;
    }
    updateUnifiedCanvas();
}

function updateSelectedGraphicAngle() {
    if (state.selectedGraphicIndex < 0 || state.selectedGraphicIndex >= state.graphicElements.length) return;
    
    const angleInput = document.getElementById('graphicAngle');
    const angleValue = document.getElementById('graphicAngleValue');
    if (angleInput) {
        state.graphicElements[state.selectedGraphicIndex].angle = parseInt(angleInput.value);
        if (angleValue) angleValue.textContent = `${angleInput.value}°`;
    }
    updateUnifiedCanvas();
}

function deleteSelectedText() {
    if (state.selectedTextIndex >= 0 && state.selectedTextIndex < state.textElements.length) {
        state.textElements.splice(state.selectedTextIndex, 1);
        state.selectedTextIndex = state.textElements.length > 0 ? 0 : -1;
        updateTextControls();
        updateUnifiedCanvas();
        renderTextList();
    }
}

function updateTextControls() {
    const text = state.textElements[state.selectedTextIndex];
    if (text) {
        const textContent = document.getElementById('textContent');
        const fontSelect = document.getElementById('fontSelect');
        const textColor = document.getElementById('textColor');
        const textSize = document.getElementById('textSize');
        const textSizeValue = document.getElementById('textSizeValue');
        const textAngle = document.getElementById('textAngle');
        const textAngleValue = document.getElementById('textAngleValue');
        
        if (textContent) textContent.value = text.text;
        if (fontSelect) fontSelect.value = text.font;
        if (textColor) textColor.value = text.color;
        if (textSize) textSize.value = text.size;
        if (textSizeValue) textSizeValue.textContent = `${text.size}px`;
        if (textAngle) textAngle.value = text.angle || 0;
        if (textAngleValue) textAngleValue.textContent = `${text.angle || 0}°`;
    }
    
    // Enable/disable text controls based on selection
    const hasTextSelection = state.selectedTextIndex >= 0;
    document.getElementById('textContent')?.toggleAttribute('disabled', !hasTextSelection);
    document.getElementById('fontSelect')?.toggleAttribute('disabled', !hasTextSelection);
    document.getElementById('textColor')?.toggleAttribute('disabled', !hasTextSelection);
    document.getElementById('textSize')?.toggleAttribute('disabled', !hasTextSelection);
    document.getElementById('textAngle')?.toggleAttribute('disabled', !hasTextSelection);
    document.getElementById('deleteTextBtn')?.toggleAttribute('disabled', !hasTextSelection);
    
    // Update graphic controls
    const graphic = state.graphicElements[state.selectedGraphicIndex];
    const graphicAngle = document.getElementById('graphicAngle');
    const graphicAngleValue = document.getElementById('graphicAngleValue');
    if (graphic) {
        if (graphicAngle) graphicAngle.value = graphic.angle || 0;
        if (graphicAngleValue) graphicAngleValue.textContent = `${graphic.angle || 0}°`;
    } else {
        if (graphicAngle) graphicAngle.value = 0;
        if (graphicAngleValue) graphicAngleValue.textContent = '0°';
    }
    
    // Enable/disable graphic controls based on selection
    const hasGraphicSelection = state.selectedGraphicIndex >= 0;
    document.getElementById('graphicAngle')?.toggleAttribute('disabled', !hasGraphicSelection);
}

function renderTextList() {
    const listContainer = document.getElementById('textElementsList');
    if (!listContainer) return;
    
    listContainer.innerHTML = state.textElements.map((text, i) => `
        <div class="text-list-item ${i === state.selectedTextIndex ? 'selected' : ''}" 
             onclick="selectTextElement(${i})">
            <span class="text-preview">${text.text.substring(0, 20)}${text.text.length > 20 ? '...' : ''}</span>
            <button class="remove-btn-small" onclick="event.stopPropagation(); removeTextElement(${i})">×</button>
        </div>
    `).join('');
}

function selectTextElement(index) {
    state.selectedTextIndex = index;
    state.selectedGraphicIndex = -1;
    updateTextControls();
    updateUnifiedCanvas();
    renderTextList();
}

function removeTextElement(index) {
    state.textElements.splice(index, 1);
    if (state.selectedTextIndex >= state.textElements.length) {
        state.selectedTextIndex = state.textElements.length - 1;
    }
    updateTextControls();
    updateUnifiedCanvas();
    renderTextList();
}

function handleGraphicFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    state.graphicElements.push({
                        src: e.target.result,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        x: 0.5,
                        y: 0.5,
                        scale: 0.3,
                        angle: 0
                    });
                    renderUploadedGraphics();
                    updateUnifiedCanvas();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderUploadedGraphics() {
    const uploadedGraphics = document.getElementById('uploadedGraphics');
    if (!uploadedGraphics) return;
    
    uploadedGraphics.innerHTML = state.graphicElements.map((g, i) => `
        <div class="uploaded-graphic ${i === state.selectedGraphicIndex ? 'selected' : ''}" 
             onclick="selectGraphicElement(${i})">
            <img src="${g.src}" alt="Graphic ${i + 1}">
            <button class="remove-btn" onclick="event.stopPropagation(); removeGraphic(${i})">×</button>
        </div>
    `).join('');
}

function selectGraphicElement(index) {
    state.selectedGraphicIndex = index;
    state.selectedTextIndex = -1;
    updateTextControls();
    updateUnifiedCanvas();
    renderUploadedGraphics();
}

function removeGraphic(index) {
    state.graphicElements.splice(index, 1);
    if (state.selectedGraphicIndex >= state.graphicElements.length) {
        state.selectedGraphicIndex = -1;
    }
    renderUploadedGraphics();
    updateUnifiedCanvas();
}

function getCanvasCoordinates(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function handleCanvasMouseDown(e) {
    const canvas = document.getElementById('unifiedPreviewCanvas');
    if (!canvas) return;
    
    const pos = getCanvasCoordinates(canvas, e);
    const hitResult = hitTest(pos.x, pos.y, canvas.width, canvas.height);
    
    if (hitResult) {
        unifiedCanvasState.dragTarget = hitResult.type;
        unifiedCanvasState.startX = pos.x;
        unifiedCanvasState.startY = pos.y;
        
        // Store element center for rotation calculations
        const dimensions = getElementDimensions(hitResult.type, canvas.width, canvas.height);
        if (dimensions) {
            unifiedCanvasState.elementCenterX = dimensions.centerX;
            unifiedCanvasState.elementCenterY = dimensions.centerY;
        }
        
        if (hitResult.type.startsWith('text-')) {
            const idx = parseInt(hitResult.type.split('-')[1]);
            state.selectedTextIndex = idx;
            state.selectedGraphicIndex = -1;
            unifiedCanvasState.startElementX = state.textElements[idx].x;
            unifiedCanvasState.startElementY = state.textElements[idx].y;
            unifiedCanvasState.startElementWidth = state.textElements[idx].scale || 1;
            unifiedCanvasState.startElementAngle = state.textElements[idx].angle || 0;
            updateTextControls();
            renderTextList();
            
            // Check if clicking on resize or rotate handle
            if (hitResult.rotate) {
                unifiedCanvasState.isRotating = true;
                unifiedCanvasState.isDragging = false;
                unifiedCanvasState.isResizing = false;
            } else if (hitResult.resize) {
                unifiedCanvasState.isResizing = true;
                unifiedCanvasState.isDragging = false;
                unifiedCanvasState.isRotating = false;
            } else {
                unifiedCanvasState.isDragging = true;
                unifiedCanvasState.isResizing = false;
                unifiedCanvasState.isRotating = false;
            }
        } else if (hitResult.type.startsWith('graphic-')) {
            const idx = parseInt(hitResult.type.split('-')[1]);
            state.selectedGraphicIndex = idx;
            state.selectedTextIndex = -1;
            unifiedCanvasState.startElementX = state.graphicElements[idx].x;
            unifiedCanvasState.startElementY = state.graphicElements[idx].y;
            unifiedCanvasState.startElementWidth = state.graphicElements[idx].scale;
            unifiedCanvasState.startElementAngle = state.graphicElements[idx].angle || 0;
            updateTextControls();
            renderUploadedGraphics();
            
            // Check if clicking on resize or rotate handle
            if (hitResult.rotate) {
                unifiedCanvasState.isRotating = true;
                unifiedCanvasState.isDragging = false;
                unifiedCanvasState.isResizing = false;
            } else if (hitResult.resize) {
                unifiedCanvasState.isResizing = true;
                unifiedCanvasState.isDragging = false;
                unifiedCanvasState.isRotating = false;
            } else {
                unifiedCanvasState.isDragging = true;
                unifiedCanvasState.isResizing = false;
                unifiedCanvasState.isRotating = false;
            }
        }
        updateUnifiedCanvas();
    } else {
        // Deselect all
        state.selectedTextIndex = -1;
        state.selectedGraphicIndex = -1;
        updateTextControls();
        renderTextList();
        renderUploadedGraphics();
        updateUnifiedCanvas();
    }
}

function handleCanvasMouseMove(e) {
    const canvas = document.getElementById('unifiedPreviewCanvas');
    if (!canvas) return;
    
    const pos = getCanvasCoordinates(canvas, e);
    
    if (unifiedCanvasState.isDragging && unifiedCanvasState.dragTarget) {
        const deltaX = (pos.x - unifiedCanvasState.startX) / canvas.width;
        const deltaY = (pos.y - unifiedCanvasState.startY) / canvas.height;
        
        if (unifiedCanvasState.dragTarget.startsWith('text-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.textElements[idx]) {
                state.textElements[idx].x = Math.max(0.05, Math.min(0.95, unifiedCanvasState.startElementX + deltaX));
                state.textElements[idx].y = Math.max(0.05, Math.min(0.95, unifiedCanvasState.startElementY + deltaY));
            }
        } else if (unifiedCanvasState.dragTarget.startsWith('graphic-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.graphicElements[idx]) {
                state.graphicElements[idx].x = Math.max(0.05, Math.min(0.95, unifiedCanvasState.startElementX + deltaX));
                state.graphicElements[idx].y = Math.max(0.05, Math.min(0.95, unifiedCanvasState.startElementY + deltaY));
            }
        }
        updateUnifiedCanvas();
    } else if (unifiedCanvasState.isResizing && unifiedCanvasState.dragTarget) {
        if (unifiedCanvasState.dragTarget.startsWith('graphic-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.graphicElements[idx]) {
                const deltaX = (pos.x - unifiedCanvasState.startX) / canvas.width;
                const newScale = Math.max(0.1, Math.min(1.5, unifiedCanvasState.startElementWidth + deltaX));
                state.graphicElements[idx].scale = newScale;
            }
        } else if (unifiedCanvasState.dragTarget.startsWith('text-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.textElements[idx]) {
                const deltaX = (pos.x - unifiedCanvasState.startX) / canvas.width;
                const newScale = Math.max(0.5, Math.min(3, unifiedCanvasState.startElementWidth + deltaX * 2));
                state.textElements[idx].scale = newScale;
                // Also update UI slider if present
                const scaleInput = document.getElementById('textScale');
                const scaleValue = document.getElementById('textScaleValue');
                if (scaleInput) scaleInput.value = Math.round(newScale * 100);
                if (scaleValue) scaleValue.textContent = `${Math.round(newScale * 100)}%`;
            }
        }
        updateUnifiedCanvas();
    } else if (unifiedCanvasState.isRotating && unifiedCanvasState.dragTarget) {
        // Calculate angle from element center to mouse position
        const centerX = unifiedCanvasState.elementCenterX;
        const centerY = unifiedCanvasState.elementCenterY;
        const angle = Math.atan2(pos.y - centerY, pos.x - centerX) * 180 / Math.PI + 90;
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const snappedAngle = Math.round(normalizedAngle);
        
        if (unifiedCanvasState.dragTarget.startsWith('graphic-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.graphicElements[idx]) {
                state.graphicElements[idx].angle = snappedAngle > 180 ? snappedAngle - 360 : snappedAngle;
                // Update UI slider
                const angleInput = document.getElementById('graphicAngle');
                const angleValue = document.getElementById('graphicAngleValue');
                if (angleInput) angleInput.value = state.graphicElements[idx].angle;
                if (angleValue) angleValue.textContent = `${state.graphicElements[idx].angle}°`;
            }
        } else if (unifiedCanvasState.dragTarget.startsWith('text-')) {
            const idx = parseInt(unifiedCanvasState.dragTarget.split('-')[1]);
            if (state.textElements[idx]) {
                state.textElements[idx].angle = snappedAngle > 180 ? snappedAngle - 360 : snappedAngle;
                // Update UI slider
                const angleInput = document.getElementById('textAngle');
                const angleValue = document.getElementById('textAngleValue');
                if (angleInput) angleInput.value = state.textElements[idx].angle;
                if (angleValue) angleValue.textContent = `${state.textElements[idx].angle}°`;
            }
        }
        updateUnifiedCanvas();
    } else {
        // Update cursor
        const hitResult = hitTest(pos.x, pos.y, canvas.width, canvas.height);
        if (hitResult) {
            if (hitResult.rotate) {
                canvas.style.cursor = 'grab';
            } else if (hitResult.resize) {
                canvas.style.cursor = 'nwse-resize';
            } else {
                canvas.style.cursor = 'move';
            }
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function handleCanvasMouseUp() {
    unifiedCanvasState.isDragging = false;
    unifiedCanvasState.isResizing = false;
    unifiedCanvasState.isRotating = false;
    unifiedCanvasState.dragTarget = null;
}

function hitTest(x, y, canvasWidth, canvasHeight) {
    // Get polaroid dimensions for scaling
    const type = polaroidTypes[state.selectedType] || polaroidTypes.classic;
    const aspectRatio = type.totalWidth / type.totalHeight;
    
    // Calculate image area within canvas
    let polaroidWidth, polaroidHeight;
    if (canvasWidth / canvasHeight > aspectRatio) {
        polaroidHeight = canvasHeight * 0.9;
        polaroidWidth = polaroidHeight * aspectRatio;
    } else {
        polaroidWidth = canvasWidth * 0.9;
        polaroidHeight = polaroidWidth / aspectRatio;
    }
    
    const offsetX = (canvasWidth - polaroidWidth) / 2;
    const offsetY = (canvasHeight - polaroidHeight) / 2;
    const handleSize = 12;
    const rotateHandleDistance = 25;
    
    // Check graphics first (they're on top)
    for (let i = state.graphicElements.length - 1; i >= 0; i--) {
        const g = state.graphicElements[i];
        const gx = offsetX + g.x * polaroidWidth;
        const gy = offsetY + g.y * polaroidHeight;
        const gw = polaroidWidth * g.scale * 0.5;
        const gh = gw * (g.originalHeight / g.originalWidth);
        const angle = (g.angle || 0) * Math.PI / 180;
        
        // Transform hit point to element's local coordinates (accounting for rotation)
        const localX = (x - gx) * Math.cos(-angle) - (y - gy) * Math.sin(-angle);
        const localY = (x - gx) * Math.sin(-angle) + (y - gy) * Math.cos(-angle);
        
        // Check rotate handle (above element)
        const rotateHandleLocalY = -gh / 2 - rotateHandleDistance;
        if (Math.abs(localX) <= handleSize && Math.abs(localY - rotateHandleLocalY) <= handleSize) {
            return { type: `graphic-${i}`, resize: false, rotate: true };
        }
        
        // Check resize handle (bottom-right corner)
        const resizeHandleLocalX = gw / 2;
        const resizeHandleLocalY = gh / 2;
        if (Math.abs(localX - resizeHandleLocalX) <= handleSize && Math.abs(localY - resizeHandleLocalY) <= handleSize) {
            return { type: `graphic-${i}`, resize: true, rotate: false };
        }
        
        // Check graphic body
        if (localX >= -gw / 2 && localX <= gw / 2 && localY >= -gh / 2 && localY <= gh / 2) {
            return { type: `graphic-${i}`, resize: false, rotate: false };
        }
    }
    
    // Check text elements
    for (let i = state.textElements.length - 1; i >= 0; i--) {
        const t = state.textElements[i];
        const tx = offsetX + t.x * polaroidWidth;
        const ty = offsetY + t.y * polaroidHeight;
        const scale = t.scale || 1;
        const fontSize = t.size * 0.6 * scale;
        const textWidth = t.text.length * fontSize * 0.5;
        const textHeight = fontSize * 1.5;
        const angle = (t.angle || 0) * Math.PI / 180;
        
        // Transform hit point to element's local coordinates (accounting for rotation)
        const localX = (x - tx) * Math.cos(-angle) - (y - ty) * Math.sin(-angle);
        const localY = (x - tx) * Math.sin(-angle) + (y - ty) * Math.cos(-angle);
        
        // Check rotate handle (above element)
        const rotateHandleLocalY = -textHeight / 2 - rotateHandleDistance;
        if (Math.abs(localX) <= handleSize && Math.abs(localY - rotateHandleLocalY) <= handleSize) {
            return { type: `text-${i}`, resize: false, rotate: true };
        }
        
        // Check resize handle (bottom-right corner) - positioned at textWidth/2 + 4, textHeight/2 + 2
        const resizeHandleLocalX = textWidth / 2 + 4;
        const resizeHandleLocalY = textHeight / 2 + 2;
        if (Math.abs(localX - resizeHandleLocalX) <= handleSize && Math.abs(localY - resizeHandleLocalY) <= handleSize) {
            return { type: `text-${i}`, resize: true, rotate: false };
        }
        
        // Check text body
        if (localX >= -textWidth / 2 && localX <= textWidth / 2 && 
            localY >= -textHeight / 2 && localY <= textHeight / 2) {
            return { type: `text-${i}`, resize: false, rotate: false };
        }
    }
    
    return null;
}

// Helper function to get element dimensions for rotation calculations
function getElementDimensions(elementType, canvasWidth, canvasHeight) {
    const type = polaroidTypes[state.selectedType] || polaroidTypes.classic;
    const aspectRatio = type.totalWidth / type.totalHeight;
    
    let polaroidWidth, polaroidHeight;
    if (canvasWidth / canvasHeight > aspectRatio) {
        polaroidHeight = canvasHeight * 0.9;
        polaroidWidth = polaroidHeight * aspectRatio;
    } else {
        polaroidWidth = canvasWidth * 0.9;
        polaroidHeight = polaroidWidth / aspectRatio;
    }
    
    const offsetX = (canvasWidth - polaroidWidth) / 2;
    const offsetY = (canvasHeight - polaroidHeight) / 2;
    
    if (elementType.startsWith('graphic-')) {
        const idx = parseInt(elementType.split('-')[1]);
        const g = state.graphicElements[idx];
        if (g) {
            return {
                centerX: offsetX + g.x * polaroidWidth,
                centerY: offsetY + g.y * polaroidHeight
            };
        }
    } else if (elementType.startsWith('text-')) {
        const idx = parseInt(elementType.split('-')[1]);
        const t = state.textElements[idx];
        if (t) {
            return {
                centerX: offsetX + t.x * polaroidWidth,
                centerY: offsetY + t.y * polaroidHeight
            };
        }
    }
    return null;
}

// Cached image loader to prevent flickering
async function loadCachedImage(src) {
    if (unifiedCanvasState.cachedImages.has(src)) {
        return unifiedCanvasState.cachedImages.get(src);
    }
    const img = await loadImage(src);
    unifiedCanvasState.cachedImages.set(src, img);
    return img;
}

// Request canvas update with debouncing to prevent flickering
function requestCanvasUpdate() {
    if (unifiedCanvasState.animationFrameId) {
        return; // Already scheduled
    }
    unifiedCanvasState.animationFrameId = requestAnimationFrame(async () => {
        unifiedCanvasState.animationFrameId = null;
        await renderUnifiedCanvas();
    });
}

// Wrapper that schedules render
async function updateUnifiedCanvas() {
    requestCanvasUpdate();
}

// Actual render function
async function renderUnifiedCanvas() {
    const canvas = document.getElementById('unifiedPreviewCanvas');
    if (!canvas) return;
    
    // Prevent concurrent renders
    if (unifiedCanvasState.isRendering) {
        unifiedCanvasState.needsRender = true;
        return;
    }
    
    unifiedCanvasState.isRendering = true;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, width, height);
    
    // Get polaroid type dimensions
    const type = polaroidTypes[state.selectedType] || polaroidTypes.classic;
    const aspectRatio = type.totalWidth / type.totalHeight;
    
    // Calculate polaroid size to fit canvas
    let polaroidWidth, polaroidHeight;
    if (width / height > aspectRatio) {
        polaroidHeight = height * 0.9;
        polaroidWidth = polaroidHeight * aspectRatio;
    } else {
        polaroidWidth = width * 0.9;
        polaroidHeight = polaroidWidth / aspectRatio;
    }
    
    const offsetX = (width - polaroidWidth) / 2;
    const offsetY = (height - polaroidHeight) / 2;
    
    // Calculate relative dimensions
    const borderTopRatio = type.borderTop / type.totalHeight;
    const borderSideRatio = type.borderSide / type.totalWidth;
    const borderBottomRatio = type.borderBottom / type.totalHeight;
    const imageWidthRatio = type.imageWidth / type.totalWidth;
    const imageHeightRatio = type.imageHeight / type.totalHeight;
    
    const borderTop = borderTopRatio * polaroidHeight;
    const borderSide = borderSideRatio * polaroidWidth;
    const imageWidth = imageWidthRatio * polaroidWidth;
    const imageHeight = imageHeightRatio * polaroidHeight;
    
    // Draw background
    await drawCanvasBackground(ctx, offsetX, offsetY, polaroidWidth, polaroidHeight, imageWidth, imageHeight, borderTop, borderSide);
    
    // Draw preview image (first image from crop step if available)
    if (state.images.length > 0 && state.cropData[0]) {
        try {
            const img = await loadCachedImage(state.images[0].src);
            const crop = state.cropData[0];
            ctx.drawImage(
                img,
                crop.cropX, crop.cropY, crop.cropWidth, crop.cropHeight,
                offsetX + borderSide, offsetY + borderTop, imageWidth, imageHeight
            );
        } catch (e) {
            // Draw placeholder
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(offsetX + borderSide, offsetY + borderTop, imageWidth, imageHeight);
        }
    } else if (state.images.length > 0) {
        // Draw first image without crop
        try {
            const img = await loadCachedImage(state.images[0].src);
            // Auto-crop to fit
            const imgAspect = img.width / img.height;
            const targetAspect = imageWidth / imageHeight;
            let sx, sy, sw, sh;
            if (imgAspect > targetAspect) {
                sh = img.height;
                sw = sh * targetAspect;
                sx = (img.width - sw) / 2;
                sy = 0;
            } else {
                sw = img.width;
                sh = sw / targetAspect;
                sx = 0;
                sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, offsetX + borderSide, offsetY + borderTop, imageWidth, imageHeight);
        } catch (e) {
            // Draw placeholder
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(offsetX + borderSide, offsetY + borderTop, imageWidth, imageHeight);
        }
    } else {
        // Draw placeholder
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(offsetX + borderSide, offsetY + borderTop, imageWidth, imageHeight);
    }
    
    // Draw frame effects
    drawCanvasFrameEffects(ctx, offsetX, offsetY, polaroidWidth, polaroidHeight, borderSide, borderTop, imageWidth, imageHeight);
    
    // Draw graphic elements
    for (let i = 0; i < state.graphicElements.length; i++) {
        const g = state.graphicElements[i];
        try {
            const img = await loadCachedImage(g.src);
            const gw = polaroidWidth * g.scale * 0.5;
            const gh = gw * (g.originalHeight / g.originalWidth);
            const gx = offsetX + g.x * polaroidWidth;
            const gy = offsetY + g.y * polaroidHeight;
            const angle = (g.angle || 0) * Math.PI / 180;
            
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(angle);
            ctx.drawImage(img, -gw / 2, -gh / 2, gw, gh);
            ctx.restore();
            
            // Draw selection indicator with handles
            if (i === state.selectedGraphicIndex) {
                ctx.save();
                ctx.translate(gx, gy);
                ctx.rotate(angle);
                
                // Selection border
                ctx.strokeStyle = '#4a90d9';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-gw / 2 - 2, -gh / 2 - 2, gw + 4, gh + 4);
                ctx.setLineDash([]);
                
                // Corner resize handles
                const handleSize = 10;
                ctx.fillStyle = '#4a90d9';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                
                // Bottom-right resize handle (main resize)
                ctx.fillRect(gw / 2 - handleSize / 2, gh / 2 - handleSize / 2, handleSize, handleSize);
                ctx.strokeRect(gw / 2 - handleSize / 2, gh / 2 - handleSize / 2, handleSize, handleSize);
                
                // Rotate handle (above element)
                const rotateHandleDistance = 25;
                
                // Line from top center to rotate handle
                ctx.beginPath();
                ctx.strokeStyle = '#4a90d9';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.moveTo(0, -gh / 2 - 2);
                ctx.lineTo(0, -gh / 2 - rotateHandleDistance + 8);
                ctx.stroke();
                
                // Rotate handle circle
                ctx.beginPath();
                ctx.fillStyle = '#4a90d9';
                ctx.arc(0, -gh / 2 - rotateHandleDistance, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Rotation icon inside circle
                ctx.beginPath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.arc(0, -gh / 2 - rotateHandleDistance, 4, -Math.PI * 0.7, Math.PI * 0.5);
                ctx.stroke();
                // Arrow head
                ctx.beginPath();
                ctx.moveTo(3, -gh / 2 - rotateHandleDistance + 3);
                ctx.lineTo(4, -gh / 2 - rotateHandleDistance - 1);
                ctx.lineTo(0, -gh / 2 - rotateHandleDistance + 1);
                ctx.stroke();
                
                ctx.restore();
            }
        } catch (e) {
            console.error('Error loading graphic:', e);
        }
    }
    
    // Draw text elements
    for (let i = 0; i < state.textElements.length; i++) {
        const t = state.textElements[i];
        const tx = offsetX + t.x * polaroidWidth;
        const ty = offsetY + t.y * polaroidHeight;
        const angle = (t.angle || 0) * Math.PI / 180;
        const scale = t.scale || 1;
        
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);
        ctx.font = `${t.size * 0.6 * scale}px ${t.font}`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.text, 0, 0);
        
        // Draw selection indicator with handles
        if (i === state.selectedTextIndex) {
            const textMetrics = ctx.measureText(t.text);
            const textWidth = textMetrics.width;
            const textHeight = t.size * 0.6 * scale * 1.2;
            
            // Selection border
            ctx.strokeStyle = '#4a90d9';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(-textWidth / 2 - 4, -textHeight / 2 - 2, textWidth + 8, textHeight + 4);
            ctx.setLineDash([]);
            
            // Corner resize handle
            const handleSize = 10;
            ctx.fillStyle = '#4a90d9';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // Bottom-right resize handle
            ctx.fillRect(textWidth / 2 + 4 - handleSize / 2, textHeight / 2 + 2 - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(textWidth / 2 + 4 - handleSize / 2, textHeight / 2 + 2 - handleSize / 2, handleSize, handleSize);
            
            // Rotate handle (above element)
            const rotateHandleDistance = 25;
            
            // Line from top center to rotate handle
            ctx.beginPath();
            ctx.strokeStyle = '#4a90d9';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.moveTo(0, -textHeight / 2 - 2);
            ctx.lineTo(0, -textHeight / 2 - rotateHandleDistance + 8);
            ctx.stroke();
            
            // Rotate handle circle
            ctx.beginPath();
            ctx.fillStyle = '#4a90d9';
            ctx.arc(0, -textHeight / 2 - rotateHandleDistance, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Rotation icon inside circle
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.arc(0, -textHeight / 2 - rotateHandleDistance, 4, -Math.PI * 0.7, Math.PI * 0.5);
            ctx.stroke();
            // Arrow head
            ctx.beginPath();
            ctx.moveTo(3, -textHeight / 2 - rotateHandleDistance + 3);
            ctx.lineTo(4, -textHeight / 2 - rotateHandleDistance - 1);
            ctx.lineTo(0, -textHeight / 2 - rotateHandleDistance + 1);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    // Draw outer border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
    
    // Mark render as complete
    unifiedCanvasState.isRendering = false;
    
    // If another render was requested during this one, schedule it
    if (unifiedCanvasState.needsRender) {
        unifiedCanvasState.needsRender = false;
        requestCanvasUpdate();
    }
}

async function drawCanvasBackground(ctx, offsetX, offsetY, polaroidWidth, polaroidHeight, imageWidth, imageHeight, borderTop, borderSide) {
    if (state.backgroundType === 'special' && state.specialBackground === 'rainbow') {
        // Rainbow gradient
        const gradient = ctx.createLinearGradient(offsetX, offsetY, offsetX + polaroidWidth, offsetY + polaroidHeight);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ff8000');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.67, '#0080ff');
        gradient.addColorStop(0.83, '#8000ff');
        gradient.addColorStop(1, '#ff0080');
        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
    } else if (state.backgroundType === 'special' && state.specialBackground === 'matte-texture') {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
        for (let i = 0; i < 200; i++) {
            const x = offsetX + Math.random() * polaroidWidth;
            const y = offsetY + Math.random() * polaroidHeight;
            ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.15})`;
            ctx.fillRect(x, y, 2, 2);
        }
    } else if (state.backgroundType === 'special' && state.specialBackground === 'vintage-photo') {
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
        const gradient = ctx.createRadialGradient(
            offsetX + polaroidWidth / 2, offsetY + polaroidHeight / 2, 0,
            offsetX + polaroidWidth / 2, offsetY + polaroidHeight / 2, polaroidWidth
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(139, 119, 101, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
    } else if (state.backgroundType === 'special' && state.specialBackground === 'recycled-paper') {
        // Use image from img folder
        try {
            const recycledImg = await loadCachedImage('img/reciclado.jpg');
            ctx.drawImage(recycledImg, offsetX, offsetY, polaroidWidth, polaroidHeight);
        } catch (e) {
            // Fallback to generated texture
            ctx.fillStyle = '#f4e4c9';
            ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
            for (let i = 0; i < 500; i++) {
                const x = offsetX + Math.random() * polaroidWidth;
                const y = offsetY + Math.random() * polaroidHeight;
                ctx.fillStyle = `rgba(139, 119, 101, ${Math.random() * 0.1})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
    } else if (state.backgroundType === 'special' && state.specialBackground === 'geometric') {
        // Use image from img folder
        try {
            const geometricImg = await loadCachedImage('img/geometrico.jpg');
            ctx.drawImage(geometricImg, offsetX, offsetY, polaroidWidth, polaroidHeight);
        } catch (e) {
            // Fallback to generated pattern
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            const size = 15;
            for (let x = 0; x < polaroidWidth; x += size) {
                for (let y = 0; y < polaroidHeight; y += size) {
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x, offsetY + y);
                    ctx.lineTo(offsetX + x + size, offsetY + y + size);
                    ctx.stroke();
                }
            }
        }
    } else if (state.backgroundType === 'special' && state.specialBackground === 'floral') {
        // Use image from img folder
        try {
            const floralImg = await loadCachedImage('img/floral.jpg');
            ctx.drawImage(floralImg, offsetX, offsetY, polaroidWidth, polaroidHeight);
        } catch (e) {
            // Fallback to generated pattern
            ctx.fillStyle = '#fff9f0';
            ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
            ctx.fillStyle = '#f0d0e0';
            for (let i = 0; i < 8; i++) {
                const x = offsetX + (i % 4) * (polaroidWidth / 3) + 10;
                const y = offsetY + Math.floor(i / 4) * (polaroidHeight / 2) + 10;
                drawSimpleFlower(ctx, x, y, 8);
            }
        }
    } else {
        // Solid color (base)
        ctx.fillStyle = state.backgroundColor || '#ffffff';
        ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
        
        // Apply additional effects on top of solid color
        if (state.effectGradient) {
            const baseColor = state.backgroundColor || '#ffffff';
            const rgb = hexToRgb(baseColor);
            if (rgb) {
                const lighterColor = `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`;
                const darkerColor = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`;
                const gradient = ctx.createLinearGradient(offsetX, offsetY, offsetX + polaroidWidth, offsetY + polaroidHeight);
                gradient.addColorStop(0, lighterColor);
                gradient.addColorStop(1, darkerColor);
                ctx.fillStyle = gradient;
                ctx.fillRect(offsetX, offsetY, polaroidWidth, polaroidHeight);
            }
        }
        
        if (state.effectStripes) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i < polaroidWidth + polaroidHeight; i += 10) {
                ctx.beginPath();
                ctx.moveTo(offsetX + i, offsetY);
                ctx.lineTo(offsetX, offsetY + i);
                ctx.stroke();
            }
        }
    }
}

function drawCanvasFrameEffects(ctx, offsetX, offsetY, polaroidWidth, polaroidHeight, borderSide, borderTop, imageWidth, imageHeight) {
    const frame = state.specialFrame;
    
    if (frame === 'double-border') {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX + 4, offsetY + 4, polaroidWidth - 8, polaroidHeight - 8);
        ctx.lineWidth = 1;
        ctx.strokeRect(offsetX + 8, offsetY + 8, polaroidWidth - 16, polaroidHeight - 16);
    }
    
    if (frame === 'dotted-frame') {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(offsetX + borderSide - 3, offsetY + borderTop - 3, imageWidth + 6, imageHeight + 6);
        ctx.setLineDash([]);
    }
    
    if (frame === 'hand-drawn') {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const x1 = offsetX + borderSide - 4;
        const y1 = offsetY + borderTop - 4;
        const x2 = offsetX + borderSide + imageWidth + 4;
        const y2 = offsetY + borderTop + imageHeight + 4;
        
        ctx.moveTo(x1, y1);
        for (let x = x1; x <= x2; x += 10) {
            ctx.lineTo(x, y1 + (Math.random() - 0.5) * 2);
        }
        for (let y = y1; y <= y2; y += 10) {
            ctx.lineTo(x2 + (Math.random() - 0.5) * 2, y);
        }
        for (let x = x2; x >= x1; x -= 10) {
            ctx.lineTo(x, y2 + (Math.random() - 0.5) * 2);
        }
        for (let y = y2; y >= y1; y -= 10) {
            ctx.lineTo(x1 + (Math.random() - 0.5) * 2, y);
        }
        ctx.stroke();
    }
}

// Color conversion utilities
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, x)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, m, y);
    return {
        c: ((c - k) / (1 - k)) * 100,
        m: ((m - k) / (1 - k)) * 100,
        y: ((y - k) / (1 - k)) * 100,
        k: k * 100
    };
}

function cmykToRgb(c, m, y, k) {
    c = c / 100;
    m = m / 100;
    y = y / 100;
    k = k / 100;
    return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k))
    };
}

async function generatePolaroids() {
    // Save current crop data
    saveCropData();
    
    // Fill in missing or invalid crop data with centered crops
    state.images.forEach((img, i) => {
        const crop = state.cropData[i];
        // Check if crop data is missing or has invalid dimensions (0, NaN, or Infinity)
        const isInvalidCrop = !crop || 
            !crop.cropWidth || !crop.cropHeight ||
            !isFinite(crop.cropWidth) || !isFinite(crop.cropHeight) ||
            crop.cropWidth <= 0 || crop.cropHeight <= 0;
        
        if (isInvalidCrop) {
            const type = polaroidTypes[state.selectedType];
            const aspectRatio = type.imageWidth / type.imageHeight;
            
            let cropWidth, cropHeight;
            if (img.width / img.height > aspectRatio) {
                cropHeight = img.height;
                cropWidth = cropHeight * aspectRatio;
            } else {
                cropWidth = img.width;
                cropHeight = cropWidth / aspectRatio;
            }
            
            state.cropData[i] = {
                cropX: (img.width - cropWidth) / 2,
                cropY: (img.height - cropHeight) / 2,
                cropWidth: cropWidth,
                cropHeight: cropHeight
            };
        }
    });
    
    loadingOverlay.classList.add('visible');
    
    try {
        if (state.exportType === 'individual') {
            await generateIndividualImages();
        } else {
            await generatePDF();
        }
        
        // Show result section
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.getElementById('resultSection').classList.add('active');
        
        // Update progress
        document.querySelectorAll('.progress-step').forEach(s => s.classList.add('completed'));
    } finally {
        loadingOverlay.classList.remove('visible');
    }
}

async function generateIndividualImages() {
    const type = polaroidTypes[state.selectedType];
    const DPI = 300;
    const cmToPixels = (cm) => Math.round(cm * DPI / 2.54);
    
    const totalWidth = cmToPixels(type.totalWidth);
    const totalHeight = cmToPixels(type.totalHeight);
    const imageWidth = cmToPixels(type.imageWidth);
    const imageHeight = cmToPixels(type.imageHeight);
    const borderTop = cmToPixels(type.borderTop);
    const borderSide = cmToPixels(type.borderSide);
    
    resultGallery.innerHTML = '';
    
    for (let i = 0; i < state.images.length; i++) {
        const img = state.images[i];
        const crop = state.cropData[i];
        
        const canvas = document.createElement('canvas');
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        await drawBackground(ctx, totalWidth, totalHeight, imageWidth, imageHeight, borderTop, borderSide);
        
        // Draw cropped image
        const sourceImg = await loadImage(img.src);
        ctx.drawImage(
            sourceImg,
            crop.cropX, crop.cropY, crop.cropWidth, crop.cropHeight,
            borderSide, borderTop, imageWidth, imageHeight
        );
        
        // Draw graphic elements (if not overlapping)
        if (!state.allowOverlap) {
            await drawGraphicElements(ctx, totalWidth, totalHeight, borderSide, borderTop, imageWidth, imageHeight);
        }
        
        // Draw special borders/frames on image
        drawSpecialImageEffects(ctx, borderSide, borderTop, imageWidth, imageHeight, totalWidth, totalHeight);
        
        // Draw graphic elements (if overlapping)
        if (state.allowOverlap && state.graphicElements.length > 0) {
            await drawGraphicElements(ctx, totalWidth, totalHeight, borderSide, borderTop, imageWidth, imageHeight, true);
        }
        
        // Draw custom text elements
        if (state.textElements.length > 0) {
            drawCustomText(ctx, totalWidth, totalHeight, borderTop, imageHeight);
        }
        
        // Add to gallery
        const dataUrl = canvas.toDataURL('image/png');
        const polaroidDiv = document.createElement('div');
        polaroidDiv.className = 'result-polaroid';
        polaroidDiv.innerHTML = `
            <img src="${dataUrl}" alt="Polaroid ${i + 1}">
            <a href="${dataUrl}" download="polaroid_${i + 1}.png" class="download-single">Baixar</a>
        `;
        resultGallery.appendChild(polaroidDiv);
    }
    
    // Add centered class for individual images
    resultGallery.classList.add('result-gallery-images');
    resultGallery.classList.remove('result-gallery-pdf');
}

async function drawBackground(ctx, totalWidth, totalHeight, imageWidth, imageHeight, borderTop, borderSide) {
    if (state.backgroundType === 'solid') {
        // Draw base solid color
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);
        
        // Apply additional effects on top of solid color
        if (state.effectGradient) {
            const baseColor = state.backgroundColor || '#ffffff';
            const rgb = hexToRgb(baseColor);
            if (rgb) {
                const lighterColor = `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`;
                const darkerColor = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`;
                const gradient = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
                gradient.addColorStop(0, lighterColor);
                gradient.addColorStop(1, darkerColor);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, totalWidth, totalHeight);
            }
        }
        
        if (state.effectStripes) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 2;
            for (let i = 0; i < totalWidth + totalHeight; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(0, i);
                ctx.stroke();
            }
        }
    } else if (state.backgroundType === 'special') {
        await drawSpecialBackground(ctx, totalWidth, totalHeight, imageWidth, imageHeight, borderTop, borderSide);
    }
}

async function drawSpecialBackground(ctx, totalWidth, totalHeight, imageWidth, imageHeight, borderTop, borderSide) {
    const bg = state.specialBackground;
    
    switch (bg) {
        case 'rainbow':
            const rainbowGradient = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
            rainbowGradient.addColorStop(0, '#ff0000');
            rainbowGradient.addColorStop(0.17, '#ff8000');
            rainbowGradient.addColorStop(0.33, '#ffff00');
            rainbowGradient.addColorStop(0.5, '#00ff00');
            rainbowGradient.addColorStop(0.67, '#0080ff');
            rainbowGradient.addColorStop(0.83, '#8000ff');
            rainbowGradient.addColorStop(1, '#ff0080');
            ctx.fillStyle = rainbowGradient;
            ctx.fillRect(0, 0, totalWidth, totalHeight);
            break;
            
        case 'recycled-paper':
            // Use image from img folder
            try {
                const recycledImg = await loadImage('img/reciclado.jpg');
                ctx.drawImage(recycledImg, 0, 0, totalWidth, totalHeight);
            } catch (e) {
                // Fallback to generated texture
                ctx.fillStyle = '#f4e4c9';
                ctx.fillRect(0, 0, totalWidth, totalHeight);
                for (let i = 0; i < 5000; i++) {
                    const x = Math.random() * totalWidth;
                    const y = Math.random() * totalHeight;
                    ctx.fillStyle = `rgba(139, 119, 101, ${Math.random() * 0.1})`;
                    ctx.fillRect(x, y, 2, 2);
                }
            }
            break;
            
        case 'matte-texture':
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, totalWidth, totalHeight);
            for (let i = 0; i < 3000; i++) {
                const x = Math.random() * totalWidth;
                const y = Math.random() * totalHeight;
                ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.15})`;
                ctx.fillRect(x, y, 3, 3);
            }
            break;
            
        case 'vintage-photo':
            ctx.fillStyle = '#f5f0e6';
            ctx.fillRect(0, 0, totalWidth, totalHeight);
            // Sepia tone edges
            const vintageGradient = ctx.createRadialGradient(
                totalWidth / 2, totalHeight / 2, 0,
                totalWidth / 2, totalHeight / 2, totalWidth
            );
            vintageGradient.addColorStop(0, 'rgba(0,0,0,0)');
            vintageGradient.addColorStop(1, 'rgba(139, 119, 101, 0.3)');
            ctx.fillStyle = vintageGradient;
            ctx.fillRect(0, 0, totalWidth, totalHeight);
            break;
            
        case 'geometric':
            // Use image from img folder
            try {
                const geometricImg = await loadImage('img/geometrico.jpg');
                ctx.drawImage(geometricImg, 0, 0, totalWidth, totalHeight);
            } catch (e) {
                // Fallback to generated pattern
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, totalWidth, totalHeight);
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 1;
                const size = 30;
                for (let x = 0; x < totalWidth; x += size) {
                    for (let y = 0; y < totalHeight; y += size) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + size, y + size);
                        ctx.stroke();
                    }
                }
            }
            break;
            
        case 'floral':
            // Use image from img folder
            try {
                const floralImg = await loadImage('img/floral.jpg');
                ctx.drawImage(floralImg, 0, 0, totalWidth, totalHeight);
            } catch (e) {
                // Fallback to generated pattern
                ctx.fillStyle = '#fff9f0';
                ctx.fillRect(0, 0, totalWidth, totalHeight);
                ctx.fillStyle = '#f0d0e0';
                for (let i = 0; i < 8; i++) {
                    const x = (i % 4) * (totalWidth / 3) + 20;
                    const y = Math.floor(i / 4) * (totalHeight / 2) + 20;
                    drawSimpleFlower(ctx, x, y, 15);
                }
            }
            break;
            
        default:
            ctx.fillStyle = state.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, totalWidth, totalHeight);
    }
}

function drawSimpleFlower(ctx, x, y, size) {
    ctx.fillStyle = '#f0b0c0';
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        ctx.beginPath();
        ctx.arc(px, py, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x, y, size / 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawSpecialImageEffects(ctx, borderSide, borderTop, imageWidth, imageHeight, totalWidth, totalHeight) {
    // Handle frames (now separate from backgrounds)
    const frame = state.specialFrame;
    
    if (frame === 'double-border') {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, totalWidth - 30, totalHeight - 30);
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 30, totalWidth - 60, totalHeight - 60);
    }
    
    if (frame === 'dotted-frame') {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 3;
        ctx.strokeRect(borderSide - 5, borderTop - 5, imageWidth + 10, imageHeight + 10);
        ctx.setLineDash([]);
    }
    
    if (frame === 'hand-drawn') {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 4;
        // Draw slightly wavy lines around image
        ctx.beginPath();
        const offset = 8;
        const x1 = borderSide - offset;
        const y1 = borderTop - offset;
        const x2 = borderSide + imageWidth + offset;
        const y2 = borderTop + imageHeight + offset;
        
        // Top line with slight waves
        ctx.moveTo(x1, y1);
        for (let x = x1; x <= x2; x += 20) {
            ctx.lineTo(x, y1 + (Math.random() - 0.5) * 4);
        }
        // Right line
        for (let y = y1; y <= y2; y += 20) {
            ctx.lineTo(x2 + (Math.random() - 0.5) * 4, y);
        }
        // Bottom line
        for (let x = x2; x >= x1; x -= 20) {
            ctx.lineTo(x, y2 + (Math.random() - 0.5) * 4);
        }
        // Left line
        for (let y = y2; y >= y1; y -= 20) {
            ctx.lineTo(x1 + (Math.random() - 0.5) * 4, y);
        }
        ctx.stroke();
    }
}

async function drawGraphicElements(ctx, totalWidth, totalHeight, borderSide, borderTop, imageWidth, imageHeight, allowOverlap = false) {
    for (const element of state.graphicElements) {
        const img = await loadImage(element.src);
        const maxSize = Math.min(totalWidth, totalHeight) * 0.5;
        const aspectRatio = element.originalWidth / element.originalHeight;
        
        let scaledWidth, scaledHeight;
        if (aspectRatio > 1) {
            scaledWidth = maxSize * element.scale;
            scaledHeight = scaledWidth / aspectRatio;
        } else {
            scaledHeight = maxSize * element.scale;
            scaledWidth = scaledHeight * aspectRatio;
        }
        
        // Use the position from element (normalized coordinates)
        const x = element.x * totalWidth;
        const y = element.y * totalHeight;
        const angle = (element.angle || 0) * Math.PI / 180;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
    }
}

function drawCustomText(ctx, totalWidth, totalHeight, borderTop, imageHeight) {
    // Draw all text elements
    for (const textElement of state.textElements) {
        const scale = textElement.scale || 1;
        const fontSize = textElement.size * 3 * scale; // Scale up for high DPI
        const angle = (textElement.angle || 0) * Math.PI / 180;
        
        // Use the position from element (normalized coordinates)
        const textX = textElement.x * totalWidth;
        const textY = textElement.y * totalHeight;
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(angle);
        ctx.font = `${fontSize}px ${textElement.font}`;
        ctx.fillStyle = textElement.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textElement.text, 0, 0);
        ctx.restore();
    }
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const type = polaroidTypes[state.selectedType];
    
    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    
    // Polaroid dimensions in mm (convert from cm)
    const polaroidWidth = type.totalWidth * 10;
    const polaroidHeight = type.totalHeight * 10;
    
    // Spacing in mm (convert from cm)
    const spacingMm = state.spacing * 10;
    
    // Calculate grid with spacing
    const availableWidth = pageWidth - 2 * margin;
    const availableHeight = pageHeight - 2 * margin;
    
    const cols = Math.floor((availableWidth + spacingMm) / (polaroidWidth + spacingMm));
    const rows = Math.floor((availableHeight + spacingMm) / (polaroidHeight + spacingMm));
    const polaroidsPerPage = cols * rows;
    
    // Center the grid
    const gridWidth = cols * polaroidWidth + (cols - 1) * spacingMm;
    const gridHeight = rows * polaroidHeight + (rows - 1) * spacingMm;
    const startX = (pageWidth - gridWidth) / 2;
    const startY = (pageHeight - gridHeight) / 2;
    
    // Create PDF
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Generate polaroid images first
    const polaroidImages = await Promise.all(state.images.map(async (img, i) => {
        const crop = state.cropData[i];
        const DPI = 300;
        const cmToPixels = (cm) => Math.round(cm * DPI / 2.54);
        
        const totalWidth = cmToPixels(type.totalWidth);
        const totalHeight = cmToPixels(type.totalHeight);
        const imageWidth = cmToPixels(type.imageWidth);
        const imageHeight = cmToPixels(type.imageHeight);
        const borderTop = cmToPixels(type.borderTop);
        const borderSide = cmToPixels(type.borderSide);
        
        const canvas = document.createElement('canvas');
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        await drawBackground(ctx, totalWidth, totalHeight, imageWidth, imageHeight, borderTop, borderSide);
        
        // Draw photo
        const sourceImg = await loadImage(img.src);
        ctx.drawImage(
            sourceImg,
            crop.cropX, crop.cropY, crop.cropWidth, crop.cropHeight,
            borderSide, borderTop, imageWidth, imageHeight
        );
        
        // Draw graphic elements (if not overlapping)
        if (!state.allowOverlap) {
            await drawGraphicElements(ctx, totalWidth, totalHeight, borderSide, borderTop, imageWidth, imageHeight);
        }
        
        // Draw special borders/frames on image
        drawSpecialImageEffects(ctx, borderSide, borderTop, imageWidth, imageHeight, totalWidth, totalHeight);
        
        // Draw graphic elements (if overlapping)
        if (state.allowOverlap && state.graphicElements.length > 0) {
            await drawGraphicElements(ctx, totalWidth, totalHeight, borderSide, borderTop, imageWidth, imageHeight, true);
        }
        
        // Draw custom text elements
        if (state.textElements.length > 0) {
            drawCustomText(ctx, totalWidth, totalHeight, borderTop, imageHeight);
        }
        
        return canvas.toDataURL('image/jpeg', 0.95);
    }));
    
    // Place polaroids on pages
    let currentIndex = 0;
    let pageNum = 0;
    
    while (currentIndex < polaroidImages.length) {
        if (pageNum > 0) {
            pdf.addPage();
        }
        
        for (let row = 0; row < rows && currentIndex < polaroidImages.length; row++) {
            for (let col = 0; col < cols && currentIndex < polaroidImages.length; col++) {
                const x = startX + col * (polaroidWidth + spacingMm);
                const y = startY + row * (polaroidHeight + spacingMm);
                
                // Add polaroid image
                pdf.addImage(polaroidImages[currentIndex], 'JPEG', x, y, polaroidWidth, polaroidHeight);
                
                // Add cut marks
                if (state.cutMarkType !== 'none') {
                    addCutMarks(pdf, x, y, polaroidWidth, polaroidHeight, state.cutMarkType);
                }
                
                currentIndex++;
            }
        }
        
        pageNum++;
    }
    
    // Show preview and download
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    resultGallery.innerHTML = `
        <div class="pdf-result-container">
            <p style="margin-bottom: 20px;">PDF gerado com ${state.images.length} polaroid(s) em ${pageNum} página(s)</p>
            <iframe src="${pdfUrl}" class="pdf-preview-frame"></iframe>
        </div>
    `;
    
    // Add PDF class for proper layout
    resultGallery.classList.add('result-gallery-pdf');
    resultGallery.classList.remove('result-gallery-images');
    
    // Update download button
    document.getElementById('downloadAllBtn').onclick = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'polaroids.pdf';
        link.click();
    };
}

function addCutMarks(pdf, x, y, width, height, type) {
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);
    
    if (type === 'dashed') {
        pdf.setLineDashPattern([2, 2], 0);
    } else {
        pdf.setLineDashPattern([], 0);
    }
    
    // Draw rectangle around polaroid
    pdf.rect(x, y, width, height);
    
    // Reset dash pattern
    pdf.setLineDashPattern([], 0);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function downloadAll() {
    if (state.exportType === 'individual') {
        // Download all individual images
        const links = document.querySelectorAll('.download-single');
        links.forEach((link, i) => {
            setTimeout(() => link.click(), i * 200);
        });
    }
    // PDF download is handled in generatePDF
}

function startOver() {
    state = {
        currentStep: 1,
        selectedType: null,
        images: [],
        currentImageIndex: 0,
        cropData: [],
        exportType: null,
        cutMarkType: 'none',
        spacing: 0,
        backgroundColor: '#ffffff',
        backgroundType: 'solid',
        specialBackground: null,
        specialFrame: null,
        effectGradient: false,
        effectStripes: false,
        textElements: [],
        selectedTextIndex: -1,
        graphicElements: [],
        selectedGraphicIndex: -1,
        allowOverlap: false
    };
    
    // Reset UI
    document.querySelectorAll('.polaroid-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.export-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.frame-option').forEach(o => o.classList.remove('selected'));
    document.querySelector('.color-option[data-color="#ffffff"]')?.classList.add('selected');
    uploadedImages.innerHTML = '';
    resultGallery.innerHTML = '';
    resultGallery.classList.remove('result-gallery-pdf', 'result-gallery-images');
    pdfOptions.classList.remove('visible');
    generateBtn.disabled = true;
    continueToStep3.disabled = true;
    
    // Reset inputs
    document.getElementById('spacingInput').value = 0;
    document.getElementById('textContent').value = '';
    document.getElementById('customColorPicker').value = '#ffffff';
    document.getElementById('hexInput').value = '';
    document.getElementById('rgbR').value = '';
    document.getElementById('rgbG').value = '';
    document.getElementById('rgbB').value = '';
    document.getElementById('cmykC').value = '';
    document.getElementById('cmykM').value = '';
    document.getElementById('cmykY').value = '';
    document.getElementById('cmykK').value = '';
    document.getElementById('uploadedGraphics').innerHTML = '';
    document.getElementById('textElementsList').innerHTML = '';
    
    // Reset new controls
    const textSizeInput = document.getElementById('textSize');
    const textSizeValue = document.getElementById('textSizeValue');
    if (textSizeInput) textSizeInput.value = 20;
    if (textSizeValue) textSizeValue.textContent = '20px';
    
    const overlapCheckbox = document.getElementById('overlapCheckbox');
    if (overlapCheckbox) overlapCheckbox.checked = false;
    
    // Reset additional effects checkboxes
    const effectGradientCheckbox = document.getElementById('effectGradient');
    const effectStripesCheckbox = document.getElementById('effectStripes');
    if (effectGradientCheckbox) effectGradientCheckbox.checked = false;
    if (effectStripesCheckbox) effectStripesCheckbox.checked = false;
    
    // Reset preview canvas
    updateUnifiedCanvas();
    
    goToStep(1);
}