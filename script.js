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

let userAnswers = {}; // réponses utilisateur stockées par id de question

// éléments du DOM 
const questionsContainer = document.getElementById('questions');
const verifier = document.getElementById('verifier');
const progressBar = document.getElementById('progressBar');
const scoreText = document.getElementById('scoreText');
const resultsDiv = document.getElementById('results');

// toutes les questions cachées sauf la première
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

    // zone de réponse
    const answerWrap = document.createElement('div');
    answerWrap.className = 'answer-wrap';

    if (q.type === 'text'){
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control answer-input';
      input.dataset.qid = q.id;
      answerWrap.appendChild(input);
      // pas d'avance automatique : l'utilisateur cliquera sur « Valider » pour soumettre cette réponse

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
    }

    // bouton Valider (Soumettre) par question (pas de « Afficher la réponse » ici)
    const validateBtn = document.createElement('button');
    validateBtn.type = 'button';
    validateBtn.className = 'btn btn-success btn-sm mt-2 ml-2 validate-btn';
    validateBtn.textContent = 'Valider';
    validateBtn.dataset.qid = q.id;
    validateBtn.addEventListener('click', () => submitAnswer(q.id));

    body.appendChild(answerWrap);
    body.appendChild(validateBtn);
    card.appendChild(body);
    questionsContainer.appendChild(card);
  });
}

function submitAnswer(qid){
  const q = questions.find(x=>x.id===qid);
  if (!q) return;
  const answer = collectAnswer(q);
  //  stocker la réponse
  userAnswers[qid] = answer;

  // désactiver éventuellement les entrées pour empêcher toute modification après la soumission
  const card = [...questionsContainer.children].find(c=>Number(c.dataset.qid)===qid);
  if (card){
    const inputs = card.querySelectorAll('.answer-input');
    inputs.forEach(i=> i.disabled = true);

    // afficher une petite confirmation
    let done = card.querySelector('.submitted-note');
    if (!done){
      done = document.createElement('div');
      done.className = 'submitted-note text-success mt-2';
      done.textContent = 'Réponse enregistrée.';
      card.querySelector('.card-body').appendChild(done);
    }
  }

  // question suivante
  revealNext(qid);
}

function revealNext(qid){
  // trouver l'index de cette question
  const idx = questions.findIndex(q=>q.id===qid);
  if (idx >= 0){
    // cacher la carte actuelle
    const currentCard = questionsContainer.children[idx];
    if (currentCard && !currentCard.classList.contains('hidden')) currentCard.classList.add('hidden');

    // révéler la carte suivante si elle existe
    if (idx < questions.length-1){
      const nextCard = questionsContainer.children[idx+1];
      if (nextCard && nextCard.classList.contains('hidden')) nextCard.classList.remove('hidden');
    } else {
      // dernière question soumise — révéler le bouton final verifier
      if (verifier){
        verifier.classList.remove('hidden');
        verifier.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
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

// normaliser le texte (couper, mettre en minuscules, supprimer les diacritiques)
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
    // préférer la réponse soumise stockée si disponible, sinon lire les entrées actuelles
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
        // compter les correspondances
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
  // effacer les précédents
  resultsDiv.innerHTML='';


  // révéler la zone des résultats et le texte du score (ils sont cachés par défaut dans le HTML)
  if (resultsDiv) resultsDiv.classList.remove('hidden');
  if (scoreText) scoreText.classList.remove('hidden');

  // formater les valeurs de réponse en texte lisible
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

    // construire la carte de résultat
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

    const btnShow = document.createElement('button');
    btnShow.type = 'button';
    btnShow.className = 'btn btn-outline-info btn-sm';
    btnShow.textContent = 'Afficher la bonne réponse';

    const spanAns = document.createElement('span');
    spanAns.className = 'ml-2';
    spanAns.style.display = 'none';
    spanAns.textContent = correctText;

    btnShow.addEventListener('click', () => {
      const visible = spanAns.style.display === 'inline';
      spanAns.style.display = visible ? 'none' : 'inline';
      btnShow.textContent = visible ? 'Afficher la bonne réponse' : 'Masquer la bonne réponse';
    });

    pCorrect.appendChild(btnShow);
    pCorrect.appendChild(spanAns);
    body.appendChild(pCorrect);

    // badge de statut
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

    // aussi, marquer la carte de question originale si présente
    if (card){
      card.querySelector('.card-body').classList.remove('full-correct','partial-correct','wrong-correct');
      if (g){
        if (g.status==='full') card.querySelector('.card-body').classList.add('full-correct');
        else if (g.status==='partial') card.querySelector('.card-body').classList.add('partial-correct');
        else card.querySelector('.card-body').classList.add('wrong-correct');
      }
    }
  });

  // mettre à jour la barre de progression et le texte du score
  const percent = Math.round((grades.totalFull / grades.totalPossible) * 100);
  progressBar.style.width = percent + '%';
  progressBar.textContent = `${percent}%`;
  if (grades.totalFull===0) scoreText.textContent = `0 bonnes réponses sur ${grades.totalPossible}`;
  else scoreText.textContent = `${grades.totalFull} bonnes réponses sur ${grades.totalPossible}`;

  // cacher bt vérifier
  if (verifier) verifier.classList.add('hidden');
}

if (verifier){
  verifier.addEventListener('click', ()=>{
    const g = grade();
    applyFeedback(g);
  });
}

// init
buildQuiz();


