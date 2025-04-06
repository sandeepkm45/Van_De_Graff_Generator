document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const powerButton = document.getElementById('power-button');
    const dissectButton = document.getElementById('dissect-button');
    const distanceSlider = document.getElementById('distance-slider');
    const distanceValue = document.getElementById('distance-value');
    const voltageSlider = document.getElementById('voltage-slider');
    const voltageLevel = document.getElementById('voltage-level');
    const controlScreen = document.getElementById('control-screen');
    const controlKnob = document.getElementById('control-knob');
    const largeSphere = document.getElementById('large-sphere');
    const smallSphere = document.getElementById('small-sphere');
    const spark = document.getElementById('spark');
    const sparkPath = document.getElementById('spark-path');
    const beltWindow = document.getElementById('belt-window');
    const movingBelt = document.getElementById('moving-belt');
    const resultsArea = document.getElementById('results-area');
    const resultText = document.getElementById('result-text');
    const fieldLines = document.querySelectorAll('.field-line');
    const hairStrands = document.querySelectorAll('.hair-strand');
    const variablesHeader = document.getElementById('variables-header');
    const variablesContent = document.getElementById('variables-content');
    const resultsHeader = document.getElementById('results-header');
    const chargeFill = document.getElementById('charge-fill');
    
    // Variables
    let isPoweredOn = false;
    let isDissected = false;
    let distanceValue_ = 1;
    let voltageValue = 1;
    let chargeLevel = 0;
    let sparkTimer = null;
    let chargeTimer = null;
    let sparkSound = null;
    
    // Create audio for spark sound
    function createSparkSound() {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgUFBQUFBQ8PDw8PDxVVVVVVVVvb29vb2+Jqampqam8vLy8vLzW1tbW1tbnDw8PDw8mJiYmJiY/X19fX19fdHR0dHR0j4+Pj4+Pj4+PrK+vr6+vxuPj4+Pj9PT09PT0//8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPAAAGkAAAAITMTM2AAAAKsBGjXd0k//qhppyH//q2kUTLLLJ9tdOl6TOi7RZf//+j/i7xR//+QgXb//pfol//v////nXAFT///oLX/wf/4P/5wP/BP/98Cf///8FAAAAAazso5rVbNdEJtRMDtG6CWgRQAfH2i8';
        return audio;
    }
    
    // Initialize sliders
    distanceSlider.style.left = '10%';
    voltageSlider.style.left = '0%';
    
    // Initialize spark sound
    sparkSound = createSparkSound();
    
    // Event listeners
    powerButton.addEventListener('click', togglePower);
    dissectButton.addEventListener('click', toggleDissect);
    controlKnob.addEventListener('click', togglePower);
    
    // Panel toggle listeners
    variablesHeader.addEventListener('click', () => {
        togglePanel(variablesContent);
        toggleArrow(variablesHeader.querySelector('.panel-arrow'));
    });
    
    resultsHeader.addEventListener('click', () => {
        togglePanel(resultsArea);
        toggleArrow(resultsHeader.querySelector('.panel-arrow'));
    });
    
    function togglePanel(panel) {
        panel.classList.toggle('closed');
    }
    
    function toggleArrow(arrow) {
        arrow.classList.toggle('open');
    }
    
    // Distance slider functionality
    let isDragging = false;
    let currentSlider = null;
    
    distanceSlider.addEventListener('mousedown', function(e) {
        isDragging = true;
        currentSlider = 'distance';
        updateSliderPosition(e);
    });
    
    voltageSlider.addEventListener('mousedown', function(e) {
        isDragging = true;
        currentSlider = 'voltage';
        updateSliderPosition(e);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            updateSliderPosition(e);
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        currentSlider = null;
    });
    
    function updateSliderPosition(e) {
        let slider, valueDisplay, sliderThumb;
        
        if (currentSlider === 'distance') {
            slider = distanceSlider.parentElement;
            valueDisplay = distanceValue;
            sliderThumb = distanceSlider;
        } else if (currentSlider === 'voltage') {
            slider = voltageSlider.parentElement;
            valueDisplay = voltageLevel;
            sliderThumb = voltageSlider;
        } else {
            return;
        }
        
        const rect = slider.getBoundingClientRect();
        let position = (e.clientX - rect.left) / rect.width;
        
        // Constrain position between 0 and 1
        position = Math.max(0, Math.min(1, position));
        
        // Update slider position
        sliderThumb.style.left = (position * 100) + '%';
        
        if (currentSlider === 'distance') {
            // Update value (scale from 0.5 to 5)
            distanceValue_ = (position * 4.5 + 0.5).toFixed(1);
            valueDisplay.textContent = distanceValue_;
            
            // Update visual distance between spheres
            updateDistance();
        } else if (currentSlider === 'voltage') {
            // Update voltage value (scale from 1 to 10)
            voltageValue = Math.max(1, Math.round(position * 9 + 1));
            valueDisplay.textContent = voltageValue;
            
            if (isPoweredOn) {
                updateChargeVisualization();
            }
        }
    }
    
    function updateDistance() {
        // Adjust the position of the small sphere based on slider value
        // Lower values bring it closer to the large sphere
        const basePosition = 20;
        const newPosition = basePosition + (5 - distanceValue_) * 5;
        smallSphere.style.left = newPosition + '%';
        
        // Also move the stand and base
        const smallStand = document.querySelector('.small-stand');
        const smallBase = document.querySelector('.small-base');
        smallStand.style.left = `calc(${newPosition}% + 35px)`;
        smallBase.style.left = `calc(${newPosition}% - 15px)`;
        
        // If powered on, maybe create spark
        if (isPoweredOn) {
            checkSpark();
        }
    }
    
    function togglePower() {
        isPoweredOn = !isPoweredOn;
        
        if (isPoweredOn) {
            powerButton.textContent = 'TURN OFF';
            powerButton.classList.add('on');
            controlScreen.classList.add('on');
            controlKnob.classList.add('on');
            
            // Start charge visualization
            startCharging();
            
            // Start belt animation if dissected
            if (isDissected) {
                movingBelt.style.display = 'block';
            }
        } else {
            powerButton.textContent = 'TURN ON';
            powerButton.classList.remove('on');
            controlScreen.classList.remove('on');
            controlKnob.classList.remove('on');
            
            // Stop charging
            if (chargeTimer) {
                clearTimeout(chargeTimer);
                chargeTimer = null;
            }
            
            // Reset spark
            if (sparkTimer) {
                clearTimeout(sparkTimer);
                sparkTimer = null;
            }
            spark.style.opacity = '0';
            
            // Reset electric field lines
            fieldLines.forEach(line => {
                line.classList.remove('on');
            });
            
            // Reset hair strands
            hairStrands.forEach(strand => {
                strand.style.transform = 'rotate(0deg)';
            });
            
            // Reset sphere appearance
            largeSphere.classList.remove('charged');
            smallSphere.classList.remove('affected');
            
            // Stop belt animation
            movingBelt.style.display = 'none';
            
            // Reset charge level
            chargeLevel = 0;
            chargeFill.style.width = '0%';
            updateResults();
        }
    }
    
    function toggleDissect() {
        isDissected = !isDissected;
        
        if (isDissected) {
            dissectButton.textContent = 'RESTORE';
            dissectButton.classList.add('on');
            beltWindow.style.display = 'block';
            
            if (isPoweredOn) {
                movingBelt.style.display = 'block';
            }
        } else {
            dissectButton.textContent = 'DISSECT';
            dissectButton.classList.remove('on');
            beltWindow.style.display = 'none';
            movingBelt.style.display = 'none';
        }
        
        updateResults();
    }
    
    function startCharging() {
        if (!isPoweredOn) return;
        
        // Increase charge level over time based on voltage setting
        chargeTimer = setTimeout(() => {
            if (isPoweredOn) {
                chargeLevel += 0.2 * voltageValue;
                if (chargeLevel > 10) chargeLevel = 10;
                
                updateChargeVisualization();
                updateResults();
                checkSpark();
                startCharging();
            }
        }, 300);
    }
    
    function updateChargeVisualization() {
        // Update visual effects based on charge level
        chargeFill.style.width = (chargeLevel * 10) + '%'; // Scale to 100%
        
        if (chargeLevel > 2) {
            largeSphere.classList.add('charged');
            
            // Make field lines visible based on charge level
            if (chargeLevel > 3) fieldLines[0].classList.add('on');
            if (chargeLevel > 5) fieldLines[1].classList.add('on');
            if (chargeLevel > 7) fieldLines[2].classList.add('on');
            
            // Make hair strands stand up based on charge level
            const hairAngle = Math.min(80, chargeLevel * 8);
            hairStrands.forEach((strand, index) => {
                // Stagger the hair movement for more realism
                const staggeredAngle = hairAngle * (0.7 + (index * 0.1));
                const direction = index % 2 === 0 ? -1 : 1;
                strand.style.transform = `rotate(${staggeredAngle * direction}deg)`;
            });
        } else {
            largeSphere.classList.remove('charged');
            fieldLines.forEach(line => line.classList.remove('on'));
            hairStrands.forEach(strand => strand.style.transform = 'rotate(0deg)');
        }
    }
    
    function checkSpark() {
        if (chargeLevel >= 10) {
            // Create a spark effect
            spark.style.opacity = '1';
            sparkPath.setAttribute('d', `M${smallSphere.offsetLeft + 40},${smallSphere.offsetTop + 40} L${largeSphere.offsetLeft + 75},${largeSphere.offsetTop + 75}`);
            sparkSound.currentTime = 0; // Reset sound
            sparkSound.play();
            
            // Hide spark after a short duration
            sparkTimer = setTimeout(() => {
                spark.style.opacity = '0';
            }, 200);
        }
    }
    
    function updateResults() {
        if (isPoweredOn) {
            resultText.textContent = `Current Charge Level: ${chargeLevel.toFixed(1)} (Voltage: ${voltageValue}, Distance: ${distanceValue_})`;
        } else {
            resultText.textContent = 'Turn on the Van De Graaff generator to see results.';
        }
    }
});
