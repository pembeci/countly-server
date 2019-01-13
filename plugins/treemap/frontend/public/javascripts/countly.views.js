/*global $,countlyView,countlyGlobal,Handlebars,treemapPlugin,jQuery,countlyCommon,app,moment,treemapview,countlyDashboards */
window.treemapview = countlyView.extend({

    initialize: function() { 
       this.maxLevel = 3;    
       this.initLevels = ["p", "brw", "la"];
       this.selectedLevels = Array.from({length: this.maxLevel}).map((v,i) => null); 
       this.props = { 'p': 'Platform', 'brw': 'Browser', 'la': 'Language', 'cc': 'Country', 'r': 'Resolution' };
                      // 'd': 'Device', 'c': 'Carrier',  };       
    },

    beforeRender: function() {
        var self = this;
        if (!this.template) {
            return $.when($.get(countlyGlobal.path + '/treemap/templates/treemap.html', function(src) {
                self.template = Handlebars.compile(src);
            }) )
        }
    }, 
    
    renderCommon: function(isRefresh) {
        this.templateData = {
            "page-title": jQuery.i18n.map["treemap.plugin-title"],
            "levels": Array.from({length: this.maxLevel}).map((v,i) => i+1)
        };

        if (!isRefresh) {
            $(this.el).html(this.template(this.templateData));
            this.populateProps();
            this.updateView();

            var self = this;
            /*
            $('.ds').on('click', function() {
                var id = $(this).attr('id');

                $('.ds').removeClass('active').removeClass('selected');
                $(this).addClass('active').addClass('selected');

                switch (id) {
                case "ds_this":
                    self.date_range = self.getDateRange('current');
                    break;
                case "ds_previous":
                    self.date_range = self.getDateRange('previous');
                    break;
                case "ds_last_3":
                    self.date_range = self.getDateRange('last_3');
                    break;
                default:
                    self.date_range = self.getDateRange();
                    break;
                }

                $.when(
                    treemapPlugin.fetchTreemapData(self.treemap_type, self.date_range),
                    treemapPlugin.fetchAllEvents()
                ).done(function() {
                    self.timesOfDayData = treemapPlugin.getTreemapData();
                    self.eventsList = treemapPlugin.getEventsList();
                    self.updateView();
                });
            });
            */
        }
    },

    updateView: function() {
        console.log("updateView", this);
        let selected = this.selectedLevels;
        if (!selected[0]) {
            // initial. temporary.
            selected = this.initLevels;
        }
        $('#chart').empty();  
        const selectedNames = selected.map(prop => this.props[prop]);        
        this.loadTreemap(selected, selectedNames);        
    },
    
    populateProps: function() {
        const self = this;
        this.templateData.levels.forEach(level => {
            const list = $(`#props-list${level}`);
            list.append(`<div class="group">Level ${level}</div>`);
            Object.entries(this.props).forEach( arr => {
                const [prop, val] = arr
                list.append(`<div data-value="${prop}" class="es-option item" data-localize="">${val}</div>`);
            })
            $(".cly-select").eq(level-1).on("cly-select-change", (e, option) => {
                self.selectedLevels[level-1] = option;
                console.log(self.selectedLevelNames);
            })
            
        });
        $('#treemap-submit').click(() => { this.updateView(); }); 
    },
    
    loadTreemap: function(selectedLevels, selectedNames) {
        console.log("loadTreemap view", selectedLevels, selectedNames);
        treemapPlugin.loadTreemap(selectedLevels, selectedNames);
    },
    
    refresh: function() {
    },
});

app.treemapview = new treemapview();

app.route('/analytics/treemap', 'treemap', function() {
    this.renderWhenReady(this.treemapview);
});

