from flask import Blueprint, render_template, redirect, url_for, session, request, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import db
from models.user_model import User
from models.music_model import Music


admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # 使用SQLAlchemy查询用户
        user = User.query.filter_by(username=username).first()
        print(user)

        if user and user.check_password(password):
            # 登录成功，设置session
            session['user'] = {
                'id': user.id,
                'username': user.username,
                'is_admin': user.is_admin
            }
            flash('登录成功', 'success')
            return redirect(url_for('admin.dashboard'))  # 假设有一个dashboard路由
        else:
            flash('用户名或密码错误', 'error')
            return redirect(url_for('admin.login'))  # 登录失败重定向回登录页

    return render_template('login.html') # 确保这行存在且不被前面的条件分支跳过




@admin_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        print(username)
        print(email)
        print(password)
        print(confirm_password)
        if password != confirm_password:
            flash('两次输入的密码不一致', 'error')
            return redirect(url_for('admin.register'))

        if User.query.filter_by(username=username).first():
            flash(f'用户名 "{username}" 已存在', 'error')
            return redirect(url_for('admin.register'))

        if User.query.filter_by(email=email).first():
            flash(f'邮箱 "{email}" 已被注册', 'error')
            return redirect(url_for('admin.register'))

        try:
            new_user = User(
                username=username,
                email=email,
                is_admin=False
            )
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            flash('注册成功，请登录', 'success')
            print(f"注册数据: {username}, {email}, {password}")
            return redirect(url_for('admin.login'))
        except Exception as e:
            db.session.rollback()  # 回滚会话
            flash('注册失败，请重试', 'error')
            print(f"注册错误: {e}")
            return redirect(url_for('admin.register'))

    return render_template('register.html')


@admin_bp.route('/logout')
def logout():
    """处理管理员登出"""
    session.pop('user', None)
    flash('您已成功退出登录', 'info')
    return redirect(url_for('admin.login'))

@admin_bp.route('/dashboard')
def dashboard():
    if 'user' not in session:
        flash('请先登录', 'error')
        return redirect(url_for('admin.login'))
    return render_template('music.html')

@admin_bp.route('/admin')
def admin():
    if 'user' not in session:
        flash('请先登录', 'error')
        return redirect(url_for('admin.login'))
    return render_template('admin.html')


@admin_bp.route('/api/music', methods=['GET'])
def api_get_music():
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未授权'}), 401

    music_list = Music.get_all()
    return jsonify({
        'success': True,
        'data': [music.to_dict() for music in music_list]
    })

@admin_bp.route('/api/music', methods=['POST'])
def api_create_music():
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未授权'}), 401

    data = request.get_json()
    try:
        music = Music.create(
            title=data.get('title'),
            artist=data.get('artist'),
            album=data.get('album'),
            audio_url=data.get('audio_url'),
            cover_url=data.get('cover_url')
        )
        return jsonify({'success': True, 'data': music.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@admin_bp.route('/admin/music', methods=['GET', 'POST'])
def music_management():
    if 'user' not in session:
        flash('请先登录', 'error')
        return redirect(url_for('admin.login'))

    if request.method == 'POST':
        try:
            # 处理表单数据
            title = request.form.get('title')
            artist = request.form.get('artist')
            album = request.form.get('album')
            audio_url = request.form.get('audio_url')
            cover_url = request.form.get('cover_url')

            # 创建音乐记录（不需要处理歌词文件）
            music = Music.create(
                title=title,
                artist=artist,
                album=album,
                audio_url=audio_url,
                cover_url=cover_url
            )

            flash('歌曲保存成功', 'success')
            return redirect(url_for('admin.music_management'))
        except Exception as e:
            db.session.rollback()
            flash(f'保存失败: {str(e)}', 'error')
            return redirect(url_for('admin.music_management'))

    # GET请求时显示音乐列表
    music_list = Music.get_all()
    return render_template('admin.html', music_list=music_list)


# 添加获取单个音乐的API
@admin_bp.route('/api/music/<int:music_id>', methods=['GET'])
def api_get_single_music(music_id):
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未授权'}), 401

    music = Music.get_by_id(music_id)
    if music:
        return jsonify({'success': True, 'data': music.to_dict()})
    else:
        return jsonify({'success': False, 'message': '歌曲不存在'}), 404


# 添加更新音乐的API
@admin_bp.route('/api/music/<int:music_id>', methods=['PUT'])
def api_update_music(music_id):
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未授权'}), 401

    data = request.get_json()
    try:
        music = Music.update(
            music_id,
            title=data.get('title'),
            artist=data.get('artist'),
            album=data.get('album'),
            audio_url=data.get('audio_url'),
            cover_url=data.get('cover_url')
        )
        if music:
            return jsonify({'success': True, 'data': music.to_dict()})
        else:
            return jsonify({'success': False, 'message': '歌曲不存在'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400


# 添加删除音乐的API
@admin_bp.route('/api/music/<int:music_id>', methods=['DELETE'])
def api_delete_music(music_id):
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未授权'}), 401

    success = Music.delete(music_id)
    return jsonify({'success': success})

@admin_bp.route('/api/songs')
def get_songs():
    music_list = Music.get_all()
    return jsonify({
        'success': True,
        'data': [{
            'id': music.id,
            'title': music.title,
            'artist': music.artist,
            'album': music.album,
            'audioUrl': music.audio_url,
            'coverUrl': music.cover_url
        } for music in music_list]
    })