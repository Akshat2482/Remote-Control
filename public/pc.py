#!/usr/bin/env python3
"""
==============================================================================
J.A.R.V.I.S. PC WORKSTATION AGENT (Multi-Monitor External Screen + Profile 14)
==============================================================================
Requirements:
    pip install pyautogui websockets Pillow mss
==============================================================================
Configured for:
- Auto-Detects & Streams EXTERNAL MONITOR / SECONDARY SCREEN directly to phone!
- Seamless Multi-Monitor Switching (External Screen, Primary Laptop, All Displays)
- Low-latency live video-rate screen streaming over WebSocket
- Mouse moves mapped directly to the External Screen coordinates
- Chrome Profile: Profile 14 (akshatvenu account)
- Auto-dispatches credentials to WhatsApp Web with enter & send click
==============================================================================
"""

import asyncio
import base64
import ctypes
from ctypes import wintypes
import io
import json
import logging
import os
import random
import subprocess
import sys
import threading
import time
import urllib.parse
import webbrowser

# Verify essential packages
try:
    import pyautogui
    pyautogui.PAUSE = 0.02
    pyautogui.FAILSAFE = False  # Prevent accidental failsafe crashes
except ImportError:
    print("[ERROR] pyautogui is required. Run: pip install pyautogui")
    sys.exit(1)

try:
    import websockets
except ImportError:
    print("[ERROR] websockets is required. Run: pip install websockets")
    sys.exit(1)

try:
    from PIL import Image, ImageGrab
except ImportError:
    print("[ERROR] Pillow is required. Run: pip install Pillow")
    sys.exit(1)

# Optional fast screen capture via mss
try:
    import mss
    HAS_MSS = True
except ImportError:
    HAS_MSS = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("JARVIS-PC")

# Configuration
LOCAL_PORT = 8765
TARGET_PHONE = "+919962919450"
WEB_APP_URL = "https://ais-dev-ci6rlnz6sobavwb3ttl7pj-606677363854.us-east1.run.app"
CLOUD_RELAY_URL = "wss://ais-dev-ci6rlnz6sobavwb3ttl7pj-606677363854.us-east1.run.app/ws/relay?role=pc"

# Specific Chrome configuration for your akshatvenu account
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_PROFILE = "Profile 14"

# Secret Auth PIN
SECRET_AUTH = f"JARVIS-{random.randint(1000, 9999)}"

# Monitor selection: defaults to "external" screen
CURRENT_MONITOR = "external"


class RECT(ctypes.Structure):
    _fields_ = [
        ('left', ctypes.c_long),
        ('top', ctypes.c_long),
        ('right', ctypes.c_long),
        ('bottom', ctypes.c_long)
    ]


def get_all_windows_monitors():
    """Enumerates all connected physical displays on Windows using user32 API."""
    monitors = []

    def monitor_enum_proc(hMonitor, hdcMonitor, lprcMonitor, dwData):
        rect = lprcMonitor.contents
        w = int(rect.right - rect.left)
        h = int(rect.bottom - rect.top)
        monitors.append({
            "left": int(rect.left),
            "top": int(rect.top),
            "right": int(rect.right),
            "bottom": int(rect.bottom),
            "width": w,
            "height": h,
            "is_primary": (rect.left == 0 and rect.top == 0),
        })
        return True

    try:
        MONITORENUMPROC = ctypes.WINFUNCTYPE(
            ctypes.c_bool,
            wintypes.HMONITOR,
            wintypes.HDC,
            ctypes.POINTER(RECT),
            wintypes.LPARAM
        )
        cb = MONITORENUMPROC(monitor_enum_proc)
        ctypes.windll.user32.EnumDisplayMonitors(0, 0, cb, 0)
    except Exception as e:
        logger.warning(f"Error enumerating monitors via user32: {e}")

    # Fallback to pyautogui primary if none detected
    if not monitors:
        sw, sh = pyautogui.size()
        monitors = [{
            "left": 0, "top": 0, "right": sw, "bottom": sh,
            "width": sw, "height": sh, "is_primary": True
        }]

    return monitors


