import { useEffect, useRef, useState } from "react";
import {
  Atom,
  BookOpen,
  Brain,
  Calculator,
  Check,
  CircleCheck,
  Code,
  GraduationCap,
  Info,
  Lightbulb,
  Target,
  X
} from "lucide-react";
import "./AiDiagnostic.css";

/* ==========================================================================
   Data
   ========================================================================== */

const TOTAL_QUESTIONS = 5;
const WEAKNESS_ORDER = ["Calculation", "Language", "Problem Solving", "Memorization"];

const SUBJECT_ICONS = {
  Mathematics: Calculator,
  Physics: Atom,
  English: BookOpen,
  Programming: Code
};

const WEAKNESS_ICONS = {
  Calculation: Calculator,
  Language: BookOpen,
  "Problem Solving": Target,
  Memorization: Brain
};

const WEAKNESSES = {
  Calculation: {
    description: "Accuracy in multi-step arithmetic",
    explanation:
      "Small slips with arithmetic can hide what you know. Slow down at each step and check your result.",
    tip: "Try writing every step, then substitute your answer to check it."
  },
  Language: {
    description: "Understanding the question",
    explanation:
      "The method may be right, but a missed word can change the answer. Reread the question and underline what it asks.",
    tip: "Restate the question in your own words before you look at the options."
  },
  "Problem Solving": {
    description: "Choosing a method",
    explanation:
      "You know the facts, but choosing a method takes planning. Name what is given and what you need to find first.",
    tip: "List what you know and what you need. Then choose one method and check that the answer makes sense."
  },
  Memorization: {
    description: "Recalling rules and formulas",
    explanation:
      "The reasoning is on track, but a missing rule can slow you down. A short review keeps formulas within reach.",
    tip: "Review one formula or rule for five minutes, cover it, and write it from memory."
  }
};

const NO_WEAKNESS = {
  explanation: "Great work. Try a harder set next.",
  tip: "Keep the momentum going with a harder set of questions."
};

