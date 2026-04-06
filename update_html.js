const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// Inject CSS
html = html.replace('</style>', `
        /* Menu Styles */
        #menu-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; z-index: 50; }
        #menu-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 200; display: flex; flex-direction: column; padding: 20px; overflow-y: auto; transform: translateX(100%); transition: transform 0.3s ease; }
        #menu-modal.open { transform: translateX(0); }
        .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #444; padding-bottom: 10px; }
        #close-menu-btn { background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }
        .menu-section { margin-bottom: 20px; }
        .menu-section h2 { color: var(--accent-color); margin-bottom: 10px; }
        .radio-group { display: flex; gap: 15px; margin-bottom: 15px; }
        .radio-group label { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 1.1rem; }
        #participant-list { display: none; flex-direction: column; gap: 10px; max-height: 40vh; overflow-y: auto; background: #222; padding: 15px; border-radius: 10px; }
        #participant-list.visible { display: flex; }
        .participant-item { display: flex; align-items: center; gap: 10px; }
        .participant-item input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--accent-color); }
        .rules-text { background: #222; padding: 15px; border-radius: 10px; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.5; color: #ccc; }
        .chamber span { word-wrap: break-word; padding: 0 5px; }
</style>`);

// Inject HTML Modal
html = html.replace('<body>', `<body>
    <button id="menu-btn">☰</button>
    <div id="menu-modal">
        <div class="menu-header">
            <h2>Indstillinger</h2>
            <button id="close-menu-btn">×</button>
        </div>
        <div class="menu-section">
            <h2>Vælg Udgave</h2>
            <div class="radio-group">
                <label><input type="radio" name="edition" value="zara" checked> Zara Larsson</label>
                <label><input type="radio" name="edition" value="normal"> Normal</label>
            </div>
        </div>
        <div class="menu-section" id="participants-section" style="display: none;">
            <h2>Deltagere (<span id="selected-count">0</span> valgt)</h2>
            <div style="margin-bottom: 10px;">
                <button id="select-all-btn" style="background: #444; color: #fff; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Vælg Alle</button>
                <button id="deselect-all-btn" style="background: #444; color: #fff; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Fravælg Alle</button>
            </div>
            <div id="participant-list"></div>
        </div>
        <div class="menu-section">
            <h2>Regler</h2>
            <div class="rules-text" id="rules-container"></div>
        </div>
    </div>`);

// Inject JS logic block
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>') + '</script>'.length;

const dataJson = fs.readFileSync('data.json', 'utf-8');
let newScript = fs.readFileSync('new_logic.js', 'utf-8');
newScript = newScript.replace('<INJECT_JSON_HERE>', dataJson);

html = html.substring(0, scriptStart) + '<script>\n' + newScript + '\n</script>' + html.substring(scriptEnd);

fs.writeFileSync('index.html', html);
console.log("Successfully built index.html");
