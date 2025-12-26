# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor WebView - JavaScript Interface 보호
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor Core 보호
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-dontwarn com.getcapacitor.**

# Capacitor Plugins 보호
-keep class com.codetrixstudio.capacitor.GoogleAuth.** { *; }
-keep class app.babycare.ai.** { *; }

# 디버깅을 위한 소스 파일 및 라인 번호 정보 유지
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Crash 리포트를 위한 정보 유지
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
