/* SWAY · core */

/* Logique de SWAY : extraite de l'ancienne page unique. */

const Store=(()=>{const mem={};const hasW=typeof window.storage!=='undefined'&&window.storage;
let hasLS=false;try{localStorage.setItem('__t','1');localStorage.removeItem('__t');hasLS=true}catch(e){}
return{async get(k){if(hasW){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null}catch(e){return null}}
if(hasLS){const v=localStorage.getItem(k);return v?JSON.parse(v):null}return mem[k]??null},
async set(k,v){if(hasW){try{await window.storage.set(k,JSON.stringify(v));return}catch(e){}}
if(hasLS){try{localStorage.setItem(k,JSON.stringify(v));return}catch(e){}}mem[k]=v}}})();

const L={
fr:{code:'FR',nom:'Français',fl:'🇫🇷',
pvModifier:'Modifier les prix',pvTous:'Tous',pvAide:'Modifiez directement les prix de vente. Le ratio matière se recalcule à chaque frappe. Rien n\'est enregistré tant que vous ne validez pas.',pvCout:'Coût',pvAvant:'avant :',pvAppliquer:'Appliquer à tous les produits affichés (%n)',pvAucun:'Aucun produit ne correspond.',pvEnregistrer:'Enregistrer %n prix',pvRien:'Aucune modification',pvEnregistres:'%n prix mis à jour',

qCoupe:'Le bon touche deux bords de l\'image : une partie peut manquer.',qCoupeFort:'Document incomplet : reculez ou recentrez pour voir le bon en entier.',qReflet:'Un reflet éclaircit une partie du document.',qRefletFort:'Reflet important : une partie du texte est effacée. Changez l\'angle ou éloignez la source de lumière.',qVerdictVert:'Photo exploitable, la lecture peut être lancée.',qVerdictOrange:'Photo imparfaite mais exploitable : le prétraitement devrait suffire.',qVerdictRouge:'Photo probablement inexploitable pour la lecture automatique.',

trProduitInconnu:'« %p » n\'existe pas au catalogue : enregistrez-le d\'abord dans Produits.',trQteInvalide:'Quantité invalide.',trMotifInconnu:'Motif de mouvement inconnu.',trAnnulSansVente:'Impossible de valider : enregistre d’abord la vente ou la transaction d’origine pour ce produit.',trParentAbsent:'La transaction d\'origine est introuvable.',trParentInvalide:'Cette qualification ne peut porter que sur une vente ou un envoi.',trParentAutreProduit:'La transaction d\'origine concerne un autre produit.',trDejaAnnule:'Cette transaction est déjà entièrement qualifiée.',trAnnulTrop:'Qualification de %q demandée, mais il ne reste que %r à qualifier.',trStockInsuffisant:'Stock insuffisant : %l',trAppuyerEncore:'Appuyez à nouveau pour enregistrer malgré tout.',trLiee:'liée à une transaction',trStockAlerte:'stock insuffisant au moment du mouvement',annul:'Annulation',annulD:'Annule une vente existante',

qViseur:'Placez le bon de livraison dans le cadre',qC1:'Posez le bon à plat, sur une surface unie',qC2:'Tenez le téléphone bien au-dessus, pas de biais',qC3:'Évitez les ombres portées et les reflets',qTitre:'Qualité de la photo',qBonne:'Bonne qualité, la lecture devrait bien se passer.',qFlou:'Photo floue : le texte risque d\'être illisible. Refaites-la en stabilisant le téléphone.',qPeuNet:'Photo un peu molle : la lecture sera moins fiable.',qSombre:'Photo trop sombre : allumez la lumière ou approchez-vous d\'une fenêtre.',qSurexpose:'Photo surexposée : le texte clair risque de disparaître.',qPeuContraste:'Peu de contraste entre le texte et le papier.',qTropLoin:'Le bon occupe une trop petite partie de l\'image : rapprochez-vous.',qUnPeuLoin:'Rapprochez-vous un peu, le texte sera plus net.',qIncline:'Document incliné de %a° : redressez-le pour aligner les colonnes.',qPetite:'Image de faible définition : le texte fin sera difficile à lire.',qConseilRefaire:'Nous vous conseillons de reprendre cette photo avant de lancer la lecture.',

scAConfirmer:'À confirmer',scConfirmerAide:'Invo propose « %p » (correspondance %s %). Confirmez si c\'est bien ce produit.',scConfirmer:'Oui, c\'est ce produit',scTexteLu:'Texte lu :',scDoublonPage:'Ligne identique déjà présente sur une autre page — vérifiez qu\'il ne s\'agit pas d\'un doublon.',scConfirmerDabord:'%n ligne(s) attendent votre confirmation avant validation.',

ctrlTitre:'Contrôles de cohérence',ctrlOk:'Tous les contrôles sont bons : quantités, prix et totaux concordent.',ctrlMulti:'%n : quantité × prix donne %c € mais le bon indique %t €',ctrlQteVide:'%n : quantité absente ou illisible',ctrlQteEnorme:'%n : quantité de %q, inhabituellement élevée',ctrlQtePetite:'%n : quantité de %q, à confirmer',ctrlPxVide:'%n : prix unitaire absent',ctrlPxEnorme:'%n : prix de %p €, inhabituellement élevé',ctrlPxInhab:'%n : %p € alors que vous payez habituellement %h €',ctrlQteInhab:'%n : %q reçus alors que vous recevez habituellement %h',ctrlDoublonLigne:'%n apparaît deux fois à l\'identique dans ce bon',ctrlSomme:'La somme des lignes fait %s € mais le bon indique %h € HT (écart de %d €)',ctrlHtTva:'HT %h € + TVA %v € ne donne pas le TTC %t €',ctrlTaux:'Taux de TVA calculé à %x %, inhabituel',ctrlAucuneLigne:'Aucune ligne exploitable : renseignez au moins un produit avec sa quantité',ctrlBloque:'%n anomalie(s) grave(s) détectée(s). Corrigez-les, ou appuyez à nouveau pour valider malgré tout.',ctrlValiderQuandMeme:'Valider malgré les anomalies',

scCond:'Conditionnement',scDe:'de',scEnUnites:'unités',scConverti:'Converti en unités',scMethColonnes:'tableau analysé par colonnes',scMethMixte:'analyse mixte',scMethLignes:'analyse ligne par ligne',scImageOpt:'Image optimisée :',scRecadre:'recadrée',scRedresse:'redressée de %a°',

scOcrBloque:'Ce navigateur bloque le moteur de lecture. Ouvrez Invo dans Safari ou Chrome (plutôt que depuis un aperçu) pour utiliser la lecture automatique. En attendant, saisissez les lignes à la main.',scRelire:'Réessayer la lecture',

scAnalyse:'Lecture du document…',scPage:'Page',scPatience:'Le moteur de lecture se télécharge au premier usage. Les fois suivantes seront plus rapides.',scLu:'%n ligne(s) lue(s). Vérifiez avant de valider.',scPartiel:'%n ligne(s) lue(s), dont %i à vérifier (signalées en orange).',scRienLu:'Aucune ligne de produit n\'a pu être lue. Saisissez-les à la main en vous aidant de la photo.',scOcrHorsLigne:'Lecture automatique indisponible (connexion requise au premier usage). Saisissez les lignes à la main.',scOcrEchec:'La lecture du document a échoué. Saisissez les lignes à la main.',scMoteur:'Lu automatiquement',scFiab:'fiabilité',scFiabBasse:'Fiabilité faible : relisez chaque ligne attentivement.',scVerifChamp:'À vérifier',scLeProduit:'le produit',scUnite:'Unité :',

scScannerBon:'Scanner un bon',scTitre:'Scanner un bon de livraison',scCaptureS:'Photographiez le bon. Vous pourrez tout vérifier avant validation.',scPhoto:'Prendre une photo',scGalerie:'Choisir une image',scPages:'Pages',scAmeliorer:'Améliorer la lisibilité',scAmeliorerS:'Contraste renforcé pour les bons pâles',scAnalyser:'Analyser le bon',scAnalyse:'Analyse en cours…',scTraitement:'Traitement de l\'image…',scAucunePage:'Ajoutez au moins une photo du bon.',scVerifTitre:'Vérifier la livraison',scVerifS:'Contrôlez chaque ligne. Le stock ne sera modifié qu\'après validation.',scOcrIndispo:'La lecture automatique n\'est pas encore connectée. Le document est conservé — saisissez les lignes en vous aidant de la photo ci-dessus.',scVerifiez:'Informations détectées. Vérifiez-les avant de valider.',scFournisseur:'Fournisseur',scNumBl:'N° de bon',scDate:'Date',scProduits:'Produits',scLigne:'Ligne',scLignes:'lignes',scReconnu:'Reconnu',scNonReconnu:'À vérifier',scInconnuAide:'Ce produit n\'a pas été reconnu. Que faire ?',scAssocier:'Associer à un produit',scCreer:'Créer le produit',scIgnorer:'Ignorer',scQte:'Qté',scPu:'P.U. €',scRef:'Réf. fournisseur :',scAjouterLigne:'+ Ajouter une ligne',scAucuneLigne:'Aucune ligne pour l\'instant.',scLignesSaisies:'Lignes',scTotal:'Total',scBrouillon:'Brouillon',scValider:'Valider la livraison',scBrouillonOk:'Brouillon enregistré',scBrouillons:'Brouillons',scSansFournisseur:'Sans fournisseur',scValide:'Livraison validée, stock mis à jour',scRienAValider:'Renseignez au moins un produit avec une quantité.',scFoManquant:'Indiquez le fournisseur avant de valider.',scErrEnreg:'Une erreur est survenue. Vos données n\'ont pas été modifiées.',scDoublon:'Cette livraison semble déjà enregistrée.',scVoirExistante:'Voir la livraison existante',scContinuer:'Continuer quand même',scDocument:'Document',scDocPurge:'Le document n\'est plus conservé (limite d\'espace atteinte).',scScanne:'Scanné',scManuel:'Manuel',scProduitCree:'Produit créé',scNouveauProduit:'Nouveau produit',scProduitSupprime:'Produit supprimé',errType:'Ce fichier n\'est pas une image.',errTaille:'Image trop volumineuse (25 Mo maximum).',errLecture:'Impossible de lire le fichier.',errImage:'Impossible de lire le document.',errTraitement:'Le traitement de l\'image a échoué.',

ruptLoin:'Stock suffisant',perteDans:'À écouler sous %s j',perteDetail:'Environ %q %u seront perdus (%v €) — conservation %d j seulement.',prevPerte:'Risque de perte',prevPerteS:'Vous en avez plus que ce que vous consommerez avant la date limite.',anoPerte:'%s produit(s) frais en surstock — %v € menacés',conservation:'conservation',fDlc:'Durée de conservation (jours)',fDlcAide:'Combien de jours le produit se garde après réception. Laissez 0 pour les alcools et les produits secs.',

tabPrev:'Prévisions',prevVideT:'Pas encore assez de données',prevVideD:'Les prévisions apparaîtront dès que des ventes auront été enregistrées.',prevBase:'Calculé sur %s journée(s) d\'activité réellement observée(s).',prevPeuFiable:'Estimation basée sur une seule journée. La précision augmentera avec les jours.',prevUrgent:'À commander maintenant',prevSuivre:'À surveiller cette semaine',prevOk:'Stock confortable',ruptMaintenant:'Rupture imminente',ruptAujourdhui:'Rupture aujourd\'hui',ruptDemain:'Rupture demain',ruptDans:'Rupture dans %s j',ruptDeja:'En rupture',resteEn:'Reste %s %u',rythme:'consommation %s %u/jour',anoRupturePrevue:'%s : rupture prévue %q',anoRupturePrevueD:'%s autre(s) produit(s) concerné(s)',anoRythme:'Au rythme actuel de %s %u par jour.',

slogan:'INVO — Gardez le contrôle.',aConnexion:'Connexion',aConnexionS:'Retrouvez les données de votre établissement.',aMail:'Adresse e-mail',aPwd:'Mot de passe',aPwd2:'Confirmer le mot de passe',aSeConnecter:'Se connecter',aOubli:'Mot de passe oublié ?',aOu:'ou',aCreerCompte:'Créer un compte',aCreerS:'Un compte par établissement. Vos données restent séparées de celles des autres.',aNom:'Votre nom',aEtab:'Nom de l\'établissement',aCreer:'Créer mon compte',aDejaCompte:'J\'ai déjà un compte',aCodeTitre:'Votre code de secours',aCodeS:'Notez-le maintenant. Il permet de réinitialiser votre mot de passe si vous l\'oubliez.',aCodeNote:'Ce code ne sera plus affiché. Rangez-le en lieu sûr.',aEntrer:'J\'ai noté, entrer dans Invo',aOubliTitre:'Réinitialiser le mot de passe',aOubliS:'Saisissez le code de secours reçu à la création du compte.',aCode:'Code de secours',aNouveauPwd:'Nouveau mot de passe',aReinit:'Réinitialiser',aRetourConnexion:'Retour à la connexion',aReinitOk:'Mot de passe modifié. Vous pouvez vous connecter.',aChamps:'Merci de remplir tous les champs.',aMailInvalide:'Adresse e-mail invalide.',aPwdCourt:'Le mot de passe doit faire au moins 8 caractères.',aPwdDiff:'Les deux mots de passe ne correspondent pas.',aDejaPris:'Un compte existe déjà avec cette adresse.',aIntrouvable:'Aucun compte avec cette adresse.',aMauvaisPwd:'Mot de passe incorrect.',aCodeFaux:'Code de secours incorrect.',reglages:'Réglages',reglagesS:'Établissement et matériel connecté.',sauvegarde:'Sauvegarde locale',sauvegardeS:'Conservez une copie avant de changer d’appareil. Les données restent sur cet appareil : aucun envoi en ligne.',exportSauvegarde:'⬇ Télécharger la sauvegarde',importSauvegarde:'↥ Restaurer une sauvegarde',importAide:'La restauration remplace les données de cet appareil. Une copie des données actuelles sera téléchargée juste avant.',backupPreparing:'Préparation de la sauvegarde…',backupOk:'Sauvegarde téléchargée',backupFormat:'Ce fichier n’est pas une sauvegarde INVO valide.',backupTooBig:'Sauvegarde trop volumineuse (120 Mo maximum).',backupRead:'Impossible de lire cette sauvegarde.',backupConfirm:'Restaurer cette sauvegarde va remplacer toutes les données locales de cet appareil. Une copie des données actuelles sera téléchargée avant la restauration. Continuer ?',backupRestored:'Sauvegarde restaurée',pilot:'Test pilote',pilotS:'Préparez une base vide pour tester INVO avec les vraies données de votre établissement.',pilotOn:'Test réel en cours : aucune donnée de démonstration n’est chargée.',pilotStart:'Démarrer le test réel',pilotConfirm:'Démarrer le test réel va retirer de cet appareil les produits, stocks et historiques de démonstration. Une sauvegarde sera téléchargée avant. Continuer ?',pilotReady:'Base pilote prête : ajoutez vos premiers produits réels.',pilotDemoS:'Préparez des données fictives : commande, livraison et ventes simulées depuis une caisse.',pilotDemoLoad:'Préparer la démo caisse',pilotDemoConfirm:'Préparer la démo caisse va remplacer les données locales actuelles. Une sauvegarde sera téléchargée avant. Continuer ?',pilotDemoReady:'Démo caisse prête. Vous pouvez contrôler la réception et les ventes simulées.',etablissement:'Établissement',nomEtab:'Nom',donneesIsolees:'Données séparées',donneesIsoleesS:'Les données de cet établissement ne sont pas visibles par les autres comptes.',compte:'Compte',seDeconnecter:'Se déconnecter',confDeco:'Se déconnecter d\'Invo ?',avertLocal:'Ouvert en fichier local : le chiffrement du mot de passe est limité. Pour un usage réel, hébergez l\'application en HTTPS.',materiel:'Matériel connecté',materielS:'Entièrement facultatif. Invo fonctionne normalement sans aucun matériel.',doseurs:'Doseurs électroniques',doseursS:'Bouteilles en stock',nonConfig:'Non configuré',activeManuel:'Saisie manuelle',sansDoseurs:'Je n\'en utilise pas',avecDoseurs:'J\'en utilise',futs:'Fûts connectés',futsS:'Bière pression',balances:'Balances connectées',balancesS:'Pesée en cuisine',aVenir:'À venir',fermer:'Fermer',doseursDemo:'Aucun doseur n\'est relié pour l\'instant. Saisissez un relevé à la main pour voir le calcul d\'écart. La connexion automatique nécessitera l\'API du fabricant.',theo:'Théorique',releve:'Relevé',ecart:'Écart',vsTheorique:'par rapport au théorique',theorique:'Théorique :',reel:'Réel :',attention:'Ce qui mérite votre attention',rasT:'Rien d\'anormal détecté',rasD:'Les ratios, les stocks et les écarts sont dans les clous.',anoRatio:'Ratio matière à %s % — au-dessus de la cible',anoRatioD:'Dont %s € de sorties non vendues.',anoRupture:'%s produit(s) en rupture',anoSeuil:'%s produit(s) sous le seuil',anoDerive:'%s produit(s) en écart répété à l\'inventaire',anoPrix:'%s prix d\'achat en hausse',anoMarge:'%s produit(s) sous la marge cible',anoOfferts:'%s € d\'offerts sur la période',anoOffertsD:'Soit %s % du chiffre d\'affaires.',

accesTout:'Accès complet',accesEquipe:'Déclarer, livraisons, inventaire',
nLiv:'Livraisons',
livT:'Entrées de stock',livS:'Enregistrez ce que vous recevez : le stock remonte, les prix se mettent à jour.',
tabRecep:'Réception',tabCmd:'À commander',
newLiv:'+ Nouvelle livraison',fourn:'Fournisseur',dateL:'Date',
addLine:'+ Ajouter une ligne',totalLiv:'Total de la livraison',validLiv:'Enregistrer la livraison',
histLiv:'Livraisons récentes',noLiv:'Aucune livraison enregistrée pour l\'instant.',
qteRecue:'Qté reçue',prixU2:'Prix unitaire',livSaved:'Livraison enregistrée',
prixMaj:'Prix mis à jour',hausse:'Hausse',baisse:'Baisse',
cmdT:'Suggestion de commande',cmdS:'Produits passés sous leur seuil d\'alerte.',
aCommander:'À commander',copierListe:'📋 Copier la liste',listeCopiee:'Liste copiée',
noCmd:'Aucun produit sous le seuil. Tout va bien.',
zone:'Zone',zBar:'Bar',zCave:'Cave',zCuisine:'Cuisine',zReserve:'Réserve',zToutes:'Toutes',
tabCount:'Compter',tabHist:'Historique',
histT:'Inventaires précédents',noHist:'Aucun inventaire validé pour l\'instant.',
derive:'Dérive récurrente',deriveS:'En écart sur plusieurs inventaires — à surveiller.',
exportCsv:'⬇ Exporter (CSV)',imprimer:'🖨 Imprimer / PDF',
addPhoto:'📷 Ajouter une photo',photoOk:'Photo ajoutée',retirerPhoto:'Retirer la photo',
alertes:'Alertes',alertPrix:'Hausses de prix d\'achat',alertMarge:'Plats sous marge',
noAlerte:'Aucune alerte. Vos marges tiennent.',
valeurStock:'Valeur du stock',ecartValeur:'Valeur des écarts',
inventaireDu:'Inventaire du',lignesEcart:'lignes en écart',
nCaisse:'Ventes externes',nDec:'Déclarer',svc:'Service',nStock:'Produits',nInv:'Inventaire',nBil:'Bilan',
caisseT:'Flux des ventes externes',caisseS:'Enregistrez uniquement les sorties provenant de ventes déjà réalisées hors d’INVO. INVO n’encaisse aucun paiement.',
connected:'CONNECTÉ',connSub:'Dernière synchro il y a %s',
manualCaisse:'Suivi de stock : aucune donnée de paiement ou de caisse n’est créée automatiquement.',newVente:'+ Ajouter une vente externe',
aVerifier:'À vérifier',aVerifierS:'Ces sorties existent déjà. Classez uniquement celles qui deviennent un offert, une annulation ou une perte.',
verifVide:'Aucune vente externe à vérifier.',qualifier:'Classer une vente externe',qualifierS:'La sortie est déjà enregistrée. Le classement ne déduira pas le stock une seconde fois.',
resteQ:'Quantité à classer',confQual:'Valider le classement',qualSaved:'Classement enregistré',
demoCaisse:'Démonstration : ce flux simule un import de ventes externes. INVO ne traite aucun paiement.',
vente:'Vente externe',venteD:'Sortie de stock liée à une vente réalisée hors d’INVO',offClient:'Offert client',offPart:'Offert partenaire',offGroupe:'Offert groupe',
annul:'Annulation',perso:'Repas personnel',casse:'Casse',rate:'Raté / refait',degus:'Dégustation',entame:'Bouteille entamée',
offClientD:'Geste commercial en salle',offPartD:'Confrère, fournisseur, resto voisin',
offGroupeD:'Groupe, événement, privatisation',persoD:'Équipe salle ou cuisine',
casseD:'Tombé, cassé, renversé',rateD:'Brûlé, loupé, à refaire',
degusD:'Test carte, patron, fournisseur',entameD:'Ouverte, jamais soldée',
auto:'AUTO',manuel:'MANUEL',pause:'Mettre en pause',reprendre:'Reprendre le flux',
decT:'Déclarer une sortie',decS:'Tout ce qui quitte le stock sans provenir d’une vente externe.',
demoDec:'Touchez un produit pour l\'ajouter. Ajustez les quantités, choisissez le motif, validez d\'un coup.',
midi:'Midi',soir:'Soir',svcHint:'Le service filtre la carte : les plats le midi, les tapas et cocktails le soir.',
etape1:'1 — Produits',etape2:'2 — Motif',panier:'Panier',vider:'Vider',
coutMat:'Coût matière total',send:'Valider la sortie',articles:'article',articlesP:'articles',choisirMotif:'Choisir le motif',
stockT:'Produits & matières',stockS:'Ajoutez, modifiez ou retirez ce que vous voulez suivre.',
tabMat:'Matières',tabCarte:'Carte',search:'Chercher…',
addMat:'Ajouter une matière',editMat:'Modifier la matière',
addCarte:'Ajouter à la carte',editCarte:'Modifier le produit',
fNom:'Nom',fIcone:'Icône',fUnite:'Unité de suivi',fAchat:'Mode d\'achat',
achCont:'Au contenant',achDirect:'Au détail',fContenance:'Contenance',fPrixCont:'Prix d\'achat',
fPrixU:'Prix unitaire',fStock:'Stock actuel',fSeuil:'Seuil d\'alerte',
fCat:'Catégorie',fService:'Service',fType:'Type',fPV:'Prix de vente',
tFood:'Nourriture',tDrink:'Boisson',svTous:'Midi et soir',
fiche:'Fiche technique',ficheS:'Ce que le produit consomme réellement en stock.',
addIng:'+ Ajouter un ingrédient',noIng:'Aucun ingrédient — le coût matière sera nul.',
coutRev:'Coût de revient',marge:'Marge',ratioP:'Ratio',
save2:'Enregistrer',del:'Supprimer',cancel:'Annuler',
confDel:'Supprimer définitivement ?',usedIn:'Utilisé dans %s recette(s) — il en sera retiré.',
matSaved:'Matière enregistrée',matDel:'Matière supprimée',
carteSaved:'Produit enregistré',carteDel:'Produit supprimé',
invT:'Inventaire du mois',invS:'Comptez, comparez, validez. Seuls les écarts demandent du travail.',
attendu:'ATTENDU',compte:'COMPTÉ',prod:'PRODUIT',valid:'Valider l\'inventaire',clear:'Tout effacer',
lignes:'Lignes comptées',conf:'Lignes conformes',ecarts:'Écarts détectés',
bilT:'Bilan du mois',bilS:'D\'où viennent vos sorties de stock, et ce qu\'elles coûtent.',
origine:'Origine des sorties non-vendues',srcAuto:'Importé depuis un système externe',srcAutoD:'Offerts, annulations, repas perso — sans ressaisie dans INVO',
srcMain:'Déclaré par l\'équipe',srcMainD:'Casse, ratés, dégustations, bouteilles entamées',
kNonVendu:'Coût des sorties non-vendues',kCA:'CA encaissé',kRatio:'Ratio matière',kEcart:'Écarts inventaire',
repart:'Répartition par motif',jrnl:'Derniers mouvements',vide:'Rien pour l\'instant',videD:'Les mouvements apparaîtront ici.',
who:'Qui utilise l\'app ?',whoS:'Choisissez votre poste dans l\'établissement.',
lang:'Langue',langS:'L\'app parle la langue de chaque membre de l\'équipe.',
saved:'Sortie enregistrée',invOk:'Inventaire validé',cleared:'Démo réinitialisée',reset:'Reset',resetS:'Restaure les produits de démonstration et retire les données locales actuelles. Une sauvegarde est téléchargée avant.',resetConfirm:'Réinitialiser la démo va remplacer les données locales actuelles. Une sauvegarde sera téléchargée avant. Continuer ?',
cTapas:'Tapas',cPlats:'Plats',cCock:'Cocktails',cVins:'Vins',cBieres:'Bières',cSofts:'Softs',cAlc:'Alcools',cDess:'Desserts',cCafe:'Café'},

en:{code:'EN',nom:'English',fl:'🇬🇧',
pvModifier:'Edit prices',pvTous:'All',pvAide:'Edit selling prices directly. The food cost ratio updates as you type. Nothing is saved until you confirm.',pvCout:'Cost',pvAvant:'was:',pvAppliquer:'Apply to all displayed products (%n)',pvAucun:'No matching product.',pvEnregistrer:'Save %n prices',pvRien:'No change',pvEnregistres:'%n prices updated',

qCoupe:'The note touches two edges of the frame: part of it may be missing.',qCoupeFort:'Incomplete document: step back or recentre to fit the whole note.',qReflet:'A reflection is brightening part of the document.',qRefletFort:'Strong reflection: part of the text is washed out. Change angle or move the light source.',qVerdictVert:'Usable photo, reading can start.',qVerdictOrange:'Imperfect but usable: preprocessing should be enough.',qVerdictRouge:'Photo likely unusable for automatic reading.',

trProduitInconnu:'“%p” is not in the catalogue: add it in Products first.',trQteInvalide:'Invalid quantity.',trMotifInconnu:'Unknown movement reason.',trAnnulSansVente:'No matching transaction to classify for this product.',trParentAbsent:'The original transaction cannot be found.',trParentInvalide:'This classification can only apply to a sale or a send-out.',trParentAutreProduit:'The original transaction is for a different product.',trDejaAnnule:'This transaction is already fully classified.',trAnnulTrop:'Classification of %q requested, but only %r remains to classify.',trStockInsuffisant:'Not enough stock: %l',trAppuyerEncore:'Tap again to record anyway.',trLiee:'linked to a transaction',trStockAlerte:'stock was insufficient at the time',annul:'Cancellation',annulD:'Cancels an existing sale',

qViseur:'Place the delivery note inside the frame',qC1:'Lay the note flat on a plain surface',qC2:'Hold the phone straight above, not at an angle',qC3:'Avoid shadows and reflections',qTitre:'Photo quality',qBonne:'Good quality, reading should go well.',qFlou:'Blurry photo: text may be unreadable. Retake it holding the phone steady.',qPeuNet:'Slightly soft photo: reading will be less reliable.',qSombre:'Photo too dark: turn on a light or move near a window.',qSurexpose:'Overexposed photo: light text may disappear.',qPeuContraste:'Little contrast between text and paper.',qTropLoin:'The note fills too little of the frame: move closer.',qUnPeuLoin:'Move a little closer for sharper text.',qIncline:'Document tilted by %a°: straighten it to align the columns.',qPetite:'Low resolution image: small text will be hard to read.',qConseilRefaire:'We recommend retaking this photo before running the reading.',

scAConfirmer:'To confirm',scConfirmerAide:'Invo suggests “%p” (%s % match). Confirm if this is the right product.',scConfirmer:'Yes, that\'s the product',scTexteLu:'Text read:',scDoublonPage:'Identical line already on another page — check it is not a duplicate.',scConfirmerDabord:'%n line(s) awaiting your confirmation before saving.',

ctrlTitre:'Consistency checks',ctrlOk:'All checks passed: quantities, prices and totals match.',ctrlMulti:'%n: quantity × price gives %c € but the note says %t €',ctrlQteVide:'%n: quantity missing or unreadable',ctrlQteEnorme:'%n: quantity of %q, unusually high',ctrlQtePetite:'%n: quantity of %q, please confirm',ctrlPxVide:'%n: unit price missing',ctrlPxEnorme:'%n: price of %p €, unusually high',ctrlPxInhab:'%n: %p € while you usually pay %h €',ctrlQteInhab:'%n: %q received while you usually receive %h',ctrlDoublonLigne:'%n appears twice identically on this note',ctrlSomme:'Lines add up to %s € but the note says %h € net (gap of %d €)',ctrlHtTva:'Net %h € + VAT %v € does not give the gross %t €',ctrlTaux:'VAT rate computed at %x %, unusual',ctrlAucuneLigne:'No usable line: enter at least one product with its quantity',ctrlBloque:'%n serious issue(s) found. Fix them, or tap again to save anyway.',ctrlValiderQuandMeme:'Save despite the issues',

scCond:'Packaging',scDe:'of',scEnUnites:'units',scConverti:'Converted to units',scMethColonnes:'table read by columns',scMethMixte:'mixed analysis',scMethLignes:'line-by-line analysis',scImageOpt:'Image optimised:',scRecadre:'cropped',scRedresse:'straightened by %a°',

scOcrBloque:'This browser blocks the reading engine. Open Invo in Safari or Chrome (rather than from a preview) to use automatic reading. Meanwhile, enter the lines manually.',scRelire:'Try reading again',

scAnalyse:'Reading document…',scPage:'Page',scPatience:'The reading engine downloads on first use. Next times will be faster.',scLu:'%n line(s) read. Please check before confirming.',scPartiel:'%n line(s) read, %i to check (highlighted in orange).',scRienLu:'No product line could be read. Enter them manually using the photo.',scOcrHorsLigne:'Automatic reading unavailable (connection needed on first use). Enter lines manually.',scOcrEchec:'Reading the document failed. Enter lines manually.',scMoteur:'Read automatically',scFiab:'confidence',scFiabBasse:'Low confidence: check every line carefully.',scVerifChamp:'To check',scLeProduit:'the product',scUnite:'Unit:',

scScannerBon:'Scan a note',scTitre:'Scan a delivery note',scCaptureS:'Photograph the note. You will check everything before saving.',scPhoto:'Take a photo',scGalerie:'Choose an image',scPages:'Pages',scAmeliorer:'Improve readability',scAmeliorerS:'Stronger contrast for faint notes',scAnalyser:'Analyse note',scAnalyse:'Analysing…',scTraitement:'Processing image…',scAucunePage:'Add at least one photo of the note.',scVerifTitre:'Check the delivery',scVerifS:'Review each line. Stock changes only after you confirm.',scOcrIndispo:'Automatic reading is not connected yet. The document is kept — enter the lines using the photo above.',scVerifiez:'Information detected. Please check before confirming.',scFournisseur:'Supplier',scNumBl:'Note no.',scDate:'Date',scProduits:'Products',scLigne:'Line',scLignes:'lines',scReconnu:'Matched',scNonReconnu:'Check',scInconnuAide:'This product was not recognised. What now?',scAssocier:'Match to a product',scCreer:'Create product',scIgnorer:'Skip',scQte:'Qty',scPu:'Unit €',scRef:'Supplier ref:',scAjouterLigne:'+ Add a line',scAucuneLigne:'No lines yet.',scLignesSaisies:'Lines',scTotal:'Total',scBrouillon:'Draft',scValider:'Confirm delivery',scBrouillonOk:'Draft saved',scBrouillons:'Drafts',scSansFournisseur:'No supplier',scValide:'Delivery confirmed, stock updated',scRienAValider:'Add at least one product with a quantity.',scFoManquant:'Enter the supplier before confirming.',scErrEnreg:'Something went wrong. Your data was not changed.',scDoublon:'This delivery looks already recorded.',scVoirExistante:'View existing delivery',scContinuer:'Continue anyway',scDocument:'Document',scDocPurge:'The document is no longer stored (storage limit reached).',scScanne:'Scanned',scManuel:'Manual',scProduitCree:'Product created',scNouveauProduit:'New product',scProduitSupprime:'Deleted product',errType:'This file is not an image.',errTaille:'Image too large (25 MB maximum).',errLecture:'Could not read the file.',errImage:'Could not read the document.',errTraitement:'Image processing failed.',

ruptLoin:'Enough stock',perteDans:'Use within %s d',perteDetail:'About %q %u will be wasted (%v €) — only %d days of shelf life.',prevPerte:'Waste risk',prevPerteS:'You have more than you will use before the use-by date.',anoPerte:'%s fresh product(s) overstocked — %v € at risk',conservation:'shelf life',fDlc:'Shelf life (days)',fDlcAide:'How many days the product keeps after delivery. Leave 0 for spirits and dry goods.',

tabPrev:'Forecast',prevVideT:'Not enough data yet',prevVideD:'Forecasts will appear once sales have been recorded.',prevBase:'Based on %s day(s) of observed activity.',prevPeuFiable:'Estimate based on a single day. Accuracy improves over time.',prevUrgent:'Order now',prevSuivre:'Watch this week',prevOk:'Comfortable stock',ruptMaintenant:'Running out now',ruptAujourdhui:'Out today',ruptDemain:'Out tomorrow',ruptDans:'Out in %s d',ruptDeja:'Out of stock',resteEn:'%s %u left',rythme:'using %s %u/day',anoRupturePrevue:'%s: forecast to run out %q',anoRupturePrevueD:'%s other product(s) affected',anoRythme:'At the current rate of %s %u per day.',

slogan:'INVO — Stay in control.',aConnexion:'Sign in',aConnexionS:'Access your venue\'s data.',aMail:'Email address',aPwd:'Password',aPwd2:'Confirm password',aSeConnecter:'Sign in',aOubli:'Forgot your password?',aOu:'or',aCreerCompte:'Create an account',aCreerS:'One account per venue. Your data stays separate from other venues.',aNom:'Your name',aEtab:'Venue name',aCreer:'Create my account',aDejaCompte:'I already have an account',aCodeTitre:'Your recovery code',aCodeS:'Write it down now. It lets you reset your password if you forget it.',aCodeNote:'This code will not be shown again. Keep it somewhere safe.',aEntrer:'Saved it, enter Invo',aOubliTitre:'Reset password',aOubliS:'Enter the recovery code you received when creating the account.',aCode:'Recovery code',aNouveauPwd:'New password',aReinit:'Reset',aRetourConnexion:'Back to sign in',aReinitOk:'Password changed. You can sign in.',aChamps:'Please fill in all fields.',aMailInvalide:'Invalid email address.',aPwdCourt:'Password must be at least 8 characters.',aPwdDiff:'The two passwords do not match.',aDejaPris:'An account already exists with this address.',aIntrouvable:'No account with this address.',aMauvaisPwd:'Incorrect password.',aCodeFaux:'Incorrect recovery code.',reglages:'Settings',reglagesS:'Venue and connected hardware.',etablissement:'Venue',nomEtab:'Name',donneesIsolees:'Separate data',donneesIsoleesS:'This venue\'s data is not visible to other accounts.',compte:'Account',seDeconnecter:'Sign out',confDeco:'Sign out of Invo?',avertLocal:'Opened as a local file: password encryption is limited. For real use, host the app over HTTPS.',materiel:'Connected hardware',materielS:'Entirely optional. Invo works normally without any hardware.',doseurs:'Electronic pourers',doseursS:'Bottles in stock',nonConfig:'Not configured',activeManuel:'Manual entry',sansDoseurs:'I don\'t use any',avecDoseurs:'I use them',futs:'Connected kegs',futsS:'Draught beer',balances:'Connected scales',balancesS:'Kitchen weighing',aVenir:'Coming soon',fermer:'Close',doseursDemo:'No pourer is connected yet. Enter a reading manually to see the variance calculation. Automatic sync will require the manufacturer\'s API.',theo:'Expected',releve:'Reading',ecart:'Variance',vsTheorique:'versus expected',theorique:'Expected:',reel:'Actual:',attention:'What needs your attention',rasT:'Nothing unusual detected',rasD:'Ratios, stock levels and variances are all within range.',anoRatio:'Food cost ratio at %s % — above target',anoRatioD:'Including %s € of unsold movements.',anoRupture:'%s product(s) out of stock',anoSeuil:'%s product(s) below par',anoDerive:'%s product(s) with repeated count variance',anoPrix:'%s purchase price(s) up',anoMarge:'%s product(s) below target margin',anoOfferts:'%s € comped over the period',anoOffertsD:'That\'s %s % of revenue.',

accesTout:'Full access',accesEquipe:'Declare, deliveries, count',
nLiv:'Deliveries',
livT:'Stock in',livS:'Log what you receive: stock goes up, prices update.',
tabRecep:'Receiving',tabCmd:'To order',
newLiv:'+ New delivery',fourn:'Supplier',dateL:'Date',
addLine:'+ Add a line',totalLiv:'Delivery total',validLiv:'Save delivery',
histLiv:'Recent deliveries',noLiv:'No delivery logged yet.',
qteRecue:'Qty received',prixU2:'Unit price',livSaved:'Delivery saved',
prixMaj:'Price updated',hausse:'Up',baisse:'Down',
cmdT:'Suggested order',cmdS:'Products that dropped below par level.',
aCommander:'To order',copierListe:'📋 Copy the list',listeCopiee:'List copied',
noCmd:'Nothing below par. All good.',
zone:'Zone',zBar:'Bar',zCave:'Cellar',zCuisine:'Kitchen',zReserve:'Store room',zToutes:'All',
tabCount:'Count',tabHist:'History',
histT:'Previous counts',noHist:'No count confirmed yet.',
derive:'Recurring drift',deriveS:'Off on several counts — worth watching.',
exportCsv:'⬇ Export (CSV)',imprimer:'🖨 Print / PDF',
addPhoto:'📷 Add a photo',photoOk:'Photo added',retirerPhoto:'Remove photo',
alertes:'Alerts',alertPrix:'Purchase price rises',alertMarge:'Items below margin',
noAlerte:'No alert. Your margins hold.',
valeurStock:'Stock value',ecartValeur:'Value of gaps',
inventaireDu:'Count of',lignesEcart:'lines off',
nCaisse:'External sales',nDec:'Declare',svc:'Service',nStock:'Products',nInv:'Count',nBil:'Report',
caisseT:'External sales feed',caisseS:'Record only stock movements from sales already completed outside INVO. INVO does not take payments.',
connected:'CONNECTED',connSub:'Last sync %s ago',
demoCaisse:'Demo: this feed simulates an external sales import. INVO does not process payments.',
vente:'Sale',offClient:'Comp — guest',offPart:'Comp — partner',offGroupe:'Comp — group',
annul:'Void',perso:'Staff meal',casse:'Breakage',rate:'Botched / redone',degus:'Tasting',entame:'Opened bottle',
offClientD:'Goodwill gesture on the floor',offPartD:'Peer, supplier, nearby venue',
offGroupeD:'Group, event, private hire',persoD:'Floor or kitchen team',
casseD:'Dropped, broken, spilled',rateD:'Burnt, missed, remade',
degusD:'Menu test, owner, supplier',entameD:'Opened, never rung up',
auto:'AUTO',manuel:'MANUAL',pause:'Pause feed',reprendre:'Resume feed',
decT:'Declare a movement',decS:'Everything that leaves stock without going through the POS.',
demoDec:'Tap a product to add it. Adjust quantities, pick the reason, submit it all at once.',
midi:'Lunch',soir:'Dinner',svcHint:'Service filters the menu: mains at lunch, tapas and cocktails at dinner.',
etape1:'1 — Products',etape2:'2 — Reason',panier:'Basket',vider:'Clear',
coutMat:'Total food cost',send:'Submit',articles:'item',articlesP:'items',choisirMotif:'Pick a reason',
stockT:'Products & ingredients',stockS:'Add, edit or remove whatever you want to track.',
tabMat:'Ingredients',tabCarte:'Menu',search:'Search…',
addMat:'Add an ingredient',editMat:'Edit ingredient',
addCarte:'Add to menu',editCarte:'Edit menu item',
fNom:'Name',fIcone:'Icon',fUnite:'Tracking unit',fAchat:'Purchase mode',
achCont:'By container',achDirect:'By unit',fContenance:'Container size',fPrixCont:'Purchase price',
fPrixU:'Unit price',fStock:'Current stock',fSeuil:'Par level',
fCat:'Category',fService:'Service',fType:'Type',fPV:'Selling price',
tFood:'Food',tDrink:'Drink',svTous:'Lunch and dinner',
fiche:'Recipe',ficheS:'What this item actually pulls from stock.',
addIng:'+ Add an ingredient',noIng:'No ingredient — food cost will be zero.',
coutRev:'Food cost',marge:'Margin',ratioP:'Ratio',
save2:'Save',del:'Delete',cancel:'Cancel',
confDel:'Delete permanently?',usedIn:'Used in %s recipe(s) — it will be removed from them.',
matSaved:'Ingredient saved',matDel:'Ingredient deleted',
carteSaved:'Item saved',carteDel:'Item deleted',
invT:'Monthly count',invS:'Count, compare, confirm. Only gaps need real work.',
attendu:'EXPECTED',compte:'COUNTED',prod:'PRODUCT',valid:'Confirm count',clear:'Clear all',
lignes:'Lines counted',conf:'Lines matching',ecarts:'Gaps found',
bilT:'Monthly report',bilS:'Where your stock movements come from, and what they cost.',
origine:'Source of unsold movements',srcAuto:'Captured by the POS',srcAutoD:'Comps, voids, staff meals — zero typing',
srcMain:'Declared by the team',srcMainD:'Breakage, waste, tastings, opened bottles',
kNonVendu:'Cost of unsold movements',kCA:'Revenue taken',kRatio:'Food cost ratio',kEcart:'Count gaps',
repart:'By reason',jrnl:'Latest movements',vide:'Nothing yet',videD:'Movements will show up here.',
who:'Who is using the app?',whoS:'Pick your role in the restaurant.',
lang:'Language',langS:'The app speaks each team member\'s language.',
saved:'Saved',invOk:'Count confirmed',cleared:'Demo reset',reset:'Reset the demo',
cTapas:'Tapas',cPlats:'Mains',cCock:'Cocktails',cVins:'Wine',cBieres:'Beer',cSofts:'Softs',cAlc:'Spirits',cDess:'Desserts',cCafe:'Coffee'},

es:{code:'ES',nom:'Español',fl:'🇪🇸',
scScannerBon:'Escanear albarán',scPhoto:'Hacer una foto',scGalerie:'Elegir imagen',scReconnu:'Reconocido',scNonReconnu:'Revisar',scValider:'Validar la entrega',scQte:'Cant.',scTotal:'Total',scFournisseur:'Proveedor',scDate:'Fecha',scProduits:'Productos',

accesTout:'Acceso completo',accesEquipe:'Declarar, entregas, inventario',
nLiv:'Entregas',
livT:'Entradas de stock',livS:'Registra lo que recibes: el stock sube, los precios se actualizan.',
tabRecep:'Recepción',tabCmd:'Por pedir',
newLiv:'+ Nueva entrega',fourn:'Proveedor',dateL:'Fecha',
addLine:'+ Añadir una línea',totalLiv:'Total de la entrega',validLiv:'Guardar la entrega',
histLiv:'Entregas recientes',noLiv:'Ninguna entrega registrada.',
qteRecue:'Cant. recibida',prixU2:'Precio unitario',livSaved:'Entrega guardada',
prixMaj:'Precio actualizado',hausse:'Subida',baisse:'Bajada',
cmdT:'Sugerencia de pedido',cmdS:'Productos por debajo del mínimo.',
aCommander:'Por pedir',copierListe:'📋 Copiar la lista',listeCopiee:'Lista copiada',
noCmd:'Nada por debajo del mínimo. Todo bien.',
zone:'Zona',zBar:'Barra',zCave:'Bodega',zCuisine:'Cocina',zReserve:'Almacén',zToutes:'Todas',
tabCount:'Contar',tabHist:'Historial',
histT:'Inventarios anteriores',noHist:'Ningún inventario validado.',
derive:'Desviación recurrente',deriveS:'Con diferencias en varios inventarios.',
exportCsv:'⬇ Exportar (CSV)',imprimer:'🖨 Imprimir / PDF',
addPhoto:'📷 Añadir una foto',photoOk:'Foto añadida',retirerPhoto:'Quitar la foto',
alertes:'Alertas',alertPrix:'Subidas de precio',alertMarge:'Platos bajo margen',
noAlerte:'Sin alertas. Tus márgenes aguantan.',
valeurStock:'Valor del stock',ecartValeur:'Valor de las diferencias',
inventaireDu:'Inventario del',lignesEcart:'líneas con diferencia',
nCaisse:'Ventas externas',nDec:'Declarar',svc:'Servicio',nStock:'Productos',nInv:'Inventario',nBil:'Informe',
caisseT:'Flujo de ventas externas',caisseS:'Registre únicamente las salidas de ventas ya realizadas fuera de INVO. INVO no cobra pagos.',
connected:'CONECTADO',connSub:'Última sincronía hace %s',
demoCaisse:'Demo: este flujo simula una importación de ventas externas. INVO no procesa pagos.',
vente:'Venta',offClient:'Invitación cliente',offPart:'Invitación socio',offGroupe:'Invitación grupo',
annul:'Anulación',perso:'Comida personal',casse:'Rotura',rate:'Fallado / rehecho',degus:'Degustación',entame:'Botella abierta',
offClientD:'Gesto comercial en sala',offPartD:'Colega, proveedor, local vecino',
offGroupeD:'Grupo, evento, privatización',persoD:'Equipo de sala o cocina',
casseD:'Caído, roto, derramado',rateD:'Quemado, fallado, rehecho',
degusD:'Prueba de carta, jefe, proveedor',entameD:'Abierta, nunca cobrada',
auto:'AUTO',manuel:'MANUAL',pause:'Pausar flujo',reprendre:'Reanudar flujo',
decT:'Declarar una salida',decS:'Todo lo que sale del stock sin pasar por la caja.',
demoDec:'Toca un producto para añadirlo. Ajusta las cantidades, elige el motivo y valida todo de una vez.',
midi:'Mediodía',soir:'Noche',svcHint:'El servicio filtra la carta: platos al mediodía, tapas y cócteles por la noche.',
etape1:'1 — Productos',etape2:'2 — Motivo',panier:'Cesta',vider:'Vaciar',
coutMat:'Coste materia total',send:'Validar',articles:'artículo',articlesP:'artículos',choisirMotif:'Elegir el motivo',
stockT:'Productos y materias',stockS:'Añade, modifica o quita lo que quieras seguir.',
tabMat:'Materias',tabCarte:'Carta',search:'Buscar…',
addMat:'Añadir una materia',editMat:'Modificar la materia',
addCarte:'Añadir a la carta',editCarte:'Modificar el producto',
fNom:'Nombre',fIcone:'Icono',fUnite:'Unidad de control',fAchat:'Modo de compra',
achCont:'Por envase',achDirect:'Por unidad',fContenance:'Capacidad',fPrixCont:'Precio de compra',
fPrixU:'Precio unitario',fStock:'Stock actual',fSeuil:'Nivel mínimo',
fCat:'Categoría',fService:'Servicio',fType:'Tipo',fPV:'Precio de venta',
tFood:'Comida',tDrink:'Bebida',svTous:'Mediodía y noche',
fiche:'Escandallo',ficheS:'Lo que el producto consume realmente del stock.',
addIng:'+ Añadir un ingrediente',noIng:'Sin ingredientes — el coste será cero.',
coutRev:'Coste materia',marge:'Margen',ratioP:'Ratio',
save2:'Guardar',del:'Eliminar',cancel:'Cancelar',
confDel:'¿Eliminar definitivamente?',usedIn:'Usado en %s receta(s) — será retirado de ellas.',
matSaved:'Materia guardada',matDel:'Materia eliminada',
carteSaved:'Producto guardado',carteDel:'Producto eliminado',
invT:'Inventario del mes',invS:'Cuenta, compara, valida. Solo las diferencias dan trabajo.',
attendu:'PREVISTO',compte:'CONTADO',prod:'PRODUCTO',valid:'Validar inventario',clear:'Borrar todo',
lignes:'Líneas contadas',conf:'Líneas correctas',ecarts:'Diferencias',
bilT:'Informe del mes',bilS:'De dónde vienen las salidas y lo que cuestan.',
origine:'Origen de las salidas no vendidas',srcAuto:'Captado por la caja',srcAutoD:'Invitaciones, anulaciones, personal — sin teclear',
srcMain:'Declarado por el equipo',srcMainD:'Roturas, fallos, degustaciones, botellas abiertas',
kNonVendu:'Coste de salidas no vendidas',kCA:'Ingresos',kRatio:'Ratio materia',kEcart:'Diferencias inventario',
repart:'Por motivo',jrnl:'Últimos movimientos',vide:'Nada por ahora',videD:'Los movimientos aparecerán aquí.',
who:'¿Quién usa la app?',whoS:'Elige tu puesto en el establecimiento.',
lang:'Idioma',langS:'La app habla el idioma de cada miembro del equipo.',
saved:'Guardado',invOk:'Inventario validado',cleared:'Demo reiniciada',reset:'Reiniciar la demo',
cTapas:'Tapas',cPlats:'Platos',cCock:'Cócteles',cVins:'Vinos',cBieres:'Cervezas',cSofts:'Refrescos',cAlc:'Licores',cDess:'Postres',cCafe:'Café'},

pt:{code:'PT',nom:'Português',fl:'🇵🇹',
scScannerBon:'Digitalizar guia',scPhoto:'Tirar uma foto',scGalerie:'Escolher imagem',scReconnu:'Reconhecido',scNonReconnu:'Verificar',scValider:'Validar a entrega',scQte:'Qtd.',scTotal:'Total',scFournisseur:'Fornecedor',scDate:'Data',scProduits:'Produtos',

accesTout:'Acesso total',accesEquipe:'Declarar, entregas, inventário',
nLiv:'Entregas',
livT:'Entradas de stock',livS:'Registe o que recebe: o stock sobe, os preços atualizam-se.',
tabRecep:'Receção',tabCmd:'A encomendar',
newLiv:'+ Nova entrega',fourn:'Fornecedor',dateL:'Data',
addLine:'+ Adicionar uma linha',totalLiv:'Total da entrega',validLiv:'Guardar a entrega',
histLiv:'Entregas recentes',noLiv:'Nenhuma entrega registada.',
qteRecue:'Qtd. recebida',prixU2:'Preço unitário',livSaved:'Entrega guardada',
prixMaj:'Preço atualizado',hausse:'Subida',baisse:'Descida',
cmdT:'Sugestão de encomenda',cmdS:'Produtos abaixo do nível mínimo.',
aCommander:'A encomendar',copierListe:'📋 Copiar a lista',listeCopiee:'Lista copiada',
noCmd:'Nada abaixo do mínimo. Está tudo bem.',
zone:'Zona',zBar:'Bar',zCave:'Adega',zCuisine:'Cozinha',zReserve:'Armazém',zToutes:'Todas',
tabCount:'Contar',tabHist:'Histórico',
histT:'Inventários anteriores',noHist:'Nenhum inventário validado.',
derive:'Desvio recorrente',deriveS:'Com diferenças em vários inventários.',
exportCsv:'⬇ Exportar (CSV)',imprimer:'🖨 Imprimir / PDF',
addPhoto:'📷 Adicionar uma foto',photoOk:'Foto adicionada',retirerPhoto:'Retirar a foto',
alertes:'Alertas',alertPrix:'Subidas de preço',alertMarge:'Pratos abaixo da margem',
noAlerte:'Sem alertas. As margens aguentam.',
valeurStock:'Valor do stock',ecartValeur:'Valor das diferenças',
inventaireDu:'Inventário de',lignesEcart:'linhas com diferença',
nCaisse:'Vendas externas',nDec:'Declarar',svc:'Serviço',nStock:'Produtos',nInv:'Inventário',nBil:'Balanço',
caisseT:'Fluxo de vendas externas',caisseS:'Registe apenas saídas de vendas já concluídas fora do INVO. O INVO não recebe pagamentos.',
connected:'LIGADO',connSub:'Última sincronização há %s',
demoCaisse:'Demo: este fluxo simula uma importação de vendas externas. O INVO não processa pagamentos.',
vente:'Venda',offClient:'Oferta cliente',offPart:'Oferta parceiro',offGroupe:'Oferta grupo',
annul:'Anulação',perso:'Refeição pessoal',casse:'Quebra',rate:'Falhado / refeito',degus:'Prova',entame:'Garrafa aberta',
offClientD:'Gesto comercial na sala',offPartD:'Colega, fornecedor, casa vizinha',
offGroupeD:'Grupo, evento, privatização',persoD:'Equipa de sala ou cozinha',
casseD:'Caiu, partiu, entornou',rateD:'Queimado, falhado, refeito',
degusD:'Teste de carta, patrão, fornecedor',entameD:'Aberta, nunca cobrada',
auto:'AUTO',manuel:'MANUAL',pause:'Pausar fluxo',reprendre:'Retomar fluxo',
decT:'Declarar uma saída',decS:'Tudo o que sai do stock sem passar pela caixa.',
demoDec:'Toque num produto para adicionar. Ajuste as quantidades, escolha o motivo e valide de uma vez.',
midi:'Almoço',soir:'Jantar',svcHint:'O serviço filtra a carta: pratos ao almoço, tapas e cocktails ao jantar.',
etape1:'1 — Produtos',etape2:'2 — Motivo',panier:'Cesto',vider:'Esvaziar',
coutMat:'Custo matéria total',send:'Validar',articles:'artigo',articlesP:'artigos',choisirMotif:'Escolher o motivo',
stockT:'Produtos e matérias',stockS:'Adicione, altere ou retire o que quiser acompanhar.',
tabMat:'Matérias',tabCarte:'Carta',search:'Procurar…',
addMat:'Adicionar matéria',editMat:'Alterar matéria',
addCarte:'Adicionar à carta',editCarte:'Alterar produto',
fNom:'Nome',fIcone:'Ícone',fUnite:'Unidade de controlo',fAchat:'Modo de compra',
achCont:'Por embalagem',achDirect:'À unidade',fContenance:'Capacidade',fPrixCont:'Preço de compra',
fPrixU:'Preço unitário',fStock:'Stock atual',fSeuil:'Nível mínimo',
fCat:'Categoria',fService:'Serviço',fType:'Tipo',fPV:'Preço de venda',
tFood:'Comida',tDrink:'Bebida',svTous:'Almoço e jantar',
fiche:'Ficha técnica',ficheS:'O que o produto consome realmente do stock.',
addIng:'+ Adicionar ingrediente',noIng:'Sem ingredientes — o custo será zero.',
coutRev:'Custo matéria',marge:'Margem',ratioP:'Rácio',
save2:'Guardar',del:'Eliminar',cancel:'Cancelar',
confDel:'Eliminar definitivamente?',usedIn:'Usado em %s receita(s) — será retirado delas.',
matSaved:'Matéria guardada',matDel:'Matéria eliminada',
carteSaved:'Produto guardado',carteDel:'Produto eliminado',
invT:'Inventário do mês',invS:'Conte, compare, valide. Só as diferenças dão trabalho.',
attendu:'PREVISTO',compte:'CONTADO',prod:'PRODUTO',valid:'Validar inventário',clear:'Apagar tudo',
lignes:'Linhas contadas',conf:'Linhas certas',ecarts:'Diferenças',
bilT:'Balanço do mês',bilS:'De onde vêm as saídas e quanto custam.',
origine:'Origem das saídas não vendidas',srcAuto:'Captado pela caixa',srcAutoD:'Ofertas, anulações, pessoal — sem escrever',
srcMain:'Declarado pela equipa',srcMainD:'Quebras, falhas, provas, garrafas abertas',
kNonVendu:'Custo das saídas não vendidas',kCA:'Receita',kRatio:'Rácio matéria',kEcart:'Diferenças inventário',
repart:'Por motivo',jrnl:'Últimos movimentos',vide:'Nada por agora',videD:'Os movimentos aparecem aqui.',
who:'Quem usa a app?',whoS:'Escolha o seu posto no estabelecimento.',
lang:'Idioma',langS:'A app fala a língua de cada membro da equipa.',
saved:'Guardado',invOk:'Inventário validado',cleared:'Demo reiniciada',reset:'Reiniciar a demo',
cTapas:'Tapas',cPlats:'Pratos',cCock:'Cocktails',cVins:'Vinhos',cBieres:'Cervejas',cSofts:'Refrigerantes',cAlc:'Licores',cDess:'Sobremesas',cCafe:'Café'},

si:{code:'සිං',nom:'සිංහල',fl:'🇱🇰',
scScannerBon:'බෙදාහැරීමේ පත්‍රය පරිලෝකනය',scPhoto:'ඡායාරූපයක් ගන්න',scGalerie:'රූපයක් තෝරන්න',scReconnu:'හඳුනාගත්',scNonReconnu:'පරීක්ෂා කරන්න',scValider:'බෙදාහැරීම තහවුරු කරන්න',scQte:'ප්‍රමාණය',scTotal:'මුළු',scFournisseur:'සැපයුම්කරු',scDate:'දිනය',scProduits:'නිෂ්පාදන',

accesTout:'සම්පූර්ණ ප්‍රවේශය',accesEquipe:'දැනුම් දීම, බෙදාහැරීම්, තොග ගණන',
nLiv:'බෙදාහැරීම්',
livT:'තොග ඇතුළත් කිරීම',livS:'ලැබෙන දේ සටහන් කරන්න: තොගය වැඩි වේ, මිල යාවත්කාලීන වේ.',
tabRecep:'ලැබීම',tabCmd:'ඇණවුම් කළ යුතු',
newLiv:'+ නව බෙදාහැරීම',fourn:'සැපයුම්කරු',dateL:'දිනය',
addLine:'+ පේළියක් එක් කරන්න',totalLiv:'බෙදාහැරීමේ එකතුව',validLiv:'බෙදාහැරීම සුරකින්න',
histLiv:'මෑත බෙදාහැරීම්',noLiv:'තවම බෙදාහැරීමක් නැත.',
qteRecue:'ලැබූ ප්‍රමාණය',prixU2:'ඒකක මිල',livSaved:'බෙදාහැරීම සුරකින ලදී',
prixMaj:'මිල යාවත්කාලීන විය',hausse:'ඉහළ',baisse:'පහළ',
cmdT:'ඇණවුම් යෝජනාව',cmdS:'අවම මට්ටමට වඩා පහළ නිෂ්පාදන.',
aCommander:'ඇණවුම් කළ යුතු',copierListe:'📋 ලැයිස්තුව පිටපත් කරන්න',listeCopiee:'ලැයිස්තුව පිටපත් විය',
noCmd:'අවම මට්ටමට වඩා පහළ කිසිවක් නැත.',
zone:'කලාපය',zBar:'බාර්',zCave:'වයින් කුටිය',zCuisine:'කුස්සිය',zReserve:'ගබඩාව',zToutes:'සියල්ල',
tabCount:'ගණන් කරන්න',tabHist:'ඉතිහාසය',
histT:'පෙර තොග ගණන්',noHist:'තවම තහවුරු කළ තොග ගණනක් නැත.',
derive:'නැවත නැවත වෙනස්වීම',deriveS:'තොග ගණන් කිහිපයක වෙනස් වී ඇත.',
exportCsv:'⬇ නිර්යාත (CSV)',imprimer:'🖨 මුද්‍රණය / PDF',
addPhoto:'📷 ඡායාරූපයක් එක් කරන්න',photoOk:'ඡායාරූපය එක් විය',retirerPhoto:'ඡායාරූපය ඉවත් කරන්න',
alertes:'අනතුරු ඇඟවීම්',alertPrix:'මිල ඉහළ යාම',alertMarge:'ලාභය අඩු ආහාර',
noAlerte:'අනතුරු ඇඟවීමක් නැත.',
valeurStock:'තොගයේ වටිනාකම',ecartValeur:'වෙනස්කම්වල වටිනාකම',
inventaireDu:'තොග ගණන',lignesEcart:'වෙනස් පේළි',
nCaisse:'බාහිර විකුණුම්',nDec:'දැනුම් දෙන්න',svc:'සේවාව',nStock:'නිෂ්පාදන',nInv:'තොග ගණන',nBil:'වාර්තාව',
caisseT:'බාහිර විකුණුම් ප්‍රවාහය',caisseS:'INVO වලින් පිටත සිදු කළ විකුණුම් වලින් ලැබෙන තොග චලනයන් පමණක් සටහන් කරන්න. INVO ගෙවීම් භාර නොගනී.',
connected:'සම්බන්ධයි',connSub:'අවසන් සමමුහුර්තය %s කට පෙර',
demoCaisse:'නිරූපණය: මෙම ප්‍රවාහය බාහිර විකුණුම් ආයාතයක් අනුකරණය කරයි. INVO ගෙවීම් සකසන්නේ නැත.',
vente:'විකුණුම',offClient:'නොමිලේ — අමුත්තා',offPart:'නොමිලේ — හවුල්කරු',offGroupe:'නොමිලේ — කණ්ඩායම',
annul:'අවලංගු',perso:'සේවක ආහාර',casse:'කැඩීම',rate:'නරක් වූ / නැවත',degus:'රස බැලීම',entame:'විවෘත බෝතලය',
offClientD:'ශාලාවේ දෙන ත්‍යාගය',offPartD:'සගයා, සැපයුම්කරු, අසල්වැසි ආපනශාලාව',
offGroupeD:'කණ්ඩායම, උත්සවය, පෞද්ගලික',persoD:'ශාලා හෝ කුස්සි කණ්ඩායම',
casseD:'වැටුණු, කැඩුණු, හැලුණු',rateD:'පිළිස්සුණු, වැරදුණු, නැවත සාදන ලද',
degusD:'මෙනු පරීක්ෂාව, හිමිකරු, සැපයුම්කරු',entameD:'විවෘත කළ, කිසිදා අය නොකළ',
auto:'ස්වයං',manuel:'අතින්',pause:'නවත්වන්න',reprendre:'නැවත අරඹන්න',
decT:'පිටවීමක් දැනුම් දෙන්න',decS:'මුදල් යන්ත්‍රය හරහා නොයන සියලු තොග පිටවීම්.',
demoDec:'නිෂ්පාදනයක් එක් කිරීමට ස්පර්ශ කරන්න. ප්‍රමාණය සකසන්න, හේතුව තෝරන්න, තහවුරු කරන්න.',
midi:'දිවා',soir:'රාත්‍රී',svcHint:'සේවාව මෙනුව පෙරහන් කරයි: දිවා ආහාරයට ප්‍රධාන ආහාර, රාත්‍රියට ටපස් සහ කොක්ටේල්.',
etape1:'1 — නිෂ්පාදන',etape2:'2 — හේතුව',panier:'කූඩය',vider:'හිස් කරන්න',
coutMat:'මුළු ද්‍රව්‍ය පිරිවැය',send:'තහවුරු කරන්න',articles:'අයිතමය',articlesP:'අයිතම',choisirMotif:'හේතුව තෝරන්න',
stockT:'නිෂ්පාදන සහ ද්‍රව්‍ය',stockS:'ඔබට අවශ්‍ය දේ එක් කරන්න, වෙනස් කරන්න හෝ ඉවත් කරන්න.',
tabMat:'ද්‍රව්‍ය',tabCarte:'මෙනුව',search:'සොයන්න…',
addMat:'ද්‍රව්‍යයක් එක් කරන්න',editMat:'ද්‍රව්‍යය වෙනස් කරන්න',
addCarte:'මෙනුවට එක් කරන්න',editCarte:'නිෂ්පාදනය වෙනස් කරන්න',
fNom:'නම',fIcone:'නිරූපකය',fUnite:'මිනුම් ඒකකය',fAchat:'මිලදී ගැනීමේ ක්‍රමය',
achCont:'බහාලුමෙන්',achDirect:'ඒකකයෙන්',fContenance:'ධාරිතාව',fPrixCont:'මිලදී ගැනීමේ මිල',
fPrixU:'ඒකක මිල',fStock:'වත්මන් තොගය',fSeuil:'අවම මට්ටම',
fCat:'වර්ගය',fService:'සේවාව',fType:'වර්ගය',fPV:'විකුණුම් මිල',
tFood:'ආහාර',tDrink:'පාන',svTous:'දිවා සහ රාත්‍රී',
fiche:'වට්ටෝරුව',ficheS:'නිෂ්පාදනය තොගයෙන් සැබවින්ම ගන්නා දේ.',
addIng:'+ අමුද්‍රව්‍යයක් එක් කරන්න',noIng:'අමුද්‍රව්‍ය නැත — පිරිවැය බිංදුව වේ.',
coutRev:'ද්‍රව්‍ය පිරිවැය',marge:'ලාභය',ratioP:'අනුපාතය',
save2:'සුරකින්න',del:'මකන්න',cancel:'අවලංගු',
confDel:'ස්ථිරවම මකන්නද?',usedIn:'වට්ටෝරු %s ක භාවිත වේ — ඒවායින් ඉවත් වේ.',
matSaved:'ද්‍රව්‍යය සුරකින ලදී',matDel:'ද්‍රව්‍යය මකන ලදී',
carteSaved:'නිෂ්පාදනය සුරකින ලදී',carteDel:'නිෂ්පාදනය මකන ලදී',
invT:'මාසික තොග ගණන',invS:'ගණන් කරන්න, සසඳන්න, තහවුරු කරන්න.',
attendu:'අපේක්ෂිත',compte:'ගණන් කළ',prod:'නිෂ්පාදනය',valid:'තහවුරු කරන්න',clear:'සියල්ල මකන්න',
lignes:'ගණන් කළ පේළි',conf:'ගැළපෙන පේළි',ecarts:'වෙනස්කම්',
bilT:'මාසික වාර්තාව',bilS:'ඔබේ තොග පිටවීම් කොහෙන්ද, කීයක් වැයද.',
origine:'නොවිකුණූ පිටවීම්වල මූලාශ්‍රය',srcAuto:'මුදල් යන්ත්‍රයෙන්',srcAutoD:'නොමිලේ දීම්, අවලංගු, සේවක ආහාර',
srcMain:'කණ්ඩායම විසින්',srcMainD:'කැඩීම්, නරක් වූ, රස බැලීම්, විවෘත බෝතල්',
kNonVendu:'නොවිකුණූ පිටවීම්වල පිරිවැය',kCA:'ලැබූ ආදායම',kRatio:'ද්‍රව්‍ය අනුපාතය',kEcart:'තොග වෙනස්කම්',
repart:'හේතුව අනුව',jrnl:'නවතම චලනයන්',vide:'තවම කිසිවක් නැත',videD:'චලනයන් මෙහි පෙන්වනු ඇත.',
who:'ඇප් එක භාවිත කරන්නේ කවුද?',whoS:'ආපනශාලාවේ ඔබේ තනතුර තෝරන්න.',
lang:'භාෂාව',langS:'ඇප් එක සෑම කණ්ඩායම් සාමාජිකයෙකුගේම භාෂාව කථා කරයි.',
saved:'සුරකින ලදී',invOk:'තොග ගණන තහවුරු විය',cleared:'නිරූපණය යළි සකසන ලදී',reset:'නිරූපණය යළි සකසන්න',
cTapas:'ටපස්',cPlats:'ප්‍රධාන ආහාර',cCock:'කොක්ටේල්',cVins:'වයින්',cBieres:'බියර්',cSofts:'මෘදු පාන',cAlc:'මධ්‍යසාර',cDess:'අතුරුපස',cCafe:'කෝපි'},

ta:{code:'தமி',nom:'தமிழ்',fl:'🇱🇰',
scScannerBon:'விநியோகச் சீட்டை ஸ்கேன் செய்',scPhoto:'புகைப்படம் எடு',scGalerie:'படத்தைத் தேர்ந்தெடு',scReconnu:'அடையாளம் காணப்பட்டது',scNonReconnu:'சரிபார்',scValider:'விநியோகத்தை உறுதிப்படுத்து',scQte:'அளவு',scTotal:'மொத்தம்',scFournisseur:'சப்ளையர்',scDate:'தேதி',scProduits:'பொருட்கள்',

accesTout:'முழு அணுகல்',accesEquipe:'பதிவு, விநியோகம், எண்ணல்',
nLiv:'விநியோகங்கள்',
livT:'கையிருப்பு உள்வரவு',livS:'பெறுவதைப் பதிவு செய்யுங்கள்: கையிருப்பு உயரும், விலைகள் புதுப்பிக்கப்படும்.',
tabRecep:'பெறுதல்',tabCmd:'ஆர்டர் செய்ய',
newLiv:'+ புதிய விநியோகம்',fourn:'சப்ளையர்',dateL:'தேதி',
addLine:'+ ஒரு வரி சேர்',totalLiv:'விநியோக மொத்தம்',validLiv:'விநியோகத்தைச் சேமி',
histLiv:'சமீபத்திய விநியோகங்கள்',noLiv:'இதுவரை விநியோகம் பதிவாகவில்லை.',
qteRecue:'பெற்ற அளவு',prixU2:'அலகு விலை',livSaved:'விநியோகம் சேமிக்கப்பட்டது',
prixMaj:'விலை புதுப்பிக்கப்பட்டது',hausse:'உயர்வு',baisse:'இறக்கம்',
cmdT:'ஆர்டர் பரிந்துரை',cmdS:'குறைந்தபட்ச அளவுக்குக் கீழே உள்ள பொருட்கள்.',
aCommander:'ஆர்டர் செய்ய',copierListe:'📋 பட்டியலை நகலெடு',listeCopiee:'பட்டியல் நகலெடுக்கப்பட்டது',
noCmd:'குறைந்தபட்சத்திற்குக் கீழே எதுவும் இல்லை.',
zone:'பகுதி',zBar:'பார்',zCave:'ஒயின் அறை',zCuisine:'சமையலறை',zReserve:'கிடங்கு',zToutes:'அனைத்தும்',
tabCount:'எண்ணு',tabHist:'வரலாறு',
histT:'முந்தைய எண்ணல்கள்',noHist:'இதுவரை உறுதிப்படுத்தப்பட்ட எண்ணல் இல்லை.',
derive:'தொடர் வேறுபாடு',deriveS:'பல எண்ணல்களில் வேறுபாடு — கவனிக்க வேண்டும்.',
exportCsv:'⬇ ஏற்றுமதி (CSV)',imprimer:'🖨 அச்சிடு / PDF',
addPhoto:'📷 ஒரு புகைப்படம் சேர்',photoOk:'புகைப்படம் சேர்க்கப்பட்டது',retirerPhoto:'புகைப்படத்தை நீக்கு',
alertes:'எச்சரிக்கைகள்',alertPrix:'கொள்முதல் விலை உயர்வு',alertMarge:'லாபம் குறைந்த உணவுகள்',
noAlerte:'எச்சரிக்கை இல்லை.',
valeurStock:'கையிருப்பு மதிப்பு',ecartValeur:'வேறுபாடுகளின் மதிப்பு',
inventaireDu:'எண்ணல்',lignesEcart:'வேறுபட்ட வரிகள்',
nCaisse:'வெளிப்புற விற்பனைகள்',nDec:'பதிவு செய்',svc:'சேவை',nStock:'பொருட்கள்',nInv:'சரக்கு எண்ணல்',nBil:'அறிக்கை',
caisseT:'வெளிப்புற விற்பனை ஓட்டம்',caisseS:'INVO க்கு வெளியே முடிந்த விற்பனைகளின் இருப்பு நகர்வுகளை மட்டும் பதிவு செய்யவும். INVO பணம் வசூலிப்பதில்லை.',
connected:'இணைக்கப்பட்டது',connSub:'கடைசி ஒத்திசைவு %s முன்பு',
demoCaisse:'மாதிரி: இந்த ஓட்டம் வெளிப்புற விற்பனை இறக்குமதியைப் பிரதிபலிக்கிறது. INVO பணப் பரிவர்த்தனைகளைச் செய்யாது.',
vente:'விற்பனை',offClient:'இலவசம் — வாடிக்கையாளர்',offPart:'இலவசம் — கூட்டாளி',offGroupe:'இலவசம் — குழு',
annul:'ரத்து',perso:'பணியாளர் உணவு',casse:'உடைவு',rate:'கெட்டது / மீண்டும்',degus:'சுவை பார்த்தல்',entame:'திறந்த பாட்டில்',
offClientD:'மண்டபத்தில் வழங்கிய சலுகை',offPartD:'சகா, சப்ளையர், அருகிலுள்ள உணவகம்',
offGroupeD:'குழு, நிகழ்வு, தனியார் விழா',persoD:'மண்டபம் அல்லது சமையலறை குழு',
casseD:'விழுந்தது, உடைந்தது, சிந்தியது',rateD:'எரிந்தது, தவறியது, மீண்டும் செய்யப்பட்டது',
degusD:'மெனு சோதனை, முதலாளி, சப்ளையர்',entameD:'திறக்கப்பட்டது, கணக்கிடப்படவில்லை',
auto:'தானியங்கி',manuel:'கையால்',pause:'இடைநிறுத்து',reprendre:'மீண்டும் தொடங்கு',
decT:'ஒரு வெளியேற்றத்தைப் பதிவு செய்',decS:'பணப்பெட்டி வழியாகச் செல்லாமல் கையிருப்பை விட்டு வெளியேறும் அனைத்தும்.',
demoDec:'ஒரு பொருளைச் சேர்க்கத் தொடவும். அளவுகளைச் சரிசெய்து, காரணத்தைத் தேர்ந்தெடுத்து, உறுதிப்படுத்தவும்.',
midi:'மதியம்',soir:'இரவு',svcHint:'சேவை மெனுவை வடிகட்டுகிறது: மதியம் முக்கிய உணவு, இரவில் தபாஸ் மற்றும் காக்டெயில்.',
etape1:'1 — பொருட்கள்',etape2:'2 — காரணம்',panier:'கூடை',vider:'காலி செய்',
coutMat:'மொத்த மூலப்பொருள் செலவு',send:'உறுதிப்படுத்து',articles:'பொருள்',articlesP:'பொருட்கள்',choisirMotif:'காரணத்தைத் தேர்ந்தெடு',
stockT:'பொருட்கள் மற்றும் மூலப்பொருட்கள்',stockS:'நீங்கள் கண்காணிக்க விரும்புவதைச் சேர்க்க, திருத்த அல்லது நீக்கவும்.',
tabMat:'மூலப்பொருட்கள்',tabCarte:'மெனு',search:'தேடு…',
addMat:'ஒரு மூலப்பொருளைச் சேர்',editMat:'மூலப்பொருளைத் திருத்து',
addCarte:'மெனுவில் சேர்',editCarte:'பொருளைத் திருத்து',
fNom:'பெயர்',fIcone:'சின்னம்',fUnite:'அளவீட்டு அலகு',fAchat:'கொள்முதல் முறை',
achCont:'கொள்கலன் வாரியாக',achDirect:'அலகு வாரியாக',fContenance:'கொள்ளளவு',fPrixCont:'கொள்முதல் விலை',
fPrixU:'அலகு விலை',fStock:'தற்போதைய கையிருப்பு',fSeuil:'குறைந்தபட்ச அளவு',
fCat:'வகை',fService:'சேவை',fType:'வகை',fPV:'விற்பனை விலை',
tFood:'உணவு',tDrink:'பானம்',svTous:'மதியம் மற்றும் இரவு',
fiche:'செய்முறை',ficheS:'இந்தப் பொருள் கையிருப்பிலிருந்து உண்மையில் எடுப்பது.',
addIng:'+ ஒரு மூலப்பொருளைச் சேர்',noIng:'மூலப்பொருள் இல்லை — செலவு பூஜ்ஜியமாக இருக்கும்.',
coutRev:'மூலப்பொருள் செலவு',marge:'லாபம்',ratioP:'விகிதம்',
save2:'சேமி',del:'நீக்கு',cancel:'ரத்து',
confDel:'நிரந்தரமாக நீக்கவா?',usedIn:'%s செய்முறையில் பயன்படுகிறது — அவற்றிலிருந்து நீக்கப்படும்.',
matSaved:'மூலப்பொருள் சேமிக்கப்பட்டது',matDel:'மூலப்பொருள் நீக்கப்பட்டது',
carteSaved:'பொருள் சேமிக்கப்பட்டது',carteDel:'பொருள் நீக்கப்பட்டது',
invT:'மாதாந்திர எண்ணல்',invS:'எண்ணுங்கள், ஒப்பிடுங்கள், உறுதிப்படுத்துங்கள்.',
attendu:'எதிர்பார்த்த',compte:'எண்ணிய',prod:'பொருள்',valid:'உறுதிப்படுத்து',clear:'அனைத்தையும் அழி',
lignes:'எண்ணிய வரிகள்',conf:'பொருந்திய வரிகள்',ecarts:'வேறுபாடுகள்',
bilT:'மாதாந்திர அறிக்கை',bilS:'உங்கள் கையிருப்பு வெளியேற்றங்கள் எங்கிருந்து வருகின்றன, எவ்வளவு செலவாகும்.',
origine:'விற்கப்படாத வெளியேற்றங்களின் ஆதாரம்',srcAuto:'பணப்பெட்டியால் பதிவு',srcAutoD:'இலவசம், ரத்து, பணியாளர் உணவு',
srcMain:'குழுவால் பதிவு',srcMainD:'உடைவு, கெட்டவை, சுவை, திறந்த பாட்டில்கள்',
kNonVendu:'விற்கப்படாத வெளியேற்றச் செலவு',kCA:'பெறப்பட்ட வருவாய்',kRatio:'மூலப்பொருள் விகிதம்',kEcart:'எண்ணல் வேறுபாடுகள்',
repart:'காரணத்தின்படி',jrnl:'சமீபத்திய நகர்வுகள்',vide:'இதுவரை எதுவும் இல்லை',videD:'நகர்வுகள் இங்கே தோன்றும்.',
who:'செயலியை யார் பயன்படுத்துகிறார்?',whoS:'உணவகத்தில் உங்கள் பதவியைத் தேர்ந்தெடுக்கவும்.',
lang:'மொழி',langS:'ஒவ்வொரு குழு உறுப்பினரின் மொழியிலும் செயலி பேசுகிறது.',
saved:'சேமிக்கப்பட்டது',invOk:'எண்ணல் உறுதிப்படுத்தப்பட்டது',cleared:'மாதிரி மீட்டமைக்கப்பட்டது',reset:'மாதிரியை மீட்டமை',
cTapas:'தபாஸ்',cPlats:'முக்கிய உணவு',cCock:'காக்டெயில்',cVins:'ஒயின்',cBieres:'பீர்',cSofts:'குளிர்பானம்',cAlc:'மது',cDess:'இனிப்பு',cCafe:'காபி'}};

