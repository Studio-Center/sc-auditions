'use strict';
angular.module('core').filter('multiTerm', function($filter){
     return function (input, searchText, AND_OR) {
        if(typeof searchText !== 'undefined'){
            var returnArray = [];
            var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
            var wordCount = wordArray.length;
            for(var i=0;i<wordCount;i++){
                returnArray = $filter('filter')(input, wordArray[i]);
            }
            if(returnArray.length > 0){
                return returnArray;
            } else {
                return input;
            } 
        } else {
            return input;
        }
    };
});