appDirectives
    .directive('numbersHour', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function checkHour(text) {
                    if (text) {
                        if (text > 24 || text <= 0) {
                            scope.hour = '';
                        }
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(checkHour);
            }
        };
    })
    .directive('numbersMin', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function checkMinute(text) {
                    if (text) {
                        if (text > 60 || text <= 0) {
                            scope.min = '';
                        }
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(checkMinute);
            }
        };
    });

