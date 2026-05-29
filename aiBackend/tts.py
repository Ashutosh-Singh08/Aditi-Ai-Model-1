import sys
import asyncio
import edge_tts
import os

text = sys.argv[1]

VOICE = "en-US-AriaNeural"

os.makedirs("audio", exist_ok=True)

async def main():
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save("audio/output.mp3")

asyncio.run(main())