let chatData = null;
let currentSlide = 0;
let totalSlides = 23;

// Загрузка файла
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                chatData = JSON.parse(event.target.result);
                processData();
                showSlide(1);
                document.querySelector('.navigation').classList.add('visible');
                document.getElementById('downloadBtn').style.display = 'flex';
            } catch (error) {
                alert('Ошибка при чтении файла: ' + error.message);
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
});

// ========== АНИМАЦИЯ ЦИФР (Count Up Effect) ==========
function animateNumber(element, target, duration = 1500) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.round(target).toLocaleString('ru-RU');
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current).toLocaleString('ru-RU');
        }
    }, 16);
}

// Анимация процентов
function animatePercent(element, target, duration = 1500) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.round(target) + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current) + '%';
        }
    }, 16);
}

// ========== АНИМАЦИЯ КРУГОВ ==========
const circleColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#ff6e7f', '#bfe9ff']
];

function animateCircles(slideIndex) {
    const circles = document.querySelectorAll('.circle');
    const colorSet = circleColors[slideIndex % circleColors.length];

    circles.forEach((circle, i) => {
        const nextColorSet = circleColors[(slideIndex + i + 1) % circleColors.length];
        circle.style.background = `linear-gradient(135deg, ${nextColorSet[0]} 0%, ${nextColorSet[1]} 100%)`;

        // Случайное перемещение
        const randomX = (Math.random() - 0.5) * 20;
        const randomY = (Math.random() - 0.5) * 20;
        circle.style.transform = `translate(${randomX}%, ${randomY}%)`;
    });
}