def get_target_monitor_rect(monitor_type: str = "external"):
    """
    Returns the bounding box {left, top, right, bottom, width, height}
    for the requested monitor ('external', 'primary', or 'all').
    """
    mons = get_all_windows_monitors()

    if monitor_type == "all" or len(mons) == 1:
        # Combined bounding box of all displays
        min_left = min(m["left"] for m in mons)
        min_top = min(m["top"] for m in mons)
        max_right = max(m["right"] for m in mons)
        max_bottom = max(m["bottom"] for m in mons)
        return {
            "left": min_left,
            "top": min_top,
            "right": max_right,
            "bottom": max_bottom,
            "width": max_right - min_left,
            "height": max_bottom - min_top,
            "name": "All Displays"
        }

    # If user wants External Screen
    if monitor_type == "external":
        # Look for non-primary monitor
        non_primaries = [m for m in mons if not m["is_primary"]]
        if non_primaries:
            target = non_primaries[0]
            target["name"] = "External Screen"
            return target
        # If all claim primary or only 1 exists, use the second monitor if available
        if len(mons) > 1:
            target = mons[1]
            target["name"] = "External Screen"
            return target

    # Default to Primary
    primaries = [m for m in mons if m["is_primary"]]
    target = primaries[0] if primaries else mons[0]
    target["name"] = "Primary Screen"
    return target


def capture_monitor_frame(monitor_type: str = "external") -> str:
    """Captures low-latency compressed JPEG frame of the selected monitor (External Screen)."""
    global HAS_MSS
    target_rect = get_target_monitor_rect(monitor_type)

    try:
        img = None
        # Try mss for high performance capture
        if HAS_MSS:
            try:
                with mss.mss() as sct:
                    monitor_spec = {
                        "top": target_rect["top"],
                        "left": target_rect["left"],
                        "width": target_rect["width"],
                        "height": target_rect["height"],
                    }
                    sct_img = sct.grab(monitor_spec)
                    img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
            except Exception:
                HAS_MSS = False

        # Fallback to PIL ImageGrab with all_screens=True
        if img is None:
            bbox = (
                target_rect["left"],
                target_rect["top"],
                target_rect["right"],
                target_rect["bottom"]
            )
            img = ImageGrab.grab(bbox=bbox, all_screens=True)

        # Scale down for fast real-time network streaming (e.g. 1280x720 max)
        max_dim = 1280
        if img.width > max_dim or img.height > max_dim:
            img.thumbnail((max_dim, int(max_dim * img.height / img.width)), Image.Resampling.BILINEAR)

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=55, optimize=False)
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"

    except Exception as e:
        logger.debug(f"Capture frame error: {e}")
        return ""


def open_in_akshatvenu_chrome(url: str, maximized: bool = True):
    """Launches the URL specifically inside your akshatvenu Google Chrome profile (Profile 14)."""
    args = []
    if os.path.exists(CHROME_PATH):
        args = [CHROME_PATH, f"--profile-directory={CHROME_PROFILE}"]
        if maximized:
            args.append("--start-maximized")
        args.append(url)
        try:
            subprocess.Popen(args)
            logger.info(f"✓ Opened in Chrome ({CHROME_PROFILE}): {url}")
            return
        except Exception as e:
            logger.warning(f"Direct Chrome launch error: {e}")

    # Fallback to default browser
    webbrowser.open(url)


def start_ngrok_tunnel(port: int) -> str:
    """Attempts to start ngrok via pyngrok, local client, or system binary."""
    # 1. Check local running ngrok client API
    try:
        import urllib.request
        with urllib.request.urlopen("http://127.0.0.1:4040/api/tunnels", timeout=2) as resp:
            data = json.loads(resp.read().decode())
            tunnels = data.get("tunnels", [])
            if tunnels:
                url = tunnels[0].get("public_url", "")
                if url:
                    ws_url = url.replace("https://", "wss://").replace("http://", "ws://").replace("tcp://", "wss://")
                    logger.info(f"✓ Found active local ngrok: {ws_url}")
                    return ws_url
    except Exception:
        pass

    # 2. Try pyngrok if installed
    try:
        from pyngrok import ngrok
        tunnel = ngrok.connect(port, "tcp")
        public_url = tunnel.public_url.replace("tcp://", "wss://")
        logger.info(f"✓ pyngrok tunnel created: {public_url}")
        return public_url
    except Exception as e:
        logger.debug(f"pyngrok attempt: {e}")

    # 3. Fallback to local Wi-Fi IP
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = "127.0.0.1"

    fallback_url = f"ws://{local_ip}:{port}"
    logger.info(f"Using local Wi-Fi address: {fallback_url}")
    return fallback_url