app.addPageScript("/custom#", function() {
    addWidgetType();
    addSettingsSection();

    /**
     * Adding widget type
     */
    function addWidgetType() {
        var treemapWidget = '<div data-widget-type="treemap" class="opt cly-grid-5">' +
                            '    <div class="inner">' +
                            '        <span class="icon treemap"></span>' + jQuery.i18n.prop("treemap.times") +
                            '    </div>' +
                            '</div>';

        $("#widget-drawer .details #widget-types .opts").append(treemapWidget);
    }

    /**
     * Adding settings section
     */
    function addSettingsSection() {
        var setting = '<div id="widget-section-single-treemap" class="settings section">' +
                        '    <div class="label">' + jQuery.i18n.prop("treemap.period") + '</div>' +
                        '    <div id="single-treemap-dropdown" class="cly-select" style="width: 100%; box-sizing: border-box;">' +
                        '        <div class="select-inner">' +
                        '            <div class="text-container">' +
                        '                <div class="text">' +
                        '                    <div class="default-text">' + jQuery.i18n.prop("treemap.select") + '</div>' +
                        '                </div>' +
                        '            </div>' +
                        '            <div class="right combo"></div>' +
                        '        </div>' +
                        '        <div class="select-items square" style="width: 100%;"></div>' +
                        '    </div>' +
                        '</div>';

        var barColors = '<div id="treemap-widget-section-bar-color" class="settings section" style="margin-bottom: 55px;">' +
                        '    <div class="label">' + jQuery.i18n.prop("dashboards.bar-color") + '</div>' +
                        '    <div id="treemap-bar-colors" class="colors">' +
                        '        <div data-color="1" class="color alt1 selected"></div>' +
                        '        <div data-color="2" class="color alt2"></div>' +
                        '        <div data-color="3" class="color alt3"></div>' +
                        '        <div data-color="4" class="color alt4"></div>' +
                        '    </div>' +
                        '</div>';

        $(setting).insertAfter(".cly-drawer .details .settings:last");
        $(barColors).insertAfter(".cly-drawer .details .settings:last");

    }

    $("#treemap-bar-colors").off("click").on("click", ".color", function() {
        $("#treemap-bar-colors").find(".color").removeClass("selected");
        $(this).addClass("selected");

        $("#widget-drawer").trigger("cly-widget-section-complete");
    });

    $("#single-treemap-dropdown").on("cly-select-change", function() {
        $("#widget-drawer").trigger("cly-widget-section-complete");
    });
});

$(document).ready(function() {
    var menu = '<a href="#/analytics/treemap" class="item" ">' +
        '<div class="logo fa fa-plugin" style="background-image:none; font-size:24px; text-align:center; width:35px; margin-left:14px; line-height:42px;"></div>' +
        '<div class="text" data-localize="treemap.plugin-title"></div>' +
        '</a>';

    $('.sidebar-menu #analytics-submenu').append(menu);

    initializeTimesOfDayWidget();
});

/**
 * Initialize times of day widget.
 */