const QUESTIONS = {
  Mathematics: [
    {
      topic: "Arithmetic · Fractions",
      text: "What is 3/4 + 1/6?",
      options: ["5/6", "4/5", "11/12", "7/10"],
      correctIndex: 2,
      hint: "Use a common denominator of 12: 9/12 + 2/12 = 11/12.",
      weakness: "Calculation"
    },
    {
      topic: "Algebra · Linear equations",
      text: "Solve for x: 4(3x + 2) = 44",
      options: ["x = 2", "x = 3", "x = 9", "x = 12"],
      correctIndex: 1,
      hint: "Distribute first: 12x + 8 = 44, so x = 3.",
      weakness: "Calculation"
    },
    {
      topic: "Algebra · Word problems",
      text: "A ticket costs $12. Which expression shows the cost of n tickets?",
      options: ["12 + n", "12n", "n ÷ 12", "12 − n"],
      correctIndex: 1,
      hint: "The cost of n tickets means $12 repeated n times, so multiply.",
      weakness: "Language"
    },
    {
      topic: "Geometry · Angles",
      text: "Two angles in a triangle measure 45° and 65°. What is the third angle?",
      options: ["60°", "70°", "80°", "90°"],
      correctIndex: 1,
      hint: "Triangle angles sum to 180°, so subtract the two known angles from 180°.",
      weakness: "Problem Solving"
    },
    {
      topic: "Geometry · Circle formulas",
      text: "Which formula gives the circumference of a circle with radius r?",
      options: ["πr²", "πr", "2πr", "2r"],
      correctIndex: 2,
      hint: "Circumference is the distance around a circle: 2πr.",
      weakness: "Memorization"
    }
  ],

  Physics: [
    {
      topic: "Mechanics · Speed",
      text: "A cyclist travels 120 m in 15 s. What is the average speed?",
      options: ["8 m/s", "6 m/s", "10 m/s", "15 m/s"],
      correctIndex: 0,
      hint: "Average speed is distance divided by time: 120 ÷ 15 = 8 m/s.",
      weakness: "Calculation"
    },
    {
      topic: "Forces · Newton's laws",
      text: "A book rests on a table. Which statement describes the forces on the book?",
      options: [
        "Only gravity acts on it",
        "The normal force is greater than gravity",
        "Gravity and the normal force balance",
        "Gravity and friction balance"
      ],
      correctIndex: 2,
      hint: "At rest, the upward and downward forces are equal in size and opposite in direction.",
      weakness: "Language"
    },
    {
      topic: "Energy · Kinetic energy",
      text: "A 2 kg ball moves at 3 m/s. What is its kinetic energy?",
      options: ["6 J", "9 J", "18 J", "3 J"],
      correctIndex: 1,
      hint: "Use KE = ½mv², so ½ × 2 × 3² = 9 J.",
      weakness: "Problem Solving"
    },
    {
      topic: "Electricity · Units",
      text: "Which unit measures electrical resistance?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctIndex: 2,
      hint: "Resistance is measured in ohms (Ω).",
      weakness: "Memorization"
    },
    {
      topic: "Waves · Frequency",
      text: "A wave has a frequency of 5 Hz and a wavelength of 2 m. What is its speed?",
      options: ["10 m/s", "2.5 m/s", "20 m/s", "7 m/s"],
      correctIndex: 0,
      hint: "Speed equals frequency × wavelength: 5 × 2 = 10 m/s.",
      weakness: "Calculation"
    }
  ],

  English: [
    {
      topic: "Reading · Main idea",
      text: 'Read: "Maya packed her bag, checked the clock, and ran to the bus stop." What is the main idea?',
      options: [
        "Maya is going on a trip",
        "Maya is late for the bus",
        "Maya is cleaning her room",
        "Maya is waiting for a friend"
      ],
      correctIndex: 1,
      hint: "The clock and running to the bus stop suggest she is in a hurry to catch the bus.",
      weakness: "Language"
    },
    {
      topic: "Grammar · Parts of speech",
      text: 'In "The cat moved quietly across the room," which word is an adverb?',
      options: ["cat", "quietly", "moved", "room"],
      correctIndex: 1,
      hint: "An adverb describes how an action happens; quietly describes how the cat moved.",
      weakness: "Memorization"
    },
    {
      topic: "Writing · Sentence order",
      text: "Which sentence order creates the clearest paragraph? 1) We found a bench. 2) We walked to the park. 3) We ate lunch.",
      options: ["1, 2, 3", "2, 1, 3", "3, 1, 2", "2, 3, 1"],
      correctIndex: 1,
      hint: "Start with arriving at the park, then finding a bench, then eating lunch.",
      weakness: "Problem Solving"
    },
    {
      topic: "Reading · Reading rate",
      text: "A student reads 300 words in 5 minutes. What is their reading rate?",
      options: ["50 words/min", "60 words/min", "65 words/min", "75 words/min"],
      correctIndex: 1,
      hint: "Divide the total words by the minutes: 300 ÷ 5 = 60 words/min.",
      weakness: "Calculation"
    },
    {
      topic: "Vocabulary · Context clues",
      text: 'In "The trail was arduous, so we stopped often," what does arduous most likely mean?',
      options: ["Short", "Familiar", "Difficult", "Quiet"],
      correctIndex: 2,
      hint: "The need to stop often suggests the trail was difficult.",
      weakness: "Language"
    }
  ],

  Programming: [
    {
      topic: "JavaScript · Operators",
      text: "What is the value of 2 + 3 * 4?",
      options: ["20", "14", "24", "9"],
      correctIndex: 1,
      hint: "Multiplication happens before addition, so 3 * 4 = 12 and 2 + 12 = 14.",
      weakness: "Calculation"
    },
    {
      topic: "Programming · Variable names",
      text: "What does the variable name totalPrice most likely represent?",
      options: ["A list of prices", "The sum of prices", "A discount code", "A single product name"],
      correctIndex: 1,
      hint: "Read the name as total price, which suggests a combined cost.",
      weakness: "Language"
    },
    {
      topic: "Algorithms · Loops",
      text: "A loop runs 4 times and prints its counter each time. How many lines are printed?",
      options: ["3", "4", "5", "8"],
      correctIndex: 1,
      hint: "One print happens per loop run, so four runs print four lines.",
      weakness: "Problem Solving"
    },
    {
      topic: "JavaScript · Data types",
      text: "Which value is a boolean?",
      options: ["'true'", "42", "true", "[]"],
      correctIndex: 2,
      hint: "A boolean is either true or false, without quotation marks.",
      weakness: "Memorization"
    },
    {
      topic: "Debugging · Array indexes",
      text: "An array has 5 items. Which index refers to the last item?",
      options: ["5", "4", "6", "0"],
      correctIndex: 1,
      hint: "Indexes start at 0, so a 5-item array uses indexes 0 through 4.",
      weakness: "Problem Solving"
    }
  ]
};