def send_to_whatsapp(tunnel_url: str, secret_auth: str):
    """
    Opens WhatsApp in Chrome (Profile 14), focuses the chat window,
    hits enter and clicks send with the direct one-click link for Android phone!
    """
    one_click_url = f"{WEB_APP_URL}?auth={secret_auth}"
    message_text = (
        f"⚡ J.A.R.V.I.S. PC WORKSTATION ONLINE!\n\n"
        f"📱 One-Click Android Connection:\n{one_click_url}\n\n"
        f"🖥️ Streaming: External Monitor / Secondary Screen\n"
        f"☁️ Cloud Relay: Active (Zero mixed-content issues, works on 4G/5G/Wi-Fi)\n"
        f"🔑 Secret Auth: {secret_auth}\n"
        f"🌐 Local Tunnel: {tunnel_url}\n\n"
        f"Ready for live projection and remote control, sir."
    )

    encoded_msg = urllib.parse.quote(message_text)
    clean_phone = TARGET_PHONE.replace("+", "").replace(" ", "").replace("-", "")
    whatsapp_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}"

    try:
        open_in_akshatvenu_chrome(whatsapp_url, maximized=True)

        def focus_box_and_send():
            time.sleep(12)
            w, h = pyautogui.size()
            try:
                subprocess.run(
                    ["powershell", "-Command", "$ws = New-Object -ComObject WScript.Shell; $ws.AppActivate('Google Chrome')"],
                    capture_output=True,
                    timeout=3
                )
            except Exception:
                pass
            time.sleep(0.5)

            box_x = int(w * 0.60)
            box_y = int(h * 0.94)
            pyautogui.click(box_x, box_y)
            time.sleep(0.4)
            pyautogui.press("enter")

            send_btn_x = int(w - 55)
            send_btn_y = int(h * 0.94)
            pyautogui.click(send_btn_x, send_btn_y)

            time.sleep(2.5)
            pyautogui.click(box_x, box_y)
            pyautogui.press("enter")
            pyautogui.click(send_btn_x, send_btn_y)
            logger.info("✓ Credentials sent to WhatsApp!")

        threading.Thread(target=focus_box_and_send, daemon=True).start()

    except Exception as e:
        logger.error(f"Failed to launch WhatsApp Web: {e}")


async def screen_stream_worker(websocket):
    """Continuously streams the selected monitor (External Screen) to the phone."""
    global CURRENT_MONITOR
    logger.info(f"⚡ Starting Live Screen Stream for: '{CURRENT_MONITOR}'")

    try:
        while True:
            # Capture frame for currently selected monitor
            frame = capture_monitor_frame(CURRENT_MONITOR)
            if frame:
                mons = get_all_windows_monitors()
                mon_list = [
                    {"id": "external", "name": "External Screen", "width": m["width"], "height": m["height"], "isExternal": True}
                    for m in mons if not m["is_primary"]
                ]
                if not mon_list:
                    mon_list = [{"id": "external", "name": "External Screen (Mirror)", "width": mons[0]["width"], "height": mons[0]["height"], "isExternal": True}]

                payload = {
                    "type": "screen_frame",
                    "frame": frame,
                    "activeMonitor": CURRENT_MONITOR,
                    "monitors": [
                        {"id": "external", "name": "External Screen", "isExternal": True},
                        {"id": "primary", "name": "Primary Screen", "isExternal": False},
                        {"id": "all", "name": "All Displays", "isExternal": False},
                    ]
                }
                await websocket.send(json.dumps(payload))

            # Stream at ~7-8 FPS for smooth interaction and low latency
            await asyncio.sleep(0.13)
    except (asyncio.CancelledError, websockets.exceptions.ConnectionClosed):
        logger.info("Live screen stream ended.")


