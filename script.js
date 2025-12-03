// projet 2 questions data

const questions = [
  { id: 1, text: "Comment dit-on 'Bonjour' en portugais ? (2 réponses attendues)", type: 'checkbox', options: ['Bom dia','Olá','Tchau','Até mais'], correct: [0,1] },
  { id: 2, text: "Que peut-on dire si on rencontre quelqu'un qu'on n'a pas vu depuis longtemps ? (2 réponses)", type: 'checkbox', options: ['Faz tempo que não vejo você!','Que bom te ver!','Prazer em conhecê-lo(a).','Nos falamos ontem.'], correct: [0,1] },
  { id: 3, text: "Que peut-on dire si quelqu'un nous manque ?", type: 'radio', options: ['Tudo bem.','Estou com saudades de você.','O dia está bonito.'], correct: 1 },
  { id: 4, text: 'Comment dire "ça va" en portugais ?', type: 'text', correct: ['tudo bem','tudo bom','como vai'] },
  { id: 5, text: 'Comment dire "merci" en portugais ?', type: 'radio', options: ['obrigado(a).','de nada.','agradeço.'], correct: 0 },
  { id: 6, text: "Comment on appelle quelqu'un qui est né au Brésil ?", type: 'radio', options: ['brasileno.','bresileiro.','brasileiro.'], correct: 2 },
  { id: 7, text: 'Quelle est la capitale du Brésil ?', type: 'radio', options: ['Brasilia','São Paulo','Rio de janeiro'], correct: 0 },
  { id: 8, text: 'Choisissez la bonne traduction pour le mot "soir" :', type: 'radio', options: ['noite','dia','tarde','madrugada'], correct: 0 },
  { id: 9, text: 'Comment dit-on "soleil" en portugais ?', type: 'radio', options: ['solo','sol','solar'], correct: 1 },
  { id: 10, text: 'Comment dit-on "au revoir" en portugais ?', type: 'text', correct: ['tchau','até mais','até logo','até breve','adeus'] }
];

let currentQuestionIndex = 0;
let userAnswers = {}; // store answers by question id

// DOM refs
const questionsContainer = document.getElementById('questions');
const verifyBtn = document.getElementById('verifyBtn');
const progressBar = document.getElementById('progressBar');
const scoreText = document.getElementById('scoreText');
const resultsDiv = document.getElementById('results');

// build UI: each question hidden except first
function buildQuiz(){
  questionsContainer.innerHTML = '';
  questions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'card question-card';
    card.dataset.qid = q.id;
    if (idx !== 0) card.classList.add('hidden');

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = `Question ${idx+1}`;

    const p = document.createElement('p');
    p.className = 'card-text';
    p.textContent = q.text;

    body.appendChild(title);
    body.appendChild(p);

    // answer area
    const answerWrap = document.createElement('div');
    answerWrap.className = 'answer-wrap';

    if (q.type === 'text'){
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control answer-input';
      input.dataset.qid = q.id;
      answerWrap.appendChild(input);
      // no auto-advance: user will click 'Valider' to submit this answer

    } else if (q.type === 'radio'){
      q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        const inp = document.createElement('input');
        inp.className = 'form-check-input answer-input';
        inp.type = 'radio';
        inp.name = `q${q.id}`;
        inp.value = i;
        inp.dataset.qid = q.id;
        const lab = document.createElement('label');
        lab.className = 'form-check-label';
        lab.textContent = opt;
        div.appendChild(inp);
        div.appendChild(lab);
        answerWrap.appendChild(div);

        // no auto-advance on change; submit via 'Valider'
      });
    } else if (q.type === 'checkbox'){
      q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        const inp = document.createElement('input');
        inp.className = 'form-check-input answer-input';
        inp.type = 'checkbox';
        inp.value = i;
        inp.dataset.qid = q.id;
        const lab = document.createElement('label');
        lab.className = 'form-check-label';
        lab.textContent = opt;
        div.appendChild(inp);
        div.appendChild(lab);
        answerWrap.appendChild(div);

        // no auto-advance on change; submit via 'Valider'
      });
    } else if (q.type === 'select'){
      const sel = document.createElement('select');
      sel.className = 'form-control answer-input';
      sel.dataset.qid = q.id;
      const empty = document.createElement('option'); empty.value = ''; empty.textContent = '---'; sel.appendChild(empty);
      q.options.forEach((opt,i)=>{
        const o = document.createElement('option'); o.value = i; o.textContent = opt; sel.appendChild(o);
      });
      answerWrap.appendChild(sel);
      // no auto-advance on select change
    }

    // show answer button
    const showBtn = document.createElement('button');
    showBtn.type = 'button';
    showBtn.className = 'btn btn-link btn-sm ml-2 show-answer-btn';
    showBtn.dataset.qid = q.id;
    showBtn.textContent = 'Afficher la réponse'; // bouton pour afficher la réponse
    showBtn.setAttribute('aria-label', 'Afficher la bonne réponse pour cette question');
    showBtn.addEventListener('click', () => toggleRevealAnswer(q.id));

    // validate (submit) button per question
    const validateBtn = document.createElement('button');
    validateBtn.type = 'button';
    validateBtn.className = 'btn btn-success btn-sm ml-2 validate-btn';
    validateBtn.textContent = 'Valider';
    validateBtn.dataset.qid = q.id;
    validateBtn.addEventListener('click', () => submitAnswer(q.id));

    body.appendChild(answerWrap);
    body.appendChild(showBtn);
    body.appendChild(validateBtn);
    card.appendChild(body);
    questionsContainer.appendChild(card);
  });
}