/* ==========================================================================
   Helpers
   ========================================================================== */

function emptyAnswers() {
  return Array(TOTAL_QUESTIONS).fill(null);
}

function getMainWeakness(subject, answers) {
  const counts = {};
  WEAKNESS_ORDER.forEach((type) => {
    counts[type] = 0;
  });

  QUESTIONS[subject].forEach((question, index) => {
    const answer = answers[index];
    if (Number.isInteger(answer) && answer !== question.correctIndex) {
      counts[question.weakness] += 1;
    }
  });

  const highestCount = Math.max(...WEAKNESS_ORDER.map((type) => counts[type]));
  if (highestCount === 0) return "No clear weakness";

  return WEAKNESS_ORDER.find((type) => counts[type] === highestCount) || "No clear weakness";
}

/* ==========================================================================
   Component
   ========================================================================== */

export default function AiDiagnostic() {
  const [screen, setScreen] = useState("subject");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);

  const rootRef = useRef(null);
  const subjectTitleRef = useRef(null);
  const quizTitleRef = useRef(null);
  const resultTitleRef = useRef(null);
  const questionTitleRef = useRef(null);
  const focusTargetRef = useRef(null);

  useEffect(() => {
    if (!focusTargetRef.current) return;

    const targets = {
      subject: subjectTitleRef,
      quiz: quizTitleRef,
      result: resultTitleRef,
      question: questionTitleRef
    };

    const targetRef = targets[focusTargetRef.current];
    focusTargetRef.current = null;

    if (rootRef.current) {
      rootRef.current.scrollIntoView({ block: "start" });
    }

    if (targetRef?.current) {
      targetRef.current.focus({ preventScroll: true });
    }
  }, [screen, currentIndex]);

  const questionSet = QUESTIONS[selectedSubject];
  const currentQuestion = questionSet[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const hasAnswered = Number.isInteger(selectedAnswer);
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;

  const mainWeakness = getMainWeakness(selectedSubject, answers);
  const weaknessDetails =
    mainWeakness === "No clear weakness" ? NO_WEAKNESS : WEAKNESSES[mainWeakness];
  const MainWeaknessIcon =
    mainWeakness === "No clear weakness" ? CircleCheck : WEAKNESS_ICONS[mainWeakness];

  function selectSubject(subject) {
    if (subject === selectedSubject) return;

    setSelectedSubject(subject);
    setCurrentIndex(0);
    setAnswers(emptyAnswers());
  }

  function startQuiz() {
    focusTargetRef.current = "quiz";
    setScreen("quiz");
  }

  function chooseOption(optionIndex) {
    if (hasAnswered) return;

    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[currentIndex] = optionIndex;
      return nextAnswers;
    });
  }

  function handleOptionKeys(event) {
    const arrowKeys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!arrowKeys.includes(event.key) || hasAnswered) return;

    const optionButtons = Array.from(
      event.currentTarget.querySelectorAll('[role="radio"]')
    );
    if (!optionButtons.length) return;

    event.preventDefault();

    const direction =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const currentFocus = optionButtons.indexOf(document.activeElement);
    const nextIndex =
      (currentFocus + direction + optionButtons.length) % optionButtons.length;

    optionButtons[nextIndex].focus();
    chooseOption(nextIndex);
  }

  function nextQuestion() {
    if (!hasAnswered) return;

    if (isLastQuestion) {
      focusTargetRef.current = "result";
      setScreen("result");
      return;
    }

    focusTargetRef.current = "question";
    setCurrentIndex((index) => index + 1);
  }

  function goBackToSubjects() {
    focusTargetRef.current = "subject";
    setScreen("subject");
  }

  function tryAgain() {
    focusTargetRef.current = "subject";
    setScreen("subject");
    setSelectedSubject("Mathematics");
    setCurrentIndex(0);
    setAnswers(emptyAnswers());
  }

  function practiceAgain() {
    focusTargetRef.current = "quiz";
    setCurrentIndex(0);
    setAnswers(emptyAnswers());
    setScreen("quiz");
  }

  return (
    <div className="awd-root" ref={rootRef}>
      <header className="awd-site-header">
        <div className="awd-header-inner">
          <span className="awd-brand">Find My Weakness</span>
          <span className="awd-workspace">
            <GraduationCap className="awd-icon" aria-hidden="true" />
            <span>Student workspace</span>
          </span>
        </div>
      </header>

      <div className="awd-content">
        {screen === "subject" && (
          <section className="awd-screen" aria-labelledby="awd-subject-title">
            <p className="awd-step-label">Step 1 of 3 · Choose a subject</p>
            <h1
              className="awd-screen-title"
              id="awd-subject-title"
              ref={subjectTitleRef}
              tabIndex={-1}
            >
              What do you want to work on?
            </h1>
            <p className="awd-helper">
              Pick a subject. Five short questions will help you find where to focus.
            </p>

            <div className="awd-subject-grid" role="group" aria-label="Choose a subject">
              {Object.keys(QUESTIONS).map((subject) => {
                const SubjectIcon = SUBJECT_ICONS[subject];
                const isSelected = subject === selectedSubject;

                return (
                  <button
                    key={subject}
                    className={`awd-subject-card${isSelected ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectSubject(subject)}
                  >
                    <span className="awd-subject-icon" aria-hidden="true">
                      <SubjectIcon size={24} strokeWidth={1.8} />
                    </span>
                    <span className="awd-subject-name">{subject}</span>
                    {isSelected && (
                      <CircleCheck
                        className="awd-selected-mark"
                        size={20}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="awd-footer-row">
              <p className="awd-footer-note">
                <Info className="awd-icon" aria-hidden="true" />
                <span>No grades. No timer. Just practice.</span>
              </p>
              <button
                className="awd-btn awd-btn-primary"
                type="button"
                onClick={startQuiz}
              >
                <span>Find my weakness</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {screen === "quiz" && currentQuestion && (
          <section className="awd-screen" aria-labelledby="awd-quiz-title">
            <p className="awd-step-label">
              Step 2 of 3 · <span>{selectedSubject}</span>
            </p>
            <h1
              className="awd-screen-title"
              id="awd-quiz-title"
              ref={quizTitleRef}
              tabIndex={-1}
            >
              Try a problem
            </h1>
            <p className="awd-helper">
              Choose the answer that feels right. Every attempt helps you learn.
            </p>

            <div className="awd-quiz-meta">
              <p className="awd-question-count">
                Question {currentIndex + 1} of {TOTAL_QUESTIONS}
              </p>
              <div
                className="awd-progress-track"
                role="progressbar"
                aria-label="Question progress"
                aria-valuemin={1}
                aria-valuemax={TOTAL_QUESTIONS}
                aria-valuenow={currentIndex + 1}
              >
                <div
                  className="awd-progress-fill"
                  style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
            </div>

            <div className="awd-card awd-question-card">
              <p className="awd-topic">{currentQuestion.topic}</p>
              <h2
                className="awd-question-text"
                id="awd-question-text"
                ref={questionTitleRef}
                tabIndex={-1}
              >
                {currentQuestion.text}
              </h2>
              <p className="awd-option-instruction">Select one answer.</p>

              <div
                className="awd-options"
                role="radiogroup"
                aria-labelledby="awd-question-text"
                onKeyDown={handleOptionKeys}
              >
                {currentQuestion.options.map((option, index) => {
                  const isSelected = hasAnswered && index === selectedAnswer;
                  const isLocked = hasAnswered;

                  return (
                    <button
                      key={option}
                      className={`awd-option${isSelected ? " is-selected" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={isLocked || undefined}
                      tabIndex={
                        isLocked ? (isSelected ? 0 : -1) : index === 0 ? 0 : -1
                      }
                      onClick={() => chooseOption(index)}
                    >
                      <span className="awd-radio-control" aria-hidden="true">
                        <span className="awd-radio-dot" />
                      </span>
                      <span className="awd-option-label">{option}</span>
                      <span className="awd-your-answer" aria-hidden="true">
                        Your answer
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="awd-feedback" role="status" aria-live="polite">
                  <span className="awd-feedback-icon" aria-hidden="true">
                    {selectedAnswer === currentQuestion.correctIndex ? (
                      <Check className="awd-icon" strokeWidth={2} />
                    ) : (
                      <X className="awd-icon" strokeWidth={2} />
                    )}
                  </span>
                  <div className="awd-feedback-copy">
                    <p className="awd-feedback-status">
                      {selectedAnswer === currentQuestion.correctIndex
                        ? "Correct"
                        : "Not quite"}
                    </p>
                    <p className="awd-feedback-hint">{currentQuestion.hint}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="awd-footer-row awd-quiz-footer">
              <div className="awd-footer-stack">
                <p className="awd-footer-note">Mistakes are part of the process.</p>
                <button
                  className="awd-text-link"
                  type="button"
                  onClick={goBackToSubjects}
                >
                  Back
                </button>
              </div>
              <button
                className="awd-btn awd-btn-primary"
                type="button"
                disabled={!hasAnswered}
                onClick={nextQuestion}
              >
                <span>{isLastQuestion ? "See my result" : "Next question"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {screen === "result" && (
          <section className="awd-screen" aria-labelledby="awd-result-title">
            <p className="awd-step-label">
              Step 3 of 3 · <span>{selectedSubject}</span>
            </p>
            <h1
              className="awd-screen-title"
              id="awd-result-title"
              ref={resultTitleRef}
              tabIndex={-1}
            >
              Here&apos;s where to focus
            </h1>
            <p className="awd-helper">
              A small insight to make your next practice session more useful.
            </p>

            <article className="awd-card awd-weakness-card" aria-labelledby="awd-weakness-name">
              <div className="awd-card-meta">
                <span>Main weakness</span>
                <span>Sample result · 5 questions</span>
              </div>

              <div className="awd-weakness-heading">
                <span className="awd-weakness-icon" aria-hidden="true">
                  <MainWeaknessIcon size={20} strokeWidth={1.8} />
                </span>
                <h2 id="awd-weakness-name">{mainWeakness}</h2>
              </div>

              <p className="awd-weakness-explanation">{weaknessDetails.explanation}</p>

              <div className="awd-tip-box">
                <span className="awd-tip-icon" aria-hidden="true">
                  <Lightbulb className="awd-icon" />
                </span>
                <p>{weaknessDetails.tip}</p>
              </div>
            </article>

            <article className="awd-card awd-snapshot-card" aria-labelledby="awd-snapshot-title">
              <h2 className="awd-card-title" id="awd-snapshot-title">
                Your skill snapshot
              </h2>
              <ul className="awd-skill-list">
                {WEAKNESS_ORDER.map((type) => {
                  const SkillIcon = WEAKNESS_ICONS[type];
                  const isFocus = type === mainWeakness;

                  return (
                    <li className="awd-skill-row" key={type}>
                      <span className="awd-skill-icon" aria-hidden="true">
                        <SkillIcon className="awd-icon" />
                      </span>
                      <div className="awd-skill-copy">
                        <span className="awd-skill-name">{type}</span>
                        <span className="awd-skill-description">
                          {WEAKNESSES[type].description}
                        </span>
                      </div>
                      <span
                        className={`awd-skill-status${isFocus ? " is-focus" : ""}`}
                      >
                        {isFocus ? "Focus here" : "Looking good"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>

            <div className="awd-footer-row awd-result-footer">
              <p className="awd-footer-note">
                {mainWeakness === "No clear weakness"
                  ? "Start with a few focused problems at the next level."
                  : `Start with a few focused ${mainWeakness} problems.`}
              </p>
              <div className="awd-footer-actions">
                <button
                  className="awd-btn awd-btn-outline"
                  type="button"
                  onClick={tryAgain}
                >
                  Try again
                </button>
                <button
                  className="awd-btn awd-btn-primary"
                  type="button"
                  onClick={practiceAgain}
                >
                  <span>
                    {mainWeakness === "No clear weakness"
                      ? "Practice more"
                      : `Practice ${mainWeakness}`}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