/* ═════ DONNÉES PAR DÉFAUT ═════ */
const PRODUITS_DEF=[
{id:'gin_beef',n:'Gin Beefeater',i:'🍸',u:'cl',ct:70,pc:15.40,s:210,seuil:70,px:0.22,z:'bar',fo:'France Boissons',dlc:0},
{id:'gin_gvine',n:'Gin G\'Vine',i:'🍸',u:'cl',ct:70,pc:29.40,s:140,seuil:70,px:0.42,z:'bar',fo:'France Boissons',dlc:0},
{id:'gin_hend',n:'Hendrick\'s',i:'🍸',u:'cl',ct:70,pc:33.60,s:140,seuil:70,px:0.48,z:'bar',fo:'France Boissons',dlc:0},
{id:'vodka_abs',n:'Absolut',i:'🍶',u:'cl',ct:70,pc:14.70,s:280,seuil:70,px:0.21,z:'bar',fo:'France Boissons',dlc:0},
{id:'vodka_gg',n:'Grey Goose',i:'🍶',u:'cl',ct:70,pc:32.20,s:140,seuil:70,px:0.46,z:'bar',fo:'France Boissons',dlc:0},
{id:'rhum_hav3',n:'Havana 3 ans',i:'🥃',u:'cl',ct:70,pc:14.00,s:210,seuil:70,px:0.20,z:'bar',fo:'France Boissons',dlc:0},
{id:'rhum_zac',n:'Zacapa 23',i:'🥃',u:'cl',ct:70,pc:52.50,s:70,seuil:70,px:0.75,z:'bar',fo:'France Boissons',dlc:0},
{id:'tequila',n:'Olmeca / Patrón',i:'🌵',u:'cl',ct:70,pc:26.60,s:140,seuil:70,px:0.38,z:'bar',fo:'France Boissons',dlc:0},
{id:'whisky_jd',n:'Jack Daniel\'s',i:'🥃',u:'cl',ct:70,pc:20.30,s:210,seuil:70,px:0.29,z:'bar',fo:'France Boissons',dlc:0},
{id:'whisky_ta',n:'Talisker',i:'🥃',u:'cl',ct:70,pc:43.40,s:70,seuil:70,px:0.62,z:'bar',fo:'France Boissons',dlc:0},
{id:'aperol',n:'Aperol',i:'🍊',u:'cl',ct:100,pc:14.00,s:300,seuil:100,px:0.14,z:'bar',fo:'France Boissons',dlc:0},
{id:'campari',n:'Campari',i:'🍒',u:'cl',ct:100,pc:17.00,s:200,seuil:100,px:0.17,z:'bar',fo:'France Boissons',dlc:0},
{id:'stgermain',n:'St Germain',i:'🌸',u:'cl',ct:70,pc:30.80,s:140,seuil:70,px:0.44,z:'bar',fo:'France Boissons',dlc:0},
{id:'ricard',n:'Ricard',i:'🌿',u:'cl',ct:100,pc:16.00,s:400,seuil:100,px:0.16,z:'bar',fo:'France Boissons',dlc:0},
{id:'martini',n:'Martini',i:'🍹',u:'cl',ct:100,pc:11.00,s:300,seuil:100,px:0.11,z:'bar',fo:'France Boissons',dlc:0},
{id:'triple',n:'Cointreau',i:'🍊',u:'cl',ct:70,pc:24.50,s:140,seuil:70,px:0.35,z:'bar',fo:'France Boissons',dlc:0},
{id:'sirops',n:'Sirops bar',i:'🧴',u:'cl',ct:100,pc:5.00,s:500,seuil:150,px:0.05,z:'bar',fo:'France Boissons',dlc:365},
{id:'citron',n:'Citrons / limes',i:'🍋',u:'kg',s:9,seuil:4,px:2.60,z:'bar',fo:'France Boissons',dlc:14},
{id:'menthe',n:'Menthe fraîche',i:'🌿',u:'kg',s:0.8,seuil:0.4,px:16.0,z:'bar',fo:'France Boissons',dlc:4},
{id:'fruitrouge',n:'Purée fruits rouges',i:'🫐',u:'kg',s:4,seuil:2,px:7.20,z:'bar',fo:'France Boissons',dlc:120},
{id:'vin_stnico',n:'Chevalerie St Nico',i:'🍷',u:'btl',s:42,seuil:18,px:6.80,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_clape',n:'La Clape rouge',i:'🍷',u:'btl',s:36,seuil:15,px:7.50,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_pic',n:'Pic Saint Loup',i:'🍷',u:'btl',s:24,seuil:10,px:11.5,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_santa',n:'Santa Giulia rosé',i:'🌹',u:'btl',s:48,seuil:20,px:6.20,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_tariq',n:'Tariquet sec blanc',i:'🥂',u:'btl',s:36,seuil:15,px:5.90,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_chardo',n:'Chardonnay 409',i:'🥂',u:'btl',s:30,seuil:12,px:6.10,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'prosecco',n:'Prosecco',i:'🍾',u:'btl',s:24,seuil:10,px:7.40,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'champ_moet',n:'Moët Brut 75cl',i:'🍾',u:'btl',s:12,seuil:6,px:29.0,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'champ_veuve',n:'Veuve Clicquot 75cl',i:'🍾',u:'btl',s:8,seuil:4,px:33.0,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'biere_wawa',n:'Wawa pression',i:'🍺',u:'L',ct:30,pc:72.00,s:120,seuil:40,px:2.40,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_bete',n:'La Bête pression',i:'🍺',u:'L',ct:20,pc:58.00,s:80,seuil:30,px:2.90,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_ipa',n:'Eguzki IPA pression',i:'🍺',u:'L',ct:20,pc:64.00,s:60,seuil:25,px:3.20,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_btl',n:'Bières bouteille',i:'🍺',u:'u',s:96,seuil:36,px:1.35,z:'bar',fo:'France Boissons',dlc:180},
{id:'soft_33',n:'Softs 33cl',i:'🥤',u:'u',s:180,seuil:60,px:0.72,z:'bar',fo:'France Boissons',dlc:180},
{id:'redbull',n:'Red Bull',i:'⚡',u:'u',s:72,seuil:24,px:1.30,z:'bar',fo:'France Boissons',dlc:300},
{id:'jus',n:'Jus de fruits',i:'🧃',u:'cl',ct:100,pc:2.40,s:1200,seuil:400,px:0.024,z:'bar',fo:'France Boissons',dlc:90},
{id:'oranges',n:'Oranges à presser',i:'🍊',u:'kg',s:22,seuil:8,px:1.90,z:'bar',fo:'France Boissons',dlc:14},
{id:'boeuf',n:'Bœuf (steak/burger)',i:'🥩',u:'kg',s:14,seuil:6,px:16.5,z:'cuisine',fo:'Metro',dlc:4},
{id:'magret',n:'Magret de canard',i:'🦆',u:'kg',s:6,seuil:3,px:21.0,z:'cuisine',fo:'Metro',dlc:4},
{id:'poulet',n:'Poulet / fingers',i:'🍗',u:'kg',s:12,seuil:5,px:8.40,z:'cuisine',fo:'Metro',dlc:3},
{id:'saumon',n:'Saumon poke',i:'🐟',u:'kg',s:5,seuil:3,px:19.5,z:'cuisine',fo:'Metro',dlc:2},
{id:'calamar',n:'Calamars',i:'🦑',u:'kg',s:4,seuil:2,px:11.0,z:'cuisine',fo:'Metro',dlc:2},
{id:'jambon',n:'Jambon Serrano',i:'🍖',u:'kg',s:3.5,seuil:1.5,px:24.0,z:'cuisine',fo:'Metro',dlc:20},
{id:'fromage',n:'Fromages assortis',i:'🧀',u:'kg',s:5,seuil:2,px:14.5,z:'cuisine',fo:'Metro',dlc:18},
{id:'mozza',n:'Mozzarella',i:'🧀',u:'kg',s:4,seuil:2,px:8.90,z:'cuisine',fo:'Metro',dlc:10},
{id:'pain_burg',n:'Pains burger',i:'🍞',u:'u',s:80,seuil:30,px:0.55,z:'cuisine',fo:'Metro',dlc:3},
{id:'tortilla',n:'Tortillas / bao',i:'🌮',u:'u',s:120,seuil:40,px:0.38,z:'cuisine',fo:'Metro',dlc:20},
{id:'frites',n:'Frites surgelées',i:'🍟',u:'kg',s:40,seuil:15,px:1.80,z:'cuisine',fo:'Metro',dlc:240},
{id:'salade',n:'Salades / crudités',i:'🥬',u:'kg',s:9,seuil:4,px:3.40,z:'cuisine',fo:'Metro',dlc:4},
{id:'tomate',n:'Tomates',i:'🍅',u:'kg',s:11,seuil:5,px:3.10,z:'cuisine',fo:'Metro',dlc:6},
{id:'avocat',n:'Avocats',i:'🥑',u:'u',s:40,seuil:15,px:1.10,z:'cuisine',fo:'Metro',dlc:5},
{id:'riz',n:'Riz poke',i:'🍚',u:'kg',s:12,seuil:5,px:2.10,z:'cuisine',fo:'Metro',dlc:365},
{id:'oeuf',n:'Œufs',i:'🥚',u:'u',s:120,seuil:48,px:0.29,z:'cuisine',fo:'Metro',dlc:21},
{id:'creme',n:'Crème / mascarpone',i:'🥛',u:'kg',s:8,seuil:3,px:5.60,z:'cuisine',fo:'Metro',dlc:8},
{id:'choco',n:'Chocolat pâtissier',i:'🍫',u:'kg',s:4,seuil:2,px:9.80,z:'cuisine',fo:'Metro',dlc:365},
{id:'glace',n:'Glaces (bacs)',i:'🍨',u:'L',s:18,seuil:8,px:4.30,z:'cuisine',fo:'Metro',dlc:180},
{id:'cafe',n:'Café en grains',i:'☕',u:'kg',s:6,seuil:3,px:14.0,z:'cuisine',fo:'Metro',dlc:180},
{id:'lait',n:'Lait',i:'🥛',u:'L',s:24,seuil:10,px:0.95,z:'cuisine',fo:'Metro',dlc:7}];

