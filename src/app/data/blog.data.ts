/** Articles publiés sur ce site (page /blog/<slug>). Texte français, repris tel quel de la version rédigée par Israel. */

export interface Inline { t: string; b?: boolean; i?: boolean; code?: boolean; href?: string; }

export type Block =
  | { type: 'p' | 'h2'; content: Inline[] }
  | { type: 'ul' | 'ol'; items: Inline[][] }
  | { type: 'img'; src: string; alt: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Date de publication (AAAA-MM-JJ). */
  date: string;
  readTime: number;
  cover: { src: string; alt: string };
  /** Image de partage 1200×630 (générée par `npm run images`). */
  ogImage: string;
  blocks: Block[];
}

const otadex: BlogPost = {
  slug: 'otadex-de-l-idee-au-play-store',
  title: "OTADEX : de l'idée au Play Store avec une IA comme coéquipière",
  description: "Comment un personnage d'animé inconnu m'a mené à créer OTADEX, depuis le Cameroun, et à franchir le mur de Google Play.",
  date: '2026-11-27',
  readTime: 9,
  cover: {"src": "images/blog/couverture-otadex.webp", "alt": "Couverture : De l'idée au Play Store, avec le logo OTADEX et la photo de l'auteur"},
  ogImage: 'assets/og/blog/otadex.jpg',
  blocks: [
    {"type": "p", "content": [{"t": "Tu veux savoir ce qui a été le plus dur quand j'ai créé mon application ? Pas un bug. Pas une ligne de code. 😅 C'était d'obtenir mon compte développeur Google Play."}]},
    {"type": "p", "content": [{"t": "Et mon plus grand moment de fierté ? Le jour où cette porte s'est enfin ouverte, puis le jour où l'application a été publiée. 🎉"}]},
    {"type": "p", "content": [{"t": "Voici l'histoire d'"}, {"t": "OTADEX", "b": true}, {"t": " 🌀, une encyclopédie de personnages d'animés que j'ai construite "}, {"t": "en solo"}, {"t": ", depuis le Cameroun 🇨🇲, avec un coéquipier un peu particulier : une IA nommée Claude. 🤖 Installe-toi. ☕"}]},
    {"type": "h2", "content": [{"t": "📜 Chapitre 1 : un document sous le bras"}]},
    {"type": "p", "content": [{"t": "Tout commence devant un animé. 📺 Un personnage apparaît, et impossible de savoir qui c'est. Pour entendre son nom et en apprendre plus sur lui, je dois retourner fouiller dans les épisodes. ⏪"}]},
    {"type": "p", "content": [{"t": "C'était un personnage secondaire, de ceux dont la fiche n'a jamais vraiment été remplie. Je cherche sur Internet, et une question s'installe : pourquoi n'existe-t-il pas une plateforme qui me donne ça directement ? 💡"}]},
    {"type": "p", "content": [{"t": "Il y avait une deuxième raison, plus profonde. Je suis un passionné d'animés, et je voulais que quelque chose sorte de l'Afrique. 🌍 Qu'un Africain produise ce qu'on a l'habitude de voir venir du Japon ou de Corée : une marque africaine dans le monde des animés."}]},
    {"type": "p", "content": [{"t": "12 avril 2026. J'ouvre une conversation avec Claude, et je n'arrive pas les mains vides. Dans mes bagages : un document qui décrit mon rêve, une encyclopédie des animés japonais, coréens, chinois et des webtoons. 📚"}]},
    {"type": "p", "content": [{"t": "Son nom ? "}, {"t": "Otaku", "b": true}, {"t": " (le passionné) + "}, {"t": "dex", "b": true}, {"t": " (comme le Pokédex). OTADEX. Attrapez-les tous, mais version personnages d'animés. 😏"}]},
    {"type": "p", "content": [{"t": "L'objectif : conquérir le Cameroun d'abord, l'Afrique francophone ensuite, et le monde après. 🌍 Rien que ça."}]},
    {"type": "img", "src": "images/blog/accueil-otadex.webp", "alt": "L'écran de démarrage et l'écran de connexion d'OTADEX"},
    {"type": "h2", "content": [{"t": "🗺️ Chapitre 2 : la carte avant le voyage"}]},
    {"type": "p", "content": [{"t": "Mon réflexe aurait pu être de coder tout de suite. Mauvaise idée. 🙅"}]},
    {"type": "p", "content": [{"t": "Claude lit mon document et me bombarde de questions. D'où viendront les données ? Les images ? On paie en quelle monnaie ? Quelle place pour l'IA ? Plus d'une fois, ma réponse a été : « Je n'y ai pas réfléchi. » 🤷"}]},
    {"type": "p", "content": [{"t": "Et c'est là que la magie opère. ✨ De ces questions sort un vrai cahier des charges, avec trois rangs tout droit sortis du monde ninja 🥷 : "}, {"t": "Genin", "b": true}, {"t": " (gratuit), "}, {"t": "Jonin", "b": true}, {"t": " et "}, {"t": "Kage", "b": true}, {"t": ". Puis viennent les maquettes, avec Stitch et Claude Design. 🎨"}]},
    {"type": "p", "content": [{"t": "Sur le papier, il y avait tout : chatbot, génération d'images, récompenses. Spoiler : tout n'a pas survécu. 👀"}]},
    {"type": "img", "src": "images/blog/trois-rangs.webp", "alt": "Les thèmes des rangs Genin, Jonin et Kage"},
    {"type": "h2", "content": [{"t": "🤝 Chapitre 3 : un duo, deux rôles"}]},
    {"type": "p", "content": [{"t": "Très vite, une organisation s'installe. Dans la conversation, Claude est "}, {"t": "l'architecte", "b": true}, {"t": " 🧠 : il découpe le travail, mène l'enquête, rédige les consignes. Dans mon éditeur, "}, {"t": "Claude Code", "b": true}, {"t": " est "}, {"t": "le maçon", "b": true}, {"t": " 🧱 : il écrit le code."}]},
    {"type": "p", "content": [{"t": "Et moi ? Le messager, le testeur et le chef de chantier. 👷"}, {"t": " La boucle ressemblait à ça :"}]},
    {"type": "ol", "items": [[{"t": "📱 Je teste sur mon téléphone."}], [{"t": "📸 J'envoie des captures de ce qui cloche."}], [{"t": "📝 Claude rédige une consigne."}], [{"t": "⌨️ Je la colle dans Claude Code."}], [{"t": "🔁 Je rapporte le résultat, et on recommence."}]]},
    {"type": "p", "content": [{"t": "Deux fichiers servaient de mémoire au projet, "}, {"t": "OTADEX_CONTEXT.md", "code": true}, {"t": " et "}, {"t": "OTADEX_PROGRESS.md", "code": true}, {"t": ". Sans eux, chaque session repartait de zéro. 🧩"}]},
    {"type": "p", "content": [{"t": "Un détail qu'on oublie souvent : tout ça a un budget. 💸 "}, {"t": "En"}, {"t": " mai, je finis par écrire : « Ce prompt n'est-il pas trop long, j'ai des tokens à respecter » Message reçu : les consignes ont fondu."}]},
    {"type": "h2", "content": [{"t": "🧱 Chapitre 4 : en mai, fais ce qu'il te plaît… ou pas"}]},
    {"type": "p", "content": [{"t": "15 avril : premier commit. 🚀 L'euphorie. Puis arrive le mois de mai."}]},
    {"type": "p", "content": [{"t": "💳 "}, {"t": "Premier mur.", "b": true}, {"t": " Les images devaient aller sur Firebase Storage. Verdict : « Storage a besoin de paiement de carte ce que je n'ai pas ». Fin de la discussion. Les images déménagent sur GitHub."}]},
    {"type": "p", "content": [{"t": "👻 "}, {"t": "Deuxième mur, les personnages fantômes.", "b": true}, {"t": " Trois sources de données cohabitent : AniList (une base publique d'animés), des données factices et ma propre base, Firestore. Résultat : des personnages que je n'ai jamais ajoutés s'affichent. Je craque : « Merci, j'ai comme impression de tourner en rond. » 😮‍💨 Le remède a été radical : une seule source, Firestore."}]},
    {"type": "p", "content": [{"t": "🔒 "}, {"t": "Troisième mur, la forteresse.", "b": true}, {"t": " Une version met tellement de restrictions aux utilisateurs gratuits que je réagis : « Ce travail m'a plutôt gâché tout l'ancien travail. » Personne ne reste dans une application qui l'empêche de voir ce qu'il est venu voir."}]},
    {"type": "p", "content": [{"t": "🔧 Et le reste a suivi : notifications chez OneSignal, licences vendues sur Chariow. Du plan technique de départ, Flutter et Firebase ont tenu bon, mais beaucoup d'autres choix ont sauté."}]},
    {"type": "h2", "content": [{"t": "🐉 Chapitre 5 : le boss final s'appelle Google Play"}]},
    {"type": "p", "content": [{"t": "Dans tout bon animé, il y a un ennemi qu'on ne bat pas du premier coup. Le mien n'avait ni cape ni épée. Il disait simplement : "}, {"t": "identité non vérifiée", "b": true}, {"t": ". ⛔"}]},
    {"type": "p", "content": [{"t": "L'application pouvait être prête, elle n'irait nulle part. Je rassemble des justificatifs, je fais un recours. Mon ticket en français est fermé sans solution. 😶 Claude m'aide à le refaire en anglais. Mi-juin, après plus de trois semaines, je prépare un post LinkedIn pour appeler à l'aide. Fin août, j'écris encore : « Ça n'a toujours pas marché. » ⏳"}]},
    {"type": "p", "content": [{"t": "Passeport, carte d'identité, permis de conduire : j'avais déjà tout ça, et rien ne marchait. 🪪"}]},
    {"type": "p", "content": [{"t": "Je suis chrétien, et cette histoire ne serait pas complète sans ça : avant la tentative suivante, j'ai pris un moment de prière. 🙏"}]},
    {"type": "p", "content": [{"t": "Ensuite, j'ai envoyé un document auquel on ne pense pas forcément : une facture bancaire, émise par ma banque. Et c'est ça qui a marché. 🧾"}]},
    {"type": "p", "content": [{"t": "La porte s'ouvre enfin. 🔓 Tu crois que c'est fini ? Le boss avait d'autres phases :"}]},
    {"type": "ul", "items": [[{"t": "💰 "}, {"t": "Les paiements", "b": true}, {"t": " : Google impose sa facturation pour les services numériques. J'ai désactivé les offres payantes dans l'application."}], [{"t": "❌ "}, {"t": "Un rejet", "b": true}, {"t": " : une déclaration mal remplie exigeait un compte d'organisation."}], [{"t": "🖼️ "}, {"t": "Les permissions", "b": true}, {"t": " : l'accès aux photos a laissé place au sélecteur du système."}], [{"t": "👥 "}, {"t": "Le test fermé", "b": true}, {"t": " : 12 testeurs inscrits pendant 14 jours. Au départ ? Zéro. Au 11e jour : pile 12, et 15 installations dont 13 au Cameroun. 🇨🇲"}]]},
    {"type": "p", "content": [{"t": "Puis un jour, j'écris"}, {"t": " à Claude, l'air de rien"}, {"t": " : « Oui, en passant, la mise en production a été validée. » 🎉🎉🎉 Boss vaincu. OTADEX est sur le Play Store."}]},
    {"type": "h2", "content": [{"t": "💬 Chapitre 6 : le message qui change tout"}]},
    {"type": "p", "content": [{"t": "Publier n'est pas la fin. C'est le moment où de vraies personnes touchent à ton travail. 👀"}]},
    {"type": "p", "content": [{"t": "Un testeur m'écrit : « Vu que ce n'est pas tout le monde qui peut écrire les noms japonais des animes l'appli ne pourra pas forcément les renvoyer vers la page que ils veulent »"}]},
    {"type": "p", "content": [{"t": "Bim. 💡 Il avait raison, et aucun cahier des charges ne l'avait vu venir. Aujourd'hui, la recherche montre des portraits dès la deuxième lettre, pardonne les fautes, reconnaît les variantes japonaises et demande « vouliez-vous dire ? ». On reconnaît un visage bien plus vite qu'on n'écrit un nom. 🔍"}]},
    {"type": "h2", "content": [{"t": "📱 Chapitre 7 : l'écran noir"}]},
    {"type": "p", "content": [{"t": "Fin novembre, coup du sort : l'afficheur de mon téléphone lâche. Plus rien. Du noir. 🖤 Mon outil de test principal vient de rendre l'âme. Solution : un émulateur Android sur mon ordinateur, et on continue."}]},
    {"type": "p", "content": [{"t": "C'est là que je regarde la page de recherche avec un œil sévère : « elle est un peu trop statique et on sent rapidement que c'est l'IA ». 😬 Les carrés de couleur deviennent des vignettes illustrées, les tendances deviennent des affiches classées 1, 2, 3."}]},
    {"type": "img", "src": "images/blog/recherche-avant-apres.webp", "alt": "La page de recherche avant et après"},
    {"type": "p", "content": [{"t": "Puis la barre du bas y passe. Trop basique. J'envoie une image de référence et je précise : l'onglet actif, ce sera un "}, {"t": "hexagone", "b": true}, {"t": " ⬢, pas un cercle."}]},
    {"type": "img", "src": "images/blog/barre-du-bas.webp", "alt": "Trois versions de la barre de navigation du bas"},
    {"type": "p", "content": [{"t": "Ma découverte : l'IA produit vite quelque chose de correct. Pour obtenir quelque chose qui a du "}, {"t": "caractère", "b": true}, {"t": ", il faut oser dire non, plusieurs fois, avec des exemples. 🎯"}]},
    {"type": "h2", "content": [{"t": "🚨 Chapitre 8 : la panne sèche"}]},
    {"type": "p", "content": [{"t": "25 novembre. Le quota gratuit de Firebase saute : 50 000 lectures par jour, partagées entre l'application et le site. Je ne comprends pas. Avec une cinquantaine de personnes, comment est-ce possible ? 🤯"}]},
    {"type": "p", "content": [{"t": "L'enquête aboutit à deux parades. La recherche garde le catalogue en mémoire pendant 24 heures. Le site lit une copie locale des données au lieu d'interroger la base à chaque visite. 🛠️"}]},
    {"type": "p", "content": [{"t": "La morale : « gratuit » veut dire « gratuit "}, {"t": "jusqu'à une limite", "b": true}, {"t": " ». Compte tes lectures avant que tes utilisateurs ne le fassent pour toi. 📊"}]},
    {"type": "h2", "content": [{"t": "⚖️ Chapitre 9 : mon coéquipier n'est pas parfait"}]},
    {"type": "p", "content": [{"t": "Soyons honnêtes, sinon cette histoire ne sert à personne."}]},
    {"type": "p", "content": [{"t": "💪 "}, {"t": "Ses super-pouvoirs", "b": true}, {"t": " : transformer une idée floue en plan, me guider dans des consoles inconnues, écrire vite, remonter la piste d'un bug quand je ne savais pas où chercher."}]},
    {"type": "p", "content": [{"t": "🙈 "}, {"t": "Ses ratés", "b": true}, {"t": " :"}]},
    {"type": "ul", "items": [[{"t": "Des corrections annoncées mais pas testées jusqu'au bout : l'application lisait encore des données factices après plusieurs sessions."}], [{"t": "Un filigrane noté « déjà fait » qui n'existait pas."}], [{"t": "Une fiche Play Store qui vantait des fonctions absentes de l'application."}], [{"t": "Toute une procédure de renommage lancée parce que je croyais avoir supprimé mon application, sans me faire vérifier d'abord."}]]},
    {"type": "p", "content": [{"t": "🙋"}, {"t": " "}, {"t": "Ce qui restait à moi", "b": true}, {"t": " : tester, dire non, fournir les images et les données, tenir face à Google, et décider ce qu'OTADEX devait être."}]},
    {"type": "p", "content": [{"t": "Un jour, alors que tout semblait « validé », j'ai écrit ceci : « Tout marche d'apres tes dires et claude code, mais si l'utilisateur ne peut pas tester, comment fera t'il. » Garde cette phrase près de ton clavier. ⌨️"}]},
    {"type": "h2", "content": [{"t": "🎒 Le butin : ce que j'emporte avec moi"}]},
    {"type": "p", "content": [{"t": "Si tu commences ton aventure aujourd'hui :"}]},
    {"type": "ol", "items": [[{"t": "🪪 "}, {"t": "Ouvre ton compte développeur tôt.", "b": true}, {"t": " Vérification et test fermé peuvent durer plus longtemps que le code."}], [{"t": "👥 "}, {"t": "Recrute plus de 12 testeurs.", "b": true}, {"t": " Un seul départ peut te faire passer sous le seuil."}], [{"t": "🗃️ "}, {"t": "Une seule source de données.", "b": true}, {"t": " Les données factices, dehors, vite."}], [{"t": "📱 "}, {"t": "Teste sur un appareil.", "b": true}, {"t": " « Zéro erreur d'analyse » ne veut pas dire que ça marche."}], [{"t": "🩺 "}, {"t": "Diagnostic d'abord, correction ensuite", "b": true}, {"t": ", et vérifie ce que l'IA affirme."}], [{"t": "🔑 "}, {"t": "Jamais de clé secrète dans une application mobile.", "b": true}, {"t": " On peut l'en extraire."}], [{"t": "💳 "}, {"t": "Repère ce qui exige une carte bancaire", "b": true}, {"t": " avant de choisir un service."}], [{"t": "📢 "}, {"t": "N'annonce que ce qui existe", "b": true}, {"t": " dans ta fiche et tes formulaires."}]]},
    {"type": "h2", "content": [{"t": "🌅 Épilogue (provisoire)"}]},
    {"type": "p", "content": [{"t": "Du 15 avril au 27 novembre 2026 : "}, {"t": "228 commits", "b": true}, {"t": ", "}, {"t": "18 animés", "b": true}, {"t": ", "}, {"t": "334 personnages", "b": true}, {"t": ", un site web, "}, {"t": "otadex.tilstack.me", "href": "https://otadex.tilstack.me"}, {"t": ", et une newsletter qui se prépare. 📬"}]},
    {"type": "p", "content": [{"t": "Et OTADEX n'est qu'une première porte. 🚪 Son ouverture va me permettre d'en ouvrir d'autres : de nouvelles applications, aussi intéressantes les unes que les autres. 🚀"}]},
    {"type": "p", "content": [{"t": "L'histoire n'est pas finie, et c'est tant mieux. Si tu aimes les animés, essaie OTADEX 🌀 et dis-moi ce qui manque. La dernière fois qu'un testeur l'a fait, la recherche a changé pour toujours. 😉"}]},
    {"type": "p", "content": [{"t": "Et toi, quel a été ton boss final sur un projet ? Raconte-le en commentaire.", "i": true}, {"t": " 👇"}]},
  ],
};

export const BLOG_POSTS: BlogPost[] = [otadex];
