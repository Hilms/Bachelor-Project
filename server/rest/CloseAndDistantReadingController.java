/**
 * Created by Hilmi-Can on 27.12.19.
 * BACHELOR PROJECT
 */
package io.lingvis.server.web.rest;

import io.lingvis.data.DataManager;
import io.lingvis.data.components.*;
import io.lingvis.preprocessing.measures.Measure;
import io.lingvis.preprocessing.steps.namedEntities.NamedEntity;
import io.lingvis.server.manager.VisArgueManager;
import io.lingvis.server.service.VisArgueManagerResolverService;
import io.lingvis.utils.PreprocessSettings;
import io.lingvis.utils.text.StopWordListEnglish;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.*;

@RestController
public class CloseAndDistantReadingController {

    /**
     * The logger.
     */
    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(CloseAndDistantReadingController.class);

    @RequestMapping(value = "/closeAndDistantReading/data", method = RequestMethod.GET)
    @ResponseBody
    public Data getFeatures(HttpServletRequest request) {

        VisArgueManager m = VisArgueManagerResolverService.get(request);

        /** CHECK AND REMOVE EMPTY UTTERANCES*/
        // it is possible that input file includes empty utterance objects which are empty
        // make a copy  and remove the empty utterances
        List<Utterance> utterancesInUtteranceOrderCopy = new ArrayList<>(m.getDataManager().getUtterancesInUtteranceOrder());

        for(int i = 0; i < utterancesInUtteranceOrderCopy.size(); i++){
            if(utterancesInUtteranceOrderCopy.get(i).toString().matches("Utterance:\\{\\}")){
                utterancesInUtteranceOrderCopy.remove(i);
            }
        }

        // .getUtterances() in discussion-class return a unmodifiableList,
        // a workaround is needed to get the a list of utterances to remove the empty ones.
        List<Discussion> discussionsCopy = new ArrayList<>(m.getDataManager().getDiscussions());

        // necessary to check for empty utterance objects
        Set<Measure> measuresCopy = new HashSet<>(m.getDataManager().getAllMeasures());

        /** FILENAMES OF DEBATES */
        List<File> files = m.getDataManager().getFilesToLoad();
        //System.out.println(files);
        List<String> filenames = new ArrayList<>();

        for(int i = 0; i < files.size(); i++){
            File file = files.get(i);
            String filename = file.getName();
            // This one replaces punctuation and whitespaces in a filename
            // this is necessary, because i want to use the filename as a class-attribute for particular html tags on client-side (dots not working)
            String cleanFileName  = filename.replaceAll("\\s|[^a-zA-Z0-9]","_");

            filenames.add(cleanFileName);
        }
        // test filenames for multiple tabs, since framework cant preprocess more than one file
        //filenames.add("debateTest1_xml");

        /** DISCUSSIONS */
        // since framework cant preprocess more than one discussion, select loaded one
        Discussion discussion = discussionsCopy.get(0);


        /** SPEAKER INORDER */
        ArrayList<String> speakerOrder = new ArrayList<>();
        for(int i = 0; i < discussion.getUtterances().size();i++ ) {

            // check for empty utterance object and skip it
            if(!discussion.getUtterances().get(i).toString().matches("Utterance:\\{\\}")) {
                speakerOrder.add(discussion.getUtterances().get(i).getSpeaker().getName());
            }
        }

        // get speakers of debate
        String[] speaker = new String[discussion.getSpeakers().size()];
        for(int i = 0; i < discussion.getSpeakers().size();i++){
            speaker[i] = discussion.getSpeakers().get(i).getName();
        }

        /** DEBATE AS JSON, POSTAGS AS JASON, SENTIMENT AS JASON */
        ArrayList<String> debateJson = new ArrayList<>();
        ArrayList<String> posTagLabelJson = new ArrayList<>();
        ArrayList<String> sentimentJson = new ArrayList<>();

        int utterIndex = 0;
        for(int i = 0; i < discussion.getUtterances().size(); i++){
            Utterance utterance = discussion.getUtterances().get(i);

            // check for empty utterance object and skip it
            if(!utterance.toString().matches("Utterance:\\{\\}")){
                debateJson.add(createJsonString(utterance, utterIndex, "word"));
                sentimentJson.add(createJsonString(utterance, utterIndex, "sentiment"));
                posTagLabelJson.add(createJsonString(utterance, utterIndex, "pos"));
                utterIndex++;
            }
        }

        //System.out.println(debateJson[0]);

        /** WORD-FREQUENCIES, POSTAG-FREQUENCIES */
        // word frequencies not for stop-words
        // TODO: maybe use Lemma or Stem of a word for frequencies
        // TODO: maybe combine frequency calculation and utterance mapping
        // dont count punctuations in wordFrequency and posFrequency
        // used lowercase
        HashMap<String,Integer> wordFrequencies = new HashMap<>();
        HashMap<String,Integer> posTagFrequencies = new HashMap<>();

        // since only one debate can be preprocessed, allWordsInOrder corresponds to the debate
        // later we have to get the size of words for one debate
        List<Word> words = m.getDataManager().getAllWordsInOrder();

        calcWordFrequencies(wordFrequencies, words);
        calcPosTagFrequencies(posTagFrequencies, words);

        /** WORD-FREQUENCIES AS JSON*/

        String[] wordFrequenciesJson = new String[wordFrequencies.size()];

        int indexWF = 0;
        for(Map.Entry<String, Integer> entry : wordFrequencies.entrySet()){
            String key = entry.getKey();
            Integer value = entry.getValue();

            wordFrequenciesJson[indexWF] = createWordFrequencyJson(key, value);
            indexWF++;
        }

        //System.out.println(wordFrequencies);
        //System.out.println(wordFrequenciesJson[0]);

        // store used/available pos-tags
        // punctuations are not included in this set
        String[] posTagSet = posTagFrequencies.keySet().toArray(new String[0]);


        /** WORD_FREQUENCY-WORDS AND THEIR OCCURRENCE */

        Map<String,ArrayList<Integer>> frequencyWordsToUtterance = new HashMap<>();
        int indexU = 0;
        for(int i = 0; i < discussion.getUtterances().size();i++ ) {
            // check for empty utterance object and skip it
            if(!discussion.getUtterances().get(i).toString().matches("Utterance:\\{\\}")) {

                Utterance utterance = discussion.getUtterances().get(i);

                for(int j = 0; j < utterance.getSentences().size(); j++){
                    Sentence sentence =  utterance.getSentences().get(j);

                    for(int k = 0; k < sentence.getWords().size(); k++){

                        Word w = sentence.getWords().get(k);
                        String word = w.getWordform();

                        // dont note punctuations, numbers or words like 'm, n't, 'll
                        if(!word.matches("\\p{P}") && !word.contains("'") && !word.matches(".*\\d.*")) {

                            if (!frequencyWordsToUtterance.isEmpty() && frequencyWordsToUtterance.containsKey(word.toLowerCase())) {

                                ArrayList<Integer> list = frequencyWordsToUtterance.get(word.toLowerCase());

                                int utteranceID = indexU+1;
                                // remove duplicates
                                if(!list.contains(utteranceID)) {
                                    list.add(utteranceID);
                                    frequencyWordsToUtterance.put(word.toLowerCase(), list);
                                }

                            } else {
                                // store if word is not a stopword
                                if (!StopWordListEnglish.isStopWord(word)) {
                                    frequencyWordsToUtterance.put(word.toLowerCase(), new ArrayList<>());
                                    int utteranceID = indexU+1;
                                    ArrayList<Integer> list = frequencyWordsToUtterance.get(word.toLowerCase());
                                    list.add(utteranceID);
                                    frequencyWordsToUtterance.put(word.toLowerCase(),list);
                                }
                            }
                        }
                    }
                }
                indexU++;
            }
        }

        /** WORD_FREQUENCY-WORDS AND THEIR OCCURRENCE AS JSON*/
        String[] frequencyWordsToUtteranceJson = new String[1];
        frequencyWordsToUtteranceJson[0] = createFrequencyWordToUtteranceJson(frequencyWordsToUtterance);


        /** NAMED ENTITIES */
        // TODO: maybe convert category to lowercase
        // how are namedEntities stored for multiple discussions?
        List<NamedEntity> namedEntities = m.getDataManager().getNamedEntityManager().getEntities();
        // store category-set of namedEntities
        List<String> categorySetNamedEntities = new ArrayList<>();
        // store namedEntities only if they have a category
        List<NamedEntity> namedEntitiesWithCategory = new ArrayList<>();

        for(NamedEntity namedEntity : namedEntities){

            // filter namedEntities without category
            if(!namedEntity.getCategory().matches("O")){

                // entities with category
                // determine category set
                if(!categorySetNamedEntities.isEmpty()){

                    // remove duplicates
                    if(!categorySetNamedEntities.contains(namedEntity.getCategory()))

                        categorySetNamedEntities.add(namedEntity.getCategory());
                }
                else{
                    categorySetNamedEntities.add(namedEntity.getCategory());
                }

                // save entities with category in separate list
                namedEntitiesWithCategory.add(namedEntity);

            }
            else{
                continue;
            }

        }

        HashMap<String,List<String>> wordCategoryMapping = new HashMap<>();
        for(int i = 0; i< namedEntitiesWithCategory.size(); i++){

            NamedEntity namedEntity = namedEntitiesWithCategory.get(i);
            String category = namedEntity.getCategory();
            String word = namedEntity.getLemma();

            // store word in the list of corresponding category
            if(!wordCategoryMapping.isEmpty() && wordCategoryMapping.containsKey(category)){

                List<String> list = wordCategoryMapping.get(category);

                // remove duplicates
                if(!list.contains(word)) {
                    list.add(word);
                    wordCategoryMapping.put(category, list);
                }

            }
            else{
                // if map is empty or map not contains category
                wordCategoryMapping.put(category, new ArrayList<String>());
                List<String> list = wordCategoryMapping.get(category);
                list.add(word);
                wordCategoryMapping.put(category,list);
            }

        }

        /** NAMED ENTITIES AS JSON*/
        String[] namedEntitiesJson = new String[wordCategoryMapping.size()];

        int indexNE = 0;
        for(Map.Entry<String, List<String>> entry : wordCategoryMapping.entrySet()){
            String key = entry.getKey();
            List<String> value = entry.getValue();

            namedEntitiesJson[indexNE] = createNamedEntityJson(key, value);
            indexNE++;
        }

        //System.out.println(namedEntitiesJson[0]);


        /** TOPICS */
        // since no empty utterance objects are stored in topics, dont have to care about it
        // TODO: LDA is not supporting getUtterances(), getUtteranceIDs() and getUtteranceCount() since they are not implemented in LDA-TopicModelling
        // NOTE: since topic modeling is based on non-deterministic algorithms, the topic numbers are changing, they are not assigned static
        // less utterances in topics as there really exist -> check which get lost - done
        // NOTE: its not necessary to remove the empty utterances from the list of topics, since they already not included

        // get selected topic modeling algorithm from user
        DataManager dataManager = m.getDataManager();
        PreprocessSettings ps = dataManager.getApplicationConfiguration().getPreprocessSettings();
        String topicModeling = ps.getTopicSummaryTopicModeling();

        Set<Topic> topics;
        int[] topicNumbers = null;
        String[] topicDescriptorJson = null;
        ArrayList<TopicUtteranceIDPair> topicUtteranceIDPairList = new ArrayList<>();
        String[] topicModellingAlgorithm = {topicModeling.toUpperCase()};

        if(topicModeling.equals("lda")){

            // since LDA is not supporting necessary utterance methods, we have to match from utterance to a topic
            // how to decide which topics belong to which discussion?
            topics = dataManager.getAllTopics(DataManager.LDA);

            // for color-scale on client side
            topicNumbers = new int[topics.size()];

            int indexT = 0;
            for(Topic topic : topics){
                topicNumbers[indexT] = topic.getTopicNumber();
                indexT++;
            }
            
            /** LDA TOPIC-DESCRIPTORS AS JSON */
           // topicDescriptorJson = new String[topics.size()];
            topicDescriptorJson = new String[filenames.size()];

            topicDescriptorJson[0] = createTopicDescriptorJson(topics);


            for(int i = 0; i< utterancesInUtteranceOrderCopy.size(); i++){

                Utterance utterance = utterancesInUtteranceOrderCopy.get(i);

                int utteranceTopicID = utterancesInUtteranceOrderCopy.get(i).getTopLdaTopic();

                Topic matchingTopic = findMatchingTopicForUtterance(topics, utteranceTopicID);

                // don't need to be sorted, since utterances already in order
                topicUtteranceIDPairList.add(new TopicUtteranceIDPair(matchingTopic.getTopicNumber(), utterance.getId()));

            }

        }
        else if(topicModeling.equals("ihtm")){

            topics = m.getDataManager().getAllTopics(DataManager.IHTM);

            // for color-scale on client side
            topicNumbers = new int[topics.size()];

           // topicDescriptorJson = new String[topics.size()];
            topicDescriptorJson = new String[filenames.size()];

            /** IHTM TOPIC-DESCRIPTORS AS JSON */
            topicDescriptorJson[0] = createTopicDescriptorJson(topics);

            // determine occurrences of topics in utterance order
            // store therefore tuples (topicNumber, UtteranceID) and sort then by UtteranceID
            int indexT = 0;
            for(Topic topic : topics) {

                int topicNumber = topic.getTopicNumber();
                topicNumbers[indexT] = topicNumber;

                Set<Utterance> utterances = topic.getUtterances();

                for(Utterance utterance : utterances){
                    topicUtteranceIDPairList.add(new TopicUtteranceIDPair(topicNumber, utterance.getId()));
                }

                indexT++;
            }

            Collections.sort(topicUtteranceIDPairList, Comparator.comparingLong(p -> p.getUtteranceId()));

        }

        Arrays.sort(topicNumbers);


        /** TOPIC OCCURRENCE IN UTTERANCE ORDER AS JSON */

        String[] topicsUtteranceJson  = new String[filenames.size()];
        topicsUtteranceJson[0] = createTopicUtteranceJson(topicUtteranceIDPairList);


        /** MEASURES */
        // since the framework compute 50+ measures,
        // filter by low variance - those are not important to the user
        // and order (descending) by standard deviation - thus the measures are ordered according to their informative value
        // used normalized values
        // some measures have still values above, under max/min value e.g. emotion count, self following recurrence -> used instead min max value

        // NOTE: don't forget to remove empty utterance objects

        ArrayList<MeasureVarianceStandardDeviation> measureVarianceStandardDeviation = new ArrayList<>();
        calcVarianceAndStandardDeviation(measureVarianceStandardDeviation, measuresCopy);

        // filtered measures by variance
        ArrayList<MeasureVarianceStandardDeviation> measureVarianceStandardDeviationFiltered = filterMeasuresByVariance(measureVarianceStandardDeviation);
        // measures ordered by standard deviation
        // higher standard deviation means more change in the data and therefore more interesting for the user
        Collections.sort(measureVarianceStandardDeviationFiltered, Collections.reverseOrder(Comparator.comparingDouble(e -> e.getStandardDeviation())));
        // remove sentiment from measures because used it already in another context
        //removeMeasure(measureVarianceStandardDeviationFiltered, "sentiment");

        // measure names with min/max value
        String[] measureList = new String[measureVarianceStandardDeviationFiltered.size()];

        // Note: fix the ordering of utterances within the measures
        int indexMVSD = 0;
        for(MeasureVarianceStandardDeviation mvsd : measureVarianceStandardDeviationFiltered){

            Measure measure = mvsd.getMeasure();

            // store measure_name, measure_type and min/max value
            measureList[indexMVSD] = createMeasureNameTypeMinMaxJson(mvsd.getMeasureName(), mvsd.getMeasureType(), mvsd.getMinValue(), mvsd.getMaxValue());

            //Map<Utterance, Double>  measureValues = measure.getAllValues();

            Map<Utterance, Double>  measureValues =  measure.getNormalizedValues();

            for( Map.Entry<Utterance, Double> entry : measureValues.entrySet()){
                String utterance = entry.getKey().toString();

                // check for empty utterance object and skip it
                if(!utterance.matches("Utterance:\\{\\}")){

                    Utterance utt = entry.getKey();
                    double val = entry.getValue();

                    // fill list of utterance_value_pairs
                    mvsd.setUtteranceValuePairToList(new UtteranceValuePair(utt, val));
                }


            }

            // get list of utterances_value_pairs
            ArrayList<UtteranceValuePair> utteranceValuePairList = mvsd.getUtteranceValuePairList();

            // utterances_value_pairs from the map in measures are not ordered
            // order by utterance ID to restore the correct order of utterances and thus also the values
            Collections.sort(utteranceValuePairList, Comparator.comparingLong(p -> p.getUtterance().getId()));
            indexMVSD++;
        }

        /** MEASURES AS JSON */

        // NOTE: some measures contain values which are above or under the given range,
        // therefore use min and max value for given measure
        // See checkIfValueInRange() method in createMeasureJson()

        ArrayList<String> measureJson = new ArrayList<>();
        for(int i = 0; i< measureVarianceStandardDeviationFiltered.size(); i++){

            measureJson.add(createMeasureJson(measureVarianceStandardDeviationFiltered.get(i)));

        }
        // System.out.println(measureJson[0]);



        /** DATA FOR CLIENT */

        Data data = new Data(filenames, speakerOrder, speaker, debateJson, posTagLabelJson, sentimentJson, wordFrequenciesJson, frequencyWordsToUtteranceJson, posTagSet, namedEntitiesJson, topicsUtteranceJson, topicDescriptorJson, topicNumbers, topicModellingAlgorithm, measureJson, measureList);

        return data;
    }

