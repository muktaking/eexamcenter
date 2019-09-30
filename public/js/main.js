// <-------------- Code For /user/exam/ request -----------> 

//Executing the function that need to be run on load 
$(window).on("load", function(){
    $("#pre-loader").fadeOut(50,()=>{
        $('#pre-loader').remove();
        $('body')[0].style.overflow= "visible";
        //$('content-container').removeClass('hideAll').addClass('showAll');
    })
});
//debugger;
// it' js synchronous
// declaring my top level variable and object
const categoryId = document.querySelector('[data-category-id]') ? document.querySelector('[data-category-id]').getAttribute('data-category-id') : null;
const questionDataContainer = document.querySelectorAll('div[data-question-id]');// selecting the dives that contain question 
let Question = function(id='',type='',answers={}){// question class declared
    this.id = id;
    this.type = type;
    this.answers = answers;
};
const questionIdList = [];// will hold question's ids

//if user does not submit data and later come to the exam
try {// show modal on start and add an event on 'startFromStart' button
    $('#previousAttemptModal').modal('show');
    $('.modal-backdrop').css('opacity','1');
    document.getElementById('startFromStart').addEventListener('click',(e)=>{
        store.get(categoryId).forEach(e=>{
            store.remove(e);
            console.log(store.get(e));
        });
        store.remove(categoryId);
        $('input[type="radio"]').prop('checked',false);
        createQuestionListStorage(); // delete previous tried questions and create new ones
    })
} catch (error) {
    //
}

createQuestionListStorage(); // create new question storage

function createQuestionListStorage(){
    questionDataContainer.forEach((element)=>{//
        const questionId = element.getAttribute('data-question-id');//get the question id
        const questionType =  element.getAttribute('data-question-type');// get the question type
        let question = store.get(questionId);// if previously the question is answered
        if(question){// checking start
            if(!$.isEmptyObject(question.answers)){
                let questionDSC =  document.querySelector('div[data-question-id="'+ questionId +'"]'); // question data specific container
                $.each(question.answers,(key,value)=>{               
                    let answerData = questionDSC.querySelectorAll('input[name='+ key +']');
                    if(value === '1'){
                        answerData[0].checked = true; // this is the True option in matrix question
                    }
                    else{
                        answerData[1].checked = true; // // this is the false option in matrix question
                    }
                })
            }        
        } else{// if the question is tried first time
            question = new Question();
            question.id = questionId;
            question.type = questionType;
            question.state = true;// check whether it is a question or anything else 
            store.set(question.id,question); // creating storage for individual question
            questionIdList.push(questionId);
            store.set(categoryId, questionIdList); // get a memory for questions included in category
        }
        
        element.addEventListener('click',(e)=>{// event bubbling is awesome
            if(e.target.getAttribute("type") === 'radio'){
                if(e.target.checked){
                    question.answers[e.target.getAttribute('name')] = e.target.value;
                    store.set(question.id,question);
                    $('[name='+ e.target.getAttribute('name') +']').prop('disabled', true);                 
                }
            }
        })
    })
}
//


// if submit button is triggered
const questionList = [];
const examForm = document.forms['exam-form'];

if(examForm){

    examForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        $('#onSubmitModal').modal('show');
        $('.modal-backdrop').css('opacity','.5');
    })      
}

$('#submitAnswer').click(e=>{
    const csrf = document.querySelector('[name="_csrf"]').value;
    $('#onSubmitModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    $('.main-wrapper').empty();
    $(`<div class="d-flex justify-content-center align-items-center center-wrapper">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
    </div>`).appendTo('.main-wrapper');
    const categoryId = document.querySelector('[data-category-id]').getAttribute('data-category-id');
    const isDemo = document.querySelector('[data-category-demo]').getAttribute('data-category-demo');
    const questionIdList = store.get(categoryId);
    store.each((key, value)=>{
        if(value.state && questionIdList.includes(value.id)){
            questionList.push(value);
        }
        
    })
    axios({
        method: 'post',
        url: isDemo === 'false' ? '/exam/?questionCategory=' + categoryId : '/exam/demo',
        data: Qs.stringify({questionList}),
            //questionList: questionList
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-csrf-token': csrf
        }
        })
        .then(({data})=> {
            console.log(data);
            showResult(data)
        })
        .catch(err=>{
            console.log(err);
        });
    store.clearAll();
})

