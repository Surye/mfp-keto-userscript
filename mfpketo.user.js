// ==UserScript==
// @name            MyFitnessPal Percentages and Net Carbs
// @version         1.13
// @namespace       surye
// @description     Adds display of Carb/Protein/Fat percentages to any daily food diary page. Also adds "Real Calories" calcalation based off 4/4/9 algorithm. Based on "MyFitnessPal Percentages and Net Carbs"
// @downloadURL     https://github.com/Surye/mfp-keto-userscript/raw/master/mfpketo.user.js
// @include         http*://www.myfitnesspal.com/food/diary*
// ==/UserScript==


/* side note - 5/30/65 Carbs/Protein/Fat is a good ratio for fat loss */


/*
 *  ------------------------------------------------------------
 * Thanks to kt123 and Wickity for the fixes.
 *  ------------------------------------------------------------
 */
/*
 *  ------------------------------------------------------------
 *  Based off of http://userscripts.org/scripts/show/104606
 *  Much credit to Bompus, hope it's okay I used it!
 *  ------------------------------------------------------------
 */

/*
 * TODO: Gracefully handle missing required columns.
 */
/*
if (window.top !== window.self) {
  return; // do not run in frames
}
*/
/*
if (typeof unsafeWindow != 'undefined')
{
  (function page_scope_runner() {
    // If we're _not_ already running in the page, grab the full source
    // of this script.
    var my_src = "(" + page_scope_runner.caller.toString() + ")();";

    // Create a script node holding this script, plus a marker that lets us
    // know we are running in the page scope (not the Greasemonkey sandbox).
    // Note that we are intentionally *not* scope-wrapping here.
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = my_src;
    document.body.appendChild(script);
  })();

  return;
}
*/
function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script); // run the script
    document.body.removeChild(script); // clean up
}

function startRun() {
    var script = document.createElement("script");
    script.setAttribute("src", "//www.google.com/jsapi");
    script.addEventListener('load', function() {
        exec(jsapiLoaded);
    }, false);
    document.body.appendChild(script);

    script = document.createElement("script");
    script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.10.0/jquery.min.js");
    script.addEventListener('load', function() {
        exec("jQuery.noConflict()");
    }, false);
    document.body.appendChild(script);

    script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = main;
    document.body.appendChild(script);
}

startRun();

function jsapiLoaded() {
    google.load("visualization", "1", { packages: ["corechart"], "callback": main });
}

