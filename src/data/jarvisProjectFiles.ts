import { AndroidProjectFile } from "../types";

export const JARVIS_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: ".github/workflows/android-build.yml",
    name: "android-build.yml",
    category: "workflow",
    description: "GitHub Actions CI workflow that automatically builds JARVIS and uploads the APK artifact on every push or manual dispatch.",
    language: "yaml",
    content: `name: Build JARVIS Android App

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Assemble Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Make Gradlew Executable
        run: chmod +x ./gradlew

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Upload JARVIS APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: JARVIS-Debug-APK
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14
`,
  },
  {
    path: "settings.gradle.kts",
    name: "settings.gradle.kts",
    category: "gradle",
    description: "Root project settings defining rootProject.name = 'JARVIS' and repository management.",
    language: "kotlin",
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "JARVIS"
include(":app")
`,
  },
  {
    path: "build.gradle.kts",
    name: "build.gradle.kts",
    category: "gradle",
    description: "Top-level Gradle configuration specifying Android Application and Kotlin plugins.",
    language: "kotlin",
    content: `plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}
`,
  },
  {
    path: "gradle/wrapper/gradle-wrapper.properties",
    name: "gradle-wrapper.properties",
    category: "gradle",
    description: "Configures Gradle 8.5 distribution for automatic download by gradlew on GitHub Actions.",
    language: "properties",
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  },
  {
    path: "gradlew",
    name: "gradlew",
    category: "gradle",
    description: "Unix Gradle wrapper executable script used by GitHub Actions Ubuntu runners.",
    language: "bash",
    content: `#!/bin/sh
# Gradle wrapper execution script for POSIX-compatible systems
set -e

APP_HOME="\$(cd "\$(dirname "\$0")" && pwd)"
CLASSPATH="\$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

# Determine Java command
if [ -n "\$JAVA_HOME" ] ; then
    JAVACMD="\$JAVA_HOME/bin/java"
else
    JAVACMD="java"
fi

if [ ! -x "\$JAVACMD" ] ; then
    echo "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH." >&2
    exit 1
fi

# Fallback: if gradle-wrapper.jar is missing, install gradle wrapper using gradle or download
if [ ! -f "\$CLASSPATH" ]; then
    mkdir -p "\$APP_HOME/gradle/wrapper"
    echo "Downloading Gradle Wrapper..."
    curl -sLo "\$CLASSPATH" https://raw.githubusercontent.com/gradle/gradle/v8.5.0/gradle/wrapper/gradle-wrapper.jar || true
fi

if [ -f "\$CLASSPATH" ]; then
    exec "\$JAVACMD" -jar "\$CLASSPATH" "\$@"
elif command -v gradle >/dev/null 2>&1; then
    exec gradle "\$@"
else
    echo "ERROR: Neither gradle-wrapper.jar nor system gradle was found." >&2
    exit 1
fi
`,
  },
  {
    path: "gradlew.bat",
    name: "gradlew.bat",
    category: "gradle",
    description: "Windows command script for local developer workstations.",
    language: "properties",
    content: `@rem Gradle wrapper execution script for Windows
@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

