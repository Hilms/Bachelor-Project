var app = angular.module("myApp", ['ui.bootstrap']);
app.controller("myCtrl", ['$scope', '$uibModal', function ($scope, $uibModal) {

    $scope.text = [{utterance1: {sentence1:{word1: "I", word2: "am", word3:"Donald", word4:"Trump", word5:"?"},
    sentence2:{word1: "I", word2: "want", word3:"to", word4:"welcome", word5:"you"},
    sentence3:{word1: "This", word2: "debate", word3:"is", word4:"sponsored"}
   }},
{utterance2: {sentence1:{word1: "Hello",word2: ",", word3: "Im", word4:"Clinton"},
     sentence2:{word1: "good", word2: "luck", word3:"to", word4:"you"},
     sentence3:{word1: "lets", word2: "talk", word3:"about", word4:"the", word5:"economy"}
    }
}];


$scope.posTags = [{utterance1: {sentence1:{word1: "DD", word2: "UU", word3:"FF", word4:"CC"},
        sentence2:{word1: "MM", word2: "MM", word3:"HH", word4:"CC", word5:"FF"},
        sentence3:{word1: "TT", word2: "ZZ", word3:"WW", word4:"FF"}
        }},
{utterance2: {sentence1:{word1: "MM", word2: "GG", word3:"EE", word4:"KK"},
        sentence2:{word1: "RR", word2: "SS", word3:"DD", word4:"HH"},
        sentence3:{word1: "TT", word2: "DD", word3:"EE", word4:"GG", word5:"OO"}
        }
}];


$scope.sentiment = [{utterance1: {sentence1:{word1: 1, word2: 1, word3:1, word4:1},
        sentence2:{word1: -1, word2: -1, word3:-1, word4:-1,word5:-1},
        sentence3:{word1: 0, word2: 0, word3:0, word4:0}
        }},
{utterance2: {sentence1:{word1: 1, word2: 0, word3:-1, word4:0},
        sentence2:{word1: 1, word2: 1, word3:1, word4:-1},
        sentence3:{word1: 1, word2: -1, word3:1, word4:-1, word5:0}
        }
}];

$scope.speaker = [ "Trump" , "Clinton" , "Lester"];

// generates an array of colors
// want to genereate for a class of pos-tag a individuall color
$scope.posTagColors = d3.quantize(d3.interpolateHcl("#f4e153", "#362142"), 10);




// This works for tags, but then should each word have an corresponding tag !!!!
// if an tag is not availiable it should be replace by for example "-" in the data!!!!
// see problem of Questionmark in browser
// justify, align, float , margin doesnt work
// you have to put an empty div in front, then it works
// so we could place empty divs if an tag is not available instead of placing "-"
// how to check that
// possible solutions check always a word of if it has a corresponding tag -> hashmap?
// word and tag in one datastructure... 
$scope.annotate_pos= function(checked){

    //console.log("pos checked")
    //console.log($scope.posTags[0].utterance1.sentence2.word3)

    //console.log(posTagColors("DD"))
        for(let i = 0; i < $scope.text.length; i++){

            //console.log($scope.text[i]);
            let utteranceTags = $scope.posTags[i]['utterance' + (i+1)];
            //console.log(utterance.sentence1.word1)
            //console.log(Object.keys(utterance).length)
            let sentenceCount = 1;
            for(let sentenceTags in utteranceTags){
        
                let wordTags = utteranceTags[sentenceTags];
                let wordCount = 1;
                for(let wordTag in wordTags){
                    
                    let posTag = wordTags[wordTag];
                    
                    if(checked == true){
                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .insert("text", "div")
                        .classed('posTag', true)
                        .style("color", "red")
                        /*.style("color", function(){
                            return posTagColors(posTag);
                        })*/
                        .text(posTag);

                        // extra div element
                        // effect: assigns extra space in layout -.-
                        // Solution: display none
                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .insert("div", "text")
                        .classed("extraDivPos",true)
                        .style("display","none");
                    }
                    else{
                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .select(".posTag")
                        .remove();

                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer'+ wordCount)
                        .select(".extraDivPos")
                        .remove();
                    }

                    wordCount++;
                }
                sentenceCount++
                //console.log(utterance[sentence])
            } 
        }

        if($scope.speakerChecked === true){
            recalcSpeakerAnnotationHeight($scope.speaker);
        }
    }


    
    $scope.annotate_sentiment = function(checked){


        let sentimentColor = d3.scaleLinear()
                            .domain([-1, 0, 1])
                            .range(["red", "orange", "green"])
                            .interpolate(d3.interpolateRgb.gamma(2));

        for(let i = 0; i < $scope.text.length; i++){

            let utteranceSentments = $scope.sentiment[i]['utterance' + (i+1)];

            let sentenceCount = 1;

            for(let sentenceSentments in utteranceSentments){
                
                let avgSentenceSentiment=0;
                let wordSentiments = utteranceSentments[sentenceSentments];
                let wordCount = 1;

                // assign encoding to each word 
                for(let wordSentiment in wordSentiments){
                    
                    let sentiment = wordSentiments[wordSentiment];
                 
                    avgSentenceSentiment+=sentiment;
                    
                    if(checked == true){

                        let svg = d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .insert("svg", "div")
                        .classed('sentiment', true)
                        .attr("width", 5)
                        .attr("height",5); 

                        svg.append("circle")
                        .attr("cx", 2.5)
                        .attr("cy",2.5)
                        .attr("r", 2.5)
                        .style("fill", function(d,i){return sentimentColor(sentiment)});

                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .insert("div", "svg")
                        .classed("extraDivSentiment",true)
                        .style("display","none");                        
                    }
                    else{
                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .select(".sentiment")
                        .remove();

                        d3.select('#utterance'+ (i+1))
                        .select('#sentence'+ sentenceCount)
                        .select('#wordContainer' + wordCount)
                        .select(".extraDivSentiment")
                        .remove()
                    }
                    
                    wordCount++;
                }
                avgSentenceSentiment = avgSentenceSentiment/(wordCount-1);
                
                //assign average sentiment to each sentence
                if(checked == true){

                    let svg = d3.select('#utterance'+ (i+1))
                    .select('#sentence'+ sentenceCount)
                    .select('#wordContainer' + (wordCount-1))
                    .select('.wordDiv')
                    .append("svg")
                    .classed('avgSentiment', true)
                    .attr("width", 5)
                    .attr("height",5)
                    .style("margin-left", 2); 

                    svg.append("circle")
                    .attr("cx", 2.5)
                    .attr("cy",2.5)
                    .attr("r", 2.5)
                    .style("fill", function(d,i){return sentimentColor(avgSentenceSentiment)});
                      
                }
                else{
                    d3.select('#utterance'+ (i+1))
                    .select('#sentence'+ sentenceCount)
                    .select('#wordContainer' + (wordCount-1))
                    .select('.wordDiv')
                    .select(".avgSentiment")
                    .remove();

                }


                sentenceCount++
                
            } 
        }

        if($scope.speakerChecked === true){
            recalcSpeakerAnnotationHeight($scope.speaker);
        }
    }
     
    $scope.launchSentimentInfo = function(){
        
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'modalWindowSentiment.html',
            controller: 'modalWindowSentimentController', 
            scope: $scope,
            backdrop:false
    
        }).rendered.then(function(){
            // https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
            // size of color-scale
            const width = 300;
            const height = 50;

            const svg = d3.select('#sentimentEncoding')
                .append("svg")
                .attr("height", height+10)
                .attr("width","100%");

                // gradient definition
                const defs = svg.append("defs");
    
                const linearGradient = defs.append("linearGradient")
                .attr("id", "linear-gradient");
            
                // direction of gradient left to right
                linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");
                
                //Set the color for the start (0%)
                linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "red"); 
            
                //Set the color for the end (50%)
                linearGradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "orange");
            
                //Set the color for the end (100%)
                linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "green");
                
                //Draw the rectangle and fill with gradient
                let rect = svg.append("rect")
                .attr("width", width)
                .attr("height", height-10)
                .style("fill", "url(#linear-gradient)");

                // for shifting the color-scale to the center of the svg
                let xShift = parseInt(d3.select("svg").style("width"))/2 - (width/2);
                 
                rect.attr("transform", "translate("+xShift+",0)");
                
                // draw axis and title 
                let y = d3.scaleLinear()
                .range([width-1, 0])
                .domain([1, -1]);

                let tickLabels =["negative -1","neutral 0","positive 1"];
                let ticks =[-1,0,1];

                let yAxis = d3.axisBottom()
                .scale(y)
                .tickValues(ticks)
                .tickFormat(function(d,i){return tickLabels[i]});

                
                svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+xShift+","+(height - 10)+")")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("negative");
        });
    };
       

    $scope.annotate_speaker = function(checked){

        $scope.speakerChecked = checked;

        let speakerColors = d3.scaleOrdinal($scope.speaker,d3.schemeDark2);

        if(checked === true){
            
            d3.selectAll("div[id^='speaker']")
            .style("display", "flex")
            .style("margin-bottom", "10px")
            .data($scope.speaker)
            .each(function(_,i){
            
                d3.select(this).insert("div","div")
                .classed("speakerTag", true)
                .style("height", function(){

                    return calcHeightofSpeakerAnnotation(i);

                })
                .style("width", "5px")
                .style("margin-right", "2px")
                .style("margin-top", "2px")
                .style('background-color', function (d) {
                    return speakerColors(d);
                })
                .append('svg')
                .style("vertical-align", "baseline")
                .style("height", "100%")
                .style("width","100%")
                .on("mouseover", function(d) {
                    d3.select(this)
                    .append("svg:title")
                    .text(function(){return d;});
                });

            });
        }
        else{
            d3.selectAll(".speakerTag").remove();
        }
    };



    // this is neccessary so that we can work with the DOM after 
    // directives has been rendered
    // in this case to work on the pixelvis
    angular.element(document).ready(function() {
       
        createPixelOverviewVis($scope.text);
        
    });
    

}]);



