@echo off
setlocal enabledelayedexpansion

chcp 65001 > nul
title Minecraft整合包汉化添加工具

echo.
echo === Minecraft整合包汉化添加工具 ===
echo.

:: 设置颜色
color 0A

:: 获取整合包名称
:input_name
set /p "name=整合包完整名称(Curseforge的名称): "
if "!name!"=="" (
    echo 错误：名称不能为空！
    goto input_name
)

:: 清理文件名（替换特殊字符）
set "clean_name=!name!"
set "clean_name=!clean_name: =_!"
set "clean_name=!clean_name:/=_!"
set "clean_name=!clean_name:\=_!"
set "clean_name=!clean_name::=_!"
set "clean_name=!clean_name:?=_!"
set "clean_name=!clean_name:<=_!"
set "clean_name=!clean_name:>=_!"
set "clean_name=!clean_name:|=_!"
set "clean_name=!clean_name:"=_!"

:: 获取图片URL
:input_img
set /p "img=图片URL: "
if "!img!"=="" (
    echo 错误：图片URL不能为空！
    goto input_img
)

:: 获取汉化版本
:input_i18version
set /p "i18version=汉化版本: "
if "!i18version!"=="" (
    echo 错误：汉化版本不能为空！
    goto input_i18version
)

:: 清理汉化版本字符串
set "clean_i18version=!i18version!"
set "clean_i18version=!clean_i18version: =_!"
set "clean_i18version=!clean_i18version:/=_!"
set "clean_i18version=!clean_i18version:\=_!"
set "clean_i18version=!clean_i18version::=_!"
set "clean_i18version=!clean_i18version:?=_!"
set "clean_i18version=!clean_i18version:<=_!"
set "clean_i18version=!clean_i18version:>=_!"
set "clean_i18version=!clean_i18version:|=_!"
set "clean_i18version=!clean_i18version:"=_!"

:: 获取游戏版本
:input_gversion
set /p "gversion=游戏版本: "
if "!gversion!"=="" (
    echo 错误：游戏版本不能为空！
    goto input_gversion
)

:: 获取汉化团队
:input_i18team
set /p "i18team=汉化团队: "
if "!i18team!"=="" (
    echo 错误：汉化团队不能为空！
    goto input_i18team
)

:: 获取可下载状态
:ask_download
set /p "isdownload=可下载? (y/n): "
if /i "!isdownload!"=="y" (
    set "download=true"
    goto get_zipfile
)
if /i "!isdownload!"=="n" set "download=false" & goto ask_tags
echo 错误：请输入 y 或 n
goto ask_download

:: 获取ZIP文件路径（拖拽功能）
:get_zipfile
echo.
echo 请将ZIP文件拖拽到此处，然后按回车:
set /p "zipfile="
if "!zipfile!"=="" (
    echo 错误：未提供文件路径！
    goto get_zipfile
)

:: 移除路径引号
set "zipfile=!zipfile:"=!"

:: 检查文件是否存在
if not exist "!zipfile!" (
    echo 错误：文件不存在！
    goto get_zipfile
)

:: 检查文件扩展名
if /i not "!zipfile:~-4!"==".zip" (
    echo 错误：文件必须是ZIP格式！
    goto get_zipfile
)

:: 创建下载目录
set "target_dir=down\!clean_name!"
if not exist "!target_dir!\" (
    mkdir "!target_dir!" >nul 2>&1
    if errorlevel 1 (
        echo 错误：无法创建目录 !target_dir!
        pause
        exit /b 1
    )
)

:: 复制并重命名ZIP文件（使用名称+汉化版本格式）
set "target_file=!target_dir!\!clean_name!-!clean_i18version!.zip"
copy /Y "!zipfile!" "!target_file!" >nul
if errorlevel 1 (
    echo 错误：文件复制失败！
    pause
    exit /b 1
)

:: 设置下载路径（名称+汉化版本格式）
set "download_path=!clean_name!/!clean_name!-!clean_i18version!.zip"
echo ✅ 文件已保存到: !target_file!
echo.

:ask_tags
set /p "tags=标签(逗号分隔): "
if "!tags!"=="" (
    echo 错误：标签不能为空！
    goto ask_tags
)


echo.
echo === 添加其他链接信息（可选）===
echo 请输入完整链接，系统将自动提取所需部分
echo.

set /p "curseforge_full=CurseForge 链接: "
set /p "modrinth_full=Modrinth 链接: "
set /p "mcmod_full=MCMod 链接: "
set /p "bilibili_full=Bilibili 用户链接: "
set /p "bilibiliopus_full=Bilibili 专栏链接: "
set /p "bilibilidwvideo_full=Bilibili 视频链接: "
set /p "baidupan_full=百度网盘 链接: "
set /p "github=GitHub 链接: "
set /p "official=官方网站链接: "
set /p "other=其他链接: "

:: 从完整链接中提取所需部分
if not "!curseforge_full!"=="" (
    for %%A in ("!curseforge_full!") do (
        set "last_part=%%~nxA"
        set "curseforge=!last_part:/=!"
    )
)

if not "!modrinth_full!"=="" (
    for %%A in ("!modrinth_full!") do (
        set "last_part=%%~nxA"
        set "modrinth=!last_part:/=!"
    )
)

if not "!mcmod_full!"=="" (
    for %%A in ("!mcmod_full!") do (
        set "last_part=%%~nxA"
        set "mcmod=!last_part:.html=!"
        set "mcmod=!mcmod:/=!"
    )
)