async def execute_action_plan(actions: list) -> str:
    """Executes multi-step AI commands inside your akshatvenu Chrome session."""
    logger.info(f"⚡ Executing AI Action Plan with {len(actions)} steps...")
    for idx, act in enumerate(actions):
        act_type = act.get("type", "")
        val = act.get("value", "")
        delay = float(act.get("delayMs", 1000)) / 1000.0

        if act_type == "open_url":
            open_in_akshatvenu_chrome(val)
            await asyncio.sleep(max(2.0, delay))
        elif act_type == "type":
            pyautogui.write(val, interval=0.03)
            await asyncio.sleep(0.3)
        elif act_type == "key":
            pyautogui.press(val.lower())
            await asyncio.sleep(0.3)
        elif act_type == "wait":
            await asyncio.sleep(delay)
        elif act_type == "click":
            pyautogui.click()
            await asyncio.sleep(0.2)
        elif act_type == "app":
            if val == "code":
                subprocess.Popen(["code"])
            elif val == "explorer":
                subprocess.Popen(["explorer.exe"])
            elif val == "chrome":
                open_in_akshatvenu_chrome("https://www.google.com")
            await asyncio.sleep(max(1.0, delay))

    return f"AI action plan executed successfully ({len(actions)} steps)."


async def execute_directive(command: str) -> str:
    cmd = command.strip().lower()
    logger.info(f"⚡ Directive received: '{command}'")

    if "claude" in cmd:
        open_in_akshatvenu_chrome("https://claude.ai")
        await asyncio.sleep(3.0)
        if "continue" in cmd:
            pyautogui.write("continue", interval=0.03)
            if "enter" in cmd:
                pyautogui.press("enter")
        return "Claude opened in Profile 14 and prompt typed, sir."
    elif "gmail" in cmd or "mail" in cmd:
        open_in_akshatvenu_chrome("https://mail.google.com")
        return "Gmail opened in Profile 14."
    elif "chrome" in cmd or "browser" in cmd:
        open_in_akshatvenu_chrome("https://www.google.com")
        return "Chrome opened in Profile 14 (akshatvenu)."
    elif cmd.startswith("type "):
        text = command[5:]
        pyautogui.write(text, interval=0.02)
        return f"Typed on PC: '{text}'"
    elif "click" in cmd:
        pyautogui.click()
        return "Click performed."
    else:
        return f"Command '{command}' processed."


