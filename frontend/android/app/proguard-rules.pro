# =========================================================================
# REGRAS DE SEGURANÇA E OBFUSCAÇÃO PROGUARD / R8 - ECOTANQUE
# Blindagem contra engenharia reversa e adulteração de código
# =========================================================================

# Preservar atributos de depuração seguros
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes SourceFile,LineNumberTable

# Preservar classes de interface JavaScript do Capacitor
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Ofuscação de identificadores internos
-repackageclasses 'com.lucasaosf.ecotanque.internal'
-allowaccessmodification

# Remoção de chamadas de Log em produção (segurança de dados)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}
