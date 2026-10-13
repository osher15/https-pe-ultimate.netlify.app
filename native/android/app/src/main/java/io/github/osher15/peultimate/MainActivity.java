package io.github.osher15.peultimate;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PEBackupPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
