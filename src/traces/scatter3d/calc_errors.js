/**
* Copyright 2012-2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Registry = require('../../registry');

function calculateAxisErrors(data, params, scaleFactor, axis, calendar) {
    if(!params || !params.visible) return null;

    var computeError = Registry.getComponentMethod('errorbars', 'makeComputeError')(params);
    var result = new Array(data.length);

    for(var i = 0; i < data.length; i++) {
        var errors = computeError(+data[i], i);

        var point = axis.d2l(data[i], 0, calendar) * scaleFactor; // A bit wasteful
        result[i] = [
            (axis.d2l(data[i] - errors[0], 0, calendar) * scaleFactor) - point || -point,
            (axis.d2l(data[i] + errors[1], 0, calendar) * scaleFactor) - point || -point
        ];
    }

    return result;
}

function dataLength(array) {
    for(var i = 0; i < array.length; i++) {
        if(array[i]) return array[i].length;
    }
    return 0;
}

function calculateErrors(data, scaleFactor, sceneLayout) {
    var errors = [
        calculateAxisErrors(data.x, data.error_x, scaleFactor[0], sceneLayout.xaxis, data.xcalendar),
        calculateAxisErrors(data.y, data.error_y, scaleFactor[1], sceneLayout.yaxis, data.ycalendar),
        calculateAxisErrors(data.z, data.error_z, scaleFactor[2], sceneLayout.zaxis, data.zcalendar)
    ];

    var n = dataLength(errors);
    if(n === 0) return null;

    var errorBounds = new Array(n);

    for(var i = 0; i < n; i++) {
        var bound = [[0, 0, 0], [0, 0, 0]];

        for(var j = 0; j < 3; j++) {
            if(errors[j]) {
                for(var k = 0; k < 2; k++) {
                    bound[k][j] = errors[j][i][k];
                }
            }
        }

        errorBounds[i] = bound;
    }

    return errorBounds;
}

module.exports = calculateErrors;
