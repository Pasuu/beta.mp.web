@echo off
setlocal enabledelayedexpansion

chcp 65001 > nul
title Minecraft整合包汉化更新工具

echo.
echo === Minecraft整合包汉化更新工具 ===
echo.

:: 设置颜色
color 0A

:: 检查modpacks目录是否存在
if not exist "modpacks\" (
    echo 错误：未找到 modpacks 目录！
    pause
    exit /b 1
)

:: 列出所有整合包
echo 可更新的整合包列表:
echo.
set count=0
for %%f in ("modpacks\*.json") do (
    set /a count+=1
    
    :: 获取文件名并正确处理特殊字符
    set "full_path=%%f"
    set "name=%%~nf"
    
    set "file[!count!]=!full_path!"
    set "name[!count!]=!name!"
    
    echo [!count!] !name!
)
echo.

:: 检查是否有整合包
if !count! equ 0 (
    echo 错误：未找到任何整合包！
    pause
    exit /b 1
)

:: 选择要更新的整合包
:select_pack
set /p "input=请输入整合包序号或名称: "
if "!input!"=="" (
    echo 错误：输入不能为空！
    goto select_pack
)

:: 尝试匹配序号
set /a selection=!input! 2>nul
if not errorlevel 1 (
    if !selection! geq 1 if !selection! leq !count! (
        set "filename=!file[%selection%]!"
        set "packname=!name[%selection%]!"
        goto selected
    )
)

:: 尝试匹配名称（完全重写的安全匹配逻辑）
set match_count=0

:: 遍历所有整合包
for /l %%i in (1,1,!count!) do (
    set "name=!name[%%i]!"
    
    :: 安全检查匹配（避免特殊字符问题）
    call :safe_contains "!name!" "!input!" result
    
    if "!result!"=="1" (
        set /a match_count+=1
        set "match[!match_count!]=%%i"
        echo [匹配!match_count!] !name!
    )
)

:: 处理匹配结果
if !match_count! equ 0 (
    echo 错误：未找到匹配的整合包！
    goto select_pack
)

if !match_count! equ 1 (
    set selection=!match[1]!
    set "filename=!file[%selection%]!"
    set "packname=!name[%selection%]!"
    goto selected
)

:: 多个匹配时让用户选择
echo.
:select_match
set /p "match_selection=请选择匹配项序号 (1-!match_count!): "
if "!match_selection!"=="" goto select_match

:: 验证输入是否为数字
set "clean_selection=!match_selection: =!"
for /f "delims=0123456789" %%c in ("!clean_selection!") do (
    echo 错误：请输入数字序号！
    goto select_match
)

set /a num=!clean_selection! 2>nul
if !num! lss 1 (
    echo 错误：序号不能小于1！
    goto select_match
)
if !num! gtr !match_count! (
    echo 错误：序号不能大于!match_count!！
    goto select_match
)

set selection=!match[%num%]!
set "filename=!file[%selection%]!"
set "packname=!name[%selection%]!"

:selected
:: 提取当前汉化版本
set "current_version="
for /f "usebackq tokens=1,2 delims=:," %%a in ("!filename!") do (
    set "key=%%a"
    set "key=!key:"=!"
    set "key=!key: =!"
    if "!key!"=="i18version" (
        set "value=%%b"
        set "value=!value:"=!"
        set "value=!value: =!"
        set "current_version=!value!"
    )
)

echo.
echo 已选择: !packname!
echo 当前汉化版本: !current_version!
echo.

:: 获取新的汉化版本
:input_new_version
set /p "new_version=请输入新的汉化版本: "
if "!new_version!"=="" (
    echo 错误：汉化版本不能为空！
    goto input_new_version
)

:: 清理汉化版本字符串
set "clean_new_version=!new_version!"
set "clean_new_version=!clean_new_version: =_!"
set "clean_new_version=!clean_new_version:/=_!"
set "clean_new_version=!clean_new_version:\=_!"
set "clean_new_version=!clean_new_version::=_!"
set "clean_new_version=!clean_new_version:?=_!"
set "clean_new_version=!clean_new_version:<=_!"
set "clean_new_version=!clean_new_version:>=_!"
set "clean_new_version=!clean_new_version:|=_!"
set "clean_new_version=!clean_new_version:"=_!"

:: 询问是否提供新的压缩包
:ask_new_zip
set /p "new_zip=是否提供新的汉化压缩包? (y/n): "
if /i "!new_zip!"=="y" goto get_new_zip
if /i "!new_zip!"=="n" set "new_zip_file=" & goto update_json
echo 错误：请输入 y 或 n
goto ask_new_zip