function showResult(data){
        $('.main-wrapper').empty();
        if(data.feedback || data.error ){
            $(`<div class="">
                <div class="alert alert-danger">
                    <p class="lead">${data.feedback ? data.feedback : data.error}</p>
                </div>
            </div>`).appendTo('.main-wrapper');
        } else if(data.resultDataArray){
            // resultDataArray = [[answers(true/false, right answers(0/1))],[feedbacks],gfbacks,score,text]
            //totalScore = [score, totalScore]
            // totalScorePercentage
            $(`<div class="row">
                <div class="col-2"></div>
                <div class="col-8" id="content-Wrapper">
                    <div class="mt-2 alert alert-${data.totalScoreParentage > 70 ? 'success' : 'danger'}">
                        <h4 class="alert-heading">${data.totalScoreParentage > 70 ? 'Well done!' : 'Try Hard!'}</h4>
                            <p> 
                                Your Total mark of this Exam is <span class="badge badge-dark">${data.totalScore[0]}</span> out of ${data.totalScore[1]}
                            </p>
                            <hr>
                            <p class="mb-0">
                                Your mark in percentage is <span class="badge badge-dark">${data.totalScoreParentage}%</span>
                            </p>
                        </ul>
                    </div>
                </div>
                <div class="col-2"></div>
            </div>`).appendTo('.main-wrapper');
            data.resultDataArray.forEach((e,i)=>{
                if(e.type === "matrix"){
                    $(`<div class="mb-2">
                    <ul class="list-group" id="list-group-${i}">
                        <li class="list-group-item active text-center">
                            Answer and Explanation For Question no. <span class="badge badge-light">${i+1}</span>. Mark Obtained: <span class="badge ${Number(e.score ) > .50 ? "badge-success" : "badge-danger"}">${e.score}</span>
                        </li>
                    </ul>
                    </div>`).appendTo('#content-Wrapper');
                    e.answers.forEach((element, index)=>{
                        $(`<li class="list-group-item ${element[0] ? 'list-group-item-success ': 'list-group-item-danger'} py-1">
                            <p class="my-0">
                                Your Answer For Stem ${index+1} is ${element[0] ? 'Right' : 'Wrong'}. Right Answer is  <span class="badge badge-success">${element[1] === '1' ? 'True' : 'False'}</span>
                            </p>
                            <p class="my-0">
                                Explanation: ${e.feedbacks[index].length > 0 ? e.feedbacks[index] : 'No explanation'}
                            </p> 
                        </li>`).appendTo('#list-group-' + i);
                    });
                    if(e.generalFeedbacks.length > 0){
                        $(`<li class="list-group-item">
                            <p>Overall Explanation: ${e.generalFeedbacks} </p>
                        </li>`).appendTo('#list-group-' + i);
                    }
                } else if(e.type === 'sba'){
                    $(`<div class="mb-2">
                    <ul class="list-group" id="list-group-${i}">
                        <li class="list-group-item active text-center">
                            Answer and Explanation For Question no. <span class="badge badge-light">${i+1}</span>. Mark Obtained: <span class="badge ${Number(e.score ) > .50 ? "badge-success" : "badge-danger"}">${e.score}</span>
                        </li>
                    </ul>
                    </div>`).appendTo('#content-Wrapper');

                    $(`<li class="list-group-item ${e.answers[0] ? 'list-group-item-success ': 'list-group-item-danger'} py-1">
                        <p class="my-0">
                            Your Answer For this question is ${e.answers[0] ? 'Right' : 'Wrong'}. Right Answer is:   <span class="badge badge-success">${e.answers[1]}</span>
                        </p>
                    </li>`).appendTo('#list-group-' + i);

                    if(e.feedbacks.length > 0){
                        e.feedbacks.forEach((element, index)=>{
                            $(`<li class="list-group-item list-group-item-info py-1">
                                <p class="my-0">
                                    Explanation: ${element.length > 0 ? element : 'No explanation'}
                                </p> 
                            </li>`).appendTo('#list-group-' + i);
                        });

                    }
                    if(e.generalFeedbacks.length > 0){
                        $(`<li class="list-group-item">
                            <p>Overall Explanation: ${e.generalFeedbacks} </p>
                        </li>`).appendTo('#list-group-' + i);
                    }
                }                
            });
        }
}

// slick should be declared after createQuestionListStorage() or it will change some elements
//slick function is declared
if(document.querySelector(".slick-question")){
    $('.slick-question').slick({
        dots: true,
        customPaging : function(slider, i) {
            var thumb = $(slider.$slides[i]).data();
            return '<a class="badge badge-info text-white">' + (i+1 )+ '</a>';
        },
    });
}
// <-------------- /user/exam request end here 

// code for dashboard

// $('#calendar').tuiCalendar({
//     defaultView: 'month',
//     taskView: true,
//     template: {
//       monthGridHeader: function(model) {
//         var date = new Date(model.date);
//         var template = '<span class="tui-full-calendar-weekday-grid-date">' + date.getDate() + '</span>';
//         return template;
//       }
//     }
// });

// var ctx = document.getElementById("myChart") ? document.getElementById("myChart").getContext('2d') : null;
// var myChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//         datasets: [{
//             label: '# of Votes',
//             data: [12, 19, 3, 5, 2, 3],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255,99,132,1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1
//         }]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero:true
//                 }
//             }]
//         }
//     }
// });

//<-------- reset form submit ----->
$('#resetBtn').click(e=>{
    $('#passReset').submit();
})

// <------------- Universal -------------->
//social js
$("#share").jsSocials({
    showLabel: false,
    showCount: false,
    shares: ["email", "twitter", "facebook", "googleplus", "linkedin"]
});
// Bs4 and jquery to show tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

//let form = document.querySelector('.needs-validation');

//some code to show name on file change in file picker
$('.custom-file-input').on('change', function() {
    let fileName = $(this).val().split('\\').pop();
    let label = $(this).siblings('.custom-file-label');
    
    if (label.data('default-title') === undefined) {
        label.data('default-title', label.html());
    }
    
    if (fileName === '') {
        label.removeClass("selected").html(label.data('default-title'));
    } else {
        label.addClass("selected").html(fileName);
    }
});
