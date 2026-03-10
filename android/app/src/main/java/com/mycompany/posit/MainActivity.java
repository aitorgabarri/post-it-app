package com.mycompany.posit; // ✅ Asegúrate de que ponga MYCOMPANY si lo cambiaste

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // No hace falta cargar URLs ni WebViews aquí. 
        // Capacitor lo hace solo usando tu capacitor.config.ts
    }
}