    private Topic findMatchingTopicForUtterance(Set<Topic> topics, int utteranceTopicID) {

        for(Topic topic : topics){

            if (topic.getTopicNumber() == utteranceTopicID){
                return topic;
            }
        }
        return null;
    }

    private String createTopicUtteranceJson(List<TopicUtteranceIDPair> topicUtteranceIDPairList) {
        final StringBuilder sb = new StringBuilder();

        sb.append("{");
        for(int i = 0; i < topicUtteranceIDPairList.size(); i++){

            TopicUtteranceIDPair pair = topicUtteranceIDPairList.get(i);
            int topicNumber = pair.getTopicNumber();
            if(i < topicUtteranceIDPairList.size()-1){
                sb.append("\\\"utterance" + (i + 1) + "\\\":" + topicNumber);
                sb.append(",");
            }
            else{
                sb.append("\\\"utterance" + (i + 1) + "\\\":" + topicNumber);
            }
        }
        sb.append("}");

        return sb.toString();
    }

    private String createTopicDescriptorJson(Set<Topic> topics) {
        final StringBuilder sb = new StringBuilder();

        sb.append("{");

        int indexT = 0;
        for(Topic topic : topics){
            int topicNumber= topic.getTopicNumber();
            List<String> descriptors = topic.getDescriptors();

            sb.append("\\\""+topicNumber+"\\\":[ ");

            for (int i = 0; i< descriptors.size(); i++){

                if(i < descriptors.size()-1) {

                    sb.append("\\\""+descriptors.get(i)+"\\\"");
                    sb.append(",");
                }
                else{
                    sb.append("\\\""+descriptors.get(i)+"\\\"");
                }

            }

            if(indexT < topics.size()-1){
                sb.append("],");
            }
            else{
                sb.append("]");
            }

            indexT++;
        }

        sb.append("}");
        return sb.toString();
    }