const CARTE_DEF=[
{id:'planche',n:'La Planche',i:'🧺',c:'cTapas',k:'food',sv:'soir',pv:25.00,f:{jambon:.12,fromage:.15,tomate:.05,pain_burg:1}},
{id:'assFromage',n:'Assiette fromage',i:'🧀',c:'cTapas',k:'food',sv:'soir',pv:9.50,f:{fromage:.14,pain_burg:.5}},
{id:'assJambon',n:'Assiette jambon',i:'🍖',c:'cTapas',k:'food',sv:'soir',pv:10.50,f:{jambon:.09,pain_burg:.5}},
{id:'calamarR',n:'Calamars romaine',i:'🦑',c:'cTapas',k:'food',sv:'soir',pv:7.00,f:{calamar:.14,citron:.03}},
{id:'fingers',n:'Fingers poulet',i:'🍗',c:'cTapas',k:'food',sv:'soir',pv:8.00,f:{poulet:.16}},
{id:'cornetFrite',n:'Cornet de frites',i:'🍟',c:'cTapas',k:'food',sv:'soir',pv:6.00,f:{frites:.22}},
{id:'trioTacos',n:'Trio de tacos',i:'🌮',c:'cTapas',k:'food',sv:'soir',pv:11.50,f:{poulet:.11,tortilla:3,salade:.04,tomate:.03}},
{id:'baoPoulet',n:'Bao poulet',i:'🥟',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{poulet:.13,tortilla:2,salade:.04}},
{id:'trioMezze',n:'Trio de mezze',i:'🫓',c:'cTapas',k:'food',sv:'soir',pv:9.00,f:{tomate:.08,salade:.06,tortilla:2}},
{id:'avocadoT',n:'Avocado toast',i:'🥑',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{avocat:1.5,pain_burg:1,tomate:.04}},
{id:'tataki',n:'Tataki de bœuf',i:'🥩',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{boeuf:.13,salade:.04}},
{id:'magretTapa',n:'Magret',i:'🦆',c:'cTapas',k:'food',sv:'soir',pv:12.50,f:{magret:.15,salade:.03}},
{id:'wallaceBurger',n:'Wallace Burger',i:'🍔',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{boeuf:.13,pain_burg:1,fromage:.02}},
{id:'croqSerrano',n:'Croque Serrano',i:'🥪',c:'cTapas',k:'food',sv:'soir',pv:9.50,f:{jambon:.05,fromage:.06,pain_burg:1.5}},
{id:'hotdogCan',n:'Hot dog Canaillou',i:'🌭',c:'cTapas',k:'food',sv:'soir',pv:9.00,f:{poulet:.09,pain_burg:1,fromage:.03}},
{id:'burgerW',n:'Burger du Wallace',i:'🍔',c:'cPlats',k:'food',sv:'midi',pv:17.50,f:{boeuf:.19,pain_burg:1,fromage:.03,salade:.03,tomate:.04,frites:.2}},
{id:'burgerVege',n:'Burger végé',i:'🥬',c:'cPlats',k:'food',sv:'midi',pv:16.50,f:{pain_burg:1,mozza:.06,salade:.05,tomate:.06,avocat:.5,frites:.2}},
{id:'platJour',n:'Plat du jour',i:'🍽️',c:'cPlats',k:'food',sv:'midi',pv:14.50,f:{poulet:.18,frites:.15,salade:.05}},
{id:'steakFrite',n:'Steak frites',i:'🥩',c:'cPlats',k:'food',sv:'midi',pv:9.00,f:{boeuf:.16,frites:.2}},
{id:'nuggets',n:'Nuggets frites',i:'🍗',c:'cPlats',k:'food',sv:'midi',pv:12.00,f:{poulet:.15,frites:.2}},
{id:'croqueM',n:'Croque Monsieur',i:'🥪',c:'cPlats',k:'food',sv:'midi',pv:13.00,f:{jambon:.06,fromage:.07,pain_burg:1.5}},
{id:'croqueMa',n:'Croque Madame',i:'🍳',c:'cPlats',k:'food',sv:'midi',pv:13.50,f:{jambon:.06,fromage:.07,pain_burg:1.5,oeuf:1}},
{id:'wrap',n:'Wrap',i:'🌯',c:'cPlats',k:'food',sv:'midi',pv:14.50,f:{poulet:.13,tortilla:2,salade:.05,tomate:.04,frites:.15}},
{id:'pokeSaumon',n:'Poke bowl saumon',i:'🐟',c:'cPlats',k:'food',sv:'midi',pv:16.50,f:{saumon:.13,riz:.16,avocat:.5,salade:.05}},
{id:'pokeVege',n:'Poke bowl végé',i:'🥗',c:'cPlats',k:'food',sv:'midi',pv:13.00,f:{riz:.16,avocat:1,salade:.08,tomate:.05}},
{id:'saladeBiq',n:'Salade Biquette',i:'🥗',c:'cPlats',k:'food',sv:'midi',pv:14.00,f:{salade:.11,fromage:.08,tomate:.06}},
{id:'saladeTom',n:'Salade tomates mozza',i:'🍅',c:'cPlats',k:'food',sv:'midi',pv:16.00,f:{tomate:.19,mozza:.11,salade:.04}},
{id:'mojito',n:'Mojito',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,menthe:.012,citron:.05,sirops:2}},
{id:'mojitoRoyal',n:'Mojito Royal',i:'👑',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{rhum_hav3:5,menthe:.012,citron:.05,sirops:2,prosecco:.12}},
{id:'virginMoj',n:'Virgin Mojito',i:'🌿',c:'cCock',k:'drink',sv:'tous',pv:7.00,f:{menthe:.012,citron:.06,sirops:3,soft_33:.5}},
{id:'tiPunch',n:'Ti Punch',i:'🍹',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:6,citron:.04,sirops:1.5}},
{id:'pinaColada',n:'Piña Colada',i:'🥥',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,jus:8,creme:.03}},
{id:'daiquiri',n:'Daiquiri',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,citron:.05,sirops:2}},
{id:'cubaLibre',n:'Cuba Libre',i:'🥤',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,soft_33:1,citron:.02}},
{id:'maiTai',n:'Mai Tai',i:'🌺',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:4,triple:1.5,citron:.05,jus:4}},
{id:'margarita',n:'Margarita',i:'🍹',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{tequila:5,triple:2,citron:.06}},
{id:'longIsland',n:'Long Island',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{vodka_abs:1.5,gin_beef:1.5,rhum_hav3:1.5,tequila:1.5,triple:1,soft_33:.5,citron:.03}},
{id:'sexBeach',n:'Sex on the Beach',i:'🏖️',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:5,jus:8,fruitrouge:.02}},
{id:'cosmo',n:'Cosmopolitan',i:'💗',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:4,triple:1.5,citron:.04,fruitrouge:.02}},
{id:'espMartini',n:'Espresso Martini',i:'☕',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:4,cafe:.009,sirops:1.5}},
{id:'dryMartini',n:'Dry Martini Gin',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_beef:6,martini:1}},
{id:'negroni',n:'Negroni',i:'🟥',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_beef:3,campari:3,martini:3}},
{id:'americano',n:'Americano',i:'🍊',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{campari:4,martini:4,soft_33:.3}},
{id:'spritzAp',n:'Spritz Aperol',i:'🧡',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{aperol:6,prosecco:.15,soft_33:.2}},
{id:'spritzSG',n:'Spritz St Germain',i:'🌸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{stgermain:4,prosecco:.15,soft_33:.2}},
{id:'bloodyMary',n:'Bloody Mary',i:'🍅',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{vodka_abs:5,jus:10,citron:.03}},
{id:'basilSmash',n:'Basil Smash',i:'🌿',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_gvine:5,menthe:.01,citron:.05,sirops:2}},
{id:'braiseRouge',n:'Braise Rouge',i:'🔥',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{whisky_jd:4,fruitrouge:.03,citron:.04,sirops:1.5}},
{id:'nuageRose',n:'Nuage Rose',i:'☁️',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_hend:4,fruitrouge:.03,citron:.04,sirops:1.5}},
{id:'dolceViol',n:'Dolce Violette',i:'💜',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_gvine:4,fruitrouge:.02,citron:.04,sirops:2}},
{id:'velourTrop',n:'Velour Tropical',i:'🌴',c:'cCock',k:'drink',sv:'soir',pv:12.00,f:{rhum_zac:4,jus:8,citron:.03}},
{id:'yuzuBlossom',n:'Yuzu Blossom',i:'🌼',c:'cCock',k:'drink',sv:'soir',pv:8.50,f:{sirops:4,citron:.06,soft_33:.5}},
{id:'mezcalSour',n:'Mezcal Sour',i:'🌵',c:'cCock',k:'drink',sv:'soir',pv:13.00,f:{tequila:5,citron:.06,sirops:2,oeuf:.5}},
{id:'spritzXL',n:'Spritz Aperol XL 1,5L',i:'🏺',c:'cCock',k:'drink',sv:'soir',pv:35.00,f:{aperol:24,prosecco:.6,soft_33:.8}},
{id:'sgXL',n:'St Germain XL 1,5L',i:'🏺',c:'cCock',k:'drink',sv:'soir',pv:35.00,f:{stgermain:16,prosecco:.6,soft_33:.8}},
{id:'pichetSang',n:'Pichet Sangria',i:'🍷',c:'cCock',k:'drink',sv:'tous',pv:30.00,f:{vin_stnico:.9,triple:4,jus:20,oranges:.25}},
{id:'vHavana3',n:'Verre Havana 3A',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:8.00,f:{rhum_hav3:4}},
{id:'vZacapa',n:'Verre Zacapa 23',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:13.00,f:{rhum_zac:4}},
{id:'vAbsolut',n:'Verre Absolut',i:'🍶',c:'cAlc',k:'drink',sv:'soir',pv:8.00,f:{vodka_abs:4}},
{id:'vGGoose',n:'Verre Grey Goose',i:'🍶',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{vodka_gg:4}},
{id:'vJack',n:'Verre Jack Daniel\'s',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{whisky_jd:4}},
{id:'vTalisker',n:'Verre Talisker',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{whisky_ta:4}},
{id:'vGvine',n:'Verre G\'Vine',i:'🍸',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{gin_gvine:4}},
{id:'vHendricks',n:'Verre Hendrick\'s',i:'🍸',c:'cAlc',k:'drink',sv:'soir',pv:11.00,f:{gin_hend:4}},
{id:'vRicard',n:'Ricard',i:'🌿',c:'cAlc',k:'drink',sv:'tous',pv:3.50,f:{ricard:2}},
{id:'dblRicard',n:'Double Ricard',i:'🌿',c:'cAlc',k:'drink',sv:'tous',pv:7.00,f:{ricard:4}},
{id:'vGGRedbull',n:'Grey Goose Red Bull',i:'⚡',c:'cAlc',k:'drink',sv:'soir',pv:13.00,f:{vodka_gg:4,redbull:1}},
{id:'dblJack',n:'Double Jack',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:15.00,f:{whisky_jd:8}},
{id:'vStNico',n:'Verre St Nico',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:4.50,f:{vin_stnico:.14}},
{id:'vClape',n:'Verre La Clape',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:5.00,f:{vin_clape:.14}},
{id:'vPicStLoup',n:'Verre Pic St Loup',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:6.00,f:{vin_pic:.14}},
{id:'vSanta',n:'Verre Santa Giulia',i:'🌹',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_santa:.14}},
{id:'vTariquet',n:'Verre Tariquet',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_tariq:.14}},
{id:'vChardo',n:'Verre Chardo 409',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_chardo:.14}},
{id:'coupeProse',n:'Coupe Prosecco',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:5.00,f:{prosecco:.12}},
{id:'coupeChamp',n:'Coupe Champagne',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:8.50,f:{champ_moet:.12}},
{id:'btStNico',n:'Bt Chevalerie St Nico',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:25.00,f:{vin_stnico:1}},
{id:'btClape',n:'Bt La Clape rouge',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:27.00,f:{vin_clape:1}},
{id:'btPicStLoup',n:'Bt Pic St Loup',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:34.00,f:{vin_pic:1}},
{id:'btSanta',n:'Bt Santa Giulia',i:'🌹',c:'cVins',k:'drink',sv:'tous',pv:24.00,f:{vin_santa:1}},
{id:'btTariquet',n:'Bt Tariquet sec',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:22.00,f:{vin_tariq:1}},
{id:'btProsecco',n:'Bt Prosecco',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:26.00,f:{prosecco:1}},
{id:'btMoet',n:'Bt Moët Brut',i:'🍾',c:'cVins',k:'drink',sv:'soir',pv:80.00,f:{champ_moet:1}},
{id:'btVeuve',n:'Bt Veuve Clicquot',i:'🍾',c:'cVins',k:'drink',sv:'soir',pv:85.00,f:{champ_veuve:1}},
{id:'wawa25',n:'Wawa 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:3.60,f:{biere_wawa:.25}},
{id:'wawa50',n:'Wawa 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.80,f:{biere_wawa:.5}},
{id:'bete25',n:'La Bête 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:3.80,f:{biere_bete:.25}},
{id:'bete50',n:'La Bête 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:7.50,f:{biere_bete:.5}},
{id:'ipa25',n:'Eguzki IPA 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:4.20,f:{biere_ipa:.25}},
{id:'ipa50',n:'Eguzki IPA 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:8.00,f:{biere_ipa:.5}},
{id:'monaco25',n:'Monaco 25cl',i:'🍹',c:'cBieres',k:'drink',sv:'tous',pv:3.70,f:{biere_wawa:.24,sirops:2}},
{id:'piconB',n:'Picon bière 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:4.00,f:{biere_wawa:.22,triple:2}},
{id:'corona',n:'Corona',i:'🍾',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1,citron:.02}},
{id:'guinness',n:'Guinness',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1}},
{id:'desperados',n:'Desperados',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1}},
{id:'coca',n:'Coca Cola 33cl',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'cocaZero',n:'Coca Zero 33cl',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'orangina',n:'Orangina',i:'🍊',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'perrier33',n:'Perrier 33cl',i:'💧',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'redbullS',n:'Red Bull',i:'⚡',c:'cSofts',k:'drink',sv:'tous',pv:5.00,f:{redbull:1}},
{id:'diabolo',n:'Diabolo',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{sirops:3,soft_33:.6}},
{id:'jusPresse',n:'Jus pressé orange',i:'🍊',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{oranges:.35}},
{id:'jusFruit',n:'Jus de fruits',i:'🧃',c:'cSofts',k:'drink',sv:'tous',pv:3.80,f:{jus:25}},
{id:'theGlace',n:'Thé glacé maison',i:'🧊',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{sirops:3,citron:.04}},
{id:'sanPe50',n:'San Pellegrino 50cl',i:'💧',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{soft_33:1.2}},
{id:'fondantC',n:'Crème au chocolat',i:'🍫',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{choco:.05,creme:.08,oeuf:1}},
{id:'cheesecake',n:'Cheesecake',i:'🍰',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{creme:.11,oeuf:1,choco:.01}},
{id:'crumble',n:'Crumble aux fruits',i:'🥧',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{fruitrouge:.09,creme:.03}},
{id:'fraisofee',n:'Fraisofée',i:'🍓',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{fruitrouge:.08,creme:.07}},
{id:'cremeBrulee',n:'Crème brûlée',i:'🍮',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{creme:.1,oeuf:2}},
{id:'mousseChoco',n:'Mousse chocolat',i:'🍫',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{choco:.06,oeuf:1.5,creme:.04}},
{id:'cafeGourm',n:'Café gourmand',i:'☕',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{cafe:.009,choco:.02,creme:.04,glace:.05}},
{id:'glace2b',n:'Glace 2 boules',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:5.00,f:{glace:.12}},
{id:'glace3b',n:'Glace 3 boules',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{glace:.18}},
{id:'cafeLiegeois',n:'Café liégeois',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:9.00,f:{glace:.15,cafe:.008,creme:.05}},
{id:'crepeNut',n:'Crêpe Nutella',i:'🥞',c:'cDess',k:'food',sv:'tous',pv:4.00,f:{oeuf:.5,lait:.08,choco:.03}},
{id:'cafeExp',n:'Café',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:1.90,f:{cafe:.008}},
{id:'doubleCafe',n:'Double café',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:3.80,f:{cafe:.016}},
{id:'noisette',n:'Noisette',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:2.10,f:{cafe:.008,lait:.02}},
{id:'cafeCreme',n:'Café crème',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{cafe:.009,lait:.15}},
{id:'cappuccino',n:'Cappuccino',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{cafe:.009,lait:.14,creme:.02}},
{id:'latte',n:'Latte',i:'🥛',c:'cCafe',k:'drink',sv:'tous',pv:4.50,f:{cafe:.009,lait:.22}},
{id:'the',n:'Thé',i:'🍵',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{sirops:.5}},
{id:'chocoChaud',n:'Chocolat chaud',i:'🍫',c:'cCafe',k:'drink',sv:'tous',pv:4.20,f:{choco:.03,lait:.2}},
{id:'irishCoffee',n:'Irish Coffee',i:'🥃',c:'cCafe',k:'drink',sv:'soir',pv:11.00,f:{whisky_jd:4,cafe:.009,creme:.04}}];

const CATS=['cTapas','cPlats','cCock','cVins','cBieres','cSofts','cAlc','cDess','cCafe'];
const UNITES=['cl','ml','L','kg','g','u','btl','carton'];
const MOTIFS=[{id:'vente',i:'🧾',ap:'tous'},{id:'offClient',i:'🎁',ap:'tous'},{id:'offPart',i:'🤝',ap:'tous'},
{id:'offGroupe',i:'👥',ap:'tous'},{id:'casse',i:'💥',ap:'tous'},{id:'perso',i:'🍽️',ap:'food'},
{id:'rate',i:'🔥',ap:'food'},{id:'degus',i:'🥄',ap:'tous'},{id:'entame',i:'🍾',ap:'drink'},
{id:'annul',i:'↩️',ap:'tous'}];   /* rattachée automatiquement à la vente correspondante */
const TABLES=['T04','T12','T07','T21','T03','T15','T09','BAR','T18','T06','TERR 2','TERR 5'];
const POSTES=[{id:'admin',i:'⌘',n:'Administrateur',resp:true},{id:'gestion',i:'📊',n:'Gestion',resp:true},{id:'direction',i:'◈',n:'Direction',resp:true},
{id:'salle',i:'🧑‍💼',n:'Responsable de salle',resp:true},{id:'chef',i:'👨‍🍳',n:'Chef de cuisine',resp:true},
{id:'barman',i:'🍸',n:'Barman',resp:false},
{id:'serveur',i:'🙋',n:'Serveur',resp:false}];
/* Préférence d'affichage uniquement : cette liste ne porte aucun droit d'accès. */
const PROFILS_METIER=[
 {id:'barman',i:'🍸',n:'Barman'},
 {id:'chef',i:'👨‍🍳',n:'Chef de cuisine'},
 {id:'salle',i:'🧑‍💼',n:'Responsable de salle'},
 {id:'gestion',i:'📊',n:'Gestion'}
];
const PROFILS_METIER_IDS=PROFILS_METIER.map(function(p){return p.id});
/* Droits : les responsables voient tout. L'équipe voit Déclarer, Livraisons, Inventaire, Stock (sans prix). */
const DROITS_ONGLETS={admin:['*'],gestion:['*'],direction:['dash','bil','admin','stock','cmd','liv'],salle:['*'],chef:['*'],barman:['dash','dec','liv','stock','inv'],serveur:['dash','dec','liv','stock','inv']};
const estResp=()=>{const p=POSTES.find(x=>x.id===st.whoId);return p?!!p.resp:true};
const peutAccederOnglet=(id,role=st.whoId)=>{const droits=DROITS_ONGLETS[role]||DROITS_ONGLETS.serveur;return droits.includes('*')||droits.includes(id)};
/* Les quantités théoriques et écarts d'inventaire sont réservés à la direction et à la salle. */
const peutVoirEcartsInventaire=()=>['admin','gestion','salle'].includes(st.whoId);
const ONGLETS_RESP=['caisse','bil','admin'];

function administrationVierge(){return{
 version:1,documents:[],invoices:[],anomalies:[],auditLog:[],contracts:[],obligations:[],deadlines:[],emailMessages:[],
 approvalWorkflows:[],approvalRequests:[],expenseCategories:[],accountingCategories:[],cashFlowForecasts:[],
 settings:{taxRates:[5.5,10,20],contractAlertDays:[90,60,30,7],approvalRules:[],
  currentCashBalance:null,cashBalanceUpdatedAt:null,cashWarningThreshold:0,priceIncreaseAlertPercent:10,vatCollectedSource:null,
  mailInbox:{provider:'',address:'',status:'not_configured',autoImport:true,unreadOnly:true,lastSync:null,lastError:''},
  integrations:{ocr:'not_configured',emailInbox:'not_configured',accounting:'not_configured',banking:'not_configured',electronicInvoicing:'not_configured',supplierImport:'not_configured'}}
}}

let st={lang:'fr',who:'Responsable de salle',whoId:'salle',profilMetier:'',stock:{},mv:[],count:{},live:false,modeCaisse:'manuel',modePilote:false,
lastSync:Date.now(),svc:'soir',serviceActif:null,serviceHist:[],prods:null,carte:null,liv:[],invHist:[],inventory:null,photos:{},fournisseurs:[],commandes:[],commandeBrouillons:[],receptionBrouillons:[],legacyTransfers:[],meteo:{ville:'',cache:null},administration:administrationVierge()};
let panier={},panierMotifs={},motif=null,motifsSelectionnes=[],motifLigneEditee=null,motifsOuverts=false,cat='cCock',screen='dash',seenFeed=0,timer=null,sq='',stockTab='mat',fm=null;
let msgDec=null,forcerStock=false;   /* retours de validation sur l'écran Déclarer */
let cartePrix=false,prixEdit={},cartCat='tous';   /* édition groupée des prix de vente */
let livTab='recep',invTab='count',invZone='all',invOrderMode=false,draggedProductId=null,zoneOrderSaveTimer=null,
livForm=null,decPhoto=null,commandeFo='',commandeBrouillonActif=null,fournisseurForm=null,settingsTab='general',userForm=null,
adminTab='overview',adminFilters={search:'',supplier:'',status:'',type:''},adminPages={inbox:1,invoices:1,documents:1,contracts:1,compliance:1},adminRenderVersion=0;

const t=k=>(L[st.lang]&&L[st.lang][k])??L.fr[k]??'—';
const prod=id=>st.prods.find(p=>p.id===id);
const item=id=>st.carte.find(x=>x.id===id);
const fmt=n=>(Math.round(n*100)/100).toFixed(2).replace('.',',');
const fmtQ=n=>(Math.round(n*1000)/1000).toString().replace('.',',');
/* BEVERAGE_BOTTLE_CORE_START */
/* Les recettes peuvent être saisies dans une unité compatible ; le stock conserve l’unité du produit. */
const UNIT_BASE={ml:{f:'vol',n:1},cl:{f:'vol',n:10},L:{f:'vol',n:1000},g:{f:'mass',n:1},kg:{f:'mass',n:1000}};
function qteUnite(v,de,vers){const q=num(v),a=UNIT_BASE[de],b=UNIT_BASE[vers];return !a||!b||a.f!==b.f?q:q*a.n/b.n}
function unitesCompatibles(u){const a=UNIT_BASE[u];return a?UNITES.filter(x=>UNIT_BASE[x]&&UNIT_BASE[x].f===a.f):[u]}
function unitesFiche(c,p){return c&&c.k==='drink'&&p&&p.bottle?['cl','ml']:unitesCompatibles(p?.u||'')}
function uniteFiche(c,pid){const p=prod(pid);return(c&&c.fu&&c.fu[pid])||(c&&c.k==='drink'&&p&&p.bottle?(p.ctu||'cl'):(p?.u||''))}
function qteFicheEnStock(c,pid,q){
 const p=prod(pid),u=uniteFiche(c,pid);
 if(c&&c.k==='drink'&&p&&p.bottle&&(u==='cl'||u==='ml')){
  const contenuMl=qteUnite(p.ct,p.ctu||'cl','ml');
  return contenuMl>0?qteUnite(q,u,'ml')/contenuMl:0;
 }
 return qteUnite(q,u,p?.u||'');
}
function migrerUnitesBoissons(){
 let change=false;
 const utiliseEnBoisson=pid=>(st.carte||[]).some(c=>c.k==='drink'&&c.f&&c.f[pid]!==undefined);
 st.prods.forEach(p=>{
  if(p.bottleVersion===1)return;
  const ancienCl=p.u==='cl'&&num(p.ct)>0&&((p.z||'')==='bar'||(p.z||'')==='cave'||utiliseEnBoisson(p.id));
  const ancienneBouteille=p.u==='btl';
  if(!ancienCl&&!ancienneBouteille)return;
  p.bottle=true;p.bottleVersion=1;p.bottleRecipeLegacyUnit=ancienCl?'cl':'btl';
  p.ct=num(p.ct)||(ancienneBouteille?75:0);p.ctu=p.ctu||'cl';p.pc=num(p.pc)||num(p.px);
  if(ancienCl){
   const contenance=num(p.ct)||1;
   p.s=num(p.s)/contenance;p.seuil=num(p.seuil)/contenance;
   if(Object.prototype.hasOwnProperty.call(st.stock,p.id))st.stock[p.id]=num(st.stock[p.id])/contenance;
   if(Object.prototype.hasOwnProperty.call(st.count,p.id)&&st.count[p.id]!==''&&st.count[p.id]!==undefined)st.count[p.id]=num(st.count[p.id])/contenance;
  }
  p.u='btl';p.px=p.pc;change=true;
 });
 st.carte.forEach(c=>{
  if(c.k!=='drink'||c.beverageUnitsVersion===1)return;
  c.fu=c.fu||{};
  Object.keys(c.f||{}).forEach(pid=>{
   const p=prod(pid);if(!p||!p.bottle)return;
   const explicite=c.fu[pid],uniteVolume=explicite==='ml'||p.ctu==='ml'?'ml':'cl';
   if(explicite==='btl'||(!explicite&&p.bottleRecipeLegacyUnit==='btl')){
    c.f[pid]=num(c.f[pid])*qteUnite(p.ct,p.ctu||'cl',uniteVolume);
   }
   c.fu[pid]=explicite==='cl'||explicite==='ml'?explicite:uniteVolume;
  });
  c.beverageUnitsVersion=1;change=true;
 });
 return change;
}
/* BEVERAGE_BOTTLE_CORE_END */
const uid=p=>p+'_'+Math.random().toString(36).slice(2,8);
const rolesValides=roles=>[...new Set((Array.isArray(roles)?roles:[]).filter(id=>POSTES.some(p=>p.id===id)))];
const rolesUtilisateur=u=>{const roles=rolesValides(u&&u.roles);return roles.length?roles:rolesValides([u&&u.role||'gestion'])};
const rolePrincipalUtilisateur=u=>{const roles=rolesUtilisateur(u);return roles.includes(u&&u.role)?u.role:roles[0]||'gestion'};
const estAdministrateurUtilisateur=u=>rolesUtilisateur(u).includes('admin');
const utilisateurConnecte=()=>session&&session.email&&auth.users?auth.users[session.email]:null;
const peutGererRoles=()=>estAdministrateurUtilisateur(utilisateurConnecte());
const rolesTemporairesDisponibles=()=>{const u=utilisateurConnecte(),roles=rolesUtilisateur(u);if(roles.includes('admin'))return POSTES.map(p=>p.id);if(roles.includes('gestion'))return [...new Set([...roles,'barman','serveur'])];return roles};

/* ═════════════════════════════════════════════
   COMPTES & ÉTABLISSEMENTS
   Les données de chaque établissement sont
   stockées sous une clé distincte : invo_data_<etabId>
   ═════════════════════════════════════════════ */
const AUTH_KEY='invo_auth_v1', SESS_KEY='invo_sess_v1';
let auth={users:{}}, session=null, authVue='login', authMsg=null, authCode=null;
let authMode='online';

const dataKey=()=>session&&session.supabase&&session.etabId?'sway_data_'+session.etabId:'invo_v5';
const loadAuth=async()=>{
 auth=(await Store.get(AUTH_KEY))||{users:{}};session=await Store.get(SESS_KEY);
 if(!auth.users||typeof auth.users!=='object')auth.users={};
 const service=window.SwaySupabaseAuth;
 if(service&&service.available&&service.available()){
  authMode='online';
  try{
   const remote=await service.identity();
   if(remote){
    auth={users:{[remote.email]:remote}};
    session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,userId:remote.userId};
    return;
   }
  }catch(error){console.warn('Session Sway indisponible :',error)}
 }else authMode='local';
 let changed=false;
 Object.values(auth.users).forEach(u=>{
 const roles=rolesUtilisateur(u);if(!Array.isArray(u.roles)||u.roles.join('|')!==roles.join('|')){u.roles=roles;changed=true}
 if(!u.role||!roles.includes(u.role)){u.role=roles[0]||'gestion';changed=true}
 if(u.profilMetier&&!PROFILS_METIER_IDS.includes(u.profilMetier)){u.profilMetier='';changed=true}
  if(!u.recapMatin||typeof u.recapMatin!=='object'){u.recapMatin={actif:true,heure:'08:00'};changed=true}
 if(!u.statut){u.statut=u.hash?'actif':'invite';changed=true}
  if(!u.cree){u.cree=Date.now();changed=true}
 });
 const utilisateurs=Object.values(auth.users);if(utilisateurs.length&&!utilisateurs.some(estAdministrateurUtilisateur)){
  const candidat=(session&&session.email&&auth.users[session.email])||utilisateurs.slice().sort((a,b)=>Number(a.cree||0)-Number(b.cree||0))[0];
  candidat.roles=[...new Set(['admin',...rolesUtilisateur(candidat)])];candidat.role='admin';changed=true;
 }
 if(changed)await saveAuth();
};
const saveAuth=()=>Store.set(AUTH_KEY,auth);
const saveSess=()=>Store.set(SESS_KEY,session);
const normMail=e=>(e||'').trim().toLowerCase();
const rnd=n=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';
for(let i=0;i<n;i++)s+=A[Math.floor(Math.random()*A.length)];return s};

/* Hachage du mot de passe.
   PBKDF2 via Web Crypto quand le contexte est sécurisé (https).
   Repli simple sinon (ouverture en fichier local) — signalé à l'utilisateur. */
let hashFaible=false;
async function hashPwd(pwd,salt){
 try{
  if(window.crypto&&crypto.subtle&&window.isSecureContext){
   const enc=new TextEncoder();
   const k=await crypto.subtle.importKey('raw',enc.encode(pwd),'PBKDF2',false,['deriveBits']);
   const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:120000,hash:'SHA-256'},k,256);
   return 'pbkdf2:'+btoa(String.fromCharCode.apply(null,new Uint8Array(b)));
  }
 }catch(e){}
 hashFaible=true;
 let x=0;const s=pwd+'|'+salt;
 for(let i=0;i<s.length;i++){x=((x<<5)-x)+s.charCodeAt(i);x|=0}
 return 'simple:'+Math.abs(x).toString(36);
}

