

if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js');
          });
        }
        // --- State Management (Simple) ---
        let currentScreen = 'splash-screen';
        let previousScreen = null;
        const splashScreenDuration = 2500;
        let isNavOpen = false;
        let isAutoCleaningPaused = false;
        let isAnimatingString = false;

        // --- DEMO SYSTEM VARIABLES ---
        let demoController = null;
        let isDemoActive = false;
        let userInteracted = false;

        // Simple storage for settings (resets on reload)
        let appSettings = {
            darkMode: false,
            notifications: {
                complete: true,
                low_water: true,
                error: true,
                promo: false
            },
            wifiNetwork: "HomeNetwork_5G",
            autoSchedule: {
                frequency: 3,
                time: "05:00"
            }
        };

        // --- DOM Elements ---
        let sideNav, navOverlay, appBody, darkModeToggle;

        // --- Navigation ---
        function showScreen(screenId, isInstant = false) {
            const currentScreenElement = document.getElementById(currentScreen);
            if (currentScreenElement) currentScreenElement.classList.remove('active');

            const nextScreenElement = document.getElementById(screenId);
            if (nextScreenElement) {
                if (currentScreen !== screenId) previousScreen = currentScreen;
                nextScreenElement.classList.add('active');
                currentScreen = screenId;
                if (!isInstant) closeNav();
                updateNavActiveState(screenId);
                nextScreenElement.scrollTop = 0;
            }
        }

        function goBack() {
            if (previousScreen && previousScreen !== currentScreen) {
                showScreen(previousScreen);
            } else {
                showScreen('dashboard-screen');
            }
        }

        function toggleNav() {
            isNavOpen = !isNavOpen;
            sideNav.classList.toggle('open', isNavOpen);
            navOverlay.classList.toggle('active', isNavOpen);
        }

        function closeNav() {
            if (isNavOpen) {
                isNavOpen = false;
                sideNav.classList.remove('open');
                navOverlay.classList.remove('active');
            }
        }

        function navigateTo(screenId) {
            showScreen(screenId);
        }

         function updateNavActiveState(screenId) {
            if (!sideNav) return;
             sideNav.querySelectorAll('a, button').forEach(link => link.classList.remove('active-nav'));
             let activeLink;
             if (screenId === 'dashboard-screen') activeLink = document.getElementById('nav-home');
             else if (screenId === 'operate-screen') activeLink = document.getElementById('nav-operate');
             else if (screenId === 'settings-screen') activeLink = document.getElementById('nav-settings');
             if (activeLink) activeLink.classList.add('active-nav');
         }

        // --- Modals ---
        function showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('active');
        }

        function closeModalOnClickOutside(event, modalId) {
            if (event.target === event.currentTarget) {
                 closeModal(modalId);
             }
        }

        // --- Tab Management ---
        function setActiveTab(buttonElement, tabContainerId) {
            const tabContainer = document.getElementById(tabContainerId);
            if (tabContainer) {
                tabContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                buttonElement.classList.add('active');
            }
         }

        // --- Dashboard ---
        function generateSimulatedData(period) {
             let kwh, efficiency, suntime, avgEnergy;
            switch (period) {
                case 'weekly':
                    kwh = (Math.random()*15+25).toFixed(1);
                    efficiency = (Math.random()*5+75).toFixed(1);
                    suntime = `${Math.floor(Math.random()*10+40)}h ${Math.floor(Math.random()*60)}m`;
                    avgEnergy = (kwh / 7).toFixed(1);
                    break;
                case 'monthly':
                    kwh = (Math.random()*50+100).toFixed(1);
                    efficiency = (Math.random()*8+72).toFixed(1);
                    suntime = `${Math.floor(Math.random()*50+150)}h ${Math.floor(Math.random()*60)}m`;
                    avgEnergy = (kwh / 30).toFixed(1);
                    break;
                default:
                    kwh = (Math.random()*3+3).toFixed(2);
                    efficiency = (Math.random()*10+78).toFixed(1);
                    suntime = `${Math.floor(Math.random()*3+5)}h ${Math.floor(Math.random()*60)}m`;
                    avgEnergy = kwh;
            }
            return { kwh, efficiency, suntime, avgEnergy };
        }

        function updateDashboardContent(period, buttonElement) {
            setActiveTab(buttonElement, 'dashboard-tabs');
            const data = generateSimulatedData(period);
            
            const elements = {
                kwhValue: document.getElementById('kwh-value'),
                efficiencyValue: document.getElementById('efficiency-value'),
                suntimeValue: document.getElementById('suntime-value'),
                avgEnergyValue: document.getElementById('avg-energy-value'),
                progressCircle: document.getElementById('progress-circle'),
                avgEnergyLabel: document.getElementById('avg-energy-label'),
                comparisonText: document.getElementById('comparison-text')
            };

            if (elements.kwhValue) elements.kwhValue.textContent = data.kwh;
            if (elements.efficiencyValue) elements.efficiencyValue.innerHTML = `${data.efficiency}<span class="percent-sign">%</span> <span style="font-size: 0.5em; margin-top: 2px;">Efficiency</span>`;
            if (elements.suntimeValue) elements.suntimeValue.textContent = data.suntime;
            if (elements.avgEnergyValue) elements.avgEnergyValue.textContent = data.avgEnergy;
            if (elements.progressCircle) elements.progressCircle.style.setProperty('--progress-value', `${data.efficiency}%`);

            let avgLabel = 'Avg daily energy';
            let comparison = '☀️ Slightly better than yesterday';
            if (period === 'weekly') {
                avgLabel = 'Avg daily energy (last week)';
                comparison = '📈 Up 5% from previous week';
            } else if (period === 'monthly') {
                avgLabel = 'Avg daily energy (last month)';
                comparison = '📉 Down 2% from previous month';
            }

            if (elements.avgEnergyLabel) elements.avgEnergyLabel.textContent = avgLabel;
            if (elements.comparisonText) elements.comparisonText.textContent = comparison;
        }

        // --- Operate Screen ---
        function updateOperateContent(mode, buttonElement) {
             setActiveTab(buttonElement, 'operate-tabs');
             document.querySelectorAll('#operate-content-area .operate-content').forEach(c => c.classList.add('hidden'));
             const activeContent = document.getElementById(`${mode}-content`);
             if (activeContent) activeContent.classList.remove('hidden');
        }

        function triggerStringAnimation(type) {
            if (isAnimatingString) return;
            
            const stringContainer = document.querySelector('.string-container');
            const tightenBtn = document.getElementById('tighten-btn');
            const loosenBtn = document.getElementById('loosen-btn');
            
            if (!stringContainer || !tightenBtn || !loosenBtn) return;
            
            const originalTightenText = tightenBtn.textContent || 'Tighten';
            const originalLoosenText = loosenBtn.textContent || 'Loosen';
            
            isAnimatingString = true;
            tightenBtn.disabled = true;
            loosenBtn.disabled = true;
            
            stringContainer.classList.remove('tightening', 'loosening');
            
            setTimeout(() => {
                if (type === 'tightening') {
                    stringContainer.classList.add('tightening');
                    if (tightenBtn) tightenBtn.textContent = 'Working...';
                } else {
                    stringContainer.classList.add('loosening');
                    if (loosenBtn) loosenBtn.textContent = 'Working...';
                }
            }, 10);
            
            setTimeout(() => {
                stringContainer.classList.remove('tightening', 'loosening');
                if (tightenBtn) {
                    tightenBtn.disabled = false;
                    tightenBtn.textContent = originalTightenText;
                }
                if (loosenBtn) {
                    loosenBtn.disabled = false;
                    loosenBtn.textContent = originalLoosenText;
                }
                isAnimatingString = false;
            }, 1100);
        }

        function handleManualControl(action) {
            console.log("Manual Control:", action);
        }

        // --- Auto Mode ---
        function updateAutoStatusUI() {
            const elements = {
                statusIndicator: document.getElementById('auto-status-indicator'),
                statusText: document.getElementById('auto-status-text'),
                pauseResumeBtn: document.getElementById('pause-resume-btn'),
                statusCard: document.getElementById('auto-status-card'),
                cleanNowBtn: document.getElementById('clean-now-btn'),
                nextCleanTime: document.getElementById('next-clean-time'),
                cleanFrequency: document.getElementById('clean-frequency')
            };

            // Only proceed if we have the required elements
            if (!elements.statusIndicator || !elements.pauseResumeBtn || !elements.statusCard) return;

            if (isAutoCleaningPaused) {
                elements.statusIndicator.className = 'status-indicator paused';
                elements.statusIndicator.textContent = 'Paused';
                if (elements.statusText) elements.statusText.textContent = 'Automatic cleaning is paused';
                elements.pauseResumeBtn.textContent = 'Resume Automatic Cleaning';
                elements.pauseResumeBtn.classList.remove('btn-danger');
                elements.pauseResumeBtn.classList.add('btn-secondary');
                elements.statusCard.classList.add('paused');
                if (elements.cleanNowBtn) elements.cleanNowBtn.disabled = true;
            } else {
                elements.statusIndicator.className = 'status-indicator scheduled';
                elements.statusIndicator.textContent = 'Scheduled';
                if (elements.statusText) elements.statusText.textContent = 'Waiting for next schedule';
                elements.pauseResumeBtn.textContent = 'Pause Automatic Cleaning';
                elements.pauseResumeBtn.classList.remove('btn-secondary');
                elements.pauseResumeBtn.classList.add('btn-danger');
                elements.statusCard.classList.remove('paused');
                if (elements.cleanNowBtn) elements.cleanNowBtn.disabled = false;
            }

            if (elements.nextCleanTime) elements.nextCleanTime.textContent = `Tomorrow, ${appSettings.autoSchedule.time}`;
            if (elements.cleanFrequency) elements.cleanFrequency.textContent = `Every ${appSettings.autoSchedule.frequency} Days`;
        }

        function toggleAutoPause(button) {
            isAutoCleaningPaused = !isAutoCleaningPaused;
            updateAutoStatusUI();
        }

        function simulateCleanNow(button) {
            if (isAutoCleaningPaused || !button) return;
            
             button.classList.add('btn-loading');
             button.disabled = true;
            
            const statusIndicator = document.getElementById('auto-status-indicator');
            const statusText = document.getElementById('auto-status-text');
            
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator running';
                statusIndicator.textContent = 'Running';
            }
            if (statusText) {
                statusText.textContent = 'Cleaning in progress...';
            }

             setTimeout(() => {
                 button.classList.remove('btn-loading');
                 button.disabled = false;
                updateAutoStatusUI();
                const lastRunTime = document.getElementById('last-run-time');
                if (lastRunTime) lastRunTime.textContent = 'Just now (Completed)';
            }, 4000);
        }

        function saveSchedule(button) {
            const freq = document.getElementById('schedule-frequency')?.value;
            const time = document.getElementById('schedule-time')?.value;
            
            if (!button || !freq || !time) return;
            
            appSettings.autoSchedule.frequency = parseInt(freq, 10);
            appSettings.autoSchedule.time = time;

             button.classList.add('btn-loading');
             button.disabled = true;

             setTimeout(() => {
                 button.classList.remove('btn-loading');
                 button.disabled = false;
                closeModal('schedule-modal');
                 updateAutoStatusUI();
            }, 1000);
        }

        // --- Settings ---
        function toggleSubSettings(id) {
            const subSettings = document.getElementById(id);
            if (subSettings) subSettings.classList.toggle('open');
        }

        function handleSettingChange(key, value) {
            if (key.startsWith('notif_')) {
                appSettings.notifications[key.replace('notif_', '')] = value;
            }
        }

        function applyTheme(isDark) {
            if (!appBody) return;
             appBody.classList.toggle('dark-mode', isDark);
             appSettings.darkMode = isDark;
        }

        function toggleDarkMode(isDark) {
            applyTheme(isDark);
            localStorage.setItem('solis_dark_mode', isDark);
        }

         function simulateSave(button) {
            if (!button) return;
             const originalText = button.textContent;
             button.classList.add('btn-loading');
             button.disabled = true;
             setTimeout(() => {
                 button.classList.remove('btn-loading');
                 button.disabled = false;
                 button.textContent = 'Saved!';
                 setTimeout(() => { button.textContent = originalText; }, 1500);
             }, 1200);
         }

        // --- DEMO SYSTEM IMPLEMENTATION ---
        class SolisDemoController {
            constructor() {
                this.isActive = false;
                this.currentStep = 0;
                this.totalSteps = 60;
                this.stepDuration = 1000; // default duration per step
                this.userInteracted = false;
                this.timeoutId = null;
                this.startTime = null;
                this.promptEnabledFromStep = 10; // show prompt only after a few steps
                
                // Demo elements
                this.overlay = document.getElementById('demo-overlay');
                this.progressFill = document.getElementById('demo-progress-fill');
                this.currentStepText = document.getElementById('demo-current-step');
                this.timeRemaining = document.getElementById('demo-time-remaining');
                this.highlight = document.getElementById('demo-highlight');
                this.tooltip = document.getElementById('demo-tooltip');
                this.interactionPrompt = document.getElementById('demo-interaction-prompt');
                
                // Bind methods
                this.skipDemo = this.skipDemo.bind(this);
                this.takeControl = this.takeControl.bind(this);
                this.continueDemo = this.continueDemo.bind(this);
                
                this.initializeSteps();
                this.totalSteps = this.steps.length;
                this.totalDurationMs = this.steps.reduce((sum, s) => sum + (s.duration || this.stepDuration), 0);
                this.setupInteractionDetection();
            }
            
            // Find the nearest scrollable app screen/container
            getScrollContainerFor(element) {
                if (!element) return null;
                const screen = element.closest('.screen');
                return screen || document.scrollingElement || document.documentElement;
            }

            // Smoothly scroll the container so the element is nicely visible
            scrollElementIntoView(element, options = {}) {
                if (!element) return;
                const container = this.getScrollContainerFor(element);
                const padding = options.padding ?? 100; // leave space for sticky headers
                const block = options.block ?? 'center';

                // If the container is window-level, use native scrollIntoView
                if (container === document.scrollingElement || container === document.documentElement) {
                    element.scrollIntoView({ behavior: 'smooth', block });
                    return;
                }

                // Compute element position relative to container
                const elRect = element.getBoundingClientRect();
                const ctRect = container.getBoundingClientRect();
                const currentScrollTop = container.scrollTop;
                const elTopWithin = elRect.top - ctRect.top + currentScrollTop;
                const elCenterWithin = elTopWithin - (container.clientHeight / 2) + (elRect.height / 2);

                let targetScrollTop;
                if (block === 'start') {
                    targetScrollTop = Math.max(0, elTopWithin - padding);
                } else if (block === 'end') {
                    targetScrollTop = Math.max(0, elTopWithin - container.clientHeight + elRect.height + padding);
                } else {
                    targetScrollTop = Math.max(0, elCenterWithin);
                }

                container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
            }

            initializeSteps() {
                this.steps = [
                    // Phase 1: Splash & Introduction (0-8 seconds)
                    { action: 'showScreen', target: 'splash-screen', description: 'Welcome to Solis!', duration: 1000 },
                    { action: 'highlight', target: '.splash-graphic', description: 'Smart solar panel cleaner', duration: 1000 },
                    { action: 'transition', from: 'splash-screen', to: 'signup-screen', description: 'Quick signup process', duration: 1000 },
                    { action: 'highlight', target: '.signup-illustration', description: 'Easy setup', duration: 1000 },
                    { action: 'fillForm', target: 'signup', description: 'Auto-filled demo data', duration: 1000 },
                    { action: 'transition', from: 'signup-screen', to: 'dashboard-screen', description: 'Welcome to your dashboard', duration: 1000 },
                    { action: 'highlight', target: '.app-header h2', description: 'Personalized greeting', duration: 1000 },
                    { action: 'highlight', target: '.welcome-text', description: 'Solar performance overview', duration: 1000 },
                    
                    // Phase 2: Dashboard Exploration (8-20 seconds)
                    { action: 'highlight', target: '.power-analysis-card', description: 'Real-time efficiency tracking', duration: 1000 },
                    { action: 'animateProgress', target: '.progress-circle', description: '78.8% efficiency today', duration: 1000 },
                    { action: 'scrollTo', target: '.stats-grid', description: 'Performance statistics', duration: 1000 },
                    { action: 'highlight', target: '.mini-card:first-child', description: '147 total cleanings', duration: 1000 },
                    { action: 'highlight', target: '.mini-card:last-child', description: 'Average 28-minute cycles', duration: 1000 },
                    { action: 'scrollTo', target: '.maintenance-card', description: 'System health monitoring', duration: 1000 },
                    { action: 'highlight', target: '.water-level-card', description: '75% water level remaining', duration: 1000 },
                    { action: 'animateWaterLevel', target: '.water-level-fill', description: '12 more cleanings possible', duration: 1000 },
                    { action: 'scrollTo', target: '.weather-card', description: 'Weather integration', duration: 1000 },
                    { action: 'highlight', target: '.weather-info', description: 'Perfect cleaning conditions', duration: 1000 },
                    { action: 'scrollTo', target: '.operate-card', description: 'Device control center', duration: 1000 },
                    { action: 'clickElement', target: '.operate-card', description: 'Accessing control panel', duration: 1000 },
                    
                    // Phase 3: Interactive Features (20-35 seconds)
                    { action: 'highlight', target: '.device-status-card', description: 'Device status overview', duration: 1000 },
                    { action: 'highlight', target: '.quick-stats', description: 'Key metrics at a glance', duration: 1000 },
                    { action: 'clickTab', target: '[data-mode="setup"]', description: 'Setup configuration', duration: 1000 },
                    { action: 'scrollTo', target: '.scan-graphic', description: 'Panel tension control', duration: 1200 },
                    { action: 'highlight', target: '.scan-graphic', description: 'Panel tension control', duration: 900 },
                    { action: 'animateStrings', type: 'tightening', description: 'Adjusting string tension', duration: 1000 },
                    { action: 'scrollTo', target: '.panel-inputs', description: 'Panel specs', duration: 1200 },
                    { action: 'highlight', target: '.panel-inputs', description: 'Panel specifications', duration: 900 },
                    { action: 'clickTab', target: '[data-mode="manual"]', description: 'Manual control mode', duration: 1000 },
                    { action: 'scrollTo', target: '.d-pad', description: 'Directional controls', duration: 1200 },
                    { action: 'highlight', target: '.d-pad', description: 'Directional controls', duration: 900 },
                    { action: 'demoControls', target: '.d-pad-btn.up', description: 'Movement simulation', duration: 1000 },
                    { action: 'scrollTo', target: '.cleaning-controls', description: 'Cleaning settings', duration: 1200 },
                    { action: 'highlight', target: '.cleaning-controls', description: 'Cleaning settings', duration: 900 },
                    { action: 'adjustSlider', target: '#brush-pressure', description: 'Brush pressure control', duration: 1000 },
                    { action: 'clickTab', target: '[data-mode="auto"]', description: 'Automatic mode', duration: 1000 },
                    { action: 'scrollTo', target: '#auto-status-card', description: 'Auto status', duration: 1200 },
                    { action: 'highlight', target: '.status-indicator', description: 'Scheduled cleaning', duration: 900 },
                    { action: 'scrollTo', target: '.next-clean-info', description: 'Next cleaning', duration: 1200 },
                    { action: 'highlight', target: '.next-clean-info', description: 'Next cleaning: Tomorrow 5 AM', duration: 900 },
                    { action: 'clickElement', target: '#clean-now-btn', description: 'Starting immediate clean', duration: 1000 },
                    
                    // Phase 4: Advanced Features (35-50 seconds)
                    { action: 'showCleaningProgress', description: 'Cleaning in progress...', duration: 1000 },
                    { action: 'highlight', target: '.cleaning-pattern', description: 'Zigzag cleaning pattern', duration: 1000 },
                    { action: 'scrollTo', target: '.history-card', description: 'Cleaning history', duration: 1200 },
                    { action: 'openSideNav', description: 'Navigation menu', duration: 1000 },
                    { action: 'highlight', target: '#nav-settings', description: 'Settings & preferences', duration: 1000 },
                    { action: 'clickElement', target: '#nav-settings', description: 'Opening settings', duration: 1000 },
                    { action: 'scrollTo', target: '.settings-group:first-child', description: 'General settings', duration: 1200 },
                    { action: 'highlight', target: '.settings-group:first-child', description: 'Notification preferences', duration: 900 },
                    { action: 'clickElement', target: '.settings-group .settings-item', description: 'Open notification settings', duration: 1000 },
                    { action: 'scrollTo', target: '#dark-mode-toggle', description: 'Appearance section', duration: 1200 },
                    { action: 'toggleSetting', target: '#dark-mode-toggle', description: 'Dark mode toggle', duration: 1000 },
                    { action: 'scrollTo', target: '.settings-group:last-child', description: 'Account & support', duration: 1200 },
                    { action: 'highlight', target: '.settings-group:last-child', description: 'Account & support', duration: 900 },
                    { action: 'navigateBack', description: 'Back to dashboard', duration: 1000 },
                    
                    // Phase 5: Dashboard Features (50-60 seconds)
                    { action: 'clickTab', target: '[data-period="weekly"]', description: 'Weekly performance', duration: 1000 },
                    { action: 'updateDashboard', period: 'weekly', description: 'Weekly energy data', duration: 1000 },
                    { action: 'clickTab', target: '[data-period="monthly"]', description: 'Monthly overview', duration: 1000 },
                    { action: 'updateDashboard', period: 'monthly', description: 'Monthly statistics', duration: 1000 },
                    { action: 'scrollTo', target: '.energy-card', description: 'Energy production metrics', duration: 1000 },
                    { action: 'highlight', target: '.power-analysis-card', description: 'Efficiency optimization', duration: 1000 },
                    { action: 'showTooltip', text: 'AI-powered cleaning schedules optimize your solar efficiency', description: 'Smart automation', duration: 1000 },
                    { action: 'highlight', target: '.operate-card', description: 'Full device control', duration: 1000 },
                    { action: 'showTooltip', text: 'Remote operation from anywhere in the world', description: 'Remote access', duration: 1000 },
                    { action: 'fadeOut', description: 'Demo complete!', duration: 1000 }
                ];
            }
            
            setupInteractionDetection() {
                const events = [];
                events.forEach(event => {
                    document.addEventListener(event, (e) => {
                        const clickedInsidePhone = !!e.target.closest('.app-container');
                        const isAllowedStep = this.currentStep >= this.promptEnabledFromStep;
                        const isExcluded = !!e.target.closest('.demo-controls, .demo-interaction-prompt');
                        if (this.isActive && !this.userInteracted && isAllowedStep && clickedInsidePhone && !isExcluded) {
                            this.handleUserInteraction(e);
                        }
                    });
                });
            }
            
            handleUserInteraction(event) {
                if (this.userInteracted) return;
                
                this.userInteracted = true;
                this.showInteractionPrompt();
                event.preventDefault();
                event.stopPropagation();
            }
            
            showInteractionPrompt() {
                this.interactionPrompt.classList.add('active');
            }
            
            hideInteractionPrompt() {
                this.interactionPrompt.classList.remove('active');
            }
            
            continueDemo() {
                this.userInteracted = false;
                this.hideInteractionPrompt();
                this.executeNextStep();
            }
            
            takeControl() {
                this.skipDemo();
            }
            
            start() {
                if (this.isActive) return;

                this.isActive = true;
                this.currentStep = 0;
                this.startTime = Date.now();
                this.userInteracted = false;
                
                // Show demo overlay
                if (this.overlay) this.overlay.classList.add('active');
                document.body.classList.add('demo-smooth-scroll');
                
                // Start the demo sequence
                this.executeStep(0);
            }
            
            executeStep(stepIndex) {
                if (!this.isActive || stepIndex >= this.steps.length) {
                    this.finish();
                    return;
                }
                
                const step = this.steps[stepIndex];
                this.currentStep = stepIndex;
                
                // Update progress
                this.updateProgress();
                
                // Execute the step action
                this.performAction(step);
                
                // Schedule next step
                this.timeoutId = setTimeout(() => {
                    if (this.isActive && !this.userInteracted) {
                        this.executeStep(stepIndex + 1);
                    }
                }, step.duration);
            }
            
            executeNextStep() {
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }
                this.executeStep(this.currentStep + 1);
            }
            
            updateProgress() {
                const elapsed = Date.now() - this.startTime;
                const progress = Math.min(100, (elapsed / this.totalDurationMs) * 100);
                const remainingMs = Math.max(0, this.totalDurationMs - elapsed);
                const timeRemaining = Math.ceil(remainingMs / 1000);

                if (this.progressFill) this.progressFill.style.width = `${progress}%`;
                if (this.currentStepText) this.currentStepText.textContent = (this.steps[this.currentStep] && this.steps[this.currentStep].description) || 'Solis Demo';
                if (this.timeRemaining) this.timeRemaining.textContent = `${timeRemaining}s`;
            }
            
            performAction(step) {
                switch (step.action) {
                    case 'showScreen':
                        this.actionShowScreen(step.target);
                        break;
                    case 'highlight':
                        this.actionHighlight(step.target);
                        break;
                    case 'transition':
                        this.actionTransition(step.from, step.to);
                        break;
                    case 'scrollTo':
                        this.actionScrollTo(step.target);
                        break;
                    case 'clickElement':
                        this.actionClickElement(step.target);
                        break;
                    case 'clickTab':
                        this.actionClickTab(step.target);
                        break;
                    case 'fillForm':
                        this.actionFillForm();
                        break;
                    case 'animateProgress':
                        this.actionAnimateProgress();
                        break;
                    case 'animateWaterLevel':
                        this.actionAnimateWaterLevel();
                        break;
                    case 'animateStrings':
                        this.actionAnimateStrings(step.type);
                        break;
                    case 'demoControls':
                        this.actionDemoControls(step.target);
                        break;
                    case 'adjustSlider':
                        this.actionAdjustSlider(step.target);
                        break;
                    case 'showCleaningProgress':
                        this.actionShowCleaningProgress();
                        break;
                    case 'openSideNav':
                        this.actionOpenSideNav();
                        break;
                    case 'toggleSetting':
                        this.actionToggleSetting(step.target);
                        break;
                    case 'navigateBack':
                        this.actionNavigateBack();
                        break;
                    case 'updateDashboard':
                        this.actionUpdateDashboard(step.period);
                        break;
                    case 'showTooltip':
                        this.actionShowTooltip(step.text);
                        break;
                    case 'fadeOut':
                        this.actionFadeOut();
                        break;
                }
            }
            
            // Action implementations
            actionShowScreen(screenId) {
                showScreen(screenId);
            }
            
            actionHighlight(selector) {
                const element = document.querySelector(selector);
                if (!element) return;
                
                const rect = element.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                if (!this.highlight) return;
                this.highlight.style.left = (rect.left + scrollLeft - 5) + 'px';
                this.highlight.style.top = (rect.top + scrollTop - 5) + 'px';
                this.highlight.style.width = (rect.width + 10) + 'px';
                this.highlight.style.height = (rect.height + 10) + 'px';
                this.highlight.classList.add('active');
                
                // Hide highlight after duration
                setTimeout(() => {
                    if (this.highlight) this.highlight.classList.remove('active');
                }, 800);
            }
            
            actionTransition(from, to) {
                showScreen(to);
            }
            
            actionScrollTo(selector) {
                const element = document.querySelector(selector);
                if (element) {
                    this.scrollElementIntoView(element, { block: 'center', padding: 120 });
                }
            }
            
            actionClickElement(selector) {
                const element = document.querySelector(selector);
                if (element) {
                    // Highlight first
                    this.actionHighlight(selector);
                    // Then click after brief delay
                    setTimeout(() => {
                        this.scrollElementIntoView(element, { block: 'center', padding: 120 });
                        setTimeout(() => element.click(), 300);
                    }, 300);
                }
            }
            
            actionClickTab(selector) {
                const tab = document.querySelector(selector);
                if (tab) {
                    this.actionHighlight(selector);
                    setTimeout(() => {
                        this.scrollElementIntoView(tab, { block: 'start', padding: 140 });
                        setTimeout(() => tab.click(), 300);
                    }, 300);
                }
            }
            
            actionFillForm() {
                // Forms are already pre-filled in the HTML
                this.actionHighlight('.input-field:first-child');
            }
            
            actionAnimateProgress() {
                const circle = document.querySelector('.progress-circle');
                if (circle) {
                    circle.style.setProperty('--progress-value', '78.8%');
                }
            }
            
            actionAnimateWaterLevel() {
                const fill = document.querySelector('.water-level-fill');
                if (fill) {
                    fill.style.width = '75%';
                }
            }
            
            actionAnimateStrings(type) {
                if (typeof triggerStringAnimation === 'function') {
                    triggerStringAnimation(type);
                }
            }
            
            actionDemoControls(selector) {
                const btn = document.querySelector(selector);
                if (btn) {
                    this.actionHighlight(selector);
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = '';
                    }, 200);
                }
            }
            
            actionAdjustSlider(selector) {
                const slider = document.querySelector(selector);
                if (slider) {
                    this.actionHighlight(selector);
                    slider.value = 4;
                    const event = new Event('input');
                    slider.dispatchEvent(event);
                }
            }
            
            actionShowCleaningProgress() {
                const indicator = document.querySelector('#auto-status-indicator');
                if (indicator) {
                    indicator.className = 'status-indicator running';
                    indicator.textContent = 'Running';
                }
            }
            
            actionOpenSideNav() {
                const hamburger = document.querySelector('.hamburger-menu');
                if (hamburger) {
                    hamburger.click();
                }
            }
            
            actionToggleSetting(selector) {
                const toggle = document.querySelector(selector);
                if (toggle) {
                    this.actionHighlight(selector);
                    setTimeout(() => {
                        toggle.click();
                    }, 300);
                }
            }
            
            actionNavigateBack() {
                const backBtn = document.querySelector('.back-arrow');
                if (backBtn) {
                    backBtn.click();
                } else {
                    showScreen('dashboard-screen');
                }
            }
            
            actionUpdateDashboard(period) {
                const tab = document.querySelector(`[data-period="${period}"]`);
                if (tab && typeof updateDashboardContent === 'function') {
                    updateDashboardContent(period, tab);
                }
            }
            
            actionShowTooltip(text) {
                if (!this.tooltip) return;
                this.tooltip.textContent = text;
                this.tooltip.style.left = '50%';
                this.tooltip.style.top = '50%';
                this.tooltip.style.transform = 'translate(-50%, -50%)';
                this.tooltip.classList.add('active');
                
                setTimeout(() => {
                    if (this.tooltip) this.tooltip.classList.remove('active');
                }, 2000);
            }
            
            actionFadeOut() {
                this.finish();
            }
            
            skipDemo() {
                this.finish();
            }
            
            finish() {
                this.isActive = false;
                this.userInteracted = false;
                
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }
                
                // Hide all demo elements
                if (this.overlay) this.overlay.classList.remove('active');
                if (this.highlight) this.highlight.classList.remove('active');
                if (this.tooltip) this.tooltip.classList.remove('active');
                if (this.interactionPrompt) this.hideInteractionPrompt();
                
                document.body.classList.remove('demo-smooth-scroll');
                
                // Reset to dashboard
                showScreen('dashboard-screen');
            }
        }

        // --- Initialization ---
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize DOM element references
            sideNav = document.getElementById('sideNav');
            navOverlay = document.getElementById('navOverlay');
            appBody = document.getElementById('app-body');
            darkModeToggle = document.getElementById('dark-mode-toggle');

             // Apply persisted theme
             const persistedDarkMode = localStorage.getItem('solis_dark_mode') === 'true';
            if (darkModeToggle) darkModeToggle.checked = persistedDarkMode;
             applyTheme(persistedDarkMode);

             // Initial Screen Setup
             document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
            const splashScreen = document.getElementById('splash-screen');
            if (splashScreen) splashScreen.classList.add('active');
             previousScreen = 'splash-screen';

             // Set initial states
            const dashboardTab = document.querySelector('#dashboard-tabs .tab-button[data-period="daily"]');
            if (dashboardTab) updateDashboardContent('daily', dashboardTab);

            const operateTab = document.querySelector('#operate-tabs .tab-button[data-mode="auto"]');
            if (operateTab) updateOperateContent('auto', operateTab);

            updateAutoStatusUI();

            // Restore settings toggle states
             document.querySelectorAll('#notification-settings input[type="checkbox"]').forEach(toggle => {
                const onchangeAttr = toggle.getAttribute('onchange');
                if (onchangeAttr) {
                    const match = onchangeAttr.match(/'(.*?)'/);
                    if (match) {
                        const key = match[1].replace('notif_','');
                 if (appSettings.notifications.hasOwnProperty(key)) {
                     toggle.checked = appSettings.notifications[key];
                        }
                    }
                 }
             });

            const wifiStatusText = document.getElementById('wifi-status-text');
            if (wifiStatusText) {
                wifiStatusText.textContent = appSettings.wifiNetwork ? 'Connected' : 'Not Connected';
            }

            // Initialize Demo Controller
            demoController = new SolisDemoController();
            
            // Check if demo should auto-start (for embedding)
            const urlParams = new URLSearchParams(window.location.search);
            const autoDemo = urlParams.get('demo') === 'auto';
            
            if (autoDemo) {
                // Auto-start demo after brief delay
                setTimeout(() => {
                    demoController.start();
                }, 1000);
            } else {
                // Normal app flow - add demo start button
                addDemoStartButton();
                
                // Splash transition
                setTimeout(() => {
                    showScreen('signup-screen');
                    
                    // Auto-skip signup page after 1 second and go to dashboard
                    setTimeout(() => {
                        showScreen('dashboard-screen');
                    }, 1000);
                }, splashScreenDuration);
            }
        });
        
        // Add demo start button for manual demo activation
        function addDemoStartButton() {
            const demoBtn = document.createElement('button');
            demoBtn.innerHTML = '▶️ Start Demo';
            demoBtn.className = 'btn btn-secondary';
            demoBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                width: auto;
                padding: 8px 16px;
                font-size: 0.9em;
                background: rgba(255, 255, 255, 0.95);
                color: var(--text-primary);
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            `;
            demoBtn.onclick = () => {
                demoBtn.style.display = 'none';
                demoController.start();
            };
            document.body.appendChild(demoBtn);
        }
        
        // Enhanced functions for demo interactions
        function toggleBrush(button) {
            if (!button) return;
            const isActive = button.textContent.includes('Stop');
            button.innerHTML = isActive ? 
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>Start Brush' :
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>Stop Brush';
        }
        
        function toggleWater(button) {
            if (!button) return;
            const isActive = button.textContent.includes('Stop');
            button.innerHTML = isActive ? 
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>Start Spray' :
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>Stop Spray';
        }
        
        function saveConfiguration(button) {
            simulateSave(button);
        }
        
        // Global demo API for external access
        window.SolisDemo = {
            start: () => demoController?.start(),
            skip: () => demoController?.skipDemo(),
            isActive: () => demoController?.isActive || false,
            controller: () => demoController
        };

        // Demo start function for the button
        function startDemo() {
            if (demoController) {
                demoController.start();
            } else {
                console.error('Demo controller not initialized');
            }
        }