// ========== ГЕНЕРАТОР АВАТАРОВ ==========
function getAvatarColor(name) {
    const colors = [
        '#FF6B9D', '#C3AEF0', '#4D9FEC', '#45B7E0', '#F97583',
        '#B392F0', '#79B8FF', '#85E89D', '#FFAB70', '#FFA5E0'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function createAvatar(name) {
    const initials = getInitials(name);
    const color = getAvatarColor(name);
    return `<div class="avatar" style="background: ${color}">${initials}</div>`;
}

// ========== ОБРАБОТКА ДАННЫХ ==========
function processData() {
    const messages = chatData.messages || [];

    // Счетчики
    const userMessages = {};
    const userReactionsGiven = {};
    const userReactionsReceived = {};
    const hourActivity = Array(24).fill(0);
    const weekdayActivity = Array(7).fill(0);
    const wordCount = {};
    const emojiCount = {};
    const userStickers = {};
    const userVoice = {};
    const userPhotos = {};
    const userVideos = {};
    const userEdited = {};
    const userNight = {};
    const userMorning = {};
    const userMessageLength = {};
    const userThanksGiven = {};
    const userThanksReceived = {};

    let totalChars = 0;
    let textMessages = 0;
    let activeDays = new Set();
    let mediaCount = {
        photos: 0,
        videos: 0,
        stickers: 0,
        voice: 0,
        audio: 0,
        files: 0
    };

    const thankWords = ['спасибо', 'благодарю', 'thanks', 'thank you', 'пасиб', 'сенкс', 'thx'];

    // Обработка сообщений
    messages.forEach(msg => {
        if (msg.type !== 'message' || !msg.from) return;

        const user = msg.from;
        const text = Array.isArray(msg.text) ? 
            msg.text.map(t => typeof t === 'string' ? t : t.text || '').join('') : 
            msg.text || '';

        userMessages[user] = (userMessages[user] || 0) + 1;

        // Дата и время
        if (msg.date) {
            const dateParts = msg.date.split('T');
            activeDays.add(dateParts[0]);

            if (dateParts[1]) {
                const hour = parseInt(dateParts[1].split(':')[0]);
                if (!isNaN(hour)) {
                    hourActivity[hour]++;
                    if (hour >= 23 || hour < 4) userNight[user] = (userNight[user] || 0) + 1;
                    if (hour >= 5 && hour < 8) userMorning[user] = (userMorning[user] || 0) + 1;
                }
            }

            const msgDate = new Date(msg.date);
            if (!isNaN(msgDate.getTime())) {
                weekdayActivity[msgDate.getDay()]++;
            }
        }

        // Текст
        if (text) {
            textMessages++;
            totalChars += text.length;

            if (!userMessageLength[user]) {
                userMessageLength[user] = { total: 0, count: 0 };
            }
            userMessageLength[user].total += text.length;
            userMessageLength[user].count++;

            // Благодарности
            const lowerText = text.toLowerCase();
            if (thankWords.some(word => lowerText.includes(word))) {
                userThanksGiven[user] = (userThanksGiven[user] || 0) + 1;
            }

            // Слова
            const stopWords = ['этом', 'этой', 'этот', 'была', 'были', 'быть', 'есть', 
                              'было', 'будет', 'тоже', 'также', 'когда', 'более', 'очень',
                              'только', 'всех', 'себя', 'свой', 'надо', 'даже'];

            const words = text.toLowerCase()
                .replace(/[^а-яёa-z\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 3 && !stopWords.includes(w));

            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });

            // Эмодзи
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{1F90C}-\u{1F9FF}]/gu;
            const emojis = text.match(emojiRegex);
            if (emojis) {
                emojis.forEach(emoji => {
                    emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
                });
            }
        }

        if (msg.edited) userEdited[user] = (userEdited[user] || 0) + 1;

        // Медиа
        if (msg.photo) {
            mediaCount.photos++;
            userPhotos[user] = (userPhotos[user] || 0) + 1;
        }
        if (msg.media_type === 'video_file') {
            mediaCount.videos++;
            userVideos[user] = (userVideos[user] || 0) + 1;
        }
        if (msg.media_type === 'sticker' || msg.media_type === 'animation') {
            mediaCount.stickers++;
            userStickers[user] = (userStickers[user] || 0) + 1;
        }
        if (msg.media_type === 'voice_message') {
            mediaCount.voice++;
            userVoice[user] = (userVoice[user] || 0) + 1;
        }
        if (msg.media_type === 'audio_file') mediaCount.audio++;
        if (msg.file && !msg.media_type) mediaCount.files++;

        // Реакции
        if (msg.reactions) {
            msg.reactions.forEach(reaction => {
                if (reaction.recent) {
                    reaction.recent.forEach(r => {
                        if (r.from) {
                            userReactionsGiven[r.from] = (userReactionsGiven[r.from] || 0) + 1;
                            userReactionsReceived[user] = (userReactionsReceived[user] || 0) + 1;

                            if (reaction.emoji && ['🙏', '❤', '🥰', '❤️'].includes(reaction.emoji)) {
                                userThanksReceived[user] = (userThanksReceived[user] || 0) + 1;
                            }
                        }
                    });
                }
            });
        }
    });
    // ========== СЛАЙД 1: ИНТРО ==========
    animateNumber(document.getElementById('totalMessages'), messages.length);
    animateNumber(document.getElementById('participantsCount'), Object.keys(userMessages).length);
    animateNumber(document.getElementById('activeDaysCount'), activeDays.size);

    // ========== СЛАЙД 2: ТОП АВТОРОВ ==========
    const topAuthors = Object.entries(userMessages).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (topAuthors.length > 0) {
        const maxMsg = topAuthors[0][1];
        document.getElementById('topAuthors').innerHTML = topAuthors.map((entry, i) => {
            const [name, count] = entry;
            const percent = (count / maxMsg) * 100;
            return `
                <div class="top-item">
                    <span class="top-rank">${i + 1}</span>
                    ${createAvatar(name)}
                    <div style="flex: 1;">
                        <div class="top-name">${name}</div>
                        <div class="top-progress">
                            <div class="progress-bar-fill" style="width: ${percent}%"></div>
                            <span class="top-value">${count.toLocaleString('ru-RU')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== СЛАЙД 3: ГРАФИК АКТИВНОСТИ ==========
    const peakHour = hourActivity.indexOf(Math.max(...hourActivity));
    const peakHourEl = document.getElementById('peakHour');
    peakHourEl.textContent = '0:00';
    setTimeout(() => {
        peakHourEl.textContent = `${peakHour}:00`;
    }, 300);

    const maxHourActivity = Math.max(...hourActivity);
    const chartHtml = hourActivity.map((count, hour) => {
        const height = maxHourActivity > 0 ? (count / maxHourActivity) * 100 : 0;
        const isActive = hour === peakHour;
        const delay = hour * 0.02;
        return `
            <div class="chart-bar ${isActive ? 'active' : ''}" 
                 style="height: ${height}%; animation-delay: ${delay}s">
                ${hour % 6 === 0 ? `<span class="chart-label">${hour}</span>` : ''}
            </div>
        `;
    }).join('');
    document.getElementById('activityChart').innerHTML = chartHtml;

    // ========== СЛАЙД 4: ДЕНЬ НЕДЕЛИ ==========
    const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const weekdayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const topWeekday = weekdayActivity.indexOf(Math.max(...weekdayActivity));

    document.getElementById('weekdayTitle').textContent = weekdayNames[topWeekday];

    document.getElementById('weekdayGrid').innerHTML = weekdayActivity.map((count, day) => `
        <div class="weekday-card ${day === topWeekday ? 'active' : ''}">
            <div class="weekday-name">${weekdays[day]}</div>
            <div class="weekday-value">${count > 999 ? (count / 1000).toFixed(1) + 'к' : count}</div>
        </div>
    `).join('');

    // ========== СЛАЙД 5: ОБЛАКО СЛОВ ==========
    const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 12);

    if (topWords.length > 0) {
        document.getElementById('wordCloud').innerHTML = topWords.map(([word]) => 
            `<span class="word-tag">${word}</span>`
        ).join('');
    }

    // ========== СЛАЙД 6: ТОП ЭМОДЗИ ==========
    const topEmojis = Object.entries(emojiCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    if (topEmojis.length > 0) {
        document.getElementById('emojiGrid').innerHTML = topEmojis.map(([emoji, count]) => `
            <div class="emoji-item">
                <span class="emoji-icon">${emoji}</span>
                <span class="emoji-count">${count.toLocaleString('ru-RU')}</span>
            </div>
        `).join('');
    }

    // ========== СЛАЙД 7-8: РЕАКЦИИ ==========
    const topReactGiven = Object.entries(userReactionsGiven).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topReactReceived = Object.entries(userReactionsReceived).sort((a, b) => b[1] - a[1]).slice(0, 5);

    function getTopUserEmojis(userName, messages) {
        const userEmojis = {};
        messages.forEach(msg => {
            if (msg.reactions) {
                msg.reactions.forEach(reaction => {
                    if (reaction.recent) {
                        reaction.recent.forEach(r => {
                            if (r.from === userName && reaction.emoji) {
                                userEmojis[reaction.emoji] = (userEmojis[reaction.emoji] || 0) + 1;
                            }
                        });
                    }
                });
            }
        });
        return Object.entries(userEmojis).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([emoji]) => emoji).join('');
    }

    if (topReactGiven.length > 0) {
        document.getElementById('topReactionsGiven').innerHTML = topReactGiven.map((entry, i) => {
            const [name, count] = entry;
            const emojis = getTopUserEmojis(name, messages);
            return `
                <div class="top-item">
                    <span class="top-rank">${i + 1}</span>
                    ${createAvatar(name)}
                    <span class="top-name">${name}</span>
                    ${emojis ? `<span class="reaction-emojis">${emojis}</span>` : ''}
                    <span class="top-value">${count.toLocaleString('ru-RU')}</span>
                </div>
            `;
        }).join('');
    }

    if (topReactReceived.length > 0) {
        document.getElementById('topReactionsReceived').innerHTML = topReactReceived.map((entry, i) => {
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

    // ========== СЛАЙД 9: СОВА И ЖАВОРОНОК ==========
    const owlEntries = Object.entries(userNight).sort((a, b) => b[1] - a[1]);
    const larkEntries = Object.entries(userMorning).sort((a, b) => b[1] - a[1]);
    const owl = owlEntries.length > 0 ? owlEntries[0] : ['—', 0];
    const lark = larkEntries.length > 0 ? larkEntries[0] : ['—', 0];

    document.getElementById('dayModeCards').innerHTML = `
        <div class="mode-card">
            <div class="mode-emoji">🦉</div>
            ${owl[0] !== '—' ? createAvatar(owl[0]) : ''}
            <div class="mode-name">${owl[0]}</div>
            <div class="mode-count">${owl[1]} ночью</div>
        </div>
        <div class="mode-card">
            <div class="mode-emoji">🐦</div>
            ${lark[0] !== '—' ? createAvatar(lark[0]) : ''}
            <div class="mode-name">${lark[0]}</div>
            <div class="mode-count">${lark[1]} утром</div>
        </div>
    `;

    // ========== СЛАЙД 10: БЛАГОДАРНОСТИ ==========
    const totalThanks = Object.values(userThanksGiven).reduce((a, b) => a + b, 0) + 
                       Object.values(userThanksReceived).reduce((a, b) => a + b, 0);

    animateNumber(document.getElementById('thanksTotal'), totalThanks);

    const topThanks = Object.entries(userThanksGiven).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (topThanks.length > 0) {
        document.getElementById('topThanks').innerHTML = topThanks.map((entry, i) => {
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

    // ========== СЛАЙД 11: МЕДИА ==========
    const totalMedia = Object.values(mediaCount).reduce((a, b) => a + b, 0);
    animateNumber(document.getElementById('mediaTotal'), totalMedia);

    document.getElementById('mediaGrid').innerHTML = `
        <div class="media-card">
            <div class="media-icon">📷</div>
            <div class="media-value">${mediaCount.photos.toLocaleString('ru-RU')}</div>
            <div class="media-label">фото</div>
        </div>
        <div class="media-card">
            <div class="media-icon">🎥</div>
            <div class="media-value">${mediaCount.videos.toLocaleString('ru-RU')}</div>
            <div class="media-label">видео</div>
        </div>
        <div class="media-card">
            <div class="media-icon">🎭</div>
            <div class="media-value">${mediaCount.stickers.toLocaleString('ru-RU')}</div>
            <div class="media-label">стикеров</div>
        </div>
        <div class="media-card">
            <div class="media-icon">🎤</div>
            <div class="media-value">${mediaCount.voice.toLocaleString('ru-RU')}</div>
            <div class="media-label">голосовых</div>
        </div>
        <div class="media-card">
            <div class="media-icon">🎵</div>
            <div class="media-value">${mediaCount.audio.toLocaleString('ru-RU')}</div>
            <div class="media-label">аудио</div>
        </div>
        <div class="media-card">
            <div class="media-icon">📎</div>
            <div class="media-value">${mediaCount.files.toLocaleString('ru-RU')}</div>
            <div class="media-label">файлов</div>
        </div>
    `;

    // ========== СЛАЙД 12-13: СТИКЕРЫ И ГОЛОСОВЫЕ ==========
    const topStick = Object.entries(userStickers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topVo = Object.entries(userVoice).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (topStick.length > 0) {
        document.getElementById('topStickers').innerHTML = topStick.map((entry, i) => {
            const [name, count] = entry;
            return `
                <div class="top-item">
                    <span class="top-rank">${i + 1}</span>
                    ${createAvatar(name)}
                    <span class="top-name">${name}</span>
                    <span class="top-value">${count}</span>
                </div>
            `;
        }).join('');
    }

    if (topVo.length > 0) {
        document.getElementById('topVoice').innerHTML = topVo.map((entry, i) => {
            const [name, count] = entry;
            return `
                <div class="top-item">
                    <span class="top-rank">${i + 1}</span>
                    ${createAvatar(name)}
                    <span class="top-name">${name}</span>
                    <span class="top-value">${count}</span>
                </div>
            `;
        }).join('');
    }
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