function stVierge(){return{lang:st?st.lang:'fr',who:'Responsable de salle',whoId:'salle',profilMetier:st&&PROFILS_METIER_IDS.includes(st.profilMetier)?st.profilMetier:'',
stock:{},mv:[],count:{},live:false,modeCaisse:'manuel',modePilote:false,lastSync:Date.now(),svc:'soir',prods:null,carte:null,
liv:[],invHist:[],inventory:null,photos:{},fournisseurs:[],commandes:[],legacyTransfers:[],doseurs:{actif:false,releves:{}},administration:administrationVierge()}}

/* ── Création de compte ── */
async function creerCompte(nom,mail,etab,pwd,pwd2){
 mail=normMail(mail);
 if(!nom.trim()||!mail||!etab.trim()||!pwd)return{e:t('aChamps')};
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return{e:t('aMailInvalide')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 if(auth.users[mail])return{e:t('aDejaPris')};
 const salt=rnd(16), code=rnd(4)+'-'+rnd(4), etabId=uid('etab');
 auth.users[mail]={mail,nom:nom.trim(),etabId,etabNom:etab.trim(),profilMetier:'',recapMatin:{actif:true,heure:'08:00'},
  salt,hash:await hashPwd(pwd,salt),codeHash:await hashPwd(code,salt),cree:Date.now(),role:'admin',roles:['admin','gestion'],statut:'actif'};
 await saveAuth();
 session={email:mail,etabId};await saveSess();
 /* Reprise éventuelle des données de la version précédente (sans compte) */
 const ancien=await Store.get('invo_v5');
 if(ancien&&!(await Store.get(dataKey())))await Store.set(dataKey(),ancien);
 return{ok:true,code};
}

/* ── Connexion ── */
async function connecter(mail,pwd){
 mail=normMail(mail);
 const u=auth.users[mail];
 if(!u)return{e:t('aIntrouvable')};
 if(await hashPwd(pwd,u.salt)!==u.hash)return{e:t('aMauvaisPwd')};
 u.derniereActivite=Date.now();u.statut='actif';await saveAuth();
 session={email:mail,etabId:u.etabId};await saveSess();
 return{ok:true};
}

async function connecterEnLigne(mail,pwd){
 const service=window.SwaySupabaseAuth;
 const result=await service.signin({email:normMail(mail),password:pwd});
 if(result.error)return{e:result.error};
 const remote=await service.identity();
 if(!remote)return{e:'Connexion confirmée, mais la session n’est pas encore disponible. Réessayez.'};
 auth={users:{[remote.email]:remote}};
 session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,userId:remote.userId};
 return remote.needsWorkspace?{workspace:true}:{ok:true};
}

async function creerCompteEnLigne(nom,mail,etab,pwd,pwd2){
 mail=normMail(mail);
 if(!nom.trim()||!mail||!etab.trim()||!pwd)return{e:t('aChamps')};
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return{e:t('aMailInvalide')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 const result=await window.SwaySupabaseAuth.signup({fullName:nom.trim(),email:mail,organizationName:etab.trim(),establishmentName:etab.trim(),password:pwd});
 if(result.error)return{e:result.error};
 if(result.confirmation)return{confirmation:true};
 const remote=await window.SwaySupabaseAuth.identity();
 if(remote){auth={users:{[remote.email]:remote}};session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,userId:remote.userId};}
 return remote&&remote.needsWorkspace?{workspace:true}:{ok:true};
}

