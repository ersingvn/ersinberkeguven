' Opens the blog writing app with no console window.
' The background server stops by itself when the app window is closed.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)

args = ""
For Each a In WScript.Arguments
  args = args & " " & a
Next

sh.CurrentDirectory = folder
' 0 = hidden window, False = don't wait
sh.Run "node """ & folder & "\scripts\editor\server.mjs""" & args, 0, False