// directive to place the structured debate into html page
app.directive("content", function(){
    return {
        template:'<div class="fitContent" id="speaker{{$index+1}}" ng-repeat="speaker in text"><div class="fitContent" id="utterance{{$parent.$index+1}}" ng-repeat="utterance in speaker"><div class="fitContent" id="sentence{{$index+1}}" ng-repeat="sentence in utterance"><div class="wordContainer" id="wordContainer{{$index+1}}" ng-repeat="word in sentence"><div class="wordDiv"><text id="word{{$index+1}}" class="{{word}}">{{word}}</text></div></div></div></div></div></div>'
    };
  
});

// controller for sentiment modal
app.controller("modalWindowSentimentController",function($scope, $uibModalInstance){
    
    // close modal on button click
    $scope.ok = function(){
        
        //console.log("ok");
        $uibModalInstance.close(true);
    }
});


function calcHeightofSpeakerAnnotation(index){
    let getHeightOfSiblingDiv = d3.select("#utterance"+(index+1))
                                                .style("height");

    return getHeightOfSiblingDiv;
}

function recalcSpeakerAnnotationHeight(speaker){

    d3.selectAll(".speakerTag")
    .data(speaker)
    .each(function(_,i){
       
        d3.select(this).style("height", function(){
            
            return calcHeightofSpeakerAnnotation(i);

        });

     });
}