async function envoyerLienReinitialisation(mail){
 mail=normMail(mail);
 if(!mail)return{e:t('aMailInvalide')};
 const result=await window.SwaySupabaseAuth.reset(mail);
 return result.error?{e:result.error}:{ok:true};
}

async function definirNouveauMotDePasse(pwd,pwd2){
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 const result=await window.SwaySupabaseAuth.updatePassword(pwd);
 return result.error?{e:result.error}:{ok:true};
}

async function creerEspaceEnLigne(nom,etab){
 if(!nom.trim()||!etab.trim())return{e:t('aChamps')};
 const result=await window.SwaySupabaseAuth.finalizeWorkspace({fullName:nom.trim(),organizationName:etab.trim(),establishmentName:etab.trim()});
 if(result.error)return{e:result.error};
 const remote=await window.SwaySupabaseAuth.identity();
 if(!remote||remote.needsWorkspace)return{e:'Votre espace n’a pas encore été créé. Réessayez.'};
 auth={users:{[remote.email]:remote}};
 session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:false,userId:remote.userId};
 return{ok:true};
}

/* ── Réinitialisation par code de secours ── */
async function reinit(mail,code,pwd,pwd2){
 mail=normMail(mail);
 const u=auth.users[mail];
 if(!u)return{e:t('aIntrouvable')};
 if(await hashPwd((code||'').trim().toUpperCase(),u.salt)!==u.codeHash)return{e:t('aCodeFaux')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 u.hash=await hashPwd(pwd,u.salt);await saveAuth();
 return{ok:true};
}

async function deconnecter(){
 if(timer)clearInterval(timer);
 if(session&&session.supabase&&window.SwaySupabaseAuth)await window.SwaySupabaseAuth.signout();
 session=null;await Store.set(SESS_KEY,null);
 st=stVierge();panier={};panierMotifs={};motif=null;motifsSelectionnes=[];screen='caisse';
 closeModal();showAuth('login');
}

/* ── Écran de connexion ── */
function showAuth(vue,msg){
 authVue=vue;authMsg=msg||null;
 document.body.classList.add('locked');
 document.getElementById('auth').classList.add('on');
 dessineAuth();
}

function dessineAuth(){
 if(authVue==='login'&&window.SwaySupabaseAuth&&window.SwaySupabaseAuth.isRecovery&&window.SwaySupabaseAuth.isRecovery())authVue='new-password';
 const logo=document.querySelector('.logo-img')?.outerHTML||'';
 const compte=session&&session.email&&auth.users?auth.users[session.email]:null;
 const etablissement=String((compte&&compte.etabNom)||st.etabNom||'Votre établissement').trim()||'Votre établissement';
 const accueil=authVue==='login'?`<div class="auth-welcome"><span>Bienvenue</span><b>${escapeHTML(etablissement)}</b></div>`:'';
 const msg=authMsg?`<div class="auth-msg ${authMsg.type}">${authMsg.txt}</div>`:'';
 let corps='';
 if(authVue==='login'){
  corps=`<div class="auth-h">${t('aConnexion')}</div>
  <div class="auth-s">${t('aConnexionS')}</div>${msg}
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" autocomplete="username" placeholder="thomas@restaurant.fr"></div>
  <div class="fld"><label>${t('aPwd')}</label><input id="aP" type="password" autocomplete="current-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">${t('aSeConnecter')}</button>
  <button class="auth-link" id="aOubli">${t('aOubli')}</button>
  <div class="auth-sep">${t('aOu')}</div>
  <button class="btn btn-2" id="aVersCreer">${t('aCreerCompte')}</button>${authMode==='online'?'<p class="auth-note">Connexion sécurisée par Sway. Votre mot de passe n’est jamais stocké dans l’application.</p>':'<button class="auth-link" id="aVersOnline">Utiliser la connexion Sway sécurisée</button>'}`;
 }else if(authVue==='signup'){
  corps=`<div class="auth-h">${t('aCreerCompte')}</div>
  <div class="auth-s">${t('aCreerS')}</div>${msg}
  <div class="fld"><label>${t('aNom')}</label><input id="aN" placeholder="Thomas Martin"></div>
  <div class="fld"><label>${t('aEtab')}</label><input id="aE" placeholder="SP Wallace"></div>
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" autocomplete="username" placeholder="thomas@restaurant.fr"></div>
  <div class="fld"><label>${t('aPwd')}</label><input id="aP" type="password" autocomplete="new-password" placeholder="8 caractères minimum"></div>
  <div class="fld"><label>${t('aPwd2')}</label><input id="aP2" type="password" autocomplete="new-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">${t('aCreer')}</button>
  <button class="auth-link" id="aVersLogin">${t('aDejaCompte')}</button>`;
 }else if(authVue==='workspace'){
  corps=`<div class="auth-h">Créez votre espace</div>
  <div class="auth-s">Votre adresse e-mail est confirmée. Donnez un nom à votre premier établissement.</div>${msg}
  <div class="fld"><label>${t('aNom')}</label><input id="aN" autocomplete="name" placeholder="Thomas Martin"></div>
  <div class="fld"><label>${t('aEtab')}</label><input id="aE" placeholder="Le Wallace Paris"></div>
  <button class="btn" id="aGo">Créer mon espace</button>`;
 }else if(authVue==='new-password'){
  corps=`<div class="auth-h">Nouveau mot de passe</div>
  <div class="auth-s">Choisissez un nouveau mot de passe sécurisé.</div>${msg}
  <div class="fld"><label>${t('aNouveauPwd')}</label><input id="aP" type="password" autocomplete="new-password" placeholder="8 caractères minimum"></div>
  <div class="fld"><label>${t('aPwd2')}</label><input id="aP2" type="password" autocomplete="new-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">Enregistrer le mot de passe</button>`;
 }else if(authVue==='code'){
  corps=`<div class="auth-h">${t('aCodeTitre')}</div>
  <div class="auth-s">${t('aCodeS')}</div>
  <div class="code-box"><div class="code-val">${authCode}</div>
  <div class="code-lab">${t('aCodeNote')}</div></div>
  <button class="btn" id="aEntrer">${t('aEntrer')}</button>`;
 }else{
  corps=`<div class="auth-h">${t('aOubliTitre')}</div>
  <div class="auth-s">${t('aOubliS')}</div>${msg}
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" placeholder="thomas@restaurant.fr"></div>
  ${authMode==='online'?'':'<div class="fld"><label>'+t('aCode')+'</label><input id="aC" placeholder="XXXX-XXXX" style="text-transform:uppercase"></div><div class="fld"><label>'+t('aNouveauPwd')+'</label><input id="aP" type="password" placeholder="8 caractères minimum"></div><div class="fld"><label>'+t('aPwd2')+'</label><input id="aP2" type="password" placeholder="••••••••"></div>'}
  <button class="btn" id="aGo">${authMode==='online'?'Envoyer le lien sécurisé':t('aReinit')}</button>
  <button class="auth-link" id="aVersLogin">${t('aRetourConnexion')}</button>`;
 }
 document.getElementById('auth').innerHTML=`<div class="auth-box">
 <div class="auth-brand"><div class="auth-logo">${logo}</div><div class="auth-venue">${escapeHTML(etablissement)}</div></div>
 ${accueil}<div class="auth-slogan">${t('slogan')}</div>${corps}</div>`;

 const V=id=>{const e=document.getElementById(id);return e?e.value:''};
 const go=document.getElementById('aGo');
 const lien=(id,vue)=>{const e=document.getElementById(id);if(e)e.onclick=()=>showAuth(vue)};
 lien('aVersCreer','signup');lien('aVersLogin','login');lien('aOubli','reset');
 const online=document.getElementById('aVersOnline');if(online)online.onclick=()=>{authMode='online';showAuth('login')};

 if(authVue==='login'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await connecterEnLigne(V('aM'),V('aP')):await connecter(V('aM'),V('aP'));go.disabled=false;
  if(r.e)showAuth('login',{type:'err',txt:r.e});else if(r.workspace)showAuth('workspace');else{document.getElementById('auth').classList.remove('on');await bootApp()}};
 if(authVue==='signup'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await creerCompteEnLigne(V('aN'),V('aM'),V('aE'),V('aP'),V('aP2')):await creerCompte(V('aN'),V('aM'),V('aE'),V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('signup',{type:'err',txt:r.e});else if(r.confirmation)showAuth('login',{type:'ok',txt:'Compte créé. Vérifiez votre e-mail, puis connectez-vous pour créer votre espace.'});else if(r.workspace)showAuth('workspace');else if(authMode==='online'){document.getElementById('auth').classList.remove('on');await bootApp()}else{authCode=r.code;showAuth('code')}};
 if(authVue==='reset'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await envoyerLienReinitialisation(V('aM')):await reinit(V('aM'),V('aC'),V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('reset',{type:'err',txt:r.e});
  else showAuth('login',{type:'ok',txt:authMode==='online'?'Si cette adresse est enregistrée, un lien sécurisé vient d’être envoyé.':t('aReinitOk')})};
 if(authVue==='new-password'&&go)go.onclick=async()=>{
  go.disabled=true;const r=await definirNouveauMotDePasse(V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('new-password',{type:'err',txt:r.e});else showAuth('login',{type:'ok',txt:'Mot de passe mis à jour. Vous pouvez vous connecter.'})};
 if(authVue==='workspace'&&go)go.onclick=async()=>{
  go.disabled=true;const r=await creerEspaceEnLigne(V('aN'),V('aE'));go.disabled=false;
  if(r.e)showAuth('workspace',{type:'err',txt:r.e});else{document.getElementById('auth').classList.remove('on');await bootApp()}};
 const ent=document.getElementById('aEntrer');
 if(ent)ent.onclick=async()=>{document.getElementById('auth').classList.remove('on');await bootApp()};
}

async function load(){const s=await Store.get(dataKey());if(s)st=Object.assign(st,s);
/* Fin du flux fictif : INVO démarre désormais toujours en caisse manuelle. */
if(!s||s.modeCaisse!=='manuel'){st.modeCaisse='manuel';st.live=false;}
/* Aucun flux fictif ne peut survivre hors du parcours de démonstration explicite. */
if(!st.demoParcours)st.live=false;
if(!st.doseurs)st.doseurs={actif:false,releves:{}};
if(!st.meteo||typeof st.meteo!=='object')st.meteo={ville:'',cache:null};
if(!st.liv)st.liv=[];if(!st.invHist)st.invHist=[];if(!st.photos)st.photos={};
if(!Array.isArray(st.fournisseurs))st.fournisseurs=[];
if(!Array.isArray(st.commandes))st.commandes=[];
if(!Array.isArray(st.commandeBrouillons))st.commandeBrouillons=[];
if(!Array.isArray(st.receptionBrouillons))st.receptionBrouillons=[];
if(!Array.isArray(st.legacyTransfers))st.legacyTransfers=[];
if(!st.administration||typeof st.administration!=='object')st.administration=administrationVierge();
else{
 const a=administrationVierge();
 Object.keys(a).forEach(function(k){if(st.administration[k]===undefined)st.administration[k]=a[k]});
 if(!st.administration.settings||typeof st.administration.settings!=='object')st.administration.settings=a.settings;
 Object.keys(a.settings).forEach(function(k){if(st.administration.settings[k]===undefined)st.administration.settings[k]=a.settings[k]});
 Object.keys(a.settings.integrations).forEach(function(k){if(st.administration.settings.integrations[k]===undefined)st.administration.settings.integrations[k]=a.settings.integrations[k]});
}
if(!st.docs)st.docs={};          /* documents scannés (bons de livraison) */
if(!st.refFo)st.refFo={};        /* mémoire : référence fournisseur -> produit Invo */
if(!st.brouillons)st.brouillons=[];
if(!st.serviceActif||typeof st.serviceActif!=='object')st.serviceActif=null;
if(!Array.isArray(st.serviceHist))st.serviceHist=[];
if(st.modePilote===undefined)st.modePilote=false;
if(!Array.isArray(st.prods))st.prods=st.modePilote?[]:JSON.parse(JSON.stringify(PRODUITS_DEF));
else if(!st.prods.length&&!st.modePilote)st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
let ordreMigre=false;
st.prods.forEach(p=>{if(!p.z){p.z='reserve';ordreMigre=true}if(!p.fo)p.fo='Divers';
 if(p.dlc===undefined){const d=PRODUITS_DEF.find(x=>x.id===p.id);
  p.dlc=d?d.dlc:((p.u==='cl'||p.u==='btl')?0:7)}});
ZONES_L.forEach(z=>{
 const produits=st.prods.map((p,index)=>({p,index})).filter(x=>(x.p.z||'reserve')===z)
  .sort((a,b)=>{
   const ao=Number(a.p.displayOrder),bo=Number(b.p.displayOrder),av=Number.isFinite(ao),bv=Number.isFinite(bo);
   return av&&bv?ao-bo:(av?-1:(bv?1:a.index-b.index))});
 produits.forEach((x,index)=>{if(x.p.displayOrder!==index){x.p.displayOrder=index;ordreMigre=true}});
});
if(!Array.isArray(st.carte))st.carte=st.modePilote?[]:JSON.parse(JSON.stringify(CARTE_DEF));
else if(!st.carte.length&&!st.modePilote)st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
if(migrerUnitesBoissons())ordreMigre=true;
if(migrationInventaireEmplacements())ordreMigre=true;
if(!Object.keys(st.stock).length)st.prods.forEach(p=>st.stock[p.id]=p.s);
assurerFournisseurs();
if(ordreMigre)await Store.set(dataKey(),st)}
const save=()=>Store.set(dataKey(),st);
/* ── Sauvegarde locale : aucun envoi réseau, uniquement un fichier INVO. ── */
const BACKUP_MAX=120*1024*1024;
const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function dlJson(data,name){
 const blob=new Blob([JSON.stringify(data)],{type:'application/json;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function nomSauvegarde(suffix=''){
 return 'invo-sauvegarde'+suffix+'_'+new Date().toISOString().slice(0,10)+'.json';
}
async function creerSauvegarde(){
 const documents={}, ids=new Set(Object.keys(st.docs||{}));
 (st.liv||[]).forEach(l=>(l.docs||[]).forEach(k=>ids.add(k)));
 ((st.administration&&st.administration.documents)||[]).forEach(function(d){if(d.fileKey)ids.add(d.fileKey)});
 for(const k of ids){
  const v=Docs.get(k)||await Docs.getAsync(k);
  if(typeof v==='string'&&(v.startsWith('data:image/')||v.startsWith('data:application/pdf')))documents[k]=v;
 }
 return {format:'invo-backup',version:1,exportedAt:new Date().toISOString(),
  data:JSON.parse(JSON.stringify(st)),documents};
}
async function exporterSauvegarde(){
 const pack=await creerSauvegarde();dlJson(pack,nomSauvegarde());return pack;
}
function lireTexteFichier(f){
 return new Promise((res,rej)=>{const r=new FileReader();
  r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(r.error||new Error('lecture'));
  r.readAsText(f,'utf-8');});
}
function backupValide(pack){
 const d=pack&&pack.data;
 return obj(pack)&&pack.format==='invo-backup'&&pack.version===1&&obj(d)&&
  Array.isArray(d.prods)&&Array.isArray(d.carte)&&obj(d.stock)&&Array.isArray(d.mv);
}

/* ── Passage volontaire de la démonstration à une base pilote vide. ── */
async function preparerTestReel(){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('pilotConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-pilote'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;
 st.modePilote=true;st.prods=[];st.carte=[];st.stock={};
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='stock';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();toast(t('pilotReady'));
}


/* ── Retour volontaire à la démonstration, toujours précédé d'une sauvegarde. ── */
async function resetDemo(){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('resetConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-reset'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId,svc=st.svc;
 const doseurs=st.doseurs?JSON.parse(JSON.stringify(st.doseurs)):undefined;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;st.svc=svc;
 if(doseurs)st.doseurs=doseurs;
 st.modePilote=false;st.demoParcours=false;
 st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
 st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
 st.prods.forEach(p=>st.stock[p.id]=p.s);
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='caisse';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();toast(t('cleared'));
}

/* Parcours entièrement fictif : il sert à vérifier les connexions commande,
   réception et caisse sans présenter ces données comme celles d'un restaurant. */
async function chargerParcoursDemonstration(fluxAutomatique){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('pilotDemoConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-demo'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId,svc=st.svc;
 const doseurs=st.doseurs?JSON.parse(JSON.stringify(st.doseurs)):undefined;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;st.svc=svc;
 if(doseurs)st.doseurs=doseurs;
 st.modePilote=false;st.demoParcours=true;st.live=!!fluxAutomatique;
 st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
 st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
 st.prods.forEach(p=>st.stock[p.id]=p.s);
 /* Le stock ci-dessous est l'état actuel fictif après une première réception. */
 st.stock.soft_33=55;st.stock.redbull=20;
 assurerFournisseurs();
 const commandeId='demo_cmd_reception';
 const maintenant=new Date(),hier=new Date(maintenant.getTime()-86400000);
 const dateLiv=maintenant.toISOString().slice(0,10);
 st.commandes=[{id:commandeId,fournisseur:'France Boissons',dateLiv:dateLiv,
  cree:hier.toISOString(),statut:'partielle',
  lines:[{id:'soft_33',q:80,px:.72},{id:'redbull',q:36,px:1.30}]}];
 st.liv=[{id:'demo_liv_partielle',fo:'France Boissons',ts:hier.toISOString(),
  lines:[{id:'soft_33',q:30,px:.72},{id:'redbull',q:12,px:1.30}],
  total:37.20,commandeId:commandeId,src:'demo'}];
 const venteLibre=creerMouvement({id:'demo_vente_a_verifier',src:'demo',motif:'vente',plat:'spritzAp',qty:2,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 const venteOfferte=creerMouvement({id:'demo_vente_offerte',src:'demo',motif:'vente',plat:'wallaceBurger',qty:1,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 if(venteOfferte.ok)creerMouvement({id:'demo_offert',src:'demo',motif:'offClient',plat:'wallaceBurger',qty:1,parent:venteOfferte.mv.id,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 const venteAnnulee=creerMouvement({id:'demo_vente_annulee',src:'demo',motif:'vente',plat:'vAbsolut',qty:1,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 if(venteAnnulee.ok)creerMouvement({id:'demo_annulation',src:'demo',motif:'annul',plat:'vAbsolut',qty:1,parent:venteAnnulee.mv.id,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='dash';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();startFeed();
 if(st.live)setTimeout(posEvent,900);
 toast(st.live?'Démo caisse lancée : données de test uniquement.':t('pilotDemoReady'));
}

async function importerSauvegarde(f){
 if(!f)return;
 if(f.size>BACKUP_MAX){toast(t('backupTooBig'));return}
 let pack;
 try{pack=JSON.parse(await lireTexteFichier(f))}catch(e){toast(t('backupRead'));return}
 if(!backupValide(pack)){toast(t('backupFormat'));return}
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('backupConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-restauration'));
 st=Object.assign(stVierge(),pack.data);
 st.modeCaisse='manuel';st.live=false;st.docs=st.docs||{};
 Docs._cache={};
 await Docs.restaurer(pack.documents||{});
 await save();
 panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;_pvCache=null;_pvCle='';
 closeModal();renderAll();toast(t('backupRestored'));
}

/* ── Transfert depuis un ancien logiciel ────────────────────────────────
   Le fichier reste dans le navigateur. Aucun stock ni donnée INVO n'est
   modifié avant la validation finale et explicite de la personne connectée. */
const TRANSFERT_ANCIEN_TYPES={
 produits:{label:'Produits',description:'Noms, unités, catégories, fournisseurs et seuils.',champs:{nom:{label:'Nom du produit',obligatoire:true,alias:['nom','produit','article','désignation','designation','libellé','libelle','name']},unite:{label:'Unité',obligatoire:true,alias:['unité','unite','uom','unit','conditionnement']},categorie:{label:'Catégorie',alias:['catégorie','categorie','famille','rayon']},fournisseur:{label:'Fournisseur',alias:['fournisseur','supplier','marque']},prix:{label:'Prix d’achat',alias:['prix','prix achat','prix d achat','pa','cout','coût','cost']},seuil:{label:'Seuil d’alerte',alias:['seuil','stock minimum','stock mini','min']},stock:{label:'Quantité en stock',alias:['stock','quantité','quantite','qte','qty']},emplacement:{label:'Emplacement',alias:['emplacement','zone','lieu','location']}}},
 fournisseurs:{label:'Fournisseurs',description:'Noms et coordonnées fournisseurs.',champs:{nom:{label:'Nom du fournisseur',obligatoire:true,alias:['nom','fournisseur','supplier','raison sociale','entreprise','name']},email:{label:'E-mail',alias:['email','e-mail','mail','courriel']}}},
 stocks:{label:'Stocks',description:'Quantités à rapprocher de produits déjà présents dans INVO.',champs:{produit:{label:'Produit INVO',obligatoire:true,alias:['produit','article','nom','désignation','designation','libellé','libelle','product']},quantite:{label:'Quantité comptée',obligatoire:true,alias:['quantité','quantite','qte','qty','stock','niveau']},emplacement:{label:'Emplacement',alias:['emplacement','zone','lieu','location']}}},
 commandes:{label:'Commandes',description:'Archive préparée pour une reprise contrôlée.',champs:{reference:{label:'Référence',obligatoire:true,alias:['référence','reference','commande','numéro','numero','id']},date:{label:'Date',alias:['date','créé le','cree le','created at']},commentaire:{label:'Note',alias:['note','commentaire','comment','remarque']}}},
 livraisons:{label:'Livraisons',description:'Archive préparée pour un rapprochement avec les commandes.',champs:{reference:{label:'Référence',obligatoire:true,alias:['référence','reference','livraison','bon','numéro','numero','id']},date:{label:'Date',alias:['date','reçu le','recu le','received at']},commentaire:{label:'Note',alias:['note','commentaire','comment','remarque']}}},
 fiches:{label:'Fiches techniques',description:'Archive à reprendre dans les fiches techniques INVO.',champs:{reference:{label:'Nom ou référence',obligatoire:true,alias:['nom','référence','reference','fiche','recette','produit','name']},commentaire:{label:'Note',alias:['note','commentaire','comment','description']}}},
 historique:{label:'Historique',description:'Archive à contrôler avant toute reprise dans le journal INVO.',champs:{reference:{label:'Action ou référence',obligatoire:true,alias:['action','référence','reference','libellé','libelle','description']},date:{label:'Date',alias:['date','date heure','timestamp','created at']},commentaire:{label:'Commentaire',alias:['note','commentaire','comment','motif']}}},
 utilisateurs:{label:'Utilisateurs',description:'Archive à vérifier : les accès et mots de passe ne sont jamais importés.',champs:{reference:{label:'Nom ou e-mail',obligatoire:true,alias:['nom','email','e-mail','mail','utilisateur','user','name']},commentaire:{label:'Rôle ou note',alias:['rôle','role','note','commentaire','comment']}}}
};
let transfertAncienForm=null;
function normaliserCleTransfert(v){return String(v??'').trim().toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function defTransfertAncien(type){return TRANSFERT_ANCIEN_TYPES[type]||TRANSFERT_ANCIEN_TYPES.produits}
function valeursTransfertAncien(){return Object.keys(TRANSFERT_ANCIEN_TYPES)}
function valeurTransfertAncien(row,mapping,champ){const col=mapping&&mapping[champ];return col?String(row&&row[col]!==undefined?row[col]:'').trim():''}
function uniteImportee(v){
 const n=normaliserCleTransfert(v),aliases={bouteille:'btl',bouteilles:'btl',btl:'btl',unite:'u',unites:'u',piece:'u',pieces:'u',litre:'L',litres:'L',l:'L',centilitre:'cl',centilitres:'cl',cl:'cl',millilitre:'ml',millilitres:'ml',ml:'ml',kilogramme:'kg',kilogrammes:'kg',kg:'kg',gramme:'g',grammes:'g',g:'g',carton:'carton',cartons:'carton'};
 return aliases[n]||UNITES.find(function(u){return normaliserCleTransfert(u)===n})||'';
}
function emplacementImporte(v){
 const cle=normaliserCleTransfert(v),locations=(st.inventory&&Array.isArray(st.inventory.locations)?st.inventory.locations:INV_EMPLACEMENTS_DEFAUT||[]);
 const trouve=locations.find(function(l){return normaliserCleTransfert(l.id)===cle||normaliserCleTransfert(l.n)===cle});
 return trouve?trouve.id:'';
}
function categorieImportee(v){const cle=normaliserCleTransfert(v),trouve=(INV_CATEGORIES||[]).find(function(c){return normaliserCleTransfert(c.id)===cle||normaliserCleTransfert(c.n)===cle});return trouve?trouve.id:''}
function nombreTransfere(v){
 let s=String(v??'').trim().replace(/\s/g,'');
 if(!s)return{vide:true,valeur:null};
 if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');
 if(!/^-?\d+(\.\d+)?$/.test(s))return{vide:false,invalide:true,valeur:null};
 const valeur=Number(s);return Number.isFinite(valeur)?{vide:false,valeur:valeur}:{vide:false,invalide:true,valeur:null};
}
function parserCsvTransfert(text){
 const premiereLigne=String(text).split(/\r?\n/).find(function(ligne){return ligne.trim()!==''})||'';
 const separateur=(premiereLigne.match(/;/g)||[]).length>=(premiereLigne.match(/,/g)||[]).length?';':',';
 const lignes=[[]];let cellule='',entreGuillemets=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],suivant=text[i+1];
  if(c==='"'&&entreGuillemets&&suivant==='"'){cellule+='"';i++;continue}
  if(c==='"'){entreGuillemets=!entreGuillemets;continue}
  if(c===separateur){lignes[lignes.length-1].push(cellule.trim());cellule='';continue}
  if(c==='\n'||c==='\r'){if(c==='\r'&&suivant==='\n')i++;lignes[lignes.length-1].push(cellule.trim());cellule='';lignes.push([]);continue}
  cellule+=c;
 }
 lignes[lignes.length-1].push(cellule.trim());
 const utiles=lignes.filter(function(l){return l.some(function(x){return String(x).trim()!==''})});
 if(utiles.length<2)throw new Error('Le fichier doit contenir une ligne de titres et au moins une ligne de données.');
 const vus={},headers=utiles[0].map(function(v,index){let nom=String(v||'Colonne '+(index+1)).replace(/^\uFEFF/,'').trim()||'Colonne '+(index+1);const base=nom;let n=2;while(vus[nom])nom=base+' ('+(n++)+')';vus[nom]=true;return nom});
 return{headers:headers,lignes:utiles.slice(1).map(function(cells){const row={};headers.forEach(function(h,index){row[h]=cells[index]===undefined?'':cells[index]});return row})};
}
function parserJsonTransfert(text){
 let source=JSON.parse(text);
 if(!Array.isArray(source)&&source&&typeof source==='object')source=source.data||source.rows||source.items||Object.values(source).find(Array.isArray);
 if(!Array.isArray(source)||!source.length)throw new Error('Le JSON doit contenir une liste de données.');
 const lignes=source.map(function(row){return row&&typeof row==='object'&&!Array.isArray(row)?row:{valeur:row}});
 const headers=[];lignes.forEach(function(row){Object.keys(row).forEach(function(k){if(!headers.includes(k))headers.push(k)})});
 if(!headers.length)throw new Error('Aucune colonne détectée dans le fichier.');
 return{headers:headers,lignes:lignes};
}
async function lireFichierTransfert(fichier){
 if(!fichier)throw new Error('Sélectionnez un fichier.');
 if(fichier.size>15*1024*1024)throw new Error('Le fichier dépasse 15 Mo. Découpez-le avant de l’importer.');
 const texte=await lireTexteFichier(fichier);
 if(/\.json$/i.test(fichier.name)||/json/i.test(fichier.type||''))return parserJsonTransfert(texte);
 return parserCsvTransfert(texte);
}
function mappingAutomatiqueTransfert(type,headers){
 const champs=defTransfertAncien(type).champs,cles=headers.map(normaliserCleTransfert),mapping={};
 Object.entries(champs).forEach(function(pair){
  const champ=pair[0],conf=pair[1],cibles=(conf.alias||[]).map(normaliserCleTransfert);let index=cles.findIndex(function(c){return cibles.includes(c)});
  if(index<0)index=cles.findIndex(function(c){return cibles.some(function(a){return a&&c&&(c.includes(a)||a.includes(c))})});
  mapping[champ]=index>=0?headers[index]:'';
 });
 return mapping;
}
function optionsMappingTransfert(headers,selection){return '<option value="">Ne pas associer</option>'+headers.map(function(h){return '<option value="'+escapeHTML(h)+'"'+(h===selection?' selected':'')+'>'+escapeHTML(h)+'</option>'}).join('')}
function ligneErreurTransfert(index,texte){return 'Ligne '+(index+2)+' : '+texte}
function analyserTransfertAncien(form){
 const type=form.type,conf=defTransfertAncien(type),erreurs=[],alertes=[],valides=[],vus=new Set();
 const existantsProduits=new Set((st.prods||[]).map(function(p){return normaliserCleTransfert(p.n)}));
 const existantsFournisseurs=new Set((st.fournisseurs||[]).map(function(f){return normaliserCleTransfert(f.n)}));
 (form.lignes||[]).forEach(function(row,index){
  let correcte=true;
  Object.entries(conf.champs).forEach(function(pair){if(pair[1].obligatoire&&!valeurTransfertAncien(row,form.mapping,pair[0])){erreurs.push(ligneErreurTransfert(index,'champ obligatoire absent : '+pair[1].label+'.'));correcte=false}});
  if(type==='produits'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'nom'));
   const unite=uniteImportee(valeurTransfertAncien(row,form.mapping,'unite'));
   if(valeurTransfertAncien(row,form.mapping,'unite')&&!unite){erreurs.push(ligneErreurTransfert(index,'unité non reconnue.'));correcte=false}
   if(nom&&(vus.has(nom)||existantsProduits.has(nom))){alertes.push(ligneErreurTransfert(index,'produit déjà présent : il sera ignoré.'));correcte=false}
   if(nom)vus.add(nom);
   ['prix','seuil','stock'].forEach(function(champ){const valeur=valeurTransfertAncien(row,form.mapping,champ),n=nombreTransfere(valeur);if(valeur&&n.invalide){erreurs.push(ligneErreurTransfert(index,defTransfertAncien(type).champs[champ].label+' invalide.'));correcte=false}});
  }else if(type==='fournisseurs'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'nom')),email=valeurTransfertAncien(row,form.mapping,'email');
   if(nom&&(vus.has(nom)||existantsFournisseurs.has(nom))){alertes.push(ligneErreurTransfert(index,'fournisseur déjà présent : il sera ignoré.'));correcte=false}
   if(nom)vus.add(nom);
   if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){erreurs.push(ligneErreurTransfert(index,'adresse e-mail invalide.'));correcte=false}
  }else if(type==='stocks'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'produit')),quantite=nombreTransfere(valeurTransfertAncien(row,form.mapping,'quantite'));
   if(nom&&!existantsProduits.has(nom)){alertes.push(ligneErreurTransfert(index,'produit absent d’INVO : aucune quantité ne sera appliquée.'));correcte=false}
   if(quantite.invalide){erreurs.push(ligneErreurTransfert(index,'quantité invalide.'));correcte=false}
   if(nom&&vus.has(nom)){alertes.push(ligneErreurTransfert(index,'produit dupliqué dans ce fichier : une seule ligne est admise.'));correcte=false}
   if(nom)vus.add(nom);
  }else{
   const ref=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'reference'));
   if(ref&&vus.has(ref)){alertes.push(ligneErreurTransfert(index,'référence dupliquée : elle sera ignorée.'));correcte=false}
   if(ref)vus.add(ref);
  }
  if(correcte)valides.push(row);
 });
 return{valides:valides,erreurs:erreurs,alertes:alertes};
}
function nomStatutTransfert(statut){return statut==='importé'?'Importé':statut==='à compléter'?'À compléter':'À vérifier'}
function classeStatutTransfert(statut){return statut==='importé'?'done':statut==='à compléter'?'todo':''}
function escapeTableTransfert(v){const s=String(v??'');return escapeHTML(s.length>90?s.slice(0,87)+'…':s)}
function transfertDonneesHTML(){
 const brouillons=(st.legacyTransfers||[]).slice(0,8);
 const liste=brouillons.length?'<div class="transfer-draft-list">'+brouillons.map(function(x){return '<div class="transfer-draft"><span><b>'+escapeHTML(defTransfertAncien(x.type).label)+' · '+escapeHTML(x.fileName||'Fichier sans nom')+'</b><small>'+escapeHTML(String((x.lignes||[]).length))+' ligne(s) préparée(s) · '+escapeHTML(formatDateHistoriqueAudit(x.cree))+'</small></span><span style="display:flex;align-items:center;gap:8px"><span class="transfer-status '+classeStatutTransfert(x.statut)+'">'+nomStatutTransfert(x.statut)+'</span><button class="settings-text-button" data-transfer-review="'+escapeHTML(x.id)+'">Ouvrir'+settingsIcon('arrow')+'</button></span></div>'}).join('')+'</div>':'<p class="transfer-note">Aucun transfert préparé. Les fichiers sont analysés localement avant toute modification.</p>';
 return '<section class="settings-group"><div class="settings-group-title">'+settingsIcon('transfer')+'<span>Transférer mes données</span></div><div class="settings-card"><div class="settings-mini-action"><span>'+settingsIcon('transfer')+'<span><b>Reprendre des données existantes</b><small>Fichier CSV ou JSON · aucune donnée INVO n’est modifiée sans votre validation finale.</small></span></span><button class="settings-text-button" id="transferStart">Démarrer'+settingsIcon('arrow')+'</button></div><div class="settings-mini-action"><span>'+settingsIcon('hardware')+'<span><b>Connexion à un ancien logiciel</b><small>Disponible lorsque son API ou un connecteur partenaire est configuré.</small></span></span><button class="settings-text-button transfer-source-disabled" id="transferSource" aria-disabled="true">À configurer</button></div></div></section><section class="settings-group"><div class="settings-group-title">'+settingsIcon('backup')+'<span>Parcours contrôlé</span></div><div class="transfer-steps"><div class="transfer-step"><b><strong>1</strong>Choisir</b>Le type de données et le fichier source.</div><div class="transfer-step"><b><strong>2</strong>Vérifier</b>Colonnes, erreurs et doublons détectés.</div><div class="transfer-step"><b><strong>3</strong>Valider</b>Confirmation humaine avant tout import.</div></div><p class="transfer-note"><b>Protection du stock :</b> une quantité importée reste sans effet jusqu’à la validation finale. Sur GitHub Pages, ce contrôle reste local à l’appareil ; une traçabilité inviolable exige un backend.</p></section><section class="settings-group"><div class="settings-group-title">'+settingsIcon('backup')+'<span>Transferts préparés</span></div>'+liste+'</section>';
}
function renduApercuTransfert(form,analyse){
 const visibles=(form.lignes||[]).slice(0,5),headers=(form.headers||[]).slice(0,7);
 const table=visibles.length?'<div class="transfer-preview"><table><thead><tr>'+headers.map(function(h){return '<th>'+escapeHTML(h)+'</th>'}).join('')+'</tr></thead><tbody>'+visibles.map(function(row){return '<tr>'+headers.map(function(h){return '<td>'+escapeTableTransfert(row[h])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>':'';
 const erreurs=analyse.erreurs.length?'<div class="transfer-warning transfer-error"><b>'+analyse.erreurs.length+' erreur(s) à corriger</b><br>'+analyse.erreurs.slice(0,4).map(escapeHTML).join('<br>')+(analyse.erreurs.length>4?'<br>…':'')+'</div>':'';
 const alertes=analyse.alertes.length?'<div class="transfer-warning"><b>'+analyse.alertes.length+' alerte(s)</b><br>'+analyse.alertes.slice(0,4).map(escapeHTML).join('<br>')+(analyse.alertes.length>4?'<br>…':'')+'</div>':'';
 return '<div class="transfer-summary"><div><b>'+form.lignes.length+'</b>lignes lues</div><div><b>'+analyse.valides.length+'</b>lignes prêtes</div><div><b>'+analyse.erreurs.length+'</b>erreurs à corriger</div></div>'+erreurs+alertes+table;
}
function ouvrirTransfertDonnees(){
 transfertAncienForm={type:'produits',headers:[],lignes:[],mapping:{},fileName:'',analyse:null};
 afficherTransfertDonnees();
}
function afficherTransfertDonnees(){
 const form=transfertAncienForm;if(!form)return;
 const conf=defTransfertAncien(form.type);if(!Object.keys(form.mapping||{}).length)form.mapping=mappingAutomatiqueTransfert(form.type,form.headers||[]);
 const analyse=form.lignes.length?analyserTransfertAncien(form):null;form.analyse=analyse;
 const champs=form.lignes.length?'<div class="transfer-form-grid">'+Object.entries(conf.champs).map(function(pair){const champ=pair[0],meta=pair[1];return '<div class="fld"><label>'+escapeHTML(meta.label)+(meta.obligatoire?' *':'')+'</label><select data-transfer-map="'+escapeHTML(champ)+'">'+optionsMappingTransfert(form.headers,form.mapping[champ])+'</select></div>'}).join('')+'</div>'+renduApercuTransfert(form,analyse):'<p class="transfer-note">Le fichier ne quitte pas cet appareil. Après lecture, INVO affichera les colonnes, la prévisualisation et les problèmes à corriger.</p>';
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="transferBg"><div class="sheet transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transferTitle"><h3 id="transferTitle">Transférer mes données</h3><p class="sh-sub">1. Choisissez les données · 2. vérifiez leur lecture · 3. validez uniquement ce que vous souhaitez importer.</p><div class="transfer-form-grid"><div class="fld"><label for="transferType">Données à importer</label><select id="transferType">'+valeursTransfertAncien().map(function(type){return '<option value="'+type+'"'+(type===form.type?' selected':'')+'>'+escapeHTML(defTransfertAncien(type).label)+'</option>'}).join('')+'</select></div><div class="fld"><label for="transferFile">Fichier CSV ou JSON</label><input id="transferFile" type="file" accept=".csv,.json,text/csv,application/json"></div></div><p class="transfer-note"><b>'+escapeHTML(conf.label)+' :</b> '+escapeHTML(conf.description)+(form.fileName?' · Fichier : <b>'+escapeHTML(form.fileName)+'</b>':'')+'</p>'+champs+'<div class="sh-actions"><button class="btn btn-2" id="transferCancel">Annuler</button>'+(form.lignes.length?'<button class="btn" id="transferPrepare" '+(!analyse.valides.length?'disabled':'')+'>Préparer la vérification</button>':'')+'</div></div></div>';
 document.getElementById('transferBg').onclick=function(e){if(e.target.id==='transferBg')closeModal()};
 document.getElementById('transferCancel').onclick=closeModal;
 document.getElementById('transferType').onchange=function(e){form.type=e.target.value;form.mapping=mappingAutomatiqueTransfert(form.type,form.headers||[]);afficherTransfertDonnees()};
 document.getElementById('transferFile').onchange=async function(e){const fichier=e.target.files&&e.target.files[0];if(!fichier)return;try{const lu=await lireFichierTransfert(fichier);form.headers=lu.headers;form.lignes=lu.lignes;form.fileName=fichier.name;form.mapping=mappingAutomatiqueTransfert(form.type,lu.headers);afficherTransfertDonnees()}catch(err){toast(err&&err.message?err.message:'Fichier impossible à lire.')}};
 document.querySelectorAll('[data-transfer-map]').forEach(function(select){select.onchange=function(){form.mapping[select.dataset.transferMap]=select.value;afficherTransfertDonnees()}});
 const preparer=document.getElementById('transferPrepare');if(preparer)preparer.onclick=preparerTransfertDonnees;
}
async function preparerTransfertDonnees(){
 const form=transfertAncienForm,analyse=analyserTransfertAncien(form);
 if(!analyse.valides.length){toast('Aucune ligne ne peut être préparée : corrigez les erreurs ou les associations.');return}
 const brouillon={id:uid('transfer'),type:form.type,fileName:form.fileName,cree:new Date().toISOString(),statut:'à vérifier',mapping:Object.assign({},form.mapping),lignes:analyse.valides,erreurs:analyse.erreurs,alertes:analyse.alertes};
 st.legacyTransfers.unshift(brouillon);await save();
 ajouterHistoriqueAudit('Transfert préparé',defTransfertAncien(form.type).label,'Aucune donnée modifiée',analyse.valides.length+' ligne(s) à vérifier','Fichier '+form.fileName+' · validation humaine requise');
 transfertAncienForm=null;closeModal();openReglages('donnees');toast('Transfert préparé : vérifiez-le avant de valider.');
}
function ouvrirRevueTransfert(id){
 const transfert=(st.legacyTransfers||[]).find(function(x){return x.id===id});if(!transfert)return;
 const analyse={valides:transfert.lignes||[],erreurs:transfert.erreurs||[],alertes:transfert.alertes||[]};
 const form={type:transfert.type,headers:Object.keys((transfert.lignes||[])[0]||{}),lignes:transfert.lignes||[],mapping:transfert.mapping||{}};
 const priseEnCharge=['produits','fournisseurs','stocks'].includes(transfert.type);
 const action=transfert.statut==='à vérifier'?(priseEnCharge?'Valider l’import':'Conserver pour reprise manuelle'):'Fermer';
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="transferReviewBg"><div class="sheet transfer-modal" role="dialog" aria-modal="true"><h3>Vérifier le transfert</h3><p class="sh-sub">'+escapeHTML(defTransfertAncien(transfert.type).label)+' · '+escapeHTML(transfert.fileName||'Fichier sans nom')+'</p>'+renduApercuTransfert(form,analyse)+(priseEnCharge?'<p class="transfer-note"><b>Validation finale :</b> les '+(transfert.type==='stocks'?'quantités de stock':'données')+' ci-dessus seront appliquées seulement après votre confirmation. Les doublons signalés restent exclus.</p>':'<p class="transfer-note"><b>Reprise manuelle :</b> ce type est archivé avec ses colonnes et ses lignes. INVO ne le convertit pas automatiquement car le modèle de données doit être contrôlé au cas par cas.</p>')+'<div class="sh-actions"><button class="btn btn-2" id="transferReviewClose">Fermer</button>'+(transfert.statut==='à vérifier'?'<button class="btn" id="transferValidate">'+action+'</button>':'')+'</div></div></div>';
 document.getElementById('transferReviewBg').onclick=function(e){if(e.target.id==='transferReviewBg')closeModal()};
 document.getElementById('transferReviewClose').onclick=closeModal;
 const valider=document.getElementById('transferValidate');if(valider)valider.onclick=function(){validerTransfertDonnees(transfert.id)};
}
function produitParNomTransfere(nom){const cle=normaliserCleTransfert(nom);return(st.prods||[]).find(function(p){return normaliserCleTransfert(p.n)===cle})}
function appliquerProduitTransfere(row,mapping){
 const n=valeurTransfertAncien(row,mapping,'nom'),unite=uniteImportee(valeurTransfertAncien(row,mapping,'unite')),prix=nombreTransfere(valeurTransfertAncien(row,mapping,'prix')),seuil=nombreTransfere(valeurTransfertAncien(row,mapping,'seuil')),stock=nombreTransfere(valeurTransfertAncien(row,mapping,'stock'));
 if(!n||!unite||produitParNomTransfere(n))return null;
 const id=uid('m'),emplacement=emplacementImporte(valeurTransfertAncien(row,mapping,'emplacement'));
 const z=emplacement||'reserve';
 const produit={id:id,n:n,i:'📦',u:unite,px:prix.valeur===null?0:prix.valeur,seuil:seuil.valeur===null?0:seuil.valeur,s:stock.valeur===null?0:stock.valeur,dlc:0,z:z,emplacements:[z],invCategory:categorieImportee(valeurTransfertAncien(row,mapping,'categorie')),fo:valeurTransfertAncien(row,mapping,'fournisseur'),displayOrder:produitsZone(z).length};
 st.prods.push(produit);if(stock.valeur!==null)st.stock[id]=stock.valeur;return{produit:produit,stock:stock.valeur};
}
async function validerTransfertDonnees(id){
 const transfert=(st.legacyTransfers||[]).find(function(x){return x.id===id});if(!transfert||transfert.statut!=='à vérifier')return;
 const type=transfert.type,rows=transfert.lignes||[];
 if(!['produits','fournisseurs','stocks'].includes(type)){
  if(!confirm('Conserver ce transfert en attente de reprise manuelle ? Aucune donnée INVO ne sera modifiée.'))return;
  transfert.statut='à compléter';transfert.valideLe=new Date().toISOString();await save();
  ajouterHistoriqueAudit('Transfert à compléter',defTransfertAncien(type).label,'Aucune donnée modifiée',rows.length+' ligne(s) archivées','Reprise manuelle nécessaire');
  closeModal();openReglages('donnees');toast('Transfert conservé pour reprise manuelle.');return;
 }
 const message=type==='stocks'?'Appliquer les quantités de stock après cette vérification humaine ?':'Importer les '+rows.length+' ligne(s) vérifiées ?';
 if(!confirm(message))return;
 let ajouts=0,stocksModifies=0,ignores=0;
 if(type==='produits')rows.forEach(function(row){const resultat=appliquerProduitTransfere(row,transfert.mapping);if(!resultat){ignores++;return}ajouts++;if(resultat.stock!==null){stocksModifies++;ajouterHistoriqueAudit('Stock transféré',resultat.produit.n,'—',fmtQ(resultat.stock)+' '+resultat.produit.u,'Import validé manuellement')}});
 if(type==='fournisseurs')rows.forEach(function(row){const nom=valeurTransfertAncien(row,transfert.mapping,'nom');if(fournisseurParNom(nom)){ignores++;return}st.fournisseurs.push({id:uid('fo'),n:nom,mail:valeurTransfertAncien(row,transfert.mapping,'email')});ajouts++});
 if(type==='stocks')rows.forEach(function(row){const produit=produitParNomTransfere(valeurTransfertAncien(row,transfert.mapping,'produit')),quantite=nombreTransfere(valeurTransfertAncien(row,transfert.mapping,'quantite'));if(!produit||quantite.valeur===null){ignores++;return}const avant=st.stock[produit.id]??0;st.stock[produit.id]=quantite.valeur;stocksModifies++;ajouterHistoriqueAudit('Stock transféré',produit.n,fmtQ(avant)+' '+produit.u,fmtQ(quantite.valeur)+' '+produit.u,'Import validé manuellement')});
 assurerFournisseurs();transfert.statut='importé';transfert.valideLe=new Date().toISOString();transfert.resultat={ajouts:ajouts,stocksModifies:stocksModifies,ignores:ignores};
 await save();ajouterHistoriqueAudit('Transfert validé',defTransfertAncien(type).label,'Aucune donnée modifiée avant validation',ajouts+' ajout(s) · '+stocksModifies+' stock(s) appliqué(s)','Validation humaine explicite');
 closeModal();renderAll();openReglages('donnees');toast('Transfert validé : '+ajouts+' ajout(s), '+stocksModifies+' stock(s) appliqué(s).');
}

function coutMat(id,q){const c=item(id);if(!c)return 0;let v=0;
for(const [pid,x] of Object.entries(c.f||{}))v+=qteFicheEnStock(c,pid,x*q)*(prod(pid)?.px||0);return v}
const coutMv=m=>coutMat(m.plat,m.qty);
const pvMv=m=>{const c=item(m.plat);return c?c.pv*m.qty:0};
function deduire(id,q){const c=item(id);if(!c)return;
for(const [pid,x] of Object.entries(c.f||{}))st.stock[pid]=Math.max(0,(st.stock[pid]||0)-qteFicheEnStock(c,pid,x*q))}
/* ═══════════════════════════════════════════════════════════
   TRAÇABILITÉ DES MOUVEMENTS
   Chaîne obligatoire :
     PRODUIT ENREGISTRÉ → STOCK → VENTE/ENVOI → ANNULATION/OFFERT/PERTE
   Aucun mouvement ne peut exister sans produit au catalogue.
   Une annulation doit pointer vers la vente qu'elle annule.
   ═══════════════════════════════════════════════════════════ */

const MOTIFS_PRIMAIRES=['vente','envoi'];              /* créent la consommation */
const MOTIF_REVERSE='annul';                           /* restitue le stock */
/* Ces motifs ne créent jamais une seconde sortie de stock : ils qualifient
   une ligne déjà envoyée par la caisse ou enregistrée comme transaction. */
const MOTIFS_A_TRACER=['annul','offClient','offPart','offGroupe','casse','rate'];

/* Quantité d'une vente/envoi qui peut encore être qualifiée ou annulée.
   Une même quantité ne peut recevoir qu'une seule qualification. */
function resteATracer(mvId){
 const p=(st.mv||[]).find(m=>String(m.id)===String(mvId));
 if(!p||!MOTIFS_PRIMAIRES.includes(p.motif))return 0;
 const deja=(st.mv||[])
  .filter(m=>MOTIFS_A_TRACER.includes(m.motif)&&String(m.parent)===String(mvId))
  .reduce((s,m)=>s+(m.qty||0),0);
 return Math.max(0,(p.qty||0)-deja);
}

/* Ventes/envois d'un produit encore qualifiables, du plus récent au plus ancien */
function ventesATracer(platId){
 return (st.mv||[])
  .filter(m=>MOTIFS_PRIMAIRES.includes(m.motif)&&m.plat===platId&&resteATracer(m.id)>0)
  .sort((a,b)=>new Date(b.ts)-new Date(a.ts));
}

/* Le stock permet-il cette sortie ? Renvoie les matières insuffisantes. */
function stockSuffisant(platId,q){
 const c=item(platId);
 if(!c||!c.f)return{ok:true,manques:[]};
 const manques=[];
 for(const [pid,x] of Object.entries(c.f)){
  const besoin=qteFicheEnStock(c,pid,x*q), dispo=st.stock[pid]||0;
  if(besoin>dispo+1e-9){
   const p=prod(pid);
   manques.push({id:pid,n:p?p.n:pid,u:p?p.u:'',besoin,dispo});
  }
 }
 return{ok:!manques.length,manques};
}

/* ── Validation : refuse tout mouvement incohérent ── */
function validerMouvement(m){
 /* 1. Le produit doit exister au catalogue */
 const c=item(m.plat);
 if(!m.plat||!c)return{ok:false,code:'produit_inconnu',
  msg:t('trProduitInconnu').replace('%p',m.platN||m.plat||'?')};

 /* 2. Quantité exploitable */
 const q=Number(m.qty);
 if(!(q>0)||!isFinite(q))return{ok:false,code:'quantite_invalide',msg:t('trQteInvalide')};

 /* 3. Motif connu */
 const motifsOk=[...MOTIFS_PRIMAIRES,MOTIF_REVERSE,...MOTIFS.map(x=>x.id)];
 if(!m.motif||!motifsOk.includes(m.motif))
  return{ok:false,code:'motif_inconnu',msg:t('trMotifInconnu')};

 /* 4. Annulation, offert et perte : toujours rattachés à une ligne primaire. */
 if(MOTIFS_A_TRACER.includes(m.motif)){
  if(!m.parent)return{ok:false,code:'annul_sans_parent',msg:t('trAnnulSansVente')};
  const p=(st.mv||[]).find(x=>String(x.id)===String(m.parent));
  if(!p)return{ok:false,code:'parent_absent',msg:t('trParentAbsent')};
  if(!MOTIFS_PRIMAIRES.includes(p.motif))
   return{ok:false,code:'parent_invalide',msg:t('trParentInvalide')};
  if(p.plat!==m.plat)
   return{ok:false,code:'parent_autre_produit',msg:t('trParentAutreProduit')};
  const reste=resteATracer(m.parent);
  if(reste<=0)return{ok:false,code:'deja_annule',msg:t('trDejaAnnule')};
  if(q>reste+1e-9)return{ok:false,code:'annul_trop',
   msg:t('trAnnulTrop').replace('%q',fmtQ(q)).replace('%r',fmtQ(reste))};
 }

 /* 5. Seules les transactions primaires et les sorties directes consomment le stock. */
 let alerte=null;
 if(!MOTIFS_A_TRACER.includes(m.motif)){
  const s=stockSuffisant(m.plat,q);
  if(!s.ok){
   alerte={code:'stock_insuffisant',
    msg:t('trStockInsuffisant').replace('%l',s.manques.slice(0,3)
     .map(x=>`${x.n} (${fmtQ(x.dispo)}/${fmtQ(x.besoin)} ${x.u})`).join(', ')),
    manques:s.manques};
  }
 }
 return{ok:true,alerte};
}

/* ── Création : seul point d'entrée autorisé pour écrire un mouvement ──
   Applique le stock uniquement après validation réussie. */
function creerMouvement(m,opts){
 opts=opts||{};
 const v=validerMouvement(m);
 if(!v.ok)return v;
 if(v.alerte&&!opts.forcer&&!opts.accepteAlerte)
  return{ok:false,code:v.alerte.code,msg:v.alerte.msg,alerte:v.alerte,confirmable:true};

 const c=item(m.plat);
 const q=Number(m.qty);
 const parentMv=m.parent?(st.mv||[]).find(function(x){return String(x.id)===String(m.parent)}):null;
 const sessionEnCours=st.serviceActif&&m.src!=='demo'?st.serviceActif:null;
 const serviceId=m.serviceId||(parentMv&&parentMv.serviceId)||(sessionEnCours&&sessionEnCours.id)||null;
 const serviceType=m.serviceType||(parentMv&&parentMv.serviceType)||(sessionEnCours&&sessionEnCours.type)||null;

 /* Effet sur le stock : annulation restitue ; offert/perte qualifient sans déduire. */
 if(m.motif===MOTIF_REVERSE) rendreStock(m.plat,q);
 else if(!MOTIFS_A_TRACER.includes(m.motif))deduire(m.plat,q);

 const mv={
  id:m.id||(Date.now()+Math.random()),
  src:m.src||'main',
  motif:m.motif,
  plat:m.plat, platN:c.n, platI:c.i,
  qty:q,
  table:m.table||'—',
  who:m.who||st.who,
  ts:m.ts||new Date().toISOString(),
  parent:m.parent||null,
  serviceId:serviceId,
  serviceType:serviceType,
  chaine:m.parent?'qualification':'primaire'
 };
 if(m.ph)mv.ph=m.ph;
 if(v.alerte)mv.alerte=v.alerte.code;

 st.mv.unshift(mv);
 if(st.mv.length>250)st.mv.length=250;
 return{ok:true,mv,alerte:v.alerte||null};
}

/* ── Validation d'un lot : aucune écriture tant que tout le lot n'est pas cohérent. ── */
function validerLotMouvements(mouvements,opts){
 opts=opts||{};
 const refus=[],besoins={};
 for(const m of mouvements){
  const v=validerMouvement(m);
  if(!v.ok){refus.push({msg:v.msg,confirmable:false});continue}
  if(!MOTIFS_A_TRACER.includes(m.motif)){
   const c=item(m.plat);
   for(const [pid,x] of Object.entries(c.f||{})){
    const b=besoins[pid]||{q:0};
    b.q+=qteFicheEnStock(c,pid,x*Number(m.qty));besoins[pid]=b;
   }
  }
 }
 if(refus.length)return{ok:false,refus};
 if(!opts.forcer&&!opts.accepteAlerte){
  const manques=Object.entries(besoins).map(([id,b])=>{
   const p=prod(id),dispo=st.stock[id]||0;
   return{id,n:p?p.n:id,u:p?p.u:'',besoin:b.q,dispo};
  }).filter(x=>x.besoin>x.dispo+1e-9);
  if(manques.length){
   const msg=t('trStockInsuffisant').replace('%l',manques.slice(0,3)
    .map(x=>`${x.n} (${fmtQ(x.dispo)}/${fmtQ(x.besoin)} ${x.u})`).join(', '));
   return{ok:false,refus:[{msg,confirmable:true}]};
  }
 }
 return{ok:true,refus:[]};
}

/* Restitution de stock (annulation) */
function rendreStock(platId,q){
 const c=item(platId);
 if(!c||!c.f)return;
 for(const [pid,x] of Object.entries(c.f))st.stock[pid]=(st.stock[pid]||0)+qteFicheEnStock(c,pid,x*q);
}

/* Remonter la chaîne d'un mouvement, pour l'affichage */
function chaineMouvement(mvId){
 const m=(st.mv||[]).find(x=>x.id===mvId);
 if(!m)return[];
 const ch=[m];
 let cur=m,garde=0;
 while(cur&&cur.parent&&garde++<10){
  const p=(st.mv||[]).find(x=>x.id===cur.parent);
  if(!p)break;
  ch.push(p);cur=p;
 }
 return ch.reverse();
}

function toast(msg){const el=document.getElementById('toast');
el.innerHTML=`<div class="toast">✓ ${msg}</div>`;setTimeout(()=>{el.innerHTML=''},1800)}

/* ═════ FLUX CAISSE ═════ */
function posEvent(){
 /* Flux automatique réservé au parcours fictif : jamais au test réel. */
 if(!st.live||!st.demoParcours||!st.carte.length)return;
 const c=st.carte[Math.floor(Math.random()*st.carte.length)];
 const pool=c.k==='food'
 ?['vente','vente','vente','vente','vente','vente','vente','offClient','annul','perso']
 :['vente','vente','vente','vente','vente','vente','vente','offClient','offGroupe','annul'];
 let mo=pool[Math.floor(Math.random()*pool.length)];
 const q=mo==='vente'?(Math.random()<.72?1:(Math.random()<.7?2:3)):1;

 /* Annulation/offert/perte : uniquement après une ligne primaire correspondante. */
 let parent=null;
 if(MOTIFS_A_TRACER.includes(mo)){
  const cand=ventesATracer(c.id);
  if(cand.length){parent=cand[0].id}
  else{mo='vente'}                      /* sinon on retombe sur une vente */
 }
 const r=creerMouvement({src:'demo',motif:mo,plat:c.id,qty:q,
  table:'Démo automatique',who:'INVO · Démo',
  parent},{accepteAlerte:true});        /* la caisse reflète le réel : on enregistre et on signale */
 if(!r.ok)return;                       /* mouvement incohérent : jamais écrit */

 st.lastSync=Date.now();save();
 /* La Démo caisse actualise immédiatement les indicateurs visibles. */
 if(screen==='dash'){renderNav();renderDash();}
 else if(screen==='caisse'){seenFeed=st.mv.length;renderCaisse();}
 else renderNav();
}

function startFeed(){if(timer)clearInterval(timer);timer=setInterval(()=>{if(st.live)posEvent()},3800)}
function sinceSync(){const s=Math.floor((Date.now()-st.lastSync)/1000);return s<60?s+' s':Math.floor(s/60)+' min'}

function openQualification(mvId){
 const m=(st.mv||[]).find(x=>String(x.id)===String(mvId)),reste=resteATracer(mvId);if(!m||reste<=0)return;
 const c=item(m.plat),choix=MOTIFS.filter(x=>MOTIFS_A_TRACER.includes(x.id)&&(x.ap==='tous'||x.ap===c.k));
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgQual"><div class="sheet">
 <h3>${t('qualifier')}</h3><p class="sh-sub">${t('qualifierS')}</p>
 <div class="hint">${m.platI} <b>${m.platN}</b><br>${t('resteQ')} : ${fmtQ(reste)}</div>
 <div class="fld"><label>${t('etape2')}</label><select id="qMotif">${choix.map(x=>`<option value="${x.id}">${x.i} ${t(x.id)}</option>`).join('')}</select></div>
 <div class="fld"><label>${t('resteQ')}</label><input id="qQty" inputmode="decimal" value="${fmtQ(reste)}"></div>
 <div class="sh-actions"><button class="btn btn-2" id="qCancel">${t('cancel')}</button><button class="btn" id="qSave">${t('confQual')}</button></div></div></div>`;
 const bg=document.getElementById('bgQual');bg.onclick=e=>{if(e.target===bg)closeModal()};
 document.getElementById('qCancel').onclick=closeModal;
 document.getElementById('qSave').onclick=async()=>{
  const q=Number((document.getElementById('qQty').value||'').replace(',','.')),motifQ=document.getElementById('qMotif').value;
  if(!(q>0)||q>reste+1e-9){toast(t('trQteInvalide'));return}
  const r=creerMouvement({src:'main',motif:motifQ,plat:m.plat,qty:q,table:m.table,who:st.who,parent:m.id},{accepteAlerte:true});
  if(!r.ok){toast(r.msg);return}await save();closeModal();renderCaisse();toast(t('qualSaved'));
 };
}
/* DASHBOARD_PROFILE_CORE_START
   Les intégrations attendues sont centralisées dans st.dashboardIntegrations :
   covers {date,midi,soir}, recommendedProductIds {date,ids},
   unsavedPurchaseOrders {date,count}. Aucune valeur n'est déduite ou simulée. */
function dateLocaleDashboard(date){
 const d=date instanceof Date?date:new Date(date),p=function(v){return String(v).padStart(2,'0')};
 return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
}
function resumeVentesDashboard(maintenant){
 const debut=new Date(maintenant);debut.setHours(0,0,0,0);
 const fin=new Date(debut);fin.setDate(fin.getDate()+1);
 const ventes=(st.mv||[]).filter(function(m){
  if(!m||m.motif!=='vente'||!m.ts)return false;
  const d=new Date(m.ts);return !isNaN(d.getTime())&&d>=debut&&d<fin;
 });
 return ventes.reduce(function(r,m){
  const c=item(m.plat),montant=pvMv(m);
  r.ca+=montant;r.nombreVentes+=1;
  if(c&&c.k==='drink')r.liquide+=montant;else if(c)r.solide+=montant;
  if(c&&c.c==='cCock')r.cocktails+=Number(m.qty)||0;
  return r;
 },{ventes:ventes,ca:0,solide:0,liquide:0,cocktails:0,nombreVentes:0});
}
function integrationDashboard(nom){return st.dashboardIntegrations&&st.dashboardIntegrations[nom]}
function sourceCouvertsDashboard(dateISO){
 const source=integrationDashboard('covers');
 if(!source)return{status:'missing',message:'Aucune source de couverts n’est connectée.'};
 if(typeof source.date!=='string'||!Object.prototype.hasOwnProperty.call(source,'midi')||!Object.prototype.hasOwnProperty.call(source,'soir'))
  return{status:'error',message:'La source de couverts ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucune donnée de couverts reçue pour aujourd’hui.'};
 const midi=Number(source.midi),soir=Number(source.soir);
 if(!Number.isFinite(midi)||midi<0||!Number.isFinite(soir)||soir<0)
  return{status:'error',message:'Les nombres de couverts reçus sont invalides.'};
 return{status:'ready',midi:Math.round(midi),soir:Math.round(soir),total:Math.round(midi+soir)};
}
function sourceRecommandationsDashboard(dateISO){
 const source=integrationDashboard('recommendedProductIds');
 if(!source)return{status:'missing',message:'Aucun service de recommandation produit n’est connecté.'};
 if(typeof source.date!=='string'||!Array.isArray(source.ids))
  return{status:'error',message:'La source de recommandations ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucune recommandation reçue pour aujourd’hui.'};
 const vus=new Set(),produits=source.ids.map(function(id){return item(id)}).filter(function(p){if(!p||vus.has(p.id))return false;vus.add(p.id);return true});
 if(!produits.length)return{status:'empty',message:'Aucun produit à recommander pour le moment.'};
 return{status:'ready',items:produits};
}
function sourceBonsNonSaisisDashboard(dateISO){
 const source=integrationDashboard('unsavedPurchaseOrders');
 if(!source)return{status:'missing',message:'Aucune source de bons de commande non saisis n’est connectée.'};
 if(typeof source.date!=='string'||!Object.prototype.hasOwnProperty.call(source,'count'))
  return{status:'error',message:'La source des bons de commande ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucun état des bons non saisis reçu pour aujourd’hui.'};
 const count=Number(source.count);
 if(!Number.isFinite(count)||count<0)return{status:'error',message:'Le nombre de bons non saisis reçu est invalide.'};
 return{status:'ready',count:Math.round(count)};
}
function periodesSemaineDashboard(maintenant){
 const debut=new Date(maintenant);debut.setHours(0,0,0,0);debut.setDate(debut.getDate()-((debut.getDay()+6)%7));
 const fin=new Date(debut);fin.setDate(fin.getDate()+7);
 const precedente=new Date(debut);precedente.setDate(precedente.getDate()-7);
 return{debut:debut,fin:fin,precedente:precedente};
}
function ventesDashboardEntre(debut,fin){
 return(st.mv||[]).filter(function(m){if(!m||m.motif!=='vente'||!m.ts)return false;const d=new Date(m.ts);return !isNaN(d.getTime())&&d>=debut&&d<fin});
}
function resumePerformanceSemaineDashboard(maintenant){
 const periode=periodesSemaineDashboard(maintenant),ventes=ventesDashboardEntre(periode.debut,periode.fin),ventesPrecedentes=ventesDashboardEntre(periode.precedente,periode.debut);
 const jours=Array.from({length:7},function(_,ix){const d=new Date(periode.debut);d.setDate(d.getDate()+ix);return{d:d,ca:0}});
 const joursPrecedents=Array.from({length:7},function(_,ix){const d=new Date(periode.precedente);d.setDate(d.getDate()+ix);return{d:d,ca:0}});
 ventes.forEach(function(m){const d=new Date(m.ts),ix=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-periode.debut)/86400000);if(jours[ix])jours[ix].ca+=pvMv(m)});
 ventesPrecedentes.forEach(function(m){const d=new Date(m.ts),ix=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-periode.precedente)/86400000);if(joursPrecedents[ix])joursPrecedents[ix].ca+=pvMv(m)});
 return{periode:periode,ventes:ventes,ventesPrecedentes:ventesPrecedentes,jours:jours,joursPrecedents:joursPrecedents,
  ca:ventes.reduce(function(s,m){return s+pvMv(m)},0),caPrecedent:ventesPrecedentes.reduce(function(s,m){return s+pvMv(m)},0)};
}
const CATEGORIES_BOISSONS_DASHBOARD=[
 {id:'bieres',label:'Bières'},{id:'cocktails',label:'Cocktails'},{id:'softs',label:'Softs'},{id:'chaudes',label:'Boissons chaudes'},
 {id:'vinsVerres',label:'Vins au verre'},{id:'vinsBouteilles',label:'Vins à la bouteille'},{id:'digestifs',label:'Digestifs'},{id:'aperitifs',label:'Apéritifs'}
];
const APERITIFS_DASHBOARD=new Set(['vRicard','dblRicard']);
function categorieBoissonDashboard(produit){
 if(!produit||produit.k!=='drink')return'';
 if(produit.c==='cBieres')return'bieres';if(produit.c==='cCock')return'cocktails';if(produit.c==='cSofts')return'softs';if(produit.c==='cCafe')return'chaudes';
 if(produit.c==='cVins')return /^bt/.test(produit.id)?'vinsBouteilles':'vinsVerres';
 if(produit.c==='cAlc')return APERITIFS_DASHBOARD.has(produit.id)?'aperitifs':'digestifs';
 return'';
}
function resumeBoissonsSemaineDashboard(maintenant){
 const periode=periodesSemaineDashboard(maintenant),ventes=ventesDashboardEntre(periode.debut,periode.fin),categories={};
 CATEGORIES_BOISSONS_DASHBOARD.forEach(function(c){categories[c.id]=0});
 let total=0;
 ventes.forEach(function(m){const produit=item(m.plat),categorie=categorieBoissonDashboard(produit),quantite=Math.max(0,Number(m.qty)||0);if(!produit||produit.k!=='drink')return;total+=quantite;if(categorie)categories[categorie]+=quantite});
 return{periode:periode,ventes:ventes,total:total,categories:categories};
}
/* DASHBOARD_PROFILE_CORE_END */

function blocPerformanceHebdomadaireDashboard(maintenant){
 const performance=resumePerformanceSemaineDashboard(maintenant),joursSemaine=performance.jours,joursSemainePrecedente=performance.joursPrecedents;
 const caSemaine=performance.ca,caSemainePrecedente=performance.caPrecedent,ecartSemaine=caSemaine-caSemainePrecedente;
 const ecartPct=caSemainePrecedente>0?Math.round(ecartSemaine/caSemainePrecedente*100):null;
 const comparaisonSemaine=caSemainePrecedente>0?(ecartSemaine>=0?'+':'−')+fmt(Math.abs(ecartSemaine))+' € · '+(ecartPct>=0?'+':'')+ecartPct+' % vs sem. dernière':(caSemaine>0?'Aucune vente la semaine dernière':'Pas encore de comparaison');
 const comparaisonClasse=caSemainePrecedente>0?(ecartSemaine>0?'up':ecartSemaine<0?'down':'neutral'):'empty';
 const meilleurJour=joursSemaine.reduce(function(max,j){return j.ca>max.ca?j:max},joursSemaine[0]);
 const detailMeilleurJour=caSemaine>0?'Meilleur jour : '+meilleurJour.d.toLocaleDateString('fr-FR',{weekday:'long'})+' · '+fmt(meilleurJour.ca)+' €':'Aucune vente cette semaine';
 const maximumGraphique=Math.max.apply(null,joursSemaine.map(function(j){return j.ca}).concat(joursSemainePrecedente.map(function(j){return j.ca}),[1]));
 const historiqueDisponible=caSemainePrecedente>0,pasBrut=maximumGraphique/4;
 const pasGraphique=pasBrut<=5?Math.max(1,Math.ceil(pasBrut)):pasBrut<=25?Math.ceil(pasBrut/5)*5:Math.ceil(pasBrut/10)*10;
 const plafondGraphique=Math.max(pasGraphique*4,1),xGraphique=function(ix){return 48+ix*(564/6)},yGraphique=function(valeur){return 158-Math.max(0,Math.min(valeur/plafondGraphique,1))*126};
 const pointsActuels=joursSemaine.map(function(j,ix){return{x:xGraphique(ix),y:yGraphique(j.ca),ca:j.ca,d:j.d}}),pointsPrecedents=joursSemainePrecedente.map(function(j,ix){return{x:xGraphique(ix),y:yGraphique(j.ca),ca:j.ca,d:j.d}});
 const traceCourbe=function(points){if(points.length<2)return'';let trace='M '+points[0].x.toFixed(1)+' '+points[0].y.toFixed(1);for(let ix=1;ix<points.length-1;ix++){const suivant=points[ix+1],x=(points[ix].x+suivant.x)/2,y=(points[ix].y+suivant.y)/2;trace+=' Q '+points[ix].x.toFixed(1)+' '+points[ix].y.toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)}const dernier=points[points.length-1];return trace+' Q '+dernier.x.toFixed(1)+' '+dernier.y.toFixed(1)+' '+dernier.x.toFixed(1)+' '+dernier.y.toFixed(1)};
 const courbeActuelle=traceCourbe(pointsActuels),courbePrecedente=traceCourbe(pointsPrecedents),aireActuelle=courbeActuelle+' L '+pointsActuels[pointsActuels.length-1].x.toFixed(1)+' 158 L '+pointsActuels[0].x.toFixed(1)+' 158 Z';
 const contientDesVentes=caSemaine>0||caSemainePrecedente>0;
 const lignesGrille=Array.from({length:5},function(_,ix){const valeur=plafondGraphique-(plafondGraphique/4*ix),y=yGraphique(valeur);return '<line class="dash-chart-gridline" x1="48" y1="'+y.toFixed(1)+'" x2="612" y2="'+y.toFixed(1)+'"></line><text class="dash-chart-ylabel" x="39" y="'+(y+3).toFixed(1)+'">'+fmt(valeur)+' €</text>'}).join('');
 const libellesJours=pointsActuels.map(function(point){return '<text class="dash-chart-xlabel" x="'+point.x.toFixed(1)+'" y="181" text-anchor="middle">'+point.d.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','')+'</text>'}).join('');
 const pointsInteractifs=pointsActuels.map(function(point){const datePoint=point.d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric'});return '<circle class="dash-chart-point" cx="'+point.x.toFixed(1)+'" cy="'+point.y.toFixed(1)+'" r="3.4"><title>'+datePoint+' · '+fmt(point.ca)+' €</title></circle>'}).join('');
 const legendeGraphique='<div class="dash-chart-legend"><span class="current"><i></i>Cette semaine</span>'+(historiqueDisponible?'<span class="previous"><i></i>Semaine dernière</span>':'<span class="muted">Semaine dernière indisponible</span>')+'</div>';
 const graphiqueSvg=contientDesVentes?'<div class="dash-pilot-plot"><svg class="dash-pilot-svg" viewBox="0 0 640 194" role="img" aria-label="Évolution du chiffre d’affaires par jour"><defs><linearGradient id="invoPilotArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5365F5" stop-opacity=".28"></stop><stop offset="100%" stop-color="#5365F5" stop-opacity="0"></stop></linearGradient></defs>'+lignesGrille+'<path class="dash-chart-area" d="'+aireActuelle+'"></path>'+(historiqueDisponible?'<path class="dash-chart-previous" d="'+courbePrecedente+'"></path>':'')+'<path class="dash-chart-current" d="'+courbeActuelle+'"></path>'+pointsInteractifs+libellesJours+'</svg></div>':'<div class="dash-pilot-empty"><b>Pas encore de ventes à afficher</b><span>La courbe se dessinera dès la première vente enregistrée.</span></div>';
 const graphique='<section class="dash-pilot-chart" aria-label="Performance des ventes"><header class="dash-pilot-head"><div><small>PERFORMANCE</small><b>Évolution du chiffre d’affaires</b></div>'+legendeGraphique+'</header>'+graphiqueSvg+'<footer class="dash-pilot-footer"><span class="dash-performance-delta '+comparaisonClasse+'">'+comparaisonSemaine+'</span><span class="dash-performance-best">'+detailMeilleurJour+'</span></footer></section>';
 return '<section class="dash-performance-banner" aria-label="Performance de la semaine"><div class="dash-performance-copy"><article class="dash-performance-metric"><small>CA VENTES · CETTE SEMAINE</small><b>'+fmt(caSemaine)+' €</b><span class="dash-performance-delta '+comparaisonClasse+'">'+comparaisonSemaine+'</span></article><article class="dash-performance-metric secondary"><small>VENTES ENREGISTRÉES</small><b>'+performance.ventes.length+'</b><span>'+detailMeilleurJour+'</span></article></div><div class="dash-performance-chart">'+graphique+'</div></section>';
}
function blocBoissonsHebdomadaireDashboard(maintenant){
 const resume=resumeBoissonsSemaineDashboard(maintenant),categories=CATEGORIES_BOISSONS_DASHBOARD.map(function(c){return '<article class="profile-drink-stat"><span>'+c.label+'</span><b>'+fmtQ(resume.categories[c.id])+'</b></article>'}).join('');
 return '<section class="profile-drinks-banner" aria-label="Ventes de boissons de la semaine"><article class="profile-drinks-total"><small>BOISSONS VENDUES · CETTE SEMAINE</small><b>'+fmtQ(resume.total)+'</b><span>'+(resume.total?'Total issu des ventes enregistrées':'Aucune boisson vendue cette semaine')+'</span></article><div class="profile-drinks-grid">'+categories+'</div></section>';
}

function utilisateurDashboardActuel(){
 return session&&session.email&&auth.users&&auth.users[session.email]?auth.users[session.email]:null;
}
let recapMatinTimer=null;
function preferencesRecapMatin(){
 const utilisateur=utilisateurDashboardActuel(),source=utilisateur?utilisateur.recapMatin:st.recapMatin||{};
 const heure=/^([01]\d|2[0-3]):[0-5]\d$/.test(String(source.heure||''))?source.heure:'08:00';
 return{actif:source.actif!==false,heure:heure};
}
async function enregistrerPreferencesRecapMatin(changement){
 const actuel=preferencesRecapMatin(),suivant={...actuel,...changement};
 const utilisateur=utilisateurDashboardActuel();
 if(utilisateur){utilisateur.recapMatin=suivant;await saveAuth()}else{st.recapMatin=suivant;await save()}
 programmerRecapMatin();
 return suivant;
}
function recapMatinPret(preferences,maintenant){
 if(!preferences.actif)return false;
 const parts=preferences.heure.split(':').map(Number),minutes=maintenant.getHours()*60+maintenant.getMinutes();
 return minutes>=parts[0]*60+parts[1];
}
function bilanRecapMatin(){
 const maintenant=new Date(),debutJour=new Date(maintenant);debutJour.setHours(0,0,0,0);
 const produits=st.prods||[],mouvements=st.mv||[],commandes=st.commandes||[];
 const ventes=mouvements.filter(function(m){return m.motif==='vente'&&new Date(m.ts)>=debutJour});
 const ca=ventes.reduce(function(s,m){return s+pvMv(m)},0);
 const ruptures=produits.filter(function(p){return(st.stock[p.id]??0)<=0}).length;
 const sousSeuil=produits.filter(function(p){const q=st.stock[p.id]??0;return q>0&&q<=p.seuil}).length;
 const receptions=commandes.filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'&&c.dateLiv&&c.dateLiv<=maintenant.toISOString().slice(0,10)}).length;
 const aClasser=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0}).length;
 const profil=profilMetierActuel()||st.whoId||'gestion';
 let cartes=[];
 if(profil==='barman')cartes=[['VENTES DU JOUR',fmt(ventes.length),ventes.length?'Vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':''):'Aucune vente enregistrée'],['STOCK BAR À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':'')+' à traiter':sousSeuil?'Sous seuil à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['À CLASSER',fmt(aClasser),aClasser?'Sortie liée à vérifier':'Caisse à jour']];
 else if(profil==='chef')cartes=[['STOCK À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':'')+' à traiter':sousSeuil?'Sous seuil à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['VENTES DU JOUR',fmt(ventes.length),ventes.length?'Donnée issue des ventes enregistrées':'Aucune vente enregistrée'],['À CLASSER',fmt(aClasser),aClasser?'À contrôler avant clôture':'Aucune sortie à classer']];
 else if(profil==='salle')cartes=[['CHIFFRE D’AFFAIRES',fmt(ca)+' €',ventes.length+' vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':'')],['À CLASSER',fmt(aClasser),aClasser?'Sortie liée à vérifier':'Caisse à jour'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['STOCK À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':''):'Niveaux à surveiller']];
 else cartes=[['CHIFFRE D’AFFAIRES',fmt(ca)+' €',ventes.length+' vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':'')],['RUPTURES',fmt(ruptures),ruptures?'À traiter en priorité':'Aucune rupture'],['SOUS SEUIL',fmt(sousSeuil),sousSeuil?'Commande à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler humainement':'Aucune prévue']];
 const poste=PROFILS_METIER.find(function(p){return p.id===profil})||POSTES.find(function(p){return p.id===st.whoId});
 return{date:maintenant,profil:poste?poste.n:(st.who||'Utilisateur'),cartes:cartes};
}
function recapMatinHTML(){
 const preferences=preferencesRecapMatin(),bilan=bilanRecapMatin(),pret=recapMatinPret(preferences,bilan.date),premiere=bilan.cartes[0];
 return '<section class="morning-recap '+(pret?'':'pending')+'"><div><small>RÉCAPITULATIF DU MATIN · '+escapeHTML(preferences.heure)+'</small><b>'+(!preferences.actif?'Récapitulatif en pause':pret?'Votre récapitulatif est prêt.':'Prévu à '+escapeHTML(preferences.heure)+'.')+'</b><span>'+escapeHTML(bilan.profil)+' · '+escapeHTML(premiere[0])+' : '+escapeHTML(premiere[1])+' — '+escapeHTML(premiere[2])+'</span></div><button class="settings-text-button" data-open-recap>Ouvrir'+settingsIcon('arrow')+'</button></section>';
}
let meteoChargement=false,meteoVilleTimer=null;
function preferencesMeteo(){
 const source=st&&st.meteo&&typeof st.meteo==='object'?st.meteo:{};
 return{ville:String(source.ville||'').trim().slice(0,80),cache:source.cache&&typeof source.cache==='object'?source.cache:null};
}
function libelleMeteo(code){
 const libelles={0:['☀️','Ciel dégagé'],1:['🌤️','Plutôt dégagé'],2:['⛅','Partiellement nuageux'],3:['☁️','Couvert'],45:['🌫️','Brouillard'],48:['🌫️','Brouillard givrant'],51:['🌦️','Bruine légère'],53:['🌦️','Bruine'],55:['🌧️','Forte bruine'],61:['🌧️','Pluie faible'],63:['🌧️','Pluie'],65:['🌧️','Forte pluie'],71:['🌨️','Neige faible'],73:['🌨️','Neige'],75:['🌨️','Forte neige'],80:['🌦️','Averses faibles'],81:['🌧️','Averses'],82:['🌧️','Fortes averses'],95:['⛈️','Orage'],96:['⛈️','Orage avec grêle'],99:['⛈️','Orage avec grêle']};
 return libelles[Number(code)]||['🌡️','Conditions actuelles'];
}
function meteoAccueilHTML(){
 const preferences=preferencesMeteo(),cache=preferences.cache,valide=cache&&cache.ville===preferences.ville&&Date.now()-Number(cache.fetchedAt||0)<30*60*1000;
 if(!preferences.ville)return '<section class="weather-brief pending" data-meteo-accueil><div><small>MÉTÉO</small><b>Ville non configurée</b><span>Choisissez une ville dans Réglages → Général.</span></div><i aria-hidden="true">⌁</i></section>';
 if(!valide)return '<section class="weather-brief pending" data-meteo-accueil><div><small>MÉTÉO · '+escapeHTML(preferences.ville)+'</small><b>Mise à jour en cours</b><span>Les conditions locales sont chargées depuis une source publique.</span></div><i aria-hidden="true">⌁</i></section>';
 const condition=libelleMeteo(cache.code),temperature=Number(cache.temperature);
 return '<section class="weather-brief" data-meteo-accueil><div><small>MÉTÉO · '+escapeHTML(cache.nom||preferences.ville)+'</small><b>'+escapeHTML(condition[1])+' · '+(Number.isFinite(temperature)?temperature.toLocaleString('fr-FR',{maximumFractionDigits:1})+' °C':'Indisponible')+'</b><span>Actualisée à '+escapeHTML(new Date(cache.fetchedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))+'.</span></div><i aria-hidden="true">'+condition[0]+'</i></section>';
}
function mettreAJourMeteoAccueil(){document.querySelectorAll('[data-meteo-accueil]').forEach(function(el){el.outerHTML=meteoAccueilHTML()})}
async function actualiserMeteoAccueil(force){
 const preferences=preferencesMeteo(),cache=preferences.cache;
 if(!preferences.ville||meteoChargement)return;
 if(!force&&cache&&cache.ville===preferences.ville&&Date.now()-Number(cache.fetchedAt||0)<30*60*1000){mettreAJourMeteoAccueil();return}
 meteoChargement=true;mettreAJourMeteoAccueil();
 try{
  const recherche=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(preferences.ville)+'&count=1&language=fr&format=json');
  if(!recherche.ok)throw new Error('Ville introuvable');
  const geo=await recherche.json(),lieu=geo&&Array.isArray(geo.results)?geo.results[0]:null;
  if(!lieu)throw new Error('Ville introuvable');
  const reponse=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lieu.latitude)+'&longitude='+encodeURIComponent(lieu.longitude)+'&current_weather=true&timezone=auto');
  if(!reponse.ok)throw new Error('Météo indisponible');
  const data=await reponse.json(),courant=data&&data.current_weather;
  if(!courant||!Number.isFinite(Number(courant.temperature)))throw new Error('Météo indisponible');
  if(preferencesMeteo().ville!==preferences.ville)return;
  st.meteo={ville:preferences.ville,cache:{ville:preferences.ville,nom:String(lieu.name||preferences.ville),temperature:Number(courant.temperature),code:Number(courant.weathercode),fetchedAt:Date.now()}};await save();
 }catch(e){if(preferencesMeteo().ville===preferences.ville){st.meteo={ville:preferences.ville,cache:null};await save();toast('Météo indisponible pour le moment.');}}
 finally{meteoChargement=false;mettreAJourMeteoAccueil()}
}
async function enregistrerVilleMeteo(ville){const propre=String(ville||'').replace(/\s+/g,' ').trim().slice(0,80);st.meteo={ville:propre,cache:null};await save();if(screen==='dash')renderDash();if(propre)actualiserMeteoAccueil(true);return propre}
function ouvrirRecapMatin(){
 const bilan=bilanRecapMatin(),preferences=preferencesRecapMatin(),date=bilan.date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="bgRecap"><div class="sheet"><div class="recap-summary"><div class="recap-summary-head"><small>RÉCAPITULATIF DU MATIN · '+escapeHTML(preferences.heure)+'</small><b>'+escapeHTML(bilan.profil)+'</b><p>'+escapeHTML(date.charAt(0).toUpperCase()+date.slice(1))+' · informations calculées à partir des données enregistrées dans INVO.</p></div><div class="recap-summary-grid">'+bilan.cartes.map(function(c){return '<article><small>'+escapeHTML(c[0])+'</small><b>'+escapeHTML(c[1])+'</b><span>'+escapeHTML(c[2])+'</span></article>'}).join('')+'</div><p class="transfer-note">Sur GitHub Pages, ce récapitulatif est préparé lorsque l’application est ouverte. Un envoi programmé par e-mail ou notification, même application fermée, nécessite un backend et un service de notification.</p><div class="sh-actions"><button class="btn" id="recapClose">Fermer</button></div></div></div></div>';
 document.getElementById('bgRecap').onclick=function(e){if(e.target.id==='bgRecap')closeModal()};document.getElementById('recapClose').onclick=closeModal;
}
function programmerRecapMatin(){
 if(recapMatinTimer)clearTimeout(recapMatinTimer);
 const preferences=preferencesRecapMatin();if(!preferences.actif)return;
 const maintenant=new Date(),parts=preferences.heure.split(':').map(Number),prochain=new Date(maintenant);
 prochain.setHours(parts[0],parts[1],0,0);if(prochain<=maintenant)prochain.setDate(prochain.getDate()+1);
 recapMatinTimer=setTimeout(function(){if(screen==='dash'){renderDash();toast('Votre récapitulatif du matin est prêt.')}programmerRecapMatin()},Math.min(prochain-maintenant,2147483647));
}
function profilMetierDepuisVue(id){
 return PROFILS_METIER_IDS.includes(id)?id:'';
}
function profilMetierActuel(){
 const utilisateur=utilisateurDashboardActuel(),id=utilisateur?utilisateur.profilMetier:st.profilMetier;
 return PROFILS_METIER_IDS.includes(id)?id:profilMetierDepuisVue(st.whoId);
}
async function synchroniserProfilMetierAvecVue(id){
 const profilId=profilMetierDepuisVue(id),utilisateur=utilisateurDashboardActuel();
 st.profilMetier=profilId;
 if(utilisateur){utilisateur.profilMetier=profilId;await saveAuth()}
 return profilId;
}
async function enregistrerProfilMetier(id){
 if(id&&!PROFILS_METIER_IDS.includes(id))throw new Error('Profil métier invalide');
 const utilisateur=utilisateurDashboardActuel();
 if(utilisateur){utilisateur.profilMetier=id;await saveAuth()}else{st.profilMetier=id;await save()}
 if(screen==='dash')renderDash();
 toast(id?'Profil métier enregistré.':'Vue générale restaurée.');
}
function etatSourceDashboard(source){
 const titre=source.status==='error'?'Donnée en erreur':source.status==='empty'?'Aucune donnée':'Donnée indisponible';
 return '<div class="profile-state '+(source.status==='error'?'error':'')+'"><b>'+titre+'</b><span>'+escapeHTML(source.message||'')+'</span></div>';
}
function carteMetier(label,valeur,note,classes){
 return '<article class="profile-metric '+(classes||'')+'"><small>'+label+'</small><strong class="profile-value">'+valeur+'</strong><p class="profile-note">'+note+'</p></article>';
}
function carteSourceMetier(label,source,contenu,classes){
 return '<article class="profile-metric '+(classes||'')+'"><small>'+label+'</small>'+(source.status==='ready'?contenu(source):etatSourceDashboard(source))+'</article>';
}
function enteteTableauMetier(profil,maintenant){
 const utilisateur=utilisateurDashboardActuel(),nom=((utilisateur&&utilisateur.nom)||st.who||'').split(' ')[0];
 const date=maintenant.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
 return '<section class="profile-head"><div><div class="profile-eyebrow"><i></i>'+escapeHTML(profil.i+' '+profil.n)+' · '+date.toUpperCase()+'</div><h1>Bonjour.</h1><p class="profile-intro">Les informations utiles à votre activité sont mises en avant. Ce choix ne modifie ni votre rôle, ni vos accès.</p></div><button class="profile-change" data-profile-settings>Modifier le profil métier</button></section>';
}
function renderDashboardMetier(profilId){
 const profil=PROFILS_METIER.find(function(p){return p.id===profilId});
 if(!profil){renderDashboardGeneral();return}
 const maintenant=new Date(),dateISO=dateLocaleDashboard(maintenant),ventes=resumeVentesDashboard(maintenant);
 const couverts=sourceCouvertsDashboard(dateISO),recommandations=sourceRecommandationsDashboard(dateISO),bons=sourceBonsNonSaisisDashboard(dateISO);
 const noteVentes=ventes.nombreVentes?ventes.nombreVentes+' vente'+(ventes.nombreVentes>1?'s':'')+' enregistrée'+(ventes.nombreVentes>1?'s':'')+' aujourd’hui':'Aucune vente enregistrée aujourd’hui';
 let classeGrille='',cartes='',bandeau=profilId==='barman'?blocBoissonsHebdomadaireDashboard(maintenant):blocPerformanceHebdomadaireDashboard(maintenant);
 if(profilId==='barman'){
  classeGrille=' two';
  cartes=carteMetier('COCKTAILS VENDUS',fmtQ(ventes.cocktails),noteVentes,'primary')
   +carteSourceMetier('PRODUITS À RECOMMANDER',recommandations,function(s){return '<div class="profile-list">'+s.items.slice(0,4).map(function(p){return '<div class="profile-list-row"><b>'+escapeHTML((p.i||'')+' '+p.n)+'</b><span>'+fmt(p.pv||0)+' €</span></div>'}).join('')+'</div>'});
 }else if(profilId==='chef'){
  cartes=carteSourceMetier('COUVERTS · JOURNÉE',couverts,function(s){return '<strong class="profile-value">'+s.total+'</strong><p class="profile-note">Total du midi et du soir</p>'},'primary')
   +carteSourceMetier('SERVICE DU MIDI',couverts,function(s){return '<strong class="profile-value">'+s.midi+'</strong><p class="profile-note">Couverts réalisés</p>'})
   +carteSourceMetier('SERVICE DU SOIR',couverts,function(s){return '<strong class="profile-value">'+s.soir+'</strong><p class="profile-note">Couverts réalisés</p>'});
 }else if(profilId==='salle'){
  classeGrille=' two';
  cartes=carteMetier('CHIFFRE D’AFFAIRES',fmt(ventes.ca)+' €',noteVentes,'primary')
   +carteSourceMetier('COUVERTS RÉALISÉS',couverts,function(s){return '<strong class="profile-value">'+s.total+'</strong><p class="profile-note">'+s.midi+' midi · '+s.soir+' soir</p>'});
 }else{
  const partSolide=ventes.ca>0?ventes.solide/ventes.ca*100:0,partLiquide=ventes.ca>0?ventes.liquide/ventes.ca*100:0;
  cartes=carteMetier('CHIFFRE D’AFFAIRES',fmt(ventes.ca)+' €',noteVentes,'primary')
   +'<article class="profile-metric"><small>RÉPARTITION DU CA</small>'+(ventes.ca>0?'<div class="profile-breakdown"><div class="profile-share"><span>Solide</span><b>'+fmt(ventes.solide)+' €</b><div class="profile-bar"><i style="width:'+Math.min(100,partSolide)+'%"></i></div></div><div class="profile-share"><span>Liquide</span><b>'+fmt(ventes.liquide)+' €</b><div class="profile-bar"><i style="width:'+Math.min(100,partLiquide)+'%"></i></div></div></div>':'<div class="profile-state"><b>Aucune donnée</b><span>La répartition apparaîtra dès la première vente enregistrée aujourd’hui.</span></div>')+'</article>'
   +carteSourceMetier('BONS NON SAISIS',bons,function(s){return '<strong class="profile-value">'+s.count+'</strong><p class="profile-note">Bon'+(s.count>1?'s':'')+' de commande à saisir</p>'});
 }
 const racine=document.getElementById('s-dash');
 racine.innerHTML='<div class="profile-dashboard dashboard-new">'+enteteTableauMetier(profil,maintenant)+meteoAccueilHTML()+recapMatinHTML()+bandeau+'<section class="profile-metrics'+classeGrille+'" aria-label="Indicateurs '+escapeHTML(profil.n)+'">'+cartes+'</section>'+adminWidgetAccueil()+'</div>';
 const reglages=racine.querySelector('[data-profile-settings]');if(reglages)reglages.onclick=function(){openReglages('general')};
 const recap=racine.querySelector('[data-open-recap]');if(recap)recap.onclick=ouvrirRecapMatin;
 lierWidgetAdministration(racine);
 actualiserMeteoAccueil();
}
let dashboardRenderVersion=0;
function renderDash(){
 const profilId=profilMetierActuel(),racine=document.getElementById('s-dash'),version=++dashboardRenderVersion;
 if(!profilId){renderDashboardGeneral();return}
 racine.innerHTML='<div class="dashboard-state" role="status"><div class="dashboard-state-card"><div class="dashboard-loader"></div><b>Chargement du tableau de bord</b><span>Préparation des indicateurs de votre profil métier…</span></div></div>';
 Promise.resolve().then(function(){
  if(version!==dashboardRenderVersion||screen!=='dash')return;
  try{renderDashboardMetier(profilId)}catch(e){renderDashboardErreur(e)}
 });
}
function renderDashboardErreur(erreur){
 console.error('Tableau de bord indisponible',erreur);
 const racine=document.getElementById('s-dash');
 racine.innerHTML='<div class="dashboard-state" role="alert"><div class="dashboard-state-card"><b>Tableau de bord indisponible</b><span>Les indicateurs n’ont pas pu être chargés. Vos données et vos accès n’ont pas été modifiés.</span><button id="dashboardRetry">Réessayer</button></div></div>';
 const retry=document.getElementById('dashboardRetry');if(retry)retry.onclick=renderDash;
}

/* ═════ TABLEAU DE BORD · vue générale et données réellement enregistrées ═════ */
function renderDashboardGeneral(){
 const produits=st.prods||[],mouvements=st.mv||[],commandes=st.commandes||[];
 const ruptures=produits.filter(function(p){return(st.stock[p.id]??0)<=0});
 const sousSeuil=produits.filter(function(p){const q=st.stock[p.id]??0;return q>0&&q<=p.seuil});
 const commandesEnCours=commandes.filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'});
 const maintenant=new Date(),jourISO=maintenant.toISOString().slice(0,10);
 const commandesARecevoir=commandesEnCours.filter(function(c){return c.dateLiv&&c.dateLiv<=jourISO});
 const aVerifier=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0});
 const debutJour=new Date();debutJour.setHours(0,0,0,0);
 const ventesJour=mouvements.filter(function(m){return m.motif==='vente'&&new Date(m.ts)>=debutJour});
 const caJour=ventesJour.reduce(function(s,m){return s+pvMv(m)},0);
 const nom=(st.who||'').split(' ')[0]||'';
 const performanceHebdomadaire=blocPerformanceHebdomadaireDashboard(maintenant);
 const priorite=ruptures.length?{titre:ruptures.length+' rupture'+(ruptures.length>1?'s':''),detail:ruptures.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Voir le stock',screen:'stock',etat:'critical'}:sousSeuil.length?{titre:sousSeuil.length+' sous seuil',detail:sousSeuil.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Préparer la commande',screen:'cmd',etat:'watch'}:commandesARecevoir.length?{titre:commandesARecevoir.length+' réception'+(commandesARecevoir.length>1?'s':''),detail:'Quantités à contrôler',action:'Réceptionner',screen:'liv',commandeId:commandesARecevoir[0].id,etat:'pending'}:aVerifier.length?{titre:aVerifier.length+' vente'+(aVerifier.length>1?'s':'')+' à classer',detail:'Offert, perte ou annulation',action:'Ouvrir la caisse',screen:'caisse',etat:'review'}:{titre:'Tout est prêt.',detail:'Aucune action urgente pour le moment.',action:'Voir le stock',screen:'stock',etat:'clear'};
 const attr=priorite.commandeId?'data-dashreceive="'+priorite.commandeId+'"':'data-dashgo="'+priorite.screen+'"';
 const stockRows=ruptures.concat(sousSeuil).slice(0,4).map(function(p){const q=st.stock[p.id]??0,etat=q<=0?'Rupture':'Sous seuil';return '<button class="dash-row" data-dashgo="stock"><span class="dash-row-icon">'+(p.i||'□')+'</span><span><b>'+escapeHTML(p.n)+'</b><small>'+fmtQ(q)+' '+escapeHTML(p.u||'')+' en stock</small></span><em class="'+(q<=0?'danger':'warning')+'">'+etat+'</em><i>›</i></button>'}).join('')||'<div class="dash-empty">Aucun produit à surveiller.</div>';
 const actions=[];
 commandesARecevoir.slice(0,2).forEach(function(c){actions.push('<button data-dashreceive="'+c.id+'"><span>Réception · '+escapeHTML(c.fournisseur||'Fournisseur')+'</span><i>›</i></button>')});
 aVerifier.slice(0,2).forEach(function(m){actions.push('<button data-dashgo="caisse"><span>À classer · '+escapeHTML(m.platN||'Vente')+'</span><i>›</i></button>')});
 commandesEnCours.filter(function(c){return !commandesARecevoir.some(function(a){return a.id===c.id})}).slice(0,1).forEach(function(c){actions.push('<button data-dashgo="cmd"><span>Commande en cours · '+escapeHTML(c.fournisseur||'Fournisseur')+'</span><i>›</i></button>')});
 const actionRows=actions.length?actions.slice(0,3).join(''):'<div class="dash-actions-empty">Rien à faire maintenant.</div>';
 const date=maintenant.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}),heure=maintenant.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 const titre=priorite.etat==='clear'?'Bonjour.':'À traiter maintenant.';
 const demo='';
 document.getElementById('s-dash').innerHTML=demo+'<div class="dashboard-new">'
 +performanceHebdomadaire
 +meteoAccueilHTML()
 +recapMatinHTML()
 +'<section class="dash-head"><div><div class="dash-eyebrow"><i></i>VUE D’ENSEMBLE · '+date.toUpperCase()+'</div><h1>'+titre+'</h1><p>'+escapeHTML(priorite.detail)+'</p><button class="dash-main-action" '+attr+'>'+priorite.action+' <i>›</i></button></div><aside class="dash-sales"><small>VENTES AUJOURD’HUI</small><b>'+fmt(caJour)+' €</b><span>'+ventesJour.length+' vente'+(ventesJour.length>1?'s':'')+' enregistrée'+(ventesJour.length>1?'s':'')+'</span><time>Actualisé · '+heure+'</time></aside></section>'
 +'<section class="dash-kpis" aria-label="Raccourcis de suivi">'
 +'<button class="dash-kpi '+(ruptures.length?'critical':'clear')+'" data-dashgo="stock"><small>RUPTURES</small><b>'+ruptures.length+'</b><span>'+(ruptures.length?'À traiter':'Stock stable')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(sousSeuil.length?'watch':'clear')+'" data-dashgo="cmd"><small>SOUS SEUIL</small><b>'+sousSeuil.length+'</b><span>'+(sousSeuil.length?'À anticiper':'Rien à commander')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(commandesARecevoir.length?'pending':'clear')+'" data-dashgo="liv"><small>RÉCEPTIONS</small><b>'+commandesARecevoir.length+'</b><span>'+(commandesARecevoir.length?'À contrôler':'Aucune prévue')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(aVerifier.length?'review':'clear')+'" data-dashgo="caisse"><small>À CLASSER</small><b>'+aVerifier.length+'</b><span>'+(aVerifier.length?'Caisse à vérifier':'Caisse à jour')+'<i>›</i></span></button></section>'
 +'<section class="dash-grid"><section class="dash-panel"><header class="dash-panel-head"><div><small>STOCK</small><b>À surveiller</b></div><button data-dashgo="stock">Voir le stock</button></header><div class="dash-list">'+stockRows+'</div></section><aside class="dash-side"><section class="dash-actions"><small>PROCHAINES ACTIONS</small><b>À faire</b>'+actionRows+'</section></aside></section>'
 +'<section class="dash-cash"><div class="dash-cash-copy"><i>€</i><div><small>CAISSE</small><b>'+fmt(caJour)+' € aujourd’hui</b><span>'+aVerifier.length+' mouvement'+(aVerifier.length>1?'s':'')+' à classer</span></div></div><button data-dashgo="caisse">Ouvrir la caisse</button></section>'+adminWidgetAccueil()+'</div>';
 document.querySelectorAll('[data-dashgo]').forEach(function(b){b.onclick=function(){screen=b.dataset.dashgo;sq='';go()}});
 document.querySelectorAll('[data-dashreceive]').forEach(function(b){b.onclick=function(){screen='liv';sq='';go();openLiv(b.dataset.dashreceive)}});
 document.querySelectorAll('[data-open-recap]').forEach(function(b){b.onclick=ouvrirRecapMatin});
 lierWidgetAdministration(document.getElementById('s-dash'));
 actualiserMeteoAccueil();
}
function renderCaisse(){
 const rows=st.mv.length?st.mv.slice(0,40).map(m=>{const d=new Date(m.ts),hh=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  const estVente=m.motif==='vente',mt=estVente?pvMv(m):coutMv(m),libMontant=estVente?t('vente'):t('coutMat');
  return `<div class="activity-row"><span class="activity-icon">${m.platI}</span><span class="activity-body"><b>${m.platN}${m.qty>1?' × '+m.qty:''}</b>
  <small>${hh} · ${m.table} · ${libMontant} : ${fmt(mt)} €${m.parent?` · ↩ ${t('trLiee')}`:''}</small></span><span class="tag ${m.motif}">${t(m.motif).toUpperCase()}</span></div>`;}).join('')
 :`<div class="activity-empty"><div>⌁</div><p><b>${t('vide')}</b><br>${t('manualCaisse')}</p></div>`;
 const aVerifier=(st.mv||[]).filter(m=>MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0).slice(0,8);
 const verif=aVerifier.length?`<section class="work-block"><div class="work-heading"><span>${t('aVerifier')}</span><small>${aVerifier.length}</small></div>
  <p class="work-help">${t('aVerifierS')}</p><div class="work-list">${aVerifier.map(m=>`<button class="work-item" data-qual="${m.id}">
   <span>${m.platI}</span><div><b>${m.platN}</b><small>${fmtQ(resteATracer(m.id))} · ${fmt(pvMv(m))} €</small></div><i>›</i></button>`).join('')}</div></section>`
 :`<section class="work-block work-idle"><div class="work-heading"><span>${t('aVerifier')}</span></div><p>${t('verifVide')}</p></section>`;
 const caisseContexte=st.demoParcours
  ?'<div class="sales-eyebrow"><i></i>DÉMO CAISSE · VENTES SIMULÉES</div>'
  :`<div class="sales-eyebrow"><i></i>${t('manuel').toUpperCase()} · VENTES</div>`;
 document.getElementById('s-caisse').innerHTML=`<section class="sales-head">
   <div>${caisseContexte}
   <h1>${t('caisseT')}</h1><p>${t('caisseS')}</p></div>
   <button class="sales-new" id="newSale"><span class="sales-new-plus">＋</span>
    <span><b>${t('newVente')}</b><small>${t('manualCaisse')}</small></span><i>›</i></button>
  </section>
  ${verif}
  <section class="activity-block"><div class="work-heading"><span>${t('jrnl')}</span><small>${st.mv.length}</small></div>
   <div class="activity-list">${rows}</div></section>`;
 document.getElementById('newSale').onclick=()=>{screen='dec';motif='vente';go()};
 document.querySelectorAll('[data-qual]').forEach(function(b){b.type='button';b.onclick=function(){ouvrirTraitementVente(b.dataset.qual);};});seenFeed=st.mv.length;
}
/* ═════ DÉCLARER ═════ */
function catsDispo(){const s=new Set(st.carte.filter(c=>c.sv===st.svc||c.sv==='tous').map(c=>c.c));
return CATS.filter(c=>s.has(c))}
function panierKinds(){const ks=new Set(Object.keys(panier).map(id=>item(id)?.k));
return{food:ks.has('food'),drink:ks.has('drink')}}
function motifsDispo(){const k=panierKinds();
if(!k.food&&!k.drink)return MOTIFS;
return MOTIFS.filter(m=>m.ap==='tous'||(m.ap==='food'&&k.food&&!k.drink)||(m.ap==='drink'&&k.drink&&!k.food))}
function motifsProduit(id){const c=item(id);return MOTIFS.filter(m=>m.ap==='tous'||m.ap===c?.k)}
function motifDuPanier(id){return panierMotifs[id]||(motifsSelectionnes.length===1?motifsSelectionnes[0]:motif)}
function panierPret(){return Object.keys(panier).every(id=>!!motifDuPanier(id))}
const panierCount=()=>Object.values(panier).reduce((a,b)=>a+b,0);
const panierCout=()=>Object.entries(panier).reduce((s,[id,q])=>s+coutMat(id,q),0);
function sessionServiceActive(){return st.serviceActif&&st.serviceActif.id?st.serviceActif:null}
function nomService(type){return type==='midi'?'☀️ '+t('midi'):'🌙 '+t('soir')}
function heureService(ts){const d=new Date(ts);return isNaN(d)?'—':d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function mouvementsDuService(session){return(session&&session.id?(st.mv||[]).filter(function(m){return String(m.serviceId||'')===String(session.id)}):[])}
function resumeService(session){
 const mouvements=mouvementsDuService(session),ventes=mouvements.filter(function(m){return m.motif==='vente'});
 const sorties=mouvements.filter(function(m){return m.motif!=='vente'&&m.motif!==MOTIF_REVERSE&&!MOTIFS_A_TRACER.includes(m.motif)});
 const alertes=mouvements.filter(function(m){return !!m.alerte});
 const aRevoir=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0});
 return{mouvements:mouvements.length,ventes:ventes.length,sorties:sorties.length,ca:ventes.reduce(function(s,m){return s+pvMv(m)},0),
  cout:ventes.reduce(function(s,m){return s+coutMv(m)},0),alertes:alertes.length,aRevoir:aRevoir.length};
}
function panneauService(){
 const actif=sessionServiceActive();
 if(!actif)return'<div class="service-session"><div class="service-session-head"><div><small>Mode service</small><b>Prêt pour '+nomService(st.svc)+'</b><time>Les ventes et sorties validées seront suivies dans cette session.</time></div></div><button class="btn btn-2 btn-sm" id="openService">Ouvrir le service</button></div>';
 const r=resumeService(actif),aVerifier=r.alertes+r.aRevoir;
 return'<div class="service-session active"><div class="service-session-head"><div><small>Service en cours</small><b>'+nomService(actif.type)+'</b><time>Ouvert à '+heureService(actif.openedAt)+' · '+escapeHTML(actif.who||'Utilisateur')+'</time></div></div><div class="service-session-stats"><div class="service-session-stat"><small>Ventes</small><b>'+r.ventes+'</b></div><div class="service-session-stat"><small>Sorties</small><b>'+r.sorties+'</b></div><div class="service-session-stat"><small>À vérifier</small><b>'+aVerifier+'</b></div></div><button class="btn btn-sm" id="closeService">Clôturer le service</button></div>';
}
async function ouvrirService(){
 const actif=sessionServiceActive();if(actif)return toast('Le service '+nomService(actif.type)+' est déjà ouvert.');
 st.serviceActif={id:uid('svc'),type:st.svc,openedAt:new Date().toISOString(),who:st.who};
 await save();
 if(typeof ajouterHistoriqueAudit==='function')ajouterHistoriqueAudit('Service ouvert',nomService(st.svc),'Aucun service actif','Service '+nomService(st.svc)+' ouvert','Suivi des mouvements validés');
 renderDec();toast('Service '+nomService(st.svc)+' ouvert.');
}
function ouvrirClotureService(){
 const actif=sessionServiceActive();if(!actif)return toast('Aucun service en cours.');
 const r=resumeService(actif),aVerifier=r.alertes+r.aRevoir;
 const controles=[];
 if(r.alertes)controles.push(r.alertes+' alerte'+(r.alertes>1?'s':'')+' de stock');
 if(r.aRevoir)controles.push(r.aRevoir+' ligne'+(r.aRevoir>1?'s':'')+' de caisse à examiner');
 if(!controles.length)controles.push('Aucun écart détecté');
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="bgService"><div class="sheet"><h3>Clôturer '+nomService(actif.type)+'</h3><p class="sh-sub">Cette clôture n’ajoute ni ne retire aucun stock. Elle enregistre seulement le bilan du service.</p><div class="service-session active"><div class="service-session-stats"><div class="service-session-stat"><small>Ventes</small><b>'+r.ventes+' · '+fmt(r.ca)+' €</b></div><div class="service-session-stat"><small>Sorties</small><b>'+r.sorties+'</b></div><div class="service-session-stat"><small>Coût matière</small><b>'+fmt(r.cout)+' €</b></div></div><div class="reception-control-list">'+controles.map(function(x){return'<div class="reception-control-line"><i></i><span>'+escapeHTML(x)+'</span></div>'}).join('')+'</div></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="serviceCancel">Retour</button><button class="btn" id="serviceConfirm">Clôturer</button></div></div></div>';
 document.getElementById('bgService').onclick=function(e){if(e.target.id==='bgService')closeModal()};
 document.getElementById('serviceCancel').onclick=closeModal;
 document.getElementById('serviceConfirm').onclick=async function(){
  const fin=new Date().toISOString(),bilan={id:actif.id,type:actif.type,openedAt:actif.openedAt,closedAt:fin,who:actif.who,resume:r};
  st.serviceHist.unshift(bilan);if(st.serviceHist.length>60)st.serviceHist.length=60;st.serviceActif=null;
  await save();closeModal();
  if(typeof ajouterHistoriqueAudit==='function')ajouterHistoriqueAudit('Service clôturé',nomService(actif.type),r.mouvements+' mouvement(s) suivis',r.ventes+' vente(s) · '+fmt(r.ca)+' €',controles.join(' · '));
  renderDec();toast('Service '+nomService(actif.type)+' clôturé.');
 };
}
function normaliserMotifsSelectionnes(){const ids=new Set(motifsDispo().map(m=>m.id));motifsSelectionnes=motifsSelectionnes.filter(id=>ids.has(id));if(motif&&!ids.has(motif))motif=null}
function addP(id){msgDec=null;forcerStock=false;panier[id]=(panier[id]||0)+1;
normaliserMotifsSelectionnes();renderDec()}
function subP(id){msgDec=null;forcerStock=false;if(!panier[id])return;panier[id]--;if(panier[id]<=0){delete panier[id];delete panierMotifs[id]}
normaliserMotifsSelectionnes();renderDec()}

function renderDec(){
const dispo=catsDispo();
if(!dispo.includes(cat))cat=dispo[0]||'cPlats';
const svc=`<div class="svc">
<button class="${st.svc==='midi'?'on':''}" data-svc="midi"><span class="si">☀️</span>${t('midi')}</button>
<button class="${st.svc==='soir'?'on':''}" data-svc="soir"><span class="si">🌙</span>${t('soir')}</button></div>`;
const cats=dispo.map(c=>`<button class="cat ${cat===c?'on':''}" data-cat="${c}">${t(c)}</button>`).join('');
const items=st.carte.filter(c=>c.c===cat&&(c.sv===st.svc||c.sv==='tous')).map(c=>{
const q=panier[c.id]||0;
return `<button class="card ${q?'has':''}" data-add="${c.id}">
${q?`<span class="qbadge">${q}</span>`:''}
<span class="ico">${c.i}</span><span class="nm">${c.n}</span>
<span class="pxs">${fmt(c.pv)} €</span></button>`}).join('');
const lignes=Object.entries(panier).map(([id,q])=>{const c=item(id);if(!c)return '';const multi=motifsSelectionnes.length>1;const edition=motifLigneEditee===id||multi;const choisi=panierMotifs[id]||'',tousLesOptions=motifsProduit(id),optionsMulti=multi?tousLesOptions.filter(m=>motifsSelectionnes.includes(m.id)):tousLesOptions,options=(optionsMulti.length?optionsMulti:tousLesOptions).map(m=>`<option value="${m.id}" ${choisi===m.id?'selected':''}>${m.i} ${t(m.id)}</option>`).join('');
return `<div class="pk-row"><span class="pk-ico">${c.i}</span><span class="pk-body"><div class="pk-n">${c.n}</div><div class="pk-c">${fmt(coutMat(id,q))} €</div><button type="button" class="pk-edit-motif" data-editmotif="${id}">${edition?'Fermer':'Modifier'}</button><div class="pk-motif-field" ${edition?'':'hidden'}><select class="pk-motif" aria-label="Motif pour ${c.n}" data-pkmotif="${id}"><option value="">${multi?'Choisir pour cet article':(motif?'Motif général · '+t(motif):'Choisir un motif')}</option>${options}</select></div></span><span class="pk-ctrl"><button class="pk-btn" data-sub="${id}">−</button><span class="pk-q">${q}</span><button class="pk-btn" data-plus="${id}">+</button></span></div>`}).join('');
const pkBlock=panierCount()?`<div class="panier">
<div class="pk-head"><span class="pk-title">${t('panier').toUpperCase()}</span>
<button class="pk-clear" id="pkClear">${t('vider')}</button></div>${lignes}
<div class="pk-total"><span class="pk-tl">${t('coutMat')}</span>
<span class="pk-tv">${fmt(panierCout())} €</span></div></div>`:'';
const motifsRapidesIds=['vente','offClient','casse','perso'];
const motifsActuels=motifsDispo();
const motifsList=[...motifsActuels].sort((a,b)=>(motifsRapidesIds.includes(b.id)?1:0)-(motifsRapidesIds.includes(a.id)?1:0));
const mts=motifsList.map(m=>`<button type="button" aria-pressed="${motifsSelectionnes.includes(m.id)}" class="motif ${motifsRapidesIds.includes(m.id)?'quick':''} ${motifsSelectionnes.includes(m.id)?'sel':''}" data-motif="${m.id}">
<span class="mi">${m.i}</span><span class="mt">${t(m.id)}</span>
<span class="md">${t(m.id+'D')}</span></button>`).join('');
const blocMsg=msgDec?`<div id="decFeedback" class="warn ${msgDec.type==='err'?'err':'dup'}" role="alert">${msgDec.txt}</div>`:'';
document.getElementById('s-dec').innerHTML=`
 <section class="declare-hero"><div class="declare-overline">${t('nDec')}</div>
  <h1>${t('decT')}</h1><p>${t('decS')}</p></section>
 ${blocMsg}
 <section class="declare-service"><div class="declare-section-head"><span>${t('svc')}</span><small>${t('svcHint')}</small></div>${svc}${panneauService()}</section>
 <section class="declare-catalog"><div class="declare-section-head"><span>${t('etape1')}</span><small>${panierCount()?panierCount():''}</small></div>
  <div class="cats">${cats}</div><div class="grid">${items}</div></section>
 ${pkBlock}
 <section class="declare-reason" id="motifBlock"><div class="declare-section-head"><span>2 — Motif</span><small>${motifsSelectionnes.length>1?'Choix par article':'Un ou plusieurs choix'}</small></div>
  <p class="motifs-helper">${motifsSelectionnes.length>1?'<strong>Plusieurs motifs sélectionnés.</strong> Attribuez-en un à chaque article du panier.':'Vous pouvez sélectionner un ou plusieurs motifs de sortie.'}</p>
  <div class="motifs ${motifsOuverts?'open':''}">${mts}</div><button type="button" class="motifs-more-toggle" id="motifsMore">${motifsOuverts?'Réduire les motifs':'Plus de motifs'}</button></section>
 ${(motifsSelectionnes.some(id=>id==='casse'||id==='rate'))?(decPhoto?
  `<div class="photo-prev"><img src="${decPhoto}" alt=""><button class="photo-x" id="rmPhoto">×</button></div>`
  :`<button class="photo-btn" id="addPhoto">${t('addPhoto')}</button>
    <input type="file" id="photoInput" accept="image/*" capture="environment" style="display:none">`):''}
`;
document.querySelectorAll('[data-svc]').forEach(b=>b.onclick=async()=>{const actif=sessionServiceActive();if(actif&&actif.type!==b.dataset.svc)return toast('Clôture d’abord le service '+nomService(actif.type)+'.');st.svc=b.dataset.svc;await save();renderDec()});
const openServiceBtn=document.getElementById('openService');if(openServiceBtn)openServiceBtn.onclick=ouvrirService;
const closeServiceBtn=document.getElementById('closeService');if(closeServiceBtn)closeServiceBtn.onclick=ouvrirClotureService;
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;renderDec()});
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addP(b.dataset.add));
document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>addP(b.dataset.plus));
document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>subP(b.dataset.sub));
const pc=document.getElementById('pkClear');if(pc)pc.onclick=()=>{panier={};panierMotifs={};motif=null;motifsSelectionnes=[];motifLigneEditee=null;motifsOuverts=false;renderDec()};
document.querySelectorAll('[data-motif]').forEach(b=>b.onclick=()=>{const id=b.dataset.motif;motifsSelectionnes=motifsSelectionnes.includes(id)?motifsSelectionnes.filter(x=>x!==id):[...motifsSelectionnes,id];motif=motifsSelectionnes.length===1?motifsSelectionnes[0]:null;msgDec=null;forcerStock=false;renderDec()});
document.querySelectorAll('[data-pkmotif]').forEach(sel=>sel.onchange=()=>{const id=sel.dataset.pkmotif;if(sel.value)panierMotifs[id]=sel.value;else delete panierMotifs[id];motifLigneEditee=null;msgDec=null;forcerStock=false;renderDec()});
const mm=document.getElementById('motifsMore');if(mm)mm.onclick=()=>{motifsOuverts=!motifsOuverts;renderDec()};
document.querySelectorAll('[data-editmotif]').forEach(b=>b.onclick=()=>{motifLigneEditee=motifLigneEditee===b.dataset.editmotif?null:b.dataset.editmotif;renderDec()});
const sendBtn=document.getElementById('sendBtn');if(sendBtn)sendBtn.onclick=valider;
const ap=document.getElementById('addPhoto');
if(ap)ap.onclick=()=>document.getElementById('photoInput').click();
const pi=document.getElementById('photoInput');
if(pi)pi.onchange=e=>{const f=e.target.files[0];if(f)compressPhoto(f)};
const rp=document.getElementById('rmPhoto');
if(rp)rp.onclick=()=>{decPhoto=null;renderDec()};
renderCartbar()}

function compressPhoto(file){
 const r=new FileReader();
 r.onload=ev=>{const img=new Image();
  img.onload=()=>{const max=420;let w=img.width,h=img.height;
   if(w>h&&w>max){h=h*max/w;w=max}else if(h>max){w=w*max/h;h=max}
   const c=document.createElement('canvas');c.width=w;c.height=h;
   c.getContext('2d').drawImage(img,0,0,w,h);
   decPhoto=c.toDataURL('image/jpeg',0.55);renderDec();toast(t('photoOk'))};
  img.src=ev.target.result};
 r.readAsDataURL(file);
}

function renderCartbar(){
 const el=document.getElementById('cartbar');
 if(screen!=='dec'){el.innerHTML='';return}
 const n=panierCount(),vide=!n,pret=!vide&&panierPret();
 const actifs=[...new Set(Object.keys(panier).map(id=>motifDuPanier(id)).filter(Boolean))];
 const libelle=vide?'AUCUNE SORTIE SÉLECTIONNÉE':pret?(actifs.length>1?'PLUSIEURS MODES':t(actifs[0]).toUpperCase()):t('choisirMotif').toUpperCase();
 const action=vide?'Ajouter un produit':pret?'Valider la sortie':'Choisir un mode';
 el.innerHTML=`<div class="cartbar" role="region" aria-label="Panier des sorties"><button type="button" class="cartbar-in" id="cbGo" ${vide?'disabled':''} aria-label="${action}"><span class="cb-l">${n} ${n>1?t('articlesP'):t('articles')}<small>${libelle}</small></span><span class="cb-action">${action} <i>›</i></span></button></div>`;
 if(!vide)document.getElementById('cbGo').onclick=()=>{if(!pret)document.getElementById('motifBlock').scrollIntoView({behavior:'smooth',block:'center'});else valider()}
}

async function valider(){if(!panierCount()||!panierPret())return;
const now=new Date().toISOString();
const projets=[],refus=[];
for(const [id,q] of Object.entries(panier)){
 const ligneMotif=motifDuPanier(id);let parent=null;
 if(MOTIFS_A_TRACER.includes(ligneMotif)){
  const cand=ventesATracer(id);
  if(!cand.length){refus.push({id,msg:t('trAnnulSansVente')});continue}
  parent=cand[0].id;
 }
 projets.push({src:'main',motif:ligneMotif,plat:id,qty:q,who:st.who,ts:now,
  ph:decPhoto?1:0,parent});
}

/* Pré-vol du lot entier : aucune ligne ni aucun stock ne sont modifiés ici. */
if(!refus.length){
 const lot=validerLotMouvements(projets,{forcer:!!forcerStock});
 if(!lot.ok)refus.push(...lot.refus);
}
if(refus.length){
 const confirmable=refus.every(x=>x.confirmable);
 msgDec={type:confirmable?'warn':'err',
  txt:refus.map(x=>x.msg).join('<br>')+(confirmable?'<br><b>'+t('trAppuyerEncore')+'</b>':'')};
 if(confirmable)forcerStock=true;
 await save();renderDec();
 requestAnimationFrame(()=>{const feedback=document.getElementById('decFeedback');if(feedback)feedback.scrollIntoView({behavior:'smooth',block:'center'});toast(refus[0].msg)});
 return;
}

/* Le lot est validé : les écritures se font maintenant, sans état intermédiaire visible. */
const creations=[];
for(const projet of projets){
 const r=creerMouvement(projet,{accepteAlerte:true});
 if(!r.ok)throw new Error('Validation de lot incohérente : '+r.code);
 creations.push(r.mv);
}
msgDec=null;forcerStock=false;
if(decPhoto){
 const k='p'+Date.now();st.photos[k]=decPhoto;
 creations.forEach(m=>m.pk=k);
 const ks=Object.keys(st.photos);if(ks.length>25)delete st.photos[ks[0]];
}
await save();panier={};panierMotifs={};motif=null;motifsSelectionnes=[];motifLigneEditee=null;motifsOuverts=false;decPhoto=null;renderDec();toast(t('saved'))}
