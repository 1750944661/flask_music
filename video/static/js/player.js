document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');
    const progressBar = document.querySelector('.progress-bar');
    const progressKnob = document.getElementById('progress-knob');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeControl = document.getElementById('volume');
    const cover = document.getElementById('cover');
    const songTitle = document.getElementById('song-title');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const musicPlayer = document.querySelector('.music-player');
    const libraryList = document.getElementById('library-list');
    const searchInput = document.getElementById('search-input');

    let songs = [];
    let currentSongIndex = 0;

    // 从服务器获取歌曲列表
    fetch('/api/songs')
        .then(response => {
            if (!response.ok) {
                throw new Error('获取歌曲列表失败');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                songs = data.data;
                if (songs.length > 0) {
                    loadSong(currentSongIndex);
                    renderLibrary(songs); // 渲染曲库列表
                } else {
                    // 没有歌曲时的处理
                    songTitle.textContent = "没有可播放的歌曲";
                    artist.textContent = "";
                    album.textContent = "";
                    libraryList.innerHTML = '<div class="empty-library">曲库中没有歌曲</div>';
                }
            }
        })
        .catch(error => {
            console.error('获取歌曲列表错误:', error);
            songTitle.textContent = "加载歌曲失败";
            artist.textContent = error.message;
            libraryList.innerHTML = '<div class="empty-library">加载曲库失败</div>';
        });

    // 渲染曲库列表
    function renderLibrary(songList) {
        libraryList.innerHTML = '';

        if (songList.length === 0) {
            libraryList.innerHTML = '<div class="empty-library">没有找到匹配的歌曲</div>';
            return;
        }

        songList.forEach((song, index) => {
            const libraryItem = document.createElement('div');
            libraryItem.className = `library-item ${index === currentSongIndex ? 'playing' : ''}`;
            libraryItem.dataset.index = index;

            libraryItem.innerHTML = `
                <div class="item-cover">
                    <img src="${song.coverUrl}" alt="${song.title}">
                </div>
                <div class="item-info">
                    <h3>${song.title}</h3>
                    <p>${song.artist} - ${song.album}</p>
                </div>
            `;

            libraryItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                audio.play()
                    .then(() => {
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        musicPlayer.classList.add('playing');
                        updateLibraryHighlight(); // 更新高亮显示
                    })
                    .catch(e => console.error('播放失败:', e));
            });

            libraryList.appendChild(libraryItem);
        });
    }

    // 更新曲库中当前播放歌曲的高亮显示
    function updateLibraryHighlight() {
        const items = document.querySelectorAll('.library-item');
        items.forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    }

    // 搜索功能
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredSongs = songs.filter(song =>
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm) ||
            song.album.toLowerCase().includes(searchTerm)
        );
        renderLibrary(filteredSongs);
    });

    // 加载歌曲
    function loadSong(index) {
        const song = songs[index];
        audio.src = song.audioUrl;
        cover.src = song.coverUrl;
        songTitle.textContent = song.title;
        artist.textContent = song.artist;
        album.textContent = song.album;

        // 重置播放状态
        audio.load();
        if (musicPlayer.classList.contains('playing')) {
            audio.play().catch(e => console.error('播放失败:', e));
        }

        // 更新曲库高亮
        updateLibraryHighlight();
    }

    // 播放/暂停
    function togglePlay() {
        if (audio.paused) {
            audio.play()
                .then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicPlayer.classList.add('playing');
                })
                .catch(e => {
                    console.error('播放失败:', e);
                    alert('播放失败: ' + e.message);
                });
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            musicPlayer.classList.remove('playing');
        }
    }

    // 更新进度条
    function updateProgress() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        progressKnob.style.left = `${progressPercent}%`;

        // 更新时间显示
        currentTimeEl.textContent = formatTime(currentTime);
    }

    // 设置进度
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 上一首
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(currentSongIndex);
        audio.play()
            .then(() => {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                musicPlayer.classList.add('playing');
            })
            .catch(e => console.error('播放失败:', e));
    }

    // 下一首
    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex > songs.length - 1) {
            currentSongIndex = 0;
        }
        loadSong(currentSongIndex);
        audio.play()
            .then(() => {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                musicPlayer.classList.add('playing');
            })
            .catch(e => console.error('播放失败:', e));
    }
    
    // 设置音量
    function setVolume() {
        audio.volume = this.value;
    }
    
    // 事件监听
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', function() {
        durationEl.textContent = formatTime(audio.duration);
    });
    progressBar.addEventListener('click', setProgress);
    volumeControl.addEventListener('input', setVolume);
    
    // 拖动进度条
    let isDragging = false;
    
    progressKnob.addEventListener('mousedown', () => {
        isDragging = true;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const progressRect = progressBar.getBoundingClientRect();
            let clickX = e.clientX - progressRect.left;
            clickX = Math.max(0, Math.min(clickX, progressRect.width));
            const progressPercent = (clickX / progressRect.width) * 100;
            progress.style.width = `${progressPercent}%`;
            progressKnob.style.left = `${progressPercent}%`;
            
            const duration = audio.duration;
            audio.currentTime = (clickX / progressRect.width) * duration;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});