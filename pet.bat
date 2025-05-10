@echo off
setlocal EnableDelayedExpansion

REM Number of days to go back
set DAYS=30

REM Create working folder
set WORK_DIR=svg
mkdir %WORK_DIR% 2>nul

REM Sample file names
set FILE_NAMES=logo icon graph chart about contact index resume

REM Loop through days
for /L %%D in (%DAYS%,-1,1) do (
    REM Generate a past date in correct format
    for /f %%T in ('powershell -command "(Get-Date).AddDays(-%%D).ToString(\"yyyy-MM-dd HH:mm:ss\")"') do (
        set COMMIT_DATE=%%T
    )

    REM Pick a random file name
    set FILE_NAME=file!RANDOM!
    for %%N in (%FILE_NAMES%) do (
        if !RANDOM! lss 1000 (
            set FILE_NAME=%%N
        )
    )

    REM Alternate file types
    set /a MOD=%%D %% 2
    if !MOD! == 0 (
        set EXT=svg
        echo ^<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"^>^<circle cx="50" cy="50" r="40" fill="red"/^>^</svg^> > %WORK_DIR%\!FILE_NAME!.svg
    ) else (
        set EXT=html
        echo ^<!DOCTYPE html^>^<html^><head^><title^>!FILE_NAME!^</title^></head^><body^>!FILE_NAME! page^</body^></html^> > %WORK_DIR%\!FILE_NAME!.html
    )

    REM Stage and commit the file with backdate
    git add .
    call set GIT_AUTHOR_DATE=!COMMIT_DATE!
    call set GIT_COMMITTER_DATE=!COMMIT_DATE!
    call git commit -m "Add !FILE_NAME!.!EXT!" --date="!COMMIT_DATE!"

    REM Randomly delete file and commit the removal
    if !RANDOM! lss 10000 (
        del %WORK_DIR%\!FILE_NAME!.!EXT!
        git add .
        call git commit -m "Remove !FILE_NAME!.!EXT!" --date="!COMMIT_DATE!"
    )
)

echo All done!
