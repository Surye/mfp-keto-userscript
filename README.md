Created primarily for the /r/keto community on Reddit.

Tracking source code changes and taking pull requests at: https://github.com/Surye/mfp-keto-userscript (you can fork, edit, and send a pull request all in browser, so should be simple)

<h1>Remember this script <b>REQUIRES</b> the following columns: Fat, Protein, Carbs, Fiber!</h1>



<h1>Install:</h1>
<ul>
<li><b>Chrome</b>: Chrome <a href="http://support.google.com/chrome_webstore/bin/answer.py?hl=en&answer=2664769&p=crx_warning">stopped allowing scripts installed outside of their webstore</a>. Here's two options to install them in Chrome: 
<ul><li>Install <a href="https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo">Tampermonkey</a> and install the script as normal.</li>
<li>Another option is to download the script to your PC locally using Save As. Then open "chrome://chrome/extensions" and drag and drop the .js file on Chrome. <a href="http://www.mafiawarslootlady.com/2012/07/chrome-21-userscript-and-extension.html">Here is a more detailed description of this method</a></li></ul></li>
<li><b>Firefox</b>: Install Greasemonkey, then click install.</li>
<li><b>Internet Explorer</b>: Install Trixie, http://www.bhelpuri.net/Trixie/, though I have not tested it on IE, it should work.</li>
</ul>
<h1>FAQ:</h1>

Q: Food item shows up in red and says bad data?! What gives?!
A: Someone added the food item incorrectly, and put net carbs in the carbs value, and so the fiber subtracts from it, making negative carbs. Nothing I can really do about this without modifying more data than I wish to.

Q: I get NaN's in the Net Carb column!
A: It may be you didn't have all the required columns added, go to http://www.myfitnesspal.com/account/diary_settings and make sure all the columns required are there (most likely, you need to add the fiber column).
