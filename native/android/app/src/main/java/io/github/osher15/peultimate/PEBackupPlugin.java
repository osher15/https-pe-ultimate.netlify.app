package io.github.osher15.peultimate;

import android.app.backup.BackupManager;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Lets the settings screen read and change the Android Auto Backup choice (default OFF). */
@CapacitorPlugin(name = "PEBackup")
public class PEBackupPlugin extends Plugin {

    @PluginMethod
    public void getAutoBackup(PluginCall call) {
        JSObject result = new JSObject();
        result.put("enabled", PEBackupAgent.isEnabled(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void setAutoBackup(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        Context context = getContext();
        boolean saved = context
            .getSharedPreferences(PEBackupAgent.PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(PEBackupAgent.KEY_AUTO, enabled)
            .commit();
        if (!saved) {
            call.reject("Could not save the backup setting");
            return;
        }
        try {
            new BackupManager(context).dataChanged();
        } catch (RuntimeException ignored) {
            /* The setting is saved; the system will back up on its own schedule. */
        }
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }
}
