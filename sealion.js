document.addEventListener("DOMContentLoaded", () => {
    try {
        // ==========================================
        // 8. PERSONAL SEA LION (Chatbot)
        // ==========================================
        document.getElementById('chat-fab')?.addEventListener('click', () => document.getElementById('chat-window')?.classList.add('open'));
        document.getElementById('chat-close')?.addEventListener('click', () => document.getElementById('chat-window')?.classList.remove('open'));
        
        document.getElementById('chat-send')?.addEventListener('click', () => {
            const inp = document.getElementById('chat-input');
            const qRaw = inp.value.trim();
            if(!qRaw) return;
            const q = qRaw.toLowerCase();
            const cb = document.getElementById('chat-body');
            cb.innerHTML += `<div class="chat-msg user-msg">${qRaw}</div>`;
            inp.value = '';
            
            setTimeout(() => {
                let isImageReq = false;
                let category = '';
                
                const imgCategories = ['Cats', 'Dogs', 'Capybaras', 'Memes'];
                
                for (let c of imgCategories) {
                    let lowerC = c.toLowerCase();
                    if (q.includes(lowerC) || q.includes(lowerC.slice(0, -1))) { 
                        isImageReq = true;
                        category = c; 
                        break;
                    }
                }
                
                if (!isImageReq && (q.includes('picture') || q.includes('image') || q.includes('random') || q.includes('show me something'))) {
                    isImageReq = true;
                    category = imgCategories[Math.floor(Math.random() * imgCategories.length)];
                }

                if (isImageReq) {
                    let rNum = Math.floor(Math.random() * 5) + 1;
                    
                    let singularName = category.slice(0, -1);
                    let imgPath = `./assets/${category}/${singularName}%20${rNum}.jpg`;
                    
                    const seaLionSounds = [
                        "*Arf! Arf!* Slides on belly.",
                        "*Happy flipper slaps!*",
                        "Eep eep! Here you go:",
                        "As requested by the master coder:",
                        "*Barks happily and balances a ball*"
                    ];
                    let sound = seaLionSounds[Math.floor(Math.random() * seaLionSounds.length)];
                    
                    cb.innerHTML += `<div class="chat-msg bot-msg">${sound}<br><img src="${imgPath}" onerror="this.onerror=null; this.src=this.src.replace('.jpg', '.png').replace('.JPG', '.png');" style="max-width:100%; border-radius:8px; margin-top:8px; border:1px solid var(--border-color);" alt="${singularName}"></div>`;
                    cb.scrollTop = cb.scrollHeight;
                    return;
                }

                let matchesHtml = '';
                // Utilizing the globally exposed masterList array
                if (window.masterList) {
                    window.masterList.forEach((b, i) => {
                        if(b.title && b.title.toLowerCase().includes(q)) {
                            matchesHtml += `<button class="chat-match-btn" data-index="${i}">📄 ${b.title}</button>`;
                        }
                    });
                }
                
                if(matchesHtml === '') {
                    matchesHtml = "*Sad Arf...* I couldn't find any resources for that. Want to see a capybara instead?";
                } else {
                    matchesHtml = "*Barks happily!* Found these for you:<br>" + matchesHtml;
                }
                
                cb.innerHTML += `<div class="chat-msg bot-msg">${matchesHtml}</div>`;
                cb.scrollTop = cb.scrollHeight;
            }, 450);
        });

        document.getElementById('chat-body')?.addEventListener('click', (e) => {
            if(e.target.classList.contains('chat-match-btn')) {
                const idx = e.target.getAttribute('data-index');
                // Utilizing the globally exposed loadResource function
                if (window.loadResource && window.masterList) {
                    window.loadResource(window.masterList[idx], null);
                    if (window.showToast) window.showToast("Resource Loaded!");
                }
            }
        });
    } catch (err) {
        console.error("Sea Lion Initialization Error:", err);
    }
});