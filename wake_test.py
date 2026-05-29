import time
import subprocess
import webbrowser
import numpy as np
import sounddevice as sd
from openwakeword.model import Model

aditi_started = False
last_trigger_time = 0
COOLDOWN_SECONDS = 60

PROJECT_PATH = r"C:\Users\Ashutosh\OneDrive\Desktop"
BACKEND_PATH = "C:/Users/Ashutosh/OneDrive/Desktop/Aditi/aiBackend"
FRONTEND_PATH = "C:/Users/Ashutosh/OneDrive/Desktop/Aditi/aiFrontend"
FRONTEND_URL = "http://localhost:5173?voice=true"

model = Model(inference_framework="onnx")

print("Listening for wake word...")
print("Say: hey jarvis")

last_trigger_time = 0

def start_aditi():
    
    print("Starting Aditi...")

    # Start MongoDB
    subprocess.Popen(
        'net start MongoDB',
        shell=True
    )

    time.sleep(2)

    # Start Ollama
    subprocess.Popen(
        'start cmd /k "ollama serve"',
        shell=True
    )

    time.sleep(4)

    # Start backend
    subprocess.Popen(
        f'start cmd /k "cd /d {BACKEND_PATH} && npm run dev"',
        shell=True
    )

    time.sleep(3)

    # Start frontend
    subprocess.Popen(
        f'start cmd /k "cd /d {FRONTEND_PATH} && npm run dev"',
        shell=True
    )

    time.sleep(7)

    # Open Aditi
    webbrowser.open(FRONTEND_URL)



aditi_started = False

def callback(indata, frames, time_info, status):
    global aditi_started

    if aditi_started:
        return

    if status:
        return

    audio = (np.squeeze(indata) * 32767).astype(np.int16)
    prediction = model.predict(audio)

    for wakeword, score in prediction.items():
        if score > 0.3:
            aditi_started = True
            print("Wake word detected!")
            start_aditi()
            return


stream = sd.InputStream(
    channels=1,
    samplerate=16000,
    blocksize=1280,
    dtype="float32",
    latency="low",
    callback=callback
)

with stream:
    while not aditi_started:
        time.sleep(0.1)

print("Aditi started. Wake listener stopped.")
stream = sd.InputStream(
    channels=1,
    samplerate=16000,
    blocksize=1280,
    dtype="float32",
    latency="low",
    callback=callback
)

with stream:
    while True:
        time.sleep(0.1)