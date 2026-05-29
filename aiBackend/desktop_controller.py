import sys
import subprocess
import webbrowser
import pyautogui
import os
import urllib.parse
import time

action = sys.argv[1].lower() if len(sys.argv) > 1 else ""
target = sys.argv[2].lower() if len(sys.argv) > 2 else ""

def app_process_name(target):
    if "chrome" in target:
        return "chrome.exe"
    if "notepad" in target:
        return "notepad.exe"
    if "vs code" in target or "vscode" in target or "visual studio code" in target:
        return "Code.exe"
    return None

if action == "open_app":
    if "notepad" in target:
        subprocess.Popen("notepad.exe")
        print("Opened Notepad")

    elif "chrome" in target:
        subprocess.Popen("chrome.exe")
        print("Opened Chrome")

    elif "vs code" in target or "vscode" in target or "visual studio code" in target:
        subprocess.Popen("code", shell=True)
        print("Opened VS Code")

    else:
        print("App not allowed")

elif action == "close_app":
    process = app_process_name(target)

    if process:
        subprocess.run(f"taskkill /f /im {process}", shell=True)
        print(f"Closed {target}")
    else:
        print("App not allowed to close")

elif action == "close_tab":
    pyautogui.hotkey("ctrl", "w")
    print("Closed current tab")

elif action == "close_window":
    pyautogui.hotkey("alt", "f4")
    print("Closed current window")

elif action == "open_website":
    if "youtube" in target:
        webbrowser.open("https://youtube.com")
        print("Opened YouTube")

    elif "google" in target:
        webbrowser.open("https://google.com")
        print("Opened Google")

    else:
        webbrowser.open("https://" + target)
        print(f"Opened {target}")

elif action == "search_google":
    query = urllib.parse.quote(target)
    webbrowser.open(f"https://www.google.com/search?q={query}")
    print(f"Searched Google for {target}")

elif action == "search_youtube":
    query = urllib.parse.quote(target)
    webbrowser.open(f"https://www.youtube.com/results?search_query={query}")

    time.sleep(5)

    pyautogui.press("tab", presses=57, interval=0.1)
    pyautogui.press("enter")

    print(f"Playing YouTube result for {target}")

elif action == "screenshot":
    screenshot = pyautogui.screenshot()
    path = os.path.join(os.getcwd(), "screenshot.png")
    screenshot.save(path)
    print("Screenshot saved")

elif action == "volume_up":
    pyautogui.press("volumeup", presses=5)
    print("Volume increased")

elif action == "volume_down":
    pyautogui.press("volumedown", presses=5)
    print("Volume decreased")

elif action == "mute":
    pyautogui.press("volumemute")
    print("Muted")

else:
    print("Unknown action")