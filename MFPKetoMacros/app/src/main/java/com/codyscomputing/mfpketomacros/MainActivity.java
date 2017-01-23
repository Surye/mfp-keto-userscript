package com.codyscomputing.mfpketomacros;
import android.os.Bundle;

import android.app.Activity;
import android.util.Base64;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;


/**
 * Created by Cody Morgan on 1/22/2017.
 */

public class MainActivity extends Activity {

    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.webviewlayout);


        webView = (WebView)findViewById(R.id.webview);
        webView.loadUrl("https://www.myfitnesspal.com/account/login");
        webView.setWebViewClient(new WebViewClient(){
            @Override
            public void onPageFinished(WebView view, String url){
                super.onPageFinished(view, url);
                injectJS();
            }
        });
        WebSettings webSettings=webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setBuiltInZoomControls(1==1);
        injectJS();


    }
    private void injectJS() {
        try {
            InputStream inputStream = getAssets().open("mfpketo.user.js");
            byte[] buffer = new byte[inputStream.available()];
            inputStream.read(buffer);
            inputStream.close();
            String encoded = Base64.encodeToString(buffer, Base64.NO_WRAP);
            webView.loadUrl("javascript:(function() {" +
                    "var parent = document.getElementsByTagName('head').item(0);" +
                    "var script = document.createElement('script');" +
                    "script.type = 'text/javascript';" +
                    "script.innerHTML = window.atob('" + encoded + "');" +
                    "parent.appendChild(script)" +
                    "})()");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
