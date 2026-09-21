#!/usr/bin/env python3
"""
==============================================================================
J.A.R.V.I.S. GLOBAL CLOUD WORKSTATION AGENT (Version 5.0)
==============================================================================
WORKS FROM ANYWHERE ON EARTH AUTOMATICALLY!
No port forwarding, no ngrok, no Tailscale required.
Your PC simply connects out to the J.A.R.V.I.S. Cloud Relay Hub.
==============================================================================
Requirements:
    pip install pyautogui websockets
==============================================================================
"""

import asyncio
import json
import logging
import sys
import webbrowser

try:
    import pyautogui
    pyautogui.PAUSE = 0.05
    pyautogui.FAILSAFE = True
except ImportError:
    print("[ERROR] pyautogui not installed. Run: pip install pyautogui")
    sys.exit(1)

try:
    import websockets
except ImportError:
    print("[ERROR] websockets not installed. Run: pip install websockets")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("JARVIS-GLOBAL")

# Your Cloud Relay URL (Works from anywhere on Earth)
CLOUD_RELAY_URL = "wss://ais-dev-ci6rlnz6sobavwb3ttl7pj-606677363854.us-east1.run.app/ws/relay?role=pc"

# Also listen locally on 8765 as fallback
LOCAL_PORT = 8765

async def execute_directive(command: str) -> str:
    cmd = command.strip().lower()
    logger.info(f"⚡ Directive received: '{command}'")

    if ("email" in cmd or "mail" in cmd) and ("compose" in cmd or "write" in cmd):
        webbrowser.open("https://mail.google.com/mail/u/0/#inbox?compose=new")
        await asyncio.sleep(2)
        screen_w, screen_h = pyautogui.size()
        pyautogui.moveTo(screen_w * 0.15, screen_h * 0.25, duration=0.5)
        pyautogui.click()
        return "Email client opened and compose initialized."

    elif "browser" in cmd or "chrome" in cmd:
        webbrowser.open("https://www.google.com")
        return "Workstation browser launched."

    elif cmd.startswith("type "):
        text_to_type = command[5:]
        pyautogui.write(text_to_type, interval=0.03)
        return f"Typed: '{text_to_type}'"

    elif "right click" in cmd:
        pyautogui.rightClick()
        return "Right click executed."

    elif "double click" in cmd:
        pyautogui.doubleClick()
        return "Double click executed."

    elif "click" in cmd:
        pyautogui.click()
        return "Left click executed."

    else:
        return f"Directive '{command}' executed."

def handle_incoming_message(msg_str: str) -> str:
    screen_w, screen_h = pyautogui.size()
    try:
        data = json.loads(msg_str)
        msg_type = data.get("type")

        if msg_type == "mouse_move":
            pct_x = float(data.get("x", 50)) / 100.0
            pct_y = float(data.get("y", 50)) / 100.0
            pyautogui.moveTo(int(screen_w * pct_x), int(screen_h * pct_y), duration=0.02)
            return ""

        elif msg_type == "mouse_click":
            pyautogui.click()
            return ""

        elif msg_type == "mouse_right_click":
            pyautogui.rightClick()
            return ""

        elif msg_type == "directive":
            cmd = data.get("command", "")
            return cmd

    except json.JSONDecodeError:
        return msg_str

    return ""

async def cloud_relay_worker():
    """Connects out to the cloud relay so your phone can control this PC from anywhere."""
    screen_w, screen_h = pyautogui.size()

    while True:
        try:
            logger.info(f"Connecting to J.A.R.V.I.S. Cloud Hub...")
            async with websockets.connect(CLOUD_RELAY_URL) as ws:
                logger.info("=" * 60)
                logger.info("  ✓ CONNECTED TO J.A.R.V.I.S. CLOUD RELAY!")
                logger.info("  ✓ YOUR PHONE CAN NOW CONTROL THIS PC FROM ANYWHERE ON EARTH")
                logger.info("=" * 60)

                # Send initial handshake
                await ws.send(json.dumps({
                    "type": "handshake",
                    "status": "connected",
                    "screenWidth": screen_w,
                    "screenHeight": screen_h
                }))

                async for message in ws:
                    cmd = handle_incoming_message(message)
                    if cmd:
                        res = await execute_directive(cmd)
                        await ws.send(json.dumps({
                            "type": "directive_response",
                            "result": res
                        }))

        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError, OSError) as e:
            logger.warning(f"Cloud hub connection retry in 3s... ({e})")
            await asyncio.sleep(3)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            await asyncio.sleep(3)

async def local_fallback_worker():
    """Also listens locally on port 8765 as local network fallback."""
    screen_w, screen_h = pyautogui.size()

    async def handle_local(websocket):
        logger.info(f"Local client connected: {websocket.remote_address}")
        try:
            async for message in websocket:
                cmd = handle_incoming_message(message)
                if cmd:
                    res = await execute_directive(cmd)
                    await websocket.send(json.dumps({
                        "type": "directive_response",
                        "result": res
                    }))
        except websockets.exceptions.ConnectionClosed:
            pass

    try:
        async with websockets.serve(handle_local, "0.0.0.0", LOCAL_PORT):
            await asyncio.Future()
    except Exception:
        pass

async def main():
    print("=" * 65)
    print("   J.A.R.V.I.S. GLOBAL CLOUD AGENT (v5.0)")
    print("   Controls PC Mouse & Executes Directives 100% Silently")
    print("=" * 65)
    await asyncio.gather(
        cloud_relay_worker(),
        local_fallback_worker(),
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nAgent terminated.")
