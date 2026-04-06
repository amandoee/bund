        // Zara Larsson Edition Data
        const zaraOutcomes = [
            { name: "Mandøe", song: "Can't Tame Her", id: "k4vO9g3tSHE" },
            { name: "Rynkeby", song: "All the Time", id: "aMKtzB7zNrg" },
            { name: "Claes", song: "Lush Life", id: "tD4HCZe-tew" }
        ];

        // Normal Edition Data from JSON
        const normalData = <INJECT_JSON_HERE>;
        
        let normalParticipants = [];
        let rulesText = "";

        if (normalData.participants) {
            normalParticipants = normalData.participants.map(p => ({ ...p, checked: true }));
            rulesText = normalData.rules;
        }

        // Load saved checks from localStorage if exists
        const savedChecks = localStorage.getItem('normalParticipantsChecks');
        if (savedChecks) {
            try {
                const parsed = JSON.parse(savedChecks);
                normalParticipants = normalParticipants.map(p => ({
                    ...p,
                    checked: parsed[p.name] !== undefined ? parsed[p.name] : p.checked
                }));
            } catch(e) {}
        }

        // State
        let currentEdition = 'zara';
        let currentRotation = 0;
        let isSpinning = false;
        let activeChambersData = [];

        // DOM Elements
        const cylinder = document.getElementById('cylinder');
        const spinBtn = document.getElementById('spin-btn');
        const resultDisplay = document.getElementById('result');
        const overlay = document.getElementById('overlay');
        const chambers = document.querySelectorAll('.chamber');
        const mainTitle = document.querySelector('h1');

        // Menu Elements
        const menuBtn = document.getElementById('menu-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const menuModal = document.getElementById('menu-modal');
        const editionRadios = document.querySelectorAll('input[name="edition"]');
        const participantsSection = document.getElementById('participants-section');
        const participantList = document.getElementById('participant-list');
        const rulesContainer = document.getElementById('rules-container');
        const selectedCount = document.getElementById('selected-count');

        // Initialize Menu
        rulesContainer.textContent = rulesText;

        function renderParticipantList() {
            participantList.innerHTML = '';
            let count = 0;
            normalParticipants.forEach((p, index) => {
                if (p.checked) count++;
                const div = document.createElement('div');
                div.className = 'participant-item';
                div.innerHTML = `
                    <input type="checkbox" id="p-${index}" ${p.checked ? 'checked' : ''}>
                    <label for="p-${index}"><strong>${p.name}</strong> - <small>${p.song}</small></label>
                `;
                const checkbox = div.querySelector('input');
                checkbox.addEventListener('change', (e) => {
                    normalParticipants[index].checked = e.target.checked;
                    saveChecks();
                    updateSelectedCount();
                });
                participantList.appendChild(div);
            });
            selectedCount.textContent = count;
        }

        function updateSelectedCount() {
            const count = normalParticipants.filter(p => p.checked).length;
            selectedCount.textContent = count;
        }

        function saveChecks() {
            const checkMap = {};
            normalParticipants.forEach(p => { checkMap[p.name] = p.checked; });
            localStorage.setItem('normalParticipantsChecks', JSON.stringify(checkMap));
        }

        document.getElementById('select-all-btn').addEventListener('click', () => {
            normalParticipants.forEach(p => p.checked = true);
            renderParticipantList();
            saveChecks();
        });

        document.getElementById('deselect-all-btn').addEventListener('click', () => {
            normalParticipants.forEach(p => p.checked = false);
            renderParticipantList();
            saveChecks();
        });

        renderParticipantList();

        // Menu Toggle
        menuBtn.addEventListener('click', () => menuModal.classList.add('open'));
        closeMenuBtn.addEventListener('click', () => menuModal.classList.remove('open'));

        // Edition Switcher
        editionRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentEdition = e.target.value;
                if (currentEdition === 'normal') {
                    participantsSection.style.display = 'block';
                    participantList.classList.add('visible');
                    mainTitle.innerHTML = "Russian Roulette <br> Normal Edition";
                } else {
                    participantsSection.style.display = 'none';
                    participantList.classList.remove('visible');
                    mainTitle.innerHTML = "Russian Roulette <br> Zara Larsson Edition";
                }
                setupChambersForIdle();
            });
        });

        function setupChambersForIdle() {
            if (currentEdition === 'zara') {
                activeChambersData = [
                    zaraOutcomes[0], zaraOutcomes[1], zaraOutcomes[2],
                    zaraOutcomes[0], zaraOutcomes[1], zaraOutcomes[2]
                ];
            } else {
                activeChambersData = Array(6).fill({ name: "?", song: "?", id: "" });
            }

            chambers.forEach((ch, i) => {
                ch.innerHTML = `<span>${activeChambersData[i].name}</span>`;
                ch.classList.remove('active');
            });
            resultDisplay.innerHTML = "";
        }

        setupChambersForIdle();

        function getRandomInt(max) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] % max;
        }

        // YouTube API Setup
        let player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: zaraOutcomes[0].id,
                host: 'https://www.youtube-nocookie.com',
                playerVars: {
                    'origin': window.location.origin,
                    'enablejsapi': 1,
                    'autoplay': 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onError': (e) => {
                        console.error("YT Player Error:", e.data, e);
                        overlay.classList.add('hidden');
                        if (e.data === 150 || e.data === 101) {
                            resultDisplay.innerHTML += "<br><small style='color:orange'>Warning: Music restricted on localhost. Try on GitHub Pages!</small>";
                        }
                    }
                }
            });
        };

        function onPlayerReady(event) {
            console.log("YT Player Ready");
            overlay.classList.add('hidden');
        }

        setTimeout(() => {
            if (!overlay.classList.contains('hidden')) {
                console.warn("YouTube API timeout - hiding overlay anyway");
                overlay.classList.add('hidden');
            }
        }, 5000);

        // Audio Elements
        const fireAudio = new Audio('fire.mp3');

        function playFireSound() {
            fireAudio.currentTime = 0;
            fireAudio.play().catch(e => console.error("Fire audio error:", e));
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = getRandomInt(i + 1);
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function spin() {
            if (isSpinning) return;

            let chosenOutcome;
            let targetIndex;

            if (currentEdition === 'zara') {
                targetIndex = getRandomInt(6);
                chosenOutcome = activeChambersData[targetIndex];
            } else {
                const available = normalParticipants.filter(p => p.checked);
                if (available.length === 0) {
                    alert("Du skal vælge mindst én deltager!");
                    return;
                }
                
                chosenOutcome = available[getRandomInt(available.length)];
                
                const newChambers = [chosenOutcome];
                for(let i=0; i<5; i++) {
                    newChambers.push(available[getRandomInt(available.length)]);
                }
                shuffle(newChambers);
                
                activeChambersData = newChambers;
                targetIndex = activeChambersData.indexOf(chosenOutcome);

                chambers.forEach((ch, i) => {
                    ch.innerHTML = `<span>${activeChambersData[i].name}</span>`;
                });
            }

            isSpinning = true;
            spinBtn.disabled = true;
            resultDisplay.innerHTML = "GET READY...";
            chambers.forEach(c => c.classList.remove('active'));

            if (player && player.stopVideo) {
                player.stopVideo();
            }

            console.log("Chosen Index:", targetIndex, "Target:", chosenOutcome.name);

            const extraSpins = (8 + getRandomInt(5)) * 360;
            const chamberAngle = targetIndex * 60;
            
            const currentMod = currentRotation % 360;
            const targetRotation = currentRotation - extraSpins - chamberAngle - currentMod;
            
            cylinder.style.transform = `rotateX(-10deg) rotateY(${targetRotation}deg)`;
            currentRotation = targetRotation;

            setTimeout(() => {
                isSpinning = false;
                spinBtn.disabled = false;
                
                playFireSound();
                
                resultDisplay.innerHTML = `FISSE! <span class="highlight">${chosenOutcome.name} drikker!</span><br><small>Afspiller: ${chosenOutcome.song}</small>`;
                
                if (player && chosenOutcome.id) {
                    player.loadVideoById(chosenOutcome.id);
                    player.playVideo();
                } else if (!chosenOutcome.id) {
                    resultDisplay.innerHTML += "<br><small style='color:red'>Ingen sang fundet!</small>";
                }

                chambers[targetIndex].classList.add('active');

            }, 6000);
        }

        spinBtn.addEventListener('click', spin);
        document.getElementById('stop-btn').addEventListener('click', () => {
            if (player && player.stopVideo) player.stopVideo();
        });

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