    private String createMeasureNameTypeMinMaxJson(String measureName, String measureType, double minValue, double maxValue) {

        final StringBuilder sb = new StringBuilder();

        sb.append("{\\\"name\\\":\\\""+measureName+"\\\" , \\\"type\\\":\\\"" +measureType+"\\\" , \\\"minVal\\\":" + minValue+", \\\"maxVal\\\":" +maxValue+" }");

        return sb.toString();
    }


    private String createMeasureJson(MeasureVarianceStandardDeviation measureVarianceStandardDeviationFiltered) {

        String measureName = measureVarianceStandardDeviationFiltered.getMeasureName();
        ArrayList<UtteranceValuePair> uvpList  = measureVarianceStandardDeviationFiltered.getUtteranceValuePairList();
        double maxVal = measureVarianceStandardDeviationFiltered.getMaxValue();
        double minVal = measureVarianceStandardDeviationFiltered.getMinValue();

        final StringBuilder sb = new StringBuilder();

        sb.append("{\\\"" + measureName + "\\\": {");
        for(int i = 0; i< uvpList.size(); i++){

            if(i  < uvpList.size()-1){
                sb.append("\\\"utterance"+(i+1)+"\\\":"+ checkIfValueInRange(uvpList.get(i),minVal,maxVal));
                sb.append(",");
            }
            else{
                sb.append("\\\"utterance"+(i+1)+"\\\":"+ checkIfValueInRange(uvpList.get(i), minVal,maxVal));
            }

        }
        sb.append("}}");

        return sb.toString();
    }

