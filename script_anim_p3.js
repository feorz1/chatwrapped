
    // ========== СЛАЙД 14: ДЛИНА СООБЩЕНИЙ ==========
    const avgLength = textMessages > 0 ? Math.round(totalChars / textMessages) : 0;
    animateNumber(document.getElementById('avgLength'), avgLength);

    const topLength = Object.entries(userMessageLength)
        .map(([name, data]) => [name, data.count > 0 ? Math.round(data.total / data.count) : 0])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    if (topLength.length > 0) {
        document.getElementById('topMessageLength').innerHTML = topLength.map((entry, i) => {
            const [name, avg] = entry;
            return `
                <div class="top-item">
                    <span class="top-rank">${i + 1}</span>
                    ${createAvatar(name)}
                    <span class="top-name">${name}</span>
                    <span class="top-value">${avg} сим.</span>
                </div>
            `;
        }).join('');
    }

    // ========== СЛАЙД 15: ФОРМАТ ==========
    const textPercent = messages.length > 0 ? Math.round((textMessages / messages.length) * 100) : 0;
    animatePercent(document.getElementById('textPercent'), textPercent);

    animateNumber(document.getElementById('textMessages'), textMessages);
    animateNumber(document.getElementById('photoCount'), mediaCount.photos);
    animateNumber(document.getElementById('stickerCount'), mediaCount.stickers);
    animateNumber(document.getElementById('videoCount'), mediaCount.videos);

    // ========== НОМИНАЦИИ ==========
    const topNight = Object.entries(userNight).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEdit = Object.entries(userEdited).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topPhoto = Object.entries(userPhotos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topVideo = Object.entries(userVideos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topMsg = Object.entries(userMessages).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const nominations = [
        { list: topNight, el: 'nom1List' },
        { list: topEdit, el: 'nom2List' },
        { list: topPhoto, el: 'nom3List' },
        { list: topVideo, el: 'nom4List' },
        { list: topMsg, el: 'nom5List' }
    ];

    nominations.forEach(({ list, el }) => {
        if (list.length > 0) {
            document.getElementById(el).innerHTML = list.map((entry, i) => {
                const [name, count] = entry;
                return `
                    <div class="top-item">
                        <span class="top-rank">${i + 1}</span>
                        ${createAvatar(name)}
                        <span class="top-name">${name}</span>
                        <span class="top-value">${count.toLocaleString('ru-RU')}</span>
                    </div>
                `;
            }).join('');
        }
    });

    // ========== СЛАЙД 21: ОСОБЫЙ СТАТУС ==========
    const userReplies = {};
    messages.forEach(msg => {
        if (msg.reply_to_message_id) {
            const originalMsg = messages.find(m => m.id === msg.reply_to_message_id);
            if (originalMsg && originalMsg.from) {
                userReplies[originalMsg.from] = (userReplies[originalMsg.from] || 0) + 1;
            }
        }
    });

    const candidates = Object.entries(userMessages)
        .filter(([name, count]) => count < 500 && userReplies[name] > 50)
        .sort((a, b) => (userReplies[b[0]] / b[1]) - (userReplies[a[0]] / a[1]));

    if (candidates.length > 0) {
        const [name, msgCount] = candidates[0];
        document.getElementById('specialName').textContent = name;
        document.getElementById('specialAvatar').textContent = getInitials(name);
        document.getElementById('specialAvatar').style.background = getAvatarColor(name);
        animateNumber(document.getElementById('specialMessages'), msgCount);
        animateNumber(document.getElementById('specialReplies'), userReplies[name]);
    }
}

// ========== НАВИГАЦИЯ ==========
function showSlide(index) {
    const slides = document.querySelectorAll('.slide');

    if (index < 0 || index >= slides.length) return;

    slides.forEach((slide, i) => {
        if (i === currentSlide && i !== index) {
            slide.classList.add('exiting');
            slide.classList.remove('active');
            setTimeout(() => slide.classList.remove('exiting'), 600);
        } else {
            slide.classList.remove('active', 'exiting');
        }
    });

    setTimeout(() => {
        slides[index].classList.add('active');
        animateCircles(index);
    }, 50);

    currentSlide = index;
    updateProgress();
    updateButtons();
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        showSlide(currentSlide - 1);
    }
}

function updateProgress() {
    const slides = document.querySelectorAll('.slide');
    const progress = (currentSlide / (slides.length - 1)) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

function updateButtons() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.disabled = currentSlide <= 1;
    if (nextBtn) nextBtn.disabled = currentSlide >= slides.length - 1;
}

function restartPresentation() {
    chatData = null;
    currentSlide = 0;
    showSlide(0);
    document.querySelector('.navigation').classList.remove('visible');
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('fileInput').value = '';
}

// ========== СОБЫТИЯ ==========
document.addEventListener('keydown', function(e) {
    if (currentSlide === 0) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
    }
});

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (currentSlide === 0) return;

    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) previousSlide();
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    alert('Функция скачивания в разработке.\nИспользуй скриншоты экрана 📸');
});

console.log('ChatWrapped 2025 🎉');