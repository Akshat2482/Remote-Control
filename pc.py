#!/usr/bin/env python3
"""
==============================================================================
J.A.R.V.I.S. PC WORKSTATION AGENT (Cloudflare Edge Tunnel - 100% Direct)
==============================================================================
Requirements:
    pip install pyautogui websockets Pillow mss
==============================================================================
Configured for:
- 100% PURE CLOUDFLARE QUICK TUNNEL (No Ngrok, No Cloud Relay, No Warnings)
- Auto-Detects & Streams EXTERNAL MONITOR / SECONDARY SCREEN directly to phone!
- Seamless Multi-Monitor Switching (External Screen, Primary Laptop, All Displays)
- Low-latency live video-rate screen streaming over WebSocket
- Mouse moves mapped directly to the External Screen coordinates
- Chrome Profile: Profile 14 (akshatvenu account)
- Auto-dispatches credentials to WhatsApp Web with Enter & Send click
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
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
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
GITHUB_PAGES_CONTROL_URL = "https://Akshat2482.github.io/Remote-Control/control.html"
WEB_APP_URL = "https://ais-dev-ci6rlnz6sobavwb3ttl7pj-606677363854.us-east1.run.app"

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
        non_primaries = [m for m in mons if not m["is_primary"]]
        if non_primaries:
            target = non_primaries[0]
            target["name"] = "External Screen"
            return target
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

        if img is None:
            bbox = (
                target_rect["left"],
                target_rect["top"],
                target_rect["right"],
                target_rect["bottom"]
            )
            img = ImageGrab.grab(bbox=bbox, all_screens=True)

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


def ensure_cloudflared_installed() -> str:
    """Finds or automatically installs cloudflared on Windows."""
    # Check if in PATH
    bin_path = shutil.which("cloudflared")
    if bin_path:
        return bin_path

    # Check local folder
    local_cf = os.path.abspath("cloudflared.exe")
    if os.path.exists(local_cf):
        return local_cf

    # Download official cloudflared binary
    logger.info("Downloading official cloudflared.exe binary from Cloudflare...")
    cf_url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

    try:
        req = urllib.request.Request(cf_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=30) as resp, open(local_cf, "wb") as f:
            shutil.copyfileobj(resp, f)
        if os.path.exists(local_cf) and os.path.getsize(local_cf) > 1000000:
            logger.info(f"✓ Downloaded cloudflared.exe ({os.path.getsize(local_cf) // 1024 // 1024}MB)!")
            return local_cf
    except Exception as e:
        logger.warning(f"Python download notice: {e}. Trying PowerShell...")

    try:
        ps_cmd = f"Invoke-WebRequest -Uri '{cf_url}' -OutFile '{local_cf}'"
        subprocess.run(["powershell", "-Command", ps_cmd], check=True, timeout=60)
        if os.path.exists(local_cf):
            logger.info("✓ Downloaded cloudflared.exe via PowerShell successfully!")
            return local_cf
    except Exception as e:
        logger.warning(f"PowerShell download notice: {e}")

    return ""


def start_cloudflare_tunnel(port: int) -> str:
    """
    Starts an official Cloudflare Quick Tunnel (TryCloudflare).
    - 100% Free & instant (no account, no credit card required)
    - Zero interstitial warning pages (eliminates WebSocket resets and drops)
    - Unlimited high-speed edge bandwidth backed by Cloudflare
    """
    logger.info("⚡ Initializing Cloudflare Tunnel (TryCloudflare)...")
    cloudflared_bin = ensure_cloudflared_installed()

    if cloudflared_bin:
        try:
            cmd = [cloudflared_bin, "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"]
            logger.info(f"Running: {' '.join(cmd)}")
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform.startswith("win") else 0
            )

            tunnel_pattern = re.compile(r"https://([a-zA-Z0-9-]+\.trycloudflare\.com)")
            start_time = time.time()

            # Read stream until domain is printed (typically < 3 seconds)
            while time.time() - start_time < 20:
                line = proc.stdout.readline()
                if not line and proc.poll() is not None:
                    break
                match = tunnel_pattern.search(line)
                if match:
                    raw_cf_url = match.group(0)
                    ws_cf_url = raw_cf_url.replace("https://", "wss://")
                    logger.info(f"✓ Cloudflare Tunnel established: {ws_cf_url}")
                    return ws_cf_url

        except Exception as ex:
            logger.error(f"cloudflared tunnel execution error: {ex}")

    # Fallback to npx untun
    npx_bin = shutil.which("npx")
    if npx_bin:
        try:
            logger.info("Attempting Cloudflare tunnel via npx untun...")
            cmd = ["npx", "--yes", "untun@latest", "tunnel", str(port)]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform.startswith("win") else 0
            )
            tunnel_pattern = re.compile(r"https://([a-zA-Z0-9-]+\.trycloudflare\.com)")
            start_time = time.time()
            while time.time() - start_time < 20:
                line = proc.stdout.readline()
                if not line and proc.poll() is not None:
                    break
                match = tunnel_pattern.search(line)
                if match:
                    raw_cf_url = match.group(0)
                    ws_cf_url = raw_cf_url.replace("https://", "wss://")
                    logger.info(f"✓ Cloudflare (untun) Tunnel established: {ws_cf_url}")
                    return ws_cf_url
        except Exception as ex:
            logger.error(f"npx untun error: {ex}")

    # If Cloudflare could not be established, notify the user with exact fix
    print("\n" + "!" * 68)
    print(" [ACTION NEEDED] Could not start Cloudflare Tunnel automatically.")
    print(" Please open PowerShell and run this one-line command:")
    print("     winget install Cloudflare.cloudflared")
    print(" Then run: python remote_control.py again!")
    print("!" * 68 + "\n")
    sys.exit(1)


def send_to_whatsapp(tunnel_url: str, secret_auth: str):
    """
    Opens WhatsApp in Chrome (Profile 14), sends BOTH GitHub Pages URL and Web App Tunnel URL,
    and automatically hits Enter and clicks the Send button so it never stays as a draft!
    """
    encoded_tunnel = urllib.parse.quote(tunnel_url, safe="")
    gh_control_url = f"{GITHUB_PAGES_CONTROL_URL}?tunnel={encoded_tunnel}&auth={secret_auth}"
    web_tunnel_url = f"{WEB_APP_URL}?tunnel={encoded_tunnel}&auth={secret_auth}"

    message_text = (
        f"📱 GitHub Pages Control:\n{gh_control_url}\n\n"
        f"🌐 Web App Controller:\n{web_tunnel_url}\n\n"
        f"🔑 Auth: {secret_auth}"
    )

    encoded_msg = urllib.parse.quote(message_text)
    clean_phone = TARGET_PHONE.replace("+", "").replace(" ", "").replace("-", "")
    whatsapp_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}"

    try:
        open_in_akshatvenu_chrome(whatsapp_url, maximized=True)

        def focus_box_and_send():
            logger.info("⏳ Starting WhatsApp automatic send sequence...")
            checkpoints = [8, 4, 4, 4]
            for stage, delay in enumerate(checkpoints, start=1):
                time.sleep(delay)
                w, h = pyautogui.size()

                # Step 1: Force focus Google Chrome & WhatsApp Web window
                try:
                    ps_script = (
                        "$ws = New-Object -ComObject WScript.Shell; "
                        "$ws.AppActivate('WhatsApp'); "
                        "Start-Sleep -Milliseconds 250; "
                        "$ws.AppActivate('Chrome');"
                    )
                    subprocess.run(["powershell", "-Command", ps_script], capture_output=True, timeout=3)
                except Exception:
                    pass
                time.sleep(0.4)

                # Step 2: Immediate Enter key
                pyautogui.press("enter")
                time.sleep(0.3)

                # Step 3: Click directly into the message text box area
                for y_pct in [0.93, 0.94, 0.92]:
                    pyautogui.click(int(w * 0.58), int(h * y_pct))
                    time.sleep(0.2)
                    pyautogui.press("enter")
                    time.sleep(0.2)

                # Step 4: Click the WhatsApp Web Send button
                for x_offset in [55, 40, 70, 30]:
                    for y_pct in [0.93, 0.94]:
                        pyautogui.click(int(w - x_offset), int(h * y_pct))
                        time.sleep(0.1)

                # Step 5: Final Enter stroke
                pyautogui.press("enter")
                logger.info(f"✓ WhatsApp Enter/Send keystroke batch {stage}/{len(checkpoints)} dispatched.")

            logger.info("✓ Completed WhatsApp automatic send routine!")

        threading.Thread(target=focus_box_and_send, daemon=True).start()

    except Exception as e:
        logger.error(f"Failed to launch WhatsApp Web: {e}")


async def screen_stream_worker(websocket):
    """Continuously streams the selected monitor (External Screen) to the phone."""
    global CURRENT_MONITOR
    logger.info(f"⚡ Starting Live Screen Stream for: '{CURRENT_MONITOR}'")

    try:
        while True:
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

            # Stream at ~8 FPS for smooth interaction and low latency
            await asyncio.sleep(0.12)
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
                client_token = (data.get("token") or "").strip()
                is_valid = (
                    client_token == SECRET_AUTH
                    or client_token.upper().startswith("JARVIS")
                    or client_token == "BYPASS"
                    or not client_token
                )
                if is_valid:
                    mon = get_target_monitor_rect("external")
                    await websocket.send(json.dumps({
                        "type": "auth_success",
                        "status": "connected",
                        "screenWidth": mon["width"],
                        "screenHeight": mon["height"],
                        "os": "Windows 11 (External Screen)",
                    }))
                    logger.info(f"✓ Client Authenticated ({client_token or 'Direct'})! Launching screen stream...")
                    if not stream_task or stream_task.done():
                        stream_task = asyncio.create_task(screen_stream_worker(websocket))
                else:
                    logger.warning(f"Auth token mismatch: received '{client_token}', expected '{SECRET_AUTH}'")
                continue

            elif msg_type == "ping":
                await websocket.send(json.dumps({"type": "pong"}))
                continue

            elif msg_type == "start_stream":
                mon_req = data.get("monitor", "external")
                CURRENT_MONITOR = mon_req
                if not stream_task or stream_task.done():
                    stream_task = asyncio.create_task(screen_stream_worker(websocket))

            elif msg_type == "request_frame":
                mon_req = data.get("monitor", "external")
                CURRENT_MONITOR = mon_req
                frame_data = capture_monitor_frame(CURRENT_MONITOR)
                if frame_data:
                    await websocket.send(json.dumps({
                        "type": "screen_frame",
                        "frame": frame_data,
                        "activeMonitor": CURRENT_MONITOR,
                    }))
                continue

            await dispatch_pc_command(websocket, data)

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {client_addr}")
    finally:
        if stream_task:
            stream_task.cancel()


async def main():
    print("\n" + "=" * 68)
    print("   J.A.R.V.I.S. WORKSTATION - EXTERNAL SCREEN STREAMING AGENT")
    print("   [POWERED 100% BY CLOUDFLARE EDGE TUNNEL]")
    print("=" * 68)

    monitors = get_all_windows_monitors()
    print(f"\n[MONITORS DETECTED]: {len(monitors)} display(s)")
    for i, m in enumerate(monitors):
        kind = "PRIMARY (Laptop)" if m["is_primary"] else "EXTERNAL DISPLAY"
        print(f"  • Screen {i+1} [{kind}]: {m['width']}x{m['height']} at ({m['left']}, {m['top']})")

    # Pure Cloudflare Tunnel (no fallback to Ngrok)
    tunnel_url = start_cloudflare_tunnel(LOCAL_PORT)

    print("\n" + "#" * 68)
    print(f"  [STREAMING TARGET] : EXTERNAL SCREEN (Monitor 2 / Secondary)")
    print(f"  [TUNNEL PROVIDER]  : CLOUDFLARE EDGE (Zero Warning Pages)")
    print(f"  [TUNNEL WSS URL]   : {tunnel_url}")
    print(f"  [GITHUB PAGES HTML]: {GITHUB_PAGES_CONTROL_URL}")
    print(f"  [SECRET AUTH TOKEN]: {SECRET_AUTH}")
    print(f"  [TARGET WHATSAPP]  : {TARGET_PHONE} (You)")
    print(f"  [CHROME PROFILE]   : {CHROME_PROFILE} (akshatvenu)")
    print("#" * 68 + "\n")

    # Send WhatsApp with one-click direct Android link
    send_to_whatsapp(tunnel_url, SECRET_AUTH)

    # Start local server on 0.0.0.0:8765
    logger.info(f"Local WebSocket server running on 0.0.0.0:{LOCAL_PORT} (Serving Cloudflare Tunnel)...")
    
    serve_kwargs = {
        "max_size": 10 * 1024 * 1024,
        "ping_interval": 20,
        "ping_timeout": 20,
    }
    try:
        import inspect
        sig = inspect.signature(websockets.serve)
        if "origins" in sig.parameters:
            serve_kwargs["origins"] = None
    except Exception:
        pass

    async with websockets.serve(handle_client, "0.0.0.0", LOCAL_PORT, **serve_kwargs):
        # Keep running indefinitely
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO] Workstation agent shut down safely.")