    private double checkIfValueInRange(UtteranceValuePair utteranceValuePair, double minVal, double maxVal) {

        double value;
        double check = utteranceValuePair.getValue();

        if(check > maxVal){
            value = maxVal;
        }
        else if (check < minVal) {
            value = minVal;
        }
        else{
            value = utteranceValuePair.getValue();
        }
        return value;
    }

    private void removeMeasure(ArrayList<MeasureVarianceStandardDeviation> measureVarianceStandardDeviationFiltered, String sentiment) {

        for(int i = 0; i< measureVarianceStandardDeviationFiltered.size(); i++){

            MeasureVarianceStandardDeviation mvsd = measureVarianceStandardDeviationFiltered.get(i);

            if(mvsd.getMeasureName().toLowerCase().matches(sentiment)){

                measureVarianceStandardDeviationFiltered.remove(i);
            }
        }

    }


    private ArrayList<MeasureVarianceStandardDeviation> filterMeasuresByVariance(ArrayList<MeasureVarianceStandardDeviation> measureVarianceStandardDeviation) {

        ArrayList<MeasureVarianceStandardDeviation> filtered = new ArrayList<>();
        double varianceThreshold = 0;

        for(MeasureVarianceStandardDeviation mvsd : measureVarianceStandardDeviation){

            if(mvsd.getVariance() > varianceThreshold){

                filtered.add(mvsd);
            }

        }

        return filtered;
    }


