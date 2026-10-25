// ---------- Les favoris (enregistrés dans le navigateur) ----------

function lireFavoris() {
  try {
    return JSON.parse(localStorage.getItem("favoris")) || [];
  } catch (e) {
    return [];
  }
}

function enregistrerFavoris(liste) {
  try {
    localStorage.setItem("favoris", JSON.stringify(liste));
  } catch (e) {
    // Le navigateur refuse d'enregistrer (mode privé) : on ignore.
  }
}

function basculerFavori(id) {
  let favoris = lireFavoris();
  if (favoris.includes(id)) {
    favoris = favoris.filter(f => f !== id);
  } else {
    favoris.push(id);
  }
  enregistrerFavoris(favoris);
}

// ---------- L'avatar dessiné (une petite illustration SVG) ----------

const COULEURS_CHEVEUX = {
  "brune": "#4a3328",
  "blonde": "#e6c27a",
  "rousse": "#c8643c",
  "châtain": "#8a5a3c"
};
const FONDS = ["#fde2e4", "#fff1e6", "#e2ece9", "#f0e6ef", "#fad2e1", "#dfe7fd"];

function avatar(profil) {
  const cheveux = COULEURS_CHEVEUX[profil.cheveux] || "#8a5a3c";
  const fond = FONDS[profil.id % FONDS.length];
  return `
    <svg viewBox="0 0 120 120" class="avatar" style="background:${fond}" aria-hidden="true">
      <path d="M22 120 Q22 82 60 82 Q98 82 98 120 Z" fill="#f4a7b9"/>
      <path d="M28 70 Q24 22 60 22 Q96 22 92 70 Q92 92 80 96 L40 96 Q28 92 28 70 Z" fill="${cheveux}"/>
      <rect x="52" y="66" width="16" height="18" rx="6" fill="#f6d5c3"/>
      <ellipse cx="60" cy="54" rx="22" ry="25" fill="#f8dccb"/>
      <path d="M38 50 Q44 26 66 30 Q82 34 82 50 Q70 38 38 50 Z" fill="${cheveux}"/>
      <circle cx="51" cy="56" r="2.4" fill="#4a3a3a"/>
      <circle cx="69" cy="56" r="2.4" fill="#4a3a3a"/>
      <circle cx="46" cy="64" r="4" fill="#f4a7b9" opacity=".5"/>
      <circle cx="74" cy="64" r="4" fill="#f4a7b9" opacity=".5"/>
      <path d="M54 68 Q60 73 66 68" stroke="#c0566e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`;
}

// ---------- Fabriquer une carte de profil ----------

function carte(profil) {
  const estFavori = lireFavoris().includes(profil.id);
  return `
    <article class="carte">
      ${avatar(profil)}
      <div class="infos">
        <h3>${profil.prenom}, ${profil.age} ans</h3>
        <p class="ville">📍 ${profil.ville}</p>
        <p>${profil.description}</p>
        <div class="tags">
          <span>${profil.cheveux}</span>
          <span>${profil.style}</span>
        </div>
      </div>
      <button class="coeur ${estFavori ? "actif" : ""}" data-id="${profil.id}"
              aria-label="Ajouter ou retirer des favoris">${estFavori ? "❤️" : "🤍"}</button>
    </article>`;
}

// Enlève les accents et met en minuscules, pour que « Leá » trouve « léa ».
function simplifier(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ---------- Page 1 : la recherche ----------

function rechercher() {
  const mots = simplifier(document.getElementById("recherche").value.trim());
  const cheveux = document.getElementById("cheveux").value;
  const style = document.getElementById("style").value;

  const resultats = PROFILS.filter(p => {
    const texte = simplifier(`${p.prenom} ${p.ville} ${p.cheveux} ${p.style} ${p.description}`);
    return (mots === "" || mots.split(/\s+/).every(m => texte.includes(m)))
      && (cheveux === "" || p.cheveux === cheveux)
      && (style === "" || p.style === style);
  });

  afficher(resultats, "resultats",
    "Aucun profil ne correspond. Essaie d'autres mots 🌸");
  document.getElementById("compteur").textContent =
    resultats.length + " profil" + (resultats.length > 1 ? "s" : "") + " trouvé" + (resultats.length > 1 ? "s" : "");
}

// ---------- Page 2 : les favoris ----------

function afficherFavoris() {
  const favoris = lireFavoris();
  const liste = PROFILS.filter(p => favoris.includes(p.id));
  afficher(liste, "liste-favoris",
    "Ta liste est vide. Clique sur 🤍 dans la recherche pour ajouter un profil.");
}

// ---------- Affichage commun aux deux pages ----------

function afficher(profils, idZone, messageVide) {
  const zone = document.getElementById(idZone);
  zone.innerHTML = profils.length
    ? profils.map(carte).join("")
    : `<p class="vide">${messageVide}</p>`;
}

// Quand on clique sur un cœur : on ajoute/retire le favori puis on rafraîchit.
document.addEventListener("click", e => {
  const bouton = e.target.closest(".coeur");
  if (!bouton) return;
  basculerFavori(Number(bouton.dataset.id));
  if (document.getElementById("liste-favoris")) {
    afficherFavoris();
  } else {
    const estFavori = lireFavoris().includes(Number(bouton.dataset.id));
    bouton.textContent = estFavori ? "❤️" : "🤍";
    bouton.classList.toggle("actif", estFavori);
  }
});
