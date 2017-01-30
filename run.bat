@ECHO OFF
SET NODE_PATH=%CD%\tools\node_modules
SET NODE="%CD%/tools/node.exe"
%NODE% ./app.js
echo %NODE_PATH%
pause