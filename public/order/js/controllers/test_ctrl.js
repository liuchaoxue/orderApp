/**
 * Created by liu on 16-6-16.
 */
appControllers.controller('testCtrl',function($scope,TextAnalysisService){

    $scope.textAnalysis = function (text) {
        if (text) {
            TextAnalysisService.keyword(text, function (data) {
                $scope.keyword = data
            });
            TextAnalysisService.participle(text, function (data) {
                $scope.participle = data
            });
            TextAnalysisService.abstract(text, function (data) {
                $scope.abstract = data
            });
        }
    };
});
