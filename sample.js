window.iWebRoot = location.href.substring(0, location.href.toLowerCase().indexOf("iweb") + 5);

var PageInfo = {
    TopWindow: (window.frameElement == null),
    FullURL: location.href,
    Page: null,
    FormKey: null,
    WizardKey: null,
    WizardStep: null,
    Site: null,
    UserKey: null,
    BrowserVersion: window.navigator.appVersion,
    LoadTime: (new Date().getTime())
}

var CustomJS = {
    Log: function (logText) {
        console.log("CustomJS:: " + logText);
    },
    LogData: function (logText, logData) {
        console.log("CustomJS:: " + logText, logData);
    },
    ConcurrentTabMonitor: {
        LogMessages: false,
        AllowedPages: ['/reports/', 'managecommpreferences.aspx', 'dynamicquerysql.aspx', 'demographicssetup.aspx', 'demographicssetupmultiselect.aspx'],
        IsAllowedPage: function () {
            for (var i in CustomJS.ConcurrentTabMonitor.AllowedPages) {
                let page = CustomJS.ConcurrentTabMonitor.AllowedPages[i];
                if (PageInfo.FullURL.toLowerCase().indexOf(page) > -1) return true;
            };
            return false;
        },
        Init: function () {
            CustomJS.ConcurrentTabMonitor.TabID = new Date().getTime();
            CustomJS.ConcurrentTabMonitor.Channel = new BroadcastChannel("iWeb_Tab_Monitor");
            CustomJS.ConcurrentTabMonitor.Channel.onmessage = CustomJS.ConcurrentTabMonitor.Receive;
            if (PageInfo.TopWindow && !CustomJS.ConcurrentTabMonitor.IsAllowedPage()) {
                setInterval(CustomJS.ConcurrentTabMonitor.Broadcast, 2500);
            }
            setInterval(CustomJS.ConcurrentTabMonitor.Resolve, 500);
            $('body').on('dblclick', '#ConcurrentTabAlert', function () {
                if (localStorage.getItem("CustomJS.ConcurrentTabMonitor.NonIntrusive") == null) {
                    localStorage.setItem("CustomJS.ConcurrentTabMonitor.NonIntrusive", true);
                } else {
                    localStorage.removeItem("CustomJS.ConcurrentTabMonitor.NonIntrusive");
                }
            });
        },
        Broadcast: function () {
            var msg = {
                TabID: CustomJS.ConcurrentTabMonitor.TabID,
                TabLoadTime: PageInfo.LoadTime,
                Site: PageInfo.Site
            }
            if (CustomJS.ConcurrentTabMonitor.LogMessages) {
                CustomJS.LogData("CTM:Broadcast", msg);
            }
            CustomJS.ConcurrentTabMonitor.Channel.postMessage(msg);
        },
        Receive: function (ev) {
            if (CustomJS.ConcurrentTabMonitor.LogMessages) {
                CustomJS.LogData("CTM:Receive", ev.data);
            }
            if (ev.data.Site != PageInfo.Site || !PageInfo.TopWindow || CustomJS.ConcurrentTabMonitor.IsAllowedPage()) return;
            CustomJS.ConcurrentTabMonitor.LastAlertTime = (new Date().getTime());
            $('#ConcurrentTabAlert').remove();
            $('#ConcurrentTabOverlay').remove();
            if (localStorage.getItem("CustomJS.ConcurrentTabMonitor.NonIntrusive") == null) {
                $('body').append(`<div id="ConcurrentTabAlert" style="
                position: fixed; top: 0; right: 0; left: 0; z-index: 99999; height: 3em;
                line-height: 3em; background: red; font-size: 2em; text-align: center; font-weight: bold;">
                You have multiple netForum tabs open. Please only use one tab!</div>`);
                console.log("My load time: " + PageInfo.LoadTime);
                console.log("Event load time: " + ev.data.TabLoadTime);
                if (ev.data.TabLoadTime < PageInfo.LoadTime) {
                    $('body').append(`<div id="ConcurrentTabOverlay" style="
                    position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 99998;
                    background: red; opacity: .25;
                    "></div>`);
                }
            } else {
                $('body').append(`<div id="ConcurrentTabAlert" style="
                position: fixed; top: 0; left: 0; z-index: 99999; height: 3em; width: 215px;
                line-height: 2.5em; background: red; font-size: 1.5em; text-align: center;">
                Multiple tabs in use</div>`);
            }
        },
        Resolve: function () {
            if ((new Date().getTime() - CustomJS.ConcurrentTabMonitor.LastAlertTime) > 3000) {
                $('#ConcurrentTabAlert').remove();
                $('#ConcurrentTabOverlay').remove();
            }
        },
        Channel: null,
        TabID: null,
        LastAlertTime: null
    },
    Styles: {
        Elements: {
            mainbg: {
                name: 'Main Background',
                selector: 'body#BodyTag, body#BodyTag table',
                rules: ['background-color']
            },
            textcolor: {
                name: 'Text Color',
                selector: 'body#BodyTag, .mltDetail .tinyTXTWhite, .CRMCalDate, .CRMCalDay, .ProfileBODY, .ProfileTXT, .ProfiletinyTXT, #SessionDialogExp, .stagesDiv ul li a:hover',
                rules: ['color']
            },
            fontweight: {
                name: 'Font Weight',
                selector: 'BODY, p, table, textarea, .fixed-form pre, .fixed-form code, fixed-form.label, button, input, select, .DataFormDropDownList',
                rules: ['font-weight', 'letter-spacing']
            },
            fontsize: {
                name: 'Font Size',
                selector: 'BODY, p, table, textarea, .fixed-form pre, .fixed-form code, fixed-form.label, button, input, select, .DataFormDropDownList',
                rules: ['font-size']
            },
            profilefontsize: {
                name: 'Font Size',
                selector: '.ProfileBODY, .ProfileTXTLight',
                rules: ['font-size']
            },
            sidebg: {
                name: 'Sidebar Background',
                selector: '.sidebar-nav ul',
                rules: ['background-color']
            },
            sidetext: {
                name: 'Sidebar Text',
                selector: '.sidebar-nav ul a',
                rules: ['color']
            },
            childheaderbg: {
                name: 'Child Form Header Background',
                selector: '.DataFormChildTABLE .module-header',
                'rules': ['background-color']
            },
            childheadertext: {
                name: 'Child Form Header Text Color',
                selector: '.DataFormChildTABLE .module-header',
                'rules': ['color']
            }
        },
        Presets: {
            'blacktext': {
                description: "Black text on white backgrounds",
                order: 99,
                rules: {
                    mainbg: {
                        background_color: '#FFF'
                    },
                    textcolor: {
                        color: '#000'
                    },
                    sidetext: {
                        color: '#000'
                    },
                    childheaderbg: {
                        background_color: '#FFF'
                    }
                }
            },
            'boldtext': {
                description: "Bold most text",
                order: 99,
                rules: {
                    fontweight: {
                        font_weight: '600',
                        letter_spacing: '.1px'
                    }
                }
            },
            'ninepointtext': {
                description: "Increase text size",
                order: 99,
                rules: {
                    fontsize: {
                        font_size: '9pt'
                    },
                    profilefontsize: {
                        font_size: '1em'
                    }
                }
            },
            'whiteondark': {
                description: "White text on dark background",
                order: 99,
                rules: {
                    mainbg: {
                        background_color: '#2b2b2b'
                    },
                    textcolor: {
                        color: '#FFF'
                    },
                    sidebg: {
                        background_color: '#2b2b2b'
                    },
                    sidetext: {
                        color: '#FFF'
                    },
                    childheaderbg: {
                        background_color: '#000'
                    }
                },
                rawcss: `aside.sidebar {background-color: #2b2b2b;}
                .form-button-style-3 {color: #007b8b;}
                .ProfileTitleContainer {color: #000;}
                .ProfileTitleLight, .ProfileTitleLight {background-color: #2b2b2b;}
                #header-actions li ul.open-menu {background-color: #2b2b2b;}
                table.DataFormChildTABLE table.table tr:hover {color: #000;}
                div#div1 {background-color: #2b2b2b;}
                #breadcrumb-container {background-color: #2b2b2b;}
                #breadcrumb {background-color: #919191; color: #FFF;}
                .breadcrumb>.active {color: #FFF;}
                #breadcrumb li {text-shadow: none !important;}
                input, select, textarea {background-color: #6b6b6b !important;}`
            }
        },
        Apply: function () {
            $('#PACStyle').remove();

            CustomJS.Styles.Settings = JSON.parse(localStorage.getItem("CustomJS.Styles.Settings"));

            //Add the style element to the DOM
            var styleEl = document.createElement("style");
            styleEl.id = "PACStyle";
            styleEl.appendChild(document.createTextNode(""));
            document.body.appendChild(styleEl);
            CustomJS.Styles.Sheet = styleEl.sheet;

            for (var presetName in CustomJS.Styles.Presets) {
                if (CustomJS.Styles.Settings[presetName] !== true) continue;
                var objPreset = CustomJS.Styles.Presets[presetName];
                for (var element in objPreset.rules) {
                    var rule = objPreset.rules[element];
                    if (CustomJS.Styles.Elements[element] == null) {
                        CustomJS.Log("PACStyles unable to find rule for " + element);
                    }
                    var cssRule = CustomJS.Styles.Elements[element].selector + " {";
                    for (var style in rule) {
                        cssRule += style.replace("_", "-") + ": " + rule[style] + ";";
                    }
                    cssRule += "}"
                    CustomJS.Styles.Sheet.insertRule(cssRule, 0);
                }
                if (objPreset.rawcss != null) {
                    var rawRules = objPreset.rawcss.split("\n");
                    for (var rule in rawRules) {
                        CustomJS.Styles.Sheet.insertRule(rawRules[rule]);
                    }
                }
            }

            for (var presetName in CustomJS.Styles.Presets) {
                $('input#PACStyle-' + presetName).prop("checked", CustomJS.Styles.Settings[presetName]);
            }
        },
        Save: function () {
            localStorage.setItem("CustomJS.Styles.Settings", JSON.stringify(CustomJS.Styles.Settings));
        },
        Init: function () {
            $('input[id^=PACStyle]').click(function () {
                var preset = this.id.substring(9);
                var active = $(this).prop('checked');
                CustomJS.Log("Set style " + preset + ' to ' + active);
                CustomJS.Styles.Settings[preset] = active;
                CustomJS.Styles.Save();
                CustomJS.Styles.Apply();
            });

            if (localStorage.getItem("CustomJS.Styles.Settings") == null) {
                CustomJS.Log("No saved styles found - setting defaults");
                CustomJS.Styles.Settings = {};
                for (var presetName in CustomJS.Styles.Presets) {
                    CustomJS.Styles.Settings[presetName] = false;
                }
                CustomJS.Styles.Save();
            }

            CustomJS.Styles.Apply();
        }
    },
    Init: function () {
        CustomJS.Log("Initializing, top window is " + PageInfo.TopWindow);

        if (location.href.indexOf('.aspx') >= 0) {
            PageInfo.Page = location.href.substring(location.href.lastIndexOf('/', location.href.indexOf('.aspx')) + 1, location.href.indexOf('.aspx') + 5);
            PageInfo.FormKey = location.href.substring(location.href.toLowerCase().indexOf('formkey=') + 8, location.href.toLowerCase().indexOf('formkey=') + 44);
            PageInfo.WizardKey = location.href.toLowerCase().indexOf('wizardkey=') < 0 ? null : location.href.substring(location.href.toLowerCase().indexOf('wizardkey=') + 10, location.href.toLowerCase().indexOf('wizardkey=') + 46);
            PageInfo.WizardStep = location.href.toLowerCase().indexOf('wizardstep=') < 0 ? null : location.href.substring(location.href.toLowerCase().indexOf('wizardstep=') + 11, location.href.toLowerCase().indexOf('wizardstep=') + 47);
        } else {
            PageInfo.Page = location.href.substring(location.href.toLowerCase().indexOf("iweb/forms/") + 10);
        }


        if (location.host.indexOf('local') > 0) {
            PageInfo.Site = location.host;
        } else if (location.href.toLowerCase().indexOf('nfpacdev') > 0) {
            PageInfo.Site = "DEV";
        } else if (location.href.toLowerCase().indexOf('nfpactest') > 0) {
            PageInfo.Site = "TEST";
        } else {
            PageInfo.Site = "LIVE";
        }

        var profileHref = $('a:contains(My Profile)').attr('href');
        if (profileHref != null) {
            var profileQueryString = profileHref.split("?")[1];
            var profileParams = profileQueryString.split("&");
            $.each(profileParams, function (i, item) {
                if (PageInfo.UserKey != null) return;
                var kv = item.split("=");
                if (kv[0].toLowerCase() == "key") {
                    PageInfo.UserKey = kv[1].toLowerCase();
                    return;
                }
            });
        }

        //Add edit icon to header
        $('#header-actions').append('<li id="header-CustomJS" data-toggle="tooltip" data-placement="bottom" data-original-title="PAC Customizations"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-pencil-square fa-stack-1x fa-inverse"></i></span></li>');
        var customSettingsPane = `<ul id="CustomJSSettings" style="display:none;">
        <li><div class="list-header"><div class="row"><div class="col-md-12"><h5>Readability/Colors</h5></div></div></div></li>`;
        for (var presetName in CustomJS.Styles.Presets) {
            var preset = CustomJS.Styles.Presets[presetName];
            customSettingsPane += '<li><span class="list-item-data"><input type="checkbox" id="PACStyle-' + presetName + '" /><label for="PACStyle-' + presetName + '">' + preset.description + '</label></span></li>';
        }
        customSettingsPane += `<li><div class="list-header"><div class="row"><div class="col-md-12"><h5>Tools</h5></div></div></div></li>`;
        customSettingsPane += `<li><span class="list-item-data"><a href="#" id="CustomResetChildForms">Fix Child Forms not opening</a></span></li>
        </ul>`;

        $('#header-CustomJS').append(customSettingsPane);
        $('#header-CustomJS').tooltip();
        for (var component in CustomJS) {
            if (typeof (CustomJS[component].Init) == "function") CustomJS[component].Init();
        }

        //Event handlers for settings items
        $('#CustomResetChildForms').click(function () {
            if (confirm("This will reset all child forms; only use it if your child forms will not open. Continue?")) {
                document.cookie = "netForumChildForm=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                location.reload();
            }
        });

        //Non-LIVE alert
        var href = location.href.toLowerCase();
        if (PageInfo.Site != "LIVE") {
            if (PageInfo.TopWindow) {
                $('div#header').addClass('TestSiteMode');
            }
        }

        //Double-click to set current date
        $('input.DatePicker').dblclick(function () {
            var d = new Date();
            $(this).val((d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()).css('background-color', '#fff38e');
        });
    }
}

$(document).ready(function () {
    if (location.href.toLowerCase().indexOf('/eweb') != -1) {
        console.log("Eweb detected - bailing out");
        return;
    }
    if (typeof (Storage) == "undefined") {
        console.log("CustomJS requires LocalStorage support. Exiting");
    }
    CustomJS.Init();
});