:: 获取新的ZIP文件
:get_new_zip
echo.
echo 请将新的ZIP文件拖拽到此处，然后按回车:
set /p "new_zip_file="
if "!new_zip_file!"=="" (
    echo 错误：未提供文件路径！
    goto get_new_zip
)

:: 移除路径引号
set "new_zip_file=!new_zip_file:"=!"

:: 检查文件是否存在
if not exist "!new_zip_file!" (
    echo 错误：文件不存在！
    goto get_new_zip
)

:: 检查文件扩展名
if /i not "!new_zip_file:~-4!"==".zip" (
    echo 错误：文件必须是ZIP格式！
    goto get_new_zip
)

:: 读取JSON文件获取原下载路径
set "old_download_path="
for /f "usebackq tokens=1,2 delims=:," %%a in ("!filename!") do (
    set "key=%%a"
    set "key=!key:"=!"
    set "key=!key: =!"
    if "!key!"=="download" (
        set "value=%%b"
        set "value=!value:"=!"
        set "value=!value: =!"
        set "old_download_path=!value!"
    )
)

:: 确定下载目录和文件名
set "target_dir=down\!packname!"
set "target_file=!packname!-!clean_new_version!.zip"

:: 如果原JSON中有download路径，使用相同的目录
if not "!old_download_path!"=="" (
    :: 提取目录部分（去掉文件名）
    for /f "delims=/" %%d in ("!old_download_path!") do set "dir_name=%%d"
    set "target_dir=down\!dir_name!"
)

:: 创建目录
if not exist "!target_dir!\" (
    mkdir "!target_dir!" >nul 2>&1
    if errorlevel 1 (
        echo 错误：无法创建目录 !target_dir!
        echo 请确保目录路径有效且没有特殊字符
        pause
        exit /b 1
    )
)

:: 复制文件
set "target_path=!target_dir!\!target_file!"
copy /Y "!new_zip_file!" "!target_path!" >nul
if errorlevel 1 (
    echo 错误：文件复制失败！
    echo 源文件: !new_zip_file!
    echo 目标文件: !target_path!
    pause
    exit /b 1
)

:: 设置新的下载路径（相对路径）
set "new_download_path=!target_dir:down\=!\!target_file!"
set "new_download_path=!new_download_path:\=/!"

echo.
echo ✅ 新文件已保存到: !target_path!
echo 新的下载路径: !new_download_path!
echo.

:: 更新JSON文件
:update_json
echo 正在更新JSON文件...
echo.

:: 创建临时文件
set "temp_file=%temp%\%~n0_temp.json"
del "%temp_file%" 2>nul

:: 安全更新JSON内容
(
    for /f "usebackq delims=" %%a in ("!filename!") do (
        set "line=%%a"
        set "modified=0"
        
        :: 安全更新汉化版本
        echo "%%a" | findstr /c:"\"i18version\"" >nul
        if !errorlevel! equ 0 (
            echo   "i18version": "!new_version!",
            set "modified=1"
        )
        
        :: 安全更新下载路径
        if not "!new_zip_file!"=="" (
            echo "%%a" | findstr /c:"\"download\"" >nul
            if !errorlevel! equ 0 (
                echo     "download": "!new_download_path!",
                set "modified=1"
            )
        )
        
        :: 输出未修改的行
        if !modified! equ 0 echo %%a
    )
) > "%temp_file%"

:: 替换原文件
move /Y "%temp_file%" "!filename!" >nul
if errorlevel 1 (
    echo 错误：更新文件失败！
    pause
    exit /b 1
)

echo ✅ 成功更新整合包: !packname!
echo 新的汉化版本: !new_version!
if not "!new_zip_file!"=="" echo 新的下载路径: !new_download_path!
echo.

:: 自动打开文件
where notepad > nul 2>&1 && (
    echo 正在用记事本打开文件...
    timeout /t 2 > nul
    start notepad "!filename!"
)

pause
exit /b

:: 安全检查字符串包含关系（避免特殊字符问题）
:safe_contains
setlocal
set "str=%~1"
set "sub=%~2"
set "result=0"

:: 使用临时文件避免特殊字符问题
set "temp_file=%temp%\%~n0_safe_contains.tmp"
echo !str! > "!temp_file!"
findstr /i /c:"!sub!" "!temp_file!" >nul
if !errorlevel! equ 0 set result=1
del "!temp_file!" >nul 2>&1

endlocal & set "%~3=%result%"
exit /b