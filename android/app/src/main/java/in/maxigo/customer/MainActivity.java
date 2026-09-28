package in.maxigo.customer;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {

    private static final String VERSION_URL =
            "https://maxigo.in/downloads/version.json";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private File pendingApkFile = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        checkForUpdate();
    }

    @Override
    public void onResume() {
        super.onResume();

        if (pendingApkFile != null && pendingApkFile.exists()) {
            if (canInstallPackages()) {
                installApk(pendingApkFile);
                pendingApkFile = null;
            }
        }
    }

    private void checkForUpdate() {

        executor.execute(() -> {

            HttpURLConnection connection = null;

            try {
                String urlWithCacheBuster =
                        VERSION_URL + "?t=" + System.currentTimeMillis();

                URL url = new URL(urlWithCacheBuster);

                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(10000);
                connection.setInstanceFollowRedirects(true);

                int responseCode = connection.getResponseCode();

                if (responseCode != HttpURLConnection.HTTP_OK) {
                    return;
                }

                InputStream inputStream =
                        new BufferedInputStream(connection.getInputStream());

                StringBuilder result = new StringBuilder();

                byte[] buffer = new byte[1024];
                int length;

                while ((length = inputStream.read(buffer)) != -1) {
                    result.append(new String(buffer, 0, length));
                }

                inputStream.close();

                JSONObject json = new JSONObject(result.toString());

                int latestVersionCode = json.getInt("versionCode");
                String latestVersionName = json.getString("versionName");
                String apkUrl = json.getString("apkUrl");
                boolean forceUpdate = json.optBoolean("forceUpdate", false);

                int currentVersionCode = getCurrentVersionCode();

                if (latestVersionCode > currentVersionCode) {

                    runOnUiThread(() ->
                            showUpdateDialog(
                                    latestVersionName,
                                    apkUrl,
                                    forceUpdate
                            )
                    );
                }

            } catch (Exception e) {
                e.printStackTrace();

            } finally {

                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }

    private int getCurrentVersionCode() {

        try {

            PackageInfo packageInfo =
                    getPackageManager().getPackageInfo(
                            getPackageName(),
                            0
                    );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return (int) packageInfo.getLongVersionCode();
            } else {
                return packageInfo.versionCode;
            }

        } catch (Exception e) {
            return 1;
        }
    }

    private void showUpdateDialog(
            String versionName,
            String apkUrl,
            boolean forceUpdate
    ) {

        AlertDialog.Builder builder =
                new AlertDialog.Builder(this);

        builder.setTitle("New MaxiGo Update Available");

        builder.setMessage(
                "New version " + versionName +
                        " is available.\n\n" +
                        "Update MaxiGo Customer App now."
        );

        builder.setPositiveButton(
                "Update App",
                (dialog, which) -> downloadApk(apkUrl)
        );

        if (!forceUpdate) {

            builder.setNegativeButton(
                    "Later",
                    (dialog, which) -> dialog.dismiss()
            );

        }

        AlertDialog dialog = builder.create();

        dialog.setCancelable(!forceUpdate);

        dialog.show();
    }

    private void downloadApk(String apkUrl) {

        new AlertDialog.Builder(this)
                .setTitle("Updating MaxiGo")
                .setMessage("Downloading latest version...")
                .setCancelable(false)
                .show();

        executor.execute(() -> {

            HttpURLConnection connection = null;

            try {

                URL url = new URL(apkUrl);

                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.setInstanceFollowRedirects(true);

                int responseCode = connection.getResponseCode();

                if (responseCode != HttpURLConnection.HTTP_OK) {
                    throw new Exception("APK download failed");
                }

                File apkFile = new File(
                        getCacheDir(),
                        "maxigo-customer-update.apk"
                );

                InputStream inputStream =
                        new BufferedInputStream(
                                connection.getInputStream()
                        );

                BufferedOutputStream outputStream =
                        new BufferedOutputStream(
                                new FileOutputStream(apkFile)
                        );

                byte[] buffer = new byte[8192];
                int length;

                while ((length = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, length);
                }

                outputStream.flush();

                outputStream.close();
                inputStream.close();

                pendingApkFile = apkFile;

                runOnUiThread(() -> {

                    if (canInstallPackages()) {

                        installApk(apkFile);
                        pendingApkFile = null;

                    } else {

                        new AlertDialog.Builder(this)
                                .setTitle("Allow MaxiGo Update")
                                .setMessage(
                                        "Please allow MaxiGo to install updates from this source."
                                )
                                .setPositiveButton(
                                        "Open Settings",
                                        (dialog, which) -> openInstallPermission()
                                )
                                .show();
                    }
                });

            } catch (Exception e) {

                e.printStackTrace();

                runOnUiThread(() ->
                        new AlertDialog.Builder(this)
                                .setTitle("Update Failed")
                                .setMessage(
                                        "Unable to download the latest MaxiGo update."
                                )
                                .setPositiveButton("OK", null)
                                .show()
                );

            } finally {

                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }

    private boolean canInstallPackages() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return getPackageManager().canRequestPackageInstalls();
        }

        return true;
    }

    private void openInstallPermission() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            Intent intent =
                    new Intent(
                            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES
                    );

            intent.setData(
                    Uri.parse("package:" + getPackageName())
            );

            startActivity(intent);
        }
    }

    private void installApk(File apkFile) {

        try {

            Uri apkUri = FileProvider.getUriForFile(
                    this,
                    getPackageName() + ".fileprovider",
                    apkFile
            );

            Intent intent =
                    new Intent(Intent.ACTION_VIEW);

            intent.setDataAndType(
                    apkUri,
                    "application/vnd.android.package-archive"
            );

            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            startActivity(intent);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        executor.shutdown();
    }
}