// directive to place the structure for the overview pixelvis
// seems like it would not work with svg element.... need a new approach...
// think about removing punctuation 
app.directive("overview", function(){
    return {
        
        //template:'<div id="fitContent" class="overview-speaker{{$index+1}}" ng-repeat="speaker in text"><div id="fitContent" class="overview-utterance{{$parent.$index+1}}" ng-repeat="utterance in speaker"><div id="fitContent" class="overview-sentence{{$index+1}}" ng-repeat="sentence in utterance"><div id="overview-wordContainer" class="overview-word{{$index+1}}" ng-repeat="word in sentence"><div id="overview-wordDiv"><svg id="overview-word" class="{{word}}" value="{{word}}"><rect id="overviewPixel"></rect></svg></div></div></div></div></div></div>'
        template:'<div class="fitContent" id="overview-speaker{{$index+1}}" ng-repeat="speaker in text"><div class="fitContent" id="overview-utterance{{$parent.$index+1}}" ng-repeat="utterance in speaker"><div class="fitContent" id="overview-sentence{{$index+1}}" ng-repeat="sentence in utterance"><div class="overview-word" id="overview-word{{$index+1}}" ng-repeat="word in sentence"><div id="overview-pixel{{$index+1}}" class="{{word}}" value="{{word}}"></div></div></div></div></div>',

        
    };
  
});





function createPixelOverviewVis(text){

    for(let i = 0; i < text.length; i++){

        let sentenceCount = 1;
        let utterance = text[i]['utterance' + (i+1)];

        for(let sentence in utterance){

            let words = utterance[sentence];
            let wordCount = 1;

            // assign encoding to each word 
            for(let word in words){

                d3.select('#overview-utterance' + (i+1))
                .select('#overview-sentence' + sentenceCount)
                .select('#overview-word' + wordCount)
                .select('#overview-pixel' + wordCount)
                .append('svg')
			        .style("height", "100%")
			        .style("width","100%")
                    .style("background-color","lightgrey")
                    .style("vertical-align", "top")
                    .on("mouseover", function() {
                        d3.select(this)
                        .append("svg:title")
                        .text(function(){return words[word];});
                    });
                    
                wordCount++
            }
            sentenceCount++   
        }
        
    }

    
}





       

        
    
        
    

    