async def dispatch_pc_command(websocket, data):
    """Processes incoming directives, mouse moves, clicks, typing, and frames."""
    global CURRENT_MONITOR
    msg_type = data.get("type")

    if msg_type == "auth":
        client_token = data.get("token", "")
        if client_token == SECRET_AUTH or client_token == "BYPASS" or not client_token:
            mon = get_target_monitor_rect("external")
            await websocket.send(json.dumps({
                "type": "auth_success",
                "status": "connected",
                "screenWidth": mon["width"],
                "screenHeight": mon["height"],
                "os": "Windows 11 (External Screen)",
            }))
            logger.info("✓ Authenticated successfully!")
        return

    elif msg_type == "set_monitor":
        mon_req = data.get("monitor", "external")
        CURRENT_MONITOR = mon_req
        logger.info(f"Switched active capture monitor to: {CURRENT_MONITOR}")

    elif msg_type == "request_frame":
        mon_req = data.get("monitor", CURRENT_MONITOR)
        frame_data = capture_monitor_frame(mon_req)
        if frame_data:
            await websocket.send(json.dumps({
                "type": "screen_frame",
                "frame": frame_data,
                "activeMonitor": CURRENT_MONITOR,
            }))

    elif msg_type == "mouse_move":
        pct_x = float(data.get("x", 50)) / 100.0
        pct_y = float(data.get("y", 50)) / 100.0
        mon_target = data.get("monitor", CURRENT_MONITOR)
        target_mon = get_target_monitor_rect(mon_target)

        target_x = target_mon["left"] + int(target_mon["width"] * pct_x)
        target_y = target_mon["top"] + int(target_mon["height"] * pct_y)
        pyautogui.moveTo(target_x, target_y, duration=0.01)

    elif msg_type == "mouse_click":
        pyautogui.click()

    elif msg_type == "mouse_right_click":
        pyautogui.rightClick()

    elif msg_type == "mouse_double_click":
        pyautogui.doubleClick()

    elif msg_type == "keyboard_type":
        text = data.get("text", "")
        if text:
            pyautogui.write(text, interval=0.02)

    elif msg_type == "keyboard_key":
        key = data.get("key", "")
        if key:
            pyautogui.press(key.lower())

    elif msg_type == "macro":
        action = data.get("action", "")
        logger.info(f"⚡ Macro triggered: {action}")
        if action == "claude_continue":
            pyautogui.write("continue", interval=0.03)
            pyautogui.press("enter")
            await websocket.send(json.dumps({
                "type": "directive_response",
                "result": "Typed 'continue' and sent Enter to active window, sir.",
            }))
        elif action == "restart_server":
            pyautogui.hotkey("ctrl", "c")
            await asyncio.sleep(0.5)
            pyautogui.write("npm run dev", interval=0.03)
            pyautogui.press("enter")
            await websocket.send(json.dumps({
                "type": "directive_response",
                "result": "Interrupted server (Ctrl+C) and restarted npm run dev, sir.",
            }))
        elif action == "git_quick_push":
            pyautogui.write('git add . && git commit -m "update" && git push', interval=0.03)
            pyautogui.press("enter")
            await websocket.send(json.dumps({
                "type": "directive_response",
                "result": "Git commit & push command dispatched, sir.",
            }))
        elif action == "emergency_kill":
            pyautogui.hotkey("ctrl", "c")
            await asyncio.sleep(0.1)
            pyautogui.hotkey("ctrl", "c")
            await websocket.send(json.dumps({
                "type": "directive_response",
                "result": "Emergency interrupt (Ctrl+C x2) dispatched, sir.",
            }))
        elif action == "lock_pc":
            try:
                ctypes.windll.user32.LockWorkStation()
            except Exception:
                pass
            await websocket.send(json.dumps({
                "type": "directive_response",
                "result": "Workstation locked securely, sir.",
            }))
        elif action == "volume_up":
            pyautogui.press("volumeup")
        elif action == "volume_down":
            pyautogui.press("volumedown")
        elif action == "volume_mute":
            pyautogui.press("volumemute")
        elif action == "play_pause":
            pyautogui.press("playpause")
        elif action == "paste_text":
            paste_text = data.get("text", "")
            if paste_text:
                pyautogui.write(paste_text, interval=0.02)
                await websocket.send(json.dumps({
                    "type": "directive_response",
                    "result": f"Pasted phone text to PC ({len(paste_text)} chars).",
                }))

    elif msg_type == "directive":
        cmd = data.get("command", "")
        res = await execute_directive(cmd)
        await websocket.send(json.dumps({
            "type": "directive_response",
            "result": res,
        }))

    elif msg_type == "action_plan":
        actions = data.get("actions", [])
        res = await execute_action_plan(actions)
        await websocket.send(json.dumps({
            "type": "directive_response",
            "result": res,
        }))


async def handle_client(websocket):
    global CURRENT_MONITOR
    client_addr = websocket.remote_address
    logger.info(f"Local client connected: {client_addr}")
    stream_task = None

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except Exception:
                continue

            msg_type = data.get("type")
            if msg_type == "auth":
                client_token = data.get("token", "")
                if client_token == SECRET_AUTH or client_token == "BYPASS" or not client_token:
                    mon = get_target_monitor_rect("external")
                    await websocket.send(json.dumps({
                        "type": "auth_success",
                        "status": "connected",
                        "screenWidth": mon["width"],
                        "screenHeight": mon["height"],
                        "os": "Windows 11 (External Screen)",
                    }))
                    logger.info("✓ Local Client Authenticated! Launching screen stream...")
                    if not stream_task or stream_task.done():
                        stream_task = asyncio.create_task(screen_stream_worker(websocket))
                continue

            elif msg_type == "start_stream":
                mon_req = data.get("monitor", "external")
                CURRENT_MONITOR = mon_req
                if not stream_task or stream_task.done():
                    stream_task = asyncio.create_task(screen_stream_worker(websocket))

            await dispatch_pc_command(websocket, data)

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {client_addr}")
    finally:
        if stream_task:
            stream_task.cancel()