function initializeTimesOfDayWidget() {

    if (countlyGlobal.plugins.indexOf("dashboards") < 0) {
        return;
    }

    var treemapWidgetTemplate;
    var periods = [
        {
            name: jQuery.i18n.map['treemap.all-time'],
            value: "all"
        },
        {
            name: jQuery.i18n.map['treemap.this-month'],
            value: "current"
        },
        {
            name: jQuery.i18n.map['treemap.previous-month'],
            value: "previous"
        },
        {
            name: jQuery.i18n.map['treemap.last-3-months'],
            value: "last_3"
        }
    ];

    $.when(
        $.get(countlyGlobal.path + '/treemap/templates/widget.html', function(src) {
            treemapWidgetTemplate = Handlebars.compile(src);
        })
    ).then(function() {

        var widgetOptions = {
            init: initWidgetSections,
            settings: widgetSettings,
            placeholder: addPlaceholder,
            create: createWidgetView,
            reset: resetWidget,
            set: setWidget,
            refresh: refreshWidget
        };

        app.addWidgetCallbacks("treemap", widgetOptions);
    });

    /**
     * Initialize widget section.
     */
    function initWidgetSections() {
        var selWidgetType = $("#widget-types").find(".opt.selected").data("widget-type");

        if (selWidgetType !== "treemap") {
            return;
        }

        $("#single-treemap-dropdown").clySelectSetItems(periods);

        var dataType = $("#data-types").find(".opt.selected").data("data-type");

        $("#widget-drawer .details #data-types").parent(".section").show();
        $("#data-types").find(".opt[data-data-type=push]").addClass("disabled");
        $("#data-types").find(".opt[data-data-type=crash]").addClass("disabled");
        $("#widget-section-single-app").show();
        $("#treemap-widget-section-bar-color").show();
        $("#widget-section-single-treemap").show();
        if (dataType === "event") {
            $("#widget-section-single-event").show();
        }
    }

    /**
     * Get Widget settings
     * @returns {object} | Settings object
     */
    function widgetSettings() {
        var $singleAppDrop = $("#single-app-dropdown"),
            $singleEventDrop = $("#single-event-dropdown"),
            dataType = $("#data-types").find(".opt.selected").data("data-type"),
            $barColors = $("#treemap-bar-colors"),
            $singleTreemapDrop = $("#single-treemap-dropdown");

        var selectedApp = $singleAppDrop.clySelectGetSelection(),
            selectedEvent = $singleEventDrop.clySelectGetSelection(),
            barColor = $barColors.find(".color.selected").data("color"),
            selectedTreemapPeriod = $singleTreemapDrop.clySelectGetSelection();

        var settings = {
            apps: (selectedApp) ? [ selectedApp ] : [],
            data_type: dataType,
            bar_color: barColor,
            period: selectedTreemapPeriod
        };

        if (dataType === "event") {
            settings.events = (selectedEvent) ? [ selectedEvent ] : [];
        }

        return settings;
    }

    /**
     * Adding placeholder
     * @param {object} dimensions | Dimension object
     */
    function addPlaceholder(dimensions) {
        dimensions.min_height = 3;
        dimensions.min_width = 4;
        dimensions.width = 4;
        dimensions.height = 3;
    }

    /**
     * Create widget view
     * @param {object} widgetData | Widget data
     */
    function createWidgetView(widgetData) {
        var placeHolder = widgetData.placeholder;

        formatData(widgetData);
        render();

        /**
         * Render function
         */
        function render() {
            var title = widgetData.title,
                app = widgetData.apps,
                data = widgetData.formattedData,
                period = widgetData.period;

            var appName = countlyGlobal.apps[app[0]].name,
                appId = app[0];

            var $widget = $(treemapWidgetTemplate({
                title: title,
                app: {
                    id: appId,
                    name: appName
                },
                data: data
            }));

            placeHolder.find("#loader").fadeOut();
            placeHolder.find(".cly-widget").html($widget.html());

            if (!title) {
                var periodName = periods.filter(function(obj) {
                    return obj.value === period;
                });
                var esTypeName = widgetData.data_type === "session" ? jQuery.i18n.map['treemap.sessions'] : widgetData.events[0].split("***")[1];
                var widgetTitle = "Times of day: " + esTypeName + " (" + periodName[0].name + ")";
                placeHolder.find(".title").text(widgetTitle);
            }

            addTooltip(placeHolder);

            $(".crcl").on({
                mouseenter: function() {
                    $(".crcl").removeClass("hover");
                    $(this).addClass("hover");
                },
                mouseleave: function() {
                    $(".crcl").removeClass("hover");
                }
            });

            placeHolder.find(".treemap").off("resize").on("resize", function() {
                if (placeHolder.find(".treemap").width() >= 690) {
                    placeHolder.find(".treemap table th:nth-child(2n+1)").css({ "visibility": "visible"});
                }
                else {
                    placeHolder.find(".treemap table th:nth-child(2n+1)").css({ "visibility": "hidden"});
                }
            });
        }
    }

    /**
     * Format widget data
     * @param {object} widgetData | Widget data
     */
    function formatData(widgetData) {
        var data = widgetData.dashData.data;

        var labelsX = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
        var labelsY = [
            {
                dispLabel: jQuery.i18n.map['treemap.sunday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.sunday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.monday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.monday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.tuesday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.tuesday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.wednesday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.wednesday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.thursday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.thursday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.friday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.friday'],
                data: []
            },
            {
                dispLabel: jQuery.i18n.map['treemap.saturday'].slice(0, 2),
                label: jQuery.i18n.map['treemap.saturday'],
                data: []
            },
        ];

        var barColors = ["rgba(111, 163, 239, 1)", "rgba(85, 189, 185, 1)", "rgba(239, 136, 0, 1)", "rgba(174, 131, 210, 1)"];

        var color = barColors[widgetData.bar_color - 1 || 0];
        var maxDataValue = Math.max.apply(null, ([].concat.apply([], data))) || 1;
        var defaultColor = "rgba(255, 255, 255, .07)";
        var maxRadius = 30;
        var minRadius = 7;

        var averages = [];
        var reducer = function(c, acc, current, y) {
            return acc + data[y][c];
        };

        for (var c = 0; c <= 23; c++) {
            var total = [0, 1, 2, 3, 4, 5, 6].reduce(reducer.bind(this, c), 0);
            averages.push(total / 7);
        }

        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                var fill = parseFloat((data[i][j] / maxDataValue).toFixed(2));
                var radius = ((maxRadius - minRadius) * fill) + minRadius;
                var setColor = defaultColor;
                if (radius > minRadius) {
                    setColor = color.slice(0, (color.length - 2)) + fill + ")";
                }

                var startHourText = (j < 10 ? "0" + j : j) + ":00";
                var endHour = j + 1 > 23 ? 0 : j + 1;
                var endHourText = (endHour < 10 ? "0" + endHour : endHour) + ":00";

                var percentage = ((data[i][j] - averages[j]) * 100) / averages[j];

                var obj = {
                    color: setColor,
                    radius: radius,
                    count: data[i][j],
                    averagePercentage: percentage.toFixed(0),
                    startHour: startHourText,
                    endHour: endHourText
                };
                labelsY[i].data.push(obj);
            }
        }

        var sunday = labelsY[0];
        labelsY = labelsY.splice(1, 7);
        labelsY.push(sunday);

        var formattedData = {
            labelsX: labelsX,
            labelsY: labelsY,
            type: widgetData.data_type === "session" ? jQuery.i18n.map['treemap.sessions'] : widgetData.events[0].split("***")[1]
        };

        widgetData.formattedData = formattedData;
    }

    /**
     * Reset current widget
     */
    function resetWidget() {
        var $singleEventDrop = $("#single-event-dropdown"),
            $sinleTopDrop = $("#single-treemap-dropdown");

        $singleEventDrop.clySelectSetSelection("", jQuery.i18n.prop("dashboards.select-event-single"));
        $sinleTopDrop.clySelectSetSelection("", jQuery.i18n.prop("treemap.select"));

        $("#treemap-bar-colors").find(".color").removeClass("selected");
        $("#treemap-bar-colors").find(".color[data-color=1]").addClass("selected");
    }

    /**
     * Set current widget
     * @param {object} widgetData | Widget data
     */
    function setWidget(widgetData) {
        var apps = widgetData.apps;
        var dataType = widgetData.data_type;
        var events = widgetData.events;
        var barColor = widgetData.bar_color;
        var period = widgetData.period;

        var $singleAppDrop = $("#single-app-dropdown");
        var $singleEventDrop = $("#single-event-dropdown");
        var $dataTypes = $("#data-types");
        var $barColors = $("#treemap-bar-colors");
        var $singleTreemapDrop = $("#single-treemap-dropdown");

        $singleAppDrop.clySelectSetSelection(apps[0], countlyGlobal.apps[apps[0]].name);

        $dataTypes.find(".opt").removeClass("selected");
        $dataTypes.find(".opt[data-data-type=" + dataType + "]").addClass("selected");

        if (events) {
            var eventNames = {},
                deferreds = [];

            for (var i = 0; i < events.length; i++) {
                deferreds.push(countlyDashboards.getEventNameDfd(events[i], eventNames));
            }

            $.when.apply(null, deferreds).done(function() {
                $singleEventDrop.clySelectSetSelection(events[0], eventNames[events[0]]);
            });
        }

        if (barColor) {
            $barColors.find(".color").removeClass("selected");
            $barColors.find(".color[data-color=" + barColor + "]").addClass("selected");
        }

        if (period) {
            var periodName = periods.filter(function(obj) {
                return obj.value === period;
            });

            $singleTreemapDrop.clySelectSetSelection(period, periodName[0].name);
        }
    }

    /**
     * Refresh current widget
     * @param {object} widgetEl | Dome element
     * @param {object} widgetData | Widget data
     */
    function refreshWidget(widgetEl, widgetData) {
        formatData(widgetData);
        var data = widgetData.formattedData;

        var $widget = $(treemapWidgetTemplate({
            title: "",
            app: {
                id: "",
                name: ""
            },
            data: data
        }));

        widgetEl.find("table").replaceWith($widget.find("table"));
        addTooltip(widgetEl);
    }

    /**
     * Add tooltip to widget
     * @param {object} placeHolder | placeholder lib object
     */
    function addTooltip(placeHolder) {
        placeHolder.find('.treemap-body-cell .crcl circle').tooltipster({
            animation: "fade",
            animationDuration: 50,
            delay: 100,
            theme: 'tooltipster-borderless',
            trigger: 'custom',
            triggerOpen: {
                mouseenter: true,
                touchstart: true
            },
            triggerClose: {
                mouseleave: true,
                touchleave: true
            },
            interactive: true,
            contentAsHTML: true,
            functionInit: function(instance, helper) {
                instance.content(getTooltipText($(helper.origin).parents(placeHolder.find(".treemap-body-cell"))));
            }
        });

        /**
         * Get tooltip text of element
         * @param {object} jqueryEl | Dom element
         * @returns {string} | Tooltip
         */
        function getTooltipText(jqueryEl) {
            var count = jqueryEl.parents("td").data("count");
            var startHour = jqueryEl.parents("td").data("starthour");
            var endHour = jqueryEl.parents("td").data("endhour");
            var percentage = jqueryEl.parents("td").data("averagepercentage");
            var label = jqueryEl.parents("tr").data("label");
            var type = jqueryEl.parents(".treemap").find("table").data("es-type");

            var tooltipStr = "<div id='treemap-tip'>";

            type = type.toLowerCase();
            if (type !== "sessions") {
                type = type + "(s)";
            }
            tooltipStr += jQuery.i18n.prop('treemap.tooltip-1', countlyCommon.formatNumber(count), type, label, startHour, endHour) + "<br/>";
            tooltipStr += count > 0 ? jQuery.i18n.prop('treemap.tooltip-' + (percentage > 0 ? "more" : "less") + '-than', Math.abs(percentage)) : "";

            tooltipStr += "</div>";

            return tooltipStr;
        }
    }
}
