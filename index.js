'use strict';

const STATE = {
    currentQuestion: 0,
    score: 0,
    totalQuestions: 1,
    answer: 0,
    questions: [],
};

// generate random questions order
function shuffleArray(arr) {
    let i = 0;
    let j = 0;
    let temp = null;
    for (i = arr.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

// generate question views
function generateQuestionString(arr) {
    let fullString = '';
    arr = shuffleArray(arr);
    for (let i = 0; i < arr.length; i++) {
        fullString += `
            <div class="input-group">
                <input type='radio' id="radio-answer-${i}" name='radio-answer' value='${arr[i]}' required><label class="answer" for="radio-answer-${i}"><span>${arr[i]}</span></label>
            </div>
        `;
    }
    return fullString;
}


function generateQuestionView() {
    const currentQuestion = STATE.currentQuestion;
    const questionData = STATE.questions[currentQuestion];
    const answersStrings = generateQuestionString(questionData.answers);
    return `
        <h2>Identify the TV series associated with the image below:</h2>
        <div class="question-image-holder">
            <img src=${questionData.image.src} alt=${questionData.image.alt}>
        </div>
        <form class='js-question-form'>
            <div>
                ${answersStrings}
            </div>
            <div class="button-holder">
                <button id="js-sumbit" type="submit">Submit</button>
            </div>
        </form>
     `;
}

// generate answers view
function generateAnswerView() {
    const currentQuestion = STATE.currentQuestion;
    const questionData = STATE.questions[currentQuestion];
    const correctBool = isAnswerCorrect(questionData.correctAnswer);
    return `
        <h3>${correctBool ? 'You were right!' : 'Wrong!'}</h3>
        <p class="trivia-subtitle">${correctBool ? 'Here, have some trivia:' : 'The correct answer was \''+questionData.correctAnswer+'\'. Have some trivia anyway:'}</p>
        <div class="question-image-holder">
            <img src=${questionData.altImage.src} alt=${questionData.altImage.alt}>
        </div>
        <p class="trivia-subtitle trivia-text">${questionData.trivia}</p>
        <div class="button-holder">
            <button id="js-next-question-btn">Next Question</button>
        </div>
    `;
}

// generate final results view
function generateFinalResultsView() {
    let score = STATE.score;
    const totalQuestions = STATE.totalQuestions;
    return `
        <h2>Congratulations</h2>
        <img>
        <h3>Your score ${score} / ${totalQuestions}</h3>
        <p>You're ${score >= 8 ? 'a grandmaster' : score === 5 || 6 || 7 ? 'average' : 'possibly terrible'}  at identifying Tv Shows!</p>
        <button id="js-play-again-btn">Play again?</button>
  `;
}

// decide if answer is correct
function isAnswerCorrect(inputValue) {
  return inputValue === STATE.answer;
}

// get input value from user
function grabAnswer(form) {
    let inputValue = $(form).find('input[type=radio]:checked').val();
    STATE.answer = inputValue;
}

// keep track of current question
function loadNewQuestion() { 
    STATE.currentQuestion++;
}

// check if user answer is the current correct answer
function userScore() {
    const correct = isAnswerCorrect(STATE.questions[STATE.currentQuestion].correctAnswer) 
    correct ? STATE.score++ : STATE.score;
}

// render and insert answer screen
function renderAnswerView() {
    const answerScreen = generateAnswerView();
    $('.container').html(answerScreen);
}

// render and insert question screen
function renderQuestion() {
    const questionScreen = generateQuestionView();
    $('.container').html(questionScreen);
}

// render and insert results screen
function renderResultsView() {
    const resultsScreen = generateFinalResultsView();
    $('.container').html(resultsScreen);
}

// update score and total question count in header
function initializeScore() {
    $('.score-holder').animate({
        opacity: 1,
    }, '1000');
}

function renderUpdatedQuizTracker() {
    renderUpdatedScore();
    renderUpdatedQuestionNum();
}

function renderUpdatedScore() {
    let score = STATE.score;
    $('.score-tracker').text(`Score: ${score}`);
}

function renderUpdatedQuestionNum() {
    const currentQNum = STATE.currentQuestion+1;
    const totalQuestions = STATE.totalQuestions;
    $('.q-num-tracker').text(`Question: ${currentQNum+'/'+totalQuestions}`);
}

// get random number array that is the total amount of questions desired
function randomizeQuestionOrder() {
    const randoOrderArr = shuffleArray(STORE);
    const totalQuestions = STATE.totalQuestions;
    const actualQuestions = randoOrderArr.slice(0, totalQuestions);
    STATE.questions = actualQuestions;
}

// handle submit button
function handleSubmitButton() {
    $('.container').on('submit', '.js-question-form', function (event) {
        event.preventDefault();
        grabAnswer(this);
        transitionToScreen(() => {
            renderAnswerView();
            fadeInContainer();
        });
        userScore();
        animateScore(() => { renderUpdatedScore(); });
    });
}

// handle next question button
function handleNextQuestionButton() {
    $('.container').on('click', '#js-next-question-btn', () => {
        console.log(STATE.totalQuestions, STATE.currentQuestion);
        if (STATE.totalQuestions - 1 > STATE.currentQuestion) {
            loadNewQuestion();

            animateQuestionNum(() => { renderUpdatedQuestionNum(); });
            transitionToScreen(() => {
                renderQuestion();
                fadeInContainer();
            });
        } else {
            renderResultsView();
        }
    });
}

// handle play again button
function handlePlayAgainButton() {
    $('.container').on('click', '#js-play-again-btn', () => {
        STATE.score = 0;
        STATE.currentQuestion = 0;
        randomizeQuestionOrder();
        renderQuestion();
        renderUpdatedQuizTracker();
    });
}

// handles start quiz button on landing page
function handleStartQuizButton() {
    $('#js-start-btn').click(() => {
        transitionToScreen(() => {
            randomizeQuestionOrder();
            renderQuestion();
            renderUpdatedQuizTracker();
            //animations
            fadeInContainer();
            initializeScore();
            moveStarsUp();
            fadeAndMoveInClouds();
        });
    });
}

//Animation functions
function transitionToScreen(fn) {
    $('.container').fadeOut('1000');
    $('.container').promise().done(fn);
}

function fadeInContainer() {
    $('.container').fadeIn('1000');
    
}

function fadeAndMoveInClouds() {
    $('.background-image-details.clouds').animate({
        bottom: '0px',
        opacity: '1',
    }, '2000');
}

function moveStarsUp() {
    $('.background-image-details.stars').animate({
        top: '-=400px',
    }, '2000');
}

function animateScore(fn) {
    $('.score-tracker').slideUp('500', () => {
        $('.score-tracker').promise().done(() => {
            fn();
            $('.score-tracker').slideDown('500');
        });
    });
}


function animateQuestionNum(fn) {
    $('.q-num-tracker').slideUp('500', () => {
        $('.q-num-tracker').promise().done(() => {
            fn();
            $('.q-num-tracker').slideDown('500');
        });
    });
}


function dropDownMenu() {
    $('.dropdown').click('.dropdown-content', () => {
        let input = $('.dropdown-item:hover').text();
        input = parseInt(input)
        STATE.totalQuestions = input;
    });
}

function main() {
    handleStartQuizButton();
    handleSubmitButton();
    handleNextQuestionButton();
    handlePlayAgainButton();
    dropDownMenu();
}

$(main);