# 音乐管理系统后端文档

## 项目概述

这是一个基于Flask框架开发的音乐管理系统后端，提供完整的音乐资源管理和用户认证功能。系统支持音乐上传、管理、搜索以及用户注册登录等功能。

## 技术栈

-   **后端框架**: Flask 2.x
    
-   **数据库**: SQLAlchemy (支持多种数据库)
    
-   **用户认证**: Flask-Login
    
-   **密码加密**: Werkzeug Security
    
-   **API格式**: JSON
- 
 ## 项目结构

text

项目根目录/
├── app.py                 # 应用入口文件
├── config.py             # 配置文件
├── models/               # 数据模型
│   ├── music_model.py    # 音乐数据模型
│   └── user_model.py     # 用户数据模型
├── views/                # 视图模块
│   └── admin_view.py     # 管理员视图
└── templates/            # 前端模板文件(未包含在此代码中)

## 数据库模型

## 1.音乐表

| 字段名 | 类型 | 说明 |
|---------|------|------|
| `id` | Integer | 主键ID，自增 |
| `title` | String(255) | 歌曲名称，非空 |
| `artist` | String(255) | 歌手名字，非空 |
| `album` | String(255) | 专辑名称，非空| 
| `audio_url` | String(512) | 音频文件链接，非空 |
| `cover_url` | String(512) | 封面图片链接，非空 |
| `created_at` | BEpusdt多链 | 创建时间，默认当前时间 |
| `updated_at` | DateTime | 更新时间，自动更新 |

##  2. 用户表

| 字段名 | 类型 | 说明 |
|---------|------|------|
| `id` | Integer | 主键ID，自增 |
| `username` | String(80) | 用户名，唯一，非空 |
| `email` | String(120) | 邮箱，唯一，非空 |
| `password_hash` | String(255) | 密码哈希值| 
| `is_admin` | Boolean | 是否为管理员，默认False |
| `created_at` | DateTime | 创建时间，默认当前时间 |

## API接口文档

### 认证相关接口

#### 1. 用户登录

-   **端点**: POST /admin/
    
-   **功能**: 用户登录
    
-   **参数**:
    
    -   username: 用户名
        
    -   password: 密码
        
-   **响应**: 登录成功重定向到仪表板，失败返回错误信息
    

#### 2. 用户注册

-   **端点**: POST /admin/register
    
-   **功能**: 用户注册
    
-   **参数**:
    
    -   username: 用户名
        
    -   email: 邮箱
        
    -   password: 密码
        
    -   confirm_password: 确认密码
        
-   **响应**: 注册成功重定向到登录页，失败返回错误信息
    

#### 3. 用户登出

-   **端点**: GET /admin/logout
    
-   **功能**: 用户登出
    
-   **响应**: 清除session并重定向到登录页
    

### 音乐管理接口

#### 1. 获取所有音乐

-   **端点**: GET /api/music
    
-   **权限**: 需要登录
    
-   **响应**: 返回所有音乐信息的JSON数组
    

#### 2. 创建音乐

-   **端点**: POST /api/music
    
-   **权限**: 需要登录
    
-   **参数** (JSON格式):
    
    -   title: 歌曲名称
        
    -   artist: 歌手名字
        
    -   album: 专辑名称
        
    -   audio_url: 音频文件链接
        
    -   cover_url: 封面图片链接
        
-   **响应**: 返回创建的音乐信息或错误信息
    

#### 3. 获取单个音乐

-   **端点**: GET /api/music/<music_id>
    
-   **权限**: 需要登录
    
-   **响应**: 返回指定ID的音乐信息
    

#### 4. 更新音乐

-   **端点**: PUT /api/music/<music_id>
    
-   **权限**: 需要登录
    
-   **参数** (JSON格式):
    
    -   title: 歌曲名称(可选)
        
    -   artist: 歌手名字(可选)
        
    -   album: 专辑名称(可选)
        
    -   audio_url: 音频文件链接(可选)
        
    -   cover_url: 封面图片链接(可选)
        
-   **响应**: 返回更新后的音乐信息或错误信息
    

#### 5. 删除音乐

-   **端点**: DELETE /api/music/<music_id>
    
-   **权限**: 需要登录
    
-   **响应**: 返回操作结果
    

#### 6. 搜索音乐

-   **端点**: 通过Music模型的search方法实现
    
-   **功能**: 支持按标题、歌手或专辑名称搜索
    
-   **参数**:
    
    -   query: 搜索关键词
        
    -   page: 页码(默认1)
        
    -   per_page: 每页数量(默认20)
    

## 使用说明

1.  首次使用需要注册管理员账户
    
2.  访问 `/admin/register` 注册账户
    
3.  登录后可以访问管理界面 `/admin/dashboard`
    
4.  通过管理界面可以添加、编辑、删除音乐资源
    
5.  所有API接口需要先登录才能访问