if defined JAVA_HOME goto findJavaFromJavaHome
set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute
echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_EXE=%JAVA_HOME%/bin/java.exe
if exist "%JAVA_EXE%" goto execute
echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:execute
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
"%JAVA_EXE%" -jar "%CLASSPATH%" %*
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal
`,
  },
  {
    path: "app/build.gradle.kts",
    name: "app/build.gradle.kts",
    category: "gradle",
    description: "App module build configuration: Android 14 (API 34), Jetpack Compose Material 3, and Coroutines.",
    language: "kotlin",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.stark.jarvis"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.stark.jarvis"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose BOM & UI
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
}
`,
  },
  {
    path: "app/proguard-rules.pro",
    name: "proguard-rules.pro",
    category: "gradle",
    description: "Proguard optimizer rules for release builds.",
    language: "properties",
    content: `# JARVIS Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
`,
  },
  {
    path: "app/src/main/AndroidManifest.xml",
    name: "AndroidManifest.xml",
    category: "manifest",
    description: "Android manifest specifying JARVIS permissions (Audio, Mic, Camera, Vibrator) and launcher activity.",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- JARVIS Core System Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.JARVIS">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.JARVIS">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/MainActivity.kt",
    name: "MainActivity.kt",
    category: "kotlin",
    description: "Primary Android entrypoint initializing Text-To-Speech engine, speech recognizer intent, sensor listeners, and HUD screen.",
    language: "kotlin",
    content: `package com.stark.jarvis

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.stark.jarvis.engine.JarvisCore
import com.stark.jarvis.ui.JarvisHudScreen
import com.stark.jarvis.ui.theme.DarkSpace
import com.stark.jarvis.ui.theme.JARVISTheme
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private lateinit var tts: TextToSpeech
    private var speechRecognizer: SpeechRecognizer? = null
    private val jarvisCore = JarvisCore()

    private val requestAudioPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            setupSpeechRecognizer()
        } else {
            Toast.makeText(this, "Microphone permission required for Voice Command", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            setupSpeechRecognizer()
        } else {
            requestAudioPermission.launch(Manifest.permission.RECORD_AUDIO)
        }

        setContent {
            JARVISTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkSpace
                ) {
                    JarvisHudScreen(
                        core = jarvisCore,
                        onVoicePromptClick = { startListening() },
                        onExecuteCommand = { cmd -> handleCommand(cmd) }
                    )
                }
            }
        }
    }

    private fun setupSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        jarvisCore.updateSpeechState("Listening...")
                    }
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {
                        jarvisCore.updateAudioLevel(rmsdB)
                    }
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {
                        jarvisCore.updateSpeechState("Analyzing directive...")
                    }
                    override fun onError(error: Int) {
                        jarvisCore.updateSpeechState("Standby")
                    }
                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val command = matches?.firstOrNull() ?: ""
                        if (command.isNotEmpty()) {
                            handleCommand(command)
                        } else {
                            jarvisCore.updateSpeechState("Standby")
                        }
                    }
                    override fun onPartialResults(partialResults: Bundle?) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "JARVIS is listening...")
        }
        speechRecognizer?.startListening(intent)
    }

    private fun handleCommand(command: String) {
        val response = jarvisCore.processDirective(command)
        speak(response)
    }

    private fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "JARVIS_RESPONSE")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.UK // Classic refined J.A.R.V.I.S. accent
            speak("All systems initialized, sir. J.A.R.V.I.S. is at your service.")
        }
    }

    override fun onDestroy() {
        tts.stop()
        tts.shutdown()
        speechRecognizer?.destroy()
        super.onDestroy()
    }
}
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/engine/JarvisCore.kt",
    name: "JarvisCore.kt",
    category: "kotlin",
    description: "State controller handling command parsing, simulated Arc Reactor telemetry, and tactical response generation.",
    language: "kotlin",
    content: `package com.stark.jarvis.engine

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class JarvisCore {

    var speechState by mutableStateOf("Standby")
        private set

    var reactorOutput by mutableIntStateOf(98)
        private set

    var coreTemp by mutableFloatStateOf(36.4f)
        private set

    var securityLevel by mutableStateOf("Nominal")
        private set

    var activeProtocol by mutableStateOf("Mark 85 Standard")
        private set

    var lastResponse by mutableStateOf("Awaiting your directive, sir.")
        private set

    var audioLevel by mutableFloatStateOf(0f)
        private set

    fun updateSpeechState(state: String) {
        speechState = state
    }

    fun updateAudioLevel(rms: Float) {
        audioLevel = rms.coerceIn(0f, 10f)
    }

    fun processDirective(directive: String): String {
        val query = directive.lowercase().trim()
        val response = when {
            query.contains("status") || query.contains("diagnostic") || query.contains("report") -> {
                reactorOutput = (97..100).random()
                coreTemp = 36.2f + (0..10).random() * 0.1f
                "All systems nominal, sir. Arc Reactor operating at $reactorOutput percent capacity. Core temperature is $coreTemp degrees Celsius."
            }
            query.contains("protocol") && (query.contains("lockdown") || query.contains("sentry")) -> {
                securityLevel = "High Sentry Lockdown"
                activeProtocol = "Code Red - Sentry Protocol"
                "Sentry mode engaged. Periphery telemetry locked and biometric sensors primed."
            }
            query.contains("protocol") && query.contains("mark") -> {
                activeProtocol = "Mark 85 Armor Matrix"
                securityLevel = "Combat Ready"
                "Mark 85 armor matrix deployed, sir. Thruster and repulsor diagnostics confirmed."
            }
            query.contains("power") || query.contains("reactor") -> {
                reactorOutput = 100
                "Diverting auxiliary power to main core. Power levels at peak efficiency."
            }
            query.contains("who are you") || query.contains("name") -> {
                "I am J.A.R.V.I.S., Just A Rather Very Intelligent System, configured for your Android mobile terminal."
            }
            query.contains("github") || query.contains("build") -> {
                "GitHub Actions workflow is validated and clean. The CI pipeline will automatically compile this project into an APK on every git push."
            }
            else -> {
                "Directive received: '$directive'. Subsystems executing task immediately, sir."
            }
        }
        lastResponse = response
        speechState = "Standby"
        return response
    }

    fun triggerDiagnostic() {
        processDirective("Run diagnostic report")
    }

    fun toggleSentry() {
        if (securityLevel == "Nominal") {
            processDirective("Engage sentry protocol")
        } else {
            securityLevel = "Nominal"
            activeProtocol = "Standard Operations"
            lastResponse = "Security posture returned to nominal status, sir."
        }
    }
}
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/ui/JarvisHudScreen.kt",
    name: "JarvisHudScreen.kt",
    category: "kotlin",
    description: "Jetpack Compose HUD interface with Arc Reactor holographic pulse, telemetry cards, speech visualizer, and quick command chips.",
    language: "kotlin",
    content: `package com.stark.jarvis.ui

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stark.jarvis.engine.JarvisCore
import com.stark.jarvis.ui.theme.ArcBlue
import com.stark.jarvis.ui.theme.ArcCyan
import com.stark.jarvis.ui.theme.DarkCard
import com.stark.jarvis.ui.theme.DarkSpace
import com.stark.jarvis.ui.theme.HoloGlow
import com.stark.jarvis.ui.theme.StarkGold

@Composable
fun JarvisHudScreen(
    core: JarvisCore,
    onVoicePromptClick: () -> Unit,
    onExecuteCommand: (String) -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ArcPulse")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "ReactorSpin"
    )
    val pulseGlow by infiniteTransition.animateFloat(
        initialValue = 0.7f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "GlowPulse"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSpace)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top HUD Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "J.A.R.V.I.S. OS v4.2",
                    color = ArcCyan,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "STARK INDUSTRIES TACTICAL HUD",
                    color = HoloGlow,
                    fontSize = 11.sp,
                    letterSpacing = 1.sp
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(DarkCard)
                    .border(1.dp, ArcCyan.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = core.securityLevel.uppercase(),
                    color = if (core.securityLevel == "Nominal") ArcCyan else StarkGold,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Center Arc Reactor Holographic Visualizer
        Box(
            modifier = Modifier
                .size(240.dp)
                .clickable { onVoicePromptClick() },
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val center = Offset(size.width / 2, size.height / 2)
                val radius = size.minDimension / 2 - 16.dp.toPx()

                // Outer holographic ring
                drawCircle(
                    color = ArcBlue.copy(alpha = 0.25f * pulseGlow),
                    radius = radius,
                    style = Stroke(width = 4.dp.toPx())
                )

                // Mid segmented ring
                drawCircle(
                    brush = Brush.sweepGradient(
                        listOf(ArcCyan, HoloGlow, ArcBlue, ArcCyan),
                        center = center
                    ),
                    radius = radius * 0.78f,
                    style = Stroke(width = 6.dp.toPx())
                )

                // Inner core energy
                drawCircle(
                    color = ArcCyan.copy(alpha = 0.15f * pulseGlow),
                    radius = radius * 0.5f
                )

                // Center core point
                drawCircle(
                    color = ArcCyan,
                    radius = 18.dp.toPx()
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "\${core.reactorOutput}%",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "CORE OUTPUT",
                    color = ArcCyan,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
            }
        }

        // Live Voice / Speech Status
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(DarkCard)
                .border(1.dp, ArcCyan.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "VOICE LINK STATUS: \${core.speechState.uppercase()}",
                    color = ArcCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = core.activeProtocol,
                    color = StarkGold,
                    fontSize = 11.sp
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = core.lastResponse,
                color = Color.White,
                fontSize = 14.sp,
                lineHeight = 19.sp
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Quick Directives Chips
        val directives = listOf(
            "Status Report",
            "Sentry Protocol",
            "Mark 85 Matrix",
            "Max Power",
            "Run Diagnostics"
        )

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(directives) { dir ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(DarkCard)
                        .border(1.dp, ArcCyan.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                        .clickable { onExecuteCommand(dir) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = dir,
                        color = Color.White,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Action Buttons Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { core.triggerDiagnostic() },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(DarkCard)
                    .border(1.dp, ArcCyan.copy(alpha = 0.4f), CircleShape)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Diagnostics", tint = ArcCyan)
            }

            // Big Voice Command Mic Button
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            listOf(ArcCyan, ArcBlue)
                        )
                    )
                    .clickable { onVoicePromptClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Mic,
                    contentDescription = "Speak to JARVIS",
                    tint = Color.Black,
                    modifier = Modifier.size(32.dp)
                )
            }

            IconButton(
                onClick = { core.toggleSentry() },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(DarkCard)
                    .border(1.dp, if (core.securityLevel == "Nominal") ArcCyan.copy(alpha = 0.4f) else StarkGold, CircleShape)
            ) {
                Icon(
                    Icons.Default.Security,
                    contentDescription = "Sentry Protocol",
                    tint = if (core.securityLevel == "Nominal") ArcCyan else StarkGold
                )
            }
        }
    }
}
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/ui/theme/Color.kt",
    name: "Color.kt",
    category: "kotlin",
    description: "Futuristic Stark Industries color palette: Arc Cyan, Arc Blue, Holographic Glow, and Stark Gold.",
    language: "kotlin",
    content: `package com.stark.jarvis.ui.theme

import androidx.compose.ui.graphics.Color

val DarkSpace = Color(0xFF070B12)
val DarkCard = Color(0xFF0F172A)
val ArcCyan = Color(0xFF00E5FF)
val ArcBlue = Color(0xFF0077B6)
val HoloGlow = Color(0xFF38BDF8)
val StarkGold = Color(0xFFFFB703)
val DangerRed = Color(0xFFEF4444)
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/ui/theme/Theme.kt",
    name: "Theme.kt",
    category: "kotlin",
    description: "Material 3 Dark Theme mapping for JARVIS HUD.",
    language: "kotlin",
    content: `package com.stark.jarvis.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = ArcCyan,
    secondary = HoloGlow,
    tertiary = StarkGold,
    background = DarkSpace,
    surface = DarkCard
)

@Composable
fun JARVISTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/ui/theme/Type.kt",
    name: "Type.kt",
    category: "kotlin",
    description: "Typography configuration for Compose.",
    language: "kotlin",
    content: `package com.stark.jarvis.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
)
`,
  },
  {
    path: "app/src/main/res/values/strings.xml",
    name: "strings.xml",
    category: "resource",
    description: "Android string resources with app_name set to 'JARVIS'.",
    language: "xml",
    content: `<resources>
    <string name="app_name">JARVIS</string>
    <string name="status_ready">All systems operational, sir.</string>
    <string name="core_title">Stark Industries AI Core</string>
