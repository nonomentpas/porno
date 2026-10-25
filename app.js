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

// ---------- Fabriquer un portrait (comme une petite annonce de journal) ----------

function carte(profil) {
  const estFavori = lireFavoris().includes(profil.id);
  return `
    <article class="carte">
      <div class="initiale" aria-hidden="true">${profil.prenom[0]}</div>
      <div class="infos">
        <p class="rubrique">${profil.ville} · ${profil.cheveux} · ${profil.style}</p>
        <h3>${profil.prenom}, ${profil.age} ans</h3>
        <p class="citation">« ${profil.description} »</p>
      </div>
      <button class="retenir ${estFavori ? "actif" : ""}" data-id="${profil.id}">
        ${estFavori ? "Retenue ✓" : "Retenir"}
      </button>
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
    "Aucun portrait ne correspond à votre demande. Essayez d'autres mots.");
  document.getElementById("compteur").textContent =
    resultats.length + " portrait" + (resultats.length > 1 ? "s" : "") + " trouvé" + (resultats.length > 1 ? "s" : "");
}

// La colonne de droite : la liste courte des favoris (prénom + ville).
function afficherCarnet() {
  const zone = document.getElementById("carnet-liste");
  if (!zone) return;
  const favoris = lireFavoris();
  const liste = PROFILS.filter(p => favoris.includes(p.id));
  zone.innerHTML = liste.length
    ? liste.map(p => `<li>${p.prenom} <span>· ${p.ville}</span></li>`).join("")
    : `<p class="vide">Aucun portrait retenu pour l'instant.</p>`;
}

// ---------- Page 2 : les favoris ----------

function afficherFavoris() {
  const favoris = lireFavoris();
  const liste = PROFILS.filter(p => favoris.includes(p.id));
  afficher(liste, "liste-favoris",
    "Vous n'avez encore retenu personne. Cliquez sur « Retenir » sous un portrait.");
}

// ---------- Affichage commun aux deux pages ----------

function afficher(profils, idZone, messageVide) {
  const zone = document.getElementById(idZone);
  zone.innerHTML = profils.length
    ? profils.map(carte).join("")
    : `<p class="vide">${messageVide}</p>`;
}

// La date du jour en haut de la page, comme sur un journal.
const zoneDate = document.getElementById("date");
if (zoneDate) {
  zoneDate.textContent = new Date().toLocaleDateString("fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
afficherCarnet();

// Quand on clique sur « Retenir » : on ajoute/retire le favori puis on rafraîchit.
document.addEventListener("click", e => {
  const bouton = e.target.closest(".retenir");
  if (!bouton) return;
  const id = Number(bouton.dataset.id);
  basculerFavori(id);
  if (document.getElementById("liste-favoris")) {
    afficherFavoris();
  } else {
    const estFavori = lireFavoris().includes(id);
    bouton.textContent = estFavori ? "Retenue ✓" : "Retenir";
    bouton.classList.toggle("actif", estFavori);
    afficherCarnet();
  }
});
