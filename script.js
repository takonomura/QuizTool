function getCorrectAnswers(choices) {
  var answers = [];
  for (var i = 0; i < choices.length; i++) {
    var choice = choices[i];
    if (choice.isCorrectAnswer()) {
      answers.push(choice.getValue());
    }
  }
  return answers;
}

function getItems(form) {
  var formItems = form.getItems(FormApp.ItemType.CHECKBOX);
  var items = [];
  for (var i = 0; i < formItems.length; i++) {
    var formItem = formItems[i];
    var checkboxItem = formItem.asCheckboxItem();
    var choices = checkboxItem.getChoices();
    items[i] = {
      formItem: formItem,
      maxScore: checkboxItem.getPoints(),
      choices: choices,
      answers: getCorrectAnswers(choices),
    };
  }
  return items;
}

function calculateScorePerChoice(item, responseItem) {
  var score = 0;
  var choices = item.choices;
  var answers = responseItem.getResponse();

  for (var i = 0; i < choices.length; i++) {
    var value = choices[i].getValue();
    var correct = choices[i].isCorrectAnswer();
    var checked = answers.indexOf(value) != -1;
    if (correct == checked) {
      score++;
    }
  }
  return score;
}

function calculateScore(item, responseItem) {
  var score = 0;
  var choices = item.choices;
  var answers = responseItem.getResponse();

  for (var i = 0; i < choices.length; i++) {
    var value = choices[i].getValue();
    var correct = choices[i].isCorrectAnswer();
    var checked = answers.indexOf(value) != -1;
    if (correct != checked) {
      score--;
      continue;
    }
    if (correct && checked) {
      score++;
    }
  }

  score = Math.min(score, item.maxScore);
  score = Math.max(score, 0);
  return score;
}

function checkScore(response, items) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var responseItem = response.getGradableResponseForItem(item.formItem);
    if (responseItem == null) {
      continue;
    }
    var score = responseItem.getScore();
    console.log(item.maxScore, item.answers.length, item.choices.length);
    if (item.answers.length == item.maxScore) {
      score = calculateScore(item, responseItem);
    }
    if (item.choices.length == item.maxScore) {
      score = calculateScorePerChoice(item, responseItem);
    }
    responseItem.setScore(score);
    response.withItemGrade(responseItem);
  }
}

function checkAllScore() {
  var form = FormApp.getActiveForm();
  var items = getItems(form);
  var responses = form.getResponses();

  for (var i = 0; i < responses.length; i++) {
    checkScore(responses[i], items);
  }
  form.submitGrades(responses);
}