function submitAnswer(qid){
  const q = questions.find(x=>x.id===qid);
  if (!q) return;
  const answer = collectAnswer(q);
  // store answer (could be null)
  userAnswers[qid] = answer;

  // optionally disable inputs to prevent modification after submit
  const card = [...questionsContainer.children].find(c=>Number(c.dataset.qid)===qid);
  if (card){
    const inputs = card.querySelectorAll('.answer-input');
    inputs.forEach(i=> i.disabled = true);

    // show a small confirmation
    let done = card.querySelector('.submitted-note');
    if (!done){
      done = document.createElement('div');
      done.className = 'submitted-note text-success mt-2';
      done.textContent = 'Réponse enregistrée.';
      card.querySelector('.card-body').appendChild(done);
    }
  }

  // then advance to next question
  revealNext(qid);
}

function revealNext(qid){
  // find index of this question
  const idx = questions.findIndex(q=>q.id===qid);
  if (idx >= 0){
    // hide current card
    const currentCard = questionsContainer.children[idx];
    if (currentCard && !currentCard.classList.contains('hidden')) currentCard.classList.add('hidden');

    // reveal next card if exists
    if (idx < questions.length-1){
      const nextCard = questionsContainer.children[idx+1];
      if (nextCard && nextCard.classList.contains('hidden')) nextCard.classList.remove('hidden');
    }
  }
}

function toggleRevealAnswer(qid){
  // show correct answer inline under the question
  const q = questions.find(x=>x.id===qid);
  const card = [...questionsContainer.children].find(c=>Number(c.dataset.qid)===qid);
  if (!card) return;
  let reveal = card.querySelector('.reveal');
  if (reveal){ reveal.remove(); return; }
  reveal = document.createElement('div'); reveal.className='reveal mt-2';
  const ans = document.createElement('div'); ans.className='answer-reveal';
  if (q.type==='text'){
    ans.textContent = `Réponse: ${Array.isArray(q.correct)?q.correct.join(', '):q.correct}`;
  } else if (q.type==='checkbox'){
    ans.textContent = 'Réponse: ' + q.correct.map(i=>q.options[i]).join(', ');
  } else if (q.type==='radio' || q.type==='select'){
    ans.textContent = `Réponse: ${q.options[q.correct]}`;
  }
  reveal.appendChild(ans);
  card.querySelector('.card-body').appendChild(reveal);
}

function collectAnswer(q){
  const card = [...questionsContainer.children].find(c=>Number(c.dataset.qid)===q.id);
  if (!card) return null;
  const inputs = card.querySelectorAll('.answer-input');
  if (q.type==='text'){
    const v = inputs[0].value.trim();
    return v;
  } else if (q.type==='radio'){
    const sel = [...inputs].find(i=>i.checked);
    return sel ? Number(sel.value) : null;
  } else if (q.type==='checkbox'){
    const sel = [...inputs].filter(i=>i.checked).map(i=>Number(i.value));
    return sel;
  } else if (q.type==='select'){
    const v = inputs[0].value; return v===''?null:Number(v);
  }
}

// normalise texte (trim, lowercase, retire diacritiques)
function normalizeText(str){
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .normalize('NFD')                 // sépare caractères + diacritiques
    .replace(/[\u0300-\u036f]/g, '') // retire diacritiques
    .replace(/\s+/g, ' ')            // espaces multiples -> simple espace
    .toLowerCase();
}

