from config import db
from datetime import datetime


class Music(db.Model):
    __tablename__ = 'music'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, comment='主键ID')
    title = db.Column(db.String(255), nullable=False, comment='歌曲名称')
    artist = db.Column(db.String(255), nullable=False, comment='歌手名字')
    album = db.Column(db.String(255), nullable=False, comment='专辑名称')
    audio_url = db.Column(db.String(512), nullable=False, comment='音频文件链接')
    cover_url = db.Column(db.String(512), nullable=False, comment='封面图片链接')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment='更新时间'
    )

    # =============== 基础CRUD操作 ===============
    @staticmethod
    def create(title, artist, album, audio_url, cover_url):
        """创建新音乐记录"""
        try:
            if not all([title, artist, album, audio_url, cover_url]):
                raise ValueError("所有必填字段不能为空")

            if not (audio_url.startswith(('http://', 'https://'))):
                raise ValueError("音频链接必须是有效的URL")

            if not (cover_url.startswith(('http://', 'https://'))):
                raise ValueError("封面链接必须是有效的URL")

            music = Music(
                title=title,
                artist=artist,
                album=album,
                audio_url=audio_url,
                cover_url=cover_url
            )

            db.session.add(music)
            db.session.commit()  # 确保提交
            return music

        except Exception as e:
            db.session.rollback()  # 出错时回滚
            print(f"创建音乐记录失败: {str(e)}")  # 添加日志
            raise e

    @staticmethod
    def get_all():
        """获取所有音乐"""
        return Music.query.order_by(Music.created_at.desc()).all()

    @staticmethod
    def get_by_id(music_id):
        """通过ID获取音乐"""
        return Music.query.get(music_id)

    @staticmethod
    def update(music_id, **kwargs):
        """更新音乐信息"""
        music = Music.query.get(music_id)
        if not music:
            return None

        for key, value in kwargs.items():
            if hasattr(music, key):
                setattr(music, key, value)

        try:
            db.session.commit()
            return music
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete(music_id):
        """删除音乐记录"""
        music = Music.query.get(music_id)
        if music:
            db.session.delete(music)
            try:
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                raise e
        return False

    # =============== 业务方法 ===============
    @staticmethod
    def search(query, page=1, per_page=20):
        """搜索音乐（支持分页）"""
        return Music.query.filter(
            (Music.title.ilike(f'%{query}%')) |
            (Music.artist.ilike(f'%{query}%')) |
            (Music.album.ilike(f'%{query}%'))
        ).order_by(Music.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

    @staticmethod
    def get_recent(limit=10):
        """获取最近添加的音乐"""
        return Music.query.order_by(Music.created_at.desc()).limit(limit).all()

    # =============== 辅助方法 ===============
    def to_dict(self):
        """将模型转换为字典（用于JSON响应）"""
        return {
            'id': self.id,
            'title': self.title,
            'artist': self.artist,
            'album': self.album,
            'audio_url': self.audio_url,
            'cover_url': self.cover_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