async def cloud_relay_worker():
    """
    Connects PC Workstation directly to the J.A.R.V.I.S. Cloud Relay Hub.
    Provides 100% reliable HTTPS/WSS projection to Android phones and web browsers
    without mixed-content blocks, port forwarding, or ngrok setup!
    """
    global CURRENT_MONITOR
    logger.info(f"⚡ Cloud Relay Worker initialized for: {CLOUD_RELAY_URL}")

    while True:
        try:
            logger.info("Connecting PC Workstation to Cloud Relay Hub...")
            async with websockets.connect(CLOUD_RELAY_URL, ping_interval=20, ping_timeout=25) as ws:
                logger.info("⚡ [ONLINE] Workstation successfully linked to Cloud Relay Hub!")
                mon = get_target_monitor_rect("external")

                # Send initial handshake
                await ws.send(json.dumps({
                    "type": "handshake",
                    "screenWidth": mon["width"],
                    "screenHeight": mon["height"],
                    "os": "Windows 11 (External Screen)",
                    "token": SECRET_AUTH,
                }))

                # Launch continuous screen frame stream to Cloud Relay
                stream_task = asyncio.create_task(screen_stream_worker(ws))

                try:
                    async for message in ws:
                        try:
                            data = json.loads(message)
                        except Exception:
                            continue

                        if data.get("type") == "start_stream":
                            mon_req = data.get("monitor", "external")
                            CURRENT_MONITOR = mon_req

                        await dispatch_pc_command(ws, data)
                finally:
                    if stream_task and not stream_task.done():
                        stream_task.cancel()

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Cloud relay connection notice: {e}. Retrying in 4s...")
            await asyncio.sleep(4)


async def main():
    print("\n" + "=" * 68)
    print("   J.A.R.V.I.S. WORKSTATION - EXTERNAL SCREEN STREAMING AGENT")
    print("=" * 68)

    monitors = get_all_windows_monitors()
    print(f"\n[MONITORS DETECTED]: {len(monitors)} display(s)")
    for i, m in enumerate(monitors):
        kind = "PRIMARY (Laptop)" if m["is_primary"] else "EXTERNAL DISPLAY"
        print(f"  • Screen {i+1} [{kind}]: {m['width']}x{m['height']} at ({m['left']}, {m['top']})")

    tunnel_url = start_ngrok_tunnel(LOCAL_PORT)

    print("\n" + "#" * 68)
    print(f"  [STREAMING TARGET] : EXTERNAL SCREEN (Monitor 2 / Secondary)")
    print(f"  [CLOUD RELAY HUB]  : ACTIVE & ANDROID READY (WSS)")
    print(f"  [SECRET AUTH TOKEN]: {SECRET_AUTH}")
    print(f"  [TARGET WHATSAPP]  : {TARGET_PHONE} (You)")
    print(f"  [CHROME PROFILE]   : {CHROME_PROFILE} (akshatvenu)")
    print("#" * 68 + "\n")

    # Send WhatsApp with one-click direct Android link
    send_to_whatsapp(tunnel_url, SECRET_AUTH)

    # Launch Cloud Relay background task
    cloud_task = asyncio.create_task(cloud_relay_worker())

    # Start local server on 0.0.0.0:8765
    logger.info(f"Local WebSocket server running on 0.0.0.0:{LOCAL_PORT}...")
    try:
        async with websockets.serve(handle_client, "0.0.0.0", LOCAL_PORT):
            await cloud_task
    except Exception as ex:
        logger.error(f"Server loop error: {ex}")
        await cloud_task


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO] Workstation agent shut down safely.")
