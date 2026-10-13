package io.github.osher15.peultimate;

import android.app.backup.BackupAgent;
import android.app.backup.BackupDataInput;
import android.app.backup.BackupDataOutput;
import android.app.backup.FullBackupDataOutput;
import android.content.Context;
import android.os.ParcelFileDescriptor;
import java.io.IOException;

/**
 * Android Auto Backup is controlled by the teacher. The setting lives in a tiny
 * SharedPreferences file written by PEBackupPlugin; the default is OFF. When it is off
 * this agent copies nothing, so no pupil data goes to the user's Google account backup
 * or to a device-to-device transfer. When it is on, the normal full backup runs.
 */
public class PEBackupAgent extends BackupAgent {
    static final String PREFS = "pe_backup_settings";
    static final String KEY_AUTO = "auto_backup";

    static boolean isEnabled(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_AUTO, false);
    }

    @Override
    public void onFullBackup(FullBackupDataOutput data) throws IOException {
        if (!isEnabled(this)) {
            return;
        }
        super.onFullBackup(data);
    }

    /* Key/value backup is not used (fullBackupOnly="true" in the manifest). */
    @Override
    public void onBackup(ParcelFileDescriptor oldState, BackupDataOutput data, ParcelFileDescriptor newState) throws IOException {
    }

    @Override
    public void onRestore(BackupDataInput data, int appVersionCode, ParcelFileDescriptor newState) throws IOException {
    }
}
