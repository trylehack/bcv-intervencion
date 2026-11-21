# Aplica las personalizaciones de BCV Intervención al proyecto android/ generado por Capacitor:
# ícono, nombre, pantalla de carga, certificado del BCV, ID de AdMob, versión y firma.
# Uso (desde tasa-bcv-app):  powershell -File scripts\aplicar-android.ps1
$ErrorActionPreference = 'Stop'
$app = Split-Path $PSScriptRoot -Parent
$res = Join-Path $app 'android\app\src\main\res'
$enc = New-Object System.Text.UTF8Encoding($false)

# 1) recursos propios
Get-ChildItem (Join-Path $app 'android-res') -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring((Join-Path $app 'android-res').Length + 1)
  $dest = Join-Path $res $rel
  New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
  Copy-Item $_.FullName $dest -Force
}

# 2) AndroidManifest: red (certificado BCV) y AdMob
$m = Join-Path $app 'android\app\src\main\AndroidManifest.xml'
$x = [IO.File]::ReadAllText($m)
if ($x -notmatch 'networkSecurityConfig') {
  $x = $x -replace 'android:theme="@style/AppTheme">', "android:theme=`"@style/AppTheme`"`n        android:networkSecurityConfig=`"@xml/network_security_config`">"
}
if ($x -notmatch 'com.google.android.gms.ads.APPLICATION_ID') {
  $x = $x -replace '(\s*)</application>', "`$1    <meta-data android:name=`"com.google.android.gms.ads.APPLICATION_ID`" android:value=`"@string/admob_app_id`"/>`$1</application>"
}
if ($x -notmatch 'com.google.android.gms.permission.AD_ID') {
  $x = $x -replace '(<uses-permission android:name="android.permission.INTERNET" />)', "`$1`n    <uses-permission android:name=`"com.google.android.gms.permission.AD_ID`" />"
}
[IO.File]::WriteAllText($m, $x, $enc)

# 3) pantalla de carga con el ícono propio
$st = Join-Path $res 'values\styles.xml'
$s = [IO.File]::ReadAllText($st)
$s = $s.Replace('@drawable/splash"', '@drawable/splash_tasa"').Replace('@drawable/splash<', '@drawable/splash_tasa<')
# fondo de la ventana oscuro (evita una franja de otro color tras la barra del reloj en WebView antiguos)
if ($s -notmatch 'android:windowBackground') {
  $s = $s -replace '(<style name="AppTheme.NoActionBar"[^>]*>)', "`$1`n        <item name=`"android:windowBackground`">@color/tasa_bg</item>"
}
[IO.File]::WriteAllText($st, $s, $enc)

# 4) versión y firma de publicación (keystore.properties fuera del repositorio)
$g = Join-Path $app 'android\app\build.gradle'
$b = [IO.File]::ReadAllText($g)
$ver = (Get-Content (Join-Path $app 'version.json') -Raw | ConvertFrom-Json)
$b = $b -replace 'versionCode \d+', "versionCode $($ver.versionCode)"
$b = $b -replace 'versionName "[^"]*"', "versionName `"$($ver.versionName)`""
if ($b -notmatch 'signingConfigs') {
  $firma = @'
    def keystorePropsFile = rootProject.file("../keystore.properties")
    def keystoreProps = new Properties()
    if (keystorePropsFile.exists()) { keystoreProps.load(new FileInputStream(keystorePropsFile)) }
    signingConfigs {
        release {
            if (keystorePropsFile.exists()) {
                storeFile file(keystoreProps['storeFile'])
                storePassword keystoreProps['storePassword']
                keyAlias keystoreProps['keyAlias']
                keyPassword keystoreProps['keyPassword']
            }
        }
    }
'@
  $b = $b -replace '(android\s*\{)', "`$1`n$firma"
  $b = $b -replace '(release\s*\{\s*\n\s*minifyEnabled)', "release {`n            signingConfig signingConfigs.release`n            minifyEnabled"
}
[IO.File]::WriteAllText($g, $b, $enc)
Write-Output "Personalizaciones aplicadas (versión $($ver.versionName), código $($ver.versionCode))."