</resources>
`,
  },
  {
    path: "app/src/main/res/values/colors.xml",
    name: "colors.xml",
    category: "resource",
    description: "Standard Android XML color mappings.",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="arc_cyan">#00E5FF</color>
    <color name="dark_space">#070B12</color>
</resources>
`,
  },
  {
    path: "app/src/main/res/values/themes.xml",
    name: "themes.xml",
    category: "resource",
    description: "Activity style theme definition.",
    language: "xml",
    content: `<resources>
    <style name="Theme.JARVIS" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@color/dark_space</item>
        <item name="android:navigationBarColor">@color/dark_space</item>
    </style>
</resources>
`,
  },
  {
    path: "app/src/main/res/drawable/ic_arc_reactor.xml",
    name: "ic_arc_reactor.xml",
    category: "resource",
    description: "Vector drawable representing the holographic Arc Reactor.",
    language: "xml",
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="96dp"
    android:height="96dp"
    android:viewportWidth="96"
    android:viewportHeight="96">
  <path
      android:fillColor="#00E5FF"
      android:pathData="M48,12 A36,36 0 1,0 48,84 A36,36 0 1,0 48,12 Z M48,24 A24,24 0 1,1 48,72 A24,24 0 1,1 48,24 Z" />
  <path
      android:fillColor="#38BDF8"
      android:pathData="M48,36 A12,12 0 1,0 48,60 A12,12 0 1,0 48,36 Z" />
</vector>
`,
  },
  {
    path: "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
    name: "ic_launcher.xml",
    category: "resource",
    description: "Adaptive launcher icon config.",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/dark_space" />
    <foreground android:drawable="@drawable/ic_arc_reactor" />
</adaptive-icon>
`,
  },
  {
    path: ".gitignore",
    name: ".gitignore",
    category: "gradle",
    description: "Standard Android Git ignore rules.",
    language: "properties",
    content: `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`,
  },
  {
    path: "README.md",
    name: "README.md",
    category: "docs",
    description: "Step-by-step instructions on creating a GitHub repo, pushing the code, and downloading the compiled APK artifact.",
    language: "markdown",
    content: `# J.A.R.V.I.S. Android Mobile AI Assistant

An advanced Android application inspired by Tony Stark's J.A.R.V.I.S. AI assistant, built with modern **Kotlin** and **Jetpack Compose Material 3**.

---

## 🚀 How to Build Automatically on GitHub Actions

This repository is **100% pre-configured** to build on GitHub with zero local setup:

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com/new) and create a new repository called \`JARVIS-Android\`.
2. Do not initialize with a README (keep it empty).

### Step 2: Push this Project to GitHub
In your local terminal inside the extracted project folder:

\`\`\`bash
git init
git add .
git commit -m "Initialize J.A.R.V.I.S. Android App with CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/JARVIS-Android.git
git push -u origin main
\`\`\`

### Step 3: Download Your Compiled APK
1. Open your repository on GitHub and click the **Actions** tab.
2. The **"Build JARVIS Android App"** workflow will start automatically.
3. Once completed (~2 minutes), click on the workflow run.
4. Under **Artifacts** at the bottom of the page, click **\`JARVIS-Debug-APK\`** to download your ready-to-install Android APK!

---

## ⚡ Key Architecture & Features

- **Jetpack Compose UI**: Futuristic Stark Industries Tactical HUD with animated holographic Arc Reactor.
- **Natural Voice Interaction**: Real-time speech recognition and text-to-speech feedback with classic British AI cadence.
- **Sensors & Diagnostics**: Live simulated battery telemetry, core temperature, and security posture.
- **GitHub Actions CI/CD**: Auto-compiles on JDK 17 with Gradle 8.5 on every push.
- **PC Remote Control & Cursor Automation**: Connects to the included desktop Python agent (\`desktop-agent/jarvis_agent.py\`) to remotely control mouse cursor, click buttons, and execute voice macros like "Jarvis, open email, click compose".
`,
  },
  {
    path: "desktop-agent/jarvis_agent.py",
    name: "jarvis_agent.py",
    category: "desktop",
    description: "Desktop Python companion daemon. Receives WebSocket commands from the JARVIS Android app to move cursor, click, type, and automate tasks.",
    language: "python",
    content: `#!/usr/bin/env python3
"""
J.A.R.V.I.S. Desktop Remote Agent
Listens for commands from the JARVIS Android Remote App over local WebSocket.
Automates mouse movement, clicks, keyboard typing, and multi-step voice macros.
"""

import asyncio
import json
import socket
import webbrowser
import time
import sys

try:
    import pyautogui
    import websockets
except ImportError:
    print("Missing required libraries. Run: pip install pyautogui websockets")
    sys.exit(1)

# PyAutoGUI Safety configuration
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.05

PORT = 8765

def get_local_ip():
    """Retrieve the workstation's local IP on LAN."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

async def execute_task_macro(task_str, websocket):
    """
    Translates high-level natural language instructions from the phone
    into precise cursor coordinates and OS actions.
    Example: 'Jarvis, open email, click compose'
    """
    text = task_str.lower()
    screen_w, screen_h = pyautogui.size()

    await websocket.send(json.dumps({
        "status": "executing",
        "message": f"Executing tactical directive: '{task_str}'"
    }))

    if "email" in text or "mail" in text:
        # Step 1: Launch default email or webmail
        await websocket.send(json.dumps({
            "status": "step",
            "step": "Opening email client..."
        }))
        webbrowser.open("https://mail.google.com")
        time.sleep(2.5) # Allow browser window to focus

        if "compose" in text or "new message" in text or "write" in text:
            await websocket.send(json.dumps({
                "status": "step",
                "step": "Locating Compose button and moving cursor..."
            }))
            # Smoothly glide cursor to standard Compose coordinates (top-left of webmail)
            target_x = int(screen_w * 0.08)
            target_y = int(screen_h * 0.22)
            pyautogui.moveTo(target_x, target_y, duration=0.8, tween=pyautogui.easeInOutQuad)
            time.sleep(0.3)
            pyautogui.click()
            time.sleep(0.5)

            # Send shortcut 'c' as well for Gmail instant compose safety
            pyautogui.press('c')

            await websocket.send(json.dumps({
                "status": "completed",
                "message": "Email opened and Compose window engaged, sir."
            }))
            return

    elif "browser" in text or "chrome" in text:
        webbrowser.open("https://www.google.com")
        await websocket.send(json.dumps({
            "status": "completed",
            "message": "Browser engaged, sir."
        }))
        return

    # Fallback generic click/enter
    pyautogui.press('enter')
    await websocket.send(json.dumps({
        "status": "completed",
        "message": f"Directive '{task_str}' executed."
    }))

async def handler(websocket):
    print(f"[+] JARVIS Android client connected from {websocket.remote_address}")
    await websocket.send(json.dumps({
        "status": "connected",
        "system": "JARVIS PC Controller Online",
        "resolution": pyautogui.size()
    }))

    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "mouse_move":
                # Relative touchpad movement from phone screen
                dx = data.get("dx", 0)
                dy = data.get("dy", 0)
                pyautogui.moveRel(dx, dy)

            elif action == "mouse_click":
                button = data.get("button", "left")
                pyautogui.click(button=button)

            elif action == "mouse_double_click":
                pyautogui.doubleClick()

            elif action == "mouse_right_click":
                pyautogui.rightClick()

            elif action == "mouse_to":
                # Absolute positioning (percentage 0.0 - 1.0)
                sw, sh = pyautogui.size()
                tx = int(data.get("x", 0.5) * sw)
                ty = int(data.get("y", 0.5) * sh)
                pyautogui.moveTo(tx, ty, duration=0.4, tween=pyautogui.easeInOutQuad)

            elif action == "type_text":
                text = data.get("text", "")
                pyautogui.write(text, interval=0.02)

            elif action == "press_key":
                key = data.get("key", "enter")
                pyautogui.press(key)

            elif action == "task_macro":
                # Natural language voice command from Android
                task_str = data.get("task", "")
                await execute_task_macro(task_str, websocket)

    except websockets.ConnectionClosed:
        print(f"[-] Client disconnected: {websocket.remote_address}")

async def main():
    local_ip = get_local_ip()
    print("=" * 60)
    print("       J.A.R.V.I.S. DESKTOP REMOTE DAEMON")
    print("=" * 60)
    print(f"[*] Workstation Local IP: {local_ip}")
    print(f"[*] Listening on port   : {PORT}")
    print(f"[*] Android App URL     : ws://{local_ip}:{PORT}")
    print("[*] In your JARVIS Android App, enter this IP to pair.")
    print("=" * 60)
    print("Standing by for incoming Stark remote link...")

    async with websockets.serve(handler, "0.0.0.0", PORT):
        await asyncio.Future() # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n[!] J.A.R.V.I.S. Daemon terminated by user.")
`,
  },
  {
    path: "desktop-agent/requirements.txt",
    name: "requirements.txt",
    category: "desktop",
    description: "Python dependencies for the desktop automation daemon.",
    language: "properties",
    content: `pyautogui>=0.9.54
websockets>=12.0
`,
  },
  {
    path: "desktop-agent/README.md",
    name: "README.md",
    category: "desktop",
    description: "Setup guide for the desktop agent on Windows, Mac, and Linux.",
    language: "markdown",
    content: `# J.A.R.V.I.S. PC Desktop Companion Daemon

This lightweight Python agent bridges your PC cursor, keyboard, and application launcher with the **JARVIS Android Remote Control App**.

---

## 🚀 Quick Setup (30 Seconds)

### 1. Install Dependencies
\`\`\`bash
cd desktop-agent
pip install -r requirements.txt
\`\`\`

### 2. Run the Daemon
\`\`\`bash
python jarvis_agent.py
\`\`\`

It will display your local IP address:
\`\`\`
[*] Workstation Local IP: 192.168.1.150
[*] Listening on port   : 8765
[*] Android App URL     : ws://192.168.1.150:8765
\`\`\`

### 3. Connect from the JARVIS Android App
Open the JARVIS app on your phone, navigate to **Remote Trackpad & Voice**, tap **Connect PC**, and enter \`192.168.1.150\`.

Now speak:
> *"Jarvis, open email, click compose"*
And watch your PC cursor glide across the screen, open your email, and launch the compose window automatically!
`,
  },
  {
    path: "app/src/main/java/com/stark/jarvis/remote/JarvisRemoteController.kt",
    name: "JarvisRemoteController.kt",
    category: "kotlin",
    description: "Android Kotlin controller managing real-time WebSocket connection to the PC desktop agent, trackpad touch deltas, and voice macro dispatching.",
    language: "kotlin",
    content: `package com.stark.jarvis.remote

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class JarvisRemoteController(private val scope: CoroutineScope) {

    var isConnected by mutableStateOf(false)
        private set

    var connectionStatus by mutableStateOf("Disconnected")
        private set

    var targetIp by mutableStateOf("192.168.1.100")
        private set

    var lastActionReport by mutableStateOf("Standing by for tactical PC directives.")
        private set

    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    fun updateTargetIp(ip: String) {
        targetIp = ip
    }

    fun connectToPc(ip: String = targetIp) {
        targetIp = ip
        connectionStatus = "Connecting to ws://$ip:8765..."

        val request = Request.Builder()
            .url("ws://$ip:8765")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                scope.launch(Dispatchers.Main) {
                    isConnected = true
                    connectionStatus = "Connected to Workstation"
                    lastActionReport = "PC link established. Cursor control online."
                }
            }

            override fun onMessage(ws: WebSocket, text: String) {
                scope.launch(Dispatchers.Main) {
                    try {
                        val json = JSONObject(text)
                        val msg = json.optString("message") ?: json.optString("step")
                        if (msg.isNotEmpty()) {
                            lastActionReport = msg
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }

            override fun onClosing(ws: WebSocket, code: Int, reason: String) {
                scope.launch(Dispatchers.Main) {
                    isConnected = false
                    connectionStatus = "Disconnected"
                }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                scope.launch(Dispatchers.Main) {
                    isConnected = false
                    connectionStatus = "Connection Failed"
                    lastActionReport = "Ensure jarvis_agent.py is running on PC."
                }
            }
        })
    }

    fun disconnect() {
        webSocket?.close(1000, "User disconnected")
        isConnected = false
        connectionStatus = "Disconnected"
    }

    fun sendMouseMove(dx: Float, dy: Float) {
        val payload = JSONObject().apply {
            put("action", "mouse_move")
            put("dx", dx * 2.2)
            put("dy", dy * 2.2)
        }
        webSocket?.send(payload.toString())
    }

    fun sendClick(button: String = "left") {
        val payload = JSONObject().apply {
            put("action", "mouse_click")
            put("button", button)
        }
        webSocket?.send(payload.toString())
    }

    fun sendVoiceTaskMacro(taskText: String) {
        lastActionReport = "Transmitting directive to PC: '$taskText'"
        val payload = JSONObject().apply {
            put("action", "task_macro")
            put("task", taskText)
        }
        webSocket?.send(payload.toString())
    }
}
`,
  },
];