function grade(){
  let totalFull=0, totalPossible=questions.length;
  const detailed = [];

  questions.forEach(q=>{
    // prefer stored submitted answer if available, otherwise read current inputs
    const answer = (userAnswers[q.id] !== undefined) ? userAnswers[q.id] : collectAnswer(q);
    let result = { id:q.id, status:'wrong', score:0 };

    if (q.type==='text'){
      if (answer===null || answer===''){ result.status='wrong'; result.score=0; }
      else{
        const normAns = normalizeText(answer);
        const ok = Array.isArray(q.correct)
          ? q.correct.map(s=>normalizeText(s)).includes(normAns)
          : normalizeText(String(q.correct)) === normAns;
        if (ok){ result.status='full'; result.score=1; totalFull++; }
      }
    } else if (q.type==='radio' || q.type==='select'){
      if (answer===null){ result.status='wrong'; result.score=0; }
      else if (answer===q.correct){ result.status='full'; result.score=1; totalFull++; }
    } else if (q.type==='checkbox'){
      if (!Array.isArray(answer) || answer.length===0){ result.status='wrong'; result.score=0; }
      else {
        const correctSet = new Set(q.correct);
        const answerSet = new Set(answer);
        // count matching
        let matchCount=0; for (const a of answerSet) if (correctSet.has(a)) matchCount++;
        if (matchCount===0){ result.status='wrong'; result.score=0; }
        else if (matchCount===correctSet.size && answerSet.size===correctSet.size){ result.status='full'; result.score=1; totalFull++; }
        else { result.status='partial'; result.score=matchCount/correctSet.size; }
      }
    }

    detailed.push(result);
  });

  return { totalFull, totalPossible, detailed };
}
function applyFeedback(grades){
  // clear previous
  resultsDiv.innerHTML='';

  // helper to format answer values into readable text
  function formatAnswer(q, answer){
    if (answer === null || answer === undefined || (Array.isArray(answer) && answer.length===0) || answer === '') return 'Aucune réponse';
    if (q.type === 'text') return String(answer);
    if (q.type === 'radio' || q.type === 'select'){
      return (typeof answer === 'number' && q.options && q.options[answer]!==undefined) ? q.options[answer] : String(answer);
    }
    if (q.type === 'checkbox'){
      if (!Array.isArray(answer)) return String(answer);
      return answer.map(i => (q.options && q.options[i]!==undefined) ? q.options[i] : i).join(', ');
    }
    return String(answer);
  }

  questions.forEach((q, idx) => {
    const card = [...questionsContainer.children].find(c=>Number(c.dataset.qid)===q.id);
    const g = grades.detailed.find(d=>d.id===q.id);

    // build result card
    const out = document.createElement('div');
    out.className = 'card mb-2';
    const body = document.createElement('div');
    body.className = 'card-body';
    const title = document.createElement('h6');
    title.className = 'card-title';
    title.textContent = `Q${idx+1}: ${q.text}`;
    body.appendChild(title);

    const userAns = (userAnswers[q.id] !== undefined) ? userAnswers[q.id] : collectAnswer(q);
    const userText = formatAnswer(q, userAns);
    const correctText = (q.type === 'checkbox') ? q.correct.map(i=>q.options[i]).join(', ') : (q.type==='text' ? (Array.isArray(q.correct)?q.correct.join(', '):q.correct) : (q.options?q.options[q.correct]:String(q.correct)));

    const pUser = document.createElement('p');
    pUser.innerHTML = `<strong>Votre réponse:</strong> ${userText}`;
    body.appendChild(pUser);

    const pCorrect = document.createElement('p');
    pCorrect.innerHTML = `<strong>Bonne(s) réponse(s):</strong> ${correctText}`;
    body.appendChild(pCorrect);

    // status badge
    const status = document.createElement('div');
    status.className = 'mt-2';
    let badge = document.createElement('span');
    badge.className = 'badge ';
    if (!g) {
      badge.textContent = 'non notée';
      badge.classList.add('badge-secondary');
    } else if (g.status === 'full'){
      badge.textContent = 'Correct';
      badge.classList.add('badge-success');
    } else if (g.status === 'partial'){
      badge.textContent = `Partiel (${Math.round(g.score*100)}%)`;
      badge.classList.add('badge-warning');
    } else {
      badge.textContent = 'Incorrect';
      badge.classList.add('badge-danger');
    }
    status.appendChild(badge);
    body.appendChild(status);

    out.appendChild(body);
    resultsDiv.appendChild(out);

    // also, mark original question card if present
    if (card){
      card.querySelector('.card-body').classList.remove('full-correct','partial-correct','wrong-correct');
      if (g){
        if (g.status==='full') card.querySelector('.card-body').classList.add('full-correct');
        else if (g.status==='partial') card.querySelector('.card-body').classList.add('partial-correct');
        else card.querySelector('.card-body').classList.add('wrong-correct');
      }
    }
  });

  // progress bar and score text
  const percent = Math.round((grades.totalFull / grades.totalPossible) * 100);
  progressBar.style.width = percent + '%';
  progressBar.textContent = `${percent}%`;
  if (grades.totalFull===0) scoreText.textContent = `0 bonnes réponses sur ${grades.totalPossible}`;
  else scoreText.textContent = `${grades.totalFull} bonnes réponses sur ${grades.totalPossible}`;
}

verifyBtn.addEventListener('click', ()=>{
  const g = grade();
  applyFeedback(g);
});

// init
buildQuiz();

// Export for debugging in console
window._quiz = { questions, buildQuiz, grade, applyFeedback };
