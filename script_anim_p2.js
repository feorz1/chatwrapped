
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