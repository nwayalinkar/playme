# 🎮 Neon Breaker

A premium cyberpunk Brick Breaker arcade game built with vanilla HTML, CSS, and JavaScript — hosted on GitHub Pages.

**[▶ Play Now](https://nwayalinkar.github.io/playme/)**

---

## Features
- 🧱 5-row neon brick grid with particle explosions on hit
- 🖱️ Mouse, keyboard (Arrow / A&D), and **touch** controls (mobile-ready)
- 📈 Speed increases every level
- 🏆 Global leaderboard stored in the cloud (JSONBin.io)
- 💾 Player name saved in browser
- ⏸ Pause with **P** key
- 🌑 Dark cyberpunk theme with neon glow effects

---

## Project Structure

```
frontend/           ← GitHub Pages (uploaded here)
  index.html
  css/
    theme.css       CSS variables & neon palette
    main.css        Dashboard grid layout
    game.css        Canvas frame & HUD
    ui.css          Buttons, leaderboard, toasts
  js/
    config.js       API keys & game constants
    api.js          JSONBin cloud score storage
    game.js         Canvas engine (physics, particles)
    ui.js           DOM updates & leaderboard
    app.js          Bootstrap entry point

backend/            ← Optional local Flask server (for offline use)
  app.py
  config.py
  storage.py
  requirements.txt
```

---

## Setup: Enable Online Leaderboard (2 min)

1. Go to **[jsonbin.io](https://jsonbin.io)** → Create a free account  
2. Click **Create Bin** → paste `[]` → Save  
3. Copy the **Bin ID** from the URL  
4. Go to **API Keys** → copy your **Master Key**  
5. Open `frontend/js/config.js` and paste both values:

```js
JSONBIN_BIN_ID: 'your-bin-id-here',
JSONBIN_API_KEY: '$2a$10$your-master-key-here',
```

6. Commit and push — leaderboard now works globally! 🌍

---

## Run Locally (Optional)

```bash
# Install Flask
pip install -r backend/requirements.txt

# Start backend
python backend/app.py

# Serve frontend (new terminal)
python -m http.server 8000 --directory frontend

# Open: http://localhost:8000
```
