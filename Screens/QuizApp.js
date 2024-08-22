import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [view, setView] = useState('quiz');
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answers: [''],
    correct: '',
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    fetch('https://66c42bddb026f3cc6cee3aad.mockapi.io/questions')
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleAnswerOptionClick = (selectedAnswer) => {
    const correctAnswer = questions[currentQuestionIndex].correct;
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handleRetry = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowScore(false);
    setView('quiz');
  };

  const handleNewQuestionChange = (text, index) => {
    if (index !== undefined) {
      const answers = [...newQuestion.answers];
      answers[index] = text;
      setNewQuestion({ ...newQuestion, answers });
    } else {
      setNewQuestion({ ...newQuestion, [text.name]: text.value });
    }
  };

  const handleAddQuestion = () => {
    fetch('https://66c42bddb026f3cc6cee3aad.mockapi.io/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newQuestion),
    })
      .then(response => response.json())
      .then(data => {
        setQuestions([...questions, data]);
        setNewQuestion({ question: '', answers: [''], correct: '' });
        setView('quiz');
      })
      .catch(error => console.error('Error adding question:', error));
  };

  const handleEditQuestion = () => {
    if (!selectedQuestion) return;

    fetch(`https://66c42bddb026f3cc6cee3aad.mockapi.io/questions/${selectedQuestion.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedQuestion),
    })
      .then(response => response.json())
      .then(data => {
        const updatedQuestions = questions.map(q =>
          q.id === selectedQuestion.id ? data : q
        );
        setQuestions(updatedQuestions);
        setView('quiz');
      })
      .catch(error => console.error('Error updating question:', error));
  };

  const handleDeleteQuestion = (questionId) => {
    fetch(`https://66c42bddb026f3cc6cee3aad.mockapi.io/questions/${questionId}`, {
      method: 'DELETE',
    })
      .then(() => {
        const filteredQuestions = questions.filter(q => q.id !== questionId);
        setQuestions(filteredQuestions);
        setCurrentQuestionIndex(0);
      })
      .catch(error => console.error('Error deleting question:', error));
  };

  const handleAddAnswer = () => {
    setNewQuestion(prevState => ({
      ...prevState,
      answers: [...prevState.answers, '']
    }));
  };

  const handleRemoveAnswer = (index) => {
    setNewQuestion(prevState => ({
      ...prevState,
      answers: prevState.answers.filter((_, i) => i !== index)
    }));
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[index] = value;
    setNewQuestion(prevState => ({
      ...newQuestion,
      answers: updatedAnswers
    }));
  };

  const handleEditChange = (index, value) => {
    if (selectedQuestion) {
      const updatedAnswers = [...selectedQuestion.answers];
      updatedAnswers[index] = value;
      setSelectedQuestion(prevState => ({
        ...prevState,
        answers: updatedAnswers
      }));
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setView('edit');
  };

  return (
    <View style={styles.app}>
      {view === 'quiz' && (
        <>
          {showScore ? (
            <View style={styles.scoreSection}>
              <Text style={{color: 'white'}}>You scored {score} out of {questions.length}</Text>
              <Button title="Retry Quiz" onPress={handleRetry} />
            </View>
          ) : (
            <>
              {questions.length > 0 ? (
                <View style={styles.questionSection}>
                  <Text style={styles.questionText}>Quiz APP</Text>
                  <Text style={styles.questionCount}>
                    Question {currentQuestionIndex + 1}/{questions.length}
                  </Text>
                  <Text style={styles.questionText}>{questions[currentQuestionIndex].question}</Text>
                </View>
              ) : (
                <Text>Loading...</Text>
              )}
              <View style={styles.answerSection}>
                {questions.length > 0 && questions[currentQuestionIndex].answers.map((answer, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.answerButton}
                    onPress={() => handleAnswerOptionClick(answer)}
                  >
                    <Text style={styles.answerText}>{answer}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.actionButtons}>
            <Button title="Create Question" onPress={() => setView('create')} />
            <Button
              title="Edit Question"
              onPress={() => handleSelectQuestion(questions[currentQuestionIndex])}
              disabled={questions.length === 0}
            />
            {questions.length > 0 && (
              <Button
                title="Delete Question"
                onPress={() => {
                  if (currentQuestionIndex < questions.length) {
                    handleDeleteQuestion(questions[currentQuestionIndex].id);
                  }
                }}
              />
            )}
          </View>
        </>
      )}

      {view === 'create' && (
        <View style={styles.createQuestionSection}>
          <Text style={styles.header}>Create a New Question</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter question"
            value={newQuestion.question}
            onChangeText={(text) => handleNewQuestionChange({ name: 'question', value: text })}
          />
          {newQuestion.answers.map((answer, index) => (
            <View key={index} style={styles.answerInput}>
              <TextInput
                style={styles.answerTextInput}
                placeholder={`Answer ${index + 1}`}
                value={answer}
                onChangeText={(text) => handleAnswerChange(index, text)}
              />
              <Button title="Remove" onPress={() => handleRemoveAnswer(index)} color="#dc3545" />
            </View>
          ))}
          <Button title="Add Answer" onPress={handleAddAnswer} />
          <TextInput
            style={styles.input}
            placeholder="Correct answer"
            value={newQuestion.correct}
            onChangeText={(text) => handleNewQuestionChange({ name: 'correct', value: text })}
          />
          <Button title="Add Question" onPress={handleAddQuestion} />
          <Button title="Cancel" onPress={() => setView('quiz')} color="#6c757d" />
        </View>
      )}

      {view === 'edit' && selectedQuestion && (
        <View style={styles.editQuestionSection}>
          <Text style={styles.header}>Edit Question</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter question"
            value={selectedQuestion.question}
            onChangeText={(text) => setSelectedQuestion({ ...selectedQuestion, question: text })}
          />
          {selectedQuestion.answers.map((answer, index) => (
            <TextInput
              key={index}
              style={styles.answerTextInput}
              placeholder={`Answer ${index + 1}`}
              value={answer}
              onChangeText={(text) => handleEditChange(index, text)}
            />
          ))}
          <TextInput
            style={styles.input}
            placeholder="Correct answer"
            value={selectedQuestion.correct}
            onChangeText={(text) => setSelectedQuestion({ ...selectedQuestion, correct: text })}
          />
          <Button title="Update Question" onPress={handleEditQuestion} />
          <Button title="Cancel" onPress={() => setView('quiz')} color="#6c757d" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#282c34',
  },
  questionSection: {
    marginBottom: 20,
  },
  questionCount: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  questionText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  answerSection: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  answerText: {
    color: 'white',
    fontSize: 16,
  },
  scoreSection: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    color: 'white',
  },
  actionButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  createQuestionSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  editQuestionSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007bff',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  answerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerTextInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
});

export default QuizApp;
