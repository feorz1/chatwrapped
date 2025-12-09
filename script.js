let chatData = null;
let currentSlide = 0;

// ========== ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ DOM ==========
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    let data = JSON.parse(event.target.result);
                    if (!data || !data.messages) throw new Error('Неверный JSON');
                    chatData = { messages: data.messages };
                    processData();
                    showSlide(1);
                    document.querySelector('.navigation').classList.add('visible');
                } catch(error) {
                    alert('Ошибка: ' + error.message);
                }
            };
            reader.readAsText(file);
        });
    }
});

function animateNumber(el, target) {
    if (!el) return;
    let cur = 0, inc = target / 75;
    setInterval(() => {
        cur += inc;
        if (cur >= target) {
            el.textContent = Math.round(target).toLocaleString('ru-RU');
        } else {
            el.textContent = Math.round(cur).toLocaleString('ru-RU');
        }
    }, 20);
}

const circleColors = [['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe']];

function animateCircles(i) {
    document.querySelectorAll('.circle').forEach((c, j) => {
        const col = circleColors[(i + j) % circleColors.length];
        c.style.background = `linear-gradient(135deg, ${col[0]} 0%, ${col[1]} 100%)`;
    });
}

function getAvatarColor(name) {
    const colors = ['#FF6B9D', '#C3AEF0', '#4D9FEC', '#45B7E0', '#F97583', '#B392F0'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

function createAvatar(name) {
    return `<div class="avatar" style="background: ${getAvatarColor(name)}">${getInitials(name)}</div>`;
}

function processData() {
    const msgs = chatData.messages || [];
    const users = {}, hours = Array(24).fill(0), days = Array(7).fill(0);
    const words = {}, emojis = {};

    let chars = 0, textMsgs = 0;

    msgs.forEach(m => {
        if (m.type !== 'message' || !m.from) return;
        const text = typeof m.text === 'string' ? m.text : '';

        users[m.from] = (users[m.from] || 0) + 1;

        if (m.date) {
            const [dateStr, timeStr] = m.date.split('T');
            if (timeStr) {
                const h = parseInt(timeStr.split(':')[0]);
                if (!isNaN(h)) hours[h]++;
            }
            try {
                const d = new Date(m.date);
                if (!isNaN(d.getTime())) days[d.getDay()]++;
            } catch(e) {}
        }

        if (text) {
            textMsgs++;
            chars += text.length;
            text.toLowerCase().replace(/[^а-яёa-z\s]/g, ' ').split(/\s+/)
                .filter(w => w.length > 3)
                .forEach(w => words[w] = (words[w] || 0) + 1);

            try {
                const emojis_arr = text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}]/gu);
                if (emojis_arr) emojis_arr.forEach(e => emojis[e] = (emojis[e] || 0) + 1);
            } catch(e) {}
        }
    });

    fillSlides(msgs, users, hours, days, words, emojis, chars, textMsgs);
}

function fillSlides(msgs, users, hours, days, words, emojis, chars, textMsgs) {
    animateNumber(document.getElementById('totalMessages'), msgs.length);
    animateNumber(document.getElementById('participantsCount'), Object.keys(users).length);

    const topUsers = Object.entries(users).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxU = topUsers[0]?.[1] || 1;
    const topHtml = topUsers.map(([name, cnt], i) => `
        <div class="top-item">
            <span class="top-rank">${i + 1}</span>
            ${createAvatar(name)}
            <div style="flex: 1;"><div class="top-name">${name}</div>
            <div class="top-progress"><div class="progress-bar-fill" style="width: ${(cnt/maxU)*100}%"></div>
            <span class="top-value">${cnt}</span></div></div></div>
    `).join('');
    const el = document.getElementById('topAuthors');
    if (el) el.innerHTML = topHtml;

    const peakHour = hours.indexOf(Math.max(...hours));
    const peakEl = document.getElementById('peakHour');
    if (peakEl) peakEl.textContent = peakHour + ':00';

    const maxH = Math.max(...hours) || 1;
    const chartHtml = hours.map((c, h) => `<div class="chart-bar" style="height: ${(c/maxH)*100}%"></div>`).join('');
    const chartEl = document.getElementById('activityChart');
    if (chartEl) chartEl.innerHTML = chartHtml;

    const weekdayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const topDay = days.indexOf(Math.max(...days));
    const weekdayHtml = days.map((c, d) => `
        <div class="weekday-card ${d === topDay ? 'active' : ''}">
            <div class="weekday-name">${weekdayNames[d]}</div>
            <div class="weekday-value">${c > 999 ? (c/1000).toFixed(1)+'к' : c}</div>
        </div>
    `).join('');
    const weekEl = document.getElementById('weekdayGrid');
    if (weekEl) weekEl.innerHTML = weekdayHtml;

    const topWords = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const wordHtml = topWords.map(([w]) => `<span class="word-tag">${w}</span>`).join('');
    const wordEl = document.getElementById('wordCloud');
    if (wordEl) wordEl.innerHTML = wordHtml;

    const topEmoji = Object.entries(emojis).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const emojiHtml = topEmoji.map(([e, c]) => `
        <div class="emoji-item"><span class="emoji-icon">${e}</span><span class="emoji-count">${c}</span></div>
    `).join('');
    const emojiEl = document.getElementById('emojiGrid');
    if (emojiEl) emojiEl.innerHTML = emojiHtml;
}

function showSlide(i) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => s.classList.remove('active'));
    slides[i].classList.add('active');
    animateCircles(i);
    currentSlide = i;
    updateButtons();
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
}

function previousSlide() {
    if (currentSlide > 1) showSlide(currentSlide - 1);
}

function restartPresentation() {
    chatData = null;
    currentSlide = 0;
    showSlide(0);
    document.querySelector('.navigation').classList.remove('visible');
    document.getElementById('fileInput').value = '';
}

function updateButtons() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = currentSlide <= 1;
    if (nextBtn) nextBtn.disabled = currentSlide >= slides.length - 1;
}

document.addEventListener('keydown', e => {
    if (currentSlide === 0) return;
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') previousSlide();
});

let touchStart = 0;
document.addEventListener('touchstart', e => touchStart = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    if (currentSlide === 0) return;
    const touchEnd = e.changedTouches[0].screenX;
    if (touchEnd < touchStart - 50) nextSlide();
    if (touchEnd > touchStart + 50) previousSlide();
});