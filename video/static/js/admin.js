document.addEventListener('DOMContentLoaded', function() {
    // 加载音乐列表
    loadMusicList();

    // 表单提交处理
    document.getElementById('song-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMusic();
    });

    // 封面图片加载预览
    document.getElementById('load-cover-btn').addEventListener('click', function() {
        const url = document.getElementById('song-cover').value;
        if (url) {
            document.getElementById('cover-preview').innerHTML =
                `<img src="${url}" alt="封面预览" style="max-width: 200px; max-height: 200px;">`;
        }
    });
    // 重置按钮事件
    document.getElementById('reset-btn').addEventListener('click', resetForm);
});

// 加载音乐列表
// function loadMusicList() {
//     fetch('/api/music')
//         .then(response => response.json())
//         .then(data => {
//             const tbody = document.getElementById('song-table-body');
//             tbody.innerHTML = '';
//
//             data.data.forEach(music => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td><img src="${music.cover_url}" width="50" height="50"></td>
//                     <td>${music.title}</td>
//                     <td>${music.artist}</td>
//                     <td>${music.album}</td>
//                     <td>
//                         <button class="btn-edit" data-id="${music.id}">编辑</button>
//                         <button class="btn-delete" data-id="${music.id}">删除</button>
//                     </td>
//                 `;
//                 tbody.appendChild(row);
//             });
//
//             // 添加编辑/删除事件
//             document.querySelectorAll('.btn-edit').forEach(btn => {
//                 btn.addEventListener('click', function() {
//                     editMusic(this.dataset.id);
//                 });
//             });
//
//             document.querySelectorAll('.btn-delete').forEach(btn => {
//                 btn.addEventListener('click', function() {
//                     deleteMusic(this.dataset.id);
//                 });
//             });
//         });
// }
// 加载音乐列表
function loadMusicList() {
    fetch('/api/music')
        .then(response => {
            if (!response.ok) {
                throw new Error('获取音乐列表失败');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('song-table-body');
            tbody.innerHTML = '';

            if (data.success && data.data) {
                data.data.forEach(music => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><img src="${music.cover_url}" width="50" height="50" class="cover-thumb"></td>
                        <td>${music.title}</td>
                        <td>${music.artist}</td>
                        <td>${music.album}</td>
                        <td class="actions">
                            <button class="btn btn-edit" data-id="${music.id}">编辑</button>
                            <button class="btn btn-danger" data-id="${music.id}">删除</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // 添加事件监听
                addEventListeners();
            }
        })
        .catch(error => {
            console.error('加载音乐列表错误:', error);
            alert(`加载音乐列表失败: ${error.message}`);
        });
}

// 添加事件监听
function addEventListeners() {
    // 编辑按钮
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editMusic(this.dataset.id);
        });
    });

    // 删除按钮
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteMusic(this.dataset.id);
        });
    });
}

// 保存音乐
async function saveMusic() {
    const musicId = document.getElementById('music-id')?.value;
    const url = musicId ? `/api/music/${musicId}` : '/api/music';
    const method = musicId ? 'PUT' : 'POST';

    const formData = {
        title: document.getElementById('song-title').value,
        artist: document.getElementById('song-artist').value,
        album: document.getElementById('song-album').value,
        audio_url: document.getElementById('song-audio').value,
        cover_url: document.getElementById('song-cover').value
    };

    console.log('准备发送的数据:', formData);  // 调试信息

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('服务器响应:', result);  // 调试信息

        if (!response.ok) {
            throw new Error(result.message || '服务器返回错误状态');
        }

        if (result.success) {
            alert(musicId ? '更新成功' : '保存成功');
            loadMusicList();
            resetForm();
        } else {
            throw new Error(result.message || '操作失败');
        }
    } catch (error) {
        console.error('保存错误:', error);
        alert(`操作失败: ${error.message}`);
    }
}


// 编辑音乐
function editMusic(id) {
    fetch(`/api/music/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取音乐信息失败');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const music = data.data;
                document.getElementById('song-title').value = music.title;
                document.getElementById('song-artist').value = music.artist;
                document.getElementById('song-album').value = music.album;
                document.getElementById('song-audio').value = music.audio_url;
                document.getElementById('song-cover').value = music.cover_url;

                // 设置封面预览
                if (music.cover_url) {
                    document.getElementById('cover-preview').innerHTML =
                        `<img src="${music.cover_url}" alt="封面预览" style="max-width: 200px; max-height: 200px;">`;
                }

                // 添加隐藏字段保存ID
                let idField = document.getElementById('music-id');
                if (!idField) {
                    idField = document.createElement('input');
                    idField.type = 'hidden';
                    idField.id = 'music-id';
                    document.getElementById('song-form').appendChild(idField);
                }
                idField.value = music.id;

                // 滚动到表单
                document.querySelector('.song-form').scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error('编辑音乐错误:', error);
            alert(`获取音乐信息失败: ${error.message}`);
        });
}


// 删除音乐
function deleteMusic(id) {
    if (confirm('确定要删除这首歌曲吗？')) {
        fetch(`/api/music/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadMusicList();
                resetForm();
            } else {
                throw new Error(data.message || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除错误:', error);
            alert(`删除失败: ${error.message}`);
        });
    }
}

// 重置表单
function resetForm() {
    document.getElementById('song-form').reset();
    document.getElementById('cover-preview').innerHTML = '<span>封面预览</span>';
    const idField = document.getElementById('music-id');
    if (idField) {
        idField.remove();
    }
}

// 监听歌词文件选择
document.getElementById('song-lyrics').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('lyrics-file-info').textContent = `已选择: ${file.name}`;
    } else {
        document.getElementById('lyrics-file-info').textContent = '';
    }
});