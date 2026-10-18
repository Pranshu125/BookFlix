Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\Library"
WshShell.Run """C:\Program Files\nodejs\node.exe"" ""d:\Library\server.js"" --open", 0, False
