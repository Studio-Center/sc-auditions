'use strict';
angular.module('core').filter('multiTerm', function($filter){
     return function(inputArray, searchText){
        var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
        var wordCount = wordArray.length;
        for(var i=0;i<wordCount;i++){
            inputArray = $filter('filter')(inputArray, wordArray[i], true);
            console.log(wordArray[i]);
        }
        return inputArray;
    };
});