    private void calcVarianceAndStandardDeviation(ArrayList<MeasureVarianceStandardDeviation> measureVarianceStandardDeviation, Set<Measure> measures) {

        for(Measure measure : measures){


            Map<Utterance, Double>  measureValues = measure.getNormalizedValues();

            // calc mean value
            double sumValues = 0;
            int indexMV = 0;

            for( Map.Entry<Utterance, Double> entry : measureValues.entrySet()){

                String utterance = entry.getKey().toString();

                // check for empty utterance object and skip it
               if(!utterance.matches("Utterance:\\{\\}")){
                   sumValues += entry.getValue();

                   indexMV++;
               }
            }

            double meanValue = sumValues/indexMV;

            // calc variance
            double variance = calcVariance(meanValue, indexMV, measure);
            // calc standard deviation
            double standardDeviation = Math.sqrt(variance);

            MeasureVarianceStandardDeviation mvsd = new MeasureVarianceStandardDeviation(measure, variance, standardDeviation, new ArrayList<UtteranceValuePair>());

            measureVarianceStandardDeviation.add(mvsd);

        }

    }

    private double calcVariance(double meanValue, int indexMV, Measure measure) {

        Map<Utterance, Double>  measureValues = measure.getAllValues();

        double temp = 0;

        for( Map.Entry<Utterance, Double> entry : measureValues.entrySet()){

            String utterance = entry.getKey().toString();

            // check for empty utterance object and skip it
            if(!utterance.matches("Utterance:\\{\\}")){
                temp +=  Math.pow((entry.getValue() - meanValue), 2);
            }

        }

        // used n (population) instead of n-1 (sample) for variance calculation
        double variance = temp / indexMV;

        return variance;
    }