function main() {
    var calories_i = 0;
    var net_carbs_i = 0;
    var carbs_i = 0;
    var fiber_i = 0;
    var protein_i = 0;
    var fat_i = 0;

    var daily_total_carbs = 0;
    var daily_total_protein = 0;
    var daily_total_fat = 0;

    var net_carb_total = 0;
    var net_carb_total_goal = 0;

    var header_tr_element = jQuery('.food_container tr.meal_header:first');

    var elem_i = 0;
    header_tr_element.find('td').each(function() {
        var myval = jQuery(this).text().toLowerCase().trim();
        if (myval.indexOf('calories') !== -1) { calories_i = elem_i; }
        if (myval.indexOf('carbs') !== -1) { carbs_i = elem_i; }
        if (myval.indexOf('fiber') !== -1) { fiber_i = elem_i; }
        if (myval.indexOf('fat') !== -1) { fat_i = elem_i; }
        if (myval.indexOf('protein') !== -1) { protein_i = elem_i; }

        elem_i += 1;
    });


    // Add new column for net carbs
    var net_carb_tr_elements = jQuery('tr');
    net_carb_tr_elements.each(function() {
        var tds = jQuery(this).find('td');
        jQuery('<td></td>').insertBefore(tds.eq(carbs_i));

    });

    // Recalculate offsets
    net_carbs_i = carbs_i;
    calories_i = calories_i >= net_carbs_i ? calories_i + 1 : calories_i;
    carbs_i = carbs_i >= net_carbs_i ? carbs_i + 1 : carbs_i;
    fiber_i = fiber_i >= net_carbs_i ? fiber_i + 1 : fiber_i;
    protein_i = protein_i >= net_carbs_i ? protein_i + 1 : protein_i;
    fat_i = fat_i >= net_carbs_i ? fat_i + 1 : fat_i;

    // Set header
    header_tr_element.find('td').eq(net_carbs_i).text("Net Carbs");
    header_tr_element.find('td').eq(net_carbs_i).addClass("alt");
    header_tr_element.find('td').eq(net_carbs_i).addClass("nutrient-column");



    // Change to say net carbs
    var footer_tr_element = jQuery('tfoot tr');
    footer_tr_element.find('td').eq(net_carbs_i).text("Net Carbs");
    footer_tr_element.find('td').eq(net_carbs_i).addClass("alt");
    header_tr_element.find('td').eq(net_carbs_i).addClass("nutrient-column");


    var alreadyCountedFiber = [0];
    var alreadyCountedFiberIdx = 0;
    var food_tr_elements = jQuery('tr');

    food_tr_elements.each(function() {
        if($(this).hasClass('bottom')) {
            alreadyCountedFiberIdx++;
            alreadyCountedFiber[alreadyCountedFiberIdx] = 0;
        }

        var tds = jQuery(this).find('td');
        var carbs = parseFloat(tds.eq(carbs_i).text());
        var fiber = parseFloat(tds.eq(fiber_i).text());

        //fiber = parseInt(fiber);
        //cals = parseInt(cals);

        // Find only food rows!
        var delete_td = tds.eq(tds.length - 1);
        if (delete_td.hasClass('delete')) {
			var name = jQuery(this).find('.js-show-edit-food').text().toLowerCase();

			tds.eq(net_carbs_i).text(carbs - fiber);

            if (name.indexOf("net carbs") !== -1 || (carbs - fiber) < 0) {
                alreadyCountedFiber[alreadyCountedFiberIdx] += Number(fiber);
                tds.eq(net_carbs_i).text(carbs);
            }
        }
    });
    
    totalAlreadyCountedFiber = 0;
    for (var i=0; i < alreadyCountedFiber.length; i++){ totalAlreadyCountedFiber += alreadyCountedFiber[i];}


    var bottom_tr_elements = jQuery('.food_container tr.bottom, .food_container tr.total');
    var meal_idx = 0;
    bottom_tr_elements.each(function() {

        if (jQuery(this).hasClass('remaining')) {
            return false; /* continue */
        }

        var tds = jQuery(this).find('td');
        var cals = parseFloat(tds.eq(calories_i).text());
        if($(this).hasClass('bottom')) {
            var carbs = parseFloat(tds.eq(carbs_i).text()) + alreadyCountedFiber[meal_idx];
        } else {
            var carbs = parseFloat(tds.eq(carbs_i).text());
        }
        var fiber = parseFloat(tds.eq(fiber_i).text());
        var protein = parseFloat(tds.eq(protein_i).text());
        var fat = parseFloat(tds.eq(fat_i).text());

        var net_carbs = carbs;

        // HACK to show net carbs
        if (!jQuery(this).hasClass('alt')) {
            net_carbs = carbs - fiber;
            if (!isNaN(net_carbs)) {
                tds.eq(net_carbs_i).text(net_carbs);
            } else if (jQuery(this).hasClass("total")) {
                tds.eq(net_carbs_i).text("0");
            }
        } else {
            // record goal
            net_carb_total_goal = net_carbs - totalAlreadyCountedFiber;
        }


        /* do nothing if cannot calculate for the row */
        if (isNaN(cals) ||
            isNaN(carbs) ||
            isNaN(protein) ||
            isNaN(fat) ||
            isNaN(fiber) ||
            isNaN(net_carbs) ||
            cals === 0) {
            meal_idx++;
            return true;

        }

        tds.eq(net_carbs_i).text(net_carbs);


        // if (net_carbs == 0 &&
        //     protein == 0 &&
        //     fat == 0) {
        //     return true;
        // }

        var carb_cals = (net_carbs * 4);
        var protein_cals = (protein * 4);
        var fat_cals = (fat * 9);

        if (jQuery(this).hasClass('total') &&
            !jQuery(this).hasClass('alt') &&
            daily_total_carbs === 0) {

            daily_total_carbs = carb_cals;
            daily_total_protein = protein_cals;
            daily_total_fat = fat_cals;
            net_carb_total = net_carbs - totalAlreadyCountedFiber;

        }

        var real_cals = carb_cals + protein_cals + fat_cals;

        var carb_pct = ((carb_cals / real_cals) * 100).toFixed(2);
        var fat_pct = ((fat_cals / real_cals) * 100).toFixed(2);
        var protein_pct = ((protein_cals / real_cals) * 100).toFixed(2);

        //alert(daily_total_carbs + ", " + daily_total_protein + ", " + daily_total_fat + ", " + net_carb_total);

        carb_pct = Math.round(carb_pct);
        fat_pct = Math.round(fat_pct);
        protein_pct = Math.round(protein_pct);

        tds.each(function() {
            jQuery(this).append('<div class="myfp_us" style="color:#0a0;font-size:9px;text-align:center;">&nbsp;</div>');
        });

        tds.eq(0).find('div.myfp_us').html("");

        /*tds.eq(calories_i).find('div.myfp_us').html(real_cals);*/

        if (!isNaN(carb_pct)) {
            tds.eq(net_carbs_i).find('div.myfp_us').html(carb_pct + "%");
        }

        if (!isNaN(fat_pct)) {
            tds.eq(fat_i).find('div.myfp_us').html(fat_pct + "%");
        }

        if (!isNaN(protein_pct)) {
            tds.eq(protein_i).find('div.myfp_us').html(protein_pct + "%");
        }

        meal_idx++;
    });

    var remaining_tr_elements = jQuery('.food_container tr.total.remaining');

    remaining_tr_elements.each(function() {

        // Show remaining as net carbs
        var net_carbs = net_carb_total_goal - net_carb_total - totalAlreadyCountedFiber;
        var tds = jQuery(this).find('td');
        tds.eq(net_carbs_i).text(parseInt(net_carbs));

        // Fix color
        tds.eq(net_carbs_i).removeClass("positive");
        tds.eq(net_carbs_i).removeClass("negative");

        if (net_carbs < 0) {
            tds.eq(net_carbs_i).addClass("negative");
        } else {
            tds.eq(net_carbs_i).addClass("positive");
        }

    });




    if (daily_total_carbs !== 0 ||
        daily_total_protein !== 0 ||
        daily_total_fat !== 0) {

        jQuery('.food_container').append('<div id="google_graph_1"></div>');

        var data1 = new google.visualization.DataTable();
        data1.addColumn('string', 'Type');
        data1.addColumn('number', 'Cals');
        data1.addRows(
            [
                ['Net Carbs', daily_total_carbs],
                ['Protein', daily_total_protein],
                ['Fat', daily_total_fat]
            ]
        );

        var chart = new google.visualization.PieChart(document.getElementById('google_graph_1'));
        chart.draw(data1, {
            width: 350,
            height: 300,
            title: 'Daily Totals by Calories (This is what you use for your macro ratios)'
        });
        document.getElementById('google_graph_1').style.cssFloat = "left";

        jQuery('.food_container').append('<div id="google_graph_2"></div>');

        var carb_grams = daily_total_carbs / 4;
        var pro_grams = daily_total_protein / 4;
        var fat_grams = daily_total_fat / 9;

        var data2 = new google.visualization.DataTable();
        data2.addColumn('string', 'Type');
        data2.addColumn('number', 'Grams');
        data2.addRows(
            [
                ['Net Carbs (' + carb_grams + 'g)', carb_grams],
                ['Protein (' + pro_grams + 'g)', pro_grams],
                ['Fat (' + fat_grams + 'g)', fat_grams]
            ]
        );

        var chart2 = new google.visualization.PieChart(document.getElementById('google_graph_2'));
        chart2.draw(data2, {
            width: 350,
            height: 300,
            title: 'Daily Totals by Grams'
        });
        document.getElementById('google_graph_2').style.cssFloat = "right";
    }
}