if not "!bilibili_full!"=="" (
    for %%A in ("!bilibili_full!") do (
        set "last_part=%%~nxA"
        set "bilibili=!last_part:/=!"
        set "bilibili=!bilibili:?=!"
    )
)

:: GitHub特殊处理
if not "!github!"=="" (
    set "github=!github:https://github.com/=!"
    set "github=!github:http://github.com/=!"
    set "github=!github:.git=!"
    set "github=!github:/tree/=!"
    set "github=!github:/blob/=!"
    set "github=!github:/raw/=!"
    if "!github:~-1!"=="/" set "github=!github:~0,-1!"
)

:: Bilibili专栏提取
if not "!bilibiliopus_full!"=="" (
    set "bilibiliopus=!bilibiliopus_full!"
    set "bilibiliopus=!bilibiliopus:https://www.bilibili.com/opus/=!"
    set "bilibiliopus=!bilibiliopus:http://www.bilibili.com/opus/=!"
    set "bilibiliopus=!bilibiliopus:https://bilibili.com/opus/=!"
    set "bilibiliopus=!bilibiliopus:http://bilibili.com/opus/=!"
    for /f "delims=?" %%B in ("!bilibiliopus!") do set "bilibiliopus=%%B"
)

:: Bilibili视频提取
if not "!bilibilidwvideo_full!"=="" (
    set "bilibilidwvideo=!bilibilidwvideo_full!"
    set "bilibilidwvideo=!bilibilidwvideo:https://www.bilibili.com/video/=!"
    set "bilibilidwvideo=!bilibilidwvideo:http://www.bilibili.com/video/=!"
    set "bilibilidwvideo=!bilibilidwvideo:https://bilibili.com/video/=!"
    set "bilibilidwvideo=!bilibilidwvideo:http://bilibili.com/video/=!"
    for /f "delims=/" %%B in ("!bilibilidwvideo!") do set "bilibilidwvideo=%%B"
    set "bilibilidwvideo=!bilibilidwvideo:?=!"
)

:: 百度网盘提取 - 优化版本
if not "!baidupan_full!"=="" (
    set "baidupan=!baidupan_full!"
    
    :: 处理标准分享链接格式
    if "!baidupan:s/=!" neq "!baidupan!" (
        set "baidupan=!baidupan:*s/=!"
    )
    
    :: 处理分享初始化链接格式
    if "!baidupan:share/initsurl=!" neq "!baidupan!" (
        set "baidupan=!baidupan:*share/initsurl=!"
    )
    
    :: 移除URL参数分隔符之前的内容
    for /f "delims=#&" %%B in ("!baidupan!") do set "baidupan=%%B"
    
    :: 移除多余参数
    set "baidupan=!baidupan:https:=!"
    set "baidupan=!baidupan:http:=!"
    set "baidupan=!baidupan:pan.baidu.com/=!"
    set "baidupan=!baidupan:?list/path=!"
)

:: 确保目录存在
if not exist "modpacks" (
    mkdir "modpacks" > nul 2>&1
    if errorlevel 1 (
        echo 错误：无法创建 modpacks 目录
        pause
        exit /b 1
    )
)

set "filename=modpacks\!clean_name!.json"

(
    echo {
    echo   "img": "!img!",
    echo   "i18version": "!i18version!",
    echo   "gversion": "!gversion!",
    echo   "i18team": "!i18team!",
    echo   "isdownload": !download!,
    echo   "link": {
) > "!filename!"

:: 添加标签（必需项）
>> "!filename!" echo     "tags": "!tags!" 

:: 添加下载路径（如果可下载）
if !download! equ true (
    >> "!filename!" echo     ,"download": "!download_path!"
)

:: 添加提取后的链接部分
if not "!curseforge!"=="" (
    >> "!filename!" echo     ,"curseforge": "!curseforge!"
)
if not "!modrinth!"=="" (
    >> "!filename!" echo     ,"modrinth": "!modrinth!"
)
if not "!mcmod!"=="" (
    >> "!filename!" echo     ,"mcmod": "!mcmod!"
)
if not "!bilibili!"=="" (
    >> "!filename!" echo     ,"bilibili": "!bilibili!"
)
if not "!bilibiliopus!"=="" (
    >> "!filename!" echo     ,"bilibiliopus": "!bilibiliopus!"
)
if not "!bilibilidwvideo!"=="" (
    >> "!filename!" echo     ,"bilibilidwvideo": "!bilibilidwvideo!"
)
if not "!baidupan!"=="" (
    >> "!filename!" echo     ,"baidupan": "!baidupan!"
)

:: 添加其他链接（完整URL）
if not "!github!"=="" (
    >> "!filename!" echo     ,"github": "!github!"
)
if not "!official!"=="" (
    >> "!filename!" echo     ,"official": "!official!"
)
if not "!other!"=="" (
    >> "!filename!" echo     ,"other": "!other!"
)

>> "!filename!" (
    echo   }
    echo }
)

if not exist "!filename!" (
    echo 错误：文件创建失败
    pause
    exit /b 1
)

echo.
echo ✅ 成功创建文件: !filename!
echo.
echo ⚠️ 下一步操作:
echo 1. 用文本编辑器打开 !filename!
echo 2. 检查并补充链接信息
echo 3. 使用git添加并提交文件
echo    git add "!filename!"
echo    git commit -m "添加新整合包: !name!"
echo    git push
echo.

:: 自动打开文件
where notepad > nul 2>&1 && (
    echo 正在用记事本打开文件...
    timeout /t 2 > nul
    start notepad "!filename!"
)

pause