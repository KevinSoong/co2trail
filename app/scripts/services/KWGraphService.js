'use strict';

angular.module('a2App')
  .service('KWGraphService', function () {
    this.generateLineGraph = function(data, options) {
        if(!data)
          return;
        if(data.length === 0)
          return;
        if(!data[0])
          return;
        if(data[0].length === 0)
          return;

        var i, j;
        var width = options.width, height = options.height;
        
        // Find extreme value for scaling.
        var data_max = -999999;
        var data_accumulated_max = 0;
        var data_min = 999999;
        var accumulated_prev_y = new Array(data[0].length);
        for (j=1; j<data[0].length; j++)
            accumulated_prev_y[j] = 0;

        for (i=1; i<data.length; i++)
        {
            for (j=1; j<data[i].length; j++)
            {
                var d = parseFloat(data[i][j]);
                data_max = (d > data_max) ? d: data_max;
                data_min = (d < data_min) ? d: data_min;
                accumulated_prev_y[j] += d;
            }
        }
        for (j=1; j<accumulated_prev_y.length; j++)
        {
          var d = accumulated_prev_y[j];
          data_accumulated_max = (d > data_accumulated_max) ? d: data_accumulated_max;
        }

        var data_span = data_max - data_min;
        var viewport_y_min = 0;
        var viewport_y_max = data_max;
        if (options.accumulate)
          viewport_y_max = data_accumulated_max;
        if (options.viewport_y_max)
          viewport_y_max = options.viewport_y_max;
        var viewport_y_span = viewport_y_max - viewport_y_min;
        var ratio = {x: viewport_y_span/(width), y:viewport_y_span/(height)};

        // time-based
        var renderData = [];
        var label_x_coord = [];
        var accumulated_prev_y = new Array(data[0].length);
            for (j=1; j<data[0].length; j++)
            {
                accumulated_prev_y[j] = 0;
                var item_no = j - 1;
                var item_x = item_no * (width)/(data[0].length - 2);
                label_x_coord.push(item_x);
            }
        //push forward for the last label
        // label_x_coord[data[0].length-2] -= 20;
        for (i=1; i<data.length; i++)
        {
            var row = [];
            for (j=1; j<data[i].length; j++)
            {
                var item_no = j - 1;
                var item_x = item_no * (width)/(data[i].length - 2);
                var scaled_y_height = data[i][j]/ratio.y;
                var scaled_y = height - (scaled_y_height - viewport_y_min/ratio.y);
                var accumulated_y = height - ((accumulated_prev_y[j] + scaled_y_height) - viewport_y_min/ratio.y);
                accumulated_prev_y[j] += scaled_y_height;
                if (options.accumulate === true) {
                  row.push([item_x, accumulated_y]);
                }
                else
                  row.push([item_x, scaled_y]);
                
            }
            renderData.push(row);
        }

        var pathData = [];
        for (i=0; i<renderData.length; i++)
        {
            var row = [];
            for (j=0; j<renderData[i].length; j++)
            {
                row.push(renderData[i][j].join(' '));
            }
            pathData.push({label: data[i+1][0], d:'M ' + row.join(' L ')});
        }


        var label_y_coord = [];
        var y_label = [];

        var y_label_scale = 200;
        if (options.viewport_y_scale)
          y_label_scale = options.viewport_y_scale;
        for (i=0; i < height*ratio.y; i+=y_label_scale) {
            var scaled_value = i/ratio.y;
            label_y_coord.push(height - scaled_value);
            y_label.push(i);
        }

        var x_label = [];
        console.log(options);
        if (data)
          x_label = data[0].slice(1,data[0].length);
        return {
            paths: pathData,
            renderData: renderData,
            x_label: x_label,
            y_label: y_label,
            label_x_coord: label_x_coord,
            label_y_coord: label_y_coord
        };
    }
  });
