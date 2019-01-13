var plugin = {},
    common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js')
    // moment = require('moment');

var log = common.log('treemap:api');

(function() {

    plugins.register("/o/treemap", function(ob) {
        var params = ob.params;
        if (true || params.qstring.method === "treemap") {
            var appId = params.qstring.app_id;

            var criteria = {};
            var project = { _id: 0 };
            var levels = [];
            Object.keys(params.qstring).forEach(prop => {
              if (prop.startsWith("level")) {
                criteria[params.qstring[prop]] = { $exists: true };
                project[params.qstring[prop]] = 1;
                var levelNo = prop.substring(5);
                levels[Number.parseInt(levelNo) - 1] = params.qstring[prop];
              }
            })
            log.i("levels", levels);
            var collectionName = "app_users" + appId;

            fetchTreemapData(collectionName, criteria, project, levels, function(err, result) {
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
    function fetchTreemapData(collectionName, criteria, project, levels, callback) {
        common.db.collection(collectionName).find(criteria).toArray(function(err, results) {
            if (err) {
                return callback(err);
            }
            var root = { name: "Users", children: {} };
            results.forEach(d => {
              var vals = levels.map(prop => d[prop]);
              var parent = root;             
              vals.forEach((val,i) => {
                const leafNode = i+1 == vals.length;
                if (!parent.children.hasOwnProperty(val)) {
                  var node = { name: val };
                  if (!leafNode) {
                    node.children = {};
                  }
                  else {
                    node.value = 1;
                  } 
                  parent.children[val] = node;
                } 
                else if (leafNode) {
                  parent.children[val].value++;
                } 
                parent = parent.children[val];
              }); 
            });
            // let's convert children objects to arrays as required by d3 using breadh-first search
            var q = [root];
            while (q.length > 0) {
              var node = q.pop();
              if (node.children) {
                node.children = Array.from(Object.values(node.children));
                q.push(...node.children);
              }
            }
            return callback(null, root);
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
