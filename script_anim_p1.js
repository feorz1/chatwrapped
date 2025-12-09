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