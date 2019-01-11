var plugin = {},
    common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js'),
    moment = require('moment');

(function() {

    plugins.register("/o", function(ob) {
        var params = ob.params;

        if (params.qstring.method === "treemap") {
            var appId = params.qstring.app_id;

            var criteria = {};
            var project = { _id: 0 };
            Object.keys(params.qstring).forEach(prop => {
              if (prop.startsWith("level")) {
                criteria[params.qstring[prop]] = { $exists: true };
                project[params.qstring[prop]] = 1;
              }
            })


            var collectionName = "app_users" + appId;

            fetchTreemapData(collectionName, criteria, project, function(err, result) {
                if (err) {
                    console.log("Error while fetching treemap data: ", err.message);
                    common.returnMessage(params, 400, "Error while fetching treemap data");
                    return false;
                }

                common.returnOutput(params, result);
                return true;
            });
            return true;
        }
        return false;
    });

    /**
     * Fetch Treemap Visualization Plugin Data
     * @param {string} collectionName | Name of collection
     * @param {object} criteria | Filter object
     * @param {func} callback | Callback function
     */
    function fetchTreemapData(collectionName, criteria, project, callback) {
        common.db.collection(collectionName).find(criteria, project).toArray(function(err, results) {
            if (err) {
                return callback(err);
            }

            return callback(null, results);
        });
    }

    /*
    plugins.register("/dashboard/data", function(ob) {
        return new Promise((resolve) => {
            var data = ob.data;

            if (data.widget_type === "treemap") {
                var collectionName = "";
                var criteria = {};

                var appId = data.apps[0];
                var dataType = data.data_type;
                let period = data.period;

                var treemapType = "[CLY]_session";

                if (dataType === "event") {
                    var event = data.events[0];
                    var eventKey = event.split("***")[1];
                    treemapType = eventKey;
                }

                criteria = {
                    "s": treemapType
                };

                var periodRange = getDateRange(period);

                if (periodRange) {
                    criteria.m = { $in: periodRange.split(',') };
                }

                collectionName = "treemap" + appId;
                fetchTreemapData(collectionName, criteria, function(err, result) {
                    data.dashData = {
                        data: result || []
                    };
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    });
    */
}(plugin));

module.exports = plugin;