    private String createNamedEntityJson(String key, List<String> value) {

        final StringBuilder sb = new StringBuilder();
        sb.append("{\\\"" + key + "\\\": [");

        for(int i = 0; i < value.size(); i++){

            if(i  < value.size()-1){
                sb.append("\\\""+value.get(i)+"\\\"");
                sb.append(",");
            }
            else{
                sb.append("\\\""+value.get(i)+"\\\"");
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    private String createWordFrequencyJson(String key, Integer value) {

        return "{\\\"word\\\":\\\""+key+"\\\",\\\"frequency\\\":"+value+"}";

    }

    private String createFrequencyWordToUtteranceJson(Map<String, ArrayList<Integer>> frequencyWordsToUtterance) {

        final StringBuilder sb = new StringBuilder();

        sb.append("{");

        int index = 0;
        for(Map.Entry<String, ArrayList<Integer>> entry : frequencyWordsToUtterance.entrySet()){
            String key = entry.getKey();
            List<Integer> list = entry.getValue();

            sb.append("\\\""+key+"\\\":[");

            for(int i = 0; i < list.size(); i++){
                int value = list.get(i);

                if(i < list.size()-1){
                    sb.append(value);
                    sb.append(",");
                }else{
                    sb.append(value);
                    sb.append("]");
                }
            }

            if(index < frequencyWordsToUtterance.size() - 1 ){
                sb.append(",");
            }

            index++;
        }

        sb.append("}");
        return sb.toString();
    }

    private void calcPosTagFrequencies(HashMap<String, Integer> posTagFrequencies, List<Word> words) {

        posTagFrequencies.put(words.get(0).getPosTagLabel(),1);

        for(int i = 1; i< words.size(); i++) {

            if(!words.get(i).getWordform().matches("\\p{P}")){

                if(posTagFrequencies.containsKey(words.get(i).getPosTagLabel())){
                    posTagFrequencies.put(words.get(i).getPosTagLabel(),posTagFrequencies.get(words.get(i).getPosTagLabel())+1);
                }
                else{
                    posTagFrequencies.put(words.get(i).getPosTagLabel(),1);
                }
            }

        }

    }

    private void calcWordFrequencies(HashMap<String, Integer> wordFrequencies, List<Word> words) {

        wordFrequencies.put(words.get(0).getWordform().toLowerCase(),1);

        for(int i = 1; i< words.size(); i++) {

            //Boolean flag = StopWordListEnglish.isStopWord(words.get(i).getWordform());

            // dont calc punctuation or words like 'm, n't, 'll
            if(!words.get(i).getWordform().matches("\\p{P}") && !words.get(i).getWordform().contains("'") && !words.get(i).getWordform().matches(".*\\d.*")){

                if(wordFrequencies.containsKey(words.get(i).getWordform().toLowerCase())){
                    wordFrequencies.put(words.get(i).getWordform().toLowerCase(),wordFrequencies.get(words.get(i).getWordform().toLowerCase())+1);
                }
                else{
                    // store if word is not a stopword
                    if(!StopWordListEnglish.isStopWord(words.get(i).getWordform())) {
                        wordFrequencies.put(words.get(i).getWordform().toLowerCase(), 1);
                    }
                }
            }
        }

    }

    private String createJsonString(Utterance utterance, int index,String feature) {

        List<Sentence> sentences = utterance.getSentences();

        final StringBuilder sb = new StringBuilder();

        // escape double quotes within the string and add a escaped backslash,
        // so that i can respond with a valid JSON string for the parser on client-side
        // e.g. "{\"utterance1\":{\"sentence1\": ..."
        //           v                         v
        sb.append("{\\\"utterance"+(index+1)+"\\\":{");
        for (int i = 0; i < sentences.size(); i++) {
            sb.append("\\\"sentence"+(i+1)+"\\\":{");
            List<Word> words = sentences.get(i).getWords();
            for (int j = 0; j < words.size(); j++) {

                if(feature.equals("word")){

                    String word = words.get(j).getWordform();

                    if(j  < words.size()-1){

                        if(word.startsWith("'")){
                            // escape single quotes in words otherwise JSON-parser on client-side will not work
                            //                                      v
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+"\\"+ word +"\\\"");
                            sb.append(",");
                        }
                        else{
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+ word +"\\\"");
                            sb.append(",");
                        }

                    }
                    else{

                        if(word.startsWith("'")){
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+ "\\" + word +"\\\"");
                        }
                        else{
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+ word +"\\\"");
                        }
                    }
                }
                else if (feature.equals("sentiment")){

                    int sentiment = words.get(j).getSentiment();

                    if(j  < words.size()-1){
                        sb.append("\\\"word" + (j + 1) + "\\\":" + sentiment +"");
                        sb.append(",");
                    }
                    else{
                        sb.append("\\\"word" + (j + 1) + "\\\":" + sentiment +"");
                    }
                }
                else if(feature.equals("pos")){

                    if(words.get(j).getWordform().matches("\\p{P}")){

                        // for punctuation set label to P
                        if(j  < words.size()-1){
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+ "P\\\"");
                            sb.append(",");
                        }
                        else{
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+ "P\\\"");
                        }

                    }
                    else{
                        String pos = words.get(j).getPosTagLabel();

                        if(j  < words.size()-1){
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+pos+"\\\"");
                            sb.append(",");
                        }
                        else{
                            sb.append("\\\"word"+(j+1)+"\\\":\\\""+pos+"\\\"");
                        }

                    }

                }

            }
            if(i < sentences.size()-1){
                sb.append("},");
            }
            else{
                sb.append("}");
            }

        }
        sb.append("}}");

        return sb.toString();
    }

    private static class Data {

        public List<String> filenames;
        public ArrayList<String> speakerOrder;
        public String[] speaker;
        public ArrayList<String> debateJson;
        public ArrayList<String> posTagLabelJson;
        public ArrayList<String> sentimentJson;
        public String[] wordFrequenciesJson;
        public String [] frequencyWordsToUtteranceJson;
        public String[] posTagSet;
        public String[] namedEntitiesJson;
        public String[] topicsUtteranceJson;
        public String[] topicDescriptorJson;
        public int[] topicNumbers;
        public String[] topicModellingAlgorithm;
        public ArrayList<String> measureJson;
        public String[] measureList;


        public Data(List<String> filenames, ArrayList<String> speakerOrder, String[] speaker, ArrayList<String> debateJson, ArrayList<String> posTagLabelJson, ArrayList<String> sentimentJson, String[] wordFrequenciesJson, String[] frequencyWordsToUtteranceJson, String[] posTagSet, String[] namedEntitiesJson, String[] topicsUtteranceJson, String[] topicDescriptorJson, int[] topicNumbers, String[] topicModellingAlgorithm, ArrayList<String> measureJson, String[] measureList) {

            this.filenames = filenames;
            this.speakerOrder = speakerOrder;
            this.speaker = speaker;
            this.debateJson = debateJson;
            this.posTagLabelJson = posTagLabelJson;
            this.sentimentJson = sentimentJson;
            this.wordFrequenciesJson = wordFrequenciesJson;
            this.frequencyWordsToUtteranceJson = frequencyWordsToUtteranceJson;
            this.posTagSet = posTagSet;
            this.namedEntitiesJson = namedEntitiesJson;
            this.topicsUtteranceJson = topicsUtteranceJson;
            this.topicDescriptorJson = topicDescriptorJson;
            this.topicNumbers = topicNumbers;
            this.topicModellingAlgorithm = topicModellingAlgorithm;
            this.measureJson = measureJson;
            this.measureList = measureList;
        }
    }


    private static class UtteranceValuePair {

        private final Utterance u;
        private final double v;

        public UtteranceValuePair(Utterance utterance, double value) {
            this.u = utterance;
            this.v = value;
        }

        private Utterance getUtterance(){
            return u;
        }

        private double getValue(){
            return v;
        }

    }

    private static class MeasureVarianceStandardDeviation {

        private final Measure m ;
        private final String measureName;
        private final String measureType;
        private final double v;
        private final double s;
        private final double minVal;
        private final double maxVal;

        // this list contains later the ordered utterances and their corresponding values
        private final ArrayList<UtteranceValuePair> uvpList;

        public MeasureVarianceStandardDeviation(Measure measure, double variance, double standardDeviation, ArrayList<UtteranceValuePair> list){

            this.m = measure;
            this.v = variance;
            this.s = standardDeviation;
            this.uvpList = list;

            this.measureName = m.getName();
            this.measureType = m.getType().toString();

            this.minVal = m.getMinValue();
            this.maxVal = m.getMaxValue();
        }

        private Measure getMeasure(){
            return m;
        }

        private double getVariance(){
            return v;
        }

        private double getStandardDeviation(){
            return s;
        }

        private String getMeasureName(){
            return measureName;
        }
        private String getMeasureType(){
            return measureType;
        }

        private ArrayList<UtteranceValuePair> getUtteranceValuePairList(){
            return uvpList;
        }

        private void setUtteranceValuePairToList(UtteranceValuePair p){
            uvpList.add(p);
        }

        private double getMinValue(){
            return minVal;
        }

        private double getMaxValue(){
            return maxVal;
        }
    }


    private static class TopicUtteranceIDPair {

        private final int topicNumber;
        private final long utteranceId;

        public TopicUtteranceIDPair(int topicNumber, long utteranceId){

            this.topicNumber = topicNumber;
            this.utteranceId = utteranceId;

        }

        private int getTopicNumber(){
            return topicNumber;
        }

        private long getUtteranceId(){
            return utteranceId;
        }
    }
}