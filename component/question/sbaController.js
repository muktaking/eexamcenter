// auditing stems, answers and feedbacks
module.exports.stemChecking = (stems, answers, feedbacks)=>{
    let errors = '';
    let stopFE = false;
    stems.forEach((element,index,arr)=> {

        if( stopFE ){
            return ;
        }
        
        if( index === 0 && !element.length > 0){
            stopFE = true;
            return errors+= 'First Stem can not be blank';
        }
        //add stem sequentially 
        if(stems[index+1]){
            if(stems[index+1].length> 0 && !element.length > 0){
                stopFE = true;
                return errors+= 'Add stem sequentially';
            }
        }
        //all stem should have corresponding answer and vice versa
        if(((element.length > 0) &&  !answers) || ((parseInt(answers) >= index+1) && (element.length < 1) ) ){
            stopFE = true;
            return errors+= 'Answer is out of choice';;
        }
        // feedback should not be upon empty stem
        if( feedbacks[index].length > 0 && !element.length > 0){
            stopFE = true;
            return errors+= 'Feedback is upon empty stem';
        }
    });
    return